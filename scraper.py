import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timedelta
import os

BASE_URL = 'https://www.cmjh.tn.edu.tw/modules/tadnews/index.php'
ANNOUNCEMENTS_URL = f'{BASE_URL}?nsn=&g2p=0'

# 建立資料夾
os.makedirs('data', exist_ok=True)

# 抓網頁
response = requests.get(ANNOUNCEMENTS_URL)
response.encoding = 'utf-8'
soup = BeautifulSoup(response.text, 'html.parser')

# 設定時間篩選
seven_days_ago = datetime.now() - timedelta(days=7)
announcements = []

# 解析公告
for row in soup.select('div.tadnews tbody tr'):
    date_td = row.select_one('td[align="center"]')
    link_td = row.select_one('td a')

    if not date_td or not link_td:
        continue

    title = link_td.text.strip()
    href = link_td['href'].strip()
    url = href if href.startswith('http') else f'https://www.cmjh.tn.edu.tw/{href.lstrip("/")}'

    date_str = date_td.text.strip()
    try:
        post_date = datetime.strptime(date_str, '%Y-%m-%d')
    except:
        continue

    if post_date >= seven_days_ago:
        announcements.append({
            'title': title,
            'date': post_date.strftime('%Y-%m-%d'),
            'url': url
        })

# 儲存成 JSON
with open('data/announcements.json', 'w', encoding='utf-8') as f:
    json.dump(announcements, f, ensure_ascii=False, indent=2)

print(f"✔ 成功擷取 {len(announcements)} 筆公告")
