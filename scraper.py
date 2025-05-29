import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

URL = "https://www.cmjh.tn.edu.tw/"
BASE_URL = "https://www.cmjh.tn.edu.tw/"

response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")

announcements = []

news_section = soup.select_one("div#tadnews")
if news_section:
    items = news_section.select("li")
    for li in items:
        a = li.find("a")
        if not a:
            continue
        title = a.text.strip()
        href = a["href"]
        url = href if href.startswith("http") else BASE_URL + href.lstrip("/")
        date = datetime.today().strftime("%Y-%m-%d")

        announcements.append({
            "title": title,
            "url": url,
            "date": date
        })

with open("data/announcements.json", "w", encoding="utf-8") as f:
    json.dump(announcements, f, ensure_ascii=False, indent=2)

print(f"✔ 成功擷取 {len(announcements)} 筆公告")
