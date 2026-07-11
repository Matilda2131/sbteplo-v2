import httpx, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

token = os.getenv('CF_TOKEN', '')
headers = {'Authorization': 'Bearer ' + token}

# Проверяем настройки SSL
r = httpx.get('https://api.cloudflare.com/client/v4/zones/6664e1e546a56e2ea06b751e78bd2414/settings/ssl', headers=headers)
print('SSL:', r.json())

# Проверяем Always Use HTTPS
r2 = httpx.get('https://api.cloudflare.com/client/v4/zones/6664e1e546a56e2ea06b751e78bd2414/settings/always_use_https', headers=headers)
print('Always HTTPS:', r2.json())
