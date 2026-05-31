// renderer/news.js — Новости лаунчера

const newsData = [
    {
        id: 1,
        title: "NightMC v5.0 - Полный редизайн!",
        date: "15 марта 2025",
        image: "🎉",
        content: "<p>Мы полностью переработали лаунчер! Теперь он стал ещё красивее и удобнее.</p><p>✨ Что нового:</p><ul><li>Новый минималистичный дизайн</li><li>Плавные анимации</li><li>6 новых аддонов</li><li>Интеграция с Modrinth</li><li>Система сборок модов</li></ul><p>Обновляйтесь и наслаждайтесь игрой с NightMC!</p>",
        important: true
    },
    {
        id: 2,
        title: "Добавлен аддон Modrinth",
        date: "10 марта 2025",
        image: "📦",
        content: "<p>Теперь вы можете устанавливать моды прямо из лаунчера!</p><p>📦 Функции аддона:</p><ul><li>Поиск модов на Modrinth</li><li>Фильтрация по популярности, новизне</li><li>Установка и удаление модов</li><li>Создание сборок модов</li></ul><p>Установите аддон в разделе 'Аддоны' и пользуйтесь!</p>",
        important: false
    },
    {
        id: 3,
        title: "Новая система сборок",
        date: "5 марта 2025",
        image: "📁",
        content: "<p>Создавайте свои сборки модов и делитесь ими с друзьями!</p><p>📁 Как это работает:</p><ul><li>Установите понравившиеся моды</li><li>Нажмите 'Новая сборка'</li><li>Дайте название сборке</li><li>Сборка сохранится и будет доступна в любой момент</li></ul><p>Вы можете быстро переключаться между сборками.</p>",
        important: false
    },
    {
        id: 4,
        title: "Анимации и эффекты",
        date: "1 марта 2025",
        image: "✨",
        content: "<p>Лаунчер стал ещё красивее!</p><p>✨ Добавлено:</p><ul><li>Плавная анимация выезжающей панели</li><li>Эффект 'капельки' при нажатии</li><li>Эффект 'огня' при быстрых нажатиях</li><li>Motion Blur для новостей</li><li>Анимированные частицы на фоне</li></ul><p>Настройте анимации в разделе 'Настройки' → 'Animation Hotbar'</p>",
        important: false
    },
    {
        id: 5,
        title: "Оптимизация производительности",
        date: "25 февраля 2025",
        image: "⚡",
        content: "<p>Мы улучшили производительность лаунчера!</p><p>⚡ Что изменилось:</p><ul><li>Ускорение загрузки на 40%</li><li>Меньше потребление RAM</li><li>Оптимизация анимаций</li><li>Быстрый запуск игры</li></ul>",
        important: false
    },
    {
        id: 6,
        title: "Новогоднее обновление",
        date: "25 декабря 2024",
        image: "🎄",
        content: "<p>Праздничное обновление лаунчера!</p><p>🎄 Что добавлено:</p><ul><li>Праздничная тема оформления</li><li>Снежинки на фоне</li><li>Подарки и скидки на аддоны</li></ul>",
        important: false
    }
];

let currentNewsModal = null;

function renderNews() {
    const container = document.getElementById('newsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    newsData.forEach(news => {
        const newsItem = document.createElement('div');
        newsItem.className = `news-item ${news.important ? 'important' : ''}`;
        newsItem.innerHTML = `
            <div class="news-item-icon">${news.image}</div>
            <div class="news-item-content">
                <div class="news-item-title">${news.title}</div>
                <div class="news-item-date">📅 ${news.date}</div>
                <div class="news-item-preview">${news.content.replace(/<[^>]*>/g, '').substring(0, 100)}...</div>
            </div>
        `;
        newsItem.addEventListener('click', () => showNewsDetail(news));
        container.appendChild(newsItem);
    });
}

function showNewsDetail(news) {
    if (currentNewsModal) currentNewsModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    modal.innerHTML = `
        <div class="news-modal-content">
            <div class="news-modal-header">
                <div class="news-modal-icon">${news.image}</div>
                <div class="news-modal-title">${news.title}</div>
                <button class="news-modal-close">✕</button>
            </div>
            <div class="news-modal-date">📅 ${news.date}</div>
            <div class="news-modal-body">${news.content}</div>
            <button class="news-modal-footer-btn">Закрыть</button>
        </div>
    `;
    
    modal.querySelector('.news-modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.news-modal-footer-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    
    document.body.appendChild(modal);
    currentNewsModal = modal;
    
    // Добавляем стили для модалки
    if (!document.getElementById('news-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'news-modal-styles';
        style.textContent = `
            .news-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(20px);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s;
            }
            .news-modal-content {
                background: var(--bg-card);
                backdrop-filter: blur(20px);
                border-radius: 28px;
                width: 480px;
                max-width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                border: 1px solid var(--border);
                animation: slideUp 0.3s;
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .news-modal-header {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 20px 24px;
                border-bottom: 1px solid var(--border);
                position: relative;
            }
            .news-modal-icon {
                font-size: 40px;
            }
            .news-modal-title {
                font-size: 18px;
                font-weight: 700;
                flex: 1;
            }
            .news-modal-close {
                background: rgba(255,255,255,0.05);
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                color: var(--text);
                cursor: pointer;
            }
            .news-modal-close:hover {
                background: var(--accent);
            }
            .news-modal-date {
                padding: 12px 24px;
                font-size: 11px;
                color: var(--accent);
                background: rgba(0,0,0,0.2);
            }
            .news-modal-body {
                padding: 24px;
                font-size: 13px;
                line-height: 1.6;
                color: var(--text-secondary);
            }
            .news-modal-body ul {
                margin: 12px 0 12px 20px;
            }
            .news-modal-body li {
                margin: 6px 0;
            }
            .news-modal-footer-btn {
                display: block;
                width: calc(100% - 48px);
                margin: 0 24px 24px 24px;
                padding: 10px;
                background: linear-gradient(135deg, var(--accent), var(--accent-dark));
                border: none;
                border-radius: 40px;
                color: white;
                font-weight: 600;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }
}

function getLatestNews() {
    return newsData.slice(0, 3);
}

// Экспорт
window.newsModule = {
    renderNews,
    getLatestNews,
    newsData
};