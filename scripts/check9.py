import json, urllib.request, urllib.parse
url = 'http://localhost:3000/api/trpc/jobs.ranked?input=' + urllib.parse.quote(json.dumps({'json': {}}))
with urllib.request.urlopen(url, timeout=20) as r:
    d = json.load(r)
res = d.get('result',{}).get('data',{}).get('json')
print('keys:', list(res.keys()) if res else None)
print('totalExact:', res.get('totalExact'), 'nextCursor:', res.get('nextCursor'))
print('numResults:', len(res.get('rows') or []))
