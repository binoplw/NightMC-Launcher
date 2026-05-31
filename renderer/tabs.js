const tabsOverlay = document.getElementById('tabsOverlay');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const hotbarItems = document.querySelectorAll('.hotbar-item');

function openTab(tabId) {
    tabsOverlay.classList.add('active');
    tabContents.forEach(t => t.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
    navItems.forEach(n => n.classList.remove('active'));
    const activeNav = Array.from(navItems).find(n => n.getAttribute('data-tab') === tabId);
    if (activeNav) activeNav.classList.add('active');
}

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = item.getAttribute('data-tab');
        if (tabId === 'home') tabsOverlay.classList.remove('active');
        else openTab(tabId);
    });
});
hotbarItems.forEach(item => {
    item.addEventListener('click', () => { const tabId = item.getAttribute('data-tab'); if (tabId) openTab(tabId); });
});
document.getElementById('closeTabsBtn')?.addEventListener('click', () => tabsOverlay.classList.remove('active'));