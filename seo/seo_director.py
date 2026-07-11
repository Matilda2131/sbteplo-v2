import httpx, sys, io, json, time, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Конфигурация
SITE_URL = 'https://sbteplo.ru'
OPENROUTER_KEY = os.getenv('OPENROUTER_KEY', '')
KEYWORDS = [
    'монтаж отопления СПб',
    'водяной теплый пол',
    'ремонт котлов',
    'котельная под ключ',
    'отопление частного дома',
    'тёплый пол стоимость',
    'монтаж радиаторов'
]

def check_speed():
    r = httpx.get(SITE_URL, timeout=10, follow_redirects=True)
    return {
        'status': r.status_code,
        'time': r.elapsed.total_seconds(),
        'size': len(r.text) // 1024
    }

def check_meta_tags(html):
    issues = []
    title = re.search(r'<title>(.*?)</title>', html)
    if not title:
        issues.append('Нет Title')
    elif len(title.group(1)) > 60:
        issues.append(f'Title длинный ({len(title.group(1))} символов)')
    
    desc = re.search(r'name="description" content="(.*?)"', html)
    if not desc:
        issues.append('Нет Description')
    elif len(desc.group(1)) > 160:
        issues.append(f'Description длинный ({len(desc.group(1))} символов)')
    
    h1 = len(re.findall(r'<h1[^>]*>', html))
    if h1 == 0:
        issues.append('Нет H1')
    elif h1 > 1:
        issues.append(f'Несколько H1 ({h1})')
    
    return issues

def check_images(html):
    imgs = re.findall(r'<img[^>]*>', html)
    no_alt = [i for i in imgs if 'alt=' not in i]
    return {'total': len(imgs), 'no_alt': len(no_alt)}

def generate_weekly_report():
    speed = check_speed()
    r = httpx.get(SITE_URL, timeout=10, follow_redirects=True)
    html = r.text
    meta_issues = check_meta_tags(html)
    images = check_images(html)
    
    report = f"""
📊 ОТЧЁТ SEO-ДИРЕКТОРА
Дата: {time.strftime("%d.%m.%Y %H:%M")}

СТАТУС САЙТА:
- HTTP: {speed['status']}
- Скорость: {speed['time']:.2f} сек
- Размер: {speed['size']} КБ

МЕТА-ТЕГИ:
"""
    if meta_issues:
        for issue in meta_issues:
            report += f"  ⚠️ {issue}\n"
    else:
        report += "  ✅ Все в порядке\n"
    
    report += f"""
ИЗОБРАЖЕНИЯ:
  Всего: {images['total']}
  Без alt: {images['no_alt']}

КЛЮЧЕВЫЕ СЛОВА ДЛЯ МОНИТОРИНГА:
"""
    for kw in KEYWORDS:
        report += f"  - {kw}\n"
    
    report += """
РЕКОМЕНДАЦИИ НА НЕДЕЛЮ:
1. Продолжать публикацию статей (2-3 в неделю)
2. Проверять позиции по ключевым словам
3. Оптимизировать мета-теги если есть проблемы
4. Мониторить скорость загрузки"""
    
    return report

if __name__ == '__main__':
    print(generate_weekly_report())
