// modrinth.js — Плагин Modrinth для NightMC

const modrinthPlugin = {
    id: 'modrinth',
    name: 'Modrinth Mods',
    version: '1.0.0',
    author: 'NightMC Team',
    category: 'golden',
    icon: '◉',
    description: 'Поиск и установка модов с Modrinth',
    
    async onLoad(manager) {
        console.log('[Modrinth] Плагин загружен');
        
        // Добавляем элемент в аддоны
        const addonsContainer = document.getElementById('addonsGrid');
        if (addonsContainer) {
            const isInstalled = manager.isLoaded('modrinth');
            // Плагин уже добавлен в список аддонов
        }
        
        // Инициализация Modrinth API
        this.initModrinth();
    },
    
    initModrinth() {
        // Здесь будет код для работы с Modrinth API
        console.log('[Modrinth] API готов к работе');
    },
    
    async searchMods(query) {
        try {
            const response = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=24`);
            const data = await response.json();
            return data.hits || [];
        } catch (err) {
            console.error('[Modrinth] Ошибка поиска:', err);
            return [];
        }
    },
    
    async getModInfo(projectId) {
        try {
            const response = await fetch(`https://api.modrinth.com/v2/project/${projectId}`);
            return await response.json();
        } catch (err) {
            console.error('[Modrinth] Ошибка получения информации:', err);
            return null;
        }
    },
    
    async downloadMod(projectId, versionId) {
        try {
            const response = await fetch(`https://api.modrinth.com/v2/version/${versionId}`);
            const data = await response.json();
            const downloadUrl = data.files[0]?.url;
            if (downloadUrl) {
                console.log(`[Modrinth] Скачивание мода: ${downloadUrl}`);
                return { success: true, url: downloadUrl };
            }
            return { success: false, error: 'Файл не найден' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },
    
    onUnload(manager) {
        console.log('[Modrinth] Плагин выгружен');
    }
};

// Регистрация плагина
if (window.pluginManager) {
    window.pluginManager.register(modrinthPlugin);
}