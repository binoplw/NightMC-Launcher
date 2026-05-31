// notifications.js — система уведомлений для NightMC Launcher
// Показывает всплывающие сообщения в правом нижнем углу

class NightMCNotifications {
    constructor() {
        this.container = null;
        this.queue = [];
        this.isShowing = false;
        this.defaultDuration = 3000; // 3 секунды
    }
    
    // Инициализация контейнера
    init() {
        this.container = document.getElementById('notificationContainer');
        if (!this.container) {
            // Создаём контейнер, если его нет
            this.container = document.createElement('div');
            this.container.id = 'notificationContainer';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }
    
    // Показать уведомление
    show(message, type = 'info', duration = null) {
        const showDuration = duration || this.defaultDuration;
        
        // Добавляем в очередь
        this.queue.push({ message, type, duration: showDuration });
        
        // Если ничего не показывается — показываем
        if (!this.isShowing) {
            this.processQueue();
        }
    }
    
    // Обработка очереди
    processQueue() {
        if (this.queue.length === 0) {
            this.isShowing = false;
            return;
        }
        
        this.isShowing = true;
        const notification = this.queue.shift();
        this.displayNotification(notification.message, notification.type, notification.duration);
    }
    
    // Отображение конкретного уведомления
    displayNotification(message, type, duration) {
        if (!this.container) this.init();
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        // Иконка в зависимости от типа
        let icon = 'ℹ️';
        let borderColor = '#3b82f6';
        
        switch(type) {
            case 'success':
                icon = '✅';
                borderColor = '#22c55e';
                break;
            case 'error':
                icon = '❌';
                borderColor = '#ef4444';
                break;
            case 'warning':
                icon = '⚠️';
                borderColor = '#fbbf24';
                break;
            case 'info':
            default:
                icon = '🔔';
                borderColor = '#3b82f6';
                break;
        }
        
        notification.style.borderLeft = `4px solid ${borderColor}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 18px;">${icon}</span>
                <span>${message}</span>
            </div>
        `;
        
        // Анимация появления
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'all 0.3s ease';
        
        this.container.appendChild(notification);
        
        // Анимация входа
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Авто-удаление
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
                this.processQueue();
            }, 300);
        }, duration);
    }
    
    // Быстрые методы для разных типов
    info(message, duration) {
        this.show(message, 'info', duration);
    }
    
    success(message, duration) {
        this.show(message, 'success', duration);
    }
    
    error(message, duration) {
        this.show(message, 'error', duration);
    }
    
    warning(message, duration) {
        this.show(message, 'warning', duration);
    }
    
    // Очистить все уведомления
    clearAll() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.queue = [];
        this.isShowing = false;
    }
}

// Создаём глобальный экземпляр
const nightMCNotifications = new NightMCNotifications();

// Запускаем после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    nightMCNotifications.init();
});

// Делаем доступным для других скриптов
window.NightMC = window.NightMC || {};
window.NightMC.notifications = nightMCNotifications;
window.NightMC.showNotification = (message, type) => nightMCNotifications.show(message, type);

// Переопределяем showNotification из home.js для совместимости
if (typeof window.NightMC !== 'undefined') {
    window.NightMC.showNotification = (message, type) => nightMCNotifications.show(message, type);
}