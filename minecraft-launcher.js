// minecraft-launcher.js — ФИНАЛЬНАЯ ВЕРСИЯ С АВТО-JAVA
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const JavaManager = require('./java-manager');
const LibraryManager = require('./library-manager');
const NativesManager = require('./natives-manager');

class MinecraftLauncher {
    constructor() {
        this.gameDir = path.join(os.homedir(), 'AppData', 'Roaming', '.nightmc');
        this.assetsDir = path.join(this.gameDir, 'assets');
        this.nativesDir = path.join(this.gameDir, 'natives');
        this.tempDir = path.join(this.gameDir, 'temp');

        this.javaManager = new JavaManager();
        this.libraryManager = new LibraryManager(this.gameDir);
        this.nativesManager = new NativesManager(this.gameDir);
    }

    async launch(version, username, ram, onProgress) {
        try {
            // Создаём папки
            [this.gameDir, this.assetsDir, this.nativesDir, this.tempDir].forEach(folder => {
                if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
            });

            console.log('='.repeat(50));
            console.log(`[NightMC] ЗАПУСК Minecraft ${version}`);
            console.log('='.repeat(50));

            // 1. ПОЛУЧАЕМ ПРАВИЛЬНУЮ JAVA
            const javaPath = await this.javaManager.getJavaForVersion(version, (type, p, msg) => {
                if (onProgress) onProgress('java', p, msg);
            });
            
            console.log(`[NightMC] Java: ${javaPath}`);

            // 2. БИБЛИОТЕКИ
            if (this.libraryManager.needsUpdate(version)) {
                console.log('[NightMC] Скачивание библиотек...');
                if (onProgress) onProgress('libs', 0, 'Скачивание библиотек...');
                await this.libraryManager.installLibraries(version, onProgress);
            }

            // 3. NATIVES
            console.log('[NightMC] Распаковка natives...');
            if (onProgress) onProgress('natives', 0, 'Распаковка natives...');
            await this.nativesManager.extractAllNatives(version);
            console.log(`[NightMC] Natives DLL: ${this.nativesManager.getDllCount()}`);

            // 4. CLASSPATH
            const classpath = this.libraryManager.getClasspath(version);
            console.log(`[NightMC] Classpath: ${classpath.length} JARs`);

            // 5. ЗАПУСК
            const uuid = this.generateUUID(version + username);
            const argsFile = path.join(this.tempDir, `mc_args_${Date.now()}.txt`);

            const args = [
                `-Xmx${ram}M`,
                '-Xms512M',
                `-Djava.library.path=${this.nativesDir}`,
                '-cp', classpath.join(';'),
                'net.minecraft.client.main.Main',
                '--username', username,
                '--version', version,
                '--gameDir', this.gameDir,
                '--assetsDir', this.assetsDir,
                '--uuid', uuid,
                '--accessToken', uuid,
                '--userType', 'mojang',
                '--versionType', 'release'
            ];

            fs.writeFileSync(argsFile, args.join('\n'), 'utf8');

            if (onProgress) onProgress('launch', 100, 'Запуск Minecraft...');

            return new Promise((resolve) => {
                const proc = spawn(javaPath, [`@${argsFile}`], {
                    cwd: this.gameDir,
                    stdio: 'inherit'
                });

                proc.on('close', (code) => {
                    console.log(`[NightMC] Закрыт (код: ${code})`);
                    try { fs.unlinkSync(argsFile); } catch(e) {}
                    resolve({ success: true, exitCode: code });
                });

                proc.on('error', (err) => {
                    console.error('[NightMC] Ошибка spawn:', err.message);
                    try { fs.unlinkSync(argsFile); } catch(e) {}
                    resolve({ success: false, error: err.message });
                });
            });

        } catch (error) {
            console.error('[NightMC] ОШИБКА:', error.message);
            return { success: false, error: error.message };
        }
    }

    generateUUID(seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash |= 0;
        }
        const hex = Math.abs(hash).toString(16).padStart(32, '0');
        return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
    }
}

module.exports = MinecraftLauncher;