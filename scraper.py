import requests
from bs4 import BeautifulSoup
import json
import os

URL = "https://www.cmjh.tn.edu.tw/modules/tadnews/index.php?g2p=0&ncsn=1&nsn=&tag_sn="
OUTPUT_DIR = "data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "announcements.json")

def scrape_announcements():
    print("開始擷取公告...")
    resp = requests.get(URL)
    resp.encoding = 'utf-8'
    soup = BeautifulSoup(resp.text, "html.parser")

    table = soup.find("table", class_="table-striped")
    if not table:
        print("找不到目標 table")
        return []

    tbody = table.find("tbody")
    if not tbody:
        print("找不到 tbody")
        return []

    rows = tbody.find_all("tr")
    print(f"找到 {len(rows)} 筆列")

    announcements = []

    for idx, tr in enumerate(rows, 1):
        td = tr.find("td")
        if not td:
            print(f"第 {idx} 行沒有 td，跳過")
            continue

        full_text = td.get_text(separator=" ", strip=True)
        date = full_text[:10]

        # 排除 class 含 badge 的 a 標籤
        a_tags = [a for a in td.find_all("a") if "badge" not in a.get("class", [])]

        if not a_tags:
            print(f"第 {idx} 行沒有非 badge 的 <a>，跳過")
            continue

        a_target = a_tags[0]
        title = a_target.text.strip()
        href = a_target.get("href", "")
        url = href if href.startswith("http") else "https://www.cmjh.tn.edu.tw/" + href.lstrip("/")

        announcement = {
            "date": date,
            "title": title,
            "url": url,
        }
        print(f"第 {idx} 行抓到公告: {announcement}")
        announcements.append(announcement)

    return announcements

def save_to_file(data, filepath):
    # 確保目錄存在
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"已寫入 {len(data)} 筆公告到 {filepath}")

def main():
    announcements = scrape_announcements()
    if announcements:
        save_to_file(announcements, OUTPUT_FILE)
    else:
        print("沒有抓到任何公告，不寫入檔案。")

if __name__ == "__main__":
    main()
