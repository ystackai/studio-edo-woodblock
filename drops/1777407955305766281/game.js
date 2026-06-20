/**
 * Damp Earth Silt Interaction Engine
 * Zero-dependency. Canvas renderer + Web Audio + Haptics API.
 * Core loop: press → immediate haptics → 150ms ripple delay → sink + exhale → release click.
 */

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════
const RIPPLE_DELAY_MS = 150;
const HAPTIC_DURATION_MS = 1000;
const MAX_SINK_DEPTH = 18;
const PARTICLE_COUNT = 36;
const GRID_CELL = 4;

// Cubic bezier for haptic decay: cubic-bezier(0.25, 1, 0.5, 1)
const BEZIER = { p1x: 0.25, p1y: 1.0, p2x: 0.5, p2y: 1.0 };

// ═══════════════════════════════════════════
// State
// ═══════════════════════════════════════════
let canvas, ctx;
let width, height, dpr;
let centerX, centerY;
let audioCtx = null;
let masterGain = null;
let noiseBuffer = null;
let holdSource = null;
let holdGain = null;
let holdRumble = null;
let holdRumbleGain = null;
let holdLfo = null;

let pressing = false;
let pressStart = 0;
let sinkDepth = 0;
let targetDepth = 0;
let ripples = [];
let particles = [];
let lastFrame = 0;
let ambientNodes = null;
let ambientRunning = false;

// ═══════════════════════════════════════════
// Cubic Bezier — cubic-bezier(0.25, 1, 0.5, 1)
// ═══════════════════════════════════════════
function cubicBezier(t) {
    t = Math.max(0, Math.min(1, t));
    const cx = 3 * BEZIER.p1x;
    const bx = 3 * (BEZIER.p2x - BEZIER.p1x) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * BEZIER.p1y;
    const by = 3 * (BEZIER.p2y - BEZIER.p1y) - cy;
    const ay = 1 - cy - by;

    let u = t;
    for (let i = 0; i < 8; i++) {
        const x = ((ax * u + bx) * u + cx) * u - t;
        const dx = (3 * ax * u + 2 * bx) * u + cx;
        if (Math.abs(dx) < 1e-6) break;
        u -= x / dx;
    }
    u = Math.max(0, Math.min(1, u));
    return ((ay * u + by) * u + cy) * u;
}

// ═══════════════════════════════════════════
// Pseudo-random noise
// ═══════════════════════════════════════════
function noise(x, y) {
    const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return v - Math.floor(v);
}

// ═══════════════════════════════════════════
// Audio Engine
// ═══════════════════════════════════════════

function initAudio() {
    if (audioCtx) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.gain.setValueAtTime(0.7, audioCtx.currentTime);

    // Pre-generate noise buffer
    const sr = audioCtx.sampleRate;
    const len = sr * 2;
    noiseBuffer = audioCtx.createBuffer(1, len, sr);
    const ch = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
        ch[i] = Math.random() * 2 - 1;
    }

    startAmbientBed();
}

function startAmbientBed() {
    if (!audioCtx || ambientRunning) return;
    ambientRunning = true;

    const now = audioCtx.currentTime;

    // Low-pass ambient bed: deep earth hum ~35Hz
    const hum = audioCtx.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 35;

    const humGain = audioCtx.createGain();
    humGain.gain.value = 0.06;

    // Filtered noise bed (subtle, matte)
    const ambSource = audioCtx.createBufferSource();
    ambSource.buffer = noiseBuffer;
    ambSource.loop = true;

    const ambLpf = audioCtx.createBiquadFilter();
    ambLpf.type = 'lowpass';
    ambLpf.frequency.value = 150;
    ambLpf.Q.value = 0.3;

    const ambGain = audioCtx.createGain();
    ambGain.gain.value = 0.04;

    hum.connect(humGain).connect(masterGain);
    ambSource.connect(ambLpf).connect(ambGain).connect(masterGain);

    hum.start(now);
    ambSource.start(now);

    ambientNodes = { hum, humGain, ambSource, ambGain, ambLpf };
}

function playThud() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const steps = 20;
    const dur = 0.35;

    // 80Hz body
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(55, now + 0.14);

    // 160Hz harmonic
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(150, now);
    osc2.frequency.linearRampToValueAtTime(90, now + 0.1);

    // Low-pass to keep matte
    const lpf = audioCtx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(400, now);
    lpf.frequency.linearRampToValueAtTime(100, now + 0.2);
    lpf.Q.value = 0.5;

    // Noise transient (crushed, transient-focused)
    const tNoise = audioCtx.createBufferSource();
    tNoise.buffer = noiseBuffer;
    const tNlpf = audioCtx.createBiquadFilter();
    tNlpf.type = 'lowpass';
    tNlpf.frequency.setValueAtTime(180, now);
    tNlpf.frequency.linearRampToValueAtTime(50, now + 0.15);

    // Envelope: bezier-shaped decay
    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0.7, now);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        env.gain.setTargetAtTime(cubicBezier(t) * 0.7, now + t * dur, 0.004);
    }
    env.gain.setValueAtTime(0, now + dur + 0.01);

    // Osc gains
    const g1 = audioCtx.createGain();
    g1.gain.setValueAtTime(cubicBezier(0), now);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        g1.gain.setTargetAtTime(cubicBezier(t), now + t * dur, 0.003);
    }
    g1.gain.setValueAtTime(0, now + dur + 0.01);

    const g2 = audioCtx.createGain();
    g2.gain.setValueAtTime(0.25, now);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        g2.gain.setTargetAtTime(cubicBezier(t) * 0.25, now + t * dur * 0.75, 0.004);
    }
    g2.gain.setValueAtTime(0, now + dur * 0.75 + 0.01);

    const gN = audioCtx.createGain();
    gN.gain.setValueAtTime(0.35, now);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        gN.gain.setTargetAtTime(cubicBezier(t) * 0.35, now + t * dur, 0.005);
    }
    gN.gain.setValueAtTime(0, now + dur + 0.01);

    // Wire
    osc.connect(g1).connect(lpf);
    osc2.connect(g2).connect(lpf);
    tNoise.connect(tNlpf).connect(gN).connect(lpf);
    lpf.connect(env).connect(masterGain);

    osc.start(now);
    osc.stop(now + dur + 0.05);
    osc2.start(now);
    osc2.stop(now + dur * 0.75 + 0.05);
    tNoise.start(now);
    tNoise.stop(now + dur + 0.05);
}

function playHold(amp) {
    if (!audioCtx) return;
    amp = Math.max(0, Math.min(1, amp));
    const now = audioCtx.currentTime;

    if (holdGain) {
        holdGain.gain.setTargetAtTime(amp * 0.3, now, 0.02);
        if (holdRumbleGain) {
            holdRumbleGain.gain.setTargetAtTime(amp * 0.12, now, 0.03);
        }
        return;
    }

    // Wet drag: filtered noise
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(280, now);
    bp.Q.value = 1.8;

    const lpf = audioCtx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(700, now);
    lpf.frequency.linearRampToValueAtTime(350, now + 1.5);

    holdGain = audioCtx.createGain();
    holdGain.gain.setValueAtTime(amp * 0.3, now);

    // Sub rumble
    holdRumble = audioCtx.createOscillator();
    holdRumble.type = 'sine';
    holdRumble.frequency.setValueAtTime(42, now);
    holdRumble.frequency.linearRampToValueAtTime(30, now + 2);

    holdRumbleGain = audioCtx.createGain();
    holdRumbleGain.gain.setValueAtTime(amp * 0.12, now);

    // Slow LFO drift for organic texture
    holdLfo = audioCtx.createOscillator();
    holdLfo.type = 'sine';
    holdLfo.frequency.value = 0.25;
    const lfoG = audioCtx.createGain();
    lfoG.gain.value = 35;
    holdLfo.connect(lfoG).connect(bp.frequency);

    src.connect(bp).connect(lpf).connect(holdGain).connect(masterGain);
    holdRumble.connect(holdRumbleGain).connect(masterGain);

    src.start(now);
    holdRumble.start(now);
    holdLfo.start(now);

    holdSource = { src, bp, lpf, lfoG, holdRumble, holdLfo };
}

function stopHold() {
    if (!holdGain) return;
    const now = audioCtx.currentTime;
    holdGain.gain.setValueAtTime(0, now);
    if (holdRumbleGain) holdRumbleGain.gain.setValueAtTime(0, now);
    setTimeout(() => {
        try {
            if (holdSource) {
                holdSource.src.stop();
                holdRumble.stop();
                holdLfo.stop();
            }
        } catch (_) {}
        holdSource = null;
        holdGain = null;
        holdRumble = null;
        holdRumbleGain = null;
        holdLfo = null;
    }, 50);
}

function playRelease() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    stopHold();

    // Crisp snap: noise band 600-2000Hz, sharp attack, instant decay
    const cNoise = audioCtx.createBufferSource();
    cNoise.buffer = noiseBuffer;

    const hpf = audioCtx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 600;

    const clickLpf = audioCtx.createBiquadFilter();
    clickLpf.type = 'lowpass';
    clickLpf.frequency.value = 2200;
    clickLpf.frequency.linearRampToValueAtTime(400, now + 0.035);

    const cGain = audioCtx.createGain();
    cGain.gain.setValueAtTime(0.3, now);
    cGain.gain.linearRampToValueAtTime(0.02, now + 0.018);
    cGain.gain.setValueAtTime(0, now + 0.045);

    cNoise.connect(hpf).connect(clickLpf).connect(cGain).connect(masterGain);
    cNoise.start(now);
    cNoise.stop(now + 0.06);

    // Micro sub-settle
    const settle = audioCtx.createOscillator();
    settle.type = 'sine';
    settle.frequency.setValueAtTime(50, now);
    settle.frequency.linearRampToValueAtTime(38, now + 0.07);
    const sG = audioCtx.createGain();
    sG.gain.setValueAtTime(0.18, now);
    sG.gain.linearRampToValueAtTime(0, now + 0.05);
    settle.connect(sG).connect(masterGain);
    settle.start(now);
    settle.stop(now + 0.08);
}

// ═══════════════════════════════════════════
// Haptics
// ═══════════════════════════════════════════

function triggerHapticPress() {
    if (navigator.vibrate) {
        navigator.vibrate([70, 25, 55, 18, 35]);
    }
}

function triggerHapticRelease() {
    if (navigator.vibrate) {
        navigator.vibrate(8);
    }
}

// ═══════════════════════════════════════════
// Silt Grid — displacement field
// ═══════════════════════════════════════════

let siltRows = 0;
let siltCols = 0;
let siltGrid = [];

function initSiltGrid() {
    siltCols = Math.ceil(width / GRID_CELL) + 2;
    siltRows = Math.ceil(height / GRID_CELL) + 2;
    siltGrid = [];
    for (let y = 0; y < siltRows; y++) {
        siltGrid[y] = new Float32Array(siltCols);
    }
}

function displaceSilt(cx, cy, depth) {
    const radius = 80 + depth * 3;
    const r2 = radius * radius;
    const gx0 = Math.max(0, Math.floor((cx - radius) / GRID_CELL) - 1);
    const gx1 = Math.min(siltCols - 1, Math.ceil((cx + radius) / GRID_CELL) + 1);
    const gy0 = Math.max(0, Math.floor((cy - radius) / GRID_CELL) - 1);
    const gy1 = Math.min(siltRows - 1, Math.ceil((cy + radius) / GRID_CELL) + 1);

    for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
            const px = gx * GRID_CELL;
            const py = gy * GRID_CELL;
            const dx = px - cx;
            const dy = py - cy;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < r2) {
                const t = 1 - Math.sqrt(dist2) / radius;
                const eased = 1 - (1 - t) * (1 - t);
                siltGrid[gy][gx] = depth * eased;
            }
        }
    }
}

function relaxSilt() {
    for (let y = 1; y < siltRows - 1; y++) {
        for (let x = 1; x < siltCols - 1; x++) {
            siltGrid[y][x] *= 0.995;
            if (siltGrid[y][x] < 0.01) siltGrid[y][x] = 0;
        }
    }
}

// ═══════════════════════════════════════════
// Rendering
// ═══════════════════════════════════════════

function draw() {
    // Matte dark base
    ctx.fillStyle = '#0a0c14';
    ctx.fillRect(0, 0, width, height);

    // Silt displacement field — procedural grain
    const gx0 = Math.max(0, Math.floor((centerX - 200) / GRID_CELL));
    const gx1 = Math.min(siltCols - 1, Math.ceil((centerX + 200) / GRID_CELL));
    const gy0 = Math.max(0, Math.floor((centerY - 200) / GRID_CELL));
    const gy1 = Math.min(siltRows - 1, Math.ceil((centerY + 200) / GRID_CELL));

    for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
            const disp = siltGrid[gy] ? siltGrid[gy][gx] : 0;
            if (disp < 0.05) continue;

            const px = gx * GRID_CELL;
            const py = gy * GRID_CELL;
            const n = noise(gx * 3.7, gy * 5.3);

            const darkness = Math.min(25, disp * 2.5 + n * 8);
            const alpha = Math.min(0.6, 0.15 + disp * 0.04);

            ctx.fillStyle = `rgba(${10 + darkness * 0.4|0},${12 + darkness * 0.5|0},${18 + darkness * 0.3|0},${alpha.toFixed(2)})`;
            ctx.fillRect(px, py, GRID_CELL, GRID_CELL);
        }
    }

    // Central node (stone)
    const now = performance.now();
    const elapsed = pressing ? now - pressStart : 0;
    const t = Math.min(1, elapsed / HAPTIC_DURATION_MS);
    const amp = pressing ? cubicBezier(t) : 0;

    // Recover from release
    if (!pressing) {
        sinkDepth += (0 - sinkDepth) * 0.08;
    }

    const nodeY = centerY + sinkDepth;
    const nodeR = 48;

    // Shadow ring (displacement)
    ctx.fillStyle = `rgba(5,6,12,${(0.25 + amp * 0.35).toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(centerX, nodeY + nodeR + 6 + sinkDepth * 0.25,
        nodeR + sinkDepth * 0.4,
        nodeR * 0.22 + sinkDepth * 0.12,
        0, 0, Math.PI * 2);
    ctx.fill();

    // Stone body
    const grad = ctx.createRadialGradient(
        centerX - 8, nodeY - 10, 2,
        centerX, nodeY, nodeR
    );
    grad.addColorStop(0, '#4e5168');
    grad.addColorStop(0.35, '#34374c');
    grad.addColorStop(0.75, '#252840');
    grad.addColorStop(1, '#1a1d30');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, nodeY, nodeR, 0, Math.PI * 2);
    ctx.fill();

    // Stone procedural texture
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, nodeY, nodeR, 0, Math.PI * 2);
    ctx.clip();

    const rng = Math.ceil(nodeR * 2 / 2) + 1;
    for (let dy = -rng; dy <= rng; dy++) {
        for (let dx = -rng; dx <= rng; dx++) {
            const px = centerX + dx * 2;
            const py = nodeY + dy * 2;
            if ((px - centerX) ** 2 + (py - nodeY) ** 2 > nodeR * nodeR) continue;

            const v = noise(dx * 7.13, dy * 13.37);
            const intensity = v * (1 - v) * 4;
            if (intensity > 0.1) {
                const a = (intensity * 0.5 + amp * 0.12).toFixed(3);
                ctx.fillStyle = `rgba(${intensity > 0.25 ? 85 : 38},${intensity > 0.25 ? 88 : 40},${intensity > 0.25 ? 110 : 55},${a})`;
                ctx.fillRect(px, py, 2, 2);
            }
        }
    }
    ctx.restore();

    // Sharp rim
    ctx.strokeStyle = `rgba(60,64,88,${(0.35 + amp * 0.2).toFixed(2)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, nodeY, nodeR, 0, Math.PI * 2);
    ctx.stroke();

    // Ripples
    drawRipples(now);

    // Particles
    drawParticles(now);

    // Grain overlay
    drawGrain(now, amp);
}

// ── Ripples ──

function scheduleRipple() {
    setTimeout(() => {
        const now = performance.now();
        const activeRipples = ripples.filter(r => now - r.birth < 3500);
        ripples = [...activeRipples, {
        x: centerX,
            y: centerY + sinkDepth,
            birth: now,
            maxR: Math.max(width, height) * 0.45,
            speed: 110
        }];
    }, RIPPLE_DELAY_MS);
}

function drawRipples(now) {
    for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = now - r.birth;
        if (age < 0) continue;

        const radius = r.speed * (age / 1000);
        const alpha = Math.max(0, 1 - age / 3200);

        if (alpha <= 0 || radius > r.maxR) {
            ripples.splice(i, 1);
            continue;
        }

        // Hard-edge ring
        const g = ctx.createRadialGradient(r.x, r.y, radius * 0.88, r.x, r.y, radius);
        g.addColorStop(0, `rgba(20,23,42,0)`);
        g.addColorStop(0.65, `rgba(35,40,70,${(alpha * 0.22).toFixed(3)})`);
        g.addColorStop(0.92, `rgba(18,21,40,${(alpha * 0.35).toFixed(3)})`);
        g.addColorStop(1, `rgba(10,12,20,0)`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Wireframe ring
        ctx.strokeStyle = `rgba(48,52,82,${(alpha * 0.12).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius * 0.94, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// ── Particles ──

function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 0.08 + Math.random() * 0.2,
            size: 0.6 + Math.random() * 1.2,
            alpha: 0.06 + Math.random() * 0.1,
            drift: (Math.random() - 0.5) * 0.25
        });
    }
}

function drawParticles(now) {
    for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;

        ctx.fillStyle = `rgba(55,58,82,${p.alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ── Grain overlay ──

const grainOffscreen = document.createElement('canvas');
grainOffscreen.width = 64;
grainOffscreen.height = 64;
let grainDirty = true;

function drawGrain(now, amp) {
    if (amp < 0.005 && sinkDepth < 0.5) return;

    if (grainDirty) {
        const gCtx = grainOffscreen.getContext('2d');
        const img = gCtx.createImageData(64, 64);
        for (let i = 0; i < img.data.length; i += 4) {
            const v = Math.random() * 255;
            img.data[i] = v;
            img.data[i + 1] = v;
            img.data[i + 2] = v;
            img.data[i + 3] = 20 + Math.random() * 15;
        }
        gCtx.putImageData(img, 0, 0);
        grainDirty = false;
    }

    ctx.save();
    ctx.globalAlpha = 0.15 + amp * 0.25;
    ctx.globalCompositeOperation = 'overlay';
    ctx.imageSmoothingEnabled = false;

    const step = 64;
    for (let y = 0; y < height + step; y += step) {
        for (let x = 0; x < width + step; x += step) {
            ctx.drawImage(grainOffscreen, x, y);
        }
    }
    ctx.restore();
}

// ═══════════════════════════════════════════
// Input
// ═══════════════════════════════════════════

function onDown(e) {
    e.preventDefault();
    if (pressing) return;

    pressing = true;
    pressStart = performance.now();
    targetDepth = MAX_SINK_DEPTH;

    initAudio();
    playThud();
    triggerHapticPress();
    scheduleRipple();
}

function onUp(e) {
    e.preventDefault();
    if (!pressing) return;

    pressing = false;
    targetDepth = 0;
    playRelease();
    triggerHapticRelease();
}

function setupInput() {
    canvas.addEventListener('touchstart', onDown, { passive: false });
    canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchend', onUp, { passive: false });
    canvas.addEventListener('touchcancel', onUp, { passive: false });
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', onUp);
}

// ═══════════════════════════════════════════
// Resize
// ═══════════════════════════════════════════

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    centerX = width / 2;
    centerY = height / 2;
    initSiltGrid();
    initParticles();
}

// ═══════════════════════════════════════════
// Main Loop
// ═══════════════════════════════════════════

function loop(now) {
    const dt = Math.min(now - lastFrame, 50);
    lastFrame = now;

    // Update sink
    if (pressing) {
        const elapsed = now - pressStart;
        const t = Math.min(1, elapsed / HAPTIC_DURATION_MS);
        const amp = cubicBezier(t);
        const target = MAX_SINK_DEPTH * amp;

        // Smooth but heavy lerp — no float
        sinkDepth += (target - sinkDepth) * 0.12;

        // Displace silt
        displaceSilt(centerX, centerY + sinkDepth, sinkDepth);

        // Feed hold audio
        playHold(amp);
    }

    relaxSilt();
    draw();

    requestAnimationFrame(loop);
}

// ═══════════════════════════════════════════
// Boot
// ═══════════════════════════════════════════

window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);
    setupInput();
    initSiltGrid();
    initParticles();

    lastFrame = performance.now();
    requestAnimationFrame(loop);
});
