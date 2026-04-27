(function () {
  "use strict";

  /* --------------- constants --------------- */
  var SNAP_THRESHOLD     = 0.65;       // 65% drag distance
  var VEL_THRESHOLD       = 1800;       // px/s peak velocity
  var BLOOM_DURATION      = 250;       // ms locked ease-out
  var RESET_DELAY         = 1200;      // ms to idle
  var BASS_DELAY          = 40;        // ms audio-delay vs visual
  var BASS_FREQ           = 75;
  var HUM_FREQ            = 55;
  var SCROLL_DAMPEN       = 0.7;       // 70% momentum reduction
  var HUM_DECAY_RATE      = 0.012;
  var MAX_QUEUE           = 3;
  var EASE_POWER          = 3;
  var PRE_BLOOM_MS        = 12;        // tension micro-pause
  var SNAP_BLOOM_PEAK     = 0.35;
  var HUM_BASE            = 0.08;
  var HUM_FLOOR           = 0.003;
  var HUM_IDLE            = 0.004;

  /* --------------- phase enum --------------- */
  var PHASE = {
    IDLE:       0,
    DOWN:       1,     // thumb just touched, < min travel
    DRAG:       2,     // dragging, tension building
    SNAP:       3,     // snap threshold hit
    YIELD:      4,     // 250ms ease-out bloom
    RESETTING:   5,     // 1.2s fade to idle
    RELEASED:    6      // early release without snap
  };

  /* --------------- state --------------- */
  var st = {
    phase:         PHASE.IDLE,
    touchId:       null,
    startY:        0,
    startX:        0,
    curY:          0,
    curX:          0,
    prevY:         0,
    prevX:         0,
    prevT:         0,
    disp:          0,          // total displacement from start
    vel:           0,          // px/s
    px:            0,          // bloom center x
    py:            0,          // bloom center y
    bloomR:        0,         // bloom radius
    bloomAlpha:    0,         // bloom opacity
    softness:      0,         // edge softness 0->1
    tensGlow:      0,         // tension glow intensity
    humVol:        0,
    snapped:       false,
    queue:         [],         // rapid swipe queue
    yieldT:        0,         // yield start timestamp
    resetT:        0,         // reset start timestamp
    resetTimer:    null,
    dampExp:       0,         // dampening expiry time
    dampOn:       false,
    lastFrame:     0,
    microPhase:    0,
    ripples:       [],
    rippleSeq:     0,
    queuedBass:    [],        // absolute audio times for bass hits
    bassCheckT:    0,
    dragPath:       []         // trail points for visual path
  };

  /* --------------- canvas --------------- */
  var cv   = document.getElementById("c");
  var cx   = cv.getContext("2d", { alpha: false });
  var dpr  = Math.min(window.devicePixelRatio || 1, 2);
  var cW, cH;

  function resize() {
    cW = window.innerWidth;
    cH = window.innerHeight;
    cv.width  = cW * dpr;
    cv.height = cH * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  /* --------------- audio --------------- */
  var actx    = null;
  var humOsc  = null;
  var humGn   = null;
  var humOn   = false;

  function bootAudio() {
    if (actx) {
      if (actx.state === "suspended") actx.resume();
      return;
    }
    actx = new (window.AudioContext || window.webkitAudioContext)();
    humOsc = actx.createOscillator();
    humGn  = actx.createGain();
    humOsc.type = "sine";
    humOsc.frequency.value = HUM_FREQ;
    humGn.gain.value = 0;
    humOsc.connect(humGn);
    humGn.connect(actx.destination);
    humOsc.start();
    humOn = true;
  }

  function setHum(v) {
    if (!humGn || !actx) return;
    humGn.gain.setTargetAtTime(Math.max(0, Math.min(v, 0.18)), actx.currentTime, 0.025);
  }

  function playBassAt(t) {
    if (!actx) return;
    // Primary 75Hz sub-bass
    var o1 = actx.createOscillator();
    var g1 = actx.createGain();
    o1.type = "sine";
    o1.frequency.setValueAtTime(BASS_FREQ, t);
    o1.frequency.exponentialRampToValueAtTime(36, t + 0.45);
    g1.gain.setValueAtTime(0.50, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    o1.connect(g1);
    g1.connect(actx.destination);
    o1.start(t);
    o1.stop(t + 0.65);

    // Sub-octave for warmth
    var o2 = actx.createOscillator();
    var g2 = actx.createGain();
    o2.type = "sine";
    o2.frequency.setValueAtTime(BASS_FREQ * 0.5, t);
    o2.frequency.exponentialRampToValueAtTime(18, t + 0.5);
    g2.gain.setValueAtTime(0.25, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    o2.connect(g2);
    g2.connect(actx.destination);
    o2.start(t);
    o2.stop(t + 0.6);

    // Click transient — tiny noise burst for tactile feel
    var buf = actx.createBuffer(1, actx.sampleRate * 0.04, actx.sampleRate);
    var d   = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.15));
    }
    var ns = actx.createBufferSource();
    var ng = actx.createGain();
    ns.buffer = buf;
    ng.gain.setValueAtTime(0.08, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    var flt = actx.createBiquadFilter();
    flt.type = "lowpass";
    flt.frequency.value = 200;
    ns.connect(flt);
    flt.connect(ng);
    ng.connect(actx.destination);
    ns.start(t);
  }

  function scheduleBass() {
    if (!actx) return;
    var fireAt = actx.currentTime + BASS_DELAY / 1000;
    st.queuedBass.push(fireAt);
    if (st.queuedBass.length > MAX_QUEUE) st.queuedBass.shift();
  }

  function flushBass() {
    if (!actx || !st.queuedBass.length) return;
    var now = actx.currentTime;
    while (st.queuedBass.length && st.queuedBass[0] <= now + 0.003) {
      playBassAt(st.queuedBass.shift());
    }
  }

  /* --------------- haptics --------------- */
  function hapticPulse() {
    if (!navigator.vibrate) return;
    try { navigator.vibrate(30); } catch (_) {}
  }

  /* --------------- ripples --------------- */
  function spawnRipple(x, y) {
    st.ripples.push({
      x: x, y: y,
      r: 0,
      mr: Math.max(cW, cH) * 0.55,
      a: 0.22,
      t: performance.now(),
      seq: ++st.rippleSeq
    });
    if (st.ripples.length > 6) st.ripples = st.ripples.slice(-4);
  }

  function updateRips(now) {
    for (var i = st.ripples.length - 1; i >= 0; i--) {
      var rp = st.ripples[i];
      var age = (now - rp.t) / 1000;
      rp.r = age * 280;
      rp.a = Math.max(0, 0.22 * (1 - age * 0.75));
      if (rp.a < 0.002) st.ripples.splice(i, 1);
    }
  }

  function drawRips() {
    if (!st.ripples.length) return;
    cx.save();
    cx.globalCompositeOperation = "lighter";
    for (var i = 0; i < st.ripples.length; i++) {
      var rp = st.ripples[i];
      // Draw ring with gradient for depth
      var innerR = Math.max(0, rp.r - 12);
      var grad = cx.createRadialGradient(rp.x, rp.y, innerR, rp.x, rp.y, rp.r);
      grad.addColorStop(0,     "rgba(30, 18, 55, 0)");
      grad.addColorStop(0.6,   "rgba(175, 135, 205, " + (rp.a * 0.35).toFixed(3) + ")");
      grad.addColorStop(0.85,  "rgba(155, 110, 185, " + (rp.a * 0.15).toFixed(3) + ")");
      grad.addColorStop(1,     "rgba(30, 18, 55, 0)");
      cx.strokeStyle = grad;
      cx.lineWidth = 4;
      cx.beginPath();
      cx.arc(rp.x, rp.y, rp.r, 0, 6.2832);
      cx.stroke();
    }
    cx.restore();
  }

  /* --------------- input --------------- */
  function ptrPos(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function ptrId(e) {
    if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0].identifier;
    if (e.touches && e.touches.length) return e.touches[0].identifier;
    return 0;
  }

  cv.addEventListener("touchstart", onDown, { passive: false });
  cv.addEventListener("touchmove", onMove, { passive: false });
  cv.addEventListener("touchend",   onUp,   { passive: false });
  cv.addEventListener("touchcancel", onUp,   { passive: false });
  cv.addEventListener("mousedown", onDown);
  cv.addEventListener("mousemove", onMove);
  cv.addEventListener("mouseup", onUp);

  function onDown(e) {
    e.preventDefault();
    bootAudio();
    var p  = ptrPos(e);
    var id = ptrId(e);
    st.touchId = id;

    if (st.phase === PHASE.IDLE) {
      st.phase      = PHASE.DOWN;
      st.startY     = p.y;
      st.startX     = p.x;
      st.curY       = p.y;
      st.curX       = p.x;
      st.prevY      = p.y;
      st.prevX      = p.x;
      st.prevT      = performance.now();
      st.disp       = 0;
      st.vel        = 0;
      st.px         = p.x;
      st.py         = p.y;
      st.bloomR     = 0;
      st.bloomAlpha = 0;
      st.softness   = 0;
      st.tensGlow   = 0;
      st.humVol     = HUM_BASE;
      st.snapped    = false;
      st.queue      = [];
      st.dragPath   = [{ x: p.x, y: p.y }];
      st.ripples = [];
      setHum(HUM_BASE);
    } else if (st.phase >= PHASE.SNAP) {
      if (st.queue.length < MAX_QUEUE) {
        st.queue.push({ x: p.x, y: p.y, t: performance.now() });
      }
    }
  }

  function onMove(e) {
    e.preventDefault();
    var p  = ptrPos(e);
    var id = ptrId(e);
    if (st.touchId !== id) return;

    if (st.phase === PHASE.DOWN || st.phase === PHASE.DRAG) {
      var now = performance.now();
      var dt  = Math.max(0.4, now - st.prevT);
      var dy  = st.prevY - p.y;
      var dx  = st.prevX - p.x;

      // px/s velocity
      st.vel  = Math.sqrt(dy * dy + dx * dx) / dt * 1000;
      st.disp = Math.abs(p.y - st.startY);
      st.curY = p.y;
      st.curX = p.x;
      st.prevY = p.y;
      st.prevX = p.x;
      st.prevT = now;
      st.px    = p.x;
      st.py    = p.y;

      var prog = st.disp / cH;

      // DOWN -> DRAG at 5% displacement
      if (st.phase === PHASE.DOWN && prog >= 0.05) {
        st.phase = PHASE.DRAG;
      }

      // Tension glow — builds as drag deepens
      st.tensGlow = Math.min(1, prog / 0.12);

      // Hum fades as drag approaches threshold
      setHum(HUM_BASE * (1 - prog * 0.65));

      // Track drag path for visual
      if (st.dragPath.length && st.disp > 2) {
        var last = st.dragPath[st.dragPath.length - 1];
        var ddx = p.x - last.x;
        var ddy = p.y - last.y;
        if (ddx * ddx + ddy * ddy > 64) {
          st.dragPath.push({ x: p.x, y: p.y });
        }
      }

      // ---- Snap threshold check ----
      if (!st.snapped && (prog >= SNAP_THRESHOLD || st.vel >= VEL_THRESHOLD)) {
        doSnap();
      }
    }
  }

  function onUp(e) {
    e.preventDefault();
    var id = ptrId(e);
    if (st.touchId === id) st.touchId = null;

    if (!st.snapped && (st.phase === PHASE.DOWN || st.phase === PHASE.DRAG)) {
      // Early release — gentle settle
      st.phase    = PHASE.RELEASED;
      st.yieldT   = performance.now();
      spawnRipple(st.px, st.py);
      hapticPulse();
      scheduleBass();
      setHum(0.025);

      if (st.resetTimer) clearTimeout(st.resetTimer);
      st.resetTimer = setTimeout(function () {
        if (st.phase === PHASE.RELEASED) {
          st.phase = PHASE.RESETTING;
          st.resetT = performance.now();
        }
      }, 500);
    }
  }

  /* --------------- scroll dampening --------------- */
  window.addEventListener("wheel", function (e) {
    if (st.dampOn) {
      e.preventDefault();
      window.scrollBy(0, Math.round(e.deltaY * (1 - SCROLL_DAMPEN)));
    }
  }, { passive: false });

  document.body.addEventListener("touchmove", function (e) {
    if (st.dampOn) e.preventDefault();
  }, { passive: false });

  /* --------------- snap logic --------------- */
  function doSnap() {
    if (st.snapped) return;
    st.snapped  = true;
    st.phase    = PHASE.SNAP;
    st.yieldT   = performance.now();
    st.bloomR   = 12;
    st.bloomAlpha = 0.04;
    st.softness = 0;

    hapticPulse();
    spawnRipple(st.px, st.py);
    scheduleBass();

    st.dampOn   = true;
    st.dampExp  = performance.now() + RESET_DELAY;
  }

  function popQueue() {
    if (!st.queue.length) return;
    var q = st.queue.shift();
    st.phase       = PHASE.DOWN;
    st.startY      = q.y;
    st.startX      = q.x;
    st.curY        = q.y;
    st.curX        = q.x;
    st.prevY       = q.y;
    st.prevX       = q.x;
    st.prevT       = performance.now();
    st.disp        = 0;
    st.vel         = 0;
    st.px          = q.x;
    st.py          = q.y;
    st.bloomR      = 0;
    st.bloomAlpha  = 0;
    st.softness    = 0;
    st.tensGlow    = 0;
    st.humVol      = HUM_BASE;
    st.snapped     = false;
    st.dragPath    = [];
    st.ripples     = [];
    setHum(HUM_BASE);
  }

  /* --------------- rendering --------------- */
  function drawBg() {
    var cx2 = st.px, cy2 = st.py;
    var mxR  = Math.max(cW, cH) * 0.7;

    var g = cx.createRadialGradient(cx2, cy2, 0, cx2, cy2, mxR);

    if (st.phase === PHASE.IDLE) {
      g.addColorStop(0,   "rgba(16, 10, 38, 1)");
      g.addColorStop(0.3, "rgba(8, 5, 18, 1)");
      g.addColorStop(1,   "rgba(2, 1, 6, 1)");
    } else if (st.phase === PHASE.DOWN || st.phase === PHASE.DRAG) {
      var t = st.tensGlow;
      var r0 = 18 + t * 14 | 0;
      var g0 = 10 + t * 6  | 0;
      var b0 = 42 + t * 18 | 0;
      g.addColorStop(0,   "rgba(" + r0 + "," + g0 + "," + b0 + ", 0.99)");
      g.addColorStop(0.35,"rgba(12, 7, 30, 0.97)");
      g.addColorStop(0.7, "rgba(6, 3, 18, 0.95)");
      g.addColorStop(1,   "rgba(2, 1, 6, 0.88)");
    } else {
      var s = st.softness;
      var o0 = 0.96 - s * 0.12;
      var o1 = 0.91 - s * 0.18;
      g.addColorStop(0,   "rgba(22, 12, 48, " + o0.toFixed(3) + ")");
      g.addColorStop(0.4, "rgba(8, 5, 22,  " + o1.toFixed(3) + ")");
      g.addColorStop(1,   "rgba(2, 1, 6,   " + (o1 - s * 0.08).toFixed(3) + ")");
    }

    cx.fillStyle = g;
    cx.fillRect(0, 0, cW, cH);
  }

  function drawTensGlow() {
    if ((st.phase !== PHASE.DOWN && st.phase !== PHASE.DRAG) || st.tensGlow < 0.02) return;
    var t = st.tensGlow;
    var r = 35 * (0.5 + t * 0.8);
    var g = cx.createRadialGradient(st.px, st.py, 0, st.px, st.py, r);
    var a = (0.03 + t * 0.16).toFixed(3);
    g.addColorStop(0,   "rgba(175, 140, 220, " + a + ")");
    g.addColorStop(0.4, "rgba(115, 85, 185,  " + (parseFloat(a) * 0.45).toFixed(3) + ")");
    g.addColorStop(1,   "rgba(55, 35, 115, 0)");

    cx.save();
    cx.globalCompositeOperation = "lighter";
    cx.fillStyle = g;
    cx.beginPath();
    cx.arc(st.px, st.py, r, 0, 6.2832);
    cx.fill();
    cx.restore();
  }

  function drawDragTrail() {
    if (st.phase !== PHASE.DOWN && st.phase !== PHASE.DRAG) return;
    var pts = st.dragPath;
    if (pts.length < 2) return;

    var prog = Math.min(1, st.disp / cH);
    var alpha = Math.min(0.35, prog * 0.45);

    cx.save();
    cx.lineWidth = 1.5;
    cx.lineCap = "round";
    cx.lineJoin = "round";

    for (var i = 1; i < pts.length; i++) {
      var frac = i / pts.length;
      var segA = (alpha * frac * 0.6).toFixed(3);
      var r = Math.round(140 + frac * 40);
      var gr = Math.round(90 + frac * 30);
      var b = Math.round(180 + frac * 30);
      cx.strokeStyle = "rgba(" + r + "," + gr + "," + b + "," + segA + ")";
      cx.beginPath();
      cx.moveTo(pts[i - 1].x, pts[i - 1].y);
      cx.lineTo(pts[i].x, pts[i].y);
      cx.stroke();
    }
    cx.restore();
  }

  function drawBloom() {
    if (st.bloomAlpha < 0.005) return;
    var p = st.px, q = st.py, r = st.bloomR, a = st.bloomAlpha;

    // Core amber/rose
    var g = cx.createRadialGradient(p, q, 0, p, q, r);
    g.addColorStop(0.0,  "rgba(255, 195, 80,  " + a.toFixed(3) + ")");
    g.addColorStop(0.2,  "rgba(250, 155, 80,  " + (a * 0.82).toFixed(3) + ")");
    g.addColorStop(0.45, "rgba(242, 125, 85,  " + (a * 0.55).toFixed(3) + ")");
    g.addColorStop(0.7,  "rgba(215, 80, 105,  " + (a * 0.28).toFixed(3) + ")");
    g.addColorStop(1.0,  "rgba(55, 22, 48, 0)");

    cx.save();
    cx.globalCompositeOperation = "lighter";
    cx.fillStyle = g;
    cx.beginPath();
    cx.arc(p, q, r, 0, 6.2832);
    cx.fill();

    // Outer warm glow
    var gr = r * 2.4;
    var g2 = cx.createRadialGradient(p, q, r * 0.08, p, q, gr);
    g2.addColorStop(0,   "rgba(255, 210, 110, " + (a * 0.14).toFixed(3) + ")");
    g2.addColorStop(0.25,"rgba(232, 125, 85,  " + (a * 0.08).toFixed(3) + ")");
    g2.addColorStop(0.55,"rgba(218, 88, 80,   " + (a * 0.04).toFixed(3) + ")");
    g2.addColorStop(1,   "rgba(72, 38, 58, 0)");
    cx.fillStyle = g2;
    cx.beginPath();
    cx.arc(p, q, gr, 0, 6.2832);
    cx.fill();
    cx.restore();
  }

  function drawReleaseFade(now) {
    if (st.phase !== PHASE.RELEASED) return;
    var el  = (now - st.yieldT) / 1000;
    var pr  = Math.min(1, el / 0.6);
    var eas = 1 - (1 - pr) * (1 - pr);
    var a   = 0.07 * (1 - eas);
    var r   = 22 + eas * 130;
    if (a < 0.003) return;

    var g = cx.createRadialGradient(st.px, st.py, 0, st.px, st.py, r);
    g.addColorStop(0,   "rgba(170, 138, 205, " + a.toFixed(3) + ")");
    g.addColorStop(0.5, "rgba(110, 85, 165,  " + (a * 0.45).toFixed(3) + ")");
    g.addColorStop(1,   "rgba(38, 24, 68, 0)");

    cx.save();
    cx.globalCompositeOperation = "lighter";
    cx.fillStyle = g;
    cx.beginPath();
    cx.arc(st.px, st.py, r, 0, 6.2832);
    cx.fill();
    cx.restore();
  }

  /* --------------- main loop --------------- */
  var rafId = null;

  function frame(now) {
    var dt = Math.min(0.05, (now - (st.lastFrame || now)) / 1000);
    st.lastFrame = now;

    // Scroll damp expiry
    if (st.dampOn && now >= st.dampExp) st.dampOn = false;

    // Flush bass queue
    flushBass();

    // Update ripples
    updateRips(now);

    var prog = st.disp / cH;

    /* ---- state transitions ---- */

    // DRAG -> snap check
    if (!st.snapped && (st.phase === PHASE.DOWN || st.phase === PHASE.DRAG)) {
      if (prog >= SNAP_THRESHOLD || st.vel >= VEL_THRESHOLD) {
        doSnap();
      }
    }

    // DRAG hum decay
    if (st.phase === PHASE.DRAG) {
      st.humVol = Math.max(HUM_FLOOR, st.humVol - HUM_DECAY_RATE * dt * 60);
      setHum(st.humVol);
    }

    // SNAP: brief tension, then YIELD
    if (st.phase === PHASE.SNAP) {
      var e1 = now - st.yieldT;
      if (e1 >= PRE_BLOOM_MS) {
        st.phase  = PHASE.YIELD;
        st.yieldT = now;
        st.bloomR = 18;
      } else {
        // Micro-pre-bloom — subtle warm hint
        st.bloomR    += dt * 60;
        st.bloomAlpha = 0.04 + e1 * 0.005;
      }
    }

    // YIELD: locked 250ms ease-out
    if (st.phase === PHASE.YIELD) {
      var el2  = (now - st.yieldT) / 1000;
      var t0   = Math.min(1, el2 / (BLOOM_DURATION / 1000));
      var eas3 = 1 - Math.pow(1 - t0, EASE_POWER);

      st.bloomAlpha = SNAP_BLOOM_PEAK * (1 - eas3 * 0.4);
      st.bloomR    = 18 + eas3 * 400;
      st.softness  = eas3 * 0.55;

      // Hum swells as gradient yields
      setHum(0.008 + eas3 * 0.13);

      // Secondary ripple at ~30% into yield
      if (eas3 > 0.28 && eas3 < 0.36 && st.rippleSeq < 3) {
        spawnRipple(st.px, st.py);
      }

      if (t0 >= 1) {
        st.phase  = PHASE.RESETTING;
        st.resetT = now;
        setHum(0.004);
      }
    }

    // RESETTING: 1.2s fade
    if (st.phase === PHASE.RESETTING) {
      var rp2 = Math.min(1, (now - st.resetT) / 1000 / 1.2);
      st.bloomAlpha = Math.max(0, SNAP_BLOOM_PEAK * 0.12 * (1 - rp2));
      st.softness   = Math.max(0, st.softness * (1 - dt * 2.8));
      st.tensGlow   = Math.max(0, st.tensGlow * (1 - dt * 3.5));

      if (rp2 >= 1) {
        st.phase      = PHASE.IDLE;
        st.bloomR     = 0;
        st.bloomAlpha = 0;
        st.softness   = 0;
        st.disp       = 0;
        st.vel        = 0;
        st.snapped    = false;
        st.tensGlow   = 0;
        st.ripples    = [];
        st.rippleSeq  = 0;
        st.dragPath   = [];

        if (st.queue.length) popQueue();
      }
    }

    // IDLE micro-hum
    if (st.phase === PHASE.IDLE && humOn) {
      st.microPhase += dt * 0.65;
      setHum(Math.max(0.001, HUM_IDLE + Math.sin(st.microPhase) * 0.003));
    }

    // RELEASED hum decay
    if (st.phase === PHASE.RELEASED) {
      var reP = Math.min(1, (now - st.yieldT) / 600);
      setHum(0.025 * (1 - reP));
    }

    /* ---- draw ---- */
    cx.clearRect(0, 0, cW, cH);
    drawBg();
    drawTensGlow();
    drawDragTrail();
    drawBloom();
    drawReleaseFade(now);
    drawRips();

    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);
})();
