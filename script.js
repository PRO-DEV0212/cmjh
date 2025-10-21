// -----------------------------
// script.js
// 包含：
// - announcements 分頁（每頁 10 筆）
// - theme 切換（淺/深）
// - 行事曆（可切換月份）
// -----------------------------

const ITEMS_PER_PAGE = 10;

let allAnnouncements = []; // 會儲存整個 JSON 的資料
let currentPage = 1;
let totalPages = 1;

// DOM
const announcementContainer = document.getElementById('announcement-list');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// calendar DOM
const monthSelect = document.getElementById('month-select');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const calendarGrid = document.getElementById('calendar-grid');
const calendarEventsList = document.getElementById('calendar-events-list');

// 主題切換（保留並記憶）
const themeToggle = document.getElementById('theme-toggle');
const darkIcon = "深色模式.png";
const lightIcon = "淺色模式.png";

function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.src = darkIcon;
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    themeToggle.src = lightIcon;
    localStorage.setItem('theme', 'light');
  }
}

// 載入並套用 theme（若無則預設 light）
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  if (document.body.classList.contains('dark')) setTheme('light');
  else setTheme('dark');
});

// 載入常用網站
const commonSites = [
  { name: "114上學期行事曆", url: "114學年度第一學期行事曆.pdf" },
  { name: "英聽挑戰", url: "英聽挑戰.pdf" },
  { name: "段考成績查詢", url: "http://120.115.12.4/" },
  { name: "多元學習查詢", url: "https://jhquery.tn.edu.tw/" }
];

function loadCommonSites(){
  const container = document.getElementById('common-list');
  container.innerHTML = '';
  commonSites.forEach(site=>{
    const a = document.createElement('a');
    a.href = site.url;
    a.target = '_blank';
    a.className = 'common-item';
    a.textContent = site.name;
    container.appendChild(a);
  });
}

// -----------------------------
// announcements load & pagination
// -----------------------------
async function loadAnnouncements(){
  try {
    const res = await fetch('data/announcements.json?v=' + Date.now());
    if (!res.ok) throw new Error(`HTTP 錯誤 ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('announcements.json 格式錯誤（應為陣列）');
    }

    allAnnouncements = data;
    totalPages = Math.max(1, Math.ceil(allAnnouncements.length / ITEMS_PER_PAGE));
    currentPage = 1;
    renderPage(currentPage);
  } catch (err) {
    console.error('loadAnnouncements 錯誤:', err);
    announcementContainer.innerHTML = '<p>公告載入失敗，請稍後再試。</p>';
    pageInfo.textContent = '第 0 / 0 頁';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

// render 指定頁面
function renderPage(page) {
  // bounds
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;

  currentPage = page;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = allAnnouncements.slice(start, end);

  // 清空
  announcementContainer.innerHTML = '';

  if (pageItems.length === 0) {
    announcementContainer.innerHTML = '<p>目前沒有公告。</p>';
  } else {
    pageItems.forEach(item => {
      const a = document.createElement('a');
      a.href = item.url || '#';
      a.target = '_blank';
      a.className = 'announcement-item';
      const dateText = item.date ? `<span class="date">${item.date}</span>` : '';
      const titleText = item.title ? item.title : '(無標題)';
      a.innerHTML = `${dateText}${escapeHtml(titleText)}`;
      announcementContainer.appendChild(a);
    });
  }

  // 更新 page info 與按鈕狀態
  pageInfo.textContent = `第 ${currentPage} / ${totalPages} 頁`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

// 防 XSS 的簡單 escape（僅用於 innerHTML 中插入標題）
function escapeHtml(unsafe) {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) renderPage(currentPage - 1);
});
nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages) renderPage(currentPage + 1);
});

// -----------------------------
// calendar
// -----------------------------
// calendarData: 以 YYYY-MM 為 key，陣列內為 { date: 'YYYY-MM-DD', title: '...' }
// 我已根據你貼的行事曆文字把主要事件轉成下列資料（若需微調日期或新增事件我可以修改）
const calendarData = {
  "2025-08": [
    { date: "2025-08-31", title: "8/31 課程日（行事曆起始）" }
  ],
  "2025-09": [
    { date: "2025-09-01", title: "第1學期開學並正式上課" },
    { date: "2025-09-01", title: "發放交通車繳費單" },
    { date: "2025-09-01", title: "技藝教育開訓典禮（第5節會議室）" },
    { date: "2025-09-04", title: "校園登革熱巡查" },
    { date: "2025-09-06", title: "臺南市114年度語文競賽（市分區預賽）" },
    { date: "2025-09-08", title: "第八節、晚自修、本土語、學習扶助開始" },
    { date: "2025-09-08", title: "第一次防災疏散演練" },
    { date: "2025-09-08", title: "社團開始上課（共17次）" },
    { date: "2025-09-09", title: "英聽廣播開始" },
    { date: "2025-09-09", title: "第一次模擬考（9/9-9/10）" },
    { date: "2025-09-12", title: "晨讀讀報" },
    { date: "2025-09-13", title: "臺南市114年度語文競賽（族語決賽）" },
    { date: "2025-09-15", title: "書展（9/15-9/20）" },
    { date: "2025-09-15", title: "第二次防災疏散演練" },
    { date: "2025-09-15", title: "全校性別平等入班宣導（第一節）" },
    { date: "2025-09-17", title: "每週一文開始實施日" },
    { date: "2025-09-19", title: "國家防災日地震避難演練" },
    { date: "2025-09-20", title: "臺南市114年度語文競賽決賽" },
    { date: "2025-09-20", title: "班親會（9/20）" },
    { date: "2025-09-22", title: "第一次段考作文（8:15）" },
    { date: "2025-09-23", title: "校內Scratch預賽" },
    { date: "2025-09-24", title: "數學競賽校內初賽（暫定）" },
    { date: "2025-09-26", title: "教師節活動（9/26）" },
    { date: "2025-09-28", title: "教師節（9/28）" },
    { date: "2025-09-29", title: "教師節彈性放假一天（9/29）" },
    { date: "2025-09-30", title: "第五屆傑出校友推薦截止" }
  ],
  "2025-10": [
    { date: "2025-10-01", title: "三年級運動會報名截止" },
    { date: "2025-10-04", title: "志工大會" },
    { date: "2025-10-06", title: "中秋節放假一天" },
    { date: "2025-10-07", title: "疑似學習障礙學生校內轉介說明會" },
    { date: "2025-10-08", title: "一二年級運動會報名截止" },
    { date: "2025-10-10", title: "國慶日放假一天" },
    { date: "2025-10-13", title: "校慶運動會第二次籌備會" },
    { date: "2025-10-14", title: "第一次段考（10/14-10/15）" },
    { date: "2025-10-16", title: "流感疫苗接種（10/16-10/17）" },
    { date: "2025-10-20", title: "運動會前賽（三年級田賽）" },
    { date: "2025-10-22", title: "尿液初檢 / 法律達人初賽" },
    { date: "2025-10-23", title: "在地產業參訪（2個班）" },
    { date: "2025-10-27", title: "榮譽早餐週（暫定）及運動會前賽(全校徑賽)" },
    { date: "2025-10-30", title: "校內語文競賽（10/30-10/31）" },
    { date: "2025-10-31", title: "法律達人複決賽" },
    { date: "2025-11-01", title: "全民英檢測驗（崇明國中場）" }
  ],
  "2025-11": [
    { date: "2025-11-03", title: "期中教師會議 / 校慶預演 / 運動會前賽" },
    { date: "2025-11-05", title: "尿液複檢" },
    { date: "2025-11-06", title: "校慶預演（第八節停課）" },
    { date: "2025-11-07", title: "第34周年校慶暨運動大會（11/7）" },
    { date: "2025-11-10", title: "第三次課發會" },
    { date: "2025-11-11", title: "英聽挑戰 / 直笛合奏比賽（11/11-11/13）" },
    { date: "2025-11-15", title: "環境知識競賽（全國賽） / 五專綜高家長說明會" },
    { date: "2025-11-16", title: "數學競賽（公私立國民中學）" },
    { date: "2025-11-17", title: "第二次段考作文（8:15）" },
    { date: "2025-11-18", title: "新生抽血檢查（11/18-11/19）" }
  ],
  "2025-12": [
    { date: "2025-12-01", title: "發放交通車繳費單 / 生命教育講座" },
    { date: "2025-12-02", title: "二年級職涯試探活動（12/2-12/5）" },
    { date: "2025-12-05", title: "晨讀讀報" },
    { date: "2025-12-06", title: "國三志願選填家長說明會" },
    { date: "2025-12-08", title: "作業抽查週（12/8-12/12） / 特教宣導月活動" },
    { date: "2025-12-10", title: "新生身體檢查（12/10起）" },
    { date: "2025-12-13", title: "台南市114年國中英語文競賽 / 親職教育講座" },
    { date: "2025-12-15", title: "第四次課發會 / 學扶成長測驗（12/15-12/19）" },
    { date: "2025-12-22", title: "日本水上町交流（12/22） / 周末班停課(校外教學)" },
    { date: "2025-12-24", title: "三年級校外教學行前說明會 / 行憲日放假" },
    { date: "2025-12-25", title: "行憲紀念日放假" },
    { date: "2025-12-29", title: "三年級校外教學（12/29-12/31） / 二年級童軍露營" },
    { date: "2025-12-30", title: "一年級校外教學" }
  ],
  "2026-01": [
    { date: "2026-01-05", title: "第五次課發會 / 本土語&學扶最後實施週" },
    { date: "2026-01-09", title: "第八節最後實施日" },
    { date: "2026-01-10", title: "周末班最後實施日" },
    { date: "2026-01-12", title: "特教生期末IEP會議" },
    { date: "2026-01-14", title: "晚自修最後實施日" },
    { date: "2026-01-15", title: "第三次段考（1/15-1/16）" },
    { date: "2026-01-20", title: "休業式 / 期初校務會議、備課日（午後）" },
    { date: "2026-01-21", title: "第二學期部分調整上課（2/11-2/13調整）" }
  ],
  "2026-02": [
    { date: "2026-02-11", title: "第2學期開學（彈性調整後放假）" },
    { date: "2026-02-14", title: "春節假期開始（2/14-2/20）" },
    { date: "2026-02-20", title: "因小年夜彈性放假（2/20）" },
    { date: "2026-02-23", title: "第2學期正式上課（2/23）" }
  ]
};

// helper: build month options from keys of calendarData (sorted)
const monthKeys = Object.keys(calendarData).sort();

// populate month-select
function buildMonthSelect() {
  monthSelect.innerHTML = '';
  monthKeys.forEach((ym, idx) => {
    const option = document.createElement('option');
    const [y, m] = ym.split('-');
    option.value = ym;
    option.textContent = `${y}年 ${parseInt(m, 10)}月`;
    monthSelect.appendChild(option);
  });
}

// render a month: show weekday headers + date cells + events
function renderCalendar(ym) {
  // parse year-month
  const [year, month] = ym.split('-').map(s => parseInt(s, 10));
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startWeekday = first.getDay(); // 0 Sun - 6 Sat
  const daysInMonth = last.getDate();

  calendarGrid.innerHTML = '';

  // weekday headers (Sun -> Sat)
  const weekdays = ['日','一','二','三','四','五','六'];
  weekdays.forEach(w => {
    const h = document.createElement('div');
    h.className = 'calendar-weekday';
    h.textContent = w;
    calendarGrid.appendChild(h);
  });

  // add blank cells before first day
  for (let i = 0; i < startWeekday; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-cell';
    calendarGrid.appendChild(blank);
  }

  // build events map for the month
  const eventsThisMonth = (calendarData[ym] || []);
  const map = {};
  eventsThisMonth.forEach(ev => {
    const d = ev.date.split('-')[2]; // 'DD'
    const dayNum = parseInt(d, 10);
    if (!map[dayNum]) map[dayNum] = [];
    map[dayNum].push(ev.title);
  });

  // add day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    const dateNum = document.createElement('div');
    dateNum.className = 'date-num';
    dateNum.textContent = d;
    const eventsDiv = document.createElement('div');
    eventsDiv.className = 'events';
    if (map[d]) {
      // show up to 3 events summary inside the cell
      eventsDiv.innerHTML = map[d].slice(0,3).map(t => `• ${escapeHtml(t)}`).join('<br>');
      // clicking the cell will show full events below
      cell.addEventListener('click', () => {
        showEventsList(ym, d);
      });
    } else {
      eventsDiv.textContent = '';
      // clicking empty cell clears list
      cell.addEventListener('click', () => {
        calendarEventsList.innerHTML = `<p> ${year} 年 ${month} 月 ${d} 日 沒有登記事件。</p>`;
      });
    }
    cell.appendChild(dateNum);
    cell.appendChild(eventsDiv);
    calendarGrid.appendChild(cell);
  }

  // if trailing blanks needed to complete grid (not necessary visually, but optional)
  const totalCells = startWeekday + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-cell';
    calendarGrid.appendChild(blank);
  }

  // default: show full list of month events
  showEventsForMonth(ym);
}

// show full events for the given month
function showEventsForMonth(ym) {
  const events = calendarData[ym] || [];
  const [y, m] = ym.split('-');
  if (events.length === 0) {
    calendarEventsList.innerHTML = `<p>${y} 年 ${parseInt(m,10)} 月沒有事件。</p>`;
    return;
  }
  const frag = document.createDocumentFragment();
  const title = document.createElement('div');
  title.innerHTML = `<strong>${y} 年 ${parseInt(m,10)} 月事件 (${events.length})</strong>`;
  frag.appendChild(title);
  const ul = document.createElement('ul');
  events.forEach(ev => {
    const li = document.createElement('li');
    li.textContent = `${ev.date.split('-')[2]} 日 — ${ev.title}`;
    ul.appendChild(li);
  });
  frag.appendChild(ul);
  calendarEventsList.innerHTML = '';
  calendarEventsList.appendChild(frag);
}

// show events for a single day
function showEventsList(ym, day) {
  const events = (calendarData[ym] || []).filter(ev => parseInt(ev.date.split('-')[2],10) === day);
  const [y, m] = ym.split('-');
  if (events.length === 0) {
    calendarEventsList.innerHTML = `<p>${y} 年 ${parseInt(m,10)} 月 ${day} 日沒有事件。</p>`;
    return;
  }
  const frag = document.createDocumentFragment();
  const title = document.createElement('div');
  title.innerHTML = `<strong>${y} 年 ${parseInt(m,10)} 月 ${day} 日 - ${events.length} 件</strong>`;
  frag.appendChild(title);
  const ul = document.createElement('ul');
  events.forEach(ev => {
    const li = document.createElement('li');
    li.textContent = ev.title;
    ul.appendChild(li);
  });
  frag.appendChild(ul);
  calendarEventsList.innerHTML = '';
  calendarEventsList.appendChild(frag);
}

// month navigation
function goToMonthIndex(idx) {
  if (idx < 0) idx = 0;
  if (idx >= monthKeys.length) idx = monthKeys.length - 1;
  monthSelect.selectedIndex = idx;
  renderCalendar(monthKeys[idx]);
}

prevMonthBtn.addEventListener('click', () => {
  goToMonthIndex(monthSelect.selectedIndex - 1);
});
nextMonthBtn.addEventListener('click', () => {
  goToMonthIndex(monthSelect.selectedIndex + 1);
});

monthSelect.addEventListener('change', (e) => {
  const ym = e.target.value;
  renderCalendar(ym);
});

// ================================
// init
// ================================
function initCalendar() {
  buildMonthSelect();
  monthSelect.selectedIndex = 0;
  renderCalendar(monthKeys[0]);
}

function buildMonthSelect() {
  monthSelect.innerHTML = '';
  monthKeys.forEach((ym, idx) => {
    const option = document.createElement('option');
    const [y, m] = ym.split('-');
    option.value = ym;
    option.textContent = `${y}年 ${parseInt(m, 10)}月`;
    monthSelect.appendChild(option);
  });
}

// 防 XSS（與上方相同）
function escapeHtml(unsafe) {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// navbar active 管理
function setActive(e){
  e.preventDefault();
  const links = document.querySelectorAll('nav ul li');
  links.forEach(li => li.classList.remove('active'));
  e.target.parentElement.classList.add('active');
  const id = e.target.getAttribute('href').substring(1);
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: 'smooth' });
}

// scroll helper
function scrollToSection(id){
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// run initial load
loadCommonSites();
loadAnnouncements();
initCalendar();


