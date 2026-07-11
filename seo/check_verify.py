import httpx

urls = [
    'https://sbteplo.ru/google5c372ba003ab94f8.html',
    'https://sbteplo.ru/yandex_ecba199dcb01cceb.html',
    'https://sbteplo.ru/robots.txt',
    'https://sbteplo.ru/sitemap.xml',
]
for url in urls:
    try:
        r = httpx.get(url, timeout=10)
        name = url.split('/')[-1]
        print(f'{name}: {r.status_code} ({len(r.text)} bytes)')
    except Exception as e:
        print(f'{url}: ERROR')
