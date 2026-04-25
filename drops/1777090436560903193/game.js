// --- CONSTANTS ---
const FRACTURE_THRESHOLD = 0.85;
const MAX_PARTICLES = 48;
const RESET_DURATION = 600; // ms
const TENSION_RAMP_RATE = 0.042; // per frame at 60fps ~200ms to threshold
const JITTER_START = 0.72;
const JITTER_AMP = 0.04;
const SHIMMER_FREQ = 8; // Hz - high-frequency catch light
const SHIMMER_AMP = 0.008;

// --- STATE ---
let tension = 0;
let pressing = false;
let state = 'idle'; // 'idle' | 'tension' | 'fractured' | 'resetting'
let resetTimer = 0;
let shimmerPhase = 0;
let jitterPhase = 0;
let particles = [];
let audioCtx = null;
let gradientAngleBase = 0;
let crackPaths = [];
let resetProgress = 0;

// --- CANVAS ---
const canvas = document.getElementById('frost');
const ctx = canvas.getContext('2d');
let W, H, cx, cy, dpr;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
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

// --- AUDIO: Juzaburo Sub-Bass Fracture Synthesis ---
// Multi-layered oscillator + noise chain with soft-clipping.
// Target: visceral chest-hit 30-45Hz, immediate snap, <16ms latency.
// Gain staging: master peak -12dBFS, sub-bass -6dB, transients -10dB.
// Soft-clip prevents distortion on mobile at 50% volume.

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  // Pre-warm: resume immediately on init to avoid first-tap latency
  audioCtx.resume();
}

function makeSoftClipCurve(curveSize) {
  const n = curveSize || 44100;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    // Hyperbolic tanh soft-clip: smooth rollover before hard clip
    curve[i] = Math.tanh(x * 2.8);
  }
  return curve;
}

function playSubBass() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;

  // === MASTER BUS with soft-clip limiter ===
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.78, now); // -2.1dBFS headroom
  const softClip = audioCtx.createWaveShaper();
  softClip.curve = makeSoftClipCurve(16384);
  softClip.oversample = '4x';
  masterGain.connect(softClip).connect(audioCtx.destination);

  // === LAYER 1: Core sub-bass fundamental (35Hz sine) ===
  // Chest-hit zone 30-45Hz. Instant attack, no easing.
  // Pitch sweeps down to 22Hz for body, then tail to silence.
  const subOsc = audioCtx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(38, now);
  subOsc.frequency.linearRampToValueAtTime(22, now + 0.12);
  subOsc.frequency.linearRampToValueAtTime(16, now + 0.45);
  const subGain = audioCtx.createGain();
  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(0.62, now + 0.002); // 32-sample blast-onset
  // Hold then hard drop-off (no exponential tail)
  subGain.gain.setValueAtTime(0.62, now + 0.06);
  subGain.gain.setValueAtTime(0.58, now + 0.08);
  subGain.gain.setValueAtTime(0.42, now + 0.14);
  subGain.gain.setValueAtTime(0.28, now + 0.22);
  subGain.gain.setValueAtTime(0.18, now + 0.32);
  subGain.gain.setValueAtTime(0.06, now + 0.42);
  subGain.gain.setValueAtTime(0, now + 0.52);
  subOsc.connect(subGain).connect(masterGain);
  subOsc.start(now);
  subOsc.stop(now + 0.54);

  // === LAYER 2: Sub-harmonic generator (triangle at 28Hz) ===
  // Adds warmth and reinforces LFE on mobile
  const subHarmonic = audioCtx.createOscillator();
  subHarmonic.type = 'triangle';
  subHarmonic.frequency.setValueAtTime(28, now);
  subHarmonic.frequency.linearRampToValueAtTime(18, now + 0.15);
  subHarmonic.frequency.linearRampToValueAtTime(14, now + 0.4);
  const subHG = audioCtx.createGain();
  subHG.gain.setValueAtTime(0, now);
  subHG.gain.linearRampToValueAtTime(0.42, now + 0.002);
  subHG.gain.setValueAtTime(0.42, now + 0.05);
  subHG.gain.setValueAtTime(0.32, now + 0.1);
  subHG.gain.setValueAtTime(0.18, now + 0.18);
  subHG.gain.setValueAtTime(0.08, now + 0.28);
  subHG.gain.setValueAtTime(0.02, now + 0.38);
  subHG.gain.setValueAtTime(0, now + 0.46);
  subHarmonic.connect(subHG).connect(masterGain);
  subHarmonic.start(now);
  subHarmonic.stop(now + 0.48);

  // === LAYER 3: 2nd harmonic reinforcement (76Hz sine) ===
  // Bridges sub-bass and mids for phone speaker translation
  const harm2 = audioCtx.createOscillator();
  harm2.type = 'sine';
  harm2.frequency.setValueAtTime(76, now);
  harm2.frequency.linearRampToValueAtTime(38, now + 0.08);
  harm2.frequency.linearRampToValueAtTime(22, now + 0.25);
  const harm2G = audioCtx.createGain();
  harm2G.gain.setValueAtTime(0, now);
  harm2G.gain.linearRampToValueAtTime(0.28, now + 0.001);
  harm2G.gain.setValueAtTime(0.28, now + 0.03);
  harm2G.gain.setValueAtTime(0.15, now + 0.07);
  harm2G.gain.setValueAtTime(0.06, now + 0.14);
  harm2G.gain.setValueAtTime(0.01, now + 0.22);
  harm2G.gain.setValueAtTime(0, now + 0.28);
  harm2.connect(harm2G).connect(masterGain);
  harm2.start(now);
  harm2.stop(now + 0.3);

  // === LAYER 4: Impact transient - percussive snap ===
  // Sawtooth sweep provides the "crack" at 340->40Hz
  const transOsc = audioCtx.createOscillator();
  transOsc.type = 'sawtooth';
  transOsc.frequency.setValueAtTime(420, now);
  transOsc.frequency.linearRampToValueAtTime(48, now + 0.035);
  const transG = audioCtx.createGain();
  transG.gain.setValueAtTime(0.18, now);
  transG.gain.setValueAtTime(0.12, now + 0.008);
  transG.gain.setValueAtTime(0.05, now + 0.02);
  transG.gain.setValueAtTime(0.01, now + 0.035);
  transG.gain.setValueAtTime(0, now + 0.05);
  transOsc.connect(transG).connect(masterGain);
  transOsc.start(now);
  transOsc.stop(now + 0.06);

  // === LAYER 5: Mid-frequency punch (200-500Hz bandpass) ===
  // Square wave filtered to carve the "fracture" mid-body
  const midPunch = audioCtx.createOscillator();
  midPunch.type = 'square';
  midPunch.frequency.setValueAtTime(320, now);
  midPunch.frequency.linearRampToValueAtTime(85, now + 0.06);
  midPunch.frequency.linearRampToValueAtTime(40, now + 0.18);
  const midBP = audioCtx.createBiquadFilter();
  midBP.type = 'bandpass';
  midBP.frequency.setValueAtTime(450, now);
  midBP.frequency.linearRampToValueAtTime(180, now + 0.12);
  midBP.Q.setValueAtTime(3.5, now);
  const midG = audioCtx.createGain();
  midG.gain.setValueAtTime(0, now);
  midG.gain.linearRampToValueAtTime(0.14, now + 0.001);
  midG.gain.setValueAtTime(0.14, now + 0.025);
  midG.gain.setValueAtTime(0.07, now + 0.055);
  midG.gain.setValueAtTime(0.02, now + 0.1);
  midG.gain.setValueAtTime(0, now + 0.16);
  midPunch.connect(midBP).connect(midG).connect(masterGain);
  midPunch.start(now);
  midPunch.stop(now + 0.18);

  // === LAYER 6: Broadband noise burst (ice shatter texture) ===
  // White noise through cascaded filters for glass-frost character
  const noiseDur = 0.08;
  const noiseLen = audioCtx.sampleRate * noiseDur;
  const noiseBuf = audioCtx.createBuffer(1, noiseLen, audioCtx.sampleRate);
  const ndata = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) {
    ndata[i] = (Math.random() * 2 - 1);
  }
  const noiseSrc = audioCtx.createBufferSource();
  noiseSrc.buffer = noiseBuf;

  // Bandpass for ice-frost shimmer (2k-5k peak)
  const noiseBP = audioCtx.createBiquadFilter();
  noiseBP.type = 'bandpass';
  noiseBP.frequency.setValueAtTime(3500, now);
  noiseBP.Q.setValueAtTime(2.2, now);

  // High-shelf to add brightness top
  const noiseHS = audioCtx.createBiquadFilter();
  noiseHS.type = 'highshelf';
  noiseHS.frequency.setValueAtTime(5000, now);
  noiseHS.gain.setValueAtTime(6, now);

  const noiseG = audioCtx.createGain();
  noiseG.gain.setValueAtTime(0, now);
  noiseG.gain.linearRampToValueAtTime(0.22, now + 0.001);
  noiseG.gain.setValueAtTime(0.22, now + 0.006);
  noiseG.gain.setValueAtTime(0.14, now + 0.015);
  noiseG.gain.setValueAtTime(0.06, now + 0.035);
  noiseG.gain.setValueAtTime(0.02, now + 0.055);
  noiseG.gain.setValueAtTime(0, now + 0.08);

  noiseSrc.connect(noiseBP).connect(noiseHS).connect(noiseG).connect(masterGain);
  noiseSrc.start(now);

  // === LAYER 7: High click transient for "blank tap" distinction ===
  // 8kHz click, ultra-short, perceptually distinct from UI tap
  const clickDur = 0.015;
  const clickLen = audioCtx.sampleRate * clickDur;
  const clickBuf = audioCtx.createBuffer(1, clickLen, audioCtx.sampleRate);
  const cdata = clickBuf.getChannelData(0);
  for (let i = 0; i < clickLen; i++) {
    const t = i / audioCtx.sampleRate;
    cdata[i] = (Math.random() * 2 - 1) * Math.exp(-t * 600);
  }
  const clickSrc = audioCtx.createBufferSource();
  clickSrc.buffer = clickBuf;
  const clickHP = audioCtx.createBiquadFilter();
  clickHP.type = 'highpass';
  clickHP.frequency.setValueAtTime(6000, now);
  clickHP.Q.setValueAtTime(1.5, now);
  const clickG = audioCtx.createGain();
  clickG.gain.setValueAtTime(0.12, now);
  clickG.gain.setValueAtTime(0, now + 0.015);
  clickSrc.connect(clickHP).connect(clickG).connect(masterGain);
  clickSrc.start(now);

  // === LAYER 8: Sub-bass tail - very low rumble ===
  // Lingering 18Hz that fades naturally, felt more than heard
  const tailOsc = audioCtx.createOscillator();
  tailOsc.type = 'sine';
  tailOsc.frequency.setValueAtTime(18, now + 0.04);
  tailOsc.frequency.linearRampToValueAtTime(12, now + 0.6);
  const tailG = audioCtx.createGain();
  tailG.gain.setValueAtTime(0, now);
  tailG.gain.setValueAtTime(0, now + 0.03);
  tailG.gain.linearRampToValueAtTime(0.22, now + 0.08);
  tailG.gain.setValueAtTime(0.22, now + 0.12);
  tailG.gain.setValueAtTime(0.16, now + 0.22);
  tailG.gain.setValueAtTime(0.1, now + 0.35);
  tailG.gain.setValueAtTime(0.05, now + 0.5);
  tailG.gain.setValueAtTime(0.01, now + 0.6);
  tailG.gain.setValueAtTime(0, now + 0.72);
  tailOsc.connect(tailG).connect(masterGain);
  tailOsc.start(now);
  tailOsc.stop(now + 0.74);
}

// --- PARTICLE SYSTEM (capped at 48, sharp shards, sharp decay) ---
function spawnScatter() {
  particles = [];
  const count = MAX_PARTICLES;
  const radius = Math.min(W, H) * 0.3;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = Math.PI * 2 * t + (Math.random() - 0.5) * 0.35;
    // Velocity inherited from tension - higher tension = more explosive
    const tensionMult = 0.6 + tension * 0.8;
    const speed = (4 + Math.random() * 12) * tensionMult;
    const size = 1.5 + Math.random() * 5;
    const hueShift = Math.random() * 50 - 25;
    particles.push({
      x: cx + (Math.random() - 0.5) * radius * 0.3,
      y: cy + (Math.random() - 0.5) * radius * 0.3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      life: 1,
      decay: 0.028 + Math.random() * 0.022, // sharp decay range
      hueShift,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.6,
      sharpness: 0.6 + Math.random() * 0.4, // shard aspect ratio
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.91;
    p.vy *= 0.91;
    p.life -= p.decay;
    p.rotation += p.rotSpeed;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    if (p.life <= 0) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const alpha = Math.pow(p.life, 1.5); // sharper fade
    const h = 198 + p.hueShift;
    const s = 55 + p.life * 35;
    const l = 65 + p.life * 30;
    ctx.globalAlpha = alpha * 0.95;
    ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
    ctx.strokeStyle = `hsla(${h}, ${s + 10}%, ${l + 15}%, ${alpha * 0.5})`;
    ctx.lineWidth = 0.5;
    // Sharp diamond shard
    const sw = p.size * p.sharpness;
    const sh = p.size * 3;
    ctx.beginPath();
    ctx.moveTo(0, -sh / 2);
    ctx.lineTo(sw / 2, 0);
    ctx.lineTo(0, sh / 2);
    ctx.lineTo(-sw / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// --- PROCEDURAL NOISE ---
const NOISE_SIZE = 64;
const noiseGrid = new Float32Array(NOISE_SIZE * NOISE_SIZE);
let noiseOffsetX = 0;
let noiseOffsetY = 0;

function noiseFill() {
  for (let i = 0; i < noiseGrid.length; i++) {
    noiseGrid[i] = Math.random();
  }
  noiseOffsetX = Math.random() * NOISE_SIZE;
  noiseOffsetY = Math.random() * NOISE_SIZE;
}
noiseFill();

function smoothNoise(xf, yf) {
  const x0 = ((Math.floor(xf) % NOISE_SIZE) + NOISE_SIZE) % NOISE_SIZE;
  const y0 = ((Math.floor(yf) % NOISE_SIZE) + NOISE_SIZE) % NOISE_SIZE;
  const x1 = (x0 + 1) % NOISE_SIZE;
  const y1 = (y0 + 1) % NOISE_SIZE;
  const sx = xf - Math.floor(xf);
  const sy = yf - Math.floor(yf);
  const sx2 = sx * sx * (3 - 2 * sx);
  const sy2 = sy * sy * (3 - 2 * sy);
  const v00 = noiseGrid[y0 * NOISE_SIZE + x0];
  const v10 = noiseGrid[y0 * NOISE_SIZE + x1];
  const v01 = noiseGrid[y1 * NOISE_SIZE + x0];
  const v11 = noiseGrid[y1 * NOISE_SIZE + x1];
  return v00 * (1 - sx2) * (1 - sy2) + v10 * sx2 * (1 - sy2) + v01 * sy2 * (1 - sx2) + v11 * sx2 * sy2;
}

// --- GENERATE CRACK PATHS (deterministic per fracture) ---
function generateCracks(radius) {
  crackPaths = [];
  const numCracks = 24;
  for (let i = 0; i < numCracks; i++) {
    const a = (Math.PI * 2 * i) / numCracks + (Math.random() - 0.5) * 0.3;
    const len = radius * (0.5 + Math.random() * 0.5);
    const pts = [{ x: cx, y: cy }];
    let px = cx, py = cy;
    const steps = 5 + Math.floor(Math.random() * 4);
    for (let s = 1; s <= steps; s++) {
      const deflection = (Math.random() - 0.5) * 0.7;
      px += Math.cos(a + deflection) * (len / steps);
      py += Math.sin(a + deflection) * (len / steps);
      pts.push({ x: px, y: py });
    }
    crackPaths.push(pts);
  }
}

// --- WOODBLOCK GRAIN (cached) ---
let grainCanvas = null;
function bakeGrain() {
  grainCanvas = document.createElement('canvas');
  grainCanvas.width = W * dpr;
  grainCanvas.height = H * dpr;
  const gctx = grainCanvas.getContext('2d');
  gctx.fillStyle = '#0a0c10';
  gctx.fillRect(0, 0, W * dpr, H * dpr);
  for (let i = 0; i < 40; i++) {
    const y = i * dpr * (H / 40);
    const h = (1 + Math.random() * 2) * dpr;
    const wobble = Math.sin(i * 0.7) * 4 * dpr;
    gctx.fillStyle = `rgba(${18 + Math.floor(Math.random() * 10)}, ${22 + Math.floor(Math.random() * 8)}, ${30 + Math.floor(Math.random() * 10)}, ${0.15 + Math.random() * 0.15})`;
    gctx.fillRect(wobble, y, W * dpr, h);
  }
  // Knots
  for (let k = 0; k < 3; k++) {
    const kx = Math.random() * W;
    const ky = Math.random() * H;
    const kr = (5 + Math.random() * 15) * dpr;
    gctx.strokeStyle = 'rgba(25, 30, 40, 0.1)';
    gctx.lineWidth = dpr;
    for (let r = kr; r > 0; r -= dpr * 3) {
      gctx.beginPath();
      gctx.arc(kx * dpr, ky * dpr, r, 0, Math.PI * 2);
      gctx.stroke();
    }
  }
}
bakeGrain();
window.addEventListener('resize', () => { resize(); bakeGrain(); });

// --- COLOR LERP ---
function lerpColor(a, b, t) {
  t = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

// --- FROST RENDERING ---
function drawFrost() {
  const minDim = Math.min(W, H);
  const radius = minDim * 0.42;

  // Draw baked woodblock grain
  if (grainCanvas) {
    ctx.drawImage(grainCanvas, 0, 0);
  }

  // --- IDLE: high-frequency shimmer ---
  if (state === 'idle') {
    drawFrostDisk(radius, 0, shimmerPhase);
    drawShimmerHighlight(radius, shimmerPhase);
    return;
  }

  // --- TENSION: taut linear compression ---
  if (state === 'tension') {
    let angleShift = tension * Math.PI * 0.5;
    let jitterX = 0;
    let jitterY = 0;

    // Micro-jitter ramping into fracture
    if (tension > JITTER_START) {
      const jitterFrac = (tension - JITTER_START) / (FRACTURE_THRESHOLD - JITTER_START);
      const amp = JITTER_AMP * jitterFrac;
      jitterX = Math.sin(jitterPhase * 22) * amp + Math.cos(jitterPhase * 31) * amp * 0.6;
      jitterY = Math.cos(jitterPhase * 19) * amp + Math.sin(jitterPhase * 29) * amp * 0.6;
    }

    // Gradient offset center tracks tension angle
    const gradX = cx + Math.cos(angleShift + 1.2) * radius * 0.1 + jitterX * radius;
    const gradY = cy + Math.sin(angleShift + 1.2) * radius * 0.1 + jitterY * radius;

    // Tension compresses gradient stops - color bands squeeze inward
    const frostAlpha = 0.85 + tension * 0.15; // gets more opaque = more pressurized

    drawFrostDiskWithOffset(radius, gradX - cx, gradY - cy, tension, frostAlpha, shimmerPhase);

    // Compression ring visual - tightening border glow
    ctx.save();
    ctx.globalAlpha = tension * 0.4;
    ctx.strokeStyle = `rgba(200, 230, 255, ${tension * 0.6})`;
    ctx.lineWidth = 1 + tension * 2;
    const compressedR = radius * (1 - tension * 0.05);
    ctx.beginPath();
    ctx.arc(cx + jitterX * radius * 2, cy + jitterY * radius * 2, compressedR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // --- FRACTURED: woodblock revealed, crack web visible ---
  if (state === 'fractured') {
    // Frost largely gone - just crack lines on the grain background
    // Faint residual frost
    ctx.save();
    ctx.globalAlpha = 0.15;
    drawFrostDisk(radius, 0, 0);
    ctx.restore();

    // Crack web
    drawCrackWeb(radius);
    return;
  }

  // --- RESETTING: procedural noise re-forms the frost ---
  if (state === 'resetting') {
    // Fade frost back in with noise-driven fill
    const frostOpacity = resetProgress;
    drawFrostDisk(radius, 0, shimmerPhase, frostOpacity);

    // Noise texture during reformation
    ctx.save();
    ctx.globalAlpha = (1 - resetProgress) * 0.12;
    const scale = 6;
    for (let nq = 0; nq < 16; nq++) {
      for (let nr = 0; nr < 16; nr++) {
        const n = smoothNoise(
          (nq + noiseOffsetX) * scale * 0.1,
          (nr + noiseOffsetY) * scale * 0.1 + resetTimer * 0.002
        );
        if (n > 0.55) {
          const px = cx + (nq - 8) * (radius * 2 / 16) + radius / 16;
          const py = cy + (nr - 8) * (radius * 2 / 16) + radius / 16;
          const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
          if (dist < radius) {
            ctx.fillStyle = `rgba(220, 240, 255, ${n * 0.15 * (1 - resetProgress)})`;
            ctx.fillRect(px - 3, py - 3, 6, 6);
          }
        }
      }
    }
    ctx.restore();
  }
}

function drawFrostDisk(radius, shimmerOff, phase, alphaOverride) {
  const alpha = alphaOverride !== undefined ? alphaOverride : 0.9;
  const shimmerX = shimmerOff ? Math.sin(shimmerOff) * SHIMMER_AMP * radius : 0;
  const shimmerY = shimmerOff ? Math.cos(shimmerOff * 1.3) * SHIMMER_AMP * radius : 0;
  const gx = cx + shimmerX + Math.cos(phase * 0.7) * radius * 0.08;
  const gy = cy + shimmerY + Math.sin(phase * 0.5) * radius * 0.08;

  const grad = ctx.createRadialGradient(gx, gy, 0, cx, cy, radius);
  grad.addColorStop(0, `rgba(210, 235, 255, ${alpha * 0.9})`);
  grad.addColorStop(0.25, `rgba(175, 210, 245, ${alpha * 0.85})`);
  grad.addColorStop(0.55, `rgba(120, 165, 220, ${alpha * 0.7})`);
  grad.addColorStop(0.8, `rgba(65, 105, 185, ${alpha * 0.35})`);
  grad.addColorStop(1, `rgba(30, 55, 130, ${alpha * 0.02})`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Ice facets
  ctx.save();
  ctx.globalAlpha = (alphaOverride !== undefined ? alphaOverride : 1) * 0.12;
  drawIceFacets(radius, phase);
  ctx.restore();
}

function drawFrostDiskWithOffset(radius, offX, offY, tensionVal, alpha, phase) {
  const gx = cx + offX + Math.cos(1.2) * radius * 0.1;
  const gy = cy + offY + Math.sin(1.2) * radius * 0.1;

  const grad = ctx.createRadialGradient(gx, gy, 0, cx, cy, radius);

  // Stops compress toward center with tension - creates "pressurized" look
  const s0 = 0;
  const s1 = 0.25 - tensionVal * 0.08;
  const s2 = 0.55 - tensionVal * 0.15;
  const s3 = 0.8 - tensionVal * 0.2;
  const s4 = 1;

  const c1 = lerpColor([210, 235, 255], [190, 200, 245], tensionVal);
  const c2 = lerpColor([175, 210, 245], [130, 165, 225], tensionVal);
  const c3 = lerpColor([120, 165, 220], [70, 110, 190], tensionVal);
  const c4 = lerpColor([65, 105, 185], [35, 60, 150], tensionVal);

  grad.addColorStop(s0, `rgba(${c1[0]},${c1[1]},${c1[2]}, ${alpha * 0.9})`);
  grad.addColorStop(Math.max(s1, 0.01), `rgba(${c2[0]},${c2[1]},${c2[2]}, ${alpha * 0.85})`);
  grad.addColorStop(Math.max(s2, 0.02), `rgba(${c3[0]},${c3[1]},${c3[2]}, ${alpha * 0.7})`);
  grad.addColorStop(Math.max(s3, 0.03), `rgba(${c4[0]},${c4[1]},${c4[2]}, ${alpha * 0.3})`);
  grad.addColorStop(s4, `rgba(${c4[0]},${c4[1]},${c4[2]}, 0.01)`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Ice facets get more prominent under tension
  ctx.save();
  ctx.globalAlpha = 0.12 + tensionVal * 0.18;
  drawIceFacets(radius, phase);
  ctx.restore();
}

function drawShimmerHighlight(radius, phase) {
  const shimmerIntensity = Math.abs(Math.sin(phase * SHIMMER_FREQ * 0.5)) * 0.18;
  if (shimmerIntensity < 0.01) return;

  const shimX = cx + Math.cos(phase * 1.5) * radius * 0.25;
  const shimY = cy + Math.sin(phase * 1.1) * radius * 0.25;

  const shimGrad = ctx.createRadialGradient(shimX, shimY, 0, cx, cy, radius * 0.55);
  shimGrad.addColorStop(0, `rgba(245, 252, 255, ${shimmerIntensity})`);
  shimGrad.addColorStop(0.5, `rgba(200, 225, 255, ${shimmerIntensity * 0.4})`);
  shimGrad.addColorStop(1, `rgba(150, 190, 255, 0)`);

  ctx.fillStyle = shimGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawIceFacets(radius, phase) {
  const numFacets = 8;
  ctx.strokeStyle = `rgba(210, 235, 255, ${0.18 + 0.08 * Math.sin(phase * 2)})`;
  ctx.lineWidth = 0.5;
  for (let i = 0; i < numFacets; i++) {
    const a = phase * 0.1 + (Math.PI * 2 * i) / numFacets;
    const r1 = radius * (0.25 + 0.12 * Math.sin(i * 2.1));
    const r2 = radius * (0.65 + 0.22 * Math.sin(i * 3.3 + 0.5));
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a + 0.25) * r2, cy + Math.sin(a + 0.25) * r2);
    ctx.stroke();
  }
}

function drawCrackWeb(radius) {
  ctx.save();
  ctx.strokeStyle = 'rgba(210, 235, 255, 0.3)';
  ctx.lineWidth = 0.8;
  for (const pts of crackPaths) {
    if (pts.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// --- INPUT ---
function onDown(e) {
  e.preventDefault();
  initAudio();
  if (state === 'idle') {
    state = 'tension';
    pressing = true;
    tension = 0;
  }
}

function onUp(e) {
  e.preventDefault();
  pressing = false;
  if (state === 'tension') {
    // Release triggers fracture regardless of tension level
    triggerFracture();
  }
}

canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mouseup', onUp);
canvas.addEventListener('mouseleave', onUp);
canvas.addEventListener('touchstart', onDown, { passive: false });
canvas.addEventListener('touchend', onUp, { passive: false });
canvas.addEventListener('touchcancel', onUp, { passive: false });

// --- FRACTURE DISPATCH ---
function triggerFracture() {
  generateCracks(Math.min(W, H) * 0.42);
  spawnScatter();
  playSubBass();
  state = 'fractured';
  // Brief fractured hold then reset
  setTimeout(() => {
    state = 'resetting';
    resetTimer = 0;
    resetProgress = 0;
    tension = 0;
    noiseFill();
  }, 150);
}

// --- MAIN LOOP ---
let lastTime = 0;
function loop(timestamp) {
  const dt = Math.min(timestamp - lastTime, 33.4);
  const dtNorm = dt / 16.667; // normalize to ~60fps
  lastTime = timestamp;

  // High-frequency shimmer phase advance
  shimmerPhase += (dt / 1000) * SHIMMER_FREQ;
  jitterPhase += (dt / 1000) * 15;

  // State machine
  switch (state) {
    case 'idle':
      // Nothing - shimmer handled in drawFrost
      break;

    case 'tension':
      if (pressing) {
        // RAW LINEAR ramp - no easing, no softening
        tension += TENSION_RAMP_RATE * dtNorm;
        if (tension >= FRACTURE_THRESHOLD) {
          tension = FRACTURE_THRESHOLD;
          triggerFracture();
        }
      } else {
        // Released before threshold - snap whatever tension has built
        triggerFracture();
      }
      break;

    case 'fractured':
      // Hold briefly with crack web visible
      break;

    case 'resetting':
      resetTimer += dt;
      resetProgress = Math.min(resetTimer / RESET_DURATION, 1);
      // Linear procedural reformation
      if (resetProgress >= 1) {
        state = 'idle';
        tension = 0;
        resetProgress = 0;
      }
      break;
  }

  // Particle updates
  if (state === 'fractured' || state === 'resetting') {
    updateParticles();
  }

  // Render
  drawFrost();
  drawParticles();

  requestAnimationFrame(loop);
}

requestAnimationFrame((ts) => {
  lastTime = ts;
  loop(ts);
});