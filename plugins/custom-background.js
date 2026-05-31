// custom-background.js — Плагин кастомного фона

const customBackgroundPlugin = {
    id: 'custombg',
    name: 'Custom Background',
    version: '1.0.0',
    author: 'NightMC Team',
    category: 'silver',
    icon: '🖼️',
    description: 'Загрузка своих фото/видео на фон лаунчера',
    
    async onLoad(manager) {
        console.log('[CustomBG] Плагин загружен');
        
        // Показываем настройки в разделе настроек
        const bgSettings = document.getElementById('bgSettings');
        if (bgSettings) {
            bgSettings.style.display = 'block';
        }
        
        // Загружаем сохранённый фон
        const savedBg = localStorage.getItem('nightmc_custom_bg');
        if (savedBg) {
            this.applyBackground(savedBg);
        }
    },
    
    applyBackground(url) {
        const bgDiv = document.getElementById('customBg');
        if (bgDiv) {
            bgDiv.innerHTML = '';
            if (url.startsWith('blob:') || url.startsWith('data:')) {
                const img = document.createElement('img');
                img.src = url;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                bgDiv.appendChild(img);
                bgDiv.classList.add('active');
            } else {
                const video = document.createElement('video');
                video.src = url;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                bgDiv.appendChild(video);
                video.play();
                bgDiv.classList.add('active');
            }
        }
    },
    
    clearBackground() {
        const bgDiv = document.getElementById('customBg');
        if (bgDiv) {
            bgDiv.innerHTML = '';
            bgDiv.classList.remove('active');
        }
        localStorage.removeItem('nightmc_custom_bg');
    },
    
    async uploadBackground(file) {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(file);
            this.applyBackground(url);
            localStorage.setItem('nightmc_custom_bg', url);
            resolve({ success: true });
        });
    },
    
    onUnload(manager) {
        const bgSettings = document.getElementById('bgSettings');
        if (bgSettings) {
            bgSettings.style.display = 'none';
        }
        this.clearBackground();
    }
};

if (window.pluginManager) {
    window.pluginManager.register(customBackgroundPlugin);
}