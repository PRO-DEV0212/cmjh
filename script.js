// -----------------------------
// script.js
// 前端分頁 + 載入 announcements.json
// 每頁顯示 10 筆，分頁按鈕在行政公告標題右邊
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
  { name: "113下學期行事曆", url: "113下學期行事曆.pdf" },
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

// 取得 JSON（加上 cache-buster）
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
      // 建議 date 放 span 有 class，便於樣式與可讀性
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

// 按鈕事件
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) renderPage(currentPage - 1);
});

nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages) renderPage(currentPage + 1);
});

// 工具：滾到公告區（切頁時可選擇是否滾動）
// 目前不自動滾動，只在使用者點 nav 時才滾
function scrollToSection(id){
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
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

// 初始化
loadCommonSites();
loadAnnouncements();
