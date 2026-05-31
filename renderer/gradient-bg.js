const gradientBg = document.getElementById('gradientBg');
const gradientToggle = document.getElementById('gradientToggle');
const gradientSpeed = document.getElementById('gradientSpeed');
const gradientSpeedVal = document.getElementById('gradientSpeedVal');

let currentSpeed = 8;
function updateGradientSpeed() { gradientBg.style.animation = `gradientShift ${currentSpeed}s ease infinite`; }
if (gradientSpeed) {
    gradientSpeed.addEventListener('input', (e) => { currentSpeed = e.target.value; gradientSpeedVal.innerText = currentSpeed + 'с'; updateGradientSpeed(); });
}
if (gradientToggle) {
    gradientToggle.addEventListener('change', (e) => { gradientBg.style.display = e.target.checked ? 'block' : 'none'; localStorage.setItem('nightmc_gradient_enabled', e.target.checked); });
}
const savedGradient = localStorage.getItem('nightmc_gradient_enabled');
if (savedGradient === 'false') { gradientBg.style.display = 'none'; if (gradientToggle) gradientToggle.checked = false; }