// java-manager.js — АВТОМАТИЧЕСКАЯ ЗАГРУЗКА JAVA
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const AdmZip = require('adm-zip');

class JavaManager {
    constructor() {
        this.javaDir = path.join(os.homedir(), 'AppData', 'Roaming', '.nightmc', 'java');
        this.tempDir = path.join(os.homedir(), 'AppData', 'Roaming', '.nightmc', 'temp');
    }

    initFolders() {
        [this.javaDir, this.tempDir].forEach(folder => {
            if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        });
    }

    getRequiredJavaVersion(minecraftVersion) {
        const parts = minecraftVersion.split('.');
        const minor = parseInt(parts[1]);
        
        if (minor >= 21) return { version: 21, exact: true };
        if (minor >= 18) return { version: 17, exact: false };
        if (minor === 17) return { version: 16, exact: true };
        return { version: 8, exact: true };
    }

    downloadFile(url, destPath, onProgress) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destPath);
            
            https.get(url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    file.close();
                    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                    this.downloadFile(response.headers.location, destPath, onProgress).then(resolve, reject);
                    return;
                }

                if (response.statusCode !== 200) {
                    file.close();
                    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
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
        });
    }

    async installJava(javaVersion, onProgress) {
        this.initFolders();

        try {
            const existing = this.findExactJava(javaVersion);
            if (existing) {
                console.log(`[JavaManager] Java ${javaVersion} уже установлена`);
                if (onProgress) onProgress('done', 100, `Java ${javaVersion} уже установлена`);
                return { success: true, path: existing, installed: false };
            }

            if (onProgress) onProgress('download', 0, `Скачивание Java ${javaVersion}...`);

            const fallbacks = {
                8: 'https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u432-b06/OpenJDK8U-jdk_x64_windows_hotspot_8u432b06.zip',
                17: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.9_9.zip',
                21: 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.5%2B11/OpenJDK21U-jdk_x64_windows_hotspot_21.0.5_11.zip'
            };

            const url = fallbacks[javaVersion];
            if (!url) throw new Error(`Нет ссылки для Java ${javaVersion}`);

            const zipPath = path.join(this.tempDir, `jdk-${javaVersion}.zip`);
            
            if (!fs.existsSync(zipPath)) {
                await this.downloadFile(url, zipPath, (percent) => {
                    if (onProgress) onProgress('download', percent, `Java ${javaVersion}: ${percent}%`);
                });
            }

            if (onProgress) onProgress('extract', 0, 'Распаковка...');

            const javaFolder = path.join(this.javaDir, `jdk-${javaVersion}`);
            if (fs.existsSync(javaFolder)) {
                fs.rmSync(javaFolder, { recursive: true, force: true });
            }

            const zip = new AdmZip(zipPath);
            const entries = zip.getEntries();
            let rootFolder = entries.length > 0 ? entries[0].entryName.split('/')[0] : '';
            
            zip.extractAllTo(this.javaDir, true);
            
            const extractedPath = path.join(this.javaDir, rootFolder);
            if (rootFolder && rootFolder !== `jdk-${javaVersion}` && fs.existsSync(extractedPath)) {
                fs.renameSync(extractedPath, javaFolder);
            }

            try { fs.unlinkSync(zipPath); } catch(e) {}

            const javawPath = path.join(javaFolder, 'bin', 'javaw.exe');
            if (fs.existsSync(javawPath)) {
                console.log(`[JavaManager] Java ${javaVersion} установлена!`);
                if (onProgress) onProgress('done', 100, `Java ${javaVersion} установлена`);
                return { success: true, path: javawPath, installed: true };
            }

            throw new Error('javaw.exe не найден');

        } catch (error) {
            console.error('[JavaManager] Ошибка:', error.message);
            if (onProgress) onProgress('error', 0, error.message);
            return { success: false, error: error.message };
        }
    }

    findJava(minVersion = 8) {
        const allJava = this.findAllJava();
        allJava.sort((a, b) => b.version - a.version);
        for (const java of allJava) {
            if (java.version >= minVersion) return java.path;
        }
        return null;
    }

    findExactJava(targetVersion) {
        const allJava = this.findAllJava();
        for (const java of allJava) {
            if (java.version === targetVersion) return java.path;
        }
        return null;
    }

    async getJavaForVersion(minecraftVersion, onProgress) {
        const required = this.getRequiredJavaVersion(minecraftVersion);
        console.log(`[JavaManager] Minecraft ${minecraftVersion} -> Java ${required.version}${required.exact ? ' (точно)' : '+'}`);

        let javaPath;

        if (required.exact) {
            javaPath = this.findExactJava(required.version);
        } else {
            javaPath = this.findJava(required.version);
        }

        if (!javaPath) {
            console.log(`[JavaManager] Java ${required.version} не найдена. Устанавливаем...`);
            if (onProgress) onProgress('java', 0, `Установка Java ${required.version}...`);

            const result = await this.installJava(required.version, (type, p, msg) => {
                if (onProgress) onProgress('java', p, msg);
            });

            if (result.success) {
                javaPath = result.path;
            } else {
                throw new Error(`Не удалось установить Java ${required.version}`);
            }
        }

        return javaPath;
    }

    findAllJava() {
        const results = [];

        if (fs.existsSync(this.javaDir)) {
            this.searchJavaInDir(this.javaDir, results);
        }

        const searchPaths = [
            'C:\\Program Files\\Java',
            'C:\\Program Files\\Eclipse Adoptium',
            'C:\\Program Files\\Eclipse Foundation',
            'C:\\Program Files\\Microsoft',
            'C:\\Program Files\\Zulu',
            'C:\\Program Files\\BellSoft'
        ];

        for (const sp of searchPaths) {
            if (fs.existsSync(sp)) this.searchJavaInDir(sp, results);
        }

        return results;
    }

    searchJavaInDir(dir, results) {
        if (!fs.existsSync(dir)) return;
        try {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                try {
                    if (fs.statSync(fullPath).isDirectory()) {
                        const javaw = path.join(fullPath, 'bin', 'javaw.exe');
                        if (fs.existsSync(javaw)) {
                            const ver = this.getJavaVersion(fullPath);
                            if (ver > 0) results.push({ path: javaw, version: ver });
                        }
                    }
                } catch(e) {}
            }
        } catch(e) {}
    }

    getJavaVersion(javaHome) {
        try {
            const release = path.join(javaHome, 'release');
            if (fs.existsSync(release)) {
                const content = fs.readFileSync(release, 'utf8');
                const match = content.match(/JAVA_VERSION="(\d+)/);
                if (match) return parseInt(match[1]);
            }
        } catch(e) {}
        return 0;
    }
}

module.exports = JavaManager;