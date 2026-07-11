import httpx, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('https://sbteplo.ru', timeout=10, follow_redirects=True)
html = r.text

# Проверяем смешанный контент
http_resources = re.findall(r'src="http://[^"]+"', html)
http_links = re.findall(r'href="http://[^"]+"', html)

print('HTTP ресурсы на HTTPS странице:')
for res in http_resources[:5]:
    print(f'  {res[:80]}')

print('HTTP ссылки:')
for link in http_links[:5]:
    print(f'  {link[:80]}')
