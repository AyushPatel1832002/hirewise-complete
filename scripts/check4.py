import json, urllib.request, urllib.parse, urllib.error
url = "http://localhost:3000/api/trpc/jobs.ranked?input=" + urllib.parse.quote(json.dumps({"json":{"query":"js","pageSize":5}}))
try:
    urllib.request.urlopen(url, timeout=30)
except urllib.error.HTTPError as e:
    d = json.load(e)
    print(d['error']['json']['message'][:2500])
