(function () {
  'use strict';

  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var W, H, dpr;

  // --- State machine ---
  var STATE_IDLE = 0;
  var STATE_DRAGGING = 1;
  var STATE_LOCKED = 2;    // catch at 45%
  var STATE_SINKING = 3;    // stone sinks
  var STATE_SILENCE = 4;    // 2.5s ripple decay, then rest

  var state = STATE_IDLE;

  // --- Touch / pointer ---
  var touchStartY = 0;
  var touchCurrentY = 0;
  var dragNormalized = 0;   // 0..1 where 1 = full screen height
  var stoneX = 0;
  var stoneY = 0;
  var stoneRadius = 0;

  // --- Ripple ---
  var ripples = [];
  var rippleStartTime = 0;
  var RIPPLE_DURATION = 2.5; // seconds

  // --- Audio ---
  var audioCtx = null;
  var groanGain = null;
  var exhaleGain = null;
  var groanOsc = null;
  var exhaleNodes = [];

  // --- Timing ---
  var lockTime = 0;
  var sinkDuration = 0.8;   // seconds for stone to sink
  var sinkStartTime = 0;
  var sinkStartY = 0;
  var sinkEndY = 0;

  // --- Haptic ---
  function triggerHaptic() {
    if (navigator.vibrate) {
      navigator.vibrate(15); // sharp short pulse
    }
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stoneRadius = Math.min(W, H) * 0.06;
  }

  window.addEventListener('resize', resize);
  resize();

  // --- Audio init (on first user gesture) ---
  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Max -35dB = gain of ~0.0316
  // We use -36dB = 0.0251 to keep a safety margin
  var MAX_GAIN = 0.025;

  function playGroan() {
    if (!audioCtx) return;
    // Low-frequency groan: 60Hz triangle with slight detune for texture
    var osc = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    var filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(38, audioCtx.currentTime + 1.5);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(58, audioCtx.currentTime);
    osc2.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 1.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 1.5);

    gain.gain.setValueAtTime(MAX_GAIN, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc2.start();
    osc.stop(audioCtx.currentTime + 1.6);
    osc2.stop(audioCtx.currentTime + 1.6);

    groanGain = gain;
    groanOsc = osc;
  }

  function playExhale() {
    if (!audioCtx) return;
    // Breath-like noise using pink/brown noise through a lowpass
    var bufferSize = audioCtx.sampleRate * 3;
    var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    var lastOut = 0;
    // Brown noise integration
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5;
    }

    var source = audioCtx.createBufferSource();
    source.buffer = buffer;

    var filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 2.5);

    var g = audioCtx.createGain();
    g.gain.setValueAtTime(MAX_GAIN * 0.7, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

    source.connect(filter);
    filter.connect(g);
    g.connect(audioCtx.destination);

    source.start();
    source.stop(audioCtx.currentTime + 2.6);

    exhaleGain = g;
    exhaleNodes.push({ source: source, gain: g });
  }

  // --- Drawing helpers ---

  function drawBackground() {
    // Warm gradient: shallow amber -> deep indigo
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#c8956c');   // warm amber
    grad.addColorStop(0.15, '#b07850');
    grad.addColorStop(0.4, '#6b4a5c');
    grad.addColorStop(0.7, '#2d2040');
    grad.addColorStop(1, '#0f0f1a');   // deep indigo/near-black
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStone(x, y, r, alpha) {
    alpha = alpha !== undefined ? alpha : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Soft porous stone silhouette
    var grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(140,120,100,0.95)');
    grad.addColorStop(0.4, 'rgba(110,90,75,0.9)');
    grad.addColorStop(0.7, 'rgba(80,65,55,0.7)');
    grad.addColorStop(1, 'rgba(60,50,45,0.0)'); // soft edge, no hard boundary

    ctx.fillStyle = grad;
    ctx.beginPath();

    // Slightly irregular circle (porous feel)
    var segments = 32;
    for (var i = 0; i <= segments; i++) {
      var angle = (i / segments) * Math.PI * 2;
      // Irregularity via small noise on radius
      var noise = Math.sin(angle * 7 + x * 0.01) * r * 0.04 +
                  Math.cos(angle * 11 + y * 0.01) * r * 0.03;
      var px = x + Math.cos(angle) * (r + noise);
      var py = y + Math.sin(angle) * (r + noise) * 0.85; // slightly flattened vertically
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Subtle internal texture
    ctx.globalAlpha = alpha * 0.3;
    var texGrad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r * 0.7);
    texGrad.addColorStop(0, 'rgba(180,160,140,0.4)');
    texGrad.addColorStop(1, 'rgba(80,65,55,0)');
    ctx.fillStyle = texGrad;
    ctx.fill();

    ctx.restore();
  }

  function drawRipples(elapsed) {
    // elapsed is seconds since ripple started
    if (elapsed < 0) return;
    var t = elapsed / RIPPLE_DURATION; // 0..1 over 2.5s
    if (t > 1) return;

    // Ink-bleed ripple: alpha-decaying concentric rings
    var cx = stoneX;
    var cy = sinkStartY; // ripple originates at surface level

    for (var ring = 0; ring < 5; ring++) {
      var ringOffset = ring * 0.12;
      var ringT = Math.max(0, t - ringOffset);
      if (ringT < 0 || ringT > 1) continue;

      // Radius expands linearly
      var maxRadius = Math.max(W, H) * 0.8;
      var radius = maxRadius * ringT;

      // Alpha: starts at 0.25, bleeds to 0
      var alpha = 0.25 * (1 - ringT);

      ctx.save();
      ctx.globalAlpha = alpha;

      // Soft ink-bleed stroke
      var grad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius);
      grad.addColorStop(0, 'rgba(180,150,120,0)');
      grad.addColorStop(0.6, 'rgba(160,130,110,0.6)');
      grad.addColorStop(0.85, 'rgba(120,95,80,0.3)');
      grad.addColorStop(1, 'rgba(80,65,55,0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = radius * 0.12; // thick soft stroke for ink bleed
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // Central bloom soft spot
    if (t < 0.6) {
      var centerAlpha = 0.15 * (1 - t / 0.6);
      ctx.save();
      ctx.globalAlpha = centerAlpha;
      var cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, stoneRadius * 3);
      cGrad.addColorStop(0, 'rgba(200,170,140,0.5)');
      cGrad.addColorStop(1, 'rgba(100,80,70,0)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, stoneRadius * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Surface tension line (water surface marker) ---
  function drawSurfaceLine(y, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.15;
    ctx.strokeStyle = 'rgba(200,180,160,0.5)';
    ctx.lineWidth = 1.5;

    // Gentle sine wave line
    ctx.beginPath();
    for (var x = 0; x <= W; x += 2) {
      var wave = Math.sin(x * 0.03) * 2 + Math.sin(x * 0.007) * 4;
      if (x === 0) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
    ctx.restore();
  }

  // --- Hint text ---
  var hintAlpha = 1;
  function drawHint(elapsed) {
    if (state !== STATE_IDLE) return;
    // Fade hint over 4 seconds
    var a = Math.max(0, 1 - elapsed / 4);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(220,200,180,0.5)';
    ctx.font = Math.max(14, W * 0.035) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('drag downward to cast a stone', W / 2, H * 0.42);
    ctx.restore();
  }

  // --- Input handling ---
  var dragStartX = 0;
  var inTopThird = false;

  function onPointerDown(e) {
    e.preventDefault();
    initAudio();

    var y = (e.touches ? e.touches[0].clientY : e.clientY);
    var x = (e.touches ? e.touches[0].clientX : e.clientX);

    touchStartY = y;
    dragStartX = x;
    touchCurrentY = y;
    stoneX = x;
    stoneY = y;

    // Must start in top third
    inTopThird = y < H * 0.35;
    if (inTopThird) {
      state = STATE_DRAGGING;
      hintAlpha = 0;
    }
  }

  var touchCurrentX = 0;

  function onPointerMove2(e) {
    if (state !== STATE_DRAGGING) return;
    e.preventDefault();
    touchCurrentY = (e.touches ? e.touches[0].clientY : e.clientY);
    touchCurrentX = (e.touches ? e.touches[0].clientX : e.clientX);

    var delta = touchCurrentY - touchStartY;
    dragNormalized = Math.max(0, delta / H);

    if (dragNormalized >= 0.45) {
      // HARD LOCK — zero easing, instantaneous
      state = STATE_LOCKED;
      dragNormalized = 0.45;
      lockTime = performance.now() / 1000;
      sinkStartY = touchStartY + H * 0.45;

      triggerHaptic();
      playGroan();

      sinkEndY = H * 0.9;
      sinkStartTime = performance.now() / 1000;

      rippleStartTime = lockTime;
      playExhale();

      state = STATE_SINKING;
    } else {
      stoneY = touchStartY + delta;
      stoneX = dragStartX;
    }
  }

  function onPointerUp(e) {
    if (state === STATE_DRAGGING) {
      state = STATE_IDLE;
      dragNormalized = 0;
    }
  }

  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('mousedown', onPointerDown);

  canvas.addEventListener('touchmove', onPointerMove2, { passive: false });
  canvas.addEventListener('mousemove', function (e) {
    if (state === STATE_DRAGGING) {
      onPointerMove2(e);
    }
  });

  canvas.addEventListener('touchend', onPointerUp);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);

  // --- Animation loop ---
  var startTime = performance.now() / 1000;
  var lastFrame = startTime;

  function render(now) {
    now = now / 1000;
    var elapsed = now - startTime;
    var dt = now - lastFrame;
    lastFrame = now;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    drawBackground();

    // Surface line (fades as stone sinks)
    var surfaceY = H * 0.35;
    if (state === STATE_IDLE || state === STATE_DRAGGING) {
      drawSurfaceLine(surfaceY, 1);
    } else {
      // Surface line fades during sinking and silence
      var fadeT = Math.min(1, (now - lockTime) / 1.2);
      drawSurfaceLine(surfaceY, 1 - fadeT);
    }

    // Hint
    if (state === STATE_IDLE) {
      drawHint(elapsed);
    }

    if (state === STATE_DRAGGING) {
      // Draw stone at current touch position
      drawStone(stoneX, stoneY, stoneRadius, 1);

      // Subtle water displacement effect around stone
      ctx.save();
      ctx.globalAlpha = 0.1;
      var dispGrad = ctx.createRadialGradient(stoneX, stoneY, stoneRadius * 0.5, stoneX, stoneY, stoneRadius * 2.5);
      dispGrad.addColorStop(0, 'rgba(220,200,170,0.3)');
      dispGrad.addColorStop(1, 'rgba(100,80,65,0)');
      ctx.fillStyle = dispGrad;
      ctx.beginPath();
      ctx.arc(stoneX, stoneY, stoneRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

    } else if (state === STATE_SINKING) {
      // Stone sinking linearly
      var sinkElapsed = now - sinkStartTime;
      var sinkT = Math.min(1, sinkElapsed / sinkDuration);

      // Linear interpolation — no easing
      var currentStoneY = sinkStartY + (sinkEndY - sinkStartY) * sinkT;
      var alpha = 1 - sinkT * 0.4; // slight fade as it sinks

      drawStone(stoneX, currentStoneY, stoneRadius, alpha);

      // Start ripples as stone passes surface
      if (sinkT > 0) {
        var rippleElapsed = sinkElapsed;
        drawRipples(rippleElapsed);
      }

      // Transition to silence phase
      if (sinkT >= 1) {
        state = STATE_SILENCE;
      }

    } else if (state === STATE_SILENCE) {
      // Post-sink: only ripples remain, fading over 2.5s
      var silenceElapsed = now - lockTime;
      drawRipples(silenceElapsed);

      // After 2.5s, pure stillness
      if (silenceElapsed >= RIPPLE_DURATION + 0.3) {
        // State is silence — draw nothing extra, just the quiet background
        // Background is already drawn above
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

})();
