import httpx, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('https://sbteplo.ru', timeout=10, follow_redirects=True)
html = r.text

print('=== SEO АУДИТ ===')

# Title
title = re.search(r'<title>(.*?)</title>', html)
if title:
    t = title.group(1)
    status = 'OK' if 30 <= len(t) <= 60 else 'ПРОБЛЕМА'
    print(f'Title: {len(t)} символов - {status}')

# Description
desc = re.search(r'name="description" content="(.*?)"', html)
if desc:
    d = desc.group(1)
    status = 'OK' if 70 <= len(d) <= 160 else 'ПРОБЛЕМА'
    print(f'Description: {len(d)} символов - {status}')

# H1
h1 = len(re.findall(r'<h1[^>]*>', html))
print(f'H1: {h1} - {"OK" if h1 == 1 else "ПРОБЛЕМА"}')

# Canonical
has_canonical = 'rel="canonical"' in html
print(f'Canonical: {"есть" if has_canonical else "нет"} - {"OK" if has_canonical else "ПРОБЛЕМА"}')

# Keywords
has_keywords = 'name="keywords"' in html
print(f'Keywords: {"есть" if has_keywords else "нет"}')

# OG
has_og = 'og:title' in html
print(f'Open Graph: {"есть" if has_og else "нет"}')

# Sitemap
has_sitemap = 'sitemap.xml' in html
print(f'Sitemap: {"есть" if has_sitemap else "нет"}')

# Robots
has_robots = 'robots' in html
print(f'Robots: {"есть" if has_robots else "нет"}')

# Google Analytics
has_ga = 'G-N8MS3M4K7Y' in html
print(f'Google Analytics: {"есть" if has_ga else "нет"}')

# Yandex Metrika
has_ym = '110351183' in html
print(f'Yandex Metrika: {"есть" if has_ym else "нет"}')

# Images
imgs = re.findall(r'<img[^>]*>', html)
imgs_with_alt = [i for i in imgs if 'alt=' in i]
print(f'Images: {len(imgs)} всего, {len(imgs_with_alt)} с alt')

# Size
print(f'Size: {len(html)//1024} KB')
