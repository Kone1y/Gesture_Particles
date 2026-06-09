import { describe, it, expect } from 'vitest';
import {
  computeHandOpenness,
  computeHandRotation,
  analyzeGesture,
  createNullGesture,
} from '../src/gestureAnalyzer.js';

function makeMockLandmarks(fingerSpread) {
  const landmarks = [];
  for (let i = 0; i < 21; i++) {
    landmarks.push({ x: 0.5, y: 0.5, z: 0 });
  }
  landmarks[0] = { x: 0.5, y: 0.9, z: 0 };
  landmarks[9] = { x: 0.5, y: 0.6, z: 0 };

  const tipIndices = [4, 8, 12, 16, 20];
  const basePositions = [
    { x: 0.35, y: 0.5 },
    { x: 0.4, y: 0.35 },
    { x: 0.5, y: 0.3 },
    { x: 0.6, y: 0.35 },
    { x: 0.7, y: 0.4 },
  ];

  tipIndices.forEach((idx, i) => {
    const base = basePositions[i];
    landmarks[idx] = {
      x: 0.5 + (base.x - 0.5) * fingerSpread,
      y: 0.6 + (base.y - 0.6) * fingerSpread,
      z: 0,
    };
  });

  return landmarks;
}

describe('computeHandOpenness', () => {
  it('returns ~0 for closed fist', () => {
    const landmarks = makeMockLandmarks(0);
    const openness = computeHandOpenness(landmarks);
    expect(openness).toBeLessThan(0.2);
  });

  it('returns ~1 for fully open hand', () => {
    const landmarks = makeMockLandmarks(1);
    const openness = computeHandOpenness(landmarks);
    expect(openness).toBeGreaterThan(0.7);
  });

  it('returns intermediate value for half-open hand', () => {
    const closed = computeHandOpenness(makeMockLandmarks(0));
    const open = computeHandOpenness(makeMockLandmarks(1));
    const half = computeHandOpenness(makeMockLandmarks(0.5));
    expect(half).toBeGreaterThan(closed);
    expect(half).toBeLessThan(open);
  });

  it('output is clamped to [0, 1]', () => {
    const landmarks = makeMockLandmarks(1);
    const openness = computeHandOpenness(landmarks);
    expect(openness).toBeGreaterThanOrEqual(0);
    expect(openness).toBeLessThanOrEqual(1);
  });
});

describe('computeHandRotation', () => {
  it('returns ~0 when hand points up', () => {
    const landmarks = makeMockLandmarks(0.5);
    landmarks[0] = { x: 0.5, y: 0.9, z: 0 };
    landmarks[9] = { x: 0.5, y: 0.5, z: 0 };
    const rotation = computeHandRotation(landmarks);
    expect(Math.abs(rotation)).toBeLessThan(0.3);
  });

  it('returns negative when hand tilts left', () => {
    const landmarks = makeMockLandmarks(0.5);
    landmarks[0] = { x: 0.7, y: 0.8, z: 0 };
    landmarks[9] = { x: 0.3, y: 0.4, z: 0 };
    const rotation = computeHandRotation(landmarks);
    expect(rotation).toBeLessThan(-0.1);
  });

  it('returns positive when hand tilts right', () => {
    const landmarks = makeMockLandmarks(0.5);
    landmarks[0] = { x: 0.3, y: 0.8, z: 0 };
    landmarks[9] = { x: 0.7, y: 0.4, z: 0 };
    const rotation = computeHandRotation(landmarks);
    expect(rotation).toBeGreaterThan(0.1);
  });

  it('output is in [-1, 1] range', () => {
    const landmarks = makeMockLandmarks(1);
    const rotation = computeHandRotation(landmarks);
    expect(rotation).toBeGreaterThanOrEqual(-1);
    expect(rotation).toBeLessThanOrEqual(1);
  });
});

describe('analyzeGesture', () => {
  it('returns openness, rotation, and detected=true', () => {
    const landmarks = makeMockLandmarks(0.7);
    const gesture = analyzeGesture(landmarks);
    expect(gesture).toHaveProperty('openness');
    expect(gesture).toHaveProperty('rotation');
    expect(gesture.detected).toBe(true);
  });
});

describe('createNullGesture', () => {
  it('returns default values when no hand detected', () => {
    const gesture = createNullGesture();
    expect(gesture).toEqual({ openness: 0.5, rotation: 0, detected: false });
  });
});
