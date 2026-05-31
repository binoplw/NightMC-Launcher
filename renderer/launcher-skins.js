// launcher-skins.js — Система тем для лаунчера (15+ тем с визуальным выбором)
document.addEventListener('DOMContentLoaded', () => {
    console.log('[NightMC] Система тем лаунчера загружена');
    
    // Список всех доступных тем
    const themes = {
        'dark-purple': { name: 'Dark Purple', desc: 'Фиолетовая элегантность', gradient: 'linear-gradient(135deg, #c084fc, #8b5cf6)' },
        'modern-dark': { name: 'Modern Dark', desc: 'Классическая синяя', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
        'neon-green': { name: 'Neon Green', desc: 'Неоновый свет', gradient: 'linear-gradient(135deg, #22c55e, #15803d)' },
        'sunset': { name: 'Sunset', desc: 'Закатная атмосфера', gradient: 'linear-gradient(135deg, #f97316, #c2410c)' },
        'ocean': { name: 'Ocean', desc: 'Глубины океана', gradient: 'linear-gradient(135deg, #06b6d4, #0e7490)' },
        'cherry': { name: 'Cherry Blossom', desc: 'Сакура цветёт', gradient: 'linear-gradient(135deg, #ec4899, #be185d)' },
        'galaxy': { name: 'Midnight Galaxy', desc: 'Космическая бездна', gradient: 'linear-gradient(135deg, #6366f1, #4338ca)' },
        'crimson': { name: 'Crimson Blood', desc: 'Кровавый рассвет', gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
        'golden': { name: 'Golden', desc: 'Золотой блеск', gradient: 'linear-gradient(135deg, #fbbf24, #d97706)' },
        'emerald': { name: 'Emerald', desc: 'Изумрудный лес', gradient: 'linear-gradient(135deg, #10b981, #047857)' },
        'cyberpunk': { name: 'Cyberpunk', desc: 'Неоновые огни', gradient: 'linear-gradient(135deg, #f43f5e, #be123c)' },
        'forest': { name: 'Forest', desc: 'Лесная чаща', gradient: 'linear-gradient(135deg, #84cc16, #4d7c0f)' },
        'lavender': { name: 'Lavender', desc: 'Лавандовые поля', gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
        'winter': { name: 'Winter', desc: 'Зимняя сказка', gradient: 'linear-gradient(135deg, #94a3b8, #475569)' },
        'candy': { name: 'Candy', desc: 'Сладкая вата', gradient: 'linear-gradient(135deg, #f472b6, #db2777)' }
    };
    
    // Загрузка сохранённой темы
    function loadTheme() {
        const savedTheme = localStorage.getItem('nightmc_launcher_theme') || 'dark-purple';
        applyTheme(savedTheme);
        highlightSelectedTheme(savedTheme);
    }
    
    // Применение темы
    function applyTheme(themeId) {
        const body = document.body;
        // Удаляем все классы тем
        body.className = body.className.split(' ').filter(c => !c.startsWith('theme-')).join(' ');
        // Добавляем новую тему
        body.classList.add(`theme-${themeId}`);
        // Сохраняем в localStorage
        localStorage.setItem('nightmc_launcher_theme', themeId);
        
        // Обновляем акцентный цвет в персонализации
        const accentColorMap = {
            'dark-purple': '#c084fc',
            'modern-dark': '#3b82f6',
            'neon-green': '#22c55e',
            'sunset': '#f97316',
            'ocean': '#06b6d4',
            'cherry': '#ec4899',
            'galaxy': '#6366f1',
            'crimson': '#ef4444',
            'golden': '#fbbf24',
            'emerald': '#10b981',
            'cyberpunk': '#f43f5e',
            'forest': '#84cc16',
            'lavender': '#a78bfa',
            'winter': '#94a3b8',
            'candy': '#f472b6'
        };
        
        const accentColorInput = document.getElementById('accentColor');
        if (accentColorInput && accentColorMap[themeId]) {
            accentColorInput.value = accentColorMap[themeId];
        }
        
        addToConsole(`Тема изменена на: ${themes[themeId]?.name || themeId}`, 'success');
        
        // Показываем уведомление
        if (window.showNotification) {
            window.showNotification(`Тема "${themes[themeId]?.name}" применена!`, 'success');
        }
    }
    
    // Подсветка выбранной темы в сетке
    function highlightSelectedTheme(themeId) {
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.theme === themeId) {
                card.classList.add('active');
            }
        });
        
        // Обновляем выпадающий список в персонализации
        const themeSelect = document.getElementById('launcherThemeSelect');
        if (themeSelect) themeSelect.value = themeId;
    }
    
    // Рендер сетки тем
    function renderThemesGrid() {
        const container = document.getElementById('themesGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(themes).forEach(([id, theme]) => {
            const themeCard = document.createElement('div');
            themeCard.className = 'theme-card';
            themeCard.dataset.theme = id;
            themeCard.innerHTML = `
                <div class="theme-preview" data-theme="${id}"></div>
                <div class="theme-name">${theme.name}</div>
                <div class="theme-desc">${theme.desc}</div>
            `;
            themeCard.addEventListener('click', () => {
                applyTheme(id);
                highlightSelectedTheme(id);
            });
            container.appendChild(themeCard);
        });
    }
    
    // Создание страницы выбора тем (если её нет, добавим в персонализацию)
    function createThemesPage() {
        // Проверяем, есть ли уже контейнер для тем
        let themesContainer = document.getElementById('themesGrid');
        
        if (!themesContainer) {
            // Добавляем секцию с темами в персонализацию
            const customizeTab = document.getElementById('customize');
            if (customizeTab) {
                // Находим место для вставки
                const settingsGrid = customizeTab.querySelector('.settings-grid');
                if (settingsGrid) {
                    const themesSection = document.createElement('div');
                    themesSection.style.gridColumn = '1/-1';
                    themesSection.innerHTML = `
                        <h3 style="margin: 20px 0 16px 0;">🎨 Выберите тему лаунчера</h3>
                        <div id="themesGrid" class="themes-picker-grid"></div>
                    `;
                    settingsGrid.parentNode.insertBefore(themesSection, settingsGrid.nextSibling);
                }
            }
        }
        
        renderThemesGrid();
    }
    
    // Инициализация
    function init() {
        loadTheme();
        createThemesPage();
        
        // Обработчик для выпадающего списка в персонализации
        const themeSelect = document.getElementById('launcherThemeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                applyTheme(e.target.value);
                highlightSelectedTheme(e.target.value);
            });
        }
    }
    
    init();
    
    // Экспорт функций
    window.launcherThemes = { applyTheme, loadTheme, themes };
});