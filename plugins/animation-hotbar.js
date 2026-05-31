// animation-hotbar.js — Плагин анимации горячей панели

const animationHotbarPlugin = {
    id: 'animation',
    name: 'Animation Hotbar',
    version: '1.0.0',
    author: 'NightMC Team',
    category: 'bronze',
    icon: '✨',
    description: 'Плавная анимация выезжающей панели',
    
    speed: 0.5,
    
    async onLoad(manager) {
        console.log('[Animation] Плагин загружен');
        
        const animSettings = document.getElementById('animSettings');
        if (animSettings) {
            animSettings.style.display = 'block';
        }
        
        this.speed = manager.getData('animation', 'speed', 0.5);
        this.applyAnimation();
    },
    
    applyAnimation() {
        const sideNav = document.querySelector('.side-nav');
        if (sideNav) {
            sideNav.style.transition = `all ${this.speed}s cubic-bezier(0.34, 1.2, 0.64, 1)`;
        }
    },
    
    setSpeed(speed) {
        this.speed = speed;
        this.applyAnimation();
    },
    
    onUnload(manager) {
        const animSettings = document.getElementById('animSettings');
        if (animSettings) {
            animSettings.style.display = 'none';
        }
        // Восстанавливаем стандартную анимацию
        const sideNav = document.querySelector('.side-nav');
        if (sideNav) {
            sideNav.style.transition = 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)';
        }
    }
};

if (window.pluginManager) {
    window.pluginManager.register(animationHotbarPlugin);
}