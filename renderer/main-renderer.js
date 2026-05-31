// main-renderer.js
const canvas = document.getElementById('particlesCanvas');
let ctx = canvas.getContext('2d');
let particles = [];
let particleCount = 40;
let animating = true;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1, speedX: (Math.random() - 0.5) * 1, speedY: (Math.random() - 0.5) * 1,
            color: `rgba(192, 132, 252, ${Math.random() * 0.5 + 0.2})`
        });
    }
}
function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of particles) {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
    }
    requestAnimationFrame(animateParticles);
}
window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
resizeCanvas(); createParticles(); animateParticles();

function notify(msg) { const c = document.getElementById('notify'); const e = document.createElement('div'); e.className = 'notify-item'; e.textContent = msg; c.appendChild(e); setTimeout(() => e.remove(), 3000); }
function log(msg, type = 'info') { const el = document.getElementById('consoleLogs'); if (el) { const e = document.createElement('div'); e.className = `log ${type}`; e.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`; el.appendChild(e); el.scrollTop = el.scrollHeight; } }

document.getElementById('clearConsole')?.addEventListener('click', () => { document.getElementById('consoleLogs').innerHTML = '<div class="log">[NightMC] Консоль очищена</div>'; });

const navItems = document.querySelectorAll('.nav-item');
const tabs = document.querySelectorAll('.tab');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tabId = item.getAttribute('data-tab');
        navItems.forEach(n => n.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        log(`Переключено на: ${tabId}`, 'info');
    });
});

document.getElementById('minimizeBtn')?.addEventListener('click', () => window.nightMC?.minimize?.() || log('Минимизация', 'info'));
document.getElementById('closeBtn')?.addEventListener('click', () => window.nightMC?.close?.() || log('Закрытие', 'info'));

const ramHome = document.getElementById('ramHome');
const ramValueHome = document.getElementById('ramValueHome');
ramHome?.addEventListener('input', () => ramValueHome.innerText = (ramHome.value / 1024).toFixed(1) + ' GB');

const ramSys = document.getElementById('ramSys');
const ramSysVal = document.getElementById('ramSysVal');
ramSys?.addEventListener('input', () => ramSysVal.innerText = ramSys.value);

document.getElementById('playBtn')?.addEventListener('click', () => { notify('Запуск Minecraft...'); log('Запуск игры', 'info'); setTimeout(() => { notify('Minecraft запущен!'); log('Игра запущена', 'success'); }, 1500); });

const modal = document.getElementById('authModal');
document.getElementById('planetAvatar')?.addEventListener('click', () => modal.classList.add('active'));
document.getElementById('closeModal')?.addEventListener('click', () => modal.classList.remove('active'));
document.querySelectorAll('.auth-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
        const type = opt.getAttribute('data-auth');
        if (type === 'offline') { document.getElementById('offlineArea').style.display = 'block'; }
        else {
            document.getElementById('offlineArea').style.display = 'none';
            let user = type === 'microsoft' ? { name: 'MicrosoftPlayer', status: 'Microsoft account' } : { name: 'MojangPlayer', status: 'Mojang account' };
            document.getElementById('userName').innerText = user.name;
            document.getElementById('userStatus').innerText = user.status;
            document.getElementById('userNote').innerHTML = type === 'microsoft' ? 'Microsoft аккаунт' : 'Mojang аккаунт';
            document.getElementById('planetAvatar').innerHTML = type === 'microsoft' ? '🪟' : '⛏️';
            modal.classList.remove('active');
            notify(`Вход через ${type} выполнен!`);
            log(`Авторизация через ${type}`, 'success');
        }
    });
});
document.getElementById('offlineLoginBtn')?.addEventListener('click', () => {
    const nick = document.getElementById('offlineNick').value.trim();
    if (nick) {
        document.getElementById('userName').innerText = nick;
        document.getElementById('userStatus').innerText = 'Offline режим';
        document.getElementById('userNote').innerHTML = 'Оффлайн режим';
        document.getElementById('planetAvatar').innerHTML = '🌍';
        modal.classList.remove('active');
        notify(`Вход выполнен как ${nick}`);
        log(`Оффлайн вход: ${nick}`, 'success');
    } else notify('Введите никнейм!');
});

document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    const enabled = document.getElementById('particlesToggle').checked;
    if (!enabled) ctx?.clearRect(0, 0, canvas.width, canvas.height);
    particleCount = parseInt(document.getElementById('particlesCount').value);
    createParticles();
    notify('Настройки сохранены!');
    log('Настройки сохранены', 'success');
});
document.getElementById('particlesCount')?.addEventListener('input', (e) => document.getElementById('particlesCountVal').innerText = e.target.value);
document.getElementById('animSpeed')?.addEventListener('input', (e) => document.getElementById('animSpeedVal').innerText = e.target.value + 'с');

document.getElementById('openDevTools')?.addEventListener('click', () => log('DevTools: Ctrl+Shift+I', 'info'));
document.getElementById('resetAll')?.addEventListener('click', () => { if(confirm('Сбросить всё?')) { localStorage.clear(); notify('Сброшено!'); setTimeout(() => location.reload(), 1000); } });
document.getElementById('exportBackup')?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ date: new Date().toISOString() })], {type:'application/json'}));
    a.download = `nightmc_backup_${Date.now()}.json`;
    a.click();
    notify('Бэкап создан!');
});

window.notify = notify;
window.log = log;