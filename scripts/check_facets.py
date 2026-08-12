import json, urllib.request, urllib.parse
url = "http://localhost:3000/api/trpc/jobs.facetCounts?input=" + urllib.parse.quote(json.dumps({"json":{"query":"js"}}))
with urllib.request.urlopen(url, timeout=30) as r:
    d = json.load(r)
if 'error' in d: print("FACETS ERROR:", d['error']['json']['message'][:200]); raise SystemExit(1)
print("FACETS OK:", json.dumps(d['result']['data']['json'], indent=1)[:600])
