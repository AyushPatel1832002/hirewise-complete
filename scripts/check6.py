import json, urllib.request, urllib.parse
url = "http://localhost:3000/api/trpc/jobs.ranked?input=" + urllib.parse.quote(json.dumps({"json":{"query":"javascrpt","pageSize":5}}))
with urllib.request.urlopen(url, timeout=30) as r:
    d = json.load(r)
res = d['result']['data']['json']
print('totalExact:', res['totalExact'], 'totalWithTypo:', res['totalWithTypo'])
for r_ in res['rows'][:8]:
    print(f"  {r_['score']:5.1f} txt={r_['text']:3d} skl={r_['skills']:3d} dst={r_['distance']:3d} | {r_['title']}")
