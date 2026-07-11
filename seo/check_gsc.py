import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from google.oauth2 import service_account
from googleapiclient.discovery import build

creds = service_account.Credentials.from_service_account_file(
    r'C:\Users\TBG\Desktop\backup_site\google-seo-key.json',
    scopes=['https://www.googleapis.com/auth/webmasters.readonly']
)
service = build('searchconsole', 'v1', credentials=creds)

print('=== GOOGLE SEARCH CONSOLE ===')

# Проверяем список сайтов
sites = service.sites().list().execute()
for s in sites.get('siteEntry', []):
    print(f'Сайт: {s.get("siteUrl")} ({s.get("permissionLevel")})')
