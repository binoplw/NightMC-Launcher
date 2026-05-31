let servers = [{ name: 'Hypixel', ip: 'mc.hypixel.net', players: '45.2k', online: true }, { name: '2b2t', ip: '2b2t.org', players: '856', online: true }, { name: 'Mineplex', ip: 'us.mineplex.com', players: '0', online: false }];
function renderServers() {
    const c = document.getElementById('serversGrid'); if (!c) return;
    c.innerHTML = '';
    servers.forEach(s => {
        const card = document.createElement('div'); card.className = 'server-card';
        card.innerHTML = `<div><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${s.online ? '#22c55e' : '#ef4444'};"></span><strong>${s.name}</strong></div><div>${s.ip}</div><div>👥 ${s.players}</div><button class="btn-primary play-server">Играть</button>`;
        card.querySelector('.play-server').onclick = () => window.notify(`Подключение к ${s.name}...`);
        c.appendChild(card);
    });
}
renderServers();