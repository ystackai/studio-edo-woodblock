// ---------------------------------------------------------------------------
//  Ice Fracture Scheduler  —  feat/ice-fracture-90
//
//  Core loop
//    1. Pointer down, drag builds tension → alpha curve ease-in
//    2. At alpha >= 0.70, hard 90 ms hold (no easing, no drift)
//    3. At hold end, sharp crack + AudioContext snap aligned to rAF tick
//    4. Instant state reset for replayability
// ---------------------------------------------------------------------------

(() => {
  "use strict";

  // ─── Canvas Setup ────────────────────────────────────────────────────────
  const canvas = document.getElementById("frost-canvas");
  const ctx = canvas.getContext("2d");

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth  * devicePixelRatio;
    H = canvas.height = window.innerHeight * devicePixelRatio;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // ─── State Machine ──────────────────────────────────────────────────────
  const STATE = {
    IDLE: "idle",
    DRAGGING: "dragging",
    HESITATION: "hesitation",
    FRACTURE: "fracture",
    RESET: "reset",
  };

  let state = STATE.IDLE;
  let pointerDown = false;

  // Drag tracking
  let startX = 0, startY = 0;
  let curX   = 0, curY   = 0;
  let lastX  = 0, lastY  = 0;
  let dragDist = 0;
  let velocity = 0;
  let lastVTime = 0;
  let lastXForVel = 0, lastYForVel = 0;

  // Alpha curve
  const ALPHA_THRESHOLD = 0.70;
  let currentAlpha = 0;

  // Hesitation timer
  const HESITATION_MS = 90;
  let hesitStart = 0;
  let hesitTime  = 0;

  // Fracture lines
  let crackLines = [];
  let crackOpacity = 0;
  const CRACK_DURATION = 350;
  let fractureTime = 0;

  // ─── Audio ──────────────────────────────────────────────────────────────
  const AC = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  // Procedural ice snap: short, high-frequency burst, peak at -6 dB
  function playIceSnap() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    // White noise burst filtered high
    const bufLen = audioCtx.sampleRate * 0.06;
    const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buf;

    const hp = audioCtx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 4200;

    const peak = audioCtx.createGain();
    peak.gain.value = 0.5;  // ~-6 dB

    src.connect(hp).connect(peak).connect(audioCtx.destination);
    src.start(t);

    // Crystalline overtone
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 7600;
    const oGain = audioCtx.createGain();
    oGain.gain.setValueAtTime(0.12, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(oGain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // ─── Alpha Curve ────────────────────────────────────────────────────────
  function easeOutAlpha(t) {
    return 1 - Math.pow(1 - t, 2.4);
  }

  const MAX_DRAG_PX = 260;

  // ─── Crack Generation ───────────────────────────────────────────────────
  function generateCrack(fx, fy) {
    const lines = [];
    const numBranches = 4 + Math.floor(Math.random() * 4);

    for (let b = 0; b < numBranches; b++) {
      let angle = (Math.PI * 2 * b) / numBranches + (Math.random() - 0.5) * 0.6;
      let cx = fx, cy = fy;
      const segLen = 28 + Math.random() * 55;
      const numSegs = 5 + Math.floor(Math.random() * 6);
      const pts = [{ x: cx, y: cy }];

      for (let s = 0; s < numSegs; s++) {
        angle += (Math.random() - 0.5) * 0.45;
        const len = segLen * (1 - s * 0.07) * (0.7 + Math.random() * 0.6);
        cx += Math.cos(angle) * len;
        cy += Math.sin(angle) * len;
        pts.push({ x: cx, y: cy });
      }
      lines.push(pts);
    }
    return lines;
  }

  // ─── Rendering ──────────────────────────────────────────────────────────
  function drawFrostBase() {
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, "#E8F0F8");
    grd.addColorStop(1, "#D4E6F2");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  function drawDragTension() {
    if (dragDist < 3) return;
    const t = Math.min(dragDist / MAX_DRAG_PX, 1);
    const a = easeOutAlpha(t);
    currentAlpha = Math.min(a, ALPHA_THRESHOLD + 0.001);

    // Tint shift
    const c = ctx.createLinearGradient(startX, startY, curX, curY);
    c.addColorStop(0, `rgba(197, 216, 232, ${currentAlpha * 0.6})`);
    c.addColorStop(1, `rgba(170, 200, 228, ${currentAlpha * 0.9})`);

    ctx.save();
    ctx.lineWidth = 22 * devicePixelRatio;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = c;
    // Draw segments for sharpness
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(lastX, lastY);
    ctx.lineTo(curX, curY);
    ctx.stroke();
    ctx.restore();
  }

  function drawCrack() {
    if (!crackLines.length) return;
    const elapsed = performance.now() - fractureTime;
    const t = Math.min(elapsed / CRACK_DURATION, 1);

    // Fade in sharply
    const fade = Math.min(t * 6, 1);
    const a = t < 0.75 ? fade : fade * (1 - (t - 0.75) * 4);

    ctx.save();
    ctx.strokeStyle = `rgba(240, 250, 255, ${a})`;
    ctx.lineWidth = 2.4 * devicePixelRatio;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Glow layer (sharp, no blur)
    ctx.shadowColor = `rgba(180, 220, 255, ${a * 0.5})`;
    ctx.shadowBlur = 4 * devicePixelRatio;

    for (const pts of crackLines) {
      // Progressive reveal
      const revealCount = Math.floor(pts.length * t);
      if (revealCount < 2) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < revealCount; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawUnderlay() {
    // Dark revealed layer beneath fractured ice
    const elapsed = performance.now() - fractureTime;
    const t = Math.min(elapsed / CRACK_DURATION, 1);
    if (t >= 0.7) {
      const reveal = (t - 0.7) / 0.3;
      ctx.save();
      ctx.fillStyle = `rgba(6, 10, 16, ${reveal * 0.85})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  // ─── Main Loop ──────────────────────────────────────────────────────────
  let frameId = null;

  function loop(now) {
    frameId = requestAnimationFrame(loop);

    switch (state) {
      case STATE.DRAGGING:
        drawFrostBase();
        drawDragTension();

        // Velocity tracking
        if (lastVTime) {
          const dt = now - lastVTime;
          if (dt > 0) {
            const ddx = curX - lastXForVel;
            const ddy = curY - lastYForVel;
            velocity = Math.sqrt(ddx * ddx + ddy * ddy) / dt * 16;
          }
        }
        lastVTime = now;
        lastXForVel = curX;
        lastYForVel = curY;

        // Trigger hesitation at threshold
        if (currentAlpha >= ALPHA_THRESHOLD) {
          state = STATE.HESITATION;
          hesitStart = now;
          hesitTime = 0;
          console.debug(`[ice] hesitation start @ ${now.toFixed(1)} ms, alpha=${(currentAlpha * 100).toFixed(1)}%`);
        }
        break;

      case STATE.HESITATION:
        drawFrostBase();
        drawDragTension();
        hesitTime = now - hesitStart;

        // Dev log
        if (Math.floor(hesitTime / 15) !== Math.floor((hesitTime - 16.67) / 15)) {
          console.debug(`[ice] hesitation tick +${hesitTime.toFixed(1)}ms`);
        }

        // 90ms hard check
        if (hesitTime >= HESITATION_MS) {
          const drift = hesitTime - HESITATION_MS;
          if (drift > 20) {
            console.warn(`[ice] timing drift ${drift.toFixed(1)}ms, clamped to 90`);
          }

          // Trigger fracture
          state = STATE.FRACTURE;
          fractureTime = now;
          crackLines = generateCrack(curX, curY);
          playIceSnap();
          console.debug(`[ice] fracture @ ${now.toFixed(1)}ms, total hold=${hesitTime.toFixed(1)}ms`);
        }
        break;

      case STATE.FRACTURE:
        drawFrostBase();
        drawDragTension();
        drawUnderlay();
        drawCrack();

        {
          const elapsed = now - fractureTime;
          if (elapsed >= CRACK_DURATION + 40) {
            state = STATE.IDLE;
            crackLines = [];
            resetState();
            console.debug("[ice] reset complete, ready for replay");
          }
        }
        break;

      case STATE.IDLE:
      default:
        drawFrostBase();
        break;
    }
  }

  // ─── Pointer Handlers ───────────────────────────────────────────────────
  function resetState() {
    dragDist = 0;
    currentAlpha = 0;
    velocity = 0;
    lastVTime = 0;
  }

  function onPointerDown(e) {
    if (state === STATE.FRACTURE) return;
    ensureAudio();
    const p = getPointerPos(e);
    startX = lastX = curX = p.x;
    startY = lastY = curY = p.y;
    lastXForVel = p.x;
    lastYForVel = p.y;
    resetState();
    state = STATE.DRAGGING;
    pointerDown = true;
  }

  function onPointerMove(e) {
    if (!pointerDown) return;
    if (state === STATE.HESITATION) return; // hold during hesitation
    const p = getPointerPos(e);
    lastX = curX;
    lastY = curY;
    curX = p.x;
    curY = p.y;
    const dx = p.x - startX;
    const dy = p.y - startY;
    dragDist += Math.sqrt(
      (p.x - lastX) * (p.x - lastX) + (p.y - lastY) * (p.y - lastY)
    );
  }

  function onPointerUp() {
    if (!pointerDown) return;
    pointerDown = false;
    if (state === STATE.DRAGGING) {
      resetState();
      state = STATE.IDLE;
    }
  }

  function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if (e.touches && e.touches.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener("mousedown", onPointerDown, { passive: false });
  canvas.addEventListener("mousemove", onPointerMove, { passive: false });
  canvas.addEventListener("mouseup", onPointerUp, { passive: true });
  canvas.addEventListener("mouseleave", onPointerUp, { passive: true });
  canvas.addEventListener("touchstart", e => { e.preventDefault(); onPointerDown(e); }, { passive: false });
  canvas.addEventListener("touchmove",  e => { e.preventDefault(); onPointerMove(e); }, { passive: false });
  canvas.addEventListener("touchend",   e => { e.preventDefault(); onPointerUp(); }, { passive: false });

  // ─── Kickoff ────────────────────────────────────────────────────────────
  requestAnimationFrame(loop);
})();
