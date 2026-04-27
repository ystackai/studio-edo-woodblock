(function () {
    "use strict";

    /* --------------- constants --------------- */
    var SNAP_THRESHOLD      = 0.65;      // 65% drag distance to bloom
    var VEL_THRESHOLD       = 150;       // peak px/s velocity to trigger snap
    var BLOOM_DURATION      = 250;       // ms — locked yield ease-out
    var RESET_DELAY         = 1200;      // ms before state clears
    var BASS_DELAY          = 40;        // ms delay relative to visual snap
    var BASS_FREQ           = 75;
    var HUM_FREQ            = 55;
    var SCROLL_DAMPEN       = 0.7;      // 70% momentum reduction
    var HUM_DECAY_RATE      = 0.015;
    var MAX_QUEUE           = 3;
    var EASE_POWER          = 3;         // ease-out exponent
    var PRE_BLOOM_DELAY     = 12;        // ms of pre-bloom tension before yield
    var SNAP_BLOOM_PEAK     = 0.35;     // peak opacity at snap moment
    var YIELD_BLOOM_PEAK    = 0.65;     // peak opacity entering yield

    /* --------------- phase enum --------------- */
    var PHASE = {
      IDLE:       0,
      INITIATION: 1,
      HOLD:       2,
      SNAP:       3,
      YIELD:      4,
      RESET:      5,
      RELEASED:   6
    };

    /* --------------- state --------------- */
    var state = {
      phase:          PHASE.IDLE,
      dragStartY:     0,
      dragCurrentY:   0,
      displacement:     0,
      velocity:         0,
      lastY:           0,
      lastTime:         0,
      blobX:           0,
      blobY:           0,
      blobRadius:       0,
      blobOpacity:      0,
      edgeSoftness:     0,
      humVolume:        0,
      swiped:       false,
      queued:           [],        // rapid-swipe queue (≤3)
      yieldStart:       0,
      resetStart:       0,
      resetTimeout:     null,
      bassSchedTime:    0,
      bassScheduled:  false,
      bassPlayed:     false,
      scrollDampened: false,
      dampenExpiry:     0,
      lastFrameTime:    0,
      activePointer: null,
      tensionGlow:      0,        // tension glow during drag (0-1)
      rippleCount:      0,        // number of ripple rings
      ripples:          [],        // {cx, cy, radius, opacity, birth}
      microHumPhase:    0         // idle hum oscillation
    };

    /* --------------- canvas setup --------------- */
    var canvas = document.getElementById("c");
    var ctx    = canvas.getContext("2d");
    var dpr    = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, viewH;

    function resize() {
      viewH = window.innerHeight;
      W = canvas.width    = window.innerWidth    * dpr;
      H = canvas.height  = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    /* --------------- audio engine --------------- */
    var audioCtx   = null;
    var humOsc     = null;
    var humGain    = null;
    var humActive  = false;
    var bassQueue  = []; // scheduled bass hits for rapid swipes

    function ensureAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        humOsc = audioCtx.createOscillator();
        humGain = audioCtx.createGain();
        humOsc.type = "sine";
        humOsc.frequency.value = HUM_FREQ;
        humGain.gain.value = 0;
        humOsc.connect(humGain);
        humGain.connect(audioCtx.destination);
        humOsc.start();
        humActive = true;
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
    }

    function setHumVol(v) {
      if (!humGain || !audioCtx) return;
      v = Math.max(0, Math.min(v, 0.18));
      humGain.gain.setTargetAtTime(v, audioCtx.currentTime, 0.03);
    }

    function scheduleBass(delayMs) {
      if (!audioCtx) return;
      var fireAt = audioCtx.currentTime + delayMs / 1000;
      bassQueue.push(fireAt);
      if (bassQueue.length > MAX_QUEUE) bassQueue.shift();
      state.bassScheduled = true;
    }

    function playSingleBass(fireTime) {
      if (!audioCtx) return;
      var now = fireTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(BASS_FREQ, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.4);
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    }

    function checkScheduledBass() {
      if (!audioCtx || bassQueue.length === 0) return;
      var now = audioCtx.currentTime;
      // Fire any bass hits whose scheduled time has arrived
      while (bassQueue.length > 0 && bassQueue[0] <= now + 0.005) {
        var t = bassQueue.shift();
        playSingleBass(t);
      }
      if (bassQueue.length === 0) {
        state.bassScheduled = false;
      }
    }

    /* --------------- haptics --------------- */
    function pulseHaptic() {
      if (navigator.vibrate) {
        try { navigator.vibrate(35); } catch (_) {}
      }
    }

    /* --------------- ripple system --------------- */
    function addRipple(cx, cy) {
      state.ripples.push({
        cx: cx,
        cy: cy,
        radius: 0,
        maxRadius: Math.max(W, H) * 0.6,
        opacity: 0.25,
        birth: performance.now()
      });
      // Clean old ripples
      if (state.ripples.length > 5) {
        state.ripples = state.ripples.slice(-5);
      }
    }

    function updateRipples(t) {
      for (var i = state.ripples.length - 1; i >= 0; i--) {
        var r = state.ripples[i];
        var age = (t - r.birth) / 1000;
        r.radius = age * 300 * dpr; // px/s expansion rate
        r.opacity = Math.max(0, 0.25 * (1 - age * 0.8));
        if (r.opacity <= 0.001) {
          state.ripples.splice(i, 1);
        }
      }
    }

    function drawRipples() {
      if (!state.ripples.length) return;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < state.ripples.length; i++) {
        var r = state.ripples[i];
        var cx = r.cx * dpr;
        var cy = r.cy * dpr;
        var rad = r.radius;
        var grad = ctx.createRadialGradient(cx, cy, rad * 0.85, cx, cy, rad);
        grad.addColorStop(0, "rgba(30, 20, 50, 0)");
        grad.addColorStop(0.5, "rgba(180, 140, 210, " + (r.opacity * 0.4).toFixed(3) + ")");
        grad.addColorStop(0.8, "rgba(140, 100, 180, " + (r.opacity * 0.2).toFixed(3) + ")");
        grad.addColorStop(1, "rgba(30, 20, 50, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* --------------- input handling --------------- */
    var pointers = new Map();

    function getPointerY(e) {
      if (e.touches && e.touches.length > 0) return e.touches[0].clientY;
      if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientY;
      return e.clientY;
    }

    function getPointerId(e) {
      if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].identifier;
      if (e.touches && e.touches.length > 0) return e.touches[0].identifier;
      return "mouse";
    }

    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onUp, { passive: false });
    canvas.addEventListener("touchcancel", onUp, { passive: false });
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);

    function onDown(e) {
      e.preventDefault();
      ensureAudio();

      var y  = getPointerY(e);
      var id = getPointerId(e);
      state.activePointer = id;

      if (state.phase === PHASE.IDLE) {
        // Fresh interaction — reset everything
        state.phase            = PHASE.INITIATION;
        state.dragStartY       = y;
        state.dragCurrentY     = y;
        state.lastY            = y;
        state.lastTime         = performance.now();
        state.displacement      = 0;
        state.velocity          = 0;
        state.blobX            = window.innerWidth / 2;
        state.blobY            = y;
        state.blobRadius       = 0;
        state.blobOpacity      = 0;
        state.edgeSoftness     = 0;
        state.humVolume        = 0.08;
        state.swiped           = false;
        state.bassPlayed       = false;
        state.bassScheduled    = false;
        state.queued           = [];
        state.tensionGlow      = 0;
        state.ripples          = [];
        setHumVol(0.08);
      } else if (
        state.phase === PHASE.RESET ||
        state.phase === PHASE.YIELD ||
        state.phase === PHASE.SNAP ||
        state.phase === PHASE.RELEASED
      ) {
        // Queue rapid swipe (max 3)
        if (state.queued.length < MAX_QUEUE) {
          state.queued.push({
            y: y,
            t: performance.now(),
            blobX: window.innerWidth / 2,
            blobY: y
          });
        }
      }
      pointers.set(id, y);
    }

    function onMove(e) {
      e.preventDefault();
      var y  = getPointerY(e);
      var id = getPointerId(e);

      if (state.activePointer !== id) return;

      if (state.phase === PHASE.INITIATION || state.phase === PHASE.HOLD) {
        var now  = performance.now();
        var dt   = Math.max(0.5, now - state.lastTime);
        var dy   = state.lastY - y;

        state.velocity       = Math.abs(dy / dt * 16);
        state.displacement   = Math.abs(y - state.dragStartY);
        state.dragCurrentY   = y;
        state.lastY          = y;
        state.lastTime       = now;
        state.blobY          = y;
        state.blobX          = window.innerWidth / 2;

        var progress = state.displacement / viewH;

        // Transition from initiation to hold at 8% drag
        if (progress >= 0.08 && state.phase === PHASE.INITIATION) {
          state.phase = PHASE.HOLD;
        }

        // Tension glow scales with displacement
        state.tensionGlow = Math.min(1, progress / 0.15);

        // Hum fades as drag deepens toward threshold
        setHumVol(0.08 * (1 - progress * 0.7));
      }

      pointers.set(id, y);
    }

    function onUp(e) {
      e.preventDefault();
      var id = (e.changedTouches && e.changedTouches.length > 0)
        ? e.changedTouches[0].identifier : "mouse";
      pointers.delete(id);
      if (state.activePointer === id) {
        state.activePointer = null;
      }

      // If released during drag without snapping, transition to released state
      if (!state.swiped &&
          (state.phase === PHASE.INITIATION || state.phase === PHASE.HOLD)) {
        // Gentle release: fade tension and glow
        state.phase = PHASE.RELEASED;
        state.resetStart = performance.now();
        state.yieldStart = performance.now();

        // Trigger a soft bloom at the release point
        addRipple(state.blobX, state.blobY);
        // Small haptic for gentle release
        pulseHaptic();

        // Schedule a soft bass to mark the release
        scheduleBass(BASS_DELAY);

        // Auto-reset after delay
        if (state.resetTimeout) clearTimeout(state.resetTimeout);
        state.resetTimeout = setTimeout(function () {
          if (state.phase === PHASE.RELEASED) {
            state.phase       = PHASE.RESET;
            state.resetStart  = performance.now();
          }
        }, 600);
      }
    }

    /* --------------- scroll dampening ------------------- */
    var wheelDampenActive = false;

    function activateScrollDampen() {
      if (wheelDampenActive) return;
      wheelDampenActive = true;
      state.dampenExpiry = performance.now() + RESET_DELAY;
    }

    function checkDampenExpiry() {
      if (wheelDampenActive && performance.now() >= state.dampenExpiry) {
        wheelDampenActive = false;
      }
    }

    window.addEventListener("wheel", function (e) {
      if (wheelDampenActive) {
        e.preventDefault();
        var dampened = Math.round(e.deltaY * (1 - SCROLL_DAMPEN));
        window.scrollBy(0, dampened);
      }
    }, { passive: false });

    // Also intercept touch-scroll on body for mobile dampening
    var scrollMomentum = 0;
    document.body.addEventListener("touchmove", function(e) {
      if (wheelDampenActive) {
        e.preventDefault();
      }
    }, { passive: false });

    /* --------------- snap / yield logic --------------- */
    function triggerSnap() {
      if (state.swiped) return;
      state.phase     = PHASE.SNAP;
      state.swiped    = true;
      state.yieldStart = performance.now();
      state.blobOpacity = 0.03;
      state.blobRadius  = 15;
      state.edgeSoftness = 0;

      // Haptic fires immediately at snap threshold
      pulseHaptic();

      // Add ripple at snap point
      addRipple(state.blobX, state.blobY);

      // Bass delayed 40ms relative to visual snap
      scheduleBass(BASS_DELAY);

      // Scroll dampening kicks in
      activateScrollDampen();
    }

    function processQueue() {
      if (state.queued.length === 0) return;
      var entry = state.queued.shift();
      state.phase            = PHASE.INITIATION;
      state.dragStartY       = entry.y;
      state.dragCurrentY     = entry.y;
      state.lastY            = entry.y;
      state.lastTime         = performance.now();
      state.displacement     = 0;
      state.velocity         = 0;
      state.blobX            = entry.blobX;
      state.blobY            = entry.blobY;
      state.blobRadius       = 0;
      state.blobOpacity      = 0;
      state.edgeSoftness     = 0;
      state.humVolume        = 0.08;
      state.swiped           = false;
      state.tensionGlow      = 0;
      state.bassPlayed       = false;
      state.bassScheduled    = false;
      state.ripples          = [];
      setHumVol(0.08);
    }

    /* --------------- drawing --------------- */

    // Core indigo-to-void gradient holding tension
    function drawBaseGradient() {
      var cx = state.blobX * dpr;
      var cy = state.blobY * dpr;
      var maxR = Math.max(W, H) * 0.7;

      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);

      if (state.phase === PHASE.IDLE) {
        grad.addColorStop(0,    "rgba(18, 12, 40, 1)");
        grad.addColorStop(0.4, "rgba(8, 6, 20, 1)");
        grad.addColorStop(1,    "rgba(0, 0, 0, 1)");
      } else if (state.phase === PHASE.INITIATION || state.phase === PHASE.HOLD) {
        // Gradient holds firm during drag
        var soft = state.edgeSoftness;
        var intensity = Math.min(1, state.tensionGlow);
        var r0 = Math.round(25 + intensity * 10);
        var g0 = Math.round(15 + intensity * 5);
        var b0 = Math.round(50 + intensity * 15);
        grad.addColorStop(0,    "rgba(" + r0 + "," + g0 + "," + b0 + ", 0.98)");
        grad.addColorStop(0.3, "rgba(14, 9, 35, 0.96)");
        grad.addColorStop(0.6, "rgba(8, 5, 22, 0.93)");
        grad.addColorStop(1,    "rgba(0, 0, 0, 0.9)");
      } else {
        var soft = state.edgeSoftness;
        var op0 = 0.95 - soft * 0.15;
        var op1 = 0.9  - soft * 0.2;
        var op2 = 0.85 - soft * 0.15;
        grad.addColorStop(0,    "rgba(25, 15, 50, " + op0.toFixed(3) + ")");
        grad.addColorStop(0.4, "rgba(10, 7, 25, " + op1.toFixed(3) + ")");
        grad.addColorStop(1,    "rgba(0, 0, 0, " + op2.toFixed(3) + ")");
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Tension glow during drag — subtle glow around thumb position
    function drawTensionGlow() {
      if (state.phase !== PHASE.INITIATION && state.phase !== PHASE.HOLD) return;
      if (state.tensionGlow < 0.01) return;

      var intensity = state.tensionGlow;
      var cx = state.blobX * dpr;
      var cy = state.blobY * dpr;
      var r   = 40 * dpr * (0.6 + intensity * 0.6);

      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      var a = (0.04 + intensity * 0.18).toFixed(3);
      grad.addColorStop(0, "rgba(180, 145, 225, " + a + ")");
      grad.addColorStop(0.5, "rgba(120, 90, 190, " + (parseFloat(a) * 0.5).toFixed(3) + ")");
      grad.addColorStop(1, "rgba(60, 40, 120, 0)");

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Drag path line
    function drawDragLine() {
      if (state.phase !== PHASE.INITIATION && state.phase !== PHASE.HOLD) return;
      if (Math.abs(state.dragCurrentY - state.dragStartY) < 3) return;

      var sx  = state.blobX * dpr;
      var sy1 = state.dragStartY * dpr;
      var sy2 = state.dragCurrentY * dpr;

      var grad = ctx.createLinearGradient(sx, sy1, sx, sy2);
      var prog = Math.min(1, state.displacement / viewH);
      var alpha = Math.min(0.4, prog * 0.5);
      grad.addColorStop(0,  "rgba(150, 110, 200, " + alpha.toFixed(3) + ")");
      grad.addColorStop(1,  "rgba(80, 50, 150, 0)");

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 2 * dpr;
      ctx.lineCap     = "round";
      ctx.beginPath();
      ctx.moveTo(sx, sy1);
      ctx.lineTo(sx, sy2);
      ctx.stroke();
      ctx.restore();
    }

    // Amber / rose bloom on snap+yield
    function drawBloom() {
      if (state.blobOpacity <= 0.005) return;

      var cx = state.blobX * dpr;
      var cy = state.blobY * dpr;
      var r  = state.blobRadius * dpr;
      var op = state.blobOpacity;

      // Primary amber core
      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0.0,   "rgba(255, 185, 70, " + op.toFixed(3) + ")");
      grad.addColorStop(0.25, "rgba(245, 150, 75, " + (op * 0.8).toFixed(3) + ")");
      grad.addColorStop(0.5,  "rgba(240, 130, 80, " + (op * 0.55).toFixed(3) + ")");
      grad.addColorStop(0.7,  "rgba(210, 85, 100, " + (op * 0.3).toFixed(3) + ")");
      grad.addColorStop(1.0,  "rgba(60, 25, 50, 0)");

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Outer warm glow (rose bleed)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      var glowR = r * 2.2;
      var glow = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, glowR);
      glow.addColorStop(0,   "rgba(255, 200, 100, " + (op * 0.18).toFixed(3) + ")");
      glow.addColorStop(0.3, "rgba(235, 120, 85,  " + (op * 0.1).toFixed(3) + ")");
      glow.addColorStop(0.6, "rgba(220, 90, 80,   " + (op * 0.05).toFixed(3) + ")");
      glow.addColorStop(1,   "rgba(80, 40, 60, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Released state gentle fade
    function drawReleaseFade(t) {
      if (state.phase !== PHASE.RELEASED) return;
      var elapsed = t - state.yieldStart;
      var prog = Math.min(1, elapsed / 600);
      var eased = 1 - Math.pow(1 - prog, 2);

      var cx = state.blobX * dpr;
      var cy = state.blobY * dpr;
      var op = (0.08 * (1 - eased));
      var r  = (25 + eased * 120) * dpr;

      if (op < 0.005) return;

      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "rgba(180, 145, 210, " + op.toFixed(3) + ")");
      grad.addColorStop(0.5, "rgba(120, 90, 170, " + (op * 0.5).toFixed(3) + ")");
      grad.addColorStop(1, "rgba(40, 25, 70, 0)");

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* --------------- render loop --------------- */
    var rafId = null;

    function update(t) {
      var dt        = (t - (state.lastFrameTime || t)) / 1000;
      dt = Math.min(dt, 0.05); // clamp to avoid huge jumps
      state.lastFrameTime = t;

      checkDampenExpiry();
      checkScheduledBass();
      updateRipples(t);

      var progress = state.displacement / viewH;

      /* ---- snap threshold check ---- */
      if (!state.swiped &&
          (state.phase === PHASE.INITIATION || state.phase === PHASE.HOLD)) {
        if (progress >= SNAP_THRESHOLD || state.velocity >= VEL_THRESHOLD) {
          triggerSnap();
        }
      }

      /* ---- hold: hum decay ---- */
      if (state.phase === PHASE.HOLD) {
        state.humVolume = Math.max(0.003, state.humVolume - HUM_DECAY_RATE * dt * 60);
        setHumVol(state.humVolume);
      }

      /* ---- snap: brief tension pause, then yield ---- */
      if (state.phase === PHASE.SNAP) {
        var snapElapsed = t - state.yieldStart;
        if (snapElapsed >= PRE_BLOOM_DELAY) {
          state.phase    = PHASE.YIELD;
          state.yieldStart = t;
        } else {
          // Pre-bloom: subtle growth and warm hint
          state.blobRadius = (15 + snapElapsed * 1.2);
          state.blobOpacity = 0.03 + snapElapsed * 0.008;
        }
      }

      /* ---- yield: locked 250ms ease-out ---- */
      if (state.phase === PHASE.YIELD) {
        var elapsed = t - state.yieldStart;
        var t0      = Math.min(1, elapsed / BLOOM_DURATION);
        // Custom ease-out: 1 - (1-t)^3
        var eased   = 1 - Math.pow(1 - t0, EASE_POWER);

        state.blobOpacity  = SNAP_BLOOM_PEAK * (1 - eased * 0.45);
        state.blobRadius   = (20 + eased * 350);
        state.edgeSoftness = eased * 0.5;

        // Hum swells as gradient yields
        setHumVol(0.01 + eased * 0.12);

        // Add secondary ripple at mid-yield
        if (Math.abs(eased - 0.3) < dt && state.rippleCount < 2) {
          addRipple(state.blobX, state.blobY);
          state.rippleCount++;
        }

        if (t0 >= 1) {
          state.phase      = PHASE.RESET;
          state.resetStart = t;
          setHumVol(0.005);
          state.rippleCount = 0;
        }
      }

      /* ---- reset: 1.2s fade to idle ---- */
      if (state.phase === PHASE.RESET) {
        var rp = Math.min(1, (t - state.resetStart) / RESET_DELAY);
        state.blobOpacity   = Math.max(0, SNAP_BLOOM_PEAK * 0.15 * (1 - rp));
        state.edgeSoftness  = Math.max(0, state.edgeSoftness * (1 - dt * 3));
        state.tensionGlow   = Math.max(0, state.tensionGlow * (1 - dt * 4));

        if (rp >= 1) {
          state.phase          = PHASE.IDLE;
          state.blobRadius     = 0;
          state.blobOpacity    = 0;
          state.edgeSoftness   = 0;
          state.displacement   = 0;
          state.velocity       = 0;
          state.swiped         = false;
          state.bassPlayed     = false;
          state.bassScheduled  = false;
          state.tensionGlow    = 0;
          state.ripples        = [];
          state.rippleCount    = 0;

          // Process queued rapid swipes
          if (state.queued.length > 0) {
            processQueue();
          }
        }
      }

      /* ---- idle: micro-hum oscillation ---- */
      if (state.phase === PHASE.IDLE && humActive) {
        state.microHumPhase += dt * 0.7;
        var humV = 0.004 + Math.sin(state.microHumPhase) * 0.003;
        setHumVol(Math.max(0.001, humV));
      }

      /* ---- released: gentle fade ---- */
      if (state.phase === PHASE.RELEASED) {
        var relElapsed = t - state.yieldStart;
        var relProg = Math.min(1, relElapsed / 600);
        setHumVol(0.03 * (1 - relProg));
      }

      /* ---- draw ---- */
      ctx.clearRect(0, 0, W, H);
      drawBaseGradient();
      drawTensionGlow();
      drawDragLine();
      drawBloom();
      drawReleaseFade(t);
      drawRipples();
    }

    function loop(t) {
      update(t);
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
  })();
