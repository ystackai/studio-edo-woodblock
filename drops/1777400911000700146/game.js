/**
 * Stone Sink — Procedural Audio Engine Integration
 * Canvas-based interaction with haptic-locked audio envelope.
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const RIPPLE_DELAY_MS = 150;
const HAPTIC_DURATION_MS = 1000;
const BEZIER = { x1: 0.25, y1: 1, x2: 0.5, y2: 1 };

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let canvas, ctx;
let audioEngine;
let width, height;
let centerX, centerY;

let touching = false;
let pressStart = 0;
let stoneY = 0;
let targetStoneY = 0;
let sinkDepth = 0;
let ripples = [];
let grainIntensity = 0;
let frameTime = 0;

// ─────────────────────────────────────────────
// Cubic Bezier — matches audio engine exactly
// ─────────────────────────────────────────────
function cubicBezier(t) {
    t = Math.max(0, Math.min(1, t));
    const cx = 3 * BEZIER.x1;
    const bx = 3 * (BEZIER.x2 - BEZIER.x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * BEZIER.y1;
    const by = 3 * (BEZIER.y2 - BEZIER.y1) - cy;
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

// ─────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    audioEngine = new StoneAudioEngine();

    resize();
    window.addEventListener('resize', resize);

    // Touch events
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });

    // Mouse fallback
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    // Particulates for silt atmosphere
    initParticulates();

    requestAnimationFrame(gameLoop);
}

function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    centerX = width / 2;
    centerY = height / 2;
}

// ─────────────────────────────────────────────
// Particulates — dark silt drift
// ─────────────────────────────────────────────
let particulates = [];
const PARTICULATE_COUNT = 40;

function initParticulates() {
    particulates = [];
    for (let i = 0; i < PARTICULATE_COUNT; i++) {
        particulates.push({
            x: Math.random() * (width || window.innerWidth),
            y: Math.random() * (height || window.innerHeight),
            speed: 0.1 + Math.random() * 0.25,
            size: 0.5 + Math.random() * 1.5,
            opacity: 0.08 + Math.random() * 0.12,
            drift: (Math.random() - 0.5) * 0.3
        });
    }
}

// ─────────────────────────────────────────────
// Input Handlers
// ─────────────────────────────────────────────
function onTouchStart(e) {
    e.preventDefault();
    startInteraction();
}

function onTouchMove(e) {
    e.preventDefault();
}

function onTouchEnd(e) {
    e.preventDefault();
    endInteraction();
}

function onMouseDown(e) {
    startInteraction();
}

function onMouseUp(e) {
    endInteraction();
}

function startInteraction() {
    if (touching) return;
    touching = true;
    pressStart = performance.now();
    targetStoneY = 18;

    // Initialize audio on first gesture (browser autoplay policy)
    audioEngine.init();

    // Play thud immediately
    audioEngine.playThud();

    // Trigger haptics if available
    if (navigator.vibrate) {
        navigator.vibrate([80, 30, 60, 20, 40]);
    }

    // Ripple scheduled at exactly 150ms
    scheduleRipple();

    updateUI('SINKING', true);
}

function endInteraction() {
    if (!touching) return;
    touching = false;

    // Play release click
    audioEngine.playRelease();

    targetStoneY = 0;

    updateUI('RELEASED', false);
}

function scheduleRipple() {
    setTimeout(() => {
        ripples.push({
            x: centerX,
            y: centerY + stoneY,
            birth: performance.now(),
            maxRadius: Math.max(width, height) * 0.48,
            speed: 120
        });
    }, RIPPLE_DELAY_MS);
}

// ─────────────────────────────────────────────
// UI Updates
// ─────────────────────────────────────────────
function updateUI(label, active) {
    const stateLabel = document.getElementById('state-label');
    const syncInd = document.getElementById('sync-indicator');
    if (stateLabel) {
        stateLabel.textContent = label;
        stateLabel.classList.toggle('active', active);
    }
    if (syncInd) {
        if (!audioEngine || audioEngine.state === 'idle') {
            syncInd.className = 'sync-ok';
            syncInd.textContent = 'SYNC: IDLE';
        } else {
            const elapsed = performance.now() - pressStart;
            const hapticAmp = cubicBezier(Math.min(1, elapsed / HAPTIC_DURATION_MS));
            const ok = audioEngine.checkSync(hapticAmp, elapsed);
            syncInd.className = ok ? 'sync-ok' : 'sync-warn';
            syncInd.textContent = ok ? 'SYNC: OK' : 'SYNC: WARN';
        }
    }
}

// ─────────────────────────────────────────────
// Rendering
// ─────────────────────────────────────────────
function drawBackground() {
    // Dark matte silt
    ctx.fillStyle = '#0c0e18';
    ctx.fillRect(0, 0, width, height);
}

function drawParticulates(now) {
    for (const p of particulates) {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -5) {
            p.y = height + 5;
            p.x = Math.random() * width;
        }
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        const driftMod = (1 + grainIntensity * 0.5);
        ctx.fillStyle = `rgba(60,64,88,${p.opacity * driftMod})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawStone(now) {
    const elapsed = Math.max(0, now - pressStart);
    const t = Math.min(1, elapsed / HAPTIC_DURATION_MS);
    const amp = cubicBezier(t);

    // Smooth stoneY toward target
    stoneY += (targetStoneY - stoneY) * 0.15;
    sinkDepth = stoneY;

    const stoneRadius = 52;
    const drawX = centerX;
    const drawY = centerY + stoneY;

    // Shadow / silt displacement beneath stone
    ctx.fillStyle = `rgba(8,10,18,${0.3 + amp * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(drawX, drawY + stoneRadius + 8 + sinkDepth * 0.3,
                stoneRadius + sinkDepth * 0.5,
                stoneRadius * 0.25 + sinkDepth * 0.15,
                0, 0, Math.PI * 2);
    ctx.fill();

    // Stone body — rough-hewn procedural
    const grad = ctx.createRadialGradient(
        drawX - 10, drawY - 12, 2,
        drawX, drawY, stoneRadius
    );
    grad.addColorStop(0, '#5a5d70');
    grad.addColorStop(0.4, '#3a3d50');
    grad.addColorStop(0.8, '#2a2d40');
    grad.addColorStop(1, '#1e2035');

    ctx.fillStyle = grad;
    ctx.beginPath();

    // Hard-edged circle — no blur, no glow
    ctx.arc(drawX, drawY, stoneRadius, 0, Math.PI * 2);
    ctx.fill();

    // Procedural stone texture — sharp grain overlay
    ctx.save();
    ctx.beginPath();
    ctx.arc(drawX, drawY, stoneRadius, 0, Math.PI * 2);
    ctx.clip();

    const texSize = 2;
    const range = Math.ceil(stoneRadius * 2.2 / texSize) + 2;
    for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
            const px = drawX + dx * texSize;
            const py = drawY + dy * texSize;
            if ((px - drawX) ** 2 + (py - drawY) ** 2 > stoneRadius ** 2) continue;

            const noise = pseudoNoise(dx * 7.13, dy * 13.37);
            const intensity = (noise * (1 - noise) * 4) * 0.5;
            if (intensity > 0.08) {
                ctx.fillStyle = `rgba(${intensity > 0.2 ? 90 : 40},${intensity > 0.2 ? 92 : 42},${intensity > 0.2 ? 115 : 58},${(intensity * 0.6 + grainIntensity * 0.15).toFixed(3)})`;
                ctx.fillRect(px, py, texSize, texSize);
            }
        }
    }
    ctx.restore();

    // Rim — sharp, displaced, never blurry
    ctx.strokeStyle = `rgba(70,74,100,${0.4 + amp * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(drawX, drawY, stoneRadius, 0, Math.PI * 2);
    ctx.stroke();
}

// Fast pseudo-noise for procedural textures
function pseudoNoise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

function drawRipples(now) {
    for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = now - r.birth;

        if (age < 0) continue;

        const radius = r.speed * (age / 1000);
        const alpha = Math.max(0, 1 - age / 3000);

        if (alpha <= 0) {
            ripples.splice(i, 1);
            continue;
        }

        // Hard-stop edges — no blur
        const gradient = ctx.createRadialGradient(r.x, r.y, radius * 0.85, r.x, r.y, radius);
        gradient.addColorStop(0, `rgba(30,34,65,0)`);
        gradient.addColorStop(0.7, `rgba(40,45,75,${(alpha * 0.25).toFixed(3)})`);
        gradient.addColorStop(0.95, `rgba(20,23,45,${(alpha * 0.4).toFixed(3)})`);
        gradient.addColorStop(1, `rgba(12,14,24,0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Secondary ring
        const ringAlpha = alpha * 0.15;
        ctx.strokeStyle = `rgba(50,55,85,${ringAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius * 0.92, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawGrainOverlay(now) {
    if (grainIntensity < 0.01) return;

    const elapsed = touching ? Math.max(0, now - pressStart) : 0;
    const t = Math.min(1, elapsed / HAPTIC_DURATION_MS);
    grainIntensity = cubicBezier(t) * 0.55;

    if (grainIntensity < 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'overlay';

    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = 64;
    grainCanvas.height = 64;
    const gCtx = grainCanvas.getContext('2d');
    const imgData = gCtx.createImageData(64, 64);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.random() * 255;
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = grainIntensity * 50;
    }
    gCtx.putImageData(imgData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < height; y += 64) {
        for (let x = 0; x < width; x += 64) {
            ctx.drawImage(grainCanvas, x, y);
        }
    }
    ctx.restore();
}

// ─────────────────────────────────────────────
// Game Loop
// ─────────────────────────────────────────────
let lastTime = 0;

function gameLoop(now) {
    const dt = now - lastTime;
    lastTime = now;
    frameTime = dt;

    // Performance check — if dt > 16ms, flag it
    if (dt > 16 && touching) {
        // Would warn if haptic sync could be affected
    }

    drawBackground();
    drawParticulates(now);
    drawRipples(now);
    drawStone(now);
    drawGrainOverlay(now);

    // Update UI sync check every few frames
    if (touching && Math.floor(now / 100) % 3 === 0) {
        const elapsed = now - pressStart;
        const hapticAmp = cubicBezier(Math.min(1, elapsed / HAPTIC_DURATION_MS));
        updateSyncUI(hapticAmp, elapsed);
    }

    // Scale hold audio amplitude
    if (touching && audioEngine.state === 'holding') {
        const elapsed = now - pressStart;
        const amp = cubicBezier(Math.min(1, elapsed / HAPTIC_DURATION_MS));
        audioEngine.playHold(amp);
    }

    requestAnimationFrame(gameLoop);
}

function updateSyncUI(hapticAmp, elapsed) {
    const syncInd = document.getElementById('sync-indicator');
    if (!syncInd) return;
    const ok = audioEngine.checkSync(hapticAmp, elapsed);
    syncInd.className = ok ? 'sync-ok' : 'sync-warn';
    syncInd.textContent = ok ? 'SYNC: OK' : 'SYNC: WARN';
}

// ─────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', init);
