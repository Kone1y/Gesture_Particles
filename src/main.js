import { ParticleSystem } from './particleSystem.js';
import { initCamera } from './camera.js';
import { initUI } from './ui.js';

const canvas = document.getElementById('particleCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ps = new ParticleSystem(canvas, 800);
ps.init();
ps.clear();

let lastTime = 0;
function animate(time) {
  if (time - lastTime < 16) {
    requestAnimationFrame(animate);
    return;
  }
  lastTime = time;
  ps.update();
  ps.render(time);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  ps.resize();
  ps.clear();
});

initUI(
  (shape) => ps.setShape(shape),
  (color) => ps.setColor(color),
);

let autoRotate = 0;

initCamera(
  (gesture) => {
    ps.updateGesture(gesture.openness, gesture.rotation);
    if (!gesture.detected) {
      autoRotate += 0.003;
      ps.targetRotation = autoRotate;
    } else {
      autoRotate = ps.targetRotation;
    }
  },
).then(() => {
  document.getElementById('loadingOverlay').classList.add('hidden');
}).catch((err) => {
  console.warn('Camera init failed:', err);
  document.getElementById('gestureStatus').textContent = 'Camera unavailable';
  document.getElementById('loadingOverlay').classList.add('hidden');
});
