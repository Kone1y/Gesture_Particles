// Star cluster: gaussian distribution with dense core + sparse halo
export function generateStarCluster(count, scale = 10) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const u1 = Math.random() || 1e-10;
    const r = Math.sqrt(-2 * Math.log(u1)) * scale * 5.5;
    points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
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
