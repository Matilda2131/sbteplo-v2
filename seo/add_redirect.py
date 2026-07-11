import httpx, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

token = os.getenv('CF_TOKEN', '')
headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}
zone_id = '6664e1e546a56e2ea06b751e78bd2414'

# Создаём правило для редиректа HTTP -> HTTPS
r = httpx.post(
    f'https://api.cloudflare.com/client/v4/zones/{zone_id}/rulesets',
    headers=headers,
    json={
        'name': 'HTTPS Redirect',
        'kind': 'zone',
        'phase': 'http_request_upgrade',
        'rules': [{
            'expression': '(not http.ssl)',
            'action': 'redirect',
            'action_parameters': {
                'from_value': {
                    'status_code': 301,
                    'target_url': 'https://sbteplo.ru'
                }
            }
        }]
    }
)
print('Redirect rule:', r.json().get('success', False))
print('Response:', r.json())
