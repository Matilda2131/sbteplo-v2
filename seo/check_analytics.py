import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from google.oauth2 import service_account
from googleapiclient.discovery import build

creds = service_account.Credentials.from_service_account_file(
    r'C:\Users\TBG\Desktop\backup_site\google-seo-key.json',
    scopes=['https://www.googleapis.com/auth/analytics.readonly']
)
service = build('analyticsdata', 'v1beta', credentials=creds)

try:
    response = service.properties().runReport(
        property='properties/0',
        body={
            'dateRanges': [{'startDate': '7daysAgo', 'endDate': 'today'}],
            'metrics': [{'name': 'totalUsers'}, {'name': 'sessions'}, {'name': 'pageViews'}]
        }
    ).execute()
    print('Google Analytics:')
    for row in response.get('rows', []):
        vals = row.get('metricValues', [])
        print('  Users:', vals[0].get('value', '0') if len(vals) > 0 else '0')
        print('  Sessions:', vals[1].get('value', '0') if len(vals) > 1 else '0')
        print('  PageViews:', vals[2].get('value', '0') if len(vals) > 2 else '0')
except Exception as e:
    print('Error:', str(e)[:200])
