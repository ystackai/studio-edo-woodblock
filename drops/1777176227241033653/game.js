(function () {
  "use strict";

  /* --------------- constants --------------- */
  var SNAP_THRESHOLD    = 0.65;
  var BLOOM_DURATION    = 250;   // ms
  var RESET_DELAY       = 1200;  // ms
  var BASS_DELAY        = 40;    // ms
  var BASS_FREQ         = 75;
  var HUM_FREQ          = 55;
  var SCROLL_DAMPEN     = 0.7;
  var HUM_DECAY_RATE    = 0.015;
  var MAX_QUEUE         = 3;

  /* --------------- state machine --------------- */
  var PHASE = {
    IDLE:      0,
    INITIATION: 1,
    HOLD:      2,
    SNAP:      3,
    YIELD:     4,
    RESET:     5
  };

  var state = {
    phase:        PHASE.IDLE,
    dragStartY:   0,
    dragCurrentY: 0,
    displacement:   0,
    velocity:       0,
    lastY:          0,
    lastTime:       0,
    blobX:        0,
    blobY:        0,
    blobRadius:     0,
    blobOpacity:    0,
    edgeSoftness:   0,
    humVolume:      0,
    swiped:         false,
    queued:         [],
    yieldStart:     0,
    resetStart:     0,
    bassPlayed:     false,
    scrollDampened: false
  };

  /* --------------- canvas setup --------------- */
  var canvas = document.getElementById("c");
  var ctx    = canvas.getContext("2d");
  var W, H;

  function resize() {
    W = canvas.width  = window.innerWidth  * devicePixelRatio;
    H = canvas.height = window.innerHeight * devicePixelRatio;
    ctx.scale(1, 1);
  }
  window.addEventListener("resize", resize);
  resize();

  /* --------------- audio engine --------------- */
  var audioCtx   = null;
  var humOsc     = null;
  var humGain    = null;
  var bassOsc    = null;
  var bassGain   = null;
  var bassEnv    = null;

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      humOsc  = audioCtx.createOscillator();
      humGain = audioCtx.createGain();
      humOsc.type = "sine";
      humOsc.frequency.value = HUM_FREQ;
      humGain.gain.value = 0;
      humOsc.connect(humGain);
      humGain.connect(audioCtx.destination);
      humOsc.start();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function setHumVol(v) {
    if (humGain) {
      humGain.gain.setTargetAtTime(Math.min(v, 0.18), audioCtx.currentTime, 0.04);
    }
  }

  function playBass() {
    if (!audioCtx) return;
    bassOsc  = audioCtx.createOscillator();
    bassGain = audioCtx.createGain();
    bassEnv  = audioCtx.createGain();

    bassOsc.type = "sine";
    bassOsc.frequency.value = BASS_FREQ;

    bassGain.gain.setValueAtTime(0.6, audioCtx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    bassEnv.gain.setValueAtTime(1, audioCtx.currentTime);
    bassEnv.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    bassOsc.connect(bassGain);
    bassGain.connect(bassEnv);
    bassEnv.connect(audioCtx.destination);
    bassOsc.start();
    bassOsc.stop(audioCtx.currentTime + 0.7);
  }

  /* --------------- haptics --------------- */
  function pulseHaptic() {
    if (navigator.vibrate) {
      try { navigator.vibrate([30, 40, 30]); } catch (_) {}
    }
  }

  /* --------------- input handling --------------- */
  var pointers = new Map();

  function getPointerY(e) {
    if (e.touches && e.touches[0]) return e.touches[0].clientY;
    return e.clientY;
  }

  canvas.addEventListener("touchstart", onDown, { passive: false });
  canvas.addEventListener("mousedown", onDown);

  function onDown(e) {
    e.preventDefault();
    ensureAudio();

    var y = getPointerY(e);
    var id = e.changedTouches ? e.changedTouches[0].identifier : "mouse";

    if (state.phase === PHASE.IDLE) {
      state.phase        = PHASE.INITIATION;
      state.dragStartY   = y;
      state.dragCurrentY = y;
      state.lastY        = y;
      state.lastTime     = performance.now();
      state.displacement  = 0;
      state.velocity      = 0;
      state.blobX        = window.innerWidth / 2;
      state.blobY        = y;
      state.blobRadius   = 0;
      state.blobOpacity  = 0;
      state.edgeSoftness = 0;
      state.humVolume    = 0.12;
      state.swiped       = false;
      state.bassPlayed   = false;
      setHumVol(0.12);
    }
    pointers.set(id, y);
  }

  canvas.addEventListener("touchmove", onMove, { passive: false });
  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("touchend", onUp);
  canvas.addEventListener("mouseup", onUp);

  function onMove(e) {
    e.preventDefault();
    var y = getPointerY(e);
    var id = e.changedTouches ? e.changedTouches[0].identifier : "mouse";

    if (state.phase === PHASE.INITIATION || state.phase === PHASE.HOLD) {
      var now = performance.now();
      var dt  = Math.max(1, now - state.lastTime);
      var dy  = state.lastY - y;

      state.velocity = Math.abs(dy / dt * 16);
      state.displacement = Math.abs(y - state.dragStartY);
      state.dragCurrentY = y;
      state.lastY = y;
      state.lastTime = now;
      state.blobY = y;
      state.blobX = window.innerWidth / 2;

      var progress = state.displacement / (H / devicePixelRatio);

      if (progress >= 0.1) {
        state.phase = PHASE.HOLD;
      }

      setHumVol(0.12 * (1 - progress * 0.7));
    }
    pointers.set(id, y);
  }

  function onUp(e) {
    var id = e.changedTouches ? e.changedTouches[0].identifier : "mouse";
    pointers.delete(id);
  }

  /* --------------- scroll dampening --------------- */
  var scrollDampTimeout = null;

  function dampenScroll() {
    if (state.scrollDampened) return;
    state.scrollDampened = true;
    document.body.style.overflow = "hidden";
    if (scrollDampTimeout) clearTimeout(scrollDampTimeout);
    scrollDampTimeout = setTimeout(function () {
      document.body.style.overflow = "";
      state.scrollDampened = false;
    }, RESET_DELAY);
  }

  /* --------------- snap / yield logic --------------- */
  function triggerSnap() {
    state.phase      = PHASE.SNAP;
    state.swiped     = true;
    state.yieldStart = performance.now();
    state.blobOpacity = 0;
    state.blobRadius  = 30 * devicePixelRatio;
    state.edgeSoftness = 0;

    setTimeout(function () {
      if (state.phase >= PHASE.SNAP) {
        playBass();
        state.bassPlayed = true;
      }
    }, BASS_DELAY);

    setTimeout(function () {
      pulseHaptic();
    }, BASS_DELAY);

    dampenScroll();
  }

  /* --------------- drawing --------------- */
  function drawBaseGradient() {
    var grad = ctx.createRadialGradient(
      state.blobX, state.blobY, 0,
      state.blobX, state.blobY, Math.max(W, H) * 0.7
    );

    var soft = state.edgeSoftness;

    if (state.phase === PHASE.IDLE) {
      grad.addColorStop(0,    "rgba(18, 12, 40, 1)");
      grad.addColorStop(0.4,  "rgba(8, 6, 20, 1)");
      grad.addColorStop(1,    "rgba(0, 0, 0, 1)");
    } else {
      grad.addColorStop(0,    "rgba(25, 15, 50, " + (0.95 - soft * 0.15) + ")");
      grad.addColorStop(0.4,  "rgba(10, 7, 25, " + (0.9 - soft * 0.2) + ")");
      grad.addColorStop(1,    "rgba(0, 0, 0, " + (0.85 - soft * 0.15) + ")");
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawBloom(t) {
    if (state.blobOpacity <= 0.01) return;

    var grad = ctx.createRadialGradient(
      state.blobX, state.blobY, 0,
      state.blobX, state.blobY, state.blobRadius
    );

    grad.addColorStop(0,    "rgba(255, 170, 60, " + state.blobOpacity + ")");
    grad.addColorStop(0.3,  "rgba(240, 120, 80, " + (state.blobOpacity * 0.7) + ")");
    grad.addColorStop(0.7,  "rgba(200, 80, 100, " + (state.blobOpacity * 0.3) + ")");
    grad.addColorStop(1,    "rgba(50, 20, 40, 0)");

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(state.blobX, state.blobY, state.blobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    var glow = ctx.createRadialGradient(
      state.blobX, state.blobY, state.blobRadius * 0.2,
      state.blobX, state.blobY, state.blobRadius * 1.8
    );
    glow.addColorStop(0, "rgba(255, 200, 100, " + (state.blobOpacity * 0.25) + ")");
    glow.addColorStop(1, "rgba(255, 100, 80, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(state.blobX, state.blobY, state.blobRadius * 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDragLine() {
    if (state.phase !== PHASE.INITIATION && state.phase !== PHASE.HOLD) return;
    if (Math.abs(state.dragCurrentY - state.dragStartY) < 2) return;

    var grad = ctx.createLinearGradient(
      state.blobX, state.dragStartY,
      state.blobX, state.dragCurrentY
    );
    var alpha = Math.min(0.3, state.displacement / (H / devicePixelRatio) * 0.4);
    grad.addColorStop(0, "rgba(140, 100, 180, " + alpha + ")");
    grad.addColorStop(1, "rgba(80, 50, 140, 0)");

    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2 * devicePixelRatio;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(state.blobX, state.dragStartY);
    ctx.lineTo(state.blobX, state.dragCurrentY);
    ctx.stroke();
    ctx.restore();
  }

  function drawCursorGlow() {
    if (state.phase !== PHASE.INITIATION && state.phase !== PHASE.HOLD) return;

    var intensity = Math.min(1, state.displacement / (H / devicePixelRatio * 0.6));
    var grad = ctx.createRadialGradient(
      state.blobX, state.blobY, 0,
      state.blobX, state.blobY, 40 * devicePixelRatio * (0.5 + intensity * 0.5)
    );
    grad.addColorStop(0, "rgba(180, 140, 220, " + (0.08 + intensity * 0.15) + ")");
    grad.addColorStop(1, "rgba(100, 70, 160, 0)");

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(state.blobX, state.blobY, 40 * devicePixelRatio * (0.5 + intensity * 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* --------------- render loop --------------- */
  var rafId = null;

  function update(t) {
    var dt      = (t - (state.lastFrameTime || t)) / 1000;
    dt = Math.min(dt, 0.05);
    state.lastFrameTime = t;

    var progress = state.displacement / (H / devicePixelRatio);

    /* snap threshold check */
    if ((state.phase === PHASE.INITIATION || state.phase === PHASE.HOLD)
        && !state.swiped) {
      if (progress >= SNAP_THRESHOLD || state.velocity > 120) {
        triggerSnap();
      }
    }

    /* hold phase hum decay */
    if (state.phase === PHASE.HOLD) {
      state.humVolume = Math.max(0.005, state.humVolume - HUM_DECAY_RATE * dt);
      setHumVol(state.humVolume);
    }

    /* snap phase - brief hold before yield */
    if (state.phase === PHASE.SNAP) {
      if (t - state.yieldStart > 20) {
        state.phase = PHASE.YIELD;
      } else {
        state.blobRadius  = 30 * devicePixelRatio + (t - state.yieldStart) * 0.5;
        state.blobOpacity = 0.3 + (t - state.yieldStart) * 0.01;
      }
    }

    /* yield phase - 250ms ease-out bloom */
    if (state.phase === PHASE.YIELD) {
      var elapsed = t - state.yieldStart;
      var yieldProgress = Math.min(1, elapsed / BLOOM_DURATION);
      var eased = 1 - Math.pow(1 - yieldProgress, 3);

      state.blobOpacity = 0.5 * (1 - eased * 0.85);
      state.blobRadius  = (30 + eased * 120) * devicePixelRatio;
      state.edgeSoftness = eased * 0.6;

      /* hum swells during yield */
      setHumVol(0.02 + eased * 0.12);

      if (yieldProgress >= 1) {
        state.phase    = PHASE.RESET;
        state.resetStart = t;
        setHumVol(0);
      }
    }

    /* reset phase - 1.2s then clear */
    if (state.phase === PHASE.RESET) {
      var resetProgress = Math.min(1, (t - state.resetStart) / RESET_DELAY);
      state.blobOpacity = Math.max(0, 0.05 * (1 - resetProgress));
      state.edgeSoftness *= (1 - dt * 2);

      if (resetProgress >= 1) {
        state.phase        = PHASE.IDLE;
        state.blobRadius   = 0;
        state.blobOpacity  = 0;
        state.edgeSoftness = 0;
        state.displacement  = 0;
        state.velocity     = 0;
        state.swiped       = false;
        state.bassPlayed   = false;
      }
    }

    /* idle hum fades in */
    if (state.phase === PHASE.IDLE) {
      setHumVol(0.005 + Math.sin(t * 0.0008) * 0.003);
    }

    /* ----- draw ----- */
    ctx.clearRect(0, 0, W, H);
    drawBaseGradient();
    drawCursorGlow();
    drawDragLine();
    drawBloom(t);
  }

  function loop(t) {
    update(t);
    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);

  /* handle page visibility for audio */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (humGain) humGain.gain.setTargetAtTime(0, audioCtx ? audioCtx.currentTime : 0, 0.02);
    } else if (audioCtx && state.phase !== PHASE.IDLE) {
      setHumVol(state.humVolume);
    }
  });
})();
