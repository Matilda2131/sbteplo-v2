import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from google.oauth2 import service_account
from googleapiclient.discovery import build

creds = service_account.Credentials.from_service_account_file(
    r'C:\Users\TBG\Desktop\backup_site\google-seo-key.json',
    scopes=['https://www.googleapis.com/auth/webmasters.readonly']
)
service = build('searchconsole', 'v1', credentials=creds)

site_url = 'https://matilda2131.github.io/sbteplo-v2/'

print('=== GOOGLE SEARCH CONSOLE ===')

# Проверяем статус сайта
try:
    result = service.sites().get(site_url).execute()
    print(f'Сайт: {result.get("siteUrl")}')
    print(f'Права: {result.get("permissionLevel")}')
except Exception as e:
    print(f'Ошибка: {e}')

# Проверяем индексацию
try:
    searchAnalytics = service.searchanalytics().query(
        siteUrl=site_url,
        startDate='2024-01-01',
        endDate='2024-12-31',
        dimensions=['page']
    ).execute()
    rows = searchAnalytics.get('rows', [])
    print(f'Проиндексировано страниц: {len(rows)}')
except Exception as e:
    print(f'Аналитика: {e}')
