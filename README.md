# Gesture Particles

A browser-based interactive particle system controlled by hand gestures. Uses webcam and MediaPipe hand tracking to manipulate 3D particle formations in real time.

![Tech](https://img.shields.io/badge/HTML5_Canvas-2D_Rendering-orange)
![Tech](https://img.shields.io/badge/MediaPipe-Hand_Tracking-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Hand gesture control** -- open/close hand to expand/contract particles, tilt hand to rotate
- **3D Saturn system** -- default mode with planet body, 5 ring bands (C/B/A/F), Cassini division, and orbiting moons
- **4 additional shapes** -- heart, flower, saturn (2D), firework
- **Per-particle colors** -- each star has a unique color derived from the chosen base hue
- **3D perspective rendering** -- depth sorting, perspective projection, depth-based size and brightness
- **Background star field** -- 200 twinkling stars for deep-space atmosphere
- **Color picker** -- choose base color, particles shift hues around it
- **Fullscreen mode** -- immersive full-screen experience
- **Keyboard shortcuts** -- `1-5` for shapes, `F` for fullscreen
- **Responsive layout** -- adapts to mobile screens

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser (Chrome recommended). Allow camera access when prompted.

## Gesture Controls

| Gesture | Effect |
|---------|--------|
| Open hand | Expand particles outward |
| Close hand | Contract particles inward (gravitational pull) |
| Tilt hand left/right | Rotate the formation in 3D |
| No hand detected | Slow auto-rotation |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Star Cluster (Saturn) |
| `2` | Heart |
| `3` | Flower |
| `4` | Saturn (2D) |
| `5` | Firework |
| `F` | Toggle fullscreen |

## Saturn Structure

The default star cluster mimics Saturn's real anatomy:

```
          ·  ·        ← Background stars (static)
       ·  · · ·
    · · ·  ·  · ·  ·
         ┌───┐
      ╭──┤   ├──╮     ← F ring (thin, bright)
      │  │   │  │
      │  │ ○ │  │     ← A ring + Encke gap
      │  │   │  │
      │  ╰───╯  │     ← Cassini Division (empty)
      │ ╭─────╮ │
      │ │     │ │     ← B ring (brightest)
      │ │  ●  │ │     ← C ring (faint) + Planet body (oblate sphere)
      │ ╰─────╯ │
      │  ○  ○  │     ← Moons (orbiting)
      ╰─────────╯
```

- **Planet body**: 600 particles in an oblate spheroid (10% equatorial bulge)
- **B ring**: 500 particles, brightest band
- **A ring**: 280 particles with Encke gap
- **C ring**: 80 particles, faint inner ring
- **F ring**: 50 particles, thin outer ring
- **Moons**: 5 large bright particles beyond the rings

## Tech Stack

- **Vanilla JS** (ES modules, no framework)
- **Canvas 2D** with additive blending for glow effects
- **MediaPipe Hands** for real-time hand tracking (CDN)
- **Vite** for dev server and bundling
- **Vitest** for unit tests (32 tests)

## Project Structure

```
src/
├── main.js              # Entry point, animation loop, camera init
├── shapes.js             # Shape generators (heart, flower, saturn, firework, starCluster)
├── particleSystem.js     # Particle engine: 3D rotation, perspective, depth rendering
├── gestureAnalyzer.js    # Hand openness & rotation from MediaPipe landmarks
├── camera.js             # Webcam + MediaPipe integration, hand skeleton overlay
└── ui.js                 # UI panel: shape selector, color picker, fullscreen
tests/
├── shapes.test.js
├── gestureAnalyzer.test.js
└── particleSystem.test.js
```

## Run Tests

```bash
npm test
```
