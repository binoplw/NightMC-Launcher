const ramSys = document.getElementById('ramSys'); const ramSysVal = document.getElementById('ramSysVal');
if (ramSys) ramSys.addEventListener('input', () => ramSysVal.innerText = ramSys.value);
document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    const enabled = document.getElementById('particlesToggle').checked;
    if (!enabled) window.particlesCtx?.clearRect(0, 0, canvas.width, canvas.height);
    else { window.particleCount = parseInt(document.getElementById('particlesCount').value); window.createParticles(); }
    localStorage.setItem('nightmc_ram', ramSys?.value || '2048');
    window.notify('Настройки сохранены');
});
document.getElementById('particlesCount')?.addEventListener('input', (e) => document.getElementById('particlesCountVal').innerText = e.target.value);
document.getElementById('openGameFolderBtn')?.addEventListener('click', () => { const path = document.getElementById('gamePath').value; window.nightMC?.openExternal(`file:///${path.replace(/\\/g, '/')}`); });
document.getElementById('uploadBgBtn')?.addEventListener('click', () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*,video/*';
    inp.onchange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const url = URL.createObjectURL(file); const bgDiv = document.getElementById('customBg'); bgDiv.innerHTML = '';
        if (file.type.startsWith('image/')) { const img = document.createElement('img'); img.src = url; img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover'; bgDiv.appendChild(img); }
        else { const vid = document.createElement('video'); vid.src = url; vid.autoplay = true; vid.loop = true; vid.muted = true; vid.style.width = '100%'; vid.style.height = '100%'; vid.style.objectFit = 'cover'; bgDiv.appendChild(vid); vid.play(); }
        bgDiv.classList.add('active'); localStorage.setItem('nightmc_custom_bg', url); window.notify('Фон изменён');
    }; inp.click();
});
document.getElementById('resetBgBtn')?.addEventListener('click', () => { document.getElementById('customBg').innerHTML = ''; document.getElementById('customBg').classList.remove('active'); localStorage.removeItem('nightmc_custom_bg'); window.notify('Фон сброшен'); });