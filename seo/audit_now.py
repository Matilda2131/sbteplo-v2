import httpx, time, re

url = 'https://sbteplo.ru'
start = time.time()
r = httpx.get(url, timeout=15, follow_redirects=True)
load_time = time.time() - start
html = r.text

title = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
desc = re.search(r'<meta name="description" content="(.*?)"', html)
h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
canonical = re.search(r'<link rel="canonical" href="(.*?)"', html)
og_title = re.search(r'og:title.*?content="(.*?)"', html)
og_image = re.search(r'og:image.*?content="(.*?)"', html)
robots = re.search(r'<meta name="robots" content="(.*?)"', html)
jsonld = 'application/ld+json' in html
viewport = 'viewport' in html
charset = 'charset' in html

print('=== SEO AUDIT: sbteplo.ru ===')
print()
print(f'Status: {r.status_code}')
print(f'Size: {len(html)//1024} KB')
print(f'Load time: {load_time:.2f}s')
print()
print(f'Title: {title.group(1)[:80] if title else "MISSING"}')
print(f'Description: {desc.group(1)[:80] if desc else "MISSING"}')
print(f'H1: {h1.group(1)[:80] if h1 else "MISSING"}')
print(f'Canonical: {canonical.group(1) if canonical else "MISSING"}')
print(f'OG Title: {og_title.group(1)[:60] if og_title else "MISSING"}')
print(f'OG Image: {"found" if og_image else "MISSING"}')
print(f'Robots: {robots.group(1) if robots else "MISSING"}')
print(f'JSON-LD: {jsonld}')
print(f'Viewport: {viewport}')
print(f'Charset: {charset}')

h2_count = len(re.findall(r'<h2', html))
h3_count = len(re.findall(r'<h3', html))
img_count = len(re.findall(r'<img', html))
img_no_alt = len(re.findall(r'<img(?![^>]*alt=)', html))
print()
print(f'H2 count: {h2_count}')
print(f'H3 count: {h3_count}')
print(f'Images: {img_count} (no alt: {img_no_alt})')

# Check for common issues
issues = []
if not title: issues.append('NO TITLE')
elif len(title.group(1)) > 60: issues.append(f'Title too long: {len(title.group(1))} chars')
if not desc: issues.append('NO DESCRIPTION')
elif len(desc.group(1)) > 160: issues.append(f'Description too long: {len(desc.group(1))} chars')
if not h1: issues.append('NO H1')
if not canonical: issues.append('NO CANONICAL')
if not jsonld: issues.append('NO JSON-LD')
if img_no_alt > 0: issues.append(f'{img_no_alt} images without alt')
if load_time > 3: issues.append(f'Slow load: {load_time:.1f}s')

print()
if issues:
    print('ISSUES FOUND:')
    for i in issues:
        print(f'  - {i}')
else:
    print('No critical issues found!')
