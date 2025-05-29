import requests
from bs4 import BeautifulSoup
import json

URL = "https://www.cmjh.tn.edu.tw/"
BASE_URL = "https://www.cmjh.tn.edu.tw/"

response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")

announcements = []

# 找到公告區塊 (用你提供的class條件改寫)
news_section = soup.select_one("div.resp-tab-content.vert.resp-tab-content-active")

if news_section:
    # 每條公告是一個 <div style="padding: 8px;"> 
    items = news_section.find_all("div", style=lambda v: v and "padding: 8px" in v)
    
    for div in items:
        # 文本前段是日期，取div內容前面第一段字串，通常格式 YYYY-MM-DD
        text = div.get_text(separator=" ", strip=True)
        # 日期格式 yyyy-mm-dd 在開頭，取前10字
        date_str = text[:10]
        
        # 取 a 標籤，拿標題和連結
        a = div.find("a")
        if not a:
            continue
        title = a.text.strip()
        href = a.get("href")
        url = href if href.startswith("http") else BASE_URL + href.lstrip("/")

        announcements.append({
            "title": title,
            "url": url,
            "date": date_str
        })

with open("data/announcements.json", "w", encoding="utf-8") as f:
    json.dump(announcements, f, ensure_ascii=False, indent=2)

print(f"✔ 成功擷取 {len(announcements)} 筆公告")
