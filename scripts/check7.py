import json, urllib.request, urllib.parse
def call(path, body):
    url = f'http://localhost:3000/api/trpc/{path}?input=' + urllib.parse.quote(json.dumps({'json': body}))
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            d = json.load(r)
            res = d.get('result',{}).get('data',{}).get('json')
            print(path, 'OK totalExact:', (res or {}).get('totalExact'), 'totalWithTypo:', (res or {}).get('totalWithTypo'))
            for row in ((res or {}).get('results') or [])[:2]:
                print('   ', row.get('title'), 'score:', row.get('score'), 'skl:', row.get('rawSkills'), 'txt:', row.get('rawText'))
    except Exception as e:
        print(path, 'FAIL', str(e)[:300])
call('jobs.ranked', {"query": "js", "candidateLat": 37.7749, "candidateLng": -122.4194})
call('jobs.ranked', {"query": "react frontend", "candidateLat": 37.7749, "candidateLng": -122.4194})
call('jobs.ranked', {"candidateLat": 37.7749, "candidateLng": -122.4194})
