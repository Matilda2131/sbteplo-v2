import httpx, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

token = os.getenv('GH_TOKEN', '')
headers = {'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json'}

repos = httpx.get('https://api.github.com/user/repos?per_page=50', headers=headers).json()
for repo in repos:
    name = repo['name']
    try:
        r = httpx.get(f'https://api.github.com/repos/{repo["full_name"]}/pages', headers=headers)
        if r.status_code == 200:
            data = r.json()
            cname = data.get('cname', '')
            print(f'{name} - CNAME: {cname or "none"}')
    except:
        pass
