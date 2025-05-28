import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timedelta

url = 'https://www.cmjh.tn.edu.tw/news.php?class=1'

response = requests.get(url)
response.encoding = 'utf-8'

soup = BeautifulSoup(response.text, 'html.parser')

announcements = []
seven_days_ago = datetime.now() - timedelta(days=7)

for tr in soup.select('table.news_list tr'):
    a_tag = tr.select_one('a')
    date_td = tr.select_one('td.date')

    if a_tag and date_td:
        title = a_tag.text.strip()
        href = a_tag['href']
        date_str = date_td.text.strip()

        try:
            post_date = datetime.strptime(date_str, '%Y-%m-%d')
        except:
            continue

        if post_date >= seven_days_ago:
            if not href.startswith('http'):
                href = 'https://www.cmjh.tn.edu.tw/' + href.lstrip('/')
            announcements.append({
                'title': title,
                'date': date_str,
                'url': href
            })

with open('data/announcements.json', 'w', encoding='utf-8') as f:
    json.dump(announcements, f, ensure_ascii=False, indent=2)
