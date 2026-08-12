import json, urllib.request, urllib.parse
url = "http://localhost:3000/api/trpc/jobs.facetCounts?input=" + urllib.parse.quote(json.dumps({"json":{"query":""}}))
with urllib.request.urlopen(url, timeout=30) as r:
    d = json.load(r)
if 'error' in d: print("ERROR:", d['error']['json']['message'][:300]); raise SystemExit(1)
print(json.dumps(d['result']['data']['json'], indent=1))
