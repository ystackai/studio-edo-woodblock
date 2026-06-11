/*
 * Stone & Breath — Core Interaction Loop
 * Hard stall at exactly 45%. No interpolation. No ease. No transparency.
 * Ripple is a solid ink annulus. Background is Ukiyo-e void.
 */

var canvas = document.getElementById('water');
var ctx = canvas.getContext('2d');
var infoEl = document.getElementById('info');

/* ---- Constants ---- */
var STALL_PCT = 0.45;
var DECAY_MS = 2500;
var SVG_VOID = '#070a12';
var STONE_FG = '#1b2030';
var STONE_STR = '#10141e';
var INK_OUTER = '#1e2538';
var INK_MID = '#141a28';
var INK_INNER = '#0b0e18';

/* ---- State ---- */
var state = 'idle';
var dragOrigin = null;
var dragPointer = null;
var impactPt = null;
var dragDist = 0;
var maxDist = 0;
var stallDist = 0;
var decayTime = 0;
var ripples = [];
var audioCtx = null;
var hapticTriggered = false;

/* ---- Screen size & resize ---- */
var W = window.innerWidth;
var H = window.innerHeight;

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    maxDist = Math.max(W, H) * 0.5;
    stallDist = maxDist * STALL_PCT;
}
window.addEventListener('resize', resize);
resize();

/* ---- Position helpers ---- */
function pointerPos(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function distance(a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/* ---- Audio synthesis ---- */
function ensureAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playThud() {
    if (!audioCtx) return;
    var t = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.setValueAtTime(120, t + 0.04);
    osc.frequency.setValueAtTime(90, t + 0.08);
    gain.gain.setValueAtTime(0.55, t);
    gain.gain.setValueAtTime(0.4, t + 0.02);
    gain.gain.setValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
}

function playExhale() {
    if (!audioCtx) return;
    var t = audioCtx.currentTime;
    var dur = 2.5;
    var sr = audioCtx.sampleRate;
    var bufLen = sr * dur;
    var buf = audioCtx.createBuffer(1, bufLen, sr);
    var ch = buf.getChannelData(0);
    for (var i = 0; i < bufLen; i++) {
        ch[i] = (Math.random() * 2 - 1);
    }
    var src = audioCtx.createBufferSource();
    src.buffer = buf;

    var lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(600, t);
    lp.frequency.setValueAtTime(300, t + 1.0);
    lp.frequency.setValueAtTime(150, t + dur);

    var gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.setValueAtTime(0.12, t + 0.15);
    gain.gain.setValueAtTime(0.001, t + dur);

    src.connect(lp);
    lp.connect(gain);
    gain.connect(audioCtx.destination);
    src.start(t);
    src.stop(t + dur);
}

/* ---- Haptic ---- */
function triggerBite() {
    if (navigator.vibrate) {
        navigator.vibrate([25, 20, 35]);
    }
}

/* ---- Ukiyo-e Void Background ---- */
function drawVoid() {
    ctx.fillStyle = SVG_VOID;
    ctx.fillRect(0, 0, W, H);

    /* Faint horizontal strata — woodblock grain */
    for (var y = 30; y < H; y += 55) {
        var alpha = 0.03 + (Math.sin(y * 0.01) * 0.015);
        ctx.fillStyle = 'rgba(25,30,45,' + alpha + ')';
        ctx.fillRect(0, y, W, 1);
    }
}

/* ---- Stone Rendering ---- */
function drawStone(x, y, radius) {
    /* Outer stone body */
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = STONE_FG;
    ctx.fill();

    /* Inner shadow — flat, solid, no gradient */
    ctx.beginPath();
    ctx.arc(x - radius * 0.15, y - radius * 0.15, radius * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = STONE_STR;
    ctx.fill();
}

/* ---- Solid Ink Ripple Rendering ---- */
function drawRipples() {
    for (var i = 0; i < ripples.length; i++) {
        var r = ripples[i];

        /* Outer ring — solid fill, no alpha */
        ctx.beginPath();
        ctx.arc(r.cx, r.cy, r.outerR, 0, Math.PI * 2);
        ctx.fillStyle = r.outerCol;
        ctx.fill();

        /* Inner ring — solid fill, no alpha; creates the annulus */
        ctx.beginPath();
        ctx.arc(r.cx, r.cy, r.innerR, 0, Math.PI * 2);
        ctx.fillStyle = r.innerCol;
        ctx.fill();
    }
}

/* ---- Ripple Spawning ---- */
function spawnRipple(x, y) {
    var maxR = Math.min(W, H) * 0.42;
    ripples.push({
        cx: x,
        cy: y,
        outerR: 12,
        innerR: 6,
        maxOuter: maxR,
        maxInner: maxR * 0.6,
        outerCol: INK_OUTER,
        innerCol: INK_INNER,
        born: performance.now()
    });
}

/* ---- Ripple Update — Linear expansion, no interpolation ---- */
function updateRipples(now) {
    var surviving = [];
    for (var i = 0; i < ripples.length; i++) {
        var r = ripples[i];
        var elapsed = now - r.born;
        var t = Math.min(elapsed / DECAY_MS, 1);

        /* Linear — no curve */
        r.outerR = 12 + (r.maxOuter - 12) * t;
        r.innerR = 6 + (r.maxInner - 6) * t;

        /* Color shift via discrete steps — NO alpha */
        if (t < 0.33) {
            r.outerCol = INK_OUTER;
            r.innerCol = INK_INNER;
        } else if (t < 0.66) {
            r.outerCol = INK_MID;
            r.innerCol = '#090c14';
        } else {
            r.outerCol = '#0d1019';
            r.innerCol = '#070a10';
        }

        if (elapsed < DECAY_MS + 50) {
            surviving.push(r);
        }
    }
    ripples = surviving;
}

/* ---- Stall Detection — Zero interpolation ---- */
function triggerStall(pointer) {
    impactPt = {
        x: dragOrigin.x + (pointer.x - dragOrigin.x) * (stallDist / dragDist),
        y: dragOrigin.y + (pointer.y - dragOrigin.y) * (stallDist / dragDist)
    };
    state = 'decaying';
    hapticTriggered = false;

    playThud();
    triggerBite();
    spawnRipple(impactPt.x, impactPt.y);

    /* Exhale 120ms after thud — sequential, no overlap */
    setTimeout(playExhale, 120);

    dragOrigin = null;
    dragPointer = null;
    dragDist = 0;
    decayTime = performance.now();
}

/* ---- Input Handlers ---- */
function onDown(e) {
    e.preventDefault();
    ensureAudio();
    if (state === 'decaying') return;
    if (state === 'stalled') {
        /* Reset for next interaction */
        ripples = [];
        impactPt = null;
        state = 'idle';
        infoEl.style.color = '#3a4050';
    }

    state = 'dragging';
    dragOrigin = pointerPos(e);
    dragPointer = dragOrigin;
    dragDist = 0;
    ripples = [];
}

function onMove(e) {
    e.preventDefault();
    if (state !== 'dragging') return;

    var ptr = pointerPos(e);
    dragPointer = ptr;
    dragDist = distance(dragOrigin, ptr);

    if (dragDist >= stallDist) {
        triggerStall(ptr);
    }
}

function onUp(e) {
    e.preventDefault();
    if (state !== 'dragging') return;
    state = 'idle';
    dragOrigin = null;
    dragPointer = null;
    dragDist = 0;
}

/* Touch */
canvas.addEventListener('touchstart', onDown, { passive: false });
canvas.addEventListener('touchmove', onMove, { passive: false });
canvas.addEventListener('touchend', onUp, { passive: false });
canvas.addEventListener('touchcancel', onUp, { passive: false });

/* Mouse — for desktop testing */
canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseup', onUp);
canvas.addEventListener('mouseleave', onUp);

/* ---- Main Render Loop ---- */
function frame() {
    var now = performance.now();

    drawVoid();

    if (state === 'dragging' && dragPointer) {
        var stoneSize = 10 + (dragDist / stallDist) * 16;
        drawStone(dragPointer.x, dragPointer.y, stoneSize);
    }

    if (state === 'stalled' || state === 'decaying') {
        if (impactPt) {
            drawStone(impactPt.x, impactPt.y, 26);
        }

        if (state === 'decaying') {
            updateRipples(now);
            drawRipples();

            var elapsed = now - decayTime;
            if (elapsed >= DECAY_MS) {
                state = 'idle';
                ripples = [];
                impactPt = null;
                infoEl.textContent = 'Drag to drop the stone';
                infoEl.style.color = '#3a4050';
            }
        }
    }

    requestAnimationFrame(frame);
}

/* Kick off */
requestAnimationFrame(frame);
