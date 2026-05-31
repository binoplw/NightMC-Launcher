// main.js — С автообновлением и логотипом
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// Настройка автообновления
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;
let minecraftLauncher;
let libraryManager;
let nativesManager;
let javaManager;
let splashWindow;

// Создание сплеш-скрина с логотипом
function createSplashScreen() {
    splashWindow = new BrowserWindow({
        width: 500,
        height: 350,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    splashWindow.loadURL(`data:text/html;charset=utf-8,
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                * { margin: 0; padding: 0; }
                body {
                    background: #0a0a0f;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    flex-direction: column;
                    font-family: 'Inter', sans-serif;
                    -webkit-app-region: drag;
                }
                .logo {
                    font-size: 100px;
                    animation: float 2s ease-in-out infinite;
                }
                @keyframes float {
                    0%,100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .title {
                    font-size: 32px;
                    font-weight: 900;
                    background: linear-gradient(135deg, #ffffff, #c084fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-top: 20px;
                }
                .version {
                    color: #a0a0b8;
                    font-size: 12px;
                    margin-top: 10px;
                }
                .loading-bar {
                    width: 250px;
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                    margin-top: 30px;
                    overflow: hidden;
                }
                .loading-fill {
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(90deg, #c084fc, #a855f7);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
            </style>
        </head>
        <body>
            <div class="logo">🌙</div>
            <div class="title">NightMC</div>
            <div class="version">v${app.getVersion()}</div>
            <div class="loading-bar">
                <div class="loading-fill" id="fill"></div>
            </div>
            <script>
                let progress = 0;
                const fill = document.getElementById('fill');
                const interval = setInterval(() => {
                    progress += Math.random() * 15;
                    if (progress > 100) progress = 100;
                    fill.style.width = progress + '%';
                    if (progress >= 100) {
                        clearInterval(interval);
                        setTimeout(() => window.close(), 300);
                    }
                }, 200);
            </script>
        </body>
        </html>
    `);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        show: false
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
        }
        mainWindow.show();
    });

    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }
}

// Проверка обновлений
function checkForUpdates() {
    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('update-available', (info) => {
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Обновление NightMC',
            message: `Доступна новая версия: ${info.version}\n\nОбновить сейчас?`,
            buttons: ['Обновить', 'Позже']
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.downloadUpdate();
            }
        });
    });

    autoUpdater.on('download-progress', (progress) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update-progress', progress);
        }
    });

    autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Обновление готово',
            message: 'Обновление скачано. Установить при перезапуске?',
            buttons: ['Перезапустить', 'Позже']
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });
}

app.whenReady().then(() => {
    createSplashScreen();
    
    // Загружаем модули
    const MinecraftLauncher = require('./minecraft-launcher');
    const LibraryManager = require('./library-manager');
    const NativesManager = require('./natives-manager');
    const JavaManager = require('./java-manager');
    
    minecraftLauncher = new MinecraftLauncher();
    libraryManager = new LibraryManager();
    nativesManager = new NativesManager();
    javaManager = new JavaManager();
    
    createWindow();
    
    // Проверяем обновления через 5 секунд
    setTimeout(() => {
        checkForUpdates();
    }, 5000);
    
    registerIpcHandlers();
});

app.on('window-all-closed', () => {
    app.quit();
});

function registerIpcHandlers() {
    // Управление окном
    ipcMain.on('minimize-window', () => mainWindow?.minimize());
    ipcMain.on('close-window', () => mainWindow?.close());
    ipcMain.on('maximize-window', () => {
        if (mainWindow?.isMaximized()) mainWindow.unmaximize();
        else mainWindow?.maximize();
    });

    // Внешние ссылки
    ipcMain.handle('open-external', async (event, url) => {
        await shell.openExternal(url);
    });

    // Настройки
    ipcMain.on('save-settings', (event, { key, value }) => {
        try {
            const userDataPath = app.getPath('userData');
            const settingsPath = path.join(userDataPath, 'settings.json');
            let settings = {};
            if (fs.existsSync(settingsPath)) {
                settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            }
            settings[key] = value;
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        } catch(e) {}
    });

    ipcMain.handle('load-settings', async (event, key) => {
        try {
            const userDataPath = app.getPath('userData');
            const settingsPath = path.join(userDataPath, 'settings.json');
            if (fs.existsSync(settingsPath)) {
                const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                return settings[key] || null;
            }
        } catch(e) {}
        return null;
    });

    ipcMain.handle('get-all-settings', async () => {
        try {
            const userDataPath = app.getPath('userData');
            const settingsPath = path.join(userDataPath, 'settings.json');
            if (fs.existsSync(settingsPath)) {
                return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            }
        } catch(e) {}
        return {};
    });

    // Запуск Minecraft
    ipcMain.handle('launch-minecraft', async (event, options) => {
        try {
            const { version, username, ram } = options;
            const onProgress = (stage, percent, message) => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('launch-progress', { stage, percent, message });
                }
            };
            return await minecraftLauncher.launch(version, username, ram, onProgress);
        } catch(e) {
            return { success: false, error: e.message };
        }
    });

    // Установка версии
    ipcMain.handle('install-version', async (event, versionId) => {
        try {
            const onProgress = (type, percent, message) => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('install-progress', { type, percent, message });
                }
            };
            return await libraryManager.installLibraries(versionId, onProgress);
        } catch(e) {
            return { success: false, error: e.message };
        }
    });

    // Получение версий
    ipcMain.handle('get-installed-versions', async () => {
        try {
            return libraryManager.getInstalledVersions();
        } catch(e) {
            return [];
        }
    });

    // Проверка обновлений вручную
    ipcMain.handle('check-updates', async () => {
        try {
            await autoUpdater.checkForUpdates();
            return { success: true };
        } catch(e) {
            return { success: false, error: e.message };
        }
    });

    // Получение версии лаунчера
    ipcMain.handle('get-app-version', async () => {
        return app.getVersion();
    });
}