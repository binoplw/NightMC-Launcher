let currentUser = JSON.parse(localStorage.getItem('nightmc_user') || '{"name":"Гость","type":null}');
function updateUI() {
    document.getElementById('userName').innerText = currentUser.name;
    document.getElementById('userStatus').innerText = currentUser.type ? `${currentUser.type} аккаунт` : 'Не авторизован';
    document.getElementById('logoutBtn').style.display = currentUser.type ? 'inline-block' : 'none';
    const av = document.getElementById('planetAvatar');
    if (currentUser.type === 'microsoft') av.innerHTML = '🪟';
    else if (currentUser.type === 'mojang') av.innerHTML = '⛏️';
    else av.innerHTML = '●';
}
const modal = document.getElementById('authModal');
document.getElementById('planetAvatar')?.addEventListener('click', () => modal.classList.add('active'));
document.getElementById('closeModal')?.addEventListener('click', () => modal.classList.remove('active'));
document.querySelectorAll('[data-auth]').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-auth');
        document.getElementById('offlineArea').style.display = 'none';
        if (type === 'offline') document.getElementById('offlineArea').style.display = 'block';
        else { window.nightMC?.openExternal(type === 'microsoft' ? 'https://login.live.com' : 'https://www.minecraft.net/msaprofile'); currentUser = { name: `${type === 'microsoft' ? 'Microsoft' : 'Mojang'}Player`, type: type }; localStorage.setItem('nightmc_user', JSON.stringify(currentUser)); updateUI(); modal.classList.remove('active'); window.notify(`Вход через ${type}`); }
    });
});
document.getElementById('offlineLoginBtn')?.addEventListener('click', () => { const nick = document.getElementById('offlineNick').value.trim(); if (nick) { currentUser = { name: nick, type: 'offline' }; localStorage.setItem('nightmc_user', JSON.stringify(currentUser)); updateUI(); modal.classList.remove('active'); window.notify(`Вход как ${nick}`); } });
document.getElementById('logoutBtn')?.addEventListener('click', () => { currentUser = { name: 'Гость', type: null }; localStorage.removeItem('nightmc_user'); updateUI(); window.notify('Вы вышли'); });
updateUI();