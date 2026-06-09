// Saturn: oblate body + 5 ring bands (C, B, Cassini, A, F) + moons
export function generateStarCluster(count, scale = 10) {
  const points = [];
  const bodyCount = 600;
  const ringC = 80;
  const ringB = 500;
  const ringA = 280;
  const ringF = 50;
  const moonCount = 5;

  const tilt = 25 * Math.PI / 180;
  const sinT = Math.sin(tilt);
  const cosT = Math.cos(tilt);

  function pushRingParticle(r, thicknessScale) {
    const angle = Math.random() * Math.PI * 2;
    const t = (Math.random() - 0.5) * scale * thicknessScale;
    const px = r * Math.cos(angle);
    const pz = r * Math.sin(angle);
    points.push({
      x: px,
      y: t * cosT - pz * sinT,
      z: t * sinT + pz * cosT,
      type: 'ring',
    });
  }

  // Planet body: oblate spheroid (equator 10% wider than poles)
  for (let i = 0; i < bodyCount; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    const u = Math.random() || 1e-10;
    const r = Math.sqrt(-2 * Math.log(u)) * scale * 1.5;
    const oblateness = 1.0 + 0.1 * Math.pow(Math.sin(theta), 2);
    points.push({
      x: r * oblateness * Math.sin(theta) * Math.cos(phi),
      y: r * Math.sin(theta) * Math.sin(phi),
      z: r * oblateness * Math.cos(theta),
      type: 'body',
    });
  }

  // C ring (faint, innermost)
  for (let i = 0; i < ringC; i++) {
    const r = scale * 2 + Math.random() * scale * 1;
    pushRingParticle(r, 0.1);
    points[points.length - 1].type = 'ringC';
  }

  // B ring (brightest, main band)
  for (let i = 0; i < ringB; i++) {
    const r = scale * 3 + Math.random() * scale * 2;
    pushRingParticle(r, 0.12);
    points[points.length - 1].type = 'ringB';
  }

  // Cassini Division: no particles (gap from scale*5 to scale*5.4)

  // A ring (moderate)
  for (let i = 0; i < ringA; i++) {
    let r = scale * 5.4 + Math.random() * scale * 1.6;
    // Encke gap: small hole at scale*6.5 to scale*6.7
    if (Math.random() < 0.15) {
      r += scale * 0.2;
    }
    pushRingParticle(r, 0.1);
    points[points.length - 1].type = 'ringA';
  }

  // F ring (thin, narrow, bright)
  for (let i = 0; i < ringF; i++) {
    const r = scale * 7.8 + Math.random() * scale * 0.4;
    pushRingParticle(r, 0.05);
    points[points.length - 1].type = 'ringF';
  }

  // Moons (large bright dots beyond the rings)
  for (let i = 0; i < moonCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = scale * (9 + Math.random() * 3);
    const t = (Math.random() - 0.5) * scale * 0.5;
    const px = r * Math.cos(angle);
    const pz = r * Math.sin(angle);
    points.push({
      x: px,
      y: t * cosT - pz * sinT,
      z: t * sinT + pz * cosT,
      type: 'moon',
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
