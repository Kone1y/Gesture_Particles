import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/particleSystem.js';

function createMockCanvas(w = 800, h = 600) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

describe('ParticleSystem', () => {
  let canvas;

  beforeEach(() => {
    canvas = createMockCanvas();
  });

  it('initializes with correct particle count', () => {
    const ps = new ParticleSystem(canvas, 100);
    ps.setShape('heart');
    expect(ps.particles).toHaveLength(100);
  });

  it('setShape updates all particle targets', () => {
    const ps = new ParticleSystem(canvas, 50);
    ps.setShape('heart');
    const heartTargets = ps.particles.map(p => ({ x: p.baseTargetX, y: p.baseTargetY }));

    ps.setShape('flower');
    const flowerTargets = ps.particles.map(p => ({ x: p.baseTargetX, y: p.baseTargetY }));

    const changed = heartTargets.some((h, i) =>
      Math.abs(h.x - flowerTargets[i].x) > 0.1 || Math.abs(h.y - flowerTargets[i].y) > 0.1
    );
    expect(changed).toBe(true);
  });

  it('updateGesture changes targetScale and targetRotation', () => {
    const ps = new ParticleSystem(canvas, 10);
    ps.setShape('heart');

    ps.updateGesture(1.0, 0.5);
    expect(ps.targetScale).toBe(2.0);
    expect(ps.targetRotation).toBe(Math.PI);

    ps.updateGesture(0.0, -1.0);
    expect(ps.targetScale).toBe(0.5);
    expect(ps.targetRotation).toBe(-Math.PI * 2);
  });

  it('update smooths scale toward target', () => {
    const ps = new ParticleSystem(canvas, 10);
    ps.setShape('heart');
    ps.scale = 1.0;
    ps.targetScale = 2.0;

    for (let i = 0; i < 60; i++) ps.update();

    expect(ps.scale).toBeGreaterThan(1.0);
    expect(ps.scale).toBeLessThanOrEqual(2.0);
  });

  it('setColor changes the particle color', () => {
    const ps = new ParticleSystem(canvas, 10);
    ps.setShape('heart');
    ps.setColor('#00ff00');
    expect(ps.color).toBe('#00ff00');
  });

  it('supports all 4 shape names', () => {
    const ps = new ParticleSystem(canvas, 10);
    const shapes = ['heart', 'flower', 'saturn', 'firework'];
    shapes.forEach(shape => {
      ps.setShape(shape);
      expect(ps.currentShape).toBe(shape);
    });
  });
});
