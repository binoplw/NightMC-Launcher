// languages-pack.js — Плагин мультиязычности

const languagesPackPlugin = {
    id: 'languages',
    name: 'Languages Pack',
    version: '1.0.0',
    author: 'NightMC Team',
    category: 'silver',
    icon: '🌐',
    description: 'Мультиязычный интерфейс (10+ языков)',
    
    currentLang: 'ru',
    
    translations: {
        ru: { play: 'ИГРАТЬ', launch: 'быстрый запуск', guest: 'Гость', unauthorized: 'Не авторизован' },
        en: { play: 'PLAY', launch: 'quick launch', guest: 'Guest', unauthorized: 'Unauthorized' },
        de: { play: 'SPIELEN', launch: 'Schnellstart', guest: 'Gast', unauthorized: 'Nicht autorisiert' },
        fr: { play: 'JOUER', launch: 'lancement rapide', guest: 'Invité', unauthorized: 'Non autorisé' },
        es: { play: 'JUGAR', launch: 'inicio rápido', guest: 'Invitado', unauthorized: 'No autorizado' }
    },
    
    async onLoad(manager) {
        console.log('[Languages] Плагин загружен');
        
        const langSettings = document.getElementById('langSettings');
        if (langSettings) {
            langSettings.style.display = 'block';
        }
        
        this.currentLang = manager.getData('languages', 'current', 'ru');
        this.applyLanguage();
    },
    
    applyLanguage() {
        const t = this.translations[this.currentLang];
        if (!t) return;
        
        // Применяем переводы к элементам
        const playBtn = document.getElementById('playBtn');
        if (playBtn && !playBtn.classList.contains('loading')) {
            playBtn.innerHTML = t.play;
        }
        
        const titleP = document.querySelector('.title p');
        if (titleP) titleP.textContent = t.launch;
        
        const userName = document.getElementById('userName');
        if (userName && userName.innerText === 'Гость') userName.innerText = t.guest;
        
        const userStatus = document.getElementById('userStatus');
        if (userStatus && userStatus.innerText === 'Не авторизован') userStatus.innerText = t.unauthorized;
    },
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.applyLanguage();
        }
    },
    
    onUnload(manager) {
        const langSettings = document.getElementById('langSettings');
        if (langSettings) {
            langSettings.style.display = 'none';
        }
    }
};

if (window.pluginManager) {
    window.pluginManager.register(languagesPackPlugin);
}