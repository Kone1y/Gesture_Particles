import {
  generateStarCluster,
  generateHeart,
  generateFlower,
  generateSaturn,
  generateFirework,
} from './shapes.js';

const SHAPE_FNS = {
  starcluster: generateStarCluster,
  heart: generateHeart,
  flower: generateFlower,
  saturn: generateSaturn,
  firework: generateFirework,
};

const SHAPE_3D = new Set(['starcluster']);

const SMOOTH = 0.06;
const LERP_SPEED = 0.045;
const DAMPING = 0.88;
const TRAIL_ALPHA = 0.1;
const PARTICLE_COUNT = 800;

function generateStarColor(baseHex) {
  const r0 = parseInt(baseHex.slice(1, 3), 16);
  const g0 = parseInt(baseHex.slice(3, 5), 16);
  const b0 = parseInt(baseHex.slice(5, 7), 16);
  const hueShift = (Math.random() - 0.5) * 120;
  const satShift = (Math.random() - 0.5) * 0.3;
  const [h, s, l] = rgbToHsl(r0, g0, b0);
  const [r, g, b] = hslToRgb(
    (h + hueShift / 360 + 1) % 1,
    Math.max(0.1, Math.min(1, s + satShift)),
    Math.max(0.4, Math.min(0.95, l + (Math.random() - 0.5) * 0.3)),
  );
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const hueMap = [
    [r, (g - b) / d + (g < b ? 6 : 0)],
    [g, (b - r) / d + 2],
    [b, (r - g) / d + 4],
  ];
  const [, h] = hueMap.find(([c]) => c === max);
  return [h / 6, s, l];
}

function hslToRgb(h, s, l) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

export class ParticleSystem {
  constructor(canvas, particleCount = PARTICLE_COUNT) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particleCount = particleCount;
    this.particles = [];
    this.currentShape = 'starcluster';
    this.color = '#a0c4ff';
    this.scale = 1;
    this.rotation = 0;
    this.targetScale = 1;
    this.targetRotation = 0;
    this.shapeScale = Math.min(canvas.width, canvas.height) * 0.018;
  }

  init() {
    this.shapeScale = Math.min(this.canvas.width, this.canvas.height) * 0.018;
    this.setShape(this.currentShape);
    this.assignColors();
    for (const p of this.particles) {
      p.x = Math.random() * this.canvas.width;
      p.y = Math.random() * this.canvas.height;
    }
  }

  setShape(name) {
    if (!SHAPE_FNS[name]) return;
    this.currentShape = name;
    const points = SHAPE_FNS[name](this.particleCount, this.shapeScale);
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const is3D = SHAPE_3D.has(name);

    if (this.particles.length === 0) {
      this.particles = points.map(p => ({
        x: cx, y: cy, vx: 0, vy: 0,
        baseTargetX: p.x,
        baseTargetY: p.y,
        baseTargetZ: p.z || 0,
        size: 0.8 + Math.random() * 2.5,
        alpha: 0.5 + Math.random() * 0.5,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
        cr: 200, cg: 220, cb: 255,
        depth: 1,
      }));
    } else {
      points.forEach((p, i) => {
        this.particles[i].baseTargetX = p.x;
        this.particles[i].baseTargetY = p.y;
        this.particles[i].baseTargetZ = p.z || 0;
      });
    }
  }

  assignColors() {
    for (const p of this.particles) {
      const c = generateStarColor(this.color);
      p.cr = c.r;
      p.cg = c.g;
      p.cb = c.b;
    }
  }

  setColor(hex) {
    this.color = hex;
    this.assignColors();
  }

  updateGesture(openness, rotation) {
    this.targetScale = 0.15 + openness * 2.5;
    this.targetRotation = rotation * Math.PI * 2;
  }

  update() {
    this.scale += (this.targetScale - this.scale) * SMOOTH;
    this.rotation += (this.targetRotation - this.rotation) * SMOOTH;

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const is3D = SHAPE_3D.has(this.currentShape);
    const fov = Math.min(this.canvas.width, this.canvas.height) * 0.9;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const pullStrength = LERP_SPEED + (1 - Math.min(this.scale, 3) / 3) * 0.04;

    if (is3D) {
      for (const p of this.particles) {
        const sx = p.baseTargetX * this.scale;
        const sy = p.baseTargetY * this.scale;
        const sz = p.baseTargetZ * this.scale;

        // Y-axis rotation
        const rx = sx * cos + sz * sin;
        const rz = -sx * sin + sz * cos;

        // Perspective projection
        const depth = rz + fov;
        const factor = fov / Math.max(depth, 1);
        const tx = rx * factor + cx;
        const ty = sy * factor + cy;

        p.vx += (tx - p.x) * pullStrength;
        p.vy += (ty - p.y) * pullStrength;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;
        p.depth = factor;
      }
    } else {
      for (const p of this.particles) {
        const dx = p.baseTargetX;
        const dy = p.baseTargetY;
        const sx = dx * this.scale;
        const sy = dy * this.scale;
        const tx = sx * cos - sy * sin + cx;
        const ty = sx * sin + sy * cos + cy;

        p.vx += (tx - p.x) * pullStrength;
        p.vy += (ty - p.y) * pullStrength;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;
        p.depth = 1;
      }
    }
  }

  render(time = 0) {
    const { ctx, canvas, particles } = this;

    ctx.fillStyle = `rgba(6, 6, 18, ${TRAIL_ALPHA})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Depth sort: farthest first (back to front)
    particles.sort((a, b) => a.depth - b.depth);

    // Glow layer (additive blending)
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const d = Math.max(0.3, Math.min(1.8, p.depth));
      const twinkle = 0.7 + 0.3 * Math.sin(time * 0.001 * p.twinkleSpeed + p.twinkleOffset);
      const a = p.alpha * twinkle * (0.3 + 0.7 * d);
      const r = p.size * d * (0.5 + this.scale * 0.2);
      const glowR = Math.max(1, r * 4);

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
      grad.addColorStop(0, `rgba(${p.cr},${p.cg},${p.cb},${(a * 0.8).toFixed(3)})`);
      grad.addColorStop(0.3, `rgba(${p.cr},${p.cg},${p.cb},${(a * 0.2).toFixed(3)})`);
      grad.addColorStop(1, `rgba(${p.cr},${p.cg},${p.cb},0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Core bright dot per star
    ctx.globalCompositeOperation = 'source-over';
    for (const p of particles) {
      const d = Math.max(0.3, Math.min(1.8, p.depth));
      const twinkle = 0.7 + 0.3 * Math.sin(time * 0.001 * p.twinkleSpeed + p.twinkleOffset);
      const a = p.alpha * twinkle * (0.3 + 0.7 * d);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * 0.4 * d), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},${a.toFixed(3)})`;
      ctx.fill();
    }
  }

  clear() {
    const { ctx, canvas } = this;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#060612';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  resize() {
    const oldScale = this.shapeScale;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.shapeScale = Math.min(this.canvas.width, this.canvas.height) * 0.018;
    const ratio = this.shapeScale / oldScale;
    for (const p of this.particles) {
      p.baseTargetX *= ratio;
      p.baseTargetY *= ratio;
      p.baseTargetZ *= ratio;
    }
  }
}
