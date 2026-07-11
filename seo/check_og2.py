import httpx, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('https://matilda2131.github.io/sbteplo-v2/', timeout=10, follow_redirects=True)
print('Size:', len(r.text))

# Ищем og:image
for line in r.text.split('\n'):
    if 'og:image' in line:
        print('Found:', line.strip()[:100])
