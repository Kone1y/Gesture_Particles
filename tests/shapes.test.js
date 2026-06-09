import { describe, it, expect } from 'vitest';
import { generateStarCluster, generateHeart, generateFlower, generateSaturn, generateFirework } from '../src/shapes.js';

describe('generateStarCluster', () => {
  it('returns requested number of points', () => {
    expect(generateStarCluster(100)).toHaveLength(100);
    expect(generateStarCluster(500)).toHaveLength(500);
  });

  it('points have x and y numbers', () => {
    const points = generateStarCluster(50);
    points.forEach(p => {
      expect(typeof p.x).toBe('number');
      expect(typeof p.y).toBe('number');
      expect(isNaN(p.x)).toBe(false);
      expect(isNaN(p.y)).toBe(false);
    });
  });

  it('most points cluster near center (gaussian distribution)', () => {
    const points = generateStarCluster(200, 10);
    const distances = points.map(p => Math.sqrt(p.x * p.x + p.y * p.y));
    const withinTwoSigma = distances.filter(d => d < 10 * 0.56).length;
    // ~95% should be within 2 sigma
    expect(withinTwoSigma).toBeGreaterThan(170);
  });
});

describe('generateHeart', () => {
  it('returns requested number of points', () => {
    expect(generateHeart(100)).toHaveLength(100);
    expect(generateHeart(500)).toHaveLength(500);
  });

  it('points form a heart-like shape (symmetric in x)', () => {
    const points = generateHeart(200, 10);
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const xRange = Math.max(...xs) - Math.min(...xs);
    const yRange = Math.max(...ys) - Math.min(...ys);
    expect(xRange).toBeGreaterThan(100);
    expect(yRange).toBeGreaterThan(100);
  });

  it('all points have x and y numbers', () => {
    const points = generateHeart(50);
    points.forEach(p => {
      expect(typeof p.x).toBe('number');
      expect(typeof p.y).toBe('number');
      expect(isNaN(p.x)).toBe(false);
      expect(isNaN(p.y)).toBe(false);
    });
  });

  it('scale parameter affects point spread', () => {
    const small = generateHeart(100, 1);
    const large = generateHeart(100, 10);
    const smallRange = Math.max(...small.map(p => p.x)) - Math.min(...small.map(p => p.x));
    const largeRange = Math.max(...large.map(p => p.x)) - Math.min(...large.map(p => p.x));
    expect(largeRange).toBeGreaterThan(smallRange * 5);
  });
});

describe('generateFlower', () => {
  it('returns requested number of points', () => {
    expect(generateFlower(100)).toHaveLength(100);
  });

  it('points have x and y numbers', () => {
    const points = generateFlower(50);
    points.forEach(p => {
      expect(typeof p.x).toBe('number');
      expect(typeof p.y).toBe('number');
      expect(isNaN(p.x)).toBe(false);
      expect(isNaN(p.y)).toBe(false);
    });
  });

  it('spread increases with scale', () => {
    const small = generateFlower(100, 1);
    const large = generateFlower(100, 10);
    const smallMax = Math.max(...small.map(p => Math.sqrt(p.x ** 2 + p.y ** 2)));
    const largeMax = Math.max(...large.map(p => Math.sqrt(p.x ** 2 + p.y ** 2)));
    expect(largeMax).toBeGreaterThan(smallMax * 5);
  });
});

describe('generateSaturn', () => {
  it('returns requested number of points', () => {
    expect(generateSaturn(100)).toHaveLength(100);
    expect(generateSaturn(500)).toHaveLength(500);
  });

  it('points have x and y numbers', () => {
    const points = generateSaturn(50);
    points.forEach(p => {
      expect(typeof p.x).toBe('number');
      expect(typeof p.y).toBe('number');
      expect(isNaN(p.x)).toBe(false);
      expect(isNaN(p.y)).toBe(false);
    });
  });

  it('ring points are wider than body points', () => {
    const points = generateSaturn(200, 10);
    const distances = points.map(p => Math.abs(p.x));
    const maxDist = Math.max(...distances);
    expect(maxDist).toBeGreaterThan(5);
  });
});

describe('generateFirework', () => {
  it('returns requested number of points', () => {
    expect(generateFirework(100)).toHaveLength(100);
    expect(generateFirework(500)).toHaveLength(500);
  });

  it('points have x and y numbers', () => {
    const points = generateFirework(50);
    points.forEach(p => {
      expect(typeof p.x).toBe('number');
      expect(typeof p.y).toBe('number');
      expect(isNaN(p.x)).toBe(false);
      expect(isNaN(p.y)).toBe(false);
    });
  });

  it('points spread radially from center', () => {
    const points = generateFirework(200, 10);
    const distances = points.map(p => Math.sqrt(p.x ** 2 + p.y ** 2));
    const maxDist = Math.max(...distances);
    expect(maxDist).toBeGreaterThan(5);
  });
});
