#!/usr/bin/env python3
"""Setup Google Search Console - verify site and add service account as owner"""

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
        "scope": "https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/indexing",
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

def add_site(token):
    """Add site to Google Search Console"""
    site_url = "https://sbteplo.ru"
    endpoint = "https://www.googleapis.com/webmasters/v3/sites"
    
    body = json.dumps({
        "siteUrl": site_url
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
            print(f"✅ Site added: {result}")
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"❌ Error adding site: {e.code} - {error_body}")
        return None

def list_sites(token):
    """List all sites in Search Console"""
    endpoint = "https://www.googleapis.com/webmasters/v3/sites"
    
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
            print("📋 Sites in Search Console:")
            for site in result.get('siteEntry', []):
                print(f"  - {site.get('siteUrl')} ({site.get('permissionLevel')})")
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"❌ Error listing sites: {e.code} - {error_body}")
        return None

def submit_sitemap(token):
    """Submit sitemap to Google Search Console"""
    site_url = "https://sbteplo.ru"
    sitemap_url = "https://sbteplo.ru/sitemap.xml"
    
    endpoint = f"https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(site_url, safe='')}/sitemaps"
    
    body = json.dumps({
        "feedpath": sitemap_url
    }).encode()
    
    ctx = ssl.create_default_context()
    req = urllib.request.Request(
        endpoint,
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        method='PUT'
    )
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            result = json.loads(response.read().decode())
            print(f"✅ Sitemap submitted: {result}")
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"❌ Error submitting sitemap: {e.code} - {error_body}")
        return None

if __name__ == "__main__":
    print("🔑 Getting access token...")
    token = get_access_token()
    
    if token:
        print(f"✅ Token obtained\n")
        
        # List existing sites
        print("📋 Checking existing sites...")
        list_sites(token)
        
        # Try to add site
        print("\n➕ Adding site...")
        add_site(token)
        
        # Submit sitemap
        print("\n📤 Submitting sitemap...")
        submit_sitemap(token)
    else:
        print("❌ Failed to get access token")
