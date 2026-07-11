import httpx, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

token = os.getenv('CF_TOKEN', '')
headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}
zone_id = '6664e1e546a56e2ea06b751e78bd2414'

# Получаем текущие NS серверы
r = httpx.get(f'https://api.cloudflare.com/client/v4/zones/{zone_id}', headers=headers)
zone = r.json().get('result', {})
current_ns = zone.get('name_servers', [])
print('Текущие NS:', current_ns)

# Получаем NS серверы Cloudflare для этой зоны
r2 = httpx.get(f'https://api.cloudflare.com/client/v4/zones/{zone_id}/custom_nameservers', headers=headers)
print('Cloudflare NS:', r2.json())
