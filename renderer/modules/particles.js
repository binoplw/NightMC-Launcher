const canvas = document.getElementById('particlesCanvas');
let ctx = canvas.getContext('2d');
let particles = [], particleCount = 40;
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
function createParticles() { particles = []; for (let i = 0; i < particleCount; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 3 + 1, speedX: (Math.random() - 0.5) * 0.8, speedY: (Math.random() - 0.5) * 0.8, color: `rgba(192, 132, 252, ${Math.random() * 0.5 + 0.2})` }); }
function animateParticles() { if (!ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); for (let p of particles) { p.x += p.speedX; p.y += p.speedY; if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0; if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); } requestAnimationFrame(animateParticles); }
window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
resizeCanvas(); createParticles(); animateParticles();