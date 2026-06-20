// Kōri — Ice Fracture | game.js
// Slice 3: PhysicsLayer, FractureTrigger, FrostOverlay modules
// Raw drag physics -> fracture snap -> 120ms offset frost ease-out

(function () {
  "use strict";

  // ─── Canvas Setup ──────────────────────────────────────
  const canvas = document.getElementById("ice-canvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBaseLayer();
  }

  // ─── Palette ───────────────────────────────────────────
  const PALETTE = {
    paper: "#f5e6c8",    /* washi */
    ink: "#1a1a1a",      /* sumi */
    iceBlue: "#b8d4e3",
    cyanCrack: "#d4f1ff",
    gold: "#c9a84c",
    frostWhite: "rgba(255,255,255,0.7)",
    frostCyan: "rgba(184,212,227,0.4)",
  };

  // ─── Audio Stub (muted by default) ─────────────────────
  const AudioStub = {
    muted: true,
    fractureSound: null,
    frostSound: null,
    init() {
      try {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        this.ctx = ac;
      } catch (_) { /* no audio support */ }
    },
    playFracture(vol) {
      if (this.muted || !this.ctx) return;
      // Stub: sharp bell/chime via oscillator pulse
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(Math.min(vol, 0.3), this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    },
    playFrost() {
      if (this.muted || !this.ctx) return;
      // Stub: low wind/breath texture
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.02; /* soft noise */
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 200;
      src.connect(filter).connect(gain).connect(this.ctx.destination);
      src.start();
    },
    toggle() {
      this.muted = !this.muted;
      return this.muted;
    },
  };

  // ─── PhysicsLayer ──────────────────────────────────────
  const PhysicsLayer = {
    points: [],
    currentPoint: null,
    velocity: 0,
    pressure: 0,
    lastTime: 0,
    frictionCoeff: 0.82,

    reset() {
      this.points = [];
      this.currentPoint = null;
      this.velocity = 0;
      this.pressure = 0;
      this.lastTime = 0;
    },

    start(x, y, pressure) {
      this.reset();
      const pt = { x, y, time: performance.now(), pressure };
      this.currentPoint = pt;
      this.points.push(pt);
      this.lastTime = pt.time;
    },

    // Core physics sample — called each pointermove at 60fps
    move(x, y, pressure, now) {
      if (!this.currentPoint) return false;

      const prev = this.points[this.points.length - 1];
      const dt = (now || performance.now()) - this.lastTime;

      // Surface friction simulation — thumb resistance matches visual drag vector
      const rawDx = x - prev.x;
      const rawDy = y - prev.y;
      const rawDist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);

      // Friction dampens the perceived distance (simulates ice surface drag)
      const frictionFactor = Math.pow(this.frictionCoeff, dt / 16.67);
      const dampedDx = rawDx * (1 - frictionFactor * 0.3);
      const dampedDy = rawDy * (1 - frictionFactor * 0.3);
      const dampedDist = Math.sqrt(dampedDx * dampedDx + dampedDy * dampedDy);

      // Velocity sample (px/ms) — no input buffering or smoothing
      this.velocity = dampedDist / Math.max(dt, 1);
      this.pressure = pressure || 0;

      const pt = {
        x: prev.x + dampedDx,
        y: prev.y + dampedDy,
        time: this.lastTime + dt,
        pressure,
        velocity: this.velocity,
        dist: dampedDist,
      };

      this.currentPoint = pt;
      this.points.push(pt);
      this.lastTime = pt.time;

      return true;
    },

    end() {
      this.currentPoint = null;
    },

    // Check if velocity/pressure exceeds fracture threshold
    isFractureReady(threshold) {
      const th = threshold || 4.0; /* px/ms */
      return this.velocity > th && this.points.length > 3;
    },

    getPeakVelocity() {
      let max = 0;
      for (const p of this.points) {
        if (p.velocity > max) max = p.velocity;
      }
      return max;
    },
  };

  // ─── FractureTrigger ───────────────────────────────────
  const FRACTURE_THRESHOLD = 3.5; /* px/ms — tunable */

  const FractureTrigger = {
    fractures: [],       /* array of crack segments */
    triggeredAt: null,   /* timestamp of current fracture t=0 */
    pendingFrost: false, /* frost spawned via timer? */

    reset() {
      this.fractures = [];
      this.triggeredAt = null;
      this.pendingFrost = false;
    },

    // Evaluate raw physics state; return true if a new fracture fires
    evaluate() {
      if (PhysicsLayer.isFractureReady(FRACTURE_THRESHOLD)) {
        const pts = PhysicsLayer.points;
        if (pts.length < 2) return false;

        /* Take the last segment that crossed threshold */
        const crack = [];
        for (let i = pts.length - 1; i >= 0; i--) {
          if (pts[i].velocity <= FRACTURE_THRESHOLD && i > 0) break;
          crack.unshift(pts[i]);
        }

        if (crack.length < 2) return false;

        const intensity = Math.min(PhysicsLayer.getPeakVelocity() / 10, 1);

        this.fractures.push({
          segments: crack,
          time: performance.now(),
          intensity,
          frostSpawned: false,
          fadeAlpha: 1,
          fadeOut: false,
        });

        this.triggeredAt = performance.now();
        this.pendingFrost = false;

        /* Audio snap */
        AudioStub.playFracture(intensity);

        return true;
      }
      return false;
    },

    // Check 120ms offset window for frost spawn
    processPostFracture(now) {
      const recent = this.fractures[this.fractures.length - 1];
      if (!recent || recent.frostSpawned) return;

      /* HARD CONSTRAINT: 120ms non-negotiable offset */
      if (now - recent.time >= FROST_BLUR_OFFSET_MS) {
        FrostOverlay.spawnAlongPath(recent.segments, recent.intensity);
        recent.frostSpawned = true;
      }
    },

    // On pointer up: begin fade for lingering traces
    release() {
      for (const f of this.fractures) {
        f.fadeOut = true;
      }
    },
  };

  // ─── FrostOverlay ──────────────────────────────────────
  const FROST_BLUR_OFFSET_MS = 120;
  const FROST_EASE_DURATION = 300; /* ms */

  // Ease-out cubic-bezier(0.25, 1, 0.5, 1) approximation
  function easeOutCustom(t) {
    return 1 - Math.pow(1 - t, 2.5);
  }

  const FrostOverlay = {
    particles: [],     /* frost particle descriptors */
    globalBlur: 0,     /* active blur radius along cracks */

    reset() {
      this.particles = [];
      this.globalBlur = 0;
    },

    // Spawn frost particles along a crack path at t=120ms post-fracture
    spawnAlongPath(segments, intensity) {
      AudioStub.playFrost();

      for (let i = 0; i < segments.length; i++) {
        const pt = segments[i];
        /* Density scales with intensity */
        const count = Math.floor(3 + intensity * 8);

        for (let j = 0; j < count; j++) {
          const angle = Math.random() * Math.PI * 2;
          const spread = 4 + Math.random() * 20 * intensity;

          this.particles.push({
            x: pt.x + Math.cos(angle) * spread,
            y: pt.y + Math.sin(angle) * spread,
            size: 1 + Math.random() * 3 * intensity,
            alpha: 0,            /* starts at 0, eases in */
            targetAlpha: (0.4 + Math.random() * 0.6) * intensity,
            spawnTime: performance.now(),
            lingerTime: 1500 + Math.random() * 2000,
            driftX: (Math.random() - 0.5) * 0.3,
            driftY: (Math.random() - 0.5) * 0.3,
            color: Math.random() > 0.5 ? PALETTE.frostWhite : PALETTE.frostCyan,
          });
        }
      }

      /* Global frost blur along crack lines */
      this.globalBlur = 2 + intensity * 6;
      this.blurStartTime = performance.now();
    },

    // Update: ease particles into view over FROST_EASE_DURATION ms
    update(now) {
      for (const p of this.particles) {
        const elapsed = now - p.spawnTime;
        if (elapsed > p.lingerTime) {
          /* Slow fade out at end of linger */
          const fadeElapsed = elapsed - p.lingerTime;
          p.alpha = p.targetAlpha * (1 - Math.min(fadeElapsed / 800, 1));
        } else if (elapsed > FROST_EASE_DURATION) {
          p.alpha = p.targetAlpha;
        } else {
          const t = elapsed / FROST_EASE_DURATION;
          p.alpha = p.targetAlpha * easeOutCustom(t);
        }

        /* Gentle drift */
        p.x += p.driftX;
        p.y += p.driftY;
      }

      /* Decay blur over time */
      if (this.blurStartTime) {
        const elapsed = now - this.blurStartTime;
        if (elapsed > FROST_EASE_DURATION + 1500) {
          this.globalBlur *= 0.98;
        }
      }

      /* Remove fully faded particles */
      this.particles = this.particles.filter(p => p.alpha > 0.01);
    },

    draw(ctx) {
      for (const p of this.particles) {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };

  // ─── Base Layer (Ukiyo-e Woodblock) ────────────────────
  function drawBaseLayer() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    /* Washi paper background */
    ctx.fillStyle = PALETTE.paper;
    ctx.fillRect(0, 0, w, h);

    /* Subtle texture grain */
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const s = Math.random() * 2;
      ctx.fillStyle = Math.random() > 0.5 ? "#000" : "#8b7d5e";
      ctx.fillRect(x, y, s, s);
    }
    ctx.globalAlpha = 1;

    /* Sumi ink border with woodblock feel */
    const margin = 20;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

    /* Inner accent line — muted gold */
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(margin + 8, margin + 8, w - (margin + 8) * 2, h - (margin + 8) * 2);
    ctx.globalAlpha = 1;

    /* Subtle ice surface shimmer overlay */
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(184,212,227,0.08)");
    grad.addColorStop(0.5, "rgba(184,212,227,0.03)");
    grad.addColorStop(1, "rgba(184,212,227,0.08)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    /* Decorative ink marks — sumi wash suggestion */
    ctx.globalAlpha = 0.06;
    const cx = w / 2, cy = h / 2;
    for (let r = 80; r < Math.max(w, h); r += 70) {
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI * 0.3, Math.PI * 0.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    /* Prompt text */
    ctx.font = `${Math.max(14, w * 0.025)}px 'Hiragino Mincho ProN', 'Yu Mincho', serif`;
    ctx.fillStyle = PALETTE.ink;
    ctx.globalAlpha = 0.35;
    ctx.textAlign = "center";
    ctx.fillText("drag your finger to fracture the ice", cx, h - 60);
    ctx.globalAlpha = 1;
  }

  // ─── Crack Rendering ───────────────────────────────────
  function drawCracks(ctx) {
    for (const f of FractureTrigger.fractures) {
      if (f.segments.length < 2) continue;

      const age = performance.now() - f.time;
      let alpha = f.fadeOut ? Math.max(0, f.fadeAlpha) : 1;

      /* Branching fracture — secondary cracks */
      const width = 1 + f.intensity * 3;

      /* Primary crack line — sharp white/cyan, zero initial blur */
      ctx.save();
      ctx.globalAlpha = alpha;

      /* Outer glow (cyan) */
      ctx.strokeStyle = PALETTE.cyanCrack;
      ctx.lineWidth = width + 4;
      ctx.globalAlpha = alpha * 0.3;
      drawSmoothPath(ctx, f.segments);
      ctx.stroke();

      /* Core crack — bright white */
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = alpha;
      drawSmoothPath(ctx, f.segments);
      ctx.stroke();

      /* Branch sparks */
      for (let i = 0; i < f.segments.length; i += 3) {
        const pt = f.segments[i];
        const next = f.segments[Math.min(i + 1, f.segments.length - 1)];
        const angle = Math.atan2(next.y - pt.y, next.x - pt.x) + (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.8);
        const branchLen = 8 + Math.random() * 25 * f.intensity;

        ctx.strokeStyle = PALETTE.cyanCrack;
        ctx.lineWidth = width * 0.4;
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(
          pt.x + Math.cos(angle) * branchLen,
          pt.y + Math.sin(angle) * branchLen
        );
        ctx.stroke();
      }

      /* Frost blur along crack after 120ms offset */
      if (f.frostSpawned && FrostOverlay.globalBlur > 0.5) {
        ctx.shadowColor = PALETTE.iceBlue;
        ctx.shadowBlur = FrostOverlay.globalBlur * alpha;
        drawSmoothPath(ctx, f.segments);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      /* Slow fade-out after release */
      if (f.fadeOut) {
        f.fadeAlpha -= 0.004;
      }

      ctx.restore();
    }
  }

  function drawSmoothPath(ctx, segments) {
    if (segments.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(segments[0].x, segments[0].y);

    for (let i = 1; i < segments.length - 1; i++) {
      const xc = (segments[i].x + segments[i + 1].x) / 2;
      const yc = (segments[i].y + segments[i + 1].y) / 2;
      ctx.quadraticCurveTo(segments[i].x, segments[i].y, xc, yc);
    }

    const last = segments[segments.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  // ─── Active Drag Trace ─────────────────────────────────
  function drawDragTrace() {
    if (PhysicsLayer.points.length < 2) return;

    ctx.save();
    ctx.globalAlpha = 0.15 + Math.min(PhysicsLayer.velocity / 10, 0.3);
    ctx.strokeStyle = PALETTE.iceBlue;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    drawSmoothPath(ctx, PhysicsLayer.points);
    ctx.stroke();

    /* Tip indicator — shows active pressure */
    const tip = PhysicsLayer.currentPoint || PhysicsLayer.points[PhysicsLayer.points.length - 1];
    ctx.globalAlpha = 0.2 + Math.min(PhysicsLayer.pressure, 0.5);
    ctx.strokeStyle = PALETTE.cyanCrack;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 6 + PhysicsLayer.pressure * 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // ─── Main Render Loop (requestAnimationFrame, 60fps) ──
  let lastFrame = performance.now();

  function renderLoop(now) {
    const dt = now - lastFrame;
    lastFrame = now;

    /* Clear and redraw base */
    drawBaseLayer();

    /* Evaluate fracture triggers from current drag state */
    FractureTrigger.evaluate();

    /* Process 120ms frost offset window */
    FractureTrigger.processPostFracture(now);

    /* Update frost overlay with eased-in particles */
    FrostOverlay.update(now);

    /* Compositing layers: cracks -> drag trace -> frost */
    drawCracks(ctx);
    drawDragTrace();
    FrostOverlay.draw(ctx);

    requestAnimationFrame(renderLoop);
  }

  // ─── Pointer Events (native, no buffering) ─────────────
  canvas.addEventListener("pointerdown", e => {
    e.preventDefault();
    AudioStub.init(); /* lazy-init audio context on first gesture */
    PhysicsLayer.start(e.clientX, e.clientY, e.pressure || 0);
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", e => {
    e.preventDefault();
    PhysicsLayer.move(e.clientX, e.clientY, e.pressure || 0, performance.now());
  }, { passive: false });

  canvas.addEventListener("pointerup", e => {
    e.preventDefault();
    PhysicsLayer.end();
    FractureTrigger.release();
  });

  canvas.addEventListener("pointercancel", () => {
    PhysicsLayer.end();
    FractureTrigger.release();
  });

  // ─── Init ──────────────────────────────────────────────
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(renderLoop);

  /* Debug: press 'm' to toggle audio */
  window.addEventListener("keydown", e => {
    if (e.key === "m" || e.key === "M") {
      AudioStub.toggle();
    }
    /* Press 'c' to clear all cracks */
    if (e.key === "c" || e.key === "C") {
      FractureTrigger.reset();
      FrostOverlay.reset();
      PhysicsLayer.reset();
      drawBaseLayer();
    }
  });

})();
