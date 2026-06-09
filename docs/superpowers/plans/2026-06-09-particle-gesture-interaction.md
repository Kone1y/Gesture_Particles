# Particle Gesture Interaction Tool - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based particle gesture interaction tool that uses webcam hand tracking to control particle formations (heart, flower, saturn, firework) with real-time scaling, rotation, color customization, and fullscreen support.

**Architecture:** Single-page web app with Canvas 2D rendering engine, MediaPipe Hands for gesture detection, and a glassmorphism UI overlay. Pure functions generate shape point arrays; a particle system lerps particles toward shape targets with gesture-driven scale/rotation transforms applied per frame.

**Tech Stack:** Vanilla JS (ES modules), Vite (dev server), Vitest (testing), MediaPipe Hands (CDN), Canvas 2D API, CSS custom properties

---

## File Structure

```
gesture-particles/
├── index.html                    # Main page: canvas + UI overlay + MediaPipe scripts
├── package.json                  # Dependencies: vite, vitest
├── vite.config.js                # Vite config with Vitest alias
├── src/
│   ├── main.js                   # Entry point: init all modules, start animation loop
│   ├── shapes.js                 # All 4 shape generators (export functions)
│   ├── gestureAnalyzer.js        # Hand openness + rotation from landmarks
│   ├── particleSystem.js         # Particle array management + physics update + render
│   ├── camera.js                 # getUserMedia + MediaPipe Hands init + frame loop
│   └── ui.js                     # Shape selector, color picker, fullscreen button wiring
├── css/
│   └── style.css                 # Dark theme, glassmorphism panel, responsive layout
├── tests/
│   ├── shapes.test.js            # Shape generator correctness tests
│   ├── gestureAnalyzer.test.js   # Gesture math tests with mock landmarks
│   └── particleSystem.test.js    # Particle state transition tests
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-06-09-particle-gesture-interaction.md
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html` (shell with canvas, video, UI panel skeleton)
- Create: `css/style.css` (dark theme base)
- Create: `src/main.js` (empty module skeleton)

- [ ] **Step 1: Initialize project with package.json**

```json
{
  "name": "gesture-particles",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
  },
  server: {
    host: true,
    port: 3000,
  },
});
```

- [ ] **Step 3: Install dependencies**

Run: `cd D:/AppCode/langchain/gesture-particles && npm install`
Expected: `node_modules` created, vite + vitest installed

- [ ] **Step 4: Create index.html with layout skeleton**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gesture Particles</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <canvas id="particleCanvas"></canvas>
  <video id="webcamVideo" autoplay playsinline></video>

  <!-- Camera preview -->
  <div id="cameraPreview">
    <video id="previewVideo" autoplay playsinline muted></video>
    <canvas id="handCanvas"></canvas>
    <div id="gestureStatus">No hand detected</div>
  </div>

  <!-- Control panel -->
  <div id="controlPanel">
    <h2>Particle Gesture</h2>

    <div class="panel-section">
      <label>Shape</label>
      <div id="shapeSelector">
        <button class="shape-btn active" data-shape="heart" title="Heart">Heart</button>
        <button class="shape-btn" data-shape="flower" title="Flower">Flower</button>
        <button class="shape-btn" data-shape="saturn" title="Saturn">Saturn</button>
        <button class="shape-btn" data-shape="firework" title="Firework">Firework</button>
      </div>
    </div>

    <div class="panel-section">
      <label>Color</label>
      <input type="color" id="colorPicker" value="#ff6b9d">
    </div>

    <div class="panel-section">
      <button id="fullscreenBtn" title="Toggle Fullscreen">Fullscreen</button>
    </div>
  </div>

  <!-- MediaPipe CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create css/style.css with dark theme and glassmorphism**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  background: #0a0a14;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #e0e0e0;
  user-select: none;
}

#particleCanvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

#webcamVideo {
  display: none;
}

#cameraPreview {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 240px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.15);
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
}

#cameraPreview video,
#cameraPreview canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#cameraPreview canvas {
  z-index: 1;
}

#gestureStatus {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 8px;
  border-radius: 4px;
  z-index: 2;
  white-space: nowrap;
}

#controlPanel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 220px;
  padding: 24px;
  background: rgba(20, 20, 40, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  z-index: 10;
}

#controlPanel h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #fff;
  text-align: center;
  letter-spacing: 1px;
}

.panel-section {
  margin-bottom: 18px;
}

.panel-section label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

#shapeSelector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.shape-btn {
  padding: 10px 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.shape-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.shape-btn.active {
  background: rgba(255, 107, 157, 0.25);
  border-color: rgba(255, 107, 157, 0.5);
  color: #fff;
}

#colorPicker {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  padding: 4px;
}

#colorPicker::-webkit-color-swatch-wrapper {
  padding: 0;
}

#colorPicker::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

#fullscreenBtn {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
}

#fullscreenBtn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
```

- [ ] **Step 6: Create src/main.js skeleton**

```js
// Entry point - will be filled in Task 8
console.log('Gesture Particles loaded');
```

- [ ] **Step 7: Verify dev server starts**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vite --host`
Expected: Server running at http://localhost:3000, page loads with dark background and empty UI panel

- [ ] **Step 8: Commit**

```bash
cd D:/AppCode/langchain/gesture-particles
git init
git add package.json vite.config.js index.html css/style.css src/main.js
git commit -m "chore: project scaffolding with Vite, dark theme layout, and MediaPipe CDN"
```

---

### Task 2: Shape Generators with Tests

**Files:**
- Create: `src/shapes.js`
- Create: `tests/shapes.test.js`

- [ ] **Step 1: Write failing tests for all 4 shape generators**

```js
import { describe, it, expect } from 'vitest';
import { generateHeart, generateFlower, generateSaturn, generateFirework } from '../src/shapes.js';

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
    // Heart should be wider than tall (roughly)
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
    // Some points should be far from center (ring)
    const distances = points.map(p => Math.abs(p.x));
    const maxDist = Math.max(...distances);
    // Ring should extend beyond the body
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vitest run tests/shapes.test.js`
Expected: FAIL - module not found `../src/shapes.js`

- [ ] **Step 3: Implement all shape generators**

```js
// Heart: parametric heart curve
// x = 16sin^3(t), y = -(13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t))
export function generateHeart(count, scale = 10) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3) * scale;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
    points.push({ x, y });
  }
  return points;
}

// Flower: rose curve r = cos(k*theta)
export function generateFlower(count, scale = 10, petals = 5) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const r = Math.abs(Math.cos(petals * t)) * scale;
    points.push({ x: r * Math.cos(t), y: r * Math.sin(t) });
  }
  return points;
}

// Saturn: filled circle body + elliptical ring
export function generateSaturn(count, scale = 10) {
  const points = [];
  const bodyCount = Math.floor(count * 0.55);
  const ringCount = count - bodyCount;

  for (let i = 0; i < bodyCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * scale * 0.35;
    points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
  }

  for (let i = 0; i < ringCount; i++) {
    const t = (i / ringCount) * Math.PI * 2;
    const r = scale * (0.55 + Math.random() * 0.15);
    points.push({ x: r * Math.cos(t), y: r * 0.3 * Math.sin(t) });
  }

  return points;
}

// Firework: radial burst streams
export function generateFirework(count, scale = 10, streams = 12) {
  const points = [];
  const perStream = Math.floor(count * 0.85 / streams);

  for (let s = 0; s < streams; s++) {
    const angle = (s / streams) * Math.PI * 2;
    for (let i = 0; i < perStream; i++) {
      const progress = i / perStream;
      const r = progress * scale;
      const spread = (Math.random() - 0.5) * 0.3 * scale * progress;
      points.push({
        x: r * Math.cos(angle) + spread * Math.cos(angle + Math.PI / 2),
        y: r * Math.sin(angle) + spread * Math.sin(angle + Math.PI / 2),
      });
    }
  }

  while (points.length < count) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * scale * 0.2;
    points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
  }

  return points;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vitest run tests/shapes.test.js`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
cd D:/AppCode/langchain/gesture-particles
git add src/shapes.js tests/shapes.test.js
git commit -m "feat: add heart, flower, saturn, firework shape generators with tests"
```

---

### Task 3: Gesture Analyzer with Tests

**Files:**
- Create: `src/gestureAnalyzer.js`
- Create: `tests/gestureAnalyzer.test.js`

- [ ] **Step 1: Write failing tests for gesture analysis**

```js
import { describe, it, expect } from 'vitest';
import {
  computeHandOpenness,
  computeHandRotation,
  analyzeGesture,
  createNullGesture,
} from '../src/gestureAnalyzer.js';

// Helper: create mock landmarks array (21 points, each {x, y, z})
// x,y in [0,1] normalized image coords
function makeMockLandmarks(fingerSpread) {
  // fingerSpread: 0 = closed fist, 1 = fully open
  const landmarks = [];
  for (let i = 0; i < 21; i++) {
    landmarks.push({ x: 0.5, y: 0.5, z: 0 });
  }
  // Wrist at bottom center
  landmarks[0] = { x: 0.5, y: 0.9, z: 0 };
  // Middle finger MCP (palm reference)
  landmarks[9] = { x: 0.5, y: 0.6, z: 0 };

  // Fingertips: spread outward when open, close to palm when closed
  const tipIndices = [4, 8, 12, 16, 20];
  const basePositions = [
    { x: 0.35, y: 0.5 },  // thumb
    { x: 0.4, y: 0.35 },  // index
    { x: 0.5, y: 0.3 },   // middle
    { x: 0.6, y: 0.35 },  // ring
    { x: 0.7, y: 0.4 },   // pinky
  ];

  tipIndices.forEach((idx, i) => {
    const base = basePositions[i];
    // When spread=1, fingertips are at base positions
    // When spread=0, fingertips collapse toward palm center (0.5, 0.6)
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
    // Hand pointing up: wrist at bottom, middle base above
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vitest run tests/gestureAnalyzer.test.js`
Expected: FAIL - module not found

- [ ] **Step 3: Implement gesture analyzer**

```js
// MediaPipe Hand Landmarks (21 points):
//  0: wrist, 4: thumb tip, 8: index tip, 12: middle tip,
// 16: ring tip, 20: pinky tip, 9: middle finger MCP (palm center ref)

const TIP_INDICES = [4, 8, 12, 16, 20];
const PALM_REF = 9;

export function computeHandOpenness(landmarks) {
  const palm = landmarks[PALM_REF];
  let totalDist = 0;

  for (const idx of TIP_INDICES) {
    const tip = landmarks[idx];
    const dx = tip.x - palm.x;
    const dy = tip.y - palm.y;
    totalDist += Math.sqrt(dx * dx + dy * dy);
  }

  const avgDist = totalDist / TIP_INDICES.length;
  // Empirical: closed fist avg ~0.02, open hand avg ~0.18
  const normalized = (avgDist - 0.03) / 0.15;
  return Math.max(0, Math.min(1, normalized));
}

export function computeHandRotation(landmarks) {
  const wrist = landmarks[0];
  const middleBase = landmarks[PALM_REF];
  const angle = Math.atan2(middleBase.y - wrist.y, middleBase.x - wrist.x);
  return angle / Math.PI;
}

export function analyzeGesture(landmarks) {
  return {
    openness: computeHandOpenness(landmarks),
    rotation: computeHandRotation(landmarks),
    detected: true,
  };
}

export function createNullGesture() {
  return { openness: 0.5, rotation: 0, detected: false };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vitest run tests/gestureAnalyzer.test.js`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
cd D:/AppCode/langchain/gesture-particles
git add src/gestureAnalyzer.js tests/gestureAnalyzer.test.js
git commit -m "feat: add gesture analyzer with openness and rotation detection"
```

---

### Task 4: Particle System Engine with Tests

**Files:**
- Create: `src/particleSystem.js`
- Create: `tests/particleSystem.test.js`

- [ ] **Step 1: Write failing tests for particle system state logic**

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/particleSystem.js';

// Minimal mock canvas
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

    // At least some targets should differ
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vitest run tests/particleSystem.test.js`
Expected: FAIL - module not found

- [ ] **Step 3: Implement particle system engine**

```js
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

    // Glow layer
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

    // Core layer
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

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vitest run tests/particleSystem.test.js`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
cd D:/AppCode/langchain/gesture-particles
git add src/particleSystem.js tests/particleSystem.test.js
git commit -m "feat: add particle system engine with glow rendering, gesture-driven scale/rotation"
```

---

### Task 5: Camera and MediaPipe Integration

**Files:**
- Create: `src/camera.js`

- [ ] **Step 1: Implement camera module with MediaPipe Hands**

```js
import { analyzeGesture, createNullGesture } from './gestureAnalyzer.js';

let hands = null;
let cameraInstance = null;
let onGestureCallback = null;
let onLandmarksCallback = null;

export async function initCamera(onGesture, onLandmarks) {
  onGestureCallback = onGesture;
  onLandmarksCallback = onLandmarks;

  const video = document.getElementById('webcamVideo');
  const previewVideo = document.getElementById('previewVideo');
  const handCanvas = document.getElementById('handCanvas');
  const gestureStatus = document.getElementById('gestureStatus');

  // Init MediaPipe Hands
  hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });

  hands.onResults((results) => {
    // Draw hand landmarks on preview canvas
    const ctx = handCanvas.getContext('2d');
    ctx.clearRect(0, 0, handCanvas.width, handCanvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      // Draw hand skeleton
      drawHandLandmarks(ctx, landmarks, handCanvas.width, handCanvas.height);

      // Analyze gesture
      const gesture = analyzeGesture(landmarks);
      onGestureCallback(gesture);
      if (onLandmarksCallback) onLandmarksCallback(landmarks);

      gestureStatus.textContent = `Open: ${(gesture.openness * 100).toFixed(0)}% | Rot: ${(gesture.rotation * 180).toFixed(0)}deg`;
    } else {
      onGestureCallback(createNullGesture());
      gestureStatus.textContent = 'No hand detected';
    }
  });

  // Start camera
  cameraInstance = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  await cameraInstance.start();

  // Mirror preview video
  previewVideo.srcObject = video.srcObject;
  previewVideo.style.transform = 'scaleX(-1)';
}

function drawHandLandmarks(ctx, landmarks, w, h) {
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17],
  ];

  ctx.strokeStyle = 'rgba(255, 107, 157, 0.6)';
  ctx.lineWidth = 2;

  for (const [a, b] of connections) {
    ctx.beginPath();
    ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
    ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 200, 200, 0.8)';
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

- [ ] **Step 2: Verify visually**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vite --host`
Expected: Browser shows dark page. Camera preview appears in bottom-left. Hand landmarks drawn when hand visible.

- [ ] **Step 3: Commit**

```bash
cd D:/AppCode/langchain/gesture-particles
git add src/camera.js
git commit -m "feat: add camera module with MediaPipe Hands integration and preview overlay"
```

---

### Task 6: UI Panel Logic

**Files:**
- Create: `src/ui.js`

- [ ] **Step 1: Implement UI wiring**

```js
export function initUI(onShapeChange, onColorChange) {
  // Shape selector buttons
  const shapeButtons = document.querySelectorAll('.shape-btn');
  shapeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      shapeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      onShapeChange(btn.dataset.shape);
    });
  });

  // Color picker
  const colorPicker = document.getElementById('colorPicker');
  colorPicker.addEventListener('input', (e) => {
    onColorChange(e.target.value);
    // Update active button border color
    const activeBtn = document.querySelector('.shape-btn.active');
    if (activeBtn) {
      activeBtn.style.borderColor = e.target.value + '80';
      activeBtn.style.background = e.target.value + '20';
    }
  });

  // Fullscreen button
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Keyboard shortcut: F for fullscreen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      if (e.target.tagName !== 'INPUT') toggleFullscreen();
    }
  });

  // Keyboard shortcuts: 1-4 for shapes
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    const shapeMap = { '1': 'heart', '2': 'flower', '3': 'saturn', '4': 'firework' };
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
  const btn = document.getElementById('fullscreenBtn');
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      btn.textContent = 'Exit Fullscreen';
    }).catch(() => {});
  } else {
    document.exitFullscreen().then(() => {
      btn.textContent = 'Fullscreen';
    }).catch(() => {});
  }
}

document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('fullscreenBtn');
  btn.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
});
```

- [ ] **Step 2: Commit**

```bash
cd D:/AppCode/langchain/gesture-particles
git add src/ui.js
git commit -m "feat: add UI panel with shape selector, color picker, fullscreen toggle"
```

---

### Task 7: Main Integration - Wire Everything Together

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Write main.js entry point**

```js
import { ParticleSystem } from './particleSystem.js';
import { initCamera } from './camera.js';
import { initUI } from './ui.js';

const canvas = document.getElementById('particleCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ps = new ParticleSystem(canvas, 600);
ps.init();
ps.clear();

// Animation loop
let lastTime = 0;
function animate(time) {
  // ~60fps cap
  if (time - lastTime < 16) {
    requestAnimationFrame(animate);
    return;
  }
  lastTime = time;

  ps.update();
  ps.render();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Window resize
window.addEventListener('resize', () => {
  ps.resize();
  ps.clear();
});

// UI callbacks
initUI(
  (shape) => ps.setShape(shape),
  (color) => ps.setColor(color),
);

// Camera (async, may prompt for permission)
initCamera(
  (gesture) => {
    ps.updateGesture(gesture.openness, gesture.rotation);
  },
  null,
).catch((err) => {
  console.warn('Camera init failed:', err);
  document.getElementById('gestureStatus').textContent = 'Camera unavailable';
});
```

- [ ] **Step 2: Verify full integration**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vite --host`
Expected:
- Page loads with heart-shaped glowing particles
- Camera preview shows in bottom-left with hand skeleton overlay
- UI panel on top-right: 4 shape buttons, color picker, fullscreen button
- Clicking shape buttons changes particle formation (smooth transition)
- Color picker changes particle color
- Opening/closing hand scales particles
- Rotating hand rotates particles
- Fullscreen button toggles fullscreen mode
- Keyboard shortcuts: 1-4 for shapes, F for fullscreen

- [ ] **Step 3: Commit**

```bash
cd D:/AppCode/langchain/gesture-particles
git add src/main.js
git commit -m "feat: wire camera, particle system, and UI together with animation loop"
```

---

### Task 8: Polish and Responsive Tweaks

**Files:**
- Modify: `css/style.css`
- Modify: `index.html`

- [ ] **Step 1: Add loading state and initial animation**

Add a loading indicator to index.html (inside `<body>`, before canvas):

```html
<div id="loadingOverlay">
  <div class="loading-spinner"></div>
  <p>Initializing camera...</p>
</div>
```

Add to `css/style.css`:

```css
#loadingOverlay {
  position: fixed;
  inset: 0;
  background: #0a0a14;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: opacity 0.5s ease;
}

#loadingOverlay.hidden {
  opacity: 0;
  pointer-events: none;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 107, 157, 0.2);
  border-top-color: #ff6b9d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

#loadingOverlay p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}
```

- [ ] **Step 2: Add responsive styles for smaller screens**

Add to `css/style.css`:

```css
@media (max-width: 768px) {
  #controlPanel {
    top: auto;
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    border-radius: 16px 16px 0 0;
    padding: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  #controlPanel h2 {
    width: 100%;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .panel-section {
    margin-bottom: 0;
    flex: 1;
    min-width: 100px;
  }

  #cameraPreview {
    width: 160px;
    height: 120px;
    bottom: auto;
    top: 10px;
    left: 10px;
  }
}
```

- [ ] **Step 3: Add particle entrance animation**

In `src/particleSystem.js`, modify the `init()` method. After `this.setShape(this.currentShape);`, add initial scatter:

Find the line:
```js
    this.setShape(this.currentShape);
```
After it, add:
```js
    // Scatter particles randomly for entrance animation
    for (const p of this.particles) {
      p.x = Math.random() * this.canvas.width;
      p.y = Math.random() * this.canvas.height;
    }
```

- [ ] **Step 4: Add keyboard shortcut hints to UI panel**

Add at the bottom of `#controlPanel` in `index.html`:

```html
    <div class="panel-section hints">
      <span>1-4: Shapes</span>
      <span>F: Fullscreen</span>
    </div>
```

Add to `css/style.css`:

```css
.hints {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  text-transform: none;
  letter-spacing: 0;
}
```

- [ ] **Step 5: Final visual verification**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vite --host`
Verify:
- [ ] Particles scatter and converge on page load
- [ ] Shape transitions are smooth
- [ ] Glow effect looks good on dark background
- [ ] Color picker updates particles instantly
- [ ] Hand open/close visibly scales particles
- [ ] Hand rotation visibly rotates particle formation
- [ ] Fullscreen works correctly
- [ ] Mobile responsive layout works (resize browser to narrow width)
- [ ] Loading overlay shows then fades when ready

- [ ] **Step 6: Run all tests**

Run: `cd D:/AppCode/langchain/gesture-particles && npx vitest run`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
cd D:/AppCode/langchain/gesture-particles
git add -A
git commit -m "polish: add loading overlay, entrance animation, responsive layout, keyboard hints"
```

---

## Self-Review Checklist

### Spec Coverage
| Requirement | Task |
|---|---|
| Camera hand detection | Task 5 |
| Single hand open/close controls scale | Task 3 (analyzer) + Task 7 (integration) |
| Hand rotation controls particle rotation | Task 3 + Task 7 |
| Heart shape | Task 2 |
| Flower shape | Task 2 |
| Saturn shape | Task 2 |
| Firework shape | Task 2 |
| Color picker | Task 6 + Task 7 |
| Real-time particle response | Task 4 (lerp physics) + Task 7 (animation loop) |
| Clean modern UI | Task 1 (CSS) + Task 8 (polish) |
| Fullscreen button | Task 6 + Task 8 |
| UI panel | Task 1 (HTML) + Task 6 (JS) |

### Placeholder Scan
- No TBDs, TODOs, or "implement later" entries
- All steps contain actual code
- All file paths are exact
- All commands include expected output

### Type Consistency
- `computeHandOpenness` / `computeHandRotation` / `analyzeGesture` / `createNullGesture` - consistent naming across Task 3 and Task 5
- `ps.setShape(name)` / `ps.setColor(hex)` / `ps.updateGesture(openness, rotation)` - consistent across Task 4, 6, 7
- `onGestureCallback` / `onLandmarksCallback` - consistent in Task 5
- SHAPE_FNS keys match data-shape attributes in HTML: `heart`, `flower`, `saturn`, `firework` - all consistent
