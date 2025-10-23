// -----------------------------
// script.js
// 包含：
// - 公告分頁（每頁 10 筆）
// - 主題切換（淺/深模式）
// - 常用網站列表
// - 行事曆（自動跳到當前月份＋今日高亮）
// -----------------------------

const ITEMS_PER_PAGE = 10;
let allAnnouncements = [];
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

// -----------------------------
// 主題切換（保留並記憶）
// -----------------------------
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

const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  if (document.body.classList.contains('dark')) setTheme('light');
  else setTheme('dark');
});

// -----------------------------
// 常用網站
// -----------------------------
const commonSites = [
  { name: "114上學期行事曆", url: "114學年度第一學期行事曆.pdf" },
  { name: "英聽挑戰", url: "英聽挑戰.pdf" },
  { name: "段考成績查詢", url: "http://120.115.12.4/" },
  { name: "多元學習查詢", url: "https://jhquery.tn.edu.tw/" }
];

function loadCommonSites() {
  const container = document.getElementById('common-list');
  container.innerHTML = '';
  commonSites.forEach(site => {
    const a = document.createElement('a');
    a.href = site.url;
    a.target = '_blank';
    a.className = 'common-item';
    a.textContent = site.name;
    container.appendChild(a);
  });
}

// -----------------------------
// 公告載入與分頁
// -----------------------------
async function loadAnnouncements() {
  try {
    const res = await fetch('data/announcements.json?v=' + Date.now());
    if (!res.ok) throw new Error(`HTTP 錯誤 ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('announcements.json 格式錯誤（應為陣列）');
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

function renderPage(page) {
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = allAnnouncements.slice(start, end);

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

  pageInfo.textContent = `第 ${currentPage} / ${totalPages} 頁`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) renderPage(currentPage - 1);
});
nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages) renderPage(currentPage + 1);
});

// -----------------------------
// 防 XSS escapeHtml
// -----------------------------
function escapeHtml(unsafe) {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// -----------------------------
// 行事曆 (自動跳到當前月份 + 今日高亮)
// -----------------------------
let calendarData = {};
let monthKeys = [];

async function loadCalendar() {
  try {
    const res = await fetch('data/calendar.json?v=' + Date.now());
    if (!res.ok) throw new Error(`HTTP 錯誤 ${res.status}`);
    const data = await res.json();
    calendarData = data;
    monthKeys = Object.keys(calendarData).sort();
    initCalendar();
  } catch (err) {
    console.error('行事曆載入失敗:', err);
    calendarGrid.innerHTML = '<p>行事曆載入失敗。</p>';
    calendarEventsList.innerHTML = '';
  }
}

function buildMonthSelect() {
  monthSelect.innerHTML = '';
  monthKeys.forEach(ym => {
    const [y, m] = ym.split('-');
    const option = document.createElement('option');
    option.value = ym;
    option.textContent = `${y}年 ${parseInt(m, 10)}月`;
    monthSelect.appendChild(option);
  });
}

function renderCalendar(ym) {
  const [year, month] = ym.split('-').map(s => parseInt(s, 10));
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const today = new Date();

  calendarGrid.innerHTML = '';

  const weekdays = ['日','一','二','三','四','五','六'];
  weekdays.forEach(w => {
    const h = document.createElement('div');
    h.className = 'calendar-weekday';
    h.textContent = w;
    calendarGrid.appendChild(h);
  });

  for (let i = 0; i < startWeekday; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-cell';
    calendarGrid.appendChild(blank);
  }

  const eventsThisMonth = (calendarData[ym] || []);
  const map = {};
  eventsThisMonth.forEach(ev => {
    const d = ev.date.split('-')[2];
    const dayNum = parseInt(d, 10);
    if (!map[dayNum]) map[dayNum] = [];
    map[dayNum].push(ev.title);
  });

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    const dateNum = document.createElement('div');
    dateNum.className = 'date-num';
    dateNum.textContent = d;

    const eventsDiv = document.createElement('div');
    eventsDiv.className = 'events';
    if (map[d]) {
      eventsDiv.innerHTML = map[d].slice(0,3).map(t => `• ${escapeHtml(t)}`).join('<br>');
      cell.addEventListener('click', () => showEventsList(ym, d));
    } else {
      cell.addEventListener('click', () => {
        calendarEventsList.innerHTML = `<p>${year} 年 ${month} 月 ${d} 日 沒有登記事件。</p>`;
      });
    }

    // ✅ 今日高亮
    if (
      year === today.getFullYear() &&
      month === today.getMonth() + 1 &&
      d === today.getDate()
    ) {
      cell.classList.add('today');
    }

    cell.appendChild(dateNum);
    cell.appendChild(eventsDiv);
    calendarGrid.appendChild(cell);
  }

  const totalCells = startWeekday + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-cell';
    calendarGrid.appendChild(blank);
  }

  showEventsForMonth(ym);
}

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

function initCalendar() {
  buildMonthSelect();

  const today = new Date();
  const currentYM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const currentIndex = monthKeys.indexOf(currentYM);

  if (currentIndex !== -1) {
    monthSelect.selectedIndex = currentIndex;
    renderCalendar(monthKeys[currentIndex]);
  } else {
    // 若沒有當月，顯示最近月份
    monthSelect.selectedIndex = monthKeys.length - 1;
    renderCalendar(monthKeys[monthKeys.length - 1]);
  }
}

prevMonthBtn.addEventListener('click', () => {
  if (monthSelect.selectedIndex > 0) {
    monthSelect.selectedIndex -= 1;
    renderCalendar(monthKeys[monthSelect.selectedIndex]);
  }
});
nextMonthBtn.addEventListener('click', () => {
  if (monthSelect.selectedIndex < monthKeys.length - 1) {
    monthSelect.selectedIndex += 1;
    renderCalendar(monthKeys[monthSelect.selectedIndex]);
  }
});
monthSelect.addEventListener('change', (e) => renderCalendar(e.target.value));

// -----------------------------
// navbar active 管理
// -----------------------------
function setActive(e){
  e.preventDefault();
  const links = document.querySelectorAll('nav ul li');
  links.forEach(li => li.classList.remove('active'));
  e.target.parentElement.classList.add('active');
  const id = e.target.getAttribute('href').substring(1);
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: 'smooth' });
}

function scrollToSection(id){
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// -----------------------------
// init
// -----------------------------
loadCommonSites();
loadAnnouncements();
loadCalendar();
