import httpx, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('http://sbteplo.ru', timeout=10, follow_redirects=True)
html = r.text

print('=== АНАЛИЗ КОНТЕНТА САЙТА ===')

# Проверяем изображения
imgs = re.findall(r'<img[^>]+src="([^"]+)"', html)
print(f'Изображений: {len(imgs)}')

# Проверяем ключевые слова для SEO
keywords = ['отопление', 'тёплый пол', 'котельная', 'водоснабжение', 'канализация', 'СПб', 'гарантия', 'Rehau', 'Baxi']
for kw in keywords:
    count = html.lower().count(kw.lower())
    print(f'  {kw}: {count} упоминаний')

# Проверяем длину текста
text = re.sub(r'<[^>]+>', ' ', html)
text = re.sub(r'\s+', ' ', text).strip()
words = len(text.split())
print(f'\\nВсего слов: {words}')
print(f'Рекомендуется: 300-500 слов для SEO')
