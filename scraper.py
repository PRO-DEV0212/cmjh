import requests
from bs4 import BeautifulSoup
import json
import os
from urllib.parse import urljoin

URLS = [
    "https://www.cmjh.tn.edu.tw/modules/tadnews/index.php?ncsn=1&nsn=&tag_sn=&g2p=1",
    "https://www.cmjh.tn.edu.tw/modules/tadnews/index.php?ncsn=1&g2p=2",
    "https://www.cmjh.tn.edu.tw/modules/tadnews/index.php?ncsn=1&g2p=3",
]

OUTPUT_DIR = "data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "announcements.json")

def fetch_page(url):
    """取得單一頁面的 HTML"""
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        resp.encoding = 'utf-8'
        return resp.text
    except requests.RequestException as e:
        print(f"無法取得 {url}: {e}")
        return None

def parse_announcements(html, source_url):
    """解析 HTML 並回傳公告資料"""
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", class_="table-striped")
    if not table:
        print(f"{source_url} 找不到 table")
        return []

    tbody = table.find("tbody")
    if not tbody:
        print(f"{source_url} 找不到 tbody")
        return []

    rows = tbody.find_all("tr")
    announcements = []

    for tr in rows:
        td = tr.find("td")
        if not td:
            continue

        # 取得日期（前10字元，例如 2024-10-01）
        full_text = td.get_text(separator=" ", strip=True)
        date = full_text[:10]

        # 排除 class 含 badge 的 a
        a_tags = [a for a in td.find_all("a") if "badge" not in a.get("class", [])]
        if not a_tags:
            continue

        a_target = a_tags[0]
        title = a_target.text.strip()
        href = a_target.get("href", "")
        url = urljoin(source_url, href)

        announcements.append({
            "date": date,
            "title": title,
            "url": url,
            "source_page": source_url  # 可選：紀錄來源網址
        })

    return announcements

def save_to_file(data, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"總共寫入 {len(data)} 筆公告到 {filepath}")

def main():
    all_announcements = []

    # 按照 URL 順序（頁數小到大）
    for url in URLS:
        print(f"正在擷取：{url}")
        html = fetch_page(url)
        if html:
            page_data = parse_announcements(html, url)
            all_announcements.extend(page_data)

    if all_announcements:
        save_to_file(all_announcements, OUTPUT_FILE)
    else:
        print("沒有抓到任何公告。")

if __name__ == "__main__":
    main()
