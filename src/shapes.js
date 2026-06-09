// Saturn: planet body (spherical core) + tilted ring with Cassini division
export function generateStarCluster(count, scale = 10) {
  const points = [];
  const bodyCount = Math.floor(count * 0.35);
  const ringCount = count - bodyCount;

  // Planet body: dense spherical core
  for (let i = 0; i < bodyCount; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    const u = Math.random() || 1e-10;
    const r = Math.sqrt(-2 * Math.log(u)) * scale * 1.5;
    points.push({
      x: r * Math.sin(theta) * Math.cos(phi),
      y: r * Math.sin(theta) * Math.sin(phi),
      z: r * Math.cos(theta),
    });
  }

  // Ring bands: B ring (bright inner) + Cassini gap + A ring (outer)
  const tilt = 25 * Math.PI / 180;
  const sinT = Math.sin(tilt);
  const cosT = Math.cos(tilt);
  const rBinner = scale * 3;
  const rBouter = scale * 5;
  const rAinner = scale * 5.4;
  const rAouter = scale * 7.5;

  for (let i = 0; i < ringCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    let r;

    if (Math.random() < 0.75) {
      // B ring (main bright band)
      r = rBinner + Math.random() * (rBouter - rBinner);
    } else {
      // A ring (outer band, past Cassini division)
      r = rAinner + Math.random() * (rAouter - rAinner);
    }

    const thickness = (Math.random() - 0.5) * scale * 0.15;

    // Ring in XZ plane, tilted around X axis
    const px = r * Math.cos(angle);
    const py = thickness;
    const pz = r * Math.sin(angle);
    points.push({
      x: px,
      y: py * cosT - pz * sinT,
      z: py * sinT + pz * cosT,
    });
  }

  return points;
}

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

// Flower: rose curve r = |cos(k*theta)|
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
