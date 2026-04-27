(function () {
  "use strict";

  // ─── State ───────────────────────────────────────────────
  const STALL_THRESHOLD   = 0.45;
  const RIPPLE_DURATION   = 2.5;
  const RESET_DURATION    = 4.0;
  const RIPPLE_MAX_ALPHA  = 0.12;

  let state = "idle"; // idle | dragging | stalled | decaying | resetting
  let dragStartY      = 0;
  let currentY        = 0;
  let progress        = 0;
  let stallTime       = 0;
  let resetTimer      = 0;

  // ─── Canvas ──────────────────────────────────────────────
  const canvas = document.getElementById("canvas");
  const ctx    = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  // ─── Current Lines (idle drift) ─────────────────────────
  const currentLines = [];
  const NUM_LINES    = 18;

  for (let i = 0; i < NUM_LINES; i++) {
    currentLines.push({
      y:  Math.random() * 1.2 - 0.1,   // 0-1 fraction of screen
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.04, // slow drift
      alpha: 0.03 + Math.random() * 0.04,
      width: 0.5 + Math.random() * 1.0,
    });
  }

  // ─── Ripple System ───────────────────────────────────────
  const ripples = [];

  function spawnRipple(cx, cy) {
    ripples.push({
      cx, cy,
      t: 0,           // 0..1 progress through RIPPLE_DURATION
      birth: performance.now(),
    });
  }

  // ─── Audio Engine ────────────────────────────────────────
  let audioCtx  = null;
  let droneGain = null;
  let droneOsc  = null;

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Sub-bass drone: <150Hz, barely perceptible
    droneOsc  = audioCtx.createOscillator();
    droneGain = audioCtx.createGain();
    droneOsc.type   = "sine";
    droneOsc.frequency.value = 55; // ~A1, deep but not 20Hz infrasonic
    droneGain.gain.value = 0.04;
    droneOsc.connect(droneGain);
    droneGain.connect(audioCtx.destination);
    droneOsc.start();
  }

  function stopDrone() {
    if (!droneGain) return;
    const now = audioCtx.currentTime;
    droneGain.gain.cancelScheduledValues(now);
    droneGain.gain.setValueAtTime(droneGain.gain.value, now);
    droneGain.gain.linearRampToValueAtTime(0, now + 0.15);
  }

  function restartDrone() {
    if (!droneGain) return;
    const now = audioCtx.currentTime;
    droneGain.gain.cancelScheduledValues(now);
    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.04, now + 1.0);
  }

  function playImpactGroan() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // Displacement groan: low-frequency, no transients
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const masterGain = audioCtx.createGain();
    const lpFilter  = audioCtx.createBiquadFilter();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(60, now);
    osc1.frequency.linearRampToValueAtTime(25, now + 1.7);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(42, now);
    osc2.frequency.linearRampToValueAtTime(18, now + 1.7);

    lpFilter.type = "lowpass";
    lpFilter.frequency.setValueAtTime(180, now);
    lpFilter.Q.value = 0.5;

    // 800ms peak, 1.7s tail — no percussive attack
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.18, now + 0.2);
    masterGain.gain.setValueAtTime(0.18, now + 0.8);
    masterGain.gain.linearRampToValueAtTime(0, now + 2.5);

    osc1.connect(lpFilter);
    osc2.connect(lpFilter);
    lpFilter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.5);
    osc2.stop(now + 2.5);
  }

  // ─── Haptics ─────────────────────────────────────────────
  function fireHapticPulse() {
    if (navigator.vibrate) {
      // Sharp high-amplitude pulse, decaying over 120ms
      navigator.vibrate([80, 30, 40]);
    }
  }

  function fireHapticSettle() {
    if (navigator.vibrate) {
      navigator.vibrate([20, 60, 10]);
    }
  }

  // ─── Input Handling ─────────────────────────────────────
  let isDragging = false;

  function onPointerDown(e) {
    if (state === "stalled" || state === "decaying" || state === "resetting") return;
    initAudio();
    const touch = e.touches ? e.touches[0] : e;
    dragStartY = touch.clientY;
    currentY   = dragStartY;
    progress   = 0;
    isDragging = true;
    state = "dragging";
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    currentY = touch.clientY;
    progress = (currentY / H);

    // Check stall at exactly 45%
    if (progress >= STALL_THRESHOLD) {
      isDragging   = false;
      state        = "stalled";
      stallTime    = performance.now();
      dragStartY   = STALL_THRESHOLD * H;
      currentY     = dragStartY;
      progress     = STALL_THRESHOLD;

      // Trigger everything
      spawnRipple(W / 2, currentY);
      stopDrone();
      playImpactGroan();
      fireHapticPulse();

      // Transition to decay
      setTimeout(() => {
        state = "decaying";
        fireHapticSettle();
      }, 120);

      // Auto-reset
      setTimeout(() => {
        ripples.length = 0;
        state = "idle";
        restartDrone();
      }, RESET_DURATION * 1000);
    }
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    state = "idle";
  }

  canvas.addEventListener("touchstart", onPointerDown, { passive: false });
  canvas.addEventListener("touchmove", onPointerMove, { passive: false });
  canvas.addEventListener("touchend", onPointerUp);
  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mousemove", onPointerMove);
  canvas.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("mouseleave", onPointerUp);

  // ─── Rendering ───────────────────────────────────────────

  // Warm gradient: ochre → amber → deep indigo
  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#c4956a");   // warm ochre
    grad.addColorStop(0.3, "#a87848");  // amber-brown
    grad.addColorStop(0.6, "#5a4370");  // transition to purple
    grad.addColorStop(1, "#2a1f3d");    // deep indigo
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawCurrentLines(t) {
    for (const line of currentLines) {
      const yy = (line.y + Math.sin(t * line.speed * 0.001 + line.phase) * 0.03) * H;
      const waveX = Math.sin(t * 0.0005 + line.phase) * 30;

      ctx.beginPath();
      ctx.moveTo(-50 + waveX, yy);

      const cp1x = W * 0.25 + Math.sin(t * 0.0003 + line.phase) * 40;
      const cp1y = yy - 15;
      const cp2x = W * 0.75 + Math.cos(t * 0.0004 + line.phase) * 35;
      const cp2y = yy + 12;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, W + 50 + waveX, yy);
      ctx.strokeStyle = `rgba(240, 220, 190, ${line.alpha})`;
      ctx.lineWidth   = line.width;
      ctx.stroke();
    }
  }

  function drawDragCursor() {
    if (state !== "dragging") return;
    const cx = W / 2;
    const cy = currentY;

    // Subtle crosshair / current vector marker
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(240, 230, 210, 0.25)";
    ctx.fill();

    // Drag trail — short curve from top to current position
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.quadraticCurveTo(cx + Math.sin(performance.now() * 0.002) * 15, cy * 0.5, cx, cy);
    ctx.strokeStyle = "rgba(240, 230, 210, 0.08)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawRipples(now) {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      const elapsed = (now - r.birth) / 1000;
      r.t = elapsed / RIPPLE_DURATION;

      if (r.t >= 1) {
        ripples.splice(i, 1);
        continue;
      }

      // Radius expands over duration
      const maxRadius = Math.max(W, H) * 0.8;
      const radius = maxRadius * easeOutQuad(r.t);

      // Alpha: peaks at 0.12 early, then decays to 0
      const alpha = RIPPLE_MAX_ALPHA * (1 - r.t);

      // Ink-bleed radial gradient
      const grad = ctx.createRadialGradient(r.cx, r.cy, 0, r.cx, r.cy, radius);
      grad.addColorStop(0, `rgba(210, 190, 160, ${alpha})`);
      grad.addColorStop(0.3, `rgba(180, 155, 125, ${alpha * 0.7})`);
      grad.addColorStop(0.7, `rgba(150, 130, 110, ${alpha * 0.3})`);
      grad.addColorStop(1, `rgba(120, 100, 80, 0)`);

      ctx.beginPath();
      ctx.arc(r.cx, r.cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Secondary ring — softer, larger, more diffused
      const ringRadius = maxRadius * easeOutQuad(r.t) * 1.3;
      const ringAlpha  = alpha * 0.4;
      const grad2 = ctx.createRadialGradient(r.cx, r.cy, ringRadius * 0.6, r.cx, r.cy, ringRadius);
      grad2.addColorStop(0, `rgba(200, 180, 150, 0)`);
      grad2.addColorStop(0.7, `rgba(200, 180, 150, ${ringAlpha})`);
      grad2.addColorStop(1, `rgba(180, 160, 130, 0)`);

      ctx.beginPath();
      ctx.arc(r.cx, r.cy, ringRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad2;
      ctx.fill();
    }
  }

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  // ─── Idle Particles ──────────────────────────────────────
  const idleParticles = [];
  const NUM_PARTICLES = 30;
  for (let i = 0; i < NUM_PARTICLES; i++) {
    idleParticles.push({
      x: Math.random(),
      y: Math.random(),
      speed: 0.003 + Math.random() * 0.008,
      size: 0.5 + Math.random() * 1.5,
      alpha: 0.02 + Math.random() * 0.04,
    });
  }

  function drawIdleParticles(t) {
    if (state !== "idle" && state !== "dragging") return;
    for (const p of idleParticles) {
      const px = p.x * W + Math.sin(t * p.speed * 0.3 + p.x * 100) * 8;
      const py = ((p.y + t * p.speed * 0.01) % 1) * H;

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230, 215, 190, ${p.alpha})`;
      ctx.fill();
    }
  }

  // ─── Progress Indicator ──────────────────────────────────
  function drawProgressBar() {
    if (state !== "dragging") return;
    // Thin vertical line on the left edge showing progress
    const barX = 12;
    const barH = H * 0.8;
    const barY = (H - barH) / 2;

    // Track
    ctx.fillStyle = "rgba(240, 230, 210, 0.06)";
    ctx.fillRect(barX, barY, 2, barH);

    // Fill
    ctx.fillStyle = "rgba(240, 230, 210, 0.2)";
    ctx.fillRect(barX, barY, 2, barH * progress);

    // Stall threshold marker
    const markerY = barY + barH * STALL_THRESHOLD;
    ctx.fillStyle = "rgba(240, 200, 160, 0.35)";
    ctx.fillRect(barX - 1, markerY - 1, 4, 3);
  }

  // ─── Main Loop ───────────────────────────────────────────
  let lastTime = 0;

  function frame(time) {
    const dt = time - lastTime;
    lastTime = time;

    // Clear and draw layers
    drawBackground();
    drawCurrentLines(time);
    drawIdleParticles(time);
    drawDragCursor();
    drawRipples(time);
    drawProgressBar();

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
