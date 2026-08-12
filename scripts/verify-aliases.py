"""Verify query-time alias resolution: 'js', 'Javascript', 'JavaScript' must resolve to the same canonical skill."""
import json, urllib.parse, urllib.request

BASE = "http://localhost:3000/api/trpc/skills.resolve"
terms = ["js", "Javascript", "JavaScript", "node.js", "py"]
results = {}
for t in terms:
    url = f"{BASE}?input=" + urllib.parse.quote(json.dumps({"json": {"term": t}}))
    d = json.load(urllib.request.urlopen(url))
    r = d["result"]["data"]["json"]
    results[t] = (r["id"], r["name"]) if r else None
    print(f"{t!r:14} -> {results[t]}")

ids = {v[0] for v in results.values() if v}
js_ids = {v[0] for k, v in results.items() if k in ("js", "Javascript", "JavaScript") and v}
print("\njs-family terms resolve to one id:", len(js_ids) == 1, "→", js_ids)
print("All terms resolved:", all(v is not None for v in results.values()))
