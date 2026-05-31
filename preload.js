const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nightMC', {
    // Управление окном
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
    
    // Внешние ссылки
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    
    // Настройки
    saveSettings: (key, value) => ipcRenderer.send('save-settings', { key, value }),
    loadSettings: (key) => ipcRenderer.invoke('load-settings', key),
    getAllSettings: () => ipcRenderer.invoke('get-all-settings'),
    
    // Запуск Minecraft
    launchMinecraft: (options) => ipcRenderer.invoke('launch-minecraft', options),
    onLaunchProgress: (callback) => {
        ipcRenderer.on('launch-progress', (event, data) => callback(data));
    },
    
    // Установка версий
    installVersion: (versionId) => ipcRenderer.invoke('install-version', versionId),
    onInstallProgress: (callback) => {
        ipcRenderer.on('install-progress', (event, data) => callback(data));
    },
    
    // Версии
    getInstalledVersions: () => ipcRenderer.invoke('get-installed-versions'),
    
    // Обновления
    checkUpdates: () => ipcRenderer.invoke('check-updates'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    onUpdateProgress: (callback) => {
        ipcRenderer.on('update-progress', (event, data) => callback(data));
    },
    
    // Очистка
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});