import json, urllib.request, urllib.parse, urllib.error
url = "http://localhost:3000/api/trpc/jobs.ranked?input=" + urllib.parse.quote(json.dumps({"json":{"query":"js","pageSize":5}}))
try:
    urllib.request.urlopen(url, timeout=30)
except urllib.error.HTTPError as e:
    d = json.load(e)
    m = d['error']['json']['message']
    lines = m.split('\n')
    print(' '.join(lines[-2:]))
