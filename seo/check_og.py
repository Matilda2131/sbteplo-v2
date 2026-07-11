import httpx, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('https://sbteplo.ru', timeout=10, follow_redirects=True)
og_image = re.search(r'og:image.*?content="(.*?)"', r.text)
if og_image:
    url = og_image.group(1)
    print('og:image:', url)
    try:
        r2 = httpx.get(url, timeout=10)
        print('Картинка:', r2.status_code)
    except Exception as e:
        print('Ошибка:', str(e)[:50])
else:
    print('og:image не найден')
