// natives-manager.js — ИСПРАВЛЕННАЯ ВЕРСИЯ С ПРЯМОЙ РАСПАКОВКОЙ
const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');

class NativesManager {
    constructor(gameDir) {
        this.gameDir = gameDir || path.join(os.homedir(), 'AppData', 'Roaming', '.nightmc');
        this.versionsDir = path.join(this.gameDir, 'versions');
        this.librariesDir = path.join(this.gameDir, 'libraries');
        this.nativesDir = path.join(this.gameDir, 'natives');
    }

    initFolders() {
        if (!fs.existsSync(this.nativesDir)) {
            fs.mkdirSync(this.nativesDir, { recursive: true });
        }
    }

    cleanNatives() {
        if (fs.existsSync(this.nativesDir)) {
            try {
                const items = fs.readdirSync(this.nativesDir);
                for (const item of items) {
                    const fullPath = path.join(this.nativesDir, item);
                    try {
                        if (fs.statSync(fullPath).isDirectory()) {
                            fs.rmSync(fullPath, { recursive: true, force: true });
                        } else {
                            fs.unlinkSync(fullPath);
                        }
                    } catch(e) {}
                }
            } catch(e) {}
        }
        fs.mkdirSync(this.nativesDir, { recursive: true });
    }

    // ПРЯМАЯ РАСПАКОВКА ВСЕХ NATIVES JAR
    async extractAllNatives(versionId) {
        this.initFolders();
        
        console.log('[NativesManager] Прямая распаковка natives из libraries...');
        
        // Очищаем папку
        this.cleanNatives();
        
        // Ищем ВСЕ natives-windows JAR файлы в libraries
        const jars = this.findAllNativesJars();
        
        console.log(`[NativesManager] Найдено JAR: ${jars.length}`);
        
        if (jars.length === 0) {
            console.log('[NativesManager] Natives JAR не найдены!');
            return [];
        }
        
        let extractedCount = 0;
        const extractedFiles = [];
        
        for (const jarPath of jars) {
            const jarName = path.basename(jarPath);
            console.log(`[NativesManager] Распаковка: ${jarName}`);
            
            try {
                const zip = new AdmZip(jarPath);
                const entries = zip.getEntries();
                
                let fileCount = 0;
                
                for (const entry of entries) {
                    const fileName = path.basename(entry.entryName);
                    
                    // Извлекаем DLL, SO, DYLIB, JNILIB
                    if (fileName && fileName.match(/\.(dll|so|dylib|jnilib)$/i)) {
                        try {
                            zip.extractEntryTo(entry, this.nativesDir, false, true);
                            extractedCount++;
                            fileCount++;
                            extractedFiles.push(fileName);
                        } catch(e) {
                            console.log(`[NativesManager]   Ошибка извлечения ${fileName}`);
                        }
                    }
                }
                
                if (fileCount > 0) {
                    console.log(`[NativesManager]   Извлечено: ${fileCount} файлов`);
                } else {
                    console.log(`[NativesManager]   Нет DLL в архиве`);
                }
                
            } catch(e) {
                console.log(`[NativesManager]   Ошибка: ${e.message}`);
            }
        }
        
        console.log(`[NativesManager] Всего извлечено: ${extractedCount} файлов`);
        
        // Проверяем результат
        if (fs.existsSync(this.nativesDir)) {
            const dlls = fs.readdirSync(this.nativesDir).filter(f => f.endsWith('.dll'));
            console.log(`[NativesManager] DLL в папке: ${dlls.length}`);
            if (dlls.length > 0) {
                dlls.forEach(dll => {
                    const size = fs.statSync(path.join(this.nativesDir, dll)).size;
                    console.log(`[NativesManager]   - ${dll} (${(size / 1024).toFixed(1)} KB)`);
                });
            }
        }
        
        return extractedFiles;
    }

    // Поиск всех natives JAR в libraries
    findAllNativesJars() {
        const results = [];
        this.searchJars(this.librariesDir, results);
        return results;
    }

    // Рекурсивный поиск JAR
    searchJars(dir, results) {
        if (!fs.existsSync(dir)) return;
        
        try {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                try {
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        // Пропускаем META-INF
                        if (item !== 'META-INF') {
                            this.searchJars(fullPath, results);
                        }
                    } else if (stat.isFile() && item.endsWith('.jar')) {
                        // Проверяем, является ли это natives-windows JAR
                        const lowerName = item.toLowerCase();
                        if (lowerName.includes('natives-windows') && 
                            !lowerName.includes('arm64') && 
                            !lowerName.includes('x86')) {
                            results.push(fullPath);
                        }
                    }
                } catch(e) {}
            }
        } catch(e) {}
    }

    // Получить количество DLL
    getDllCount() {
        if (!fs.existsSync(this.nativesDir)) return 0;
        try {
            return fs.readdirSync(this.nativesDir).filter(f => f.endsWith('.dll')).length;
        } catch(e) {
            return 0;
        }
    }

    // Проверить, есть ли natives
    hasNatives() {
        return this.getDllCount() > 0;
    }
}

module.exports = NativesManager;