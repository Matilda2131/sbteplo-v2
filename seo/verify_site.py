#!/usr/bin/env python3
"""Submit URL to Google Indexing API - alternative approach"""

import json
import urllib.request
import urllib.parse
import ssl
import time
import base64

# Load credentials
with open(r'C:\Users\TBG\Desktop\backup_site\google-seo-key.json', 'r') as f:
    creds = json.load(f)

def get_access_token():
    """Get OAuth2 access token from service account"""
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
    """Submit URL to Google Indexing API"""
    endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"
    
    body = json.dumps({
        "url": url,
        "type": "URL_UPDATED"
    }).encode()
    
    ctx = ssl.create_default_context()
    req = urllib.request.Request(
        endpoint,
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            result = json.loads(response.read().decode())
            print(f"✅ Submitted: {url}")
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"❌ Failed: {url} - {e.code}")
        if e.code == 403:
            print("   → Service account не является владельцем сайта")
            print("   → Нужно добавить в Google Search Console вручную")
        return None

def get_url_status(token, url):
    """Get URL status from Indexing API"""
    endpoint = f"https://indexing.googleapis.com/v3/urlNotifications/metadata?url={urllib.parse.quote(url, safe='')}"
    
    ctx = ssl.create_default_context()
    req = urllib.request.Request(
        endpoint,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        method='GET'
    )
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            result = json.loads(response.read().decode())
            return result
    except urllib.error.HTTPError as e:
        return None

if __name__ == "__main__":
    print("🔑 Getting access token...")
    token = get_access_token()
    
    if token:
        print(f"✅ Token obtained\n")
        
        # Check URL status
        url = "https://sbteplo.ru/"
        print(f"📊 Checking status for: {url}")
        status = get_url_status(token, url)
        if status:
            print(f"   Status: {json.dumps(status, indent=2)}")
        else:
            print("   URL не проиндексирован или нет доступа")
        
        # Try to submit
        print(f"\n📤 Trying to submit: {url}")
        result = submit_url(token, url)
        
        if not result:
            print("\n" + "="*60)
            print("📋 ИНСТРУКЦИЯ ДЛЯ РУЧНОЙ НАСТРОЙКИ:")
            print("="*60)
            print(f"""
1. Зайди в Google Search Console:
   https://search.google.com/search-console

2. Нажми "Добавить ресурс" → введи: sbteplo.ru

3. Выбери "Файл HTML" → скачай файл верификации

4. Загрузи файл в корень сайта (я помогу)

5. Нажми "Подтвердить"

6. В настройках добавь service account как пользователя:
   {creds['client_email']}
   (уровень: "Полный доступ")

7. После этого API будет работать автоматически!
""")
    else:
        print("❌ Failed to get access token")
