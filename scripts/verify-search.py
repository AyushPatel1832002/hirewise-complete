"""Verify alias-aware job search at the HTTP API level."""
import json
import urllib.parse
import urllib.request

BASE = "http://localhost:3000/api/trpc/jobs.browse"


def browse(params: dict) -> dict:
    url = BASE + "?input=" + urllib.parse.quote(json.dumps({"json": params}))
    d = json.load(urllib.request.urlopen(url))
    return d["result"]["data"]["json"]


checks = [
    ("js", lambda r: r["total"] > 0 and any("JavaScript" in [s["name"] for s in j["skills"]] for j in r["rows"])),
    ("js frontend", lambda r: r["total"] > 0 and any("frontend" in j["title"].lower() for j in r["rows"])),
    ("react", lambda r: r["total"] > 0 and any("React" in [s["name"] for s in j["skills"]] for j in r["rows"])),
    ("nonexistentskillxyz", lambda r: r["total"] == 0),
]

for term, check in checks:
    r = browse({"query": term, "page": 1, "pageSize": 5})
    ok = check(r)
    print(f"query={term!r:22} total={r['total']:>5} {'PASS' if ok else 'FAIL'}  skillQuery={r['skillQuery']}")
    if r["rows"]:
        print("    first:", r["rows"][0]["title"], [s["name"] for s in r["rows"][0]["skills"][:3]])
