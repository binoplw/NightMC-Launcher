document.getElementById('clearConsole')?.addEventListener('click', () => {
    document.getElementById('consoleLogs').innerHTML = '';
    window.log('Консоль очищена');
});

window.log('NightMC Elite готов');