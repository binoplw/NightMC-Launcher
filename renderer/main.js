// renderer/main.js — Основной скрипт

// ЧАСТИЦЫ
const canvas = document.getElementById('particlesCanvas');
let ctx = canvas.getContext('2d');
let particles = [];
let particleCount = 40;
let particlesActive = true;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: `rgba(192,132,252,${Math.random() * 0.5 + 0.2})`
        });
    }
}
function animateParticles() {
    if (!ctx || !particlesActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
    }
    requestAnimationFrame(animateParticles);
}
window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
resizeCanvas(); createParticles(); animateParticles();

// УВЕДОМЛЕНИЯ
function notify(msg) {
    const c = document.getElementById('notify');
    const e = document.createElement('div');
    e.className = 'notify-item';
    e.textContent = msg;
    c.appendChild(e);
    setTimeout(() => e.remove(), 2500);
}
function log(msg) {
    const el = document.getElementById('consoleLogs');
    if (el) {
        const e = document.createElement('div');
        e.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        el.appendChild(e);
        el.scrollTop = el.scrollHeight;
    }
}

// УПРАВЛЕНИЕ ОКНОМ
document.getElementById('minimizeBtn')?.addEventListener('click', () => window.nightMC?.minimize?.());
document.getElementById('closeBtn')?.addEventListener('click', () => window.nightMC?.close?.());
document.getElementById('clearConsoleBtn')?.addEventListener('click', () => {
    document.getElementById('consoleLogs').innerHTML = '<div>[NightMC] Консоль очищена</div>';
});

// ЗАПУСК (эмуляция)
const playBtn = document.getElementById('playBtn');
const loadingHotbar = document.getElementById('loadingHotbar');
const loadingFill = document.getElementById('loadingFill');
const loadingPercentText = document.getElementById('loadingPercentText');
const loadingStatusText = document.getElementById('loadingStatusText');
const loadingStageText = document.getElementById('loadingStageText');
const cancelBtn = document.getElementById('cancelDownloadBtn');

let currentDownloadCanceled = false;
let currentDownloadInterval = null;

const stages = [
    { name: 'Инициализация', percent: 0 },
    { name: 'Загрузка манифеста', percent: 5 },
    { name: 'Загрузка версии Minecraft', percent: 15 },
    { name: 'Загрузка клиента (.jar)', percent: 25 },
    { name: 'Загрузка библиотек', percent: 45 },
    { name: 'Загрузка natives (LWJGL)', percent: 60 },
    { name: 'Загрузка ассетов', percent: 75 },
    { name: 'Проверка файлов', percent: 90 },
    { name: 'Запуск игры', percent: 100 }
];

function updateHotbar(percent, status, stageIndex) {
    if (!loadingHotbar.classList.contains('active')) loadingHotbar.classList.add('active');
    loadingFill.style.width = `${percent}%`;
    loadingPercentText.textContent = `${Math.floor(percent)}%`;
    loadingStatusText.textContent = status;
    if (stageIndex !== undefined && stages[stageIndex]) {
        loadingStageText.textContent = `Этап ${stageIndex + 1}/${stages.length} - ${stages[stageIndex].name}`;
    }
    if (percent >= 100) {
        setTimeout(() => loadingHotbar.classList.remove('active'), 2000);
    }
}

function startSimulatedLoading() {
    if (currentDownloadInterval) clearInterval(currentDownloadInterval);
    currentDownloadCanceled = false;
    updateHotbar(0, 'Подготовка к запуску...', 0);
    playBtn.classList.add('loading');
    playBtn.textContent = '⏳ ЗАГРУЗКА...';
    
    let currentStage = 0;
    currentDownloadInterval = setInterval(() => {
        if (currentDownloadCanceled) {
            clearInterval(currentDownloadInterval);
            updateHotbar(0, 'Загрузка отменена', 0);
            setTimeout(() => loadingHotbar.classList.remove('active'), 1000);
            playBtn.classList.remove('loading', 'cancel', 'complete');
            playBtn.textContent = '▶ ИГРАТЬ';
            return;
        }
        if (currentStage < stages.length - 1) {
            currentStage++;
            const stage = stages[currentStage];
            updateHotbar(stage.percent, stage.name, currentStage);
            log(stage.name);
        } else {
            clearInterval(currentDownloadInterval);
            updateHotbar(100, 'Minecraft запущен!', stages.length - 1);
            playBtn.classList.remove('loading');
            playBtn.classList.add('complete');
            playBtn.textContent = '✅ ЗАПУЩЕНО';
            log('Minecraft успешно запущен!');
            notify('Minecraft запущен!');
            setTimeout(() => {
                playBtn.classList.remove('complete');
                playBtn.textContent = '▶ ИГРАТЬ';
            }, 3000);
            if (window.nightMC && window.nightMC.hideToTray) {
                setTimeout(() => window.nightMC.hideToTray(), 1000);
            }
        }
    }, 1500);
}

if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (playBtn.classList.contains('loading')) {
            currentDownloadCanceled = true;
            return;
        }
        const version = document.getElementById('versionSelect')?.value || '1.20.4';
        const loader = document.getElementById('loaderSelect')?.value || 'Vanilla';
        log(`Запуск Minecraft ${version} с загрузчиком ${loader}`);
        startSimulatedLoading();
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        if (currentDownloadInterval) {
            currentDownloadCanceled = true;
            playBtn.classList.remove('loading');
            playBtn.classList.add('cancel');
            playBtn.textContent = '⛔ ОТМЕНЕНО';
            setTimeout(() => {
                playBtn.classList.remove('cancel');
                playBtn.textContent = '▶ ИГРАТЬ';
            }, 2000);
        }
    });
}

// ИМПОРТ
document.getElementById('importBtn')?.addEventListener('click', async () => {
    notify('Импорт из официального лаунчера...');
    if (window.nightMC && window.nightMC.importFromOfficial) {
        const result = await window.nightMC.importFromOfficial();
        notify(result.success ? 'Импорт завершён!' : `Ошибка: ${result.error}`);
    } else {
        notify('Функция импорта временно недоступна');
    }
});

// НОВОСТИ (ПЕРЕТАСКИВАНИЕ)
const newsPanel = document.getElementById('newsPanel');
const newsHeader = document.getElementById('newsHeader');
let isDragging = false;
let dragStartX, dragStartY;
let panelStartX, panelStartY;

if (newsHeader) {
    newsHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('.news-controls')) return;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        panelStartX = newsPanel.offsetLeft;
        panelStartY = newsPanel.offsetTop;
        newsPanel.style.cursor = 'grabbing';
        newsPanel.classList.add('dragging');
        e.preventDefault();
    });
}

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    let newLeft = panelStartX + dx;
    let newTop = panelStartY + dy;
    newLeft = Math.max(10, Math.min(window.innerWidth - newsPanel.offsetWidth - 10, newLeft));
    newTop = Math.max(60, Math.min(window.innerHeight - newsPanel.offsetHeight - 30, newTop));
    newsPanel.style.left = newLeft + 'px';
    newsPanel.style.top = newTop + 'px';
    newsPanel.style.right = 'auto';
    newsPanel.style.bottom = 'auto';
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        newsPanel.style.cursor = '';
        newsPanel.classList.remove('dragging');
        const pos = { left: newsPanel.style.left, top: newsPanel.style.top };
        localStorage.setItem('newsPanelPos', JSON.stringify(pos));
    }
});

const savedPos = localStorage.getItem('newsPanelPos');
if (savedPos) {
    try {
        const pos = JSON.parse(savedPos);
        if (pos.left && pos.top) {
            newsPanel.style.left = pos.left;
            newsPanel.style.top = pos.top;
            newsPanel.style.right = 'auto';
            newsPanel.style.bottom = 'auto';
        }
    } catch(e) {}
}

let isMinimized = false;
const newsListEl = document.getElementById('newsList');
document.getElementById('minimizeNewsBtn')?.addEventListener('click', () => {
    if (isMinimized) {
        newsListEl.style.display = 'block';
        newsPanel.style.width = '320px';
        document.getElementById('minimizeNewsBtn').textContent = '−';
    } else {
        newsListEl.style.display = 'none';
        newsPanel.style.width = 'auto';
        document.getElementById('minimizeNewsBtn').textContent = '+';
    }
    isMinimized = !isMinimized;
});

document.getElementById('closeNewsBtn')?.addEventListener('click', () => {
    newsPanel.style.display = 'none';
    localStorage.setItem('newsPanelClosed', 'true');
});

if (localStorage.getItem('newsPanelClosed') === 'true') {
    newsPanel.style.display = 'none';
    const restoreBtn = document.createElement('div');
    restoreBtn.innerHTML = '📰';
    restoreBtn.style.cssText = 'position:fixed; bottom:60px; right:20px; width:40px; height:40px; background:var(--card); backdrop-filter:blur(20px); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:15; border:1px solid var(--border);';
    restoreBtn.onclick = () => {
        newsPanel.style.display = 'flex';
        restoreBtn.remove();
        localStorage.removeItem('newsPanelClosed');
    };
    document.body.appendChild(restoreBtn);
}

// ВКЛАДКИ
const overlay = document.getElementById('overlay');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.tab-page');
let isClosing = false;

function closeOverlay() {
    if (isClosing) return;
    isClosing = true;
    overlay.classList.add('closing');
    setTimeout(() => { overlay.classList.remove('active', 'closing'); isClosing = false; }, 400);
}

function openPage(pageId) {
    overlay.classList.remove('closing');
    overlay.classList.add('active');
    pages.forEach(p => p.classList.remove('active'));
    const activePage = document.getElementById(pageId + 'Page');
    if (activePage) activePage.classList.add('active');
    log(`Открыта страница: ${pageId}`);
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tabId = item.getAttribute('data-tab');
        if (tabId === 'home') closeOverlay();
        else openPage(tabId);
    });
});

document.getElementById('closeOverlay')?.addEventListener('click', closeOverlay);

// АВТОРИЗАЦИЯ
let currentUser = JSON.parse(localStorage.getItem('nightmc_user') || '{"name":"Гость","type":null}');

function updateUI() {
    document.getElementById('userName').innerText = currentUser.name;
    document.getElementById('userStatus').innerText = currentUser.type ? `${currentUser.type === 'offline' ? 'Offline' : currentUser.type} аккаунт` : 'Не авторизован';
    document.getElementById('logoutBtn').style.display = currentUser.type ? 'inline-block' : 'none';
    const avatar = document.getElementById('userAvatar');
    if (currentUser.type === 'microsoft') avatar.innerHTML = '🪟';
    else if (currentUser.type === 'mojang') avatar.innerHTML = '⛏️';
    else avatar.innerHTML = '🌍';
}

const authModal = document.getElementById('authModal');
document.getElementById('userAvatar')?.addEventListener('click', () => authModal.classList.add('active'));
document.getElementById('closeAuthModal')?.addEventListener('click', () => authModal.classList.remove('active'));

document.querySelectorAll('[data-auth]').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-auth');
        document.getElementById('offlineArea').style.display = 'none';
        if (type === 'offline') {
            document.getElementById('offlineArea').style.display = 'block';
        } else {
            window.nightMC?.openExternal(type === 'microsoft' ? 'https://login.live.com' : 'https://www.minecraft.net/msaprofile');
            currentUser = { name: `${type === 'microsoft' ? 'MicrosoftPlayer' : 'MojangPlayer'}`, type: type };
            localStorage.setItem('nightmc_user', JSON.stringify(currentUser));
            updateUI();
            authModal.classList.remove('active');
            notify(`Вход через ${type}`);
        }
    });
});

document.getElementById('offlineLoginBtn')?.addEventListener('click', () => {
    const nick = document.getElementById('offlineNick').value.trim();
    if (nick) {
        currentUser = { name: nick, type: 'offline' };
        localStorage.setItem('nightmc_user', JSON.stringify(currentUser));
        updateUI();
        authModal.classList.remove('active');
        notify(`Вход как ${nick}`);
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    currentUser = { name: 'Гость', type: null };
    localStorage.removeItem('nightmc_user');
    updateUI();
    notify('Вы вышли');
});

updateUI();

// ТЕМЫ
const themes = { dark: { name: 'Тёмная', class: '' }, light: { name: 'Светлая', class: 'light' }, oled: { name: 'OLED', class: 'oled' } };

function renderThemes() {
    const c = document.getElementById('themesGrid');
    if (!c) return;
    c.innerHTML = '';
    Object.entries(themes).forEach(([key, theme]) => {
        const btn = document.createElement('button');
        btn.className = 'btn-outline';
        btn.style.margin = '4px';
        btn.textContent = theme.name;
        btn.onclick = () => {
            document.body.className = theme.class;
            localStorage.setItem('nightmc_theme', key);
            notify(`Тема ${theme.name}`);
        };
        c.appendChild(btn);
    });
    const saved = localStorage.getItem('nightmc_theme');
    if (saved && themes[saved]) document.body.className = themes[saved].class;
}

renderThemes();

// НАСТРОЙКИ
const ramSlider = document.getElementById('ramSys');
const ramVal = document.getElementById('ramSysVal');
if (ramSlider) ramSlider.addEventListener('input', () => ramVal.innerText = ramSlider.value);

document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    particlesActive = document.getElementById('particlesToggle').checked;
    particleCount = parseInt(document.getElementById('particlesCount').value);
    if (particlesActive) { createParticles(); animateParticles(); }
    else { ctx?.clearRect(0, 0, canvas.width, canvas.height); }
    localStorage.setItem('nightmc_ram', ramSlider?.value || '2048');
    notify('Настройки сохранены');
});

document.getElementById('particlesCount')?.addEventListener('input', (e) => {
    document.getElementById('particlesCountVal').innerText = e.target.value;
});

document.getElementById('uploadBgBtn')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const bgDiv = document.getElementById('customBg');
        bgDiv.innerHTML = '';
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            bgDiv.appendChild(img);
        } else {
            const vid = document.createElement('video');
            vid.src = url;
            vid.autoplay = true;
            vid.loop = true;
            vid.muted = true;
            vid.style.width = '100%';
            vid.style.height = '100%';
            vid.style.objectFit = 'cover';
            bgDiv.appendChild(vid);
            vid.play();
        }
        bgDiv.classList.add('active');
        localStorage.setItem('nightmc_custom_bg', url);
        notify('Фон изменён');
    };
    input.click();
});

document.getElementById('resetBgBtn')?.addEventListener('click', () => {
    document.getElementById('customBg').innerHTML = '';
    document.getElementById('customBg').classList.remove('active');
    localStorage.removeItem('nightmc_custom_bg');
    notify('Фон сброшен');
});

document.getElementById('gradientToggle')?.addEventListener('change', (e) => {
    const gradientBg = document.getElementById('gradientBg');
    if (e.target.checked) gradientBg.classList.add('animate');
    else gradientBg.classList.remove('animate');
});

document.getElementById('gradientSpeed')?.addEventListener('input', (e) => {
    const gradientBg = document.getElementById('gradientBg');
    gradientSpeedVal.innerText = e.target.value + 'с';
    gradientBg.style.animationDuration = e.target.value + 's';
});

document.getElementById('privacyLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    notify('NightMC не собирает личные данные');
});

log('NightMC запущен');
notify('Добро пожаловать в NightMC!');

// Экспорт глобальных функций
window.notify = notify;
window.log = log;