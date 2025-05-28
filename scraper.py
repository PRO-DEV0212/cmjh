import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timedelta
import os

BASE_URL = 'https://www.cmjh.tn.edu.tw/modules/tadnews/index.php'
ANNOUNCEMENTS_URL = f'{BASE_URL}?nsn=&g2p=0'

os.makedirs('data', exist_ok=True)

response = requests.get(ANNOUNCEMENTS_URL)
response.encoding = 'utf-8'
soup = BeautifulSoup(response.text, 'html.parser')

seven_days_ago = datetime.now() - timedelta(days=7)
announcements = []

rows = soup.find_all('tr')
for row in rows:
    link = row.find('a')
    date_td = row.find('td', align='center')

    if not link or not date_td:
        continue

    title = link.text.strip()
    href = link.get('href', '')
    url = href if href.startswith('http') else f'https://www.cmjh.tn.edu.tw/{href.lstrip("/")}'

    try:
        post_date = datetime.strptime(date_td.text.strip(), '%Y-%m-%d')
    except:
        continue

    if post_date >= seven_days_ago:
        announcements.append({
            'title': title,
            'date': post_date.strftime('%Y-%m-%d'),
            'url': url
        })

with open('data/announcements.json', 'w', encoding='utf-8') as f:
    json.dump(announcements, f, ensure_ascii=False, indent=2)

print(f"✔ 成功擷取 {len(announcements)} 筆公告")
