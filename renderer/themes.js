const themes = { dark: { name: 'Тёмная', class: '' }, light: { name: 'Светлая', class: 'theme-light' }, oled: { name: 'OLED', class: 'theme-oled' } };
function renderThemes() {
    const c = document.getElementById('themesGrid'); if (!c) return;
    c.innerHTML = '';
    Object.entries(themes).forEach(([key, theme]) => {
        const btn = document.createElement('button'); btn.className = 'btn-outline'; btn.style.margin = '4px'; btn.textContent = theme.name;
        btn.onclick = () => { document.body.className = theme.class; localStorage.setItem('nightmc_theme', key); };
        c.appendChild(btn);
    });
    const saved = localStorage.getItem('nightmc_theme'); if (saved && themes[saved]) document.body.className = themes[saved].class;
}
renderThemes();