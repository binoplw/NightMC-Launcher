// version-manager.js — Загрузка и установка версий Minecraft
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');
const AdmZip = require('adm-zip');

class VersionManager {
    constructor() {
        this.gameDir = path.join(os.homedir(), 'AppData', 'Roaming', '.nightmc');
        this.versionsDir = path.join(this.gameDir, 'versions');
        this.librariesDir = path.join(this.gameDir, 'libraries');
        this.assetsDir = path.join(this.gameDir, 'assets');
        this.nativesDir = path.join(this.gameDir, 'natives');
        this.tempDir = path.join(this.gameDir, 'temp');
    }

    initFolders() {
        const folders = [
            this.gameDir, this.versionsDir, this.librariesDir, 
            this.assetsDir, this.nativesDir, this.tempDir
        ];
        folders.forEach(folder => {
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
            }
        });
    }

    downloadFile(url, destPath, onProgress) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destPath);
            const protocol = url.startsWith('https') ? https : http;
            
            protocol.get(url, (response) => {
                // Редирект
                if (response.statusCode === 302 || response.statusCode === 301) {
                    file.close();
                    fs.unlinkSync(destPath);
                    return this.downloadFile(response.headers.location, destPath, onProgress)
                        .then(resolve, reject);
                }

                if (response.statusCode !== 200) {
                    file.close();
                    fs.unlinkSync(destPath);
                    reject(new Error(`HTTP ${response.statusCode}`));
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

                file.on('finish', () => {
                    file.close();
                    resolve();
                });

                file.on('error', (err) => {
                    file.close();
                    fs.unlinkSync(destPath);
                    reject(err);
                });
            }).on('error', (err) => {
                file.close();
                if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                reject(err);
            });
        });
    }

    async getVersionManifest() {
        return new Promise((resolve, reject) => {
            https.get('https://launchermeta.mojang.com/mc/game/version_manifest.json', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });
    }

    async getVersionInfo(versionId) {
        const manifest = await this.getVersionManifest();
        const version = manifest.versions.find(v => v.id === versionId);
        
        if (!version) {
            throw new Error(`Версия ${versionId} не найдена`);
        }

        return new Promise((resolve, reject) => {
            https.get(version.url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });
    }

    async installVersion(versionId, onProgress) {
        this.initFolders();
        
        try {
            // 1. Получаем информацию о версии
            if (onProgress) onProgress('manifest', 0, `Получение информации о версии ${versionId}...`);
            
            const versionInfo = await this.getVersionInfo(versionId);
            const versionDir = path.join(this.versionsDir, versionId);
            
            if (!fs.existsSync(versionDir)) {
                fs.mkdirSync(versionDir, { recursive: true });
            }

            // 2. Скачиваем клиент
            if (onProgress) onProgress('client', 0, 'Скачивание клиента...');
            
            const clientUrl = versionInfo.downloads.client.url;
            const clientPath = path.join(versionDir, `${versionId}.jar`);
            
            if (!fs.existsSync(clientPath)) {
                console.log('[NightMC] Скачивание клиента:', clientUrl);
                await this.downloadFile(clientUrl, clientPath, (percent) => {
                    if (onProgress) onProgress('client', percent, `Клиент: ${percent}%`);
                });
                console.log('[NightMC] Клиент скачан');
            } else {
                console.log('[NightMC] Клиент уже существует');
            }

            // 3. Сохраняем JSON
            const jsonPath = path.join(versionDir, `${versionId}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(versionInfo, null, 2));
            console.log('[NightMC] JSON сохранён');

            // 4. Скачиваем библиотеки
            if (onProgress) onProgress('libraries', 0, 'Скачивание библиотек...');
            
            let libCount = 0;
            let skippedLibs = 0;
            const totalLibs = versionInfo.libraries.length;

            for (const lib of versionInfo.libraries) {
                // Проверяем правила
                if (lib.rules) {
                    let allowed = true;
                    for (const rule of lib.rules) {
                        if (rule.os) {
                            const isWindows = rule.os.name === 'windows';
                            if (rule.action === 'allow' && !isWindows) allowed = false;
                            if (rule.action === 'disallow' && isWindows) allowed = false;
                        }
                    }
                    if (!allowed) {
                        skippedLibs++;
                        continue;
                    }
                }

                // Скачиваем основной артефакт
                if (lib.downloads?.artifact) {
                    const artifact = lib.downloads.artifact;
                    const libPath = path.join(this.librariesDir, artifact.path);
                    const libDir = path.dirname(libPath);

                    if (!fs.existsSync(libDir)) {
                        fs.mkdirSync(libDir, { recursive: true });
                    }

                    if (!fs.existsSync(libPath)) {
                        try {
                            await this.downloadFile(artifact.url, libPath);
                            libCount++;
                        } catch (e) {
                            console.log(`[NightMC] Ошибка скачивания: ${artifact.path} - ${e.message}`);
                        }
                    } else {
                        libCount++;
                    }
                }

                // Прогресс каждые 10 библиотек
                if (libCount % 10 === 0 && onProgress) {
                    const percent = Math.round((libCount / totalLibs) * 100);
                    onProgress('libraries', percent, `Библиотеки: ${percent}%`);
                }
            }

            console.log(`[NightMC] Скачано библиотек: ${libCount}, пропущено: ${skippedLibs}`);
            if (onProgress) onProgress('libraries', 100, `Библиотеки готовы (${libCount} шт.)`);

            // 5. Скачиваем и распаковываем нативы
            if (onProgress) onProgress('natives', 0, 'Установка нативных библиотек...');

            // Очищаем папку natives перед установкой
            if (fs.existsSync(this.nativesDir)) {
                const cleanDir = (dir) => {
                    if (!fs.existsSync(dir)) return;
                    const items = fs.readdirSync(dir);
                    for (const item of items) {
                        const fullPath = path.join(dir, item);
                        try {
                            if (fs.statSync(fullPath).isDirectory()) {
                                cleanDir(fullPath);
                                fs.rmdirSync(fullPath);
                            } else {
                                fs.unlinkSync(fullPath);
                            }
                        } catch(e) {
                            console.log(`[NightMC] Ошибка очистки: ${fullPath}`);
                        }
                    }
                };
                cleanDir(this.nativesDir);
            } else {
                fs.mkdirSync(this.nativesDir, { recursive: true });
            }

            let nativesCount = 0;
            const nativesToDownload = [];

            // Собираем список natives для скачивания
            for (const lib of versionInfo.libraries) {
                if (!lib.natives || !lib.natives.windows) continue;
                
                const classifiers = lib.downloads?.classifiers;
                if (!classifiers) continue;

                const nativeKey = lib.natives.windows.replace('${arch}', '64');
                const nativeArtifact = classifiers[nativeKey];
                
                if (!nativeArtifact) continue;
                nativesToDownload.push(nativeArtifact);
            }

            console.log(`[NightMC] Natives для скачивания: ${nativesToDownload.length}`);

            // Скачиваем и распаковываем каждый native
            for (const nativeArtifact of nativesToDownload) {
                const nativeFileName = path.basename(nativeArtifact.path);
                const nativePath = path.join(this.tempDir, nativeFileName);

                // Скачиваем если нет
                if (!fs.existsSync(nativePath)) {
                    try {
                        console.log(`[NightMC] Скачивание: ${nativeFileName}`);
                        await this.downloadFile(nativeArtifact.url, nativePath);
                    } catch (e) {
                        console.log(`[NightMC] Ошибка скачивания ${nativeFileName}: ${e.message}`);
                        continue;
                    }
                }

                // Распаковываем
                try {
                    const zip = new AdmZip(nativePath);
                    const entries = zip.getEntries();
                    
                    console.log(`[NightMC] Распаковка: ${nativeFileName} (${entries.length} файлов)`);
                    
                    // Сначала распаковываем всё во временную папку
                    const tempExtractDir = path.join(this.tempDir, 'natives_extract');
                    if (fs.existsSync(tempExtractDir)) {
                        // Очищаем
                        const cleanTemp = (dir) => {
                            const items = fs.readdirSync(dir);
                            for (const item of items) {
                                const full = path.join(dir, item);
                                if (fs.statSync(full).isDirectory()) {
                                    cleanTemp(full);
                                    fs.rmdirSync(full);
                                } else {
                                    fs.unlinkSync(full);
                                }
                            }
                        };
                        cleanTemp(tempExtractDir);
                    } else {
                        fs.mkdirSync(tempExtractDir, { recursive: true });
                    }
                    
                    zip.extractAllTo(tempExtractDir, true);
                    
                    // Перемещаем DLL файлы в корень natives
                    const moveDlls = (dir) => {
                        if (!fs.existsSync(dir)) return;
                        const items = fs.readdirSync(dir);
                        for (const item of items) {
                            const fullPath = path.join(dir, item);
                            if (fs.statSync(fullPath).isDirectory()) {
                                moveDlls(fullPath);
                            } else if (item.endsWith('.dll') || item.endsWith('.so') || item.endsWith('.dylib')) {
                                const destPath = path.join(this.nativesDir, item);
                                if (!fs.existsSync(destPath)) {
                                    fs.copyFileSync(fullPath, destPath);
                                    nativesCount++;
                                    console.log(`[NightMC] Извлечён: ${item}`);
                                }
                            }
                        }
                    };
                    
                    moveDlls(tempExtractDir);
                    
                    // Очищаем временную папку распаковки
                    const cleanTempDir = (dir) => {
                        if (!fs.existsSync(dir)) return;
                        const items = fs.readdirSync(dir);
                        for (const item of items) {
                            const full = path.join(dir, item);
                            try {
                                if (fs.statSync(full).isDirectory()) {
                                    cleanTempDir(full);
                                    fs.rmdirSync(full);
                                } else {
                                    fs.unlinkSync(full);
                                }
                            } catch(e) {}
                        }
                    };
                    cleanTempDir(tempExtractDir);
                    try { fs.rmdirSync(tempExtractDir); } catch(e) {}
                    
                    // Удаляем скачанный jar
                    try { fs.unlinkSync(nativePath); } catch(e) {}
                    
                } catch (e) {
                    console.log(`[NightMC] Ошибка распаковки ${nativeFileName}: ${e.message}`);
                }
            }

            console.log(`[NightMC] Распаковано natives: ${nativesCount} DLL`);
            
            // Проверяем DLL в корне natives
            const dllInRoot = fs.readdirSync(this.nativesDir).filter(f => f.endsWith('.dll')).length;
            console.log(`[NightMC] DLL в корне natives: ${dllInRoot}`);
            
            if (onProgress) {
                if (nativesCount > 0) {
                    onProgress('natives', 100, `Нативные библиотеки готовы (${nativesCount} DLL)`);
                } else {
                    onProgress('natives', 100, 'Внимание: нативные библиотеки не найдены');
                }
            }

            // 6. Скачиваем ассеты (ресурсы)
            if (onProgress) onProgress('assets', 0, 'Скачивание ресурсов...');
            
            const assetIndex = versionInfo.assetIndex;
            const indexesDir = path.join(this.assetsDir, 'indexes');
            
            if (!fs.existsSync(indexesDir)) {
                fs.mkdirSync(indexesDir, { recursive: true });
            }

            const assetIndexPath = path.join(indexesDir, `${assetIndex.id}.json`);
            
            // Скачиваем индекс ассетов
            if (!fs.existsSync(assetIndexPath)) {
                console.log('[NightMC] Скачивание индекса ассетов...');
                await this.downloadFile(assetIndex.url, assetIndexPath);
            }
            
            const assetIndexData = JSON.parse(fs.readFileSync(assetIndexPath, 'utf8'));
            const assets = Object.entries(assetIndexData.objects);
            const totalAssets = assets.length;
            let downloadedAssets = 0;
            let skippedAssets = 0;

            console.log(`[NightMC] Всего ассетов: ${totalAssets}`);

            for (const [name, obj] of assets) {
                const hash = obj.hash;
                const prefix = hash.substring(0, 2);
                const assetUrl = `https://resources.download.minecraft.net/${prefix}/${hash}`;
                const assetPath = path.join(this.assetsDir, 'objects', prefix, hash);

                if (!fs.existsSync(assetPath)) {
                    const assetDir = path.dirname(assetPath);
                    if (!fs.existsSync(assetDir)) {
                        fs.mkdirSync(assetDir, { recursive: true });
                    }

                    try {
                        await this.downloadFile(assetUrl, assetPath);
                        downloadedAssets++;
                    } catch (e) {
                        skippedAssets++;
                        if (skippedAssets < 5) {
                            console.log(`[NightMC] Ошибка ассета ${name}: ${e.message}`);
                        }
                    }
                } else {
                    downloadedAssets++;
                }

                // Прогресс каждые 100 ассетов
                if (downloadedAssets % 100 === 0 && onProgress) {
                    const percent = Math.round((downloadedAssets / totalAssets) * 100);
                    onProgress('assets', percent, `Ресурсы: ${percent}% (${downloadedAssets}/${totalAssets})`);
                }
            }

            console.log(`[NightMC] Ассеты: ${downloadedAssets} готово, ${skippedAssets} пропущено`);
            if (onProgress) onProgress('assets', 100, `Ресурсы готовы (${downloadedAssets} шт.)`);

            // Завершение
            if (onProgress) onProgress('complete', 100, `Версия ${versionId} установлена!`);

            return { 
                success: true, 
                message: `Версия ${versionId} успешно установлена. Библиотек: ${libCount}, Natives: ${nativesCount} DLL, Ассетов: ${downloadedAssets}`,
                stats: {
                    libraries: libCount,
                    natives: nativesCount,
                    assets: downloadedAssets
                }
            };

        } catch (error) {
            console.error('[NightMC] Ошибка установки версии:', error);
            if (onProgress) onProgress('error', 0, error.message);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    // Получить список установленных версий
    getInstalledVersions() {
        const versions = [];
        
        if (fs.existsSync(this.versionsDir)) {
            const items = fs.readdirSync(this.versionsDir);
            for (const item of items) {
                const versionPath = path.join(this.versionsDir, item);
                if (fs.statSync(versionPath).isDirectory()) {
                    const jarPath = path.join(versionPath, `${item}.jar`);
                    const jsonPath = path.join(versionPath, `${item}.json`);
                    
                    if (fs.existsSync(jarPath) && fs.existsSync(jsonPath)) {
                        versions.push({
                            id: item,
                            jarSize: fs.statSync(jarPath).size,
                            installedAt: fs.statSync(jarPath).mtime
                        });
                    }
                }
            }
        }
        
        return versions.sort((a, b) => b.installedAt - a.installedAt);
    }

    // Получить список доступных версий
    async getAvailableVersions() {
        try {
            const manifest = await this.getVersionManifest();
            return manifest.versions
                .filter(v => v.type === 'release')
                .map(v => ({
                    id: v.id,
                    type: v.type,
                    releaseTime: v.releaseTime,
                    url: v.url
                }))
                .sort((a, b) => new Date(b.releaseTime) - new Date(a.releaseTime));
        } catch (e) {
            console.error('[NightMC] Ошибка получения версий:', e);
            return [];
        }
    }

    // Удалить версию
    async deleteVersion(versionId) {
        const versionPath = path.join(this.versionsDir, versionId);
        if (fs.existsSync(versionPath)) {
            const deleteRecursive = (dir) => {
                if (!fs.existsSync(dir)) return;
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    if (fs.statSync(fullPath).isDirectory()) {
                        deleteRecursive(fullPath);
                    } else {
                        fs.unlinkSync(fullPath);
                    }
                }
                fs.rmdirSync(dir);
            };
            
            try {
                deleteRecursive(versionPath);
                return { success: true, message: `Версия ${versionId} удалена` };
            } catch (e) {
                return { success: false, error: e.message };
            }
        }
        return { success: false, error: 'Версия не найдена' };
    }

    // Проверить целостность установки
    async verifyVersion(versionId) {
        const versionPath = path.join(this.versionsDir, versionId);
        const jarPath = path.join(versionPath, `${versionId}.jar`);
        const jsonPath = path.join(versionPath, `${versionId}.json`);
        
        if (!fs.existsSync(jarPath)) {
            return { valid: false, error: 'JAR файл отсутствует' };
        }
        
        if (!fs.existsSync(jsonPath)) {
            return { valid: false, error: 'JSON файл отсутствует' };
        }
        
        try {
            const versionJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            
            // Проверяем основные библиотеки
            let missingLibs = 0;
            for (const lib of versionJson.libraries) {
                if (lib.downloads?.artifact) {
                    const libPath = path.join(this.librariesDir, lib.downloads.artifact.path);
                    if (!fs.existsSync(libPath)) {
                        missingLibs++;
                    }
                }
            }
            
            // Проверяем natives
            const dllCount = fs.readdirSync(this.nativesDir).filter(f => f.endsWith('.dll')).length;
            
            return {
                valid: missingLibs === 0,
                missingLibraries: missingLibs,
                nativesCount: dllCount,
                jarSize: fs.statSync(jarPath).size
            };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    }
}

module.exports = VersionManager;