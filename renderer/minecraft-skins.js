// minecraft-skins.js — Реальные кубические скины Minecraft
document.addEventListener('DOMContentLoaded', () => {
    console.log('[NightMC] Система скинов Minecraft загружена');
    
    // Коллекция классических скинов Minecraft (кубические превью)
    const presetSkins = [
        { name: 'Steve', emoji: '🧔', color: '#3b82f6', head: '🟫', body: '👕', style: 'Классический' },
        { name: 'Alex', emoji: '👩', color: '#22c55e', head: '🟫', body: '👚', style: 'Рыжий' },
        { name: 'Herobrine', emoji: '👻', color: '#8b5cf6', head: '⬜', body: '⚪', style: 'Легендарный' },
        { name: 'Ninja', emoji: '🥷', color: '#1a1a2e', head: '⬛', body: '🥋', style: 'Скрытный' },
        { name: 'Knight', emoji: '⚔️', color: '#6b7280', head: '🪖', body: '🛡️', style: 'Рыцарь' },
        { name: 'Wizard', emoji: '🧙', color: '#a855f7', head: '🎩', body: '🔮', style: 'Маг' },
        { name: 'Pirate', emoji: '🏴‍☠️', color: '#f97316', head: '🏴', body: '⚓', style: 'Пират' },
        { name: 'Dragon', emoji: '🐉', color: '#ef4444', head: '🐲', body: '🔥', style: 'Дракон' },
        { name: 'Creeper', emoji: '💚', color: '#4ade80', head: '🧨', body: '💚', style: 'Взрывной' },
        { name: 'Enderman', emoji: '👾', color: '#1e1e2e', head: '👾', body: '🌑', style: 'Мистический' },
        { name: 'Skeleton', emoji: '💀', color: '#cbd5e1', head: '💀', body: '🏹', style: 'Стрелок' },
        { name: 'Zombie', emoji: '🧟', color: '#4a6741', head: '🧟', body: '💚', style: 'Ходячий' }
    ];
    
    let userSkins = [];
    let currentSkin = { name: 'Steve', emoji: '🧔', color: '#3b82f6', isCustom: false, skinData: null, skinStyle: 'Классический' };
    
    // Загрузка сохранённых скинов
    function loadSavedSkins() {
        const saved = localStorage.getItem('nightmc_user_skins');
        if (saved) {
            userSkins = JSON.parse(saved);
        }
        
        const savedCurrent = localStorage.getItem('nightmc_current_skin');
        if (savedCurrent) {
            currentSkin = JSON.parse(savedCurrent);
            updateSkinPreview();
        }
    }
    
    function saveUserSkins() {
        localStorage.setItem('nightmc_user_skins', JSON.stringify(userSkins));
    }
    
    function saveCurrentSkin() {
        localStorage.setItem('nightmc_current_skin', JSON.stringify(currentSkin));
        updateHomeSkinPreview();
    }
    
    // 3D-подобное отображение скина (кубическое)
    function renderSkinCube(emoji, color, size = 80) {
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                <div style="display: flex; gap: 2px; justify-content: center;">
                    <div style="width: ${size/3}px; height: ${size/3}px; background: ${color}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                    <div style="width: ${size/3}px; height: ${size/3}px; background: ${color}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                    <div style="width: ${size/3}px; height: ${size/3}px; background: ${color}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                </div>
                <div style="display: flex; gap: 2px; justify-content: center;">
                    <div style="width: ${size/3}px; height: ${size/3}px; background: ${color}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                    <div style="width: ${size/3}px; height: ${size/3}px; background: ${color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: ${size/2}px;">${emoji}</div>
                    <div style="width: ${size/3}px; height: ${size/3}px; background: ${color}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                </div>
                <div style="display: flex; gap: 2px; justify-content: center;">
                    <div style="width: ${size/3}px; height: ${size/3}px; background: ${color}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                    <div style="width: ${size/3}px; height: ${size/3}px; background: ${color}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                    <div style="width: ${size/3}px; height: ${size/3}px; background: ${color}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                </div>
            </div>
        `;
    }
    
    function updateHomeSkinPreview() {
        const homePreview = document.getElementById('skinPreview');
        const homePreviewName = document.getElementById('skinPreviewName');
        if (homePreview) {
            if (currentSkin.isCustom && currentSkin.skinData) {
                homePreview.innerHTML = `<img src="${currentSkin.skinData}" style="width: 80px; height: 80px; border-radius: 16px; object-fit: cover;">`;
            } else {
                homePreview.innerHTML = renderSkinCube(currentSkin.emoji, currentSkin.color, 80);
            }
            if (homePreviewName) homePreviewName.textContent = currentSkin.name;
        }
    }
    
    function updateSkinPreview() {
        const previewDiv = document.getElementById('currentSkinPreview');
        const previewName = document.getElementById('currentSkinName');
        const skinStyleSpan = document.getElementById('currentSkinStyle');
        
        if (previewDiv) {
            if (currentSkin.isCustom && currentSkin.skinData) {
                previewDiv.innerHTML = `<img src="${currentSkin.skinData}" style="width: 80px; height: 80px; border-radius: 16px; object-fit: cover;">`;
            } else {
                previewDiv.innerHTML = renderSkinCube(currentSkin.emoji, currentSkin.color, 80);
            }
        }
        if (previewName) previewName.textContent = currentSkin.name;
        if (skinStyleSpan) skinStyleSpan.textContent = currentSkin.skinStyle || 'Классический';
        
        updateHomeSkinPreview();
    }
    
    function renderPopularSkins() {
        const container = document.getElementById('popularSkins');
        if (!container) return;
        
        container.innerHTML = '';
        presetSkins.forEach(skin => {
            const skinCard = document.createElement('div');
            skinCard.className = 'skin-card-item';
            skinCard.innerHTML = `
                <div style="display: flex; justify-content: center; margin-bottom: 12px;">
                    ${renderSkinCube(skin.emoji, skin.color, 60)}
                </div>
                <div style="font-weight: 600; font-size: 14px;">${skin.name}</div>
                <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${skin.style}</div>
            `;
            skinCard.addEventListener('click', () => {
                currentSkin = { 
                    name: skin.name, 
                    emoji: skin.emoji, 
                    color: skin.color, 
                    isCustom: false, 
                    skinData: null,
                    skinStyle: skin.style
                };
                saveCurrentSkin();
                updateSkinPreview();
                addToConsole(`Выбран скин: ${skin.name}`, 'success');
                if (window.showNotification) window.showNotification(`Скин "${skin.name}" выбран!`, 'success');
            });
            container.appendChild(skinCard);
        });
    }
    
    function renderUserSkins() {
        const container = document.getElementById('mySkins');
        if (!container) return;
        
        container.innerHTML = '';
        
        const addCard = document.createElement('div');
        addCard.className = 'skin-card-add';
        addCard.innerHTML = `
            <div style="font-size: 32px;">+</div>
            <p style="margin-top: 8px; font-size: 12px;">Загрузить</p>
            <p style="font-size: 10px; color: var(--text-muted);">PNG 64x64</p>
        `;
        addCard.addEventListener('click', () => {
            document.getElementById('skinFileInput')?.click();
        });
        container.appendChild(addCard);
        
        userSkins.forEach((skin, index) => {
            const skinCard = document.createElement('div');
            skinCard.className = 'skin-card-item';
            skinCard.style.position = 'relative';
            skinCard.innerHTML = `
                <div style="display: flex; justify-content: center; margin-bottom: 12px;">
                    <img src="${skin.data}" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;">
                </div>
                <div style="font-weight: 600; font-size: 13px; overflow: hidden; text-overflow: ellipsis;">${skin.name}</div>
                <button class="delete-skin-btn" data-index="${index}">✕</button>
            `;
            skinCard.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-skin-btn')) return;
                currentSkin = { 
                    name: skin.name, 
                    emoji: '🎨', 
                    color: '#c084fc', 
                    isCustom: true, 
                    skinData: skin.data,
                    skinStyle: 'Пользовательский'
                };
                saveCurrentSkin();
                updateSkinPreview();
                addToConsole(`Выбран скин: ${skin.name}`, 'success');
                if (window.showNotification) window.showNotification(`Скин "${skin.name}" выбран!`, 'success');
            });
            
            const deleteBtn = skinCard.querySelector('.delete-skin-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    userSkins.splice(index, 1);
                    saveUserSkins();
                    renderUserSkins();
                    addToConsole(`Скин "${skin.name}" удалён`, 'info');
                });
            }
            container.appendChild(skinCard);
        });
    }
    
    // Экспорт скина
    function exportSkin() {
        if (!currentSkin) {
            alert('Нет выбранного скина');
            return;
        }
        
        const skinData = {
            name: currentSkin.name,
            type: currentSkin.isCustom ? 'custom' : 'preset',
            emoji: currentSkin.emoji,
            color: currentSkin.color,
            style: currentSkin.skinStyle,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(skinData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nightmc_skin_${currentSkin.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        addToConsole(`Скин "${currentSkin.name}" экспортирован!`, 'success');
        if (window.showNotification) window.showNotification(`Скин экспортирован!`, 'success');
    }
    
    // Импорт скина
    function importSkin() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const importedSkin = JSON.parse(ev.target.result);
                    userSkins.push({
                        name: importedSkin.name,
                        data: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="${importedSkin.color}"/><circle cx="32" cy="32" r="20" fill="${importedSkin.color}cc"/><text x="32" y="42" text-anchor="middle" font-size="30">${importedSkin.emoji}</text></svg>`
                    });
                    saveUserSkins();
                    renderUserSkins();
                    addToConsole(`Скин "${importedSkin.name}" импортирован!`, 'success');
                    if (window.showNotification) window.showNotification(`Скин импортирован!`, 'success');
                } catch (err) {
                    addToConsole('Ошибка импорта скина', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    function uploadSkin(file) {
        if (!file || !file.type.includes('image')) {
            addToConsole('Пожалуйста, выберите PNG изображение', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const skinData = e.target.result;
            const skinName = prompt('Введите название для скина:', file.name.replace('.png', ''));
            if (skinName) {
                userSkins.push({ name: skinName, data: skinData });
                saveUserSkins();
                renderUserSkins();
                addToConsole(`Скин "${skinName}" загружен!`, 'success');
                if (window.showNotification) window.showNotification(`Скин "${skinName}" загружен!`, 'success');
            }
        };
        reader.readAsDataURL(file);
    }
    
    function init() {
        loadSavedSkins();
        renderPopularSkins();
        renderUserSkins();
        updateSkinPreview();
        
        const fileInput = document.getElementById('skinFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    uploadSkin(e.target.files[0]);
                }
                fileInput.value = '';
            });
        }
        
        const applyBtn = document.getElementById('applySkinBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                saveCurrentSkin();
                addToConsole(`Скин "${currentSkin.name}" применён для игры!`, 'success');
                if (window.showNotification) window.showNotification(`Скин "${currentSkin.name}" применён!`, 'success');
            });
        }
        
        const exportBtn = document.getElementById('exportSkinBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportSkin);
        }
        
        const importBtn = document.getElementById('importSkinBtn');
        if (importBtn) {
            importBtn.addEventListener('click', importSkin);
        }
    }
    
    init();
});