#!/usr/bin/env python3
"""Submit sitemap and pages to Google Search Console via Indexing API"""

import json
import urllib.request
import urllib.parse
import ssl

# Google Service Account credentials
with open(r'C:\Users\TBG\Desktop\backup_site\google-seo-key.json', 'r') as f:
    creds = json.load(f)

# Step 1: Get access token using service account
def get_access_token():
    """Get OAuth2 access token from service account"""
    private_key = creds['private_key']
    client_email = creds['client_email']
    token_uri = creds['token_uri']
    
    # Create JWT
    import time
    import base64
    
    header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256", "typ": "JWT"}).encode()).decode().rstrip('=')
    
    now = int(time.time())
    payload = base64.urlsafe_b64encode(json.dumps({
        "iss": client_email,
        "scope": "https://www.googleapis.com/auth/indexing",
        "aud": token_uri,
        "iat": now,
        "exp": now + 3600
    }).encode()).decode().rstrip('=')
    
    # Sign with private key
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.primitives.serialization import load_pem_private_key
    
    key = load_pem_private_key(private_key.encode(), password=None)
    signature = key.sign(f"{header}.{payload}".encode(), padding.PKCS1v15(), hashes.SHA256())
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    
    jwt = f"{header}.{payload}.{signature_b64}"
    
    # Exchange JWT for access token
    data = urllib.parse.urlencode({
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt
    }).encode()
    
    ctx = ssl.create_default_context()
    req = urllib.request.Request(token_uri, data=data, method='POST')
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            result = json.loads(response.read().decode())
            return result.get('access_token')
    except Exception as e:
        print(f"Error getting token: {e}")
        return None

# Step 2: Submit URL for indexing
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
    except Exception as e:
        print(f"❌ Failed: {url} - {e}")
        return None

# Step 3: Get site status from Search Console
def get_site_status(token):
    """Get site search analytics"""
    site_url = "https://sbteplo.ru"
    endpoint = f"https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(site_url, safe='')}/searchAnalytics/query"
    
    body = json.dumps({
        "startDate": "2026-06-01",
        "endDate": "2026-07-13",
        "dimensions": ["query"],
        "rowLimit": 10
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
            return result
    except Exception as e:
        print(f"Error getting site status: {e}")
        return None

if __name__ == "__main__":
    print("🔑 Getting access token...")
    token = get_access_token()
    
    if token:
        print(f"✅ Token obtained: {token[:20]}...")
        
        # Submit main pages for indexing
        pages = [
            "https://sbteplo.ru/",
            "https://sbteplo.ru/articles/",
            "https://sbteplo.ru/services/",
            "https://sbteplo.ru/articles/teplyj-pol-v-vannoj/",
            "https://sbteplo.ru/articles/kak-vybrat-kotel/",
            "https://sbteplo.ru/articles/kollektornaya-razvodka/",
            "https://sbteplo.ru/articles/podgotovka-otopleniya-k-zime/",
            "https://sbteplo.ru/articles/avtomatika-otopleniya/",
            "https://sbteplo.ru/services/teplyj-pol/",
            "https://sbteplo.ru/services/radiatory/",
            "https://sbteplo.ru/services/kotelnaya/",
            "https://sbteplo.ru/services/vodosnabzhenie/",
            "https://sbteplo.ru/services/kanalizaciya/",
            "https://sbteplo.ru/articles/montazh-radiatorov/",
            "https://sbteplo.ru/articles/kanalizaciya-chastnogo-doma/",
            "https://sbteplo.ru/articles/teplyj-pol-v-chastnom-dome/",
            "https://sbteplo.ru/articles/oshibki-montazha-otopleniya/",
            "https://sbteplo.ru/articles/garantiya-otopleniya/",
        ]
        
        print("\n📤 Submitting pages for indexing...")
        for page in pages:
            submit_url(token, page)
        
        print("\n📊 Checking site status...")
        status = get_site_status(token)
        if status:
            print(json.dumps(status, indent=2, ensure_ascii=False))
    else:
        print("❌ Failed to get access token")
