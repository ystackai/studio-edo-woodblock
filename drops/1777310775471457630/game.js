/*
 * Stone & Breath - Core Interaction Loop
 * Drag vector tracked linearly. Hard stall at exactly 45%.
 * 2.5s decay window drives ripple bloom and audio feedback.
 */

const canvas = document.getElementById('water');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// --- State ---
let dragging = false;
let stallReached = false;
let decayActive = false;
let dragStart = null; // {x, y}
let dragCurrent = null; // {x, y}
let impactPoint = null; // {x, y}
let progress = 0; // 0..1 normalized drag progress

// Ripple state
let ripples = [];
const STALL_THRESHOLD = 0.45;
const DECAY_DURATION = 2500; // 2.5s
let decayStart = 0;

// Audio context (lazy init)
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

// --- Audio synthesis ---
function playThud() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 140; // low thud 100-200Hz
  gain.gain.value = 0.6;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  // Dry ~100ms duration
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.stop(audioCtx.currentTime + 0.1);
}

function playExhale() {
  if (!audioCtx) return;
  const duration = 2.5;
  // Create filtered noise buffer
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.4;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  // Low-pass filter for soft exhale texture
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;

  const gain = audioCtx.createGain();
  gain.gain.value = 0.25;
  // Decaying volume over 2.5s
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
  source.stop(audioCtx.currentTime + duration);
}

// --- Haptic ---
function triggerBite() {
  if (navigator.vibrate) {
    // Sharp short burst for the weight bite
    navigator.vibrate([30, 30, 30]);
  }
}

// --- Resize ---
function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
window.addEventListener('resize', resize);
resize();

// --- Drawing ---
const BG_COLOR = '#0a0e17';
const RIPPLE_COLOR = '#2a3045'; // deep indigo-grey solid ink
const STONE_COLOR = '#1a1f2a';

function drawBg() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawStone(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = STONE_COLOR;
  ctx.fill();
}

function drawRipples() {
  for (const rp of ripples) {
    // Solid ink shape, no alpha
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
    ctx.fillStyle = rp.color;
    ctx.fill();

    // Inner ring
    if (rp.innerRadius > 0) {
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = rp.innerColor;
      ctx.fill();
    }
  }
}

function draw() {
  drawBg();

  // Active drag: draw the stone at current position
  if (dragging && !stallReached && dragCurrent) {
    const size = 8 + progress * 18;
    drawStone(dragCurrent.x, dragCurrent.y, size);
  }

  // Stall / decay: draw stone at impact point
  if (stallReached) {
    drawStone(impactPoint.x, impactPoint.y, 26);
  }

  drawRipples();

  requestAnimationFrame(draw);
}

// --- Progress calculation ---
function calcProgress(start, current) {
  const dx = current.x - start.x;
  const dy = current.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Normalize: 200px of drag = 100% progress
  const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.5;
  return Math.min(dist / maxDist, 1);
}

// --- Ripple management ---
function spawnRipple(x, y) {
  const maxRadius = Math.max(window.innerWidth, window.innerHeight) * 0.35;
  ripples.push({
    x, y,
    radius: 0,
    maxRadius: maxRadius,
    innerRadius: 0,
    innerMax: maxRadius * 0.6,
    color: RIPPLE_COLOR,
    innerColor: '#1e2335',
    born: performance.now(),
    duration: DECAY_DURATION,
  });
}

function updateRipples(now) {
  for (const rp of ripples) {
    const elapsed = now - rp.born;
    const t = Math.min(elapsed / rp.duration, 1);

    // Linear expansion, no ease
    rp.radius = rp.maxRadius * t;
    rp.innerRadius = rp.innerMax * t;

    // Color bleeds via solid expansion - change color as it grows
    if (t > 0.3 && t <= 0.6) {
      rp.color = '#1a2030';
      rp.innerColor = '#151a28';
    } else if (t > 0.6) {
      rp.color = '#0f1320';
      rp.innerColor = '#0c0f18';
    }
  }
  // Remove expired ripples
  ripples = ripples.filter(rp => (now - rp.born) < rp.duration + 200);
}

// --- Input handling ---
function getPos(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function onStart(e) {
  e.preventDefault();
  initAudio();
  if (stallReached && !decayActive) return;
  if (decayActive) return;

  dragging = true;
  stallReached = false;
  dragStart = getPos(e);
  dragCurrent = dragStart;
  progress = 0;
  ripples = [];
  infoEl.style.opacity = '0';
}

function onMove(e) {
  e.preventDefault();
  if (!dragging || stallReached) return;

  dragCurrent = getPos(e);
  const rawProgress = calcProgress(dragStart, dragCurrent);

   // HARD STALL at exactly 45%
  if (rawProgress >= STALL_THRESHOLD) {
    progress = STALL_THRESHOLD;
    stallReached = true;
    dragging = false;

     // Clamp dragCurrent to the stall position
    const dx = dragCurrent.x - dragStart.x;
    const dy = dragCurrent.y - dragStart.y;
    const angle = Math.atan2(dy, dx);
    const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.5;
    const clampedDist = maxDist * STALL_THRESHOLD;
    impactPoint = {
      x: dragStart.x + Math.cos(angle) * clampedDist,
      y: dragStart.y + Math.sin(angle) * clampedDist,
     };

    // Audio: thud at impact
    playThud();

    // Haptic: sharp bite
    triggerBite();

    // Start decay window
    decayActive = true;
    decayStart = performance.now();
    spawnRipple(impactPoint.x, impactPoint.y);

    // Audio: exhale during decay
    setTimeout(() => playExhale(), 120);
  }
}

function onEnd(e) {
  e.preventDefault();
  if (decayActive) return;
  dragging = false;
  dragStart = null;
  dragCurrent = null;
  progress = 0;
  infoEl.style.opacity = '1';
}

// Touch events
canvas.addEventListener('touchstart', onStart, { passive: false });
canvas.addEventListener('touchmove', onMove, { passive: false });
canvas.addEventListener('touchend', onEnd, { passive: false });
canvas.addEventListener('touchcancel', onEnd, { passive: false });

// Mouse events for desktop testing
canvas.addEventListener('mousedown', onStart);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseup', onEnd);
canvas.addEventListener('mouseleave', onEnd);

// --- Main loop ---
function loop() {
  const now = performance.now();

  // Update ripples during decay
  if (decayActive) {
    updateRipples(now);
    const elapsed = now - decayStart;
    if (elapsed >= DECAY_DURATION) {
      decayActive = false;
      ripples = [];
      stallReached = false;
      infoEl.style.opacity = '1';
    }
  }

  requestAnimationFrame(loop);
}

// Start
draw();
loop();
