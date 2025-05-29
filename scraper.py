import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime

url = "https://www.cmjh.tn.edu.tw/"
res = requests.get(url)
res.encoding = "utf-8"
soup = BeautifulSoup(res.text, "html.parser")

# 建立資料資料夾（如果不存在）
os.makedirs('data', exist_ok=True)

announcements = []

# 找首頁的行政公告區塊
blocks = soup.select("div.block")

for block in blocks:
    title_tag = block.find("div", class_="block_title")
    if title_tag and "行政公告" in title_tag.text:
        # 找到行政公告區塊後抓 ul > li
        items = block.select("ul li")
        for li in items:
            a = li.find("a")
            if not a:
                continue

            title = a.text.strip()
            href = a.get("href", "")
            full_url = href if href.startswith("http") else f"https://www.cmjh.tn.edu.tw/{href.lstrip('/')}"

            # 抓 li 裡的日期，假設在 <span> 或文字中
            date_text = li.text.strip().split()[-1]  # 預設日期在最後
            try:
                date_obj = datetime.strptime(date_text, "%Y-%m-%d")
                date_str = date_obj.strftime("%Y-%m-%d")
            except:
                date_str = "未知日期"

            announcements.append({
                "title": title,
                "date": date_str,
                "url": full_url
            })
        break

# 依照日期排序（新到舊），未知日期排最後
announcements.sort(key=lambda x: x['date'], reverse=True)

# 輸出 JSON，先覆蓋刪除原檔案
with open("data/announcements.json", "w", encoding="utf-8") as f:
    json.dump(announcements, f, ensure_ascii=False, indent=2)

print(f"✔ 成功擷取 {len(announcements)} 筆首頁行政公告")
