import httpx, sys, io, re, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

start = time.time()
r = httpx.get('https://sbteplo.ru', timeout=30, follow_redirects=True)
load_time = time.time() - start

print('=== СКОРОСТЬ ЗАГРУЗКИ ===')
print(f'Время загрузки: {load_time:.2f} сек')
print(f'Размер HTML: {len(r.text)//1024} KB')

# Ищем изображения
imgs = re.findall(r'<img[^>]+src="([^"]+)"', r.text)
print(f'Изображений: {len(imgs)}')

# Проверяем размеры изображений
total_img_size = 0
for img in imgs[:5]:
    try:
        if img.startswith('http'):
            img_r = httpx.head(img, timeout=5)
            size = int(img_r.headers.get('content-length', 0))
            total_img_size += size
            print(f'  {img[:60]}... - {size//1024} KB')
    except:
        pass

print(f'Общий размер изображений (первые 5): {total_img_size//1024} KB')

# Проверяем наличие lazy loading
has_lazy = 'loading="lazy"' in r.text
print(f'Lazy loading: {"есть" if has_lazy else "нет"}')

# Проверяем наличие WebP
has_webp = '.webp' in r.text
print(f'WebP формат: {"есть" if has_webp else "нет"}')
