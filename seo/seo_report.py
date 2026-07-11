import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from google.oauth2 import service_account
from googleapiclient.discovery import build

creds = service_account.Credentials.from_service_account_file(
    r'C:\Users\TBG\Desktop\backup_site\google-seo-key.json',
    scopes=['https://www.googleapis.com/auth/webmasters.readonly']
)
service = build('searchconsole', 'v1', credentials=creds)

print('=== GOOGLE SEARCH CONSOLE ОТЧЁТ ===')

# Проверяем сайт
sites = service.sites().list().execute()
for s in sites.get('siteEntry', []):
    print(f'Сайт: {s.get("siteUrl")} ({s.get("permissionLevel")})')

print()
print('=== РЕКОМЕНДАЦИИ ДЛЯ ПРОДВИЖЕНИЯ ===')
print()
print('1. КОНТЕНТ:')
print('   - Написать 10-15 SEO-статей по ключевым запросам')
print('   - Добавить описание услуг с ключевыми словами')
print('   - Создать страницы "О компании", "Контакты", "Отзывы"')
print()
print('2. ТЕХНИЧЕСКОЕ SEO:')
print('   - Ускорить загрузку сайта (lazy loading, оптимизация изображений)')
print('   - Добавить структурированные данные (JSON-LD)')
print('   - Настроить карту сайта')
print()
print('3. ВНЕШНЯЯ ОПТИМИЗАЦИЯ:')
print('   - Регистрация в каталогах (2ГИС, Яндекс.Карты, Google Maps)')
print('   - Публикация статей на сторонних ресурсах')
print('   - Работа с отзывами')
print()
print('4. КОНТЕКСТНАЯ РЕКЛАМА:')
print('   - Яндекс.Директ (уже настроен)')
print('   - Google Ads')
print()
print('5. АНАЛИТИКА:')
print('   - Яндекс.Метрика (уже подключена)')
print('   - Google Analytics (уже подключена)')
print('   - Регулярные отчёты по позициям')
