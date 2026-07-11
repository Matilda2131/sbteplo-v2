import httpx, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('https://sbteplo.ru', timeout=10, follow_redirects=True)
html = r.text

print('=== ТЕКУЩИЙ СТАТУС ===')
checks = {
    'Яндекс.Метрика': '110351183' in html,
    'Google Analytics': 'G-N8MS3M4K7Y' in html,
    'Форма обратной связи': 'leadFormCalc' in html,
    'Кнопка звонка': 'tel:' in html,
    'Чат-бот': 'chatWindow' in html,
    'Калькулятор': 'calcStep' in html,
    'HTTPS': True,
    'SEO мета-теги': 'og:title' in html,
}

for name, present in checks.items():
    status = 'OK' if present else 'MISSING'
    print(f'  {status} {name}')
