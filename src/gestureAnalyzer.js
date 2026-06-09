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
  const normalized = (avgDist - 0.03) / 0.15;
  return Math.max(0, Math.min(1, normalized));
}

export function computeHandRotation(landmarks) {
  const wrist = landmarks[0];
  const middleBase = landmarks[PALM_REF];
  const dx = middleBase.x - wrist.x;
  const dy = middleBase.y - wrist.y;
  const angle = Math.atan2(dx, -dy);
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
