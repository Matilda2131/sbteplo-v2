import httpx, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('http://sbteplo.ru', timeout=10, follow_redirects=True)
html = r.text

print('=== АНАЛИЗ САЙТА ===')
print('Размер:', len(html), 'байт')

# Проверяем JavaScript на ошибки
js_errors = []
if 'YOUR_OPENROUTER_KEY_HERE' in html:
    js_errors.append('API-ключ не заменён (placeholder)')
if 'YOUR_FORMSPREE_ID' in html:
    js_errors.append('Formspree ID не настроен')

# Проверяем мета-теги
title = re.search(r'<title>(.*?)</title>', html)
desc = re.search(r'name="description" content="(.*?)"', html)

print()
print('JavaScript ошибки:', len(js_errors))
for e in js_errors:
    print('  -', e)

print()
print('Title:', title.group(1) if title else 'НЕТ')
print('Description:', (desc.group(1)[:50] if desc else 'НЕТ') + '...')

# Проверяем наличие ключевых элементов
checks = {
    'Калькулятор': 'calcStep' in html,
    'Чат-бот': 'chatWindow' in html,
    'Форма': 'leadFormCalc' in html,
    'Навигация': 'nav' in html.lower(),
    'Контакты': 'contact' in html.lower(),
}

print()
print('Элементы на сайте:')
for name, present in checks.items():
    status = 'OK' if present else 'MISSING'
    print(' ', status, name)
