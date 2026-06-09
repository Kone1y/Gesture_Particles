import { analyzeGesture, createNullGesture } from './gestureAnalyzer.js';

let hands = null;
let cameraInstance = null;
let onGestureCallback = null;

export async function initCamera(onGesture) {
  onGestureCallback = onGesture;

  const video = document.getElementById('webcamVideo');
  const previewVideo = document.getElementById('previewVideo');
  const handCanvas = document.getElementById('handCanvas');
  const gestureStatus = document.getElementById('gestureStatus');

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
    const ctx = handCanvas.getContext('2d');
    ctx.clearRect(0, 0, handCanvas.width, handCanvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      drawHandLandmarks(ctx, landmarks, handCanvas.width, handCanvas.height);
      const gesture = analyzeGesture(landmarks);
      onGestureCallback(gesture);
      gestureStatus.textContent = `Open: ${(gesture.openness * 100).toFixed(0)}% | Rot: ${(gesture.rotation * 180).toFixed(0)}deg`;
    } else {
      onGestureCallback(createNullGesture());
      gestureStatus.textContent = 'No hand detected';
    }
  });

  cameraInstance = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  await cameraInstance.start();

  previewVideo.srcObject = video.srcObject;
  previewVideo.style.transform = 'scaleX(-1)';
}

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

function drawHandLandmarks(ctx, landmarks, w, h) {
  ctx.strokeStyle = 'rgba(255, 107, 157, 0.6)';
  ctx.lineWidth = 2;

  for (const [a, b] of CONNECTIONS) {
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
