window.addEventListener('load', () => {
  setTimeout(() => {
    const welcome = document.getElementById('welcome-screen');
    welcome.classList.add('hidden');
    document.querySelector('main').style.opacity = '1';
  }, 2000);
});

const themeToggle = document.getElementById('theme-toggle');
const darkIcon = "深色模式.png";
const lightIcon = "淺色模式.png";

function setTheme(theme) {
  if(theme === 'dark'){
    document.body.classList.add('dark');
    themeToggle.src = darkIcon;
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    themeToggle.src = lightIcon;
    localStorage.setItem('theme', 'light');
  }
}

// 強制預設為淺色（忽略 localStorage）
setTheme('light');

themeToggle.addEventListener('click', () => {
  if(document.body.classList.contains('dark')){
    setTheme('light');
  } else {
    setTheme('dark');
  }
});

function setActive(e){
  e.preventDefault();
  const links = document.querySelectorAll('nav ul li');
  links.forEach(li => li.classList.remove('active'));
  e.target.parentElement.classList.add('active');
  const id = e.target.getAttribute('href').substring(1);
  document.getElementById(id).scrollIntoView({behavior: 'smooth'});
}

function scrollToSection(id){
  document.getElementById(id).scrollIntoView({behavior: 'smooth'});
}

async function loadAnnouncements(){
  try {
    const res = await fetch('data/announcements.json');
    if(!res.ok) throw new Error(`HTTP錯誤 ${res.status}`);
    const data = await res.json();
    const container = document.getElementById('announcement-list');
    container.innerHTML = '';
    data.forEach(item => {
      const a = document.createElement('a');
      a.href = item.url;
      a.target = '_blank';
      a.className = 'announcement-item';
      a.setAttribute('data-title', item.title);
      a.innerHTML = `<span class="date">${item.date}</span>${item.title}`;
      container.appendChild(a);
    });
  } catch(err) {
    const container = document.getElementById('announcement-list');
    container.innerHTML = '<p>公告載入失敗，請稍後再試。</p>';
  }
}

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

loadAnnouncements();
loadCommonSites();