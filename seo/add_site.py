import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from google.oauth2 import service_account
from googleapiclient.discovery import build

creds = service_account.Credentials.from_service_account_file(
    r'C:\Users\TBG\Desktop\backup_site\google-seo-key.json',
    scopes=['https://www.googleapis.com/auth/webmasters']
)
service = build('searchconsole', 'v1', credentials=creds)

site_url = 'https://matilda2131.github.io/sbteplo-v2/'
try:
    service.sites().add(siteUrl=site_url).execute()
    print('Сайт добавлен!')
except Exception as e:
    print(f'Ошибка: {e}')

sites = service.sites().list().execute()
for s in sites.get('siteEntry', []):
    print('Сайт:', s.get('siteUrl'), '(' + s.get('permissionLevel', '') + ')')
