// --- CONSTANTS ---
const FRACTURE_THRESHOLD = 0.85;
const MAX_PARTICLES = 48;
const RESET_DURATION = 600; // ms
const TENSION_RAMP_RATE = 0.038; // per frame at 60fps → reaches ~0.85 in ~220ms
const JITTER_START = 0.72;
const JITTER_AMP = 0.025;
const SHIMMER_FREQ = 0.12;
const SHIMMER_AMP = 0.015;

// --- STATE ---
let tension = 0;
let pressing = false;
let state = 'idle'; // 'idle' | 'tension' | 'fractured' | 'resetting'
let resetTimer = 0;
let shimmerPhase = 0;
let jitterPhase = 0;
let particles = [];
let audioCtx = null;
let gradientAngle = 0;
let gradientAngleBase = 0;

// --- CANVAS ---
const canvas = document.getElementById('frost');
const ctx = canvas.getContext('2d');
let W, H, cx, cy;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx = W / 2;
  cy = H / 2;
}
window.addEventListener('resize', resize);
resize();

// --- AUDIO ---
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSubBass() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;

  // Layer 1: sub-bass oscillator, deep and chest-hitting
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(42, now);
  osc1.frequency.exponentialRampToValueAtTime(22, now + 0.15);
  const gain1 = audioCtx.createGain();
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.9, now + 0.004);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc1.connect(gain1).connect(audioCtx.destination);
  osc1.start(now);
  osc1.stop(now + 0.6);

  // Layer 2: sub-harmonic reinforcement
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(28, now);
  osc2.frequency.exponentialRampToValueAtTime(15, now + 0.2);
  const gain2 = audioCtx.createGain();
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.6, now + 0.003);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  osc2.connect(gain2).connect(audioCtx.destination);
  osc2.start(now);
  osc2.stop(now + 0.45);

  // Layer 3: sharp crack transient
  const osc3 = audioCtx.createOscillator();
  osc3.type = 'sawtooth';
  osc3.frequency.setValueAtTime(280, now);
  osc3.frequency.exponentialRampToValueAtTime(80, now + 0.06);
  const gain3 = audioCtx.createGain();
  gain3.gain.setValueAtTime(0.45, now);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc3.connect(gain3).connect(audioCtx.destination);
  osc3.start(now);
  osc3.stop(now + 0.1);

  // Layer 4: noise burst for the "snap" texture
  const bufSize = audioCtx.sampleRate * 0.08;
  const noiseBuf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.15));
  }
  const noiseSrc = audioCtx.createBufferSource();
  noiseSrc.buffer = noiseBuf;
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(3000, now);
  lp.frequency.exponentialRampToValueAtTime(200, now + 0.06);
  noiseSrc.connect(lp).connect(noiseGain).connect(audioCtx.destination);
  noiseSrc.start(now);
}

// --- PARTICLES ---
function spawnScatter() {
  particles = [];
  const count = MAX_PARTICLES;
  const radius = Math.min(W, H) * 0.3;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const speed = 3 + Math.random() * 9;
    const size = 2 + Math.random() * 6;
    const life = 1;
    const hueShift = Math.random() * 40 - 20;
    particles.push({
      x: cx + Math.cos(angle) * radius * 0.5 * Math.random(),
      y: cy + Math.sin(angle) * radius * 0.5 * Math.random(),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      life,
      hueShift,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.4,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.92;
    p.vy *= 0.92;
    p.life -= 0.035;
    p.rotation += p.rotSpeed;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const alpha = Math.max(0, p.life);
    const h = 195 + p.hueShift;
    const s = 60 + p.life * 40;
    const l = 70 + p.life * 25;
    ctx.globalAlpha = alpha * 0.9;
    ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
    // Draw sharp shard shape
    const w = p.size;
    const h2 = p.size * 2.8;
    ctx.beginPath();
    ctx.moveTo(0, -h2 / 2);
    ctx.lineTo(w / 2, h2 / 4);
    ctx.lineTo(0, h2 / 2);
    ctx.lineTo(-w / 2, h2 / 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// --- PROCEDURAL NOISE (simple value noise) ---
const NOISE_SIZE = 64;
const noiseGrid = new Float32Array(NOISE_SIZE * NOISE_SIZE * 2);
function noiseFill() {
  for (let i = 0; i < noiseGrid.length; i++) {
    noiseGrid[i] = Math.random();
  }
}
noiseFill();

function smoothNoise(xf, yf) {
  const x0 = Math.floor(xf) % NOISE_SIZE;
  const y0 = Math.floor(yf) % NOISE_SIZE;
  const x1 = (x0 + 1) % NOISE_SIZE;
  const y1 = (y0 + 1) % NOISE_SIZE;
  const sx = xf - Math.floor(xf);
  const sy = yf - Math.floor(yf);
  const sx2 = sx * sx * (3 - 2 * sx);
  const sy2 = sy * sy * (3 - 2 * sy);
  const v00 = noiseGrid[(y0 * NOISE_SIZE + x0) * 2];
  const v10 = noiseGrid[(y0 * NOISE_SIZE + x1) * 2];
  const v01 = noiseGrid[(y1 * NOISE_SIZE + x0) * 2];
  const v11 = noiseGrid[(y1 * NOISE_SIZE + x1) * 2];
  return v00 * (1 - sx2) * (1 - sy2) + v10 * sx2 * (1 - sy2) + v01 * sy2 * (1 - sx2) + v11 * sx2 * sy2;
}

// --- FROST GRADIENT ---
function drawFrost() {
  const minDim = Math.min(W, H);
  const radius = minDim * 0.45;

  // Base background woodblock grain
  ctx.fillStyle = '#0a0c10';
  ctx.fillRect(0, 0, W, H);

  // Woodblock grain lines (visible through frost)
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 30; i++) {
    const y = (i / 30) * H;
    const wobble = Math.sin(i * 0.8) * 3;
    ctx.fillStyle = i % 2 === 0 ? '#1a1e28' : '#141820';
    ctx.fillRect(wobble, y, W, 2);
  }
  ctx.globalAlpha = 1;

  // Frost overlay - procedural noise-based gradient
  const imageData = ctx.getImageData(0, 0, canvas.width / (Math.min(window.devicePixelRatio || 1, 2)), canvas.height / (Math.min(window.devicePixelRatio || 1, 2)));
  // Skip pixel-by-pixel for perf, use radial gradient instead with noise texture overlay

  // Frost disk with gradient
  let shimmerOffset = 0;
  if (state === 'idle') {
    shimmerOffset = Math.sin(shimmerPhase) * SHIMMER_AMP;
  }

  // Tension-based angle shift (linear, no easing)
  let angleShift = 0;
  if (state === 'tension') {
    angleShift = tension * Math.PI * 0.6;

    // Micro-jitter near threshold
    if (tension > JITTER_START) {
      const jitterIntensity = (tension - JITTER_START) / (FRACTURE_THRESHOLD - JITTER_START);
      angleShift += Math.sin(jitterPhase * 18) * JITTER_AMP * jitterIntensity;
      angleShift += Math.cos(jitterPhase * 27) * JITTER_AMP * 0.5 * jitterIntensity;
    }
  }

  const baseAngle = gradientAngleBase + angleShift + shimmerOffset;

  // Multi-stop gradient for frost
  const grad = ctx.createRadialGradient(
    cx + Math.cos(baseAngle + 1.2) * radius * 0.15,
    cy + Math.sin(baseAngle + 1.2) * radius * 0.15,
    0,
    cx, cy, radius
  );

  // Color stops compress with tension
  const c1 = lerpColor([200, 230, 255], [180, 200, 240], tension);
  const c2 = lerpColor([160, 200, 240], [120, 160, 220], tension);
  const c3 = lerpColor([100, 150, 210], [60, 90, 170], tension);
  const c4 = lerpColor([40, 70, 150], [25, 40, 110], tension);

  grad.addColorStop(0, `rgba(${c1[0]},${c1[1]},${c1[2]}, 0.9)`);
  grad.addColorStop(0.3, `rgba(${c2[0]},${c2[1]},${c2[2]}, 0.85)`);
  grad.addColorStop(0.6, `rgba(${c3[0]},${c3[1]},${c3[2]}, 0.7)`);
  grad.addColorStop(1, `rgba(${c4[0]},${c4[1]},${c4[2]}, 0.1)`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, radius, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ice facets - geometric overlay
  ctx.globalAlpha = 0.12 + tension * 0.08;
  drawIceFacets(radius, baseAngle);
  ctx.globalAlpha = 1;

  // Noise texture overlay for frost granularity
  ctx.globalAlpha = 0.04;
  const noiseScale = 8;
  for (let nx = 0; nx < 12; nx++) {
    for (let ny = 0; ny < 12; ny++) {
      const n = smoothNoise(nx + shimmerPhase * 0.05, ny);
      if (n > 0.65) {
        const px = cx + (nx - 6) * (radius * 2 / 12) + radius / 12;
        const py = cy + (ny - 6) * (radius * 2 / 12) + radius / 12;
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        if (dist < radius) {
          ctx.fillStyle = `rgba(220, 240, 255, ${n * 0.3})`;
          ctx.fillRect(px - 4, py - 4, 8, 8);
        }
      }
    }
  }
  ctx.globalAlpha = 1;

  // Shimmer highlights in idle state
  if (state === 'idle') {
    ctx.globalAlpha = Math.abs(Math.sin(shimmerPhase * 3.7)) * 0.15;
    const shimGrad = ctx.createRadialGradient(
      cx + Math.cos(shimmerPhase * 1.3) * radius * 0.3,
      cy + Math.sin(shimmerPhase * 0.9) * radius * 0.3,
      0, cx, cy, radius * 0.6
    );
    shimGrad.addColorStop(0, 'rgba(240, 250, 255, 0.6)');
    shimGrad.addColorStop(1, 'rgba(180, 210, 255, 0)');
    ctx.fillStyle = shimGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Fracture crack web when fractured
  if (state === 'fractured') {
    drawCrackWeb(radius);
  }
}

function drawIceFacets(radius, angle) {
  const numFacets = 8;
  for (let i = 0; i < numFacets; i++) {
    const a = angle + (Math.PI * 2 * i) / numFacets;
    const r1 = radius * (0.3 + 0.15 * Math.sin(i * 2.1));
    const r2 = radius * (0.7 + 0.2 * Math.sin(i * 3.3 + 0.5));

    ctx.strokeStyle = `rgba(200, 230, 255, ${0.15 + 0.1 * Math.sin(a + shimmerPhase)})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(a) * r1,
      cy + Math.sin(a) * r1
    );
    ctx.lineTo(
      cx + Math.cos(a + 0.3) * r2,
      cy + Math.sin(a + 0.3) * r2
    );
    ctx.stroke();
  }
}

function drawCrackWeb(radius) {
  ctx.strokeStyle = 'rgba(220, 240, 255, 0.25)';
  ctx.lineWidth = 1;
  const numCracks = 24;
  for (let i = 0; i < numCracks; i++) {
    const a = (Math.PI * 2 * i) / numCracks;
    const len = radius * (0.4 + Math.random() * 0.6);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    let px = cx, py = cy;
    const steps = 6;
    for (let s = 1; s <= steps; s++) {
      const frac = s / steps;
      px += Math.cos(a + (Math.random() - 0.5) * 0.8) * (len / steps);
      py += Math.sin(a + (Math.random() - 0.5) * 0.8) * (len / steps);
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

function lerpColor(a, b, t) {
  t = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

// --- RESET ---
function beginReset() {
  state = 'resetting';
  resetTimer = 0;
  tension = 0;
  noiseFill();
  gradientAngleBase += Math.random() * 0.5;
}

// --- INPUT ---
function onDown(e) {
  e.preventDefault();
  initAudio();
  if (state === 'idle' || state === 'resetting') {
    state = 'tension';
    pressing = true;
    tension = Math.max(0, tension);
  }
}

function onUp(e) {
  e.preventDefault();
  pressing = false;
  if (state === 'tension') {
    triggerFracture();
  }
}

canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mouseup', onUp);
canvas.addEventListener('touchstart', onDown, { passive: false });
canvas.addEventListener('touchend', onUp, { passive: false });
canvas.addEventListener('touchcancel', onUp, { passive: false });

// --- FRACTURE ---
function triggerFracture() {
  spawnScatter();
  playSubBass();
  state = 'fractured';
  setTimeout(() => beginReset(), 120);
}

// --- MAIN LOOP ---
let lastTime = 0;
function loop(timestamp) {
  const dt = Math.min(timestamp - lastTime, 33);
  lastTime = timestamp;

  // Phase update
  shimmerPhase += SHIMMER_FREQ * dt * 0.06;
  jitterPhase += dt * 0.015;

  // State machine
  if (state === 'idle') {
    // passive shimmer, no tension change
  } else if (state === 'tension') {
    if (pressing) {
      // LINEAR ramp - strictly no soft easing
      tension += TENSION_RAMP_RATE;
      if (tension >= FRACTURE_THRESHOLD) {
        tension = FRACTURE_THRESHOLD;
        triggerFracture();
      }
    } else {
      // Release without reaching threshold - snap anyway
      triggerFracture();
    }
  } else if (state === 'resetting') {
    resetTimer += dt;
    const progress = Math.min(resetTimer / RESET_DURATION, 1);
    // Linear reset fill
    tension = 1 - progress;
    if (progress >= 1) {
      state = 'idle';
      tension = 0;
    }
  }

  // Update particles
  if (state === 'fractured' || state === 'resetting') {
    updateParticles();
  }

  // Draw
  drawFrost();
  drawParticles();

  requestAnimationFrame(loop);
}

requestAnimationFrame((ts) => {
  lastTime = ts;
  loop(ts);
});
