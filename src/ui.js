export function initUI(onShapeChange, onColorChange) {
  const shapeButtons = document.querySelectorAll('.shape-btn');
  shapeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      shapeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      onShapeChange(btn.dataset.shape);
    });
  });

  const colorPicker = document.getElementById('colorPicker');
  colorPicker.addEventListener('input', (e) => {
    onColorChange(e.target.value);
    const activeBtn = document.querySelector('.shape-btn.active');
    if (activeBtn) {
      activeBtn.style.borderColor = e.target.value + '80';
      activeBtn.style.background = e.target.value + '20';
    }
  });

  const fullscreenBtn = document.getElementById('fullscreenBtn');
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'f' || e.key === 'F') toggleFullscreen();

    const shapeMap = { '1': 'starcluster', '2': 'heart', '3': 'flower', '4': 'saturn', '5': 'firework' };
    if (shapeMap[e.key]) {
      shapeButtons.forEach((b) => b.classList.remove('active'));
      const target = document.querySelector(`[data-shape="${shapeMap[e.key]}"]`);
      if (target) {
        target.classList.add('active');
        onShapeChange(shapeMap[e.key]);
      }
    }
  });
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('fullscreenBtn');
  btn.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
});
