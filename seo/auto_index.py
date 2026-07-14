#!/usr/bin/env python3
"""
Автоматическая индексация sbteplo.ru через Google Indexing API
Запускать после добавления service account в Google Search Console
"""

import json
import urllib.request
import urllib.parse
import ssl
import time
import base64
from datetime import datetime

# Load credentials
with open(r'C:\Users\TBG\Desktop\backup_site\google-seo-key.json', 'r') as f:
    creds = json.load(f)

SITE_URL = "https://sbteplo.ru"

# Все страницы сайта
PAGES = [
    "/",
    "/articles/",
    "/services/",
    "/articles/teplyj-pol-v-vannoj/",
    "/articles/kak-vybrat-kotel/",
    "/articles/kollektornaya-razvodka/",
    "/articles/podgotovka-otopleniya-k-zime/",
    "/articles/avtomatika-otopleniya/",
    "/articles/montazh-radiatorov/",
    "/articles/kanalizaciya-chastnogo-doma/",
    "/articles/teplyj-pol-v-chastnom-dome/",
    "/articles/oshibki-montazha-otopleniya/",
    "/articles/garantiya-otopleniya/",
    "/services/teplyj-pol/",
    "/services/radiatory/",
    "/services/kotelnaya/",
    "/services/vodosnabzhenie/",
    "/services/kanalizaciya/",
]

def get_access_token():
    private_key = creds['private_key']
    client_email = creds['client_email']
    token_uri = creds['token_uri']
    
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.primitives.serialization import load_pem_private_key
    
    header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256", "typ": "JWT"}).encode()).decode().rstrip('=')
    now = int(time.time())
    payload = base64.urlsafe_b64encode(json.dumps({
        "iss": client_email,
        "scope": "https://www.googleapis.com/auth/indexing",
        "aud": token_uri,
        "iat": now,
        "exp": now + 3600
    }).encode()).decode().rstrip('=')
    
    key = load_pem_private_key(private_key.encode(), password=None)
    signature = key.sign(f"{header}.{payload}".encode(), padding.PKCS1v15(), hashes.SHA256())
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    jwt = f"{header}.{payload}.{signature_b64}"
    
    data = urllib.parse.urlencode({
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt
    }).encode()
    
    ctx = ssl.create_default_context()
    req = urllib.request.Request(token_uri, data=data, method='POST')
    
    with urllib.request.urlopen(req, context=ctx) as response:
        result = json.loads(response.read().decode())
        return result.get('access_token')

def submit_url(token, url):
    endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"
    body = json.dumps({"url": url, "type": "URL_UPDATED"}).encode()
    
    ctx = ssl.create_default_context()
    req = urllib.request.Request(
        endpoint, data=body,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return True
    except:
        return False

def check_url_status(token, url):
    endpoint = f"https://indexing.googleapis.com/v3/urlNotifications/metadata?url={urllib.parse.quote(url, safe='')}"
    ctx = ssl.create_default_context()
    req = urllib.request.Request(
        endpoint,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method='GET'
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return json.loads(response.read().decode())
    except:
        return None

if __name__ == "__main__":
    print(f"🤖 Авто-индексация {SITE_URL}")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    token = get_access_token()
    if not token:
        print("❌ Не удалось получить токен")
        exit(1)
    
    print("✅ Токен получен\n")
    
    # Check main page status
    print("📊 Проверяю статус главной страницы...")
    status = check_url_status(token, SITE_URL + "/")
    if status:
        print(f"   Статус: {json.dumps(status, indent=2)}")
    else:
        print("   URL не в очереди на индексацию")
    
    # Submit all pages
    print(f"\n📤 Отправляю {len(PAGES)} страниц на индексацию...")
    success = 0
    failed = 0
    
    for page in PAGES:
        url = SITE_URL + page
        if submit_url(token, url):
            print(f"   ✅ {page}")
            success += 1
        else:
            print(f"   ❌ {page}")
            failed += 1
        
        # Rate limit - 200 requests per day
        time.sleep(0.5)
    
    print(f"\n📊 Итого: {success} отправлено, {failed} ошибок")
    print(f"⏰ Следующий запуск: через 24 часа")
