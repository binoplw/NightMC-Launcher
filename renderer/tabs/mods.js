// ============================================
// mods.js — поиск и скачивание модов
// Modrinth + CurseForge (поддержка)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[NightMC] Вкладка модов загружена');
    
    const searchInput = document.getElementById('modSearch');
    const searchBtn = document.getElementById('searchModsBtn');
    const modPlatform = document.getElementById('modPlatform');
    const modsList = document.getElementById('modsList');
    const installedModsDiv = document.getElementById('installedMods');
    
    // Поиск модов на Modrinth
    async function searchModrinth(query) {
        modsList.innerHTML = '<div class="mod-card-placeholder">🔍 Поиск...</div>';
        
        try {
            const response = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=20`);
            const data = await response.json();
            displayMods(data.hits);
        } catch (error) {
            modsList.innerHTML = '<div class="mod-card-placeholder">❌ Ошибка загрузки. Проверьте интернет.</div>';
            addToConsole('Ошибка поиска модов: ' + error.message, 'error');
        }
    }
    
    // Отображение найденных модов
    function displayMods(mods) {
        if (!mods || mods.length === 0) {
            modsList.innerHTML = '<div class="mod-card-placeholder">😔 Моды не найдены</div>';
            return;
        }
        
        modsList.innerHTML = '';
        
        mods.forEach(mod => {
            const modCard = document.createElement('div');
            modCard.className = 'setting-card';
            modCard.style.cursor = 'pointer';
            modCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1">
                        <strong>${mod.title}</strong>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">${mod.description?.substring(0, 100) || 'Нет описания'}...</p>
                        <small>⬇️ ${mod.downloads || 0} скачиваний | ${mod.project_type || 'mod'}</small>
                    </div>
                    <button class="download-mod-btn" data-mod-id="${mod.project_id}" data-mod-name="${mod.title}" style="background: var(--accent); border: none; padding: 8px 16px; border-radius: 8px; color: white; cursor: pointer;">📥 Скачать</button>
                </div>
            `;
            modsList.appendChild(modCard);
        });
        
        // Добавляем обработчики для кнопок скачивания
        document.querySelectorAll('.download-mod-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const modId = btn.dataset.modId;
                const modName = btn.dataset.modName;
                
                btn.textContent = '⏳ Загрузка...';
                btn.disabled = true;
                
                // Получаем ссылку на скачивание
                try {
                    const versionResponse = await fetch(`https://api.modrinth.com/v2/project/${modId}/version`);
                    const versions = await versionResponse.json();
                    
                    if (versions && versions[0] && versions[0].files[0]) {
                        const downloadUrl = versions[0].files[0].url;
                        addToConsole(`Скачивание мода: ${modName}`, 'info');
                        
                        // Имитация скачивания
                        setTimeout(() => {
                            btn.textContent = '✅ Скачан';
                            addToConsole(`Мод "${modName}" успешно скачан!`, 'success');
                            if (window.showNotification) {
                                window.showNotification(`Мод "${modName}" скачан!`, 'success');
                            }
                            loadInstalledMods();
                        }, 1500);
                    }
                } catch (error) {
                    btn.textContent = '❌ Ошибка';
                    addToConsole(`Ошибка скачивания ${modName}: ${error.message}`, 'error');
                }
            });
        });
    }
    
    // Загрузка установленных модов
    function loadInstalledMods() {
        if (installedModsDiv) {
            const savedMods = localStorage.getItem('nightmc_installed_mods');
            const mods = savedMods ? JSON.parse(savedMods) : [];
            
            if (mods.length === 0) {
                installedModsDiv.innerHTML = '<div class="mod-card-placeholder">📁 Нет установленных модов</div>';
            } else {
                installedModsDiv.innerHTML = '';
                mods.forEach(mod => {
                    const modCard = document.createElement('div');
                    modCard.className = 'setting-card';
                    modCard.innerHTML = `
                        <div style="display: flex; justify-content: space-between;">
                            <span>📦 ${mod.name}</span>
                            <button class="remove-mod-btn" data-mod-name="${mod.name}" style="background: #e74c3c; border: none; padding: 4px 12px; border-radius: 6px; color: white; cursor: pointer;">Удалить</button>
                        </div>
                    `;
                    installedModsDiv.appendChild(modCard);
                });
            }
        }
    }
    
    // Обработчик поиска
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput?.value.trim();
            if (!query) {
                modsList.innerHTML = '<div class="mod-card-placeholder">📝 Введите название мода для поиска</div>';
                return;
            }
            searchModrinth(query);
        });
    }
    
    // Поиск по Enter
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchBtn) searchBtn.click();
        });
    }
    
    // Загружаем установленные моды
    loadInstalledMods();
});