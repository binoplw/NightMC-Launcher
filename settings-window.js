// settings-window.js — логика отдельного окна настроек
document.addEventListener('DOMContentLoaded', () => {
    console.log('[NightMC] Окно настроек загружено');
    
    // Переключение категорий
    const categories = document.querySelectorAll('.settings-category');
    const pages = document.querySelectorAll('.settings-page');
    
    categories.forEach(cat => {
        cat.addEventListener('click', () => {
            categories.forEach(c => c.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            cat.classList.add('active');
            const pageId = cat.dataset.page;
            document.getElementById(pageId)?.classList.add('active');
        });
    });
    
    // Закрытие окна
    document.getElementById('closeBtn')?.addEventListener('click', () => {
        if (window.nightMC?.closeSettings) window.nightMC.closeSettings();
    });
    
    // Загрузка всех настроек
    async function loadAllSettings() {
        if (!window.nightMC) return;
        
        const settings = await window.nightMC.getAllSettings();
        
        // Основные
        if (document.getElementById('language')) document.getElementById('language').value = settings.language || 'ru';
        if (document.getElementById('runOnStartup')) document.getElementById('runOnStartup').checked = settings.runOnStartup || false;
        if (document.getElementById('minimizeToTray')) document.getElementById('minimizeToTray').checked = settings.minimizeToTray || false;
        if (document.getElementById('checkUpdates')) document.getElementById('checkUpdates').checked = settings.checkUpdates !== false;
        if (document.getElementById('showNotifications')) document.getElementById('showNotifications').checked = settings.showNotifications !== false;
        
        // Внешний вид
        if (document.getElementById('launcherTheme')) document.getElementById('launcherTheme').value = settings.launcherTheme || 'dark-purple';
        if (document.getElementById('accentColor')) document.getElementById('accentColor').value = settings.accentColor || '#c084fc';
        if (document.getElementById('buttonShape')) document.getElementById('buttonShape').value = settings.buttonShape || 'rounded';
        if (document.getElementById('cardStyle')) document.getElementById('cardStyle').value = settings.cardStyle || 'glass';
        if (document.getElementById('windowOpacity')) {
            document.getElementById('windowOpacity').value = settings.windowOpacity || 1;
            document.getElementById('opacityValue').textContent = `${Math.round((settings.windowOpacity || 1) * 100)}%`;
        }
        if (document.getElementById('animatedBg')) document.getElementById('animatedBg').checked = settings.animatedBg !== false;
        if (document.getElementById('glowEffect')) document.getElementById('glowEffect').checked = settings.glowEffect !== false;
        
        // Анимации
        if (document.getElementById('tabAnimation')) document.getElementById('tabAnimation').value = settings.tabAnimation || 'fade';
        if (document.getElementById('animationSpeed')) {
            document.getElementById('animationSpeed').value = settings.animationSpeed || 0.3;
            document.getElementById('speedValue').textContent = `${settings.animationSpeed || 0.3}с`;
        }
        if (document.getElementById('particlesEnabled')) document.getElementById('particlesEnabled').checked = settings.particlesEnabled !== false;
        if (document.getElementById('particlesCount')) {
            document.getElementById('particlesCount').value = settings.particlesCount || 50;
            document.getElementById('particlesValue').textContent = settings.particlesCount || 50;
        }
        if (document.getElementById('hoverAnimations')) document.getElementById('hoverAnimations').checked = settings.hoverAnimations !== false;
        if (document.getElementById('buttonPulse')) document.getElementById('buttonPulse').checked = settings.buttonPulse !== false;
        
        // Звуки
        if (document.getElementById('soundsEnabled')) document.getElementById('soundsEnabled').checked = settings.soundsEnabled || false;
        if (document.getElementById('soundVolume')) {
            document.getElementById('soundVolume').value = settings.soundVolume || 70;
            document.getElementById('volumeValue').textContent = `${settings.soundVolume || 70}%`;
        }
        
        // Производительность
        if (document.getElementById('hardwareAcceleration')) document.getElementById('hardwareAcceleration').checked = settings.hardwareAcceleration !== false;
        
        // Конфиденциальность
        if (document.getElementById('telemetry')) document.getElementById('telemetry').checked = settings.telemetry || false;
        if (document.getElementById('discordRPC')) document.getElementById('discordRPC').checked = settings.discordRPC || false;
    }
    
    // Сохранение настроек
    async function saveSettings(section) {
        if (!window.nightMC) return;
        
        const settings = {};
        
        if (section === 'general') {
            settings.language = document.getElementById('language')?.value;
            settings.runOnStartup = document.getElementById('runOnStartup')?.checked;
            settings.minimizeToTray = document.getElementById('minimizeToTray')?.checked;
            settings.checkUpdates = document.getElementById('checkUpdates')?.checked;
            settings.showNotifications = document.getElementById('showNotifications')?.checked;
        }
        
        if (section === 'appearance') {
            settings.launcherTheme = document.getElementById('launcherTheme')?.value;
            settings.accentColor = document.getElementById('accentColor')?.value;
            settings.buttonShape = document.getElementById('buttonShape')?.value;
            settings.cardStyle = document.getElementById('cardStyle')?.value;
            settings.windowOpacity = parseFloat(document.getElementById('windowOpacity')?.value);
            settings.animatedBg = document.getElementById('animatedBg')?.checked;
            settings.glowEffect = document.getElementById('glowEffect')?.checked;
        }
        
        if (section === 'animations') {
            settings.tabAnimation = document.getElementById('tabAnimation')?.value;
            settings.animationSpeed = parseFloat(document.getElementById('animationSpeed')?.value);
            settings.particlesEnabled = document.getElementById('particlesEnabled')?.checked;
            settings.particlesCount = parseInt(document.getElementById('particlesCount')?.value);
            settings.hoverAnimations = document.getElementById('hoverAnimations')?.checked;
            settings.buttonPulse = document.getElementById('buttonPulse')?.checked;
        }
        
        if (section === 'sounds') {
            settings.soundsEnabled = document.getElementById('soundsEnabled')?.checked;
            settings.soundVolume = parseInt(document.getElementById('soundVolume')?.value);
        }
        
        if (section === 'performance') {
            settings.hardwareAcceleration = document.getElementById('hardwareAcceleration')?.checked;
        }
        
        if (section === 'privacy') {
            settings.telemetry = document.getElementById('telemetry')?.checked;
            settings.discordRPC = document.getElementById('discordRPC')?.checked;
        }
        
        for (const [key, value] of Object.entries(settings)) {
            await window.nightMC.saveSettings(key, value);
        }
        
        alert('Настройки сохранены!');
    }
    
    // Обработчики ползунков
    document.getElementById('windowOpacity')?.addEventListener('input', (e) => {
        document.getElementById('opacityValue').textContent = `${Math.round(e.target.value * 100)}%`;
    });
    
    document.getElementById('animationSpeed')?.addEventListener('input', (e) => {
        document.getElementById('speedValue').textContent = `${e.target.value}с`;
    });
    
    document.getElementById('particlesCount')?.addEventListener('input', (e) => {
        document.getElementById('particlesValue').textContent = e.target.value;
    });
    
    document.getElementById('soundVolume')?.addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = `${e.target.value}%`;
    });
    
    // Кнопки сохранения
    document.getElementById('saveGeneralBtn')?.addEventListener('click', () => saveSettings('general'));
    document.getElementById('saveAppearanceBtn')?.addEventListener('click', () => saveSettings('appearance'));
    document.getElementById('saveAnimationsBtn')?.addEventListener('click', () => saveSettings('animations'));
    document.getElementById('saveSoundsBtn')?.addEventListener('click', () => saveSettings('sounds'));
    document.getElementById('savePerformanceBtn')?.addEventListener('click', () => saveSettings('performance'));
    document.getElementById('savePrivacyBtn')?.addEventListener('click', () => saveSettings('privacy'));
    
    // Преcеты производительности
    document.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const preset = e.target.dataset.preset;
            if (preset === 'low') {
                if (document.getElementById('hardwareAcceleration')) document.getElementById('hardwareAcceleration').checked = true;
                if (document.getElementById('particlesEnabled')) document.getElementById('particlesEnabled').checked = false;
                if (document.getElementById('animatedBg')) document.getElementById('animatedBg').checked = false;
            } else if (preset === 'high') {
                if (document.getElementById('hardwareAcceleration')) document.getElementById('hardwareAcceleration').checked = true;
                if (document.getElementById('particlesEnabled')) document.getElementById('particlesEnabled').checked = true;
                if (document.getElementById('animatedBg')) document.getElementById('animatedBg').checked = true;
                if (document.getElementById('particlesCount')) document.getElementById('particlesCount').value = 100;
            }
        });
    });
    
    // Профили
    function loadProfiles() {
        const profiles = JSON.parse(localStorage.getItem('nightmc_profiles') || '[]');
        const container = document.getElementById('profilesList');
        if (container) {
            container.innerHTML = profiles.map(p => `
                <div class="setting-row">
                    <div>👤 ${p.name}</div>
                    <button class="preset-btn select-profile" data-name="${p.name}">Выбрать</button>
                </div>
            `).join('');
        }
    }
    
    document.getElementById('addProfileBtn')?.addEventListener('click', () => {
        const name = prompt('Введите имя профиля:');
        if (name) {
            const profiles = JSON.parse(localStorage.getItem('nightmc_profiles') || '[]');
            profiles.push({ name, created: new Date().toISOString() });
            localStorage.setItem('nightmc_profiles', JSON.stringify(profiles));
            loadProfiles();
        }
    });
    
    document.getElementById('viewOnGitHub')?.addEventListener('click', () => {
        if (window.nightMC) window.nightMC.openExternal('https://github.com/');
    });
    
    document.getElementById('viewWebsite')?.addEventListener('click', () => {
        if (window.nightMC) window.nightMC.openExternal('https://nightmc.example.com');
    });
    
    loadAllSettings();
    loadProfiles();
});