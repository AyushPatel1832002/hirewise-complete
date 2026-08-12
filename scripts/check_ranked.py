import json, urllib.request, urllib.parse
def ranked(params):
    url = "http://localhost:3000/api/trpc/jobs.ranked?input=" + urllib.parse.quote(json.dumps({"json": params}))
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)
d = ranked({"query":"js","pageSize":5})
if 'error' in d: print("ERROR:", d['error']['json']['message'][:150]); raise SystemExit(1)
res = d['result']['data']['json']
print('totalExact:', res.get('totalExact'), 'totalWithTypo:', res.get('totalWithTypo'))
for r in res['rows'][:5]:
    print(f"  {r['score']:6.1f} txt={r['text']:4.2f} skl={r['skills']:4.2f} dst={r['distance']:4.2f} rec={r['recency']:4.2f} sal={r['salary']:4.2f} | {r['title'][:45]}")
print('cursor:', res.get('nextCursor'))
# pagination
d2 = ranked({"query":"js","pageSize":3,"cursor": res['nextCursor']})
res2 = d2['result']['data']['json']
print('page2 ids:', [r['id'] for r in res2['rows']], 'dup?', set(r['id'] for r in res2['rows']) & set(r['id'] for r in res['rows']))
# typo test
d3 = ranked({"query":"javascrpt"})
print('typo totalExact:', d3['result']['data']['json'].get('totalExact'), 'totalWithTypo:', d3['result']['data']['json'].get('totalWithTypo'))
