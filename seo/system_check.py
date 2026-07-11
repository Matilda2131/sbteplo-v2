import os
import sys
import io
import httpx
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Конфигурация
OPENROUTER_KEY = os.getenv('OPENROUTER_KEY', '')
GOOGLE_KEY = r'C:\Users\TBG\Desktop\backup_site\google-seo-key.json'
SITE_URL = 'https://matilda2131.github.io/sbteplo-v2/'
SITEMAP_URL = SITE_URL + 'sitemap.xml'

def test_openrouter():
    """Тест OpenRouter API"""
    print("=== Тест OpenRouter ===")
    r = httpx.post('https://openrouter.ai/api/v1/chat/completions',
        headers={'Authorization': f'Bearer {OPENROUTER_KEY}', 'Content-Type': 'application/json'},
        json={'model': 'anthropic/claude-3-haiku', 'messages': [{'role': 'user', 'content': 'Привет, ответь одним предложением'}]},
        timeout=15)
    if r.status_code == 200:
        reply = r.json().get('choices', [{}])[0].get('message', {}).get('content', 'ERROR')
        print(f"✅ OpenRouter работает: {reply[:100]}")
        return True
    else:
        print(f"❌ OpenRouter ошибка: {r.status_code}")
        return False

def test_google_api():
    """Тест Google Search Console API"""
    print("\n=== Тест Google Search Console ===")
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        
        creds = service_account.Credentials.from_service_account_file(
            GOOGLE_KEY,
            scopes=['https://www.googleapis.com/auth/webmasters']
        )
        service = build('searchconsole', 'v1', credentials=creds)
        
        # Проверяем список сайтов
        sites = service.sites().list().execute()
        print(f"✅ Google API работает. Сайтов: {len(sites.get('siteEntry', []))}")
        
        # Проверяем индексацию
        site_url = 'https://matilda2131.github.io/sbteplo-v2/'
        try:
            result = service.sites().get(site_url).execute()
            print(f"✅ Сайт зарегистрирован: {result.get('siteUrl', 'N/A')}")
        except:
            print(f"⚠️ Сайт не найден в Search Console")
        
        return True
    except Exception as e:
        print(f"❌ Google API ошибка: {e}")
        return False

def check_site_status():
    """Проверка статуса сайта"""
    print("\n=== Статус сайта ===")
    urls = [
        ('HTTP sbteplo.ru', 'http://sbteplo.ru'),
        ('HTTPS sbteplo.ru', 'https://sbteplo.ru'),
        ('GitHub Pages', 'https://matilda2131.github.io/sbteplo-v2/')
    ]
    for name, url in urls:
        try:
            r = httpx.get(url, timeout=10, follow_redirects=True)
            status = '✅' if r.status_code == 200 else '⚠️'
            print(f"{status} {name}: {r.status_code}")
        except Exception as e:
            print(f"❌ {name}: {str(e)[:50]}")

def check_dns():
    """Проверка DNS"""
    print("\n=== DNS ===")
    r = httpx.get('https://dns.google/resolve?name=sbteplo.ru&type=NS', timeout=5)
    ns = [a.get('data','') for a in r.json().get('Answer', [])]
    print(f"NS: {ns}")
    
    r2 = httpx.get('https://dns.google/resolve?name=sbteplo.ru&type=A', timeout=5)
    ips = [a.get('data','') for a in r2.json().get('Answer', [])]
    print(f"A: {ips}")

def generate_seo_report():
    """Генерация SEO-отчёта"""
    print("\n=== SEO-отчёт ===")
    try:
        r = httpx.get(SITE_URL, timeout=10, follow_redirects=True)
        html = r.text
        
        checks = []
        
        # Title
        import re
        title = re.search(r'<title>(.*?)</title>', html)
        if title:
            t = title.group(1)
            checks.append(('Title', f'{len(t)} символов', '✅' if 30 <= len(t) <= 60 else '⚠️'))
        
        # Description
        desc = re.search(r'name="description"\s+content="(.*?)"', html)
        if desc:
            d = desc.group(1)
            checks.append(('Description', f'{len(d)} символов', '✅' if 70 <= len(d) <= 160 else '⚠️'))
        
        # H1
        h1 = len(re.findall(r'<h1[^>]*>', html))
        checks.append(('H1', f'{h1} шт', '✅' if h1 == 1 else '⚠️'))
        
        # Canonical
        checks.append(('Canonical', 'есть' if 'rel="canonical"' in html else 'нет', '✅' if 'rel="canonical"' in html else '⚠️'))
        
        # OG
        checks.append(('Open Graph', 'есть' if 'og:title' in html else 'нет', '✅' if 'og:title' in html else '⚠️'))
        
        # Sitemap
        checks.append(('Sitemap', 'есть' if 'sitemap.xml' in html else 'нет', '✅' if 'sitemap.xml' in html else '⚠️'))
        
        for name, value, status in checks:
            print(f"{status} {name}: {value}")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("ПОЛНАЯ ПРОВЕРКА СИСТЕМЫ")
    print("=" * 50)
    
    test_openrouter()
    test_google_api()
    check_site_status()
    check_dns()
    generate_seo_report()
    
    print("\n" + "=" * 50)
    print("ВСЁ ГОТОВО К РАБОТЕ!")
    print("=" * 50)
