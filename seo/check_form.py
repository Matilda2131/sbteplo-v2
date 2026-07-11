import httpx, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Проверяем форму на сайте
r = httpx.get('https://sbteplo.ru', timeout=10, follow_redirects=True)
html = r.text

# Ищем форму
import re
forms = re.findall(r'<form[^>]*>', html)
print('Формы на сайте:')
for f in forms:
    print(f'  {f}')

# Ищем action
actions = re.findall(r'action="([^"]*)"', html)
print('\\nAction:')
for a in actions:
    print(f'  {a}')
