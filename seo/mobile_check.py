import httpx, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('https://sbteplo.ru', timeout=10, follow_redirects=True)
html = r.text

print('=== ПРОВЕРКА МОБИЛЬНОЙ ВЕРСИИ ===')

checks = {
    'Viewport meta': 'viewport' in html,
    'Media queries': '@media' in html,
    'Mobile cursor': 'cursor: auto' in html,
    'Responsive images': 'object-cover' in html,
    'Flexible layout': 'grid' in html or 'flex' in html,
}

for name, present in checks.items():
    status = 'OK' if present else 'MISSING'
    print(f'  {status} {name}')

print()
print('=== ПОИСК ПРОБЛЕМ ===')

# Проверяем фиксированные размеры
fixed_widths = re.findall(r'width:\s*(\d+)px', html)
print(f'Фиксированные ширины: {len(fixed_widths)}')

# Проверяем overflow
if 'overflow-x: hidden' in html:
    print('  overflow-x: hidden — может скрывать контент')

# Проверяем размер шрифтов
font_sizes = re.findall(r'font-size:\s*(\d+)px', html)
print(f'Фиксированные шрифты: {len(font_sizes)}')

# Проверяем padding/margin
fixed_padding = re.findall(r'padding:\s*\d+px', html)
print(f'Фиксированные padding: {len(fixed_padding)}')
