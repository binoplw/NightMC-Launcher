const languageSelect = document.getElementById('languageSelect');
if (languageSelect) {
    const savedLang = localStorage.getItem('nightmc_language') || 'ru';
    languageSelect.value = savedLang;
    languageSelect.addEventListener('change', (e) => {
        localStorage.setItem('nightmc_language', e.target.value);
        window.notify(`Язык изменён на ${e.target.options[e.target.selectedIndex].text}`);
    });
}