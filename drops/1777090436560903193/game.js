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

// --- AUDIO (minimal latency: scheduled at currentTime, no buffer) ---
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSubBass() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;

  // Layer 1: deep sub-bass - chest hit
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(38, now);
  osc1.frequency.exponentialRampToValueAtTime(18, now + 0.18);
  const g1 = audioCtx.createGain();
  g1.gain.setValueAtTime(0, now);
  g1.gain.linearRampToValueAtTime(0.95, now + 0.003);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  osc1.connect(g1).connect(audioCtx.destination);
  osc1.start(now);
  osc1.stop(now + 0.55);

  // Layer 2: sub-harmonic reinforcement
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(25, now);
  osc2.frequency.exponentialRampToValueAtTime(12, now + 0.22);
  const g2 = audioCtx.createGain();
  g2.gain.setValueAtTime(0, now);
  g2.gain.linearRampToValueAtTime(0.55, now + 0.004);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc2.connect(g2).connect(audioCtx.destination);
  osc2.start(now);
  osc2.stop(now + 0.5);

  // Layer 3: crack transient - fast attack
  const osc3 = audioCtx.createOscillator();
  osc3.type = 'sawtooth';
  osc3.frequency.setValueAtTime(340, now);
  osc3.frequency.exponentialRampToValueAtTime(60, now + 0.05);
  const g3 = audioCtx.createGain();
  g3.gain.setValueAtTime(0.5, now);
  g3.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
  osc3.connect(g3).connect(audioCtx.destination);
  osc3.start(now);
  osc3.stop(now + 0.09);

  // Layer 4: filtered noise burst for snap texture
  const bufLen = audioCtx.sampleRate * 0.06;
  const noiseBuf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
  const raw = noiseBuf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    raw[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.12));
  }
  const nsrc = audioCtx.createBufferSource();
  nsrc.buffer = noiseBuf;
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(0.4, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(4000, now);
  lp.frequency.exponentialRampToValueAtTime(150, now + 0.05);
  nsrc.connect(lp).connect(ng).connect(audioCtx.destination);
  nsrc.start(now);

  // Layer 5: mid-frequency snap for articulation
  const osc4 = audioCtx.createOscillator();
  osc4.type = 'square';
  osc4.frequency.setValueAtTime(180, now);
  osc4.frequency.exponentialRampToValueAtTime(40, now + 0.04);
  const g4 = audioCtx.createGain();
  g4.gain.setValueAtTime(0.25, now);
  g4.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(500, now);
  bp.Q.setValueAtTime(4, now);
  osc4.connect(bp).connect(g4).connect(audioCtx.destination);
  osc4.start(now);
  osc4.stop(now + 0.07);
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