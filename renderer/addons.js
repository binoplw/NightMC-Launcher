// renderer/addons.js — Аддоны с категориями: Золотые, Серебряные, Бронзовые

const addonsData = {
    golden: [
        { id: 'nightmc-ultimate', name: 'NightMC Ultimate', desc: 'Полный пакет оптимизации + FPS + графика', icon: '👑', version: '2.0.0', downloads: '15.2k' },
        { id: 'hyper-launcher', name: 'Hyper Launcher', desc: 'Ускорение запуска игры до 300%', icon: '⚡', version: '1.5.0', downloads: '8.7k' },
        { id: 'quantum-shaders', name: 'Quantum Shaders', desc: 'Реалистичные шейдеры для любых ПК', icon: '✨', version: '3.0.0', downloads: '12.3k' }
    ],
    silver: [
        { id: 'modrinth-integration', name: 'Modrinth Integration', desc: 'Полная интеграция с Modrinth API', icon: '◉', version: '2.1.0', downloads: '25.1k' },
        { id: 'custom-background', name: 'Custom Background', desc: 'Загрузка своих фото/видео на фон', icon: '🖼️', version: '1.2.0', downloads: '18.4k' },
        { id: 'animation-hotbar', name: 'Animation Hotbar', desc: 'Плавная анимация панелей', icon: '✨', version: '1.0.0', downloads: '9.2k' },
        { id: 'language-pack', name: 'Languages Pack', desc: '20+ языков интерфейса', icon: '🌐', version: '1.0.0', downloads: '11.5k' },
        { id: 'gradient-wallpaper', name: 'Gradient Wallpaper', desc: 'Анимированный градиентный фон', icon: '🌈', version: '1.1.0', downloads: '7.8k' }
    ],
    bronze: [
        { id: 'optimizer', name: 'Performance Optimizer', desc: 'Базовая оптимизация FPS', icon: '⚡', version: '1.0.0', downloads: '45.2k' },
        { id: 'simple-hud', name: 'Simple HUD', desc: 'Отображение FPS и времени', icon: '📊', version: '1.0.0', downloads: '32.1k' },
        { id: 'quick-launch', name: 'Quick Launch', desc: 'Быстрый запуск последней версии', icon: '🚀', version: '1.0.0', downloads: '28.4k' },
        { id: 'screenshot-tool', name: 'Screenshot Tool', desc: 'Быстрые скриншоты с сохранением', icon: '📸', version: '1.0.0', downloads: '15.7k' },
        { id: 'sound-fix', name: 'Sound Fix', desc: 'Исправление звуковых проблем', icon: '🔊', version: '1.0.0', downloads: '12.3k' }
    ]
};

let installedAddons = JSON.parse(localStorage.getItem('nightmc_addons') || '[]');

function saveAddons() {
    localStorage.setItem('nightmc_addons', JSON.stringify(installedAddons));
}

function isAddonInstalled(id) {
    return installedAddons.some(a => a.id === id);
}

function installAddon(addon, category) {
    if (!isAddonInstalled(addon.id)) {
        installedAddons.push({ ...addon, category, installedDate: new Date().toISOString() });
        saveAddons();
        renderAddonsList();
        renderInstalledList();
        notify(`✅ Аддон "${addon.name}" установлен!`);
        return true;
    }
    return false;
}

function uninstallAddon(id) {
    installedAddons = installedAddons.filter(a => a.id !== id);
    saveAddons();
    renderAddonsList();
    renderInstalledList();
    notify(`❌ Аддон удалён`);
}

function renderAddonsList() {
    const container = document.getElementById('addonsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Золотые аддоны (редкие)
    const goldenSection = document.createElement('div');
    goldenSection.className = 'addon-category';
    goldenSection.innerHTML = `<div class="category-header golden"><span>👑 ЗОЛОТЫЕ АДДОНЫ (ОЧЕНЬ РЕДКИЕ)</span><span class="category-count">${addonsData.golden.length}</span></div><div class="addons-category-grid" id="goldenGrid"></div>`;
    container.appendChild(goldenSection);
    
    // Серебряные аддоны (редкие)
    const silverSection = document.createElement('div');
    silverSection.className = 'addon-category';
    silverSection.innerHTML = `<div class="category-header silver"><span>⭐ СЕРЕБРЯНЫЕ АДДОНЫ (РЕДКИЕ)</span><span class="category-count">${addonsData.silver.length}</span></div><div class="addons-category-grid" id="silverGrid"></div>`;
    container.appendChild(silverSection);
    
    // Бронзовые аддоны (обычные)
    const bronzeSection = document.createElement('div');
    bronzeSection.className = 'addon-category';
    bronzeSection.innerHTML = `<div class="category-header bronze"><span>🔧 БРОНЗОВЫЕ АДДОНЫ (ОБЫЧНЫЕ)</span><span class="category-count">${addonsData.bronze.length}</span></div><div class="addons-category-grid" id="bronzeGrid"></div>`;
    container.appendChild(bronzeSection);
    
    // Золотые
    const goldenGrid = document.getElementById('goldenGrid');
    addonsData.golden.forEach(addon => {
        const isInstalled = isAddonInstalled(addon.id);
        goldenGrid.appendChild(createAddonCard(addon, 'golden', isInstalled));
    });
    
    // Серебряные
    const silverGrid = document.getElementById('silverGrid');
    addonsData.silver.forEach(addon => {
        const isInstalled = isAddonInstalled(addon.id);
        silverGrid.appendChild(createAddonCard(addon, 'silver', isInstalled));
    });
    
    // Бронзовые
    const bronzeGrid = document.getElementById('bronzeGrid');
    addonsData.bronze.forEach(addon => {
        const isInstalled = isAddonInstalled(addon.id);
        bronzeGrid.appendChild(createAddonCard(addon, 'bronze', isInstalled));
    });
}

function createAddonCard(addon, category, isInstalled) {
    const card = document.createElement('div');
    card.className = `addon-card ${category}`;
    card.innerHTML = `
        <div class="addon-icon">${addon.icon}</div>
        <div class="addon-info">
            <div class="addon-name">${addon.name}</div>
            <div class="addon-desc">${addon.desc}</div>
            <div class="addon-meta">
                <span>📦 v${addon.version}</span>
                <span>⬇️ ${addon.downloads}</span>
            </div>
        </div>
        <button class="addon-btn ${isInstalled ? 'installed' : ''}" data-id="${addon.id}" data-name="${addon.name}" data-category="${category}">
            ${isInstalled ? '✓ Установлен' : '📥 Установить'}
        </button>
    `;
    
    const btn = card.querySelector('.addon-btn');
    btn.addEventListener('click', () => {
        if (isInstalled) {
            uninstallAddon(addon.id);
        } else {
            installAddon(addon, category);
        }
    });
    
    return card;
}

function renderInstalledList() {
    const container = document.getElementById('installedAddonsList');
    if (!container) return;
    
    if (installedAddons.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет установленных аддонов</div>';
        return;
    }
    
    container.innerHTML = '';
    installedAddons.forEach(addon => {
        const categoryClass = addon.category || 'bronze';
        const div = document.createElement('div');
        div.className = `installed-addon-item ${categoryClass}`;
        div.innerHTML = `
            <div class="installed-addon-icon">${addon.icon || '📦'}</div>
            <div class="installed-addon-info">
                <div class="installed-addon-name">${addon.name}</div>
                <div class="installed-addon-version">v${addon.version}</div>
            </div>
            <button class="installed-addon-remove" data-id="${addon.id}">✕</button>
        `;
        div.querySelector('.installed-addon-remove').addEventListener('click', () => {
            uninstallAddon(addon.id);
        });
        container.appendChild(div);
    });
}

// Экспорт для глобального использования
window.addonsModule = {
    renderAddonsList,
    renderInstalledList,
    isAddonInstalled,
    getInstalledAddons: () => installedAddons
};