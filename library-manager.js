// library-manager.js — АВТОМАТИЧЕСКАЯ ЗАГРУЗКА ТОЛЬКО НУЖНЫХ БИБЛИОТЕК
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

class LibraryManager {
    constructor(gameDir) {
        this.gameDir = gameDir || path.join(os.homedir(), 'AppData', 'Roaming', '.nightmc');
        this.versionsDir = path.join(this.gameDir, 'versions');
        this.librariesDir = path.join(this.gameDir, 'libraries');
    }

    initFolders() {
        [this.gameDir, this.versionsDir, this.librariesDir].forEach(folder => {
            if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        });
    }

    // ========== СКАЧИВАНИЕ ФАЙЛА ==========
    downloadFile(url, destPath, onProgress) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destPath);
            
            const doDownload = (downloadUrl) => {
                https.get(downloadUrl, (response) => {
                    if (response.statusCode === 302 || response.statusCode === 301) {
                        file.close();
                        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                        doDownload(response.headers.location);
                        return;
                    }

                    if (response.statusCode !== 200) {
                        file.close();
                        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                        reject(new Error(`HTTP ${response.statusCode} для ${path.basename(destPath)}`));
                        return;
                    }

                    const total = parseInt(response.headers['content-length'], 10);
                    let downloaded = 0;

                    response.on('data', (chunk) => {
                        downloaded += chunk.length;
                        if (onProgress && total) {
                            onProgress(Math.round((downloaded / total) * 100));
                        }
                    });

                    response.pipe(file);
                    file.on('finish', () => { file.close(); resolve(); });
                    file.on('error', (err) => {
                        file.close();
                        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                        reject(err);
                    });
                }).on('error', (err) => {
                    file.close();
                    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                    reject(err);
                });
            };

            doDownload(url);
        });
    }

    // ========== ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ВЕРСИИ ИЗ MANIFEST ==========
    async getVersionInfo(versionId) {
        return new Promise((resolve, reject) => {
            https.get('https://launchermeta.mojang.com/mc/game/version_manifest.json', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', async () => {
                    try {
                        const manifest = JSON.parse(data);
                        const version = manifest.versions.find(v => v.id === versionId);
                        if (!version) {
                            reject(new Error(`Версия ${versionId} не найдена в манифесте`));
                            return;
                        }

                        https.get(version.url, (res2) => {
                            let data2 = '';
                            res2.on('data', chunk => data2 += chunk);
                            res2.on('end', () => {
                                try {
                                    resolve(JSON.parse(data2));
                                } catch(e) {
                                    reject(new Error('Ошибка парсинга JSON версии'));
                                }
                            });
                        }).on('error', (e) => reject(new Error('Ошибка загрузки JSON версии: ' + e.message)));
                        
                    } catch(e) {
                        reject(new Error('Ошибка парсинга манифеста'));
                    }
                });
            }).on('error', (e) => reject(new Error('Ошибка загрузки манифеста: ' + e.message)));
        });
    }

    // ========== ПРОВЕРКА ПРАВИЛ БИБЛИОТЕКИ ==========
    isLibraryAllowed(lib) {
        if (!lib.rules || lib.rules.length === 0) return true;
        
        for (const rule of lib.rules) {
            if (rule.os) {
                const isWindows = rule.os.name === 'windows';
                if (rule.action === 'allow' && !isWindows) return false;
                if (rule.action === 'disallow' && isWindows) return false;
            }
        }
        return true;
    }

    // ========== ПОЛУЧЕНИЕ СПИСКА НУЖНЫХ БИБЛИОТЕК ИЗ JSON ==========
    getRequiredLibraries(versionId) {
        const jsonPath = path.join(this.versionsDir, versionId, `${versionId}.json`);
        
        if (!fs.existsSync(jsonPath)) {
            console.log(`[LibraryManager] JSON для ${versionId} не найден`);
            return { artifacts: [], natives: [], clientUrl: null };
        }

        try {
            const versionJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            
            const result = {
                clientUrl: versionJson.downloads?.client?.url || null,
                artifacts: [],
                natives: []
            };

            for (const lib of versionJson.libraries) {
                // Пропускаем библиотеки не для Windows
                if (!this.isLibraryAllowed(lib)) continue;

                // Основной артефакт
                if (lib.downloads?.artifact) {
                    result.artifacts.push({
                        name: lib.name,
                        path: lib.downloads.artifact.path,
                        url: lib.downloads.artifact.url,
                        size: lib.downloads.artifact.size
                    });
                }

                // Natives для Windows
                if (lib.downloads?.classifiers) {
                    for (const [key, artifact] of Object.entries(lib.downloads.classifiers)) {
                        const lowerKey = key.toLowerCase();
                        if (lowerKey.includes('natives-windows') && 
                            !lowerKey.includes('arm64') && 
                            !lowerKey.includes('x86')) {
                            result.natives.push({
                                name: lib.name,
                                path: artifact.path,
                                url: artifact.url,
                                size: artifact.size,
                                classifier: key
                            });
                        }
                    }
                }
            }

            console.log(`[LibraryManager] Артефактов: ${result.artifacts.length}`);
            console.log(`[LibraryManager] Natives: ${result.natives.length}`);

            return result;

        } catch(e) {
            console.log(`[LibraryManager] Ошибка чтения JSON: ${e.message}`);
            return { artifacts: [], natives: [], clientUrl: null };
        }
    }

    // ========== ПРОВЕРКА, НУЖНО ЛИ ОБНОВЛЕНИЕ ==========
    needsUpdate(versionId) {
        const required = this.getRequiredLibraries(versionId);
        
        // Проверяем клиент
        const clientJar = path.join(this.versionsDir, versionId, `${versionId}.jar`);
        if (!fs.existsSync(clientJar)) return true;

        // Проверяем артефакты
        for (const artifact of required.artifacts) {
            const libPath = path.join(this.librariesDir, artifact.path);
            if (!fs.existsSync(libPath)) return true;
        }

        // Проверяем natives
        for (const native of required.natives) {
            const nativePath = path.join(this.librariesDir, native.path);
            if (!fs.existsSync(nativePath)) return true;
        }

        return false;
    }

    // ========== УСТАНОВКА ВСЕХ НУЖНЫХ БИБЛИОТЕК ==========
    async installLibraries(versionId, onProgress) {
        this.initFolders();

        try {
            // 1. Получаем свежий JSON с сервера
            if (onProgress) onProgress('info', 0, `Загрузка информации о версии ${versionId}...`);
            
            const versionInfo = await this.getVersionInfo(versionId);
            
            // Сохраняем JSON
            const versionDir = path.join(this.versionsDir, versionId);
            if (!fs.existsSync(versionDir)) fs.mkdirSync(versionDir, { recursive: true });
            
            const jsonPath = path.join(versionDir, `${versionId}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(versionInfo, null, 2));
            console.log('[LibraryManager] JSON сохранён');

            // 2. Получаем список нужных библиотек из свежего JSON
            const required = this.getRequiredLibraries(versionId);
            
            // 3. Скачиваем клиент
            if (onProgress) onProgress('client', 0, 'Скачивание клиента...');
            
            const clientJar = path.join(versionDir, `${versionId}.jar`);
            if (!fs.existsSync(clientJar) && required.clientUrl) {
                console.log('[LibraryManager] Скачивание клиента...');
                await this.downloadFile(required.clientUrl, clientJar, (percent) => {
                    if (onProgress) onProgress('client', percent, `Клиент: ${percent}%`);
                });
                console.log('[LibraryManager] Клиент скачан');
            }

            // 4. Собираем файлы для скачивания
            const toDownload = [];

            // Добавляем артефакты
            for (const artifact of required.artifacts) {
                const libPath = path.join(this.librariesDir, artifact.path);
                if (!fs.existsSync(libPath)) {
                    toDownload.push({
                        type: 'artifact',
                        path: libPath,
                        url: artifact.url,
                        name: path.basename(artifact.path),
                        size: artifact.size
                    });
                }
            }

            // Добавляем natives
            for (const native of required.natives) {
                const nativePath = path.join(this.librariesDir, native.path);
                if (!fs.existsSync(nativePath)) {
                    toDownload.push({
                        type: 'native',
                        path: nativePath,
                        url: native.url,
                        name: path.basename(native.path),
                        size: native.size
                    });
                }
            }

            const totalSize = toDownload.reduce((sum, item) => sum + (item.size || 0), 0);
            console.log(`[LibraryManager] Файлов для скачивания: ${toDownload.length}`);
            console.log(`[LibraryManager] Общий размер: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);

            if (toDownload.length === 0) {
                console.log('[LibraryManager] Все библиотеки уже установлены');
                if (onProgress) onProgress('complete', 100, 'Все библиотеки установлены');
                return { success: true, downloaded: 0, total: 0 };
            }

            // 5. Скачиваем
            let downloaded = 0;
            let failed = 0;

            for (const item of toDownload) {
                const dir = path.dirname(item.path);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

                try {
                    if (onProgress) {
                        const percent = Math.round((downloaded / toDownload.length) * 100);
                        onProgress('download', percent, `[${downloaded + 1}/${toDownload.length}] ${item.name}`);
                    }

                    await this.downloadFile(item.url, item.path);
                    downloaded++;
                    
                    if (downloaded % 10 === 0) {
                        console.log(`[LibraryManager] Прогресс: ${downloaded}/${toDownload.length}`);
                    }

                } catch (e) {
                    failed++;
                    console.log(`[LibraryManager] Ошибка: ${item.name} - ${e.message}`);
                }
            }

            console.log(`[LibraryManager] Скачано: ${downloaded}, ошибок: ${failed}`);
            
            if (onProgress) {
                onProgress('complete', 100, `Готово! Скачано ${downloaded} из ${toDownload.length}`);
            }

            return { 
                success: true, 
                downloaded, 
                total: toDownload.length,
                failed 
            };

        } catch (error) {
            console.error('[LibraryManager] Критическая ошибка:', error.message);
            if (onProgress) onProgress('error', 0, error.message);
            return { success: false, error: error.message };
        }
    }

    // ========== ПОЛУЧЕНИЕ CLASSPATH ДЛЯ ВЕРСИИ ==========
    getClasspath(versionId) {
        const jsonPath = path.join(this.versionsDir, versionId, `${versionId}.json`);
        if (!fs.existsSync(jsonPath)) {
            console.log(`[LibraryManager] JSON для ${versionId} не найден`);
            return [];
        }

        try {
            const versionJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            const clientJar = path.join(this.versionsDir, versionId, `${versionId}.jar`);
            const classpath = [];

            // Добавляем клиент
            if (fs.existsSync(clientJar)) {
                classpath.push(clientJar);
            }

            // Добавляем только нужные библиотеки
            for (const lib of versionJson.libraries) {
                if (!this.isLibraryAllowed(lib)) continue;

                if (lib.downloads?.artifact) {
                    const libPath = path.join(this.librariesDir, lib.downloads.artifact.path);
                    
                    // Добавляем только существующие JAR (не natives)
                    if (fs.existsSync(libPath) && 
                        libPath.endsWith('.jar') && 
                        !libPath.includes('natives')) {
                        classpath.push(libPath);
                    }
                }
            }

            // Убираем дубликаты
            const unique = [...new Set(classpath)];
            console.log(`[LibraryManager] Classpath: ${unique.length} JAR`);
            return unique;

        } catch(e) {
            console.log(`[LibraryManager] Ошибка classpath: ${e.message}`);
            return [];
        }
    }

    // ========== ПОЛУЧЕНИЕ ИНФОРМАЦИИ ОБ УСТАНОВЛЕННЫХ ВЕРСИЯХ ==========
    getInstalledVersions() {
        const versions = [];
        
        if (fs.existsSync(this.versionsDir)) {
            const items = fs.readdirSync(this.versionsDir);
            for (const item of items) {
                const versionDir = path.join(this.versionsDir, item);
                if (fs.statSync(versionDir).isDirectory()) {
                    const jarPath = path.join(versionDir, `${item}.jar`);
                    const jsonPath = path.join(versionDir, `${item}.json`);
                    
                    if (fs.existsSync(jarPath) && fs.existsSync(jsonPath)) {
                        versions.push({
                            id: item,
                            size: fs.statSync(jarPath).size
                        });
                    }
                }
            }
        }
        
        return versions;
    }
}

module.exports = LibraryManager;