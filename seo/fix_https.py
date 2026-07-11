import httpx, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

token = os.getenv('CF_TOKEN', '')
headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}
zone_id = '6664e1e546a56e2ea06b751e78bd2414'

# Включаем Always Use HTTPS
r = httpx.patch(
    f'https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/ssl',
    headers=headers,
    json={'value': 'strict'}
)
print('SSL strict:', r.json().get('success', False))

# Включаем Automatic HTTPS Rewrites
r2 = httpx.patch(
    f'https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/automatic_https_rewrites',
    headers=headers,
    json={'value': 'on'}
)
print('Auto HTTPS:', r2.json().get('success', False))
