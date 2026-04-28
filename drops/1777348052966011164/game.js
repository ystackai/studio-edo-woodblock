(function () {
  'use strict';

  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var W, H, dpr;
  var textLayer = document.getElementById('text-layer');

  // --- State machine ---
  var STATE_IDLE = 0;
  var STATE_DRAGGING = 1;
  var STATE_LOCKED = 2;
  var STATE_SINKING = 3;
  var STATE_SILENCE = 4;

  var state = STATE_IDLE;

  // --- Touch / pointer ---
  var touchStartY = 0;
  var touchCurrentY = 0;
  var dragNormalized = 0;
  var dragStartX = 0;
  var touchCurrentX = 0;

  // Stone proxy position
  var stoneX = 0;
  var stoneY = 0;
  var stoneRadius = 0;

  // --- Ripple ---
  var ripples = [];
  var rippleStartTime = 0;
  var RIPPLE_DURATION = 2.5;

  // --- Audio ---
  var audioCtx = null;

  // -36dB gain for sub-10dBV output compliance
  var MAX_GAIN = 0.025;

  // --- Timing ---
  var lockTime = 0;
  var sinkDuration = 0.8;
  var sinkStartTime = 0;
  var sinkStartY = 0;
  var sinkEndY = 0;

  // --- Sei Shonagon text (from Pillow Book) ---
  var seiText = '<p>「水の音は、他のどんな音よりも好きである」<br><br>I like the sound of running water more than any other sound.</p>';

  // --- Haptic ---
  function triggerHaptic() {
    if (navigator.vibrate) {
      navigator.vibrate([15, 30, 15]);
    }
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stoneRadius = Math.min(W, H) * 0.055;
  }

  window.addEventListener('resize', resize);
  resize();

  // --- Audio init on first gesture ---
  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // --- Sound: Low-thud displacement groan ---
  function playGroan() {
    if (!audioCtx) return;
    var t = audioCtx.currentTime;

    // 55Hz sine that drops to 38Hz — stone meeting resistance
    // Detuned 58Hz companion to give texture without sounding like a drum
    var osc1 = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    var filter = audioCtx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, t);
    osc1.frequency.exponentialRampToValueAtTime(38, t + 1.2);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(58, t);
    osc2.frequency.exponentialRampToValueAtTime(40, t + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, t);
    filter.frequency.exponentialRampToValueAtTime(55, t + 1.2);
    filter.Q.setValueAtTime(1.2, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(MAX_GAIN * 1.1, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(MAX_GAIN * 0.5, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.5);
    osc2.stop(t + 1.5);
  }

  // --- Sound: Soft exhale as stone settles ---
  function playExhale() {
    if (!audioCtx) return;
    var t = audioCtx.currentTime;
    var duration = 2.5;

    var bufferSize = audioCtx.sampleRate * Math.ceil(duration + 1);
    var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    var lastOut = 0;

    // Brown noise for breath-like texture
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5;
    }

    var source = audioCtx.createBufferSource();
    source.buffer = buffer;

    // Second-order lowpass for warmth without harshness
    var filter1 = audioCtx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(350, t);
    filter1.frequency.exponentialRampToValueAtTime(65, t + duration);
    filter1.Q.setValueAtTime(0.7, t);

    var filter2 = audioCtx.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(280, t);
    filter2.frequency.exponentialRampToValueAtTime(50, t + duration);

    var g = audioCtx.createGain();
    g.gain.setValueAtTime(MAX_GAIN * 0.65, t);
    g.gain.exponentialRampToValueAtTime(MAX_GAIN * 0.3, t + 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    source.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(g);
    g.connect(audioCtx.destination);

    source.start(t);
    source.stop(t + duration + 0.1);
  }

  // --- Drawing: gradient background as water ---
  function drawBackground() {
    // Warm amber to deep indigo — shallow water to dark silt
    // 400ms linear transition feel on gradient positions
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#c8956c');
    grad.addColorStop(0.15, '#b07850');
    grad.addColorStop(0.4, '#6b4a5c');
    grad.addColorStop(0.7, '#2d2040');
    grad.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // --- Drawing: dark porous silt layer (bottom 30%) ---
  function drawSilt() {
    var siltTop = H * 0.7;
    var siltGrad = ctx.createLinearGradient(0, siltTop, 0, H);
    siltGrad.addColorStop(0, 'rgba(25, 18, 30, 0)');
    siltGrad.addColorStop(0.15, 'rgba(25, 18, 30, 0.3)');
    siltGrad.addColorStop(0.5, 'rgba(20, 14, 25, 0.6)');
    siltGrad.addColorStop(1, 'rgba(8, 6, 12, 0.85)');
    ctx.fillStyle = siltGrad;
    ctx.fillRect(0, siltTop, W, H - siltTop);

    // Porous noise dots in silt
    ctx.save();
    ctx.globalAlpha = 0.08;
    for (var i = 0; i < 60; i++) {
      var sx = (Math.sin(i * 73.1 + i * i * 0.3) * 0.5 + 0.5) * W;
      var sy = siltTop + (Math.sin(i * 47.7 + i * 1.9) * 0.5 + 0.5) * (H - siltTop);
      var sr = 1 + Math.sin(i * 31.1) * 1.5;
      ctx.fillStyle = 'rgba(180, 155, 135, 0.5)';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- Drawing: stone proxy ---
  function drawStone(x, y, r, alpha) {
    if (alpha <= 0) return;
    alpha = alpha !== undefined ? alpha : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Irregular porous stone silhouette
    var grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(140, 120, 100, 0.95)');
    grad.addColorStop(0.4, 'rgba(110, 90, 75, 0.9)');
    grad.addColorStop(0.7, 'rgba(80, 65, 55, 0.7)');
    grad.addColorStop(1, 'rgba(60, 50, 45, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();

    var segments = 32;
    for (var i = 0; i <= segments; i++) {
      var angle = (i / segments) * Math.PI * 2;
      var noise = Math.sin(angle * 7 + x * 0.01) * r * 0.04 +
                  Math.cos(angle * 11 + y * 0.01) * r * 0.03;
      var px = x + Math.cos(angle) * (r + noise);
      var py = y + Math.sin(angle) * (r + noise) * 0.85;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Internal shadow
    ctx.globalAlpha = alpha * 0.35;
    var texGrad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r * 0.7);
    texGrad.addColorStop(0, 'rgba(180, 160, 140, 0.5)');
    texGrad.addColorStop(1, 'rgba(80, 65, 55, 0)');
    ctx.fillStyle = texGrad;
    ctx.fill();

    ctx.restore();
  }

  // --- Drawing: ink-bleed ripple bloom ---
  function drawRipples(elapsed) {
    if (elapsed < 0) return;
    var t = Math.min(1, elapsed / RIPPLE_DURATION);
    if (t > 1) return;

    var cx = stoneX;
    var cy = sinkStartY;
    var maxRadius = Math.max(W, H) * 0.6;

    // 5 concentric rings, staggered, ink-bleed aesthetic
    for (var ring = 0; ring < 5; ring++) {
      var ringOffset = ring * 0.14;
      var ringT = Math.max(0, t - ringOffset);
      if (ringT < 0 || ringT > 1) continue;

      var radius = maxRadius * ringT;
      var alpha = 0.22 * (1 - ringT);

      ctx.save();
      ctx.globalAlpha = alpha;

      var grad = ctx.createRadialGradient(cx, cy, radius * 0.65, cx, cy, radius);
      grad.addColorStop(0, 'rgba(180, 150, 120, 0)');
      grad.addColorStop(0.5, 'rgba(160, 130, 110, 0.7)');
      grad.addColorStop(0.8, 'rgba(120, 95, 80, 0.35)');
      grad.addColorStop(1, 'rgba(70, 55, 45, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = radius * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Central bloom: warm spot that decays
    if (t < 0.5) {
      var cAlpha = 0.18 * (1 - t / 0.5);
      ctx.save();
      ctx.globalAlpha = cAlpha;
      var cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, stoneRadius * 2.5);
      cGrad.addColorStop(0, 'rgba(200, 170, 140, 0.6)');
      cGrad.addColorStop(1, 'rgba(100, 80, 70, 0)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, stoneRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Drawing: subtle water surface line ---
  function drawSurfaceLine(y, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.12;
    ctx.strokeStyle = 'rgba(200, 180, 160, 0.6)';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    for (var x = 0; x <= W; x += 2) {
      var wave = Math.sin(x * 0.028) * 1.8 + Math.sin(x * 0.006) * 3.5;
      if (x === 0) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
    ctx.restore();
  }

  // --- Hint text during idle ---
  var hintFadeStart = performance.now() / 1000;
  function drawHint() {
    if (state !== STATE_IDLE) return;
    var elapsed = (performance.now() / 1000) - hintFadeStart;
    var a = Math.max(0, 1 - elapsed / 5);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(220, 200, 180, 0.45)';
    ctx.font = Math.max(13, W * 0.032) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('drag downward to cast a stone', W / 2, H * 0.4);
    ctx.restore();
  }

  // --- Input: pointer down ---
  function onPointerDown(e) {
    e.preventDefault();
    initAudio();

    var y = e.touches ? e.touches[0].clientY : e.clientY;
    var x = e.touches ? e.touches[0].clientX : e.clientX;

    // Reset Sei text visibility
    textLayer.classList.remove('visible');

    touchStartY = y;
    dragStartX = x;
    touchCurrentY = y;
    touchCurrentX = x;
    stoneX = x;
    stoneY = y;
    dragNormalized = 0;

    // Initiate from upper portion of viewport
    if (y < H * 0.6) {
      state = STATE_DRAGGING;
      hintFadeStart = performance.now() / 1000 + 5;
    }
  }

  // --- Input: pointer move (real-time tracking) ---
  function onPointerMove(e) {
    if (state !== STATE_DRAGGING) return;
    e.preventDefault();
    var y = e.touches ? e.touches[0].clientY : e.clientY;
    var x = e.touches ? e.touches[0].clientX : e.clientX;
    touchCurrentY = y;
    touchCurrentX = x;

    var delta = y - touchStartY;
    dragNormalized = Math.max(0, delta / H);

    if (dragNormalized >= 0.45) {
      // ---- HARD LOCK AT 45% — zero easing, instant stall ----
      dragNormalized = 0.45;
      state = STATE_LOCKED;
      lockTime = performance.now() / 1000;
      sinkStartY = touchStartY + H * 0.45;

      // Sync audio + haptic within ±15ms
      triggerHaptic();
      playGroan();

      // Begin sink into silt
      sinkEndY = H * 0.85;
      sinkStartTime = lockTime;
      rippleStartTime = lockTime;

      // Exhale follows after a brief pause (stone hitting silt)
      setTimeout(function() {
        playExhale();
      }, 300);

      state = STATE_SINKING;

    } else {
      stoneY = touchStartY + delta;
      stoneX = dragStartX;
    }
  }

  // --- Input: pointer up ---
  function onPointerUp() {
    if (state === STATE_DRAGGING) {
      state = STATE_IDLE;
      dragNormalized = 0;
      hintFadeStart = performance.now() / 1000;
    }
  }

  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  canvas.addEventListener('mousemove', function(e) {
    if (state === STATE_DRAGGING) onPointerMove(e);
  });
  canvas.addEventListener('touchend', onPointerUp);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);

  // --- Main render loop ---
  var lastFrame = performance.now() / 1000;

  function render(now) {
    now = now / 1000;
    var dt = now - lastFrame;
    lastFrame = now;

    ctx.clearRect(0, 0, W, H);

    // Background
    drawBackground();
    drawSilt();

    // Surface line
    var surfaceY = H * 0.35;
    if (state === STATE_IDLE || state === STATE_DRAGGING) {
      drawSurfaceLine(surfaceY, 1);
    } else {
      var fadeT = Math.min(1, (now - lockTime) / 1.0);
      drawSurfaceLine(surfaceY, 1 - fadeT);
    }

    // Idle hint
    drawHint();

    if (state === STATE_DRAGGING) {
      drawStone(stoneX, stoneY, stoneRadius, 1);

      // Subtle water displacement around dragging stone
      ctx.save();
      ctx.globalAlpha = Math.min(0.15, dragNormalized * 0.4);
      var dispGrad = ctx.createRadialGradient(stoneX, stoneY, stoneRadius * 0.5, stoneX, stoneY, stoneRadius * 2);
      dispGrad.addColorStop(0, 'rgba(220, 200, 170, 0.25)');
      dispGrad.addColorStop(1, 'rgba(100, 80, 65, 0)');
      ctx.fillStyle = dispGrad;
      ctx.beginPath();
      ctx.arc(stoneX, stoneY, stoneRadius * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

    } else if (state === STATE_SINKING) {
      var sinkElapsed = now - sinkStartTime;
      var sinkT = Math.min(1, sinkElapsed / sinkDuration);

      // Linear sink — no easing
      var curY = sinkStartY + (sinkEndY - sinkStartY) * sinkT;
      var alpha = 1 - sinkT * 0.3;

      drawStone(stoneX, curY, stoneRadius, alpha);

      // Ripples begin
      if (sinkT > 0) {
        drawRipples(sinkElapsed);
      }

      if (sinkT >= 1) {
        state = STATE_SILENCE;
      }

    } else if (state === STATE_SILENCE) {
      var silenceElapsed = now - lockTime;
      drawRipples(silenceElapsed);

      // After 2.5s ripple decay, show Sei Shonagon text
      if (silenceElapsed >= RIPPLE_DURATION + 0.3) {
        textLayer.innerHTML = seiText;
        textLayer.classList.add('visible');
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

})();
