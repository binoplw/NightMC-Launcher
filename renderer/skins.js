// skins.js — Система скинов для NightMC
document.addEventListener('DOMContentLoaded', () => {
    console.log('[NightMC] Система скинов загружена');
    
    // Доступные скины
    const skins = {
        'dark-purple': 'skin-dark-purple',
        'modern-dark': 'skin-modern-dark',
        'neon-green': 'skin-neon-green',
        'sunset': 'skin-sunset',
        'ocean': 'skin-ocean'
    };
    
    // Загрузить сохранённый скин
    function loadSkin() {
        const savedSkin = localStorage.getItem('nightmc_skin') || 'dark-purple';
        const skinClass = skins[savedSkin];
        if (skinClass) {
            document.body.className = skinClass;
            highlightSelectedSkin(savedSkin);
            console.log(`[NightMC] Скин загружен: ${savedSkin}`);
        }
    }
    
    // Подсветить выбранный скин в интерфейсе
    function highlightSelectedSkin(skinName) {
        document.querySelectorAll('.skin-card').forEach(card => {
            card.style.border = '1px solid var(--border-glass)';
            if (card.dataset.skin === skinName) {
                card.style.border = `2px solid var(--accent)`;
                card.style.background = 'var(--accent-glow)';
            } else {
                card.style.background = '';
            }
        });
    }
    
    // Применить скин
    function applySkin(skinName) {
        const skinClass = skins[skinName];
        if (skinClass) {
            document.body.className = skinClass;
            localStorage.setItem('nightmc_skin', skinName);
            highlightSelectedSkin(skinName);
            
            // Уведомление
            if (window.showNotification) {
                window.showNotification(`Скин "${skinName}" применён!`, 'success');
            }
            addToConsole(`Скин изменён на: ${skinName}`, 'success');
        }
    }
    
    // Навесить обработчики на карточки скинов
    function initSkinCards() {
        const skinCards = document.querySelectorAll('.skin-card');
        skinCards.forEach(card => {
            card.addEventListener('click', () => {
                const skinName = card.dataset.skin;
                if (skinName) {
                    applySkin(skinName);
                }
            });
        });
        
        // Кнопка "Применить скин" если есть
        const saveSkinBtn = document.getElementById('saveSkinBtn');
        if (saveSkinBtn) {
            saveSkinBtn.addEventListener('click', () => {
                const selectedSkin = localStorage.getItem('nightmc_skin') || 'dark-purple';
                applySkin(selectedSkin);
            });
        }
    }
    
    // Загружаем скин при старте
    loadSkin();
    
    // Ждём появления карточек
    setTimeout(initSkinCards, 100);
    
    // Экспорт функции для других скриптов
    window.applySkin = applySkin;
});