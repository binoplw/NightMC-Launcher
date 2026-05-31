// plugin-manager.js — Менеджер плагинов для NightMC
// Все плагины хранятся в папке /plugins/

class PluginManager {
    constructor() {
        this.plugins = [];
        this.loadedPlugins = [];
        this.pluginData = {};
    }

    // Регистрация плагина
    register(plugin) {
        if (!plugin.id || !plugin.name) {
            console.error('Плагин должен иметь id и name');
            return false;
        }
        
        if (this.plugins.find(p => p.id === plugin.id)) {
            console.warn(`Плагин ${plugin.id} уже зарегистрирован`);
            return false;
        }
        
        this.plugins.push(plugin);
        console.log(`[PluginManager] Зарегистрирован: ${plugin.name} (${plugin.id})`);
        return true;
    }

    // Загрузка плагина
    async load(pluginId) {
        const plugin = this.plugins.find(p => p.id === pluginId);
        if (!plugin) {
            console.error(`Плагин ${pluginId} не найден`);
            return false;
        }
        
        if (this.loadedPlugins.includes(pluginId)) {
            console.warn(`Плагин ${pluginId} уже загружен`);
            return true;
        }
        
        try {
            if (plugin.onLoad) {
                await plugin.onLoad(this);
            }
            this.loadedPlugins.push(pluginId);
            console.log(`[PluginManager] Загружен: ${plugin.name}`);
            return true;
        } catch (err) {
            console.error(`Ошибка загрузки плагина ${plugin.name}:`, err);
            return false;
        }
    }

    // Выгрузка плагина
    async unload(pluginId) {
        const plugin = this.plugins.find(p => p.id === pluginId);
        if (!plugin) return false;
        
        if (plugin.onUnload) {
            await plugin.onUnload(this);
        }
        
        this.loadedPlugins = this.loadedPlugins.filter(id => id !== pluginId);
        console.log(`[PluginManager] Выгружен: ${plugin.name}`);
        return true;
    }

    // Получение данных плагина
    getData(pluginId, key, defaultValue = null) {
        if (!this.pluginData[pluginId]) return defaultValue;
        return this.pluginData[pluginId][key] !== undefined ? this.pluginData[pluginId][key] : defaultValue;
    }

    // Установка данных плагина
    setData(pluginId, key, value) {
        if (!this.pluginData[pluginId]) this.pluginData[pluginId] = {};
        this.pluginData[pluginId][key] = value;
        this.saveData();
    }

    // Сохранение данных в localStorage
    saveData() {
        localStorage.setItem('nightmc_plugins_data', JSON.stringify(this.pluginData));
    }

    // Загрузка данных из localStorage
    loadData() {
        const saved = localStorage.getItem('nightmc_plugins_data');
        if (saved) {
            this.pluginData = JSON.parse(saved);
        }
    }

    // Получение списка всех плагинов
    getPlugins() {
        return this.plugins;
    }

    // Получение загруженных плагинов
    getLoadedPlugins() {
        return this.loadedPlugins;
    }

    // Проверка, загружен ли плагин
    isLoaded(pluginId) {
        return this.loadedPlugins.includes(pluginId);
    }
}

// Экспорт
window.PluginManager = PluginManager;
window.pluginManager = new PluginManager();
window.pluginManager.loadData();