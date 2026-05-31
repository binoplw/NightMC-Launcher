// gradient-wallpaper.js — Плагин градиентного фона

const gradientWallpaperPlugin = {
    id: 'gradient',
    name: 'Gradient Wallpaper',
    version: '1.0.0',
    author: 'NightMC Team',
    category: 'silver',
    icon: '🌈',
    description: 'Анимированный градиентный фон с настройкой скорости',
    
    speed: 8,
    enabled: true,
    
    async onLoad(manager) {
        console.log('[Gradient] Плагин загружен');
        
        // Показываем настройки
        const gradientSettings = document.getElementById('gradientSettings');
        if (gradientSettings) {
            gradientSettings.style.display = 'block';
        }
        
        // Загружаем сохранённые настройки
        this.enabled = manager.getData('gradient', 'enabled', true);
        this.speed = manager.getData('gradient', 'speed', 8);
        
        if (this.enabled) {
            this.enable();
        }
    },
    
    enable() {
        const gradientBg = document.getElementById('gradientBg');
        if (gradientBg) {
            gradientBg.classList.add('animate');
            gradientBg.style.animationDuration = `${this.speed}s`;
        }
    },
    
    disable() {
        const gradientBg = document.getElementById('gradientBg');
        if (gradientBg) {
            gradientBg.classList.remove('animate');
        }
    },
    
    setSpeed(speed) {
        this.speed = speed;
        const gradientBg = document.getElementById('gradientBg');
        if (gradientBg && this.enabled) {
            gradientBg.style.animationDuration = `${speed}s`;
        }
    },
    
    onUnload(manager) {
        const gradientSettings = document.getElementById('gradientSettings');
        if (gradientSettings) {
            gradientSettings.style.display = 'none';
        }
        this.disable();
    }
};

if (window.pluginManager) {
    window.pluginManager.register(gradientWallpaperPlugin);
}