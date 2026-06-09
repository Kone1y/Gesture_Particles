import {
  generateHeart,
  generateFlower,
  generateSaturn,
  generateFirework,
} from './shapes.js';

const SHAPE_FNS = {
  heart: generateHeart,
  flower: generateFlower,
  saturn: generateSaturn,
  firework: generateFirework,
};

const SMOOTH = 0.06;
const LERP_SPEED = 0.045;
const DAMPING = 0.88;
const TRAIL_ALPHA = 0.12;
const PARTICLE_COUNT = 600;

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export class ParticleSystem {
  constructor(canvas, particleCount = PARTICLE_COUNT) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particleCount = particleCount;
    this.particles = [];
    this.currentShape = 'heart';
    this.color = '#ff6b9d';
    this.scale = 1;
    this.rotation = 0;
    this.targetScale = 1;
    this.targetRotation = 0;
    this.shapeScale = Math.min(canvas.width, canvas.height) * 0.018;
  }

  init() {
    this.shapeScale = Math.min(this.canvas.width, this.canvas.height) * 0.018;
    this.setShape(this.currentShape);
  }

  setShape(name) {
    if (!SHAPE_FNS[name]) return;
    this.currentShape = name;
    const points = SHAPE_FNS[name](this.particleCount, this.shapeScale);
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    if (this.particles.length === 0) {
      this.particles = points.map(p => ({
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        baseTargetX: p.x + cx,
        baseTargetY: p.y + cy,
        size: 1.5 + Math.random() * 2,
        alpha: 0.6 + Math.random() * 0.4,
      }));
    } else {
      points.forEach((p, i) => {
        this.particles[i].baseTargetX = p.x + cx;
        this.particles[i].baseTargetY = p.y + cy;
      });
    }
  }

  setColor(hex) {
    this.color = hex;
  }

  updateGesture(openness, rotation) {
    this.targetScale = 0.5 + openness * 1.5;
    this.targetRotation = rotation * Math.PI * 2;
  }

  update() {
    this.scale += (this.targetScale - this.scale) * SMOOTH;
    this.rotation += (this.targetRotation - this.rotation) * SMOOTH;

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    for (const p of this.particles) {
      const dx = p.baseTargetX - cx;
      const dy = p.baseTargetY - cy;
      const sx = dx * this.scale;
      const sy = dy * this.scale;
      const tx = sx * cos - sy * sin + cx;
      const ty = sx * sin + sy * cos + cy;

      p.vx += (tx - p.x) * LERP_SPEED;
      p.vy += (ty - p.y) * LERP_SPEED;
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  render() {
    const { ctx, canvas, color, particles } = this;
    ctx.fillStyle = `rgba(10, 10, 20, ${TRAIL_ALPHA})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const r = p.size * this.scale;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      grad.addColorStop(0, hexToRgba(color, p.alpha * 0.6));
      grad.addColorStop(0.4, hexToRgba(color, p.alpha * 0.15));
      grad.addColorStop(1, hexToRgba(color, 0));
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, p.alpha);
      ctx.fill();
    }
  }

  clear() {
    const { ctx, canvas } = this;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  resize() {
    const oldScale = this.shapeScale;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.shapeScale = Math.min(this.canvas.width, this.canvas.height) * 0.018;
    const ratio = this.shapeScale / oldScale;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    for (const p of this.particles) {
      p.baseTargetX = (p.baseTargetX - cx) * ratio + cx;
      p.baseTargetY = (p.baseTargetY - cy) * ratio + cy;
    }
  }
}
