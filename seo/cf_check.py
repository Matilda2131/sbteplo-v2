import httpx, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

token = os.getenv('CF_TOKEN', '')
headers = {'Authorization': 'Bearer ' + token}

# Проверяем зоны
r = httpx.get('https://api.cloudflare.com/client/v4/zones', headers=headers)
zones = r.json().get('result', [])
print('Зоны:')
for z in zones:
    print('  ' + z['name'] + ' (ID: ' + z['id'] + ')')

# Проверяем DNS записи
if zones:
    zone_id = zones[0]['id']
    r2 = httpx.get(f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records', headers=headers)
    records = r2.json().get('result', [])
    print('\nDNS записи:')
    for rec in records:
        print(f'  {rec["type"]} {rec["name"]} -> {rec["content"]}')
