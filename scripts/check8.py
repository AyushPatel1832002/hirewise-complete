import json, urllib.request, urllib.parse
url = 'http://localhost:3000/api/trpc/jobs.ranked?input=' + urllib.parse.quote(json.dumps({'json': {}}))
try:
    with urllib.request.urlopen(url, timeout=20) as r:
        d = json.load(r)
        res = d.get('result',{}).get('data',{}).get('json')
        print('empty q OK totalExact:', (res or {}).get('totalExact'), 'first:', ((res or {}).get('results') or [{}])[0].get('title'))
except Exception as e:
    print('FAIL', str(e)[:300])
