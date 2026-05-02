const Render = (() => {
  const C = {
    paper: '#F0E9D8',
    sky: '#C8D0DB',
    moon: '#F0F0E8',
    indigo: '#2B3A67',
    darkIndigo: '#1B2A4A',
    amber: '#D4A04A',
    reed: '#5A7A5A',
    wood: '#6B5845',
    black: '#2A3048',
    water: '#8A9CB0',
    highlight: '#E8E2D0',
    poolIndigo: '#162040',
  };

  let W = 0, H = 0;
  let tideFront = -1;
  let tideProgress = 0;
  let pressed = false;
  let pressure = 0;
  let lastX = 0, lastY = 0;
  let moonX, moonY, moonR, waterline;
  let boats = [], reeds = [], bridgePosts = [], lanternXs = [];
  let clock = 0;
  let frameCount = 0;

  // ── Touch micro-interaction state ──
  let touchX = 0, touchY = 0;
  let touchAlpha = 0;
  let dragTrail = [];
  let releaseRipple = null;

  // Settle state
  let settling = false;
  let settleProgress = 0;
  let settleBloom = 0;
  let tideSettleExtra = 0;
  let settled = false;

  // Reset state
  let resetting = false;
  let resetProgress = 0;
  let resetStartTideFront = 0;
  let resetStartTideProgress = 0;

  // ── Performance: offscreen buffers ──
  let pigmentMap = null;
  let pigmentCtx = null;
  let grainPattern = null;
  let tideFrontVel = 0;
  let initialTideFront = -1;
  let _staticBg = null;       // offscreen canvas for paper+sky (truly static)
  let _grainCanvas = null;    // pre-filled grain pattern canvas
  let _dirty = true;          // dirty flag: forces redraw when true
  let _prevTideProgress = 0;  // last frame's tideProgress for change detection
  let _prevTideFront = -1;
  let _prevPressure = 0;

  function init(canvas) {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    moonX = W * .8;
    moonY = H * .12;
    moonR = Math.min(W, H) * .055;
    waterline = H * .48;

    pigmentMap = document.createElement('canvas');
    pigmentMap.width = W;
    pigmentMap.height = H;
    pigmentCtx = pigmentMap.getContext('2d');

    _bakeGrainPattern();

    boats = [
      { x: W * .18, y: waterline + H * .12, w: W * .12, h: H * .04, tilt: -.03 },
      { x: W * .62, y: waterline + H * .06, w: W * .09, h: H * .035, tilt: .04 },
      { x: W * .38, y: waterline + H * .24, w: W * .1, h: H * .03, tilt: -.01 },
    ];

    reeds = [];
    const zones = [
      { cx: W * .06, n: 6, spread: .05 },
      { cx: W * .94, n: 6, spread: .05 },
      { cx: W * .22, n: 4, spread: .03 },
      { cx: W * .78, n: 3, spread: .02 },
    ];
    zones.forEach(z => {
      for (let i = 0; i < z.n; i++) {
        reeds.push({
          x: z.cx + (Math.random() - .5) * z.spread * W,
          baseY: waterline + H * (.04 + Math.random() * .24),
          h: H * (.1 + Math.random() * .16),
          lean: (Math.random() - .5) * .35,
          phase: Math.random() * Math.PI * 2,
          bladeCount: 2 + Math.floor(Math.random() * 3),
        });
      }
    });

    bridgePosts = [
      { x: W * .46, y1: waterline - H * .035, y2: waterline + H * .18 },
      { x: W * .485, y1: waterline - H * .03, y2: waterline + H * .17 },
      { x: W * .515, y1: waterline - H * .028, y2: waterline + H * .16 },
      { x: W * .54, y1: waterline - H * .032, y2: waterline + H * .175 },
    ];
    lanternXs = [bridgePosts[1].x, bridgePosts[2].x];

    tideFront = -1;
    tideProgress = 0;
    pressure = 0;
    _prevTideProgress = 0;
    _prevTideFront = -1;
    _prevPressure = 0;

    // ── Bake static background: paper + sky ──
    _bakeStaticBg();
  }

  // ─── Bake truly static layers (paper + sky) to offscreen canvas ───
  function _bakeStaticBg() {
    _staticBg = document.createElement('canvas');
    _staticBg.width = W;
    _staticBg.height = H;
    const c = _staticBg.getContext('2d');

    // Paper base + warm variation
    c.fillStyle = C.paper;
    c.fillRect(0, 0, W, H);
    {
      const warm = c.createRadialGradient(W * .35, H * .35, 0, W * .5, H * .5, W * .7);
      warm.addColorStop(0, 'rgba(245,240,228,.3)');
      warm.addColorStop(1, 'rgba(230,224,210,.1)');
      c.fillStyle = warm;
      c.fillRect(0, 0, W, H);
    }

    // Sky (static: no tide/clock dependency)
    c.fillStyle = '#B5BFCB';
    c.fillRect(0, 0, W, waterline);
    c.fillStyle = 'rgba(200,208,219,.45)';
    c.fillRect(0, waterline - H * .08, W, H * .08);
  }

  // ─── Bake paper grain as pre-filled canvas (avoids createPattern per frame) ───
  function _bakeGrainPattern() {
    const sz = 256;
    const gc = document.createElement('canvas');
    gc.width = sz;
    gc.height = sz;
    const gctx = gc.getContext('2d');

    const img = gctx.createImageData(sz, sz);
    for (let i = 0; i < img.data.length; i += 4) {
      const x = (i / 4) % sz;
      const y = Math.floor(i / 4 / sz);
      const macro = (Math.sin(x * .1) * Math.cos(y * .08) * .3) +
                      (Math.sin(x * .03 + y * .04) * .2);
      const speckle = Math.random() * .4;
      const v = 175 + (macro * 30) + (speckle * 25);
      img.data[i] = v;
      img.data[i + 1] = v - 6;
      img.data[i + 2] = v - 14;
      img.data[i + 3] = 28;
    }
    gctx.putImageData(img, 0, 0);

    gctx.save();
    gctx.globalAlpha = .12;
    gctx.strokeStyle = 'rgba(80,70,55,1)';
    gctx.lineWidth = .3;
    for (let i = 0; i < 35; i++) {
      const yy = Math.random() * sz;
      const xx = Math.random() * sz;
      const len = 8 + Math.random() * 30;
      const dy = (Math.random() - .3) * 3;
      gctx.beginPath();
      gctx.moveTo(xx, yy);
      gctx.lineTo(xx + len, yy + dy);
      gctx.stroke();
    }
    gctx.restore();

    gctx.save();
    gctx.globalAlpha = .06;
    gctx.strokeStyle = 'rgba(90,80,65,1)';
    gctx.lineWidth = .2;
    for (let i = 0; i < 15; i++) {
      const yy = Math.random() * sz;
      const xx = Math.random() * sz;
      const len = 5 + Math.random() * 12;
      const angle = (-1.2 + Math.random() * .4);
      gctx.beginPath();
      gctx.moveTo(xx, yy);
      gctx.lineTo(xx + len * .6, yy + len * Math.tan(angle));
      gctx.stroke();
    }
    gctx.restore();

    grainPattern = document.createElement('canvas');
    grainPattern.width = sz;
    grainPattern.height = sz;
    grainPattern.getContext('2d').drawImage(gc, 0, 0);

    // Pre-fill grain canvas for fast blit instead of createPattern each frame
    _grainCanvas = _createGrainCanvas();
  }

  // Create a full-size canvas filled with the grain pattern (once per resize)
  function _createGrainCanvas() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const sz = 256;
    const repsX = Math.ceil(W / sz) + 1;
    const repsY = Math.ceil(H / sz) + 1;
    for (let ry = 0; ry < repsY; ry++) {
      for (let rx = 0; rx < repsX; rx++) {
        ctx.drawImage(grainPattern, rx * sz, ry * sz);
      }
    }
    return c;
  }

  function hexToRgb(hex) {
    const v = parseInt(hex.slice(1), 16);
    return { r: (v >> 16 & 255), g: (v >> 8 & 255), b: (v & 255) };
  }

  function lerpColor(a, b, t) {
    const pa = hexToRgb(a), pb = hexToRgb(b);
    const r = Math.round(pa.r + (pb.r - pa.r) * t);
    const g = Math.round(pa.g + (pb.g - pa.g) * t);
    const bl = Math.round(pa.b + (pb.b - pa.b) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  // Deterministic seeded random
  let _seed = 42;
  function _sr() {
    _seed = (_seed * 16807 + 0) % 2147483647;
    return _seed / 2147483647;
  }

  function tideAt(x) {
    if (tideFront <= 0) return 0;
    const d = x - tideFront;
    if (d < 0) return 0;
    const zone = 180 + pressure * 120;
    if (d > zone) return 1;
    return Easing.soak(d / zone);
  }

  const Easing = {
    press: t => Math.pow(Math.max(0, Math.min(1, t)), 2.2),
    release: t => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 2.8),
    soak: t => Math.pow(Math.max(0, Math.min(1, t)), 1.4) * (1 + (1 - Math.pow(Math.max(0, Math.min(1, t)), .8)) * 1.2),
    smoothstep: t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); },
    inOut: t => -(Math.cos(Math.PI * Math.max(0, Math.min(1, t))) - 1) * .5,
  };

  // ─── Main draw pipeline with dirty-flag optimization ───
  function draw(ctx) {
    frameCount++;

    // Check dirty: only redraw tide-dependent layers if something changed
    const tideChanged = (
      Math.abs(tideProgress - _prevTideProgress) > 1e-6 ||
      Math.abs(tideFront - _prevTideFront) > .5 ||
      Math.abs(pressure - _prevPressure) > .001 ||
      _dirty
    );
    _dirty = false;

    // Always blit static background (paper + sky)
    if (_staticBg) {
      ctx.drawImage(_staticBg, 0, 0);
    }

    // Water base and hill changes slowly with tideProgress
    // Hills: tideProgress dependency, redraw when tide changes
    if (!pressed && !settling && !resetting && !tideChanged) {
      // Idle: still draw clock-dependent elements (shimmer, reeds)
      // but skip tide-varying layers (hills hatch marks, water waves)
      // Actually always draw - the idle drift changes clock which affects shimmer/reeds
    }

    // Full draw for all dynamic layers
    drawHills(ctx);
    drawWater(ctx);
    drawMoonlightColumn(ctx);
    drawMoon(ctx);
    drawMoonReflection(ctx);
    drawMoonlightShimmer(ctx);
    drawBridge(ctx);
    drawLanterns(ctx);
    drawBoats(ctx);
    drawLanternReflections(ctx);
    drawReeds(ctx);
    drawTide(ctx);
    drawPigmentLayer(ctx);
    drawPaperGrain(ctx);
    drawRegistration(ctx);
    drawTouchGlow(ctx);
    drawGrainShift(ctx);
    drawDragTrailStipple(ctx);
    drawReleaseRipple(ctx);

    // Store current state for next frame's dirty check
    if (!pressed) {
      _prevTideProgress = tideProgress;
      _prevTideFront = tideFront;
      _prevPressure = pressure;
    }
  }

  // ─── Hills ───
  function drawHills(ctx) {
    const baseAlpha = .42 - tideProgress * .08;
    const hillY = (x) => waterline - (.022 + Math.sin(x * .004) * .015 + Math.sin(x * .009) * .007) * H;

    ctx.fillStyle = 'rgba(90,122,90,' + baseAlpha + ')';
    ctx.beginPath();
    ctx.moveTo(0, waterline);
    for (let x = 0; x <= W; x += 3) ctx.lineTo(x, hillY(x));
    ctx.lineTo(W, waterline);
    ctx.fill();

    ctx.strokeStyle = 'rgba(42,48,72,.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      if (x === 0) ctx.moveTo(x, hillY(x));
      else ctx.lineTo(x, hillY(x));
    }
    ctx.stroke();

    if (tideProgress > .3) {
      const hatchA = Math.min(.1, (tideProgress - .3) * .08);
      ctx.strokeStyle = 'rgba(42,48,72,' + hatchA + ')';
      ctx.lineWidth = .4;
      for (let x = 0; x < W; x += 12) {
        const hy = hillY(x);
        const depth = waterline - hy;
        if (depth > 5) {
          for (let dy = 0; dy < depth * .6; dy += 5) {
            ctx.beginPath();
            ctx.moveTo(x, hy + dy);
            ctx.lineTo(x + 5, hy + dy + 2.5);
            ctx.stroke();
          }
        }
      }
    }
  }

  // ─── Water ───
  function drawWater(ctx) {
    ctx.fillStyle = C.water;
    ctx.fillRect(0, waterline, W, H - waterline);
    ctx.fillStyle = 'rgba(106,125,144,.35)';
    ctx.fillRect(0, waterline + H * .45, W, H * .25);

    ctx.strokeStyle = 'rgba(200,208,219,.18)';
    ctx.lineWidth = .5;
    for (let y = waterline + 5; y < H; y += 9) {
      ctx.beginPath();
      for (let x = 0; x < W; x += 5) {
        const wave = Math.sin(x * .005 + y * .02 + tideProgress * 2.5) * 1.2;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
  }

  // ─── Moonlight shimmer ───
  function drawMoonlightShimmer(ctx) {
    _seed = 333 + Math.floor(clock * 37) % 10000;
    const count = Math.min(18, Math.floor(W / 45));
    for (let i = 0; i < count; i++) {
      const sx = _sr() * W;
      const waveY = Math.sin(sx * .003 + clock * .4 + i * 1.7) * H * .04;
      const sy = waterline + H * (.08 + _sr() * .55) + waveY;
      const dx = Math.abs(sx - moonX);
      const proximity = Math.max(0, 1 - dx / (W * .35));
      const shimmer = (
        Math.sin(clock * .9 + i * 2.3 + sx * .002) * .5 + .5
      ) * (
        Math.sin(clock * .35 + i * 1.1) * .5 + .5
      );
      const alpha = .025 + shimmer * proximity * .09;
      if (alpha < .03) continue;
      const dotR = .6 + shimmer * 1.2;
      ctx.fillStyle = 'rgba(240,240,232,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(sx, sy, dotR * 1.6, dotR * .5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── Moonlight column ───
  function drawMoonlightColumn(ctx) {
    const breath = Math.sin(clock * .25) * .5 + .5;
    const baseAlpha = .015 + breath * .012;
    const colW = moonR * 2.2;
    const topY = waterline - H * .06;
    const rows = 12;
    for (let r = 0; r < rows; r++) {
      const t = r / rows;
      const y = topY + t * H * .55;
      const w = colW * (.3 + t * .7);
      const rowAlpha = baseAlpha * (1 - t * .4);
      ctx.fillStyle = 'rgba(240,240,232,' + rowAlpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(moonX, y, w, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── Moon ───
  function drawMoon(ctx) {
    ctx.strokeStyle = 'rgba(240,240,232,.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR + 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(240,240,232,.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR + 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = C.moon;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(220,220,212,.3)';
    const craterPositions = [[-.3,-.25],[.2,.3],[-.15,.1],[.35,-.1],[.05,-.4],[-.4,.15],[.15,.45]];
    craterPositions.forEach(cp => {
      ctx.beginPath();
      ctx.arc(moonX + cp[0] * moonR, moonY + cp[1] * moonR, moonR * .08, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawMoonReflection(ctx) {
    const reflY = waterline + H * .04;
    const mR = moonR * .35;
    const ta = tideAt(moonX);

    const columnN = 10;
    for (let i = 0; i < columnN; i++) {
      const ry = reflY + i * 6;
      const rx = moonX + Math.sin(i * .55 + tideProgress * 1.8) * (1.5 + i * .35);
      const rw = mR * (.35 + i * .09) * (1 + ta * .3);
      const alpha = (.1 * (1 - ta * .5)) + .04;

      ctx.fillStyle = 'rgba(240,240,232,' + alpha + ')';
      ctx.beginPath();
      ctx.ellipse(rx, ry, rw, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (ta > .2) {
      const ca = (ta - .2) * .12;
      ctx.strokeStyle = 'rgba(42,48,72,' + ca + ')';
      ctx.lineWidth = .5;
      for (let i = 0; i < 3; i++) {
        const ry = reflY + i * 18 + 10;
        const rx = moonX + Math.sin(i * .55 + tideProgress * 1.8) * 3;
        ctx.beginPath();
        ctx.moveTo(rx - mR * .6, ry);
        ctx.lineTo(rx + mR * .6, ry);
        ctx.stroke();
      }
    }
  }

  function drawBridge(ctx) {
    const bridgeY = waterline - H * .04;
    const postW = 5.5;

    // ── Bridge posts: carved key-line silhouettes ──
    bridgePosts.forEach((p, idx) => {
      const ta = tideAt(p.x);
      const postAlpha = .55 + ta * .35;

      // Main key-line body: dark, hand-carved weight
      ctx.fillStyle = lerpColor(C.paper, C.black, postAlpha);
      ctx.fillRect(p.x - postW / 2, p.y1, postW, p.y2 - p.y1);

      // Key-line outline (thick, black, slightly offset for woodblock imprint feel)
      ctx.strokeStyle = 'rgba(42,48,72,' + (.65 + ta * .2) + ')';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(p.x - postW / 2 - .6, p.y1 - .6, postW + 1.2, p.y2 - p.y1 + 1.2);

      // Inner shadow: subtle offset line to suggest carved depth
      ctx.strokeStyle = 'rgba(42,48,72,.18)';
      ctx.lineWidth = .7;
      ctx.beginPath();
      ctx.moveTo(p.x + postW / 2 - 1.5, p.y1 + 3);
      ctx.lineTo(p.x + postW / 2 - 1.5, p.y2 - 3);
      ctx.stroke();

      // Wood grain: faint horizontal hatch marks, hand-carved feel
      ctx.strokeStyle = 'rgba(107,88,69,' + (.08 + ta * .06) + ')';
      ctx.lineWidth = .35;
      const grainCount = 3 + ((idx * 3) % 3);
      for (let g = 0; g < grainCount; g++) {
        const gy = p.y1 + (p.y2 - p.y1) * (.2 + g * .22) + Math.sin(idx + g * 1.7) * 3;
        const gxOff = (Math.sin(g * 2.3 + idx) - .5) * 2;
        const gLen = 3 + Math.sin(g * 1.5 + idx * .7) * 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x - postW / 2 + 2 + gxOff, gy);
        ctx.lineTo(p.x - postW / 2 + 2 + gxOff + gLen, gy + (Math.sin(g + idx) > 0 ? .8 : -.5));
        ctx.stroke();
      }

      // Tide-revealed: post cap detail (carved top piece)
      if (ta > .25) {
        const capAlpha = Easing.soak((ta - .25) * 2.5) * .25;
        ctx.fillStyle = 'rgba(42,48,72,' + capAlpha + ')';
        ctx.fillRect(p.x - postW / 2 - 1, p.y1 - 1.5, postW + 2, 3);
        ctx.strokeStyle = 'rgba(42,48,72,' + (capAlpha * .5) + ')';
        ctx.lineWidth = .5;
        ctx.strokeRect(p.x - postW / 2 - 1, p.y1 - 1.5, postW + 2, 3);
      }
    });

    if (bridgePosts.length >= 2) {
      const left = bridgePosts[1], right = bridgePosts[2];
      const midX = (left.x + right.x) / 2;
      const midY = bridgeY - H * .018;
      const span = right.x - left.x;

      // ── Shadow wash beneath the bridge (indigo pool under deck) ──
      const washY = bridgeY + 10;
      const washH = H * .04;
      const washGrad = ctx.createLinearGradient(left.x - 10, washY, left.x - 10, washY + washH);
      washGrad.addColorStop(0, 'rgba(22,32,64,.08)');
      washGrad.addColorStop(.6, 'rgba(22,32,64,.04)');
      washGrad.addColorStop(1, 'rgba(22,32,64,0)');
      ctx.fillStyle = washGrad;
      ctx.fillRect(left.x - 12, washY, span + 24, washH);

      // ── Top curved deck beam (primary key-line) ──
      ctx.strokeStyle = lerpColor(C.paper, C.black, .62);
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(left.x, bridgeY);
      ctx.quadraticCurveTo(midX, midY, right.x, bridgeY);
      ctx.stroke();

      // Secondary beam parallel for carved thickness
      ctx.strokeStyle = lerpColor(C.paper, C.black, .38);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(left.x, bridgeY + 4);
      ctx.quadraticCurveTo(midX, midY + 4, right.x, bridgeY + 4);
      ctx.stroke();

      // ── Deck planks: horizontal hatches between posts ──
      ctx.strokeStyle = 'rgba(42,48,72,' + (.07 + tideProgress * .03) + ')';
      ctx.lineWidth = .35;
      const plankCount = Math.floor(span / 6);
      for (let i = 0; i < plankCount; i++) {
        const t = (i + .5) / plankCount;
        const px = left.x + t * span;
        // Follow curve for y position
        const u = t;
        const curveY = (1 - u) * (1 - u) * bridgeY + 2 * (1 - u) * u * midY + u * u * bridgeY;
        const plankY = curveY + 7;
        const skew = Math.sin(u * Math.PI) * -6; // curve follows arc
        ctx.beginPath();
        ctx.moveTo(px - 2 + skew * .5, plankY);
        ctx.lineTo(px + 2 + skew * .5, plankY + Math.sin(u * Math.PI) * 2);
        ctx.stroke();
      }

      // ── Tide-revealed: suspension chains (hanebashi style) ──
      if (tideProgress > .2) {
        const chainAlpha = Easing.soak((tideProgress - .2) / .8) * .12;
        ctx.strokeStyle = 'rgba(42,48,72,' + chainAlpha + ')';
        ctx.lineWidth = .5;
        const chains = [left, bridgePosts[0], right];
        chains.forEach((cp, ci) => {
          if (ci === 0 || ci === 2) return;
          // Vertical chain lines from post to deck
          const chainTop = bridgeY - 2 - Math.sin((ci / (chains.length - 1)) * Math.PI) * (bridgeY - midY) * .8;
          ctx.beginPath();
          ctx.moveTo(cp.x, chainTop - 8);
          ctx.lineTo(cp.x, chainTop);
          ctx.stroke();
        });
      }
    }
  }

  function drawLanterns(ctx) {
    const bridgeY = waterline - H * .04;

    lanternXs.forEach((lx, idx) => {
      const ly = bridgeY + 14;
      const ta = tideAt(lx);

      ctx.fillStyle = lerpColor(C.black, C.amber, .25 + ta * .55);
      ctx.fillRect(lx - 4, ly, 9, 14);

      ctx.strokeStyle = 'rgba(42,48,72,.35)';
      ctx.lineWidth = .8;
      ctx.strokeRect(lx - 4, ly, 9, 14);

      const glowAlpha = .12 + ta * .25;
      ctx.fillStyle = 'rgba(212,160,74,' + glowAlpha + ')';
      ctx.fillRect(lx - 6, ly - 3, 14, 19);

      ctx.fillStyle = 'rgba(42,48,72,.25)';
      ctx.fillRect(lx - 5, ly - 1, 11, 2);
      ctx.fillRect(lx - 5, ly + 14, 11, 2);

      if (ta > .15) {
        ctx.fillStyle = 'rgba(212,160,74,' + (ta * .15) + ')';
        for (let s = 0; s < 4; s++) {
          ctx.beginPath();
          ctx.arc(lx - 2 + (s % 3) * 3.5, ly + 3 + Math.floor(s / 3) * 5, .6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  function drawLanternReflections(ctx) {
    lanternXs.forEach((lx, i) => {
      const reflY = waterline + H * (.06 + i * .025);
      const reflH = H * (.14 + i * .02);
      const ta = tideAt(lx);
      const alpha = .08 + ta * .22;

      const stretch = 1 + ta * .8;
      const colH = reflH * stretch;

      const segH = 4;
      for (let sy = reflY; sy < reflY + colH; sy += segH) {
        const segT = (sy - reflY) / colH;
        const sx = lx + Math.sin(sy * .06 + i * 1.3 + tideProgress * 2) * (2 + segT * 3);
        const segAlpha = alpha * (1 - segT * .6);
        ctx.fillStyle = 'rgba(212,160,74,' + segAlpha + ')';
        ctx.fillRect(sx - 2, sy, 4, segH - 1);
      }

      if (ta > .1) {
        const washAlpha = (ta - .1) * .08;
        ctx.fillStyle = 'rgba(212,160,74,' + washAlpha + ')';
        ctx.beginPath();
        ctx.ellipse(lx, reflY + colH * .5, 12 + ta * 6, colH * .3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (ta > .3) {
        const ka = (ta - .3) * .1;
        ctx.strokeStyle = 'rgba(42,48,72,' + ka + ')';
        ctx.lineWidth = .4;
        for (let ly = reflY + 8; ly < reflY + colH; ly += 14) {
          const lx2 = lx + Math.sin(ly * .06 + i * 1.3 + tideProgress * 2) * 2.5;
          ctx.beginPath();
          ctx.moveTo(lx2 - 3, ly);
          ctx.lineTo(lx2 + 3, ly);
          ctx.stroke();
        }
      }
    });
  }

  function drawBoats(ctx) {
    boats.forEach((b, i) => {
      const cx = b.x + b.w / 2, cy = b.y;
      const ta = tideAt(cx);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(b.tilt + Math.sin(tideProgress * 1.2 + i * 1.5) * .006);
      ctx.translate(-cx, -cy);

       // ── Hull fill: deeper indigo wash as tide passes ──
      const hullColor = lerpColor(C.water, C.darkIndigo, .25 + ta * .55);
      ctx.fillStyle = hullColor;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.h);
      ctx.quadraticCurveTo(b.x + b.w * .15, b.y - b.h * .35, b.x + b.w * .45, b.y - b.h * .55);
      ctx.quadraticCurveTo(b.x + b.w * .85, b.y - b.h * .25, b.x + b.w * .95, b.y + b.h * .4);
      ctx.lineTo(b.x + b.w, b.y + b.h * .8);
      ctx.quadraticCurveTo(b.x + b.w * .5, b.y + b.h * 1.1, b.x, b.y + b.h);
      ctx.closePath();
      ctx.fill();

       // ── Primary key-line: thick, carved, slightly irregular ──
      ctx.strokeStyle = 'rgba(42,48,72,' + (.45 + ta * .4) + ')';
      ctx.lineWidth = 1.8 + ta * .6;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.h);
      ctx.quadraticCurveTo(b.x + b.w * .15, b.y - b.h * .35, b.x + b.w * .45, b.y - b.h * .55);
      ctx.quadraticCurveTo(b.x + b.w * .85, b.y - b.h * .25, b.x + b.w * .95, b.y + b.h * .4);
      ctx.lineTo(b.x + b.w, b.y + b.h * .8);
      ctx.quadraticCurveTo(b.x + b.w * .5, b.y + b.h * 1.1, b.x, b.y + b.h);
      ctx.closePath();
      ctx.stroke();

       // ── Secondary outline offset: woodblock registration shift ──
      ctx.strokeStyle = 'rgba(180,90,50,' + (.06 + ta * .05) + ')';
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(b.x + 1.2, b.y + b.h + .5);
      ctx.quadraticCurveTo(b.x + b.w * .15 + 1.2, b.y - b.h * .35 - .5, b.x + b.w * .45 + 1.2, b.y - b.h * .55 - .8);
      ctx.quadraticCurveTo(b.x + b.w * .85 + 1.2, b.y - b.h * .25 - .5, b.x + b.w * .95 + 1.2, b.y + b.h * .4 - .3);
      ctx.stroke();

       // ── Prow silhouette: upward curve at the bow, hand-carved detail ──
      if (ta > .15) {
        const prowAlpha = Easing.soak((ta - .15) * 2) * (.2 + ta * .15);
        ctx.strokeStyle = 'rgba(42,48,72,' + prowAlpha + ')';
        ctx.lineWidth = 1;

         // Prow tip extending upward at stern
        const sternX = b.x + b.w * .9;
        const sternBaseY = b.y + b.h * .45;
        ctx.beginPath();
        ctx.moveTo(sternX, sternBaseY);
        ctx.quadraticCurveTo(
          sternX + b.w * .06, sternBaseY - b.h * .8 - i * 3,
          sternX + b.w * .08, sternBaseY - b.h * 1.1 - i * 2
         );
        ctx.stroke();

          // Prow ornament: small curved bracket
        if (ta > .4) {
          const ornAlpha = Easing.soak((ta - .4) * 2) * .15;
          ctx.strokeStyle = 'rgba(42,48,72,' + ornAlpha + ')';
          ctx.lineWidth = .6;
          ctx.beginPath();
          ctx.moveTo(sternX + b.w * .04, sternBaseY - b.h * .5);
          ctx.quadraticCurveTo(
            sternX + b.w * .07, sternBaseY - b.h * .7,
            sternX + b.w * .085, sternBaseY - b.h * .6
            );
          ctx.stroke();
          }
        }
       }

       // ── Waterline on hull: carved horizontal band ──
      if (ta > .1) {
        const wlAlpha = Easing.soak((ta - .1) * 2) * .22;
        ctx.strokeStyle = 'rgba(42,48,72,' + wlAlpha + ')';
        ctx.lineWidth = .7;
        ctx.beginPath();
        ctx.moveTo(b.x + b.w * .02, b.y + b.h * .55);
        ctx.quadraticCurveTo(b.x + b.w * .5, b.y + b.h * .9, b.x + b.w * .98, b.y + b.h * .55);
        ctx.stroke();
       }

       // ── Hatch marks: alternating angles, hand-carved rhythm ──
      if (ta > .15) {
        const hatchAlpha = Easing.soak((ta - .15) * 2) * .25;
        ctx.strokeStyle = 'rgba(42,48,72,' + hatchAlpha + ')';
        ctx.lineWidth = .45;
        const step = 5;
        const n = Math.floor(b.w * .75 / step);
        for (let k = 0; k < n; k++) {
          const frac = k / n;
           // Position along the hull interior
          const hx = b.x + b.w * .12 + frac * b.w * .7;
          const hullTopAtX = b.y - b.h * (.5 * (1 - Math.pow(2 * frac - .3, 2)));
          const hullBotY = b.y + b.h;
          const angle = (k % 2 === 0) ? 1.9 : -1.3;
          const len = 3.5 + ((k + i * 3) % 4) * .8;
          const rows = Math.max(1, Math.floor((hullBotY - hullTopAtX) / 5));
          for (let r = 0; r < rows; r++) {
            const hy = hullTopAtX + 3 + r * 5;
            if (hy > hullBotY - 1) continue;
            ctx.beginPath();
            ctx.moveTo(hx + Math.sin(k + r) * .5, hy);
            ctx.lineTo(hx + len * .6 + Math.sin(k * .7 + r * 1.3) * .4, hy + angle);
            ctx.stroke();
           }
         }
       }

       // ── Stippled pigment: irregular dots for hand-printed texture ──
      if (ta > .3) {
        const stipAlpha = Easing.smoothstep((ta - .3) * 2.5) * .14;
        const dotCount = Math.floor(8 + ta * 12);
        ctx.fillStyle = 'rgba(27,42,74,' + stipAlpha + ')';
         _seed = 42 + i * 100;
        for (let s = 0; s < dotCount; s++) {
          const sx = b.x + _sr() * b.w;
          const frac2 = (sx - b.x) / b.w;
          const syBase = b.y - b.h * (.5 * (1 - Math.pow(2 * frac2 - 1, 2)));
          const sy = syBase + _sr() * (b.y + b.h - syBase);
          const r = .4 + _sr() * 1.3;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
         }
       }

       // ── Pigment pool: darker indigo wash in hull curves ──
      if (ta > .4) {
        const poolAlpha = Easing.soak((ta - .4) * 1.8) * .1;
        ctx.fillStyle = 'rgba(22,32,64,' + poolAlpha + ')';
        ctx.beginPath();
        ctx.ellipse(b.x + b.w * .45, b.y + b.h * .7, b.w * .28, b.h * .35, 0, 0, Math.PI * 2);
        ctx.fill();
       }

       // ── Cabin silhouette: revealed by deep tide passage ──
      if (ta > .5) {
        const detAlpha = Easing.soak((ta - .5) * 2) * .25;
        ctx.strokeStyle = 'rgba(42,48,72,' + detAlpha + ')';
        ctx.lineWidth = 1;

        const cabinX = b.x + b.w * (.3 + i * .05);
        const cabinW = b.w * (.12 + (i % 2) * .04);
        const cabinH = b.h * (.7 + i * .1);
        const cabinBaseY = b.y - b.h * .15;

         // Cabin box
        ctx.strokeRect(cabinX, cabinBaseY - cabinH, cabinW, cabinH);

         // Roof line with slight overhang
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cabinX - 1.5, cabinBaseY - cabinH - .5);
        ctx.lineTo(cabinX + cabinW + 1.5, cabinBaseY - cabinH - .5);
        ctx.stroke();

         // Roof support lines
        ctx.lineWidth = .5;
        ctx.beginPath();
        ctx.moveTo(cabinX + cabinW * .5, cabinBaseY - cabinH - .5);
        ctx.lineTo(cabinX + cabinW * .5, cabinBaseY - cabinH - 4 - i * 2);
        ctx.stroke();
       }

       // ── Small figure silhouette (deep tide) ──
      if (ta > .75) {
        const figAlpha = Easing.soak((ta - .75) * 4) * .1;
        ctx.fillStyle = 'rgba(42,48,72,' + figAlpha + ')';
        const figX = b.x + b.w * (.55 + (i % 2) * .1);
        const figY = b.y - b.h * .1;

         // Simple figure: dot head + line body
        ctx.beginPath();
        ctx.arc(figX, figY - 4 - i * 2, 1.5 + i * .5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(42,48,72,' + (figAlpha * .7) + ')';
        ctx.lineWidth = .8;
        ctx.beginPath();
        ctx.moveTo(figX, figY - 2.5 - i * 2);
        ctx.lineTo(figX, figY);
        ctx.stroke();
       }

       // ── Mast and sail silhouette (deepest tide: full print state) ──
      if (ta > .85 && i === 0) {
        const mastAlpha = Easing.soak((ta - .85) * 6) * .12;

         // Mast line
        ctx.strokeStyle = 'rgba(42,48,72,' + mastAlpha + ')';
        ctx.lineWidth = .8;
        const mastX = b.x + b.w * .55;
        ctx.beginPath();
        ctx.moveTo(mastX, b.y - b.h * .3);
        ctx.lineTo(mastX, b.y - b.h * 1.8);
        ctx.stroke();

         // Furlled sail shape
        ctx.fillStyle = 'rgba(107,88,69,' + (mastAlpha * .3) + ')';
        ctx.beginPath();
        ctx.moveTo(mastX, b.y - b.h * 1.7);
        ctx.lineTo(mastX - b.w * .08, b.y - b.h * 1.6);
        ctx.lineTo(mastX - b.w * .07, b.y - b.h * .4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(42,48,72,' + (mastAlpha * .5) + ')';
        ctx.lineWidth = .5;
        ctx.stroke();
       }

      ctx.restore();
     });
   }

  function drawReeds(ctx) {
    reeds.forEach((r, i) => {
      const ta = tideAt(r.x);
      const base = Math.sin(clock * .55 + r.phase) * 1.8;
      const rip = Math.sin(clock * 1.1 + r.phase * 2.3 + i * .7) * .6;
      const breath = Math.sin(clock * .18 + i * 1.1) * .4;
      const sway = base + rip + breath + ta * Math.sin(tideProgress * .7 + r.phase);

      const rAlpha = .4 + ta * .5;
      const stalkColor = lerpColor(C.water, C.reed, rAlpha);

      ctx.strokeStyle = stalkColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r.x, r.baseY);
      const tipX = r.x + r.lean * r.h * .6 + sway;
      const tipY = r.baseY - r.h;
      ctx.quadraticCurveTo(
        r.x + r.lean * r.h * .25 + sway * .5,
        r.baseY - r.h * .5,
        tipX, tipY
      );
      ctx.stroke();

      ctx.strokeStyle = 'rgba(42,48,72,.12)';
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(r.x + .6, r.baseY - .6);
      ctx.quadraticCurveTo(
        r.x + r.lean * r.h * .25 + sway * .5 + .6,
        r.baseY - r.h * .5 - .6,
        tipX + .6, tipY - .6
      );
      ctx.stroke();

      if (ta > .15) {
        const stipAlpha = Easing.soak((ta - .15) * 2.5);

        ctx.strokeStyle = 'rgba(90,122,90,' + (stipAlpha * .3) + ')';
        ctx.lineWidth = .7;
        for (let b = 0; b < r.bladeCount; b++) {
          const startT = .55 + b * .12;
          const sx2 = r.x + r.lean * r.h * startT + sway * startT;
          const sy2 = r.baseY - r.h * startT;
          ctx.beginPath();
          ctx.moveTo(sx2, sy2);
          const bladeLean = (b % 2 === 0) ? 1 : -1;
          ctx.quadraticCurveTo(
            sx2 + bladeLean * (2.5 + b * 1.2), sy2 - 4 - b * 1.5,
            sx2 + bladeLean * (5 + b * 2.5), sy2 - 9 - b * 3
          );
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(90,122,90,' + (stipAlpha * .22) + ')';
        _seed = 99 + i * 50 + Math.floor(tideProgress * 7);
        for (let d = 0; d < 5 + r.bladeCount * 2; d++) {
          ctx.beginPath();
          ctx.arc(
            tipX + (_sr() - .5) * 8,
            tipY + (_sr() - .5) * 5,
            .5 + _sr() * .8,
            0, Math.PI * 2
          );
          ctx.fill();
        }
      }

      if (ta > .5) {
        const baseAlpha = Easing.soak((ta - .5) * 2) * .08;
        ctx.fillStyle = 'rgba(27,42,74,' + baseAlpha + ')';
        _seed = 200 + i * 70;
        for (let s = 0; s < 4; s++) {
          ctx.beginPath();
          ctx.arc(r.x + (_sr() - .5) * 6, r.baseY - 2 + _sr() * 4, .6 + _sr() * .5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  // ─── Tide band ───
  function drawTide(ctx) {
    if (tideFront <= 0) return;

    const zone = 180 + pressure * 120;

    // Phase 1: Indigo wash
    for (let x = Math.max(0, tideFront - 10); x < Math.min(W, tideFront + zone + 10); x += 2) {
      const d = x - tideFront;
      if (d < 0 || d > zone) continue;
      const t = Easing.soak(d / zone);

      const alpha = .06 + Math.sin(t * Math.PI) * (.18 + pressure * .22);
      if (alpha > .025) {
        ctx.fillStyle = 'rgba(27,42,74,' + alpha.toFixed(3) + ')';
        ctx.fillRect(x, waterline - H * .04, 2, H * .72);
      }

      if (t > .01 && t < .09) {
        const edgeAlpha = .45 * Math.sin(t / .09 * Math.PI);
        ctx.strokeStyle = 'rgba(27,42,74,' + edgeAlpha + ')';
        ctx.lineWidth = 2.5 + pressure * 1.5;
        ctx.beginPath();
        ctx.moveTo(x, waterline - H * .05);
        const wave = Math.sin(x * .02 + tideProgress * 3) * 3;
        ctx.lineTo(x + wave, waterline + H * .65);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(240,240,232,' + (edgeAlpha * .35) + ')';
        ctx.lineWidth = .7;
        ctx.beginPath();
        ctx.moveTo(x + 3, waterline - H * .05);
        ctx.lineTo(x + 3 + wave, waterline + H * .65);
        ctx.stroke();
      }
    }

    // Phase 2: Hatch marks
    _seed = 50 + Math.floor(tideProgress * 20);
    for (let x = Math.max(0, tideFront + zone * .08); x < Math.min(W, tideFront + zone * .82); x += 5) {
      const d = x - tideFront;
      const t = d / zone;
      const hatchT = (t - .08) / .74;
      if (hatchT < 0 || hatchT > 1) continue;

      const hatchAlpha = Math.sin(hatchT * Math.PI) * (.05 + pressure * .07);
      if (hatchAlpha < .015) continue;

      ctx.strokeStyle = 'rgba(42,48,72,' + hatchAlpha.toFixed(3) + ')';
      ctx.lineWidth = .35;

      const rows = 3;
      for (let row = 0; row < rows; row++) {
        const baseY = waterline - H * .03 + row * (H * .23);
        const angle = (row % 2 === 0) ? 2.2 : -1.6;
        const len = 3 + ((x + row * 7) % 4);
        const off = (row % 3) * 2.5;

        ctx.beginPath();
        ctx.moveTo(x + off, baseY + _sr() * 3);
        ctx.lineTo(x + off + len * .6, baseY + _sr() * 3 + angle);
        ctx.stroke();
      }
    }

    // Phase 3: Stippled pigment
    _seed = 120 + Math.floor(tideProgress * 30);
    for (let x = Math.max(0, tideFront + zone * .3); x < Math.min(W, tideFront + zone * .9); x += 3) {
      const d = x - tideFront;
      const t = d / zone;
      if (t < .4 || _sr() > .06) continue;

      const stipAlpha = t * .1;
      ctx.fillStyle = 'rgba(27,42,74,' + stipAlpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(
        x + _sr() * 2,
        waterline + _sr() * H * .6,
        .4 + _sr() * .7,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    // Phase 4: Pigment pooling
    _seed = 300 + Math.floor(tideProgress * 15);
    for (let i = 0; i < 3; i++) {
      const px = tideFront + _sr() * zone * .8 + zone * .1;
      const py = waterline + _sr() * H * .6;
      const poolAlpha = pressure * .06 * (1 - i * .25);
      if (poolAlpha < .005) continue;

      ctx.fillStyle = 'rgba(22,32,64,' + poolAlpha + ')';
      ctx.beginPath();
      ctx.ellipse(px, py, 6 + _sr() * 10, 3 + _sr() * 5, _sr() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── Permanent pigment layer ───
  function drawPigmentLayer(ctx) {
    if (tideFront <= 0 && !resetting && settleBloom < .01) return;

    const zone = 180 + pressure * 120;
    const advanceX = Math.max(0, tideFront - 2);
    const paintW = Math.min(12, zone * .05);

    if (pressed && paintW > 0) {
      pigmentCtx.fillStyle = 'rgba(27,42,74,.015)';
      pigmentCtx.fillRect(advanceX, waterline - H * .04, paintW, H * .72);

      _seed = 500 + Math.floor(performance.now() / 100) % 1000;
      pigmentCtx.fillStyle = 'rgba(27,42,74,.008)';
      for (let s = 0; s < 6; s++) {
        const sx = advanceX + _sr() * paintW;
        const sy = waterline + _sr() * H * .6;
        pigmentCtx.beginPath();
        pigmentCtx.arc(sx, sy, .4 + _sr() * .6, 0, Math.PI * 2);
        pigmentCtx.fill();
      }
    }

    if (pigmentMap) {
      ctx.globalAlpha = .85;
      ctx.drawImage(pigmentMap, 0, 0);
      ctx.globalAlpha = 1;
    }

    if (settleBloom > .005) {
      const bloomX = tideFront;
      const bloomWidth = 80 + settleBloom * 120;
      const bloomAlpha = settleBloom * .12;

      const grad = ctx.createRadialGradient(
        bloomX, waterline + H * .3, 0,
        bloomX, waterline + H * .3, bloomWidth
      );
      grad.addColorStop(0, 'rgba(22,32,64,' + (bloomAlpha * 1.5).toFixed(3) + ')');
      grad.addColorStop(.4, 'rgba(27,42,74,' + (bloomAlpha * .7).toFixed(3) + ')');
      grad.addColorStop(.8, 'rgba(43,58,103,' + (bloomAlpha * .25).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(43,58,103,0)');

      ctx.fillStyle = grad;
      ctx.fillRect(bloomX - bloomWidth, waterline - H * .04, bloomWidth * 2, H * .72);

      const grad2 = ctx.createRadialGradient(
        bloomX + 30, waterline + H * .35, 0,
        bloomX + 30, waterline + H * .35, bloomWidth * .7
      );
      grad2.addColorStop(0, 'rgba(43,58,103,' + (bloomAlpha * .4).toFixed(3) + ')');
      grad2.addColorStop(1, 'rgba(43,58,103,0)');

      ctx.fillStyle = grad2;
      ctx.fillRect(bloomX - bloomWidth * .5, waterline, bloomWidth * 1.5, H * .5);

      _seed = 800 + Math.floor(settleProgress * 50);
      const stippleCount = Math.floor(20 + settleBloom * 50);
      for (let s = 0; s < stippleCount; s++) {
        const dist = _sr() * bloomWidth * 1.2;
        const angle = _sr() * Math.PI;
        const sx = bloomX + dist * Math.cos(angle * .3 - .15);
        const sy = waterline - H * .02 + Math.sin(angle) * H * .35 + _sr() * H * .2;
        const dotR = .3 + _sr() * 1.5;
        const dotA = settleBloom * .08 * (1 - dist / (bloomWidth * 1.2));
        if (dotA > .003) {
          ctx.fillStyle = 'rgba(22,32,64,' + dotA.toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // ─── Paper grain: drawImage-tiled (no createPattern per frame) ───
  function drawPaperGrain(ctx) {
    const grainAlpha = settled ? .085 : (.06 + tideProgress * .015);

    if (_grainCanvas) {
      ctx.save();
      ctx.globalAlpha = grainAlpha;
      ctx.drawImage(_grainCanvas, 0, 0);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = .02 + (settled ? .015 : tideProgress * .008);
    ctx.strokeStyle = 'rgba(42,48,72,1)';
    ctx.lineWidth = .25;
    _seed = 700;
    const fiberCount = settled ? 32 : (20 + Math.floor(tideProgress * 10));
    for (let i = 0; i < fiberCount; i++) {
      const yy = _sr() * H;
      const xx = _sr() * W;
      const len = 6 + _sr() * 22;
      const angle = (_sr() - .5) * .5;
      ctx.beginPath();
      ctx.moveTo(xx, yy);
      ctx.lineTo(xx + len * Math.cos(angle), yy + len * Math.sin(angle));
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── Touch glow ───
  function drawTouchGlow(ctx) {
    if (touchAlpha < .01) return;

    const glowR = 40 + pressure * 25;
    const grad = ctx.createRadialGradient(touchX, touchY, 0, touchX, touchY, glowR);
    grad.addColorStop(0, 'rgba(27,42,74,' + (touchAlpha * .15).toFixed(3) + ')');
    grad.addColorStop(.5, 'rgba(27,42,74,' + (touchAlpha * .06).toFixed(3) + ')');
    grad.addColorStop(1, 'rgba(27,42,74,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(touchX, touchY, glowR, 0, Math.PI * 2);
    ctx.fill();

    if (touchAlpha > .3) {
      const ringAlpha = (touchAlpha - .3) * .08;
      ctx.strokeStyle = 'rgba(212,160,74,' + ringAlpha.toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(touchX, touchY, glowR * .6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ─── Grain shift ───
  function drawGrainShift(ctx) {
    if (touchAlpha < .02) return;

    const shiftR = 50 + pressure * 30;
    _seed = 1000 + Math.floor(clock * 100) % 1000;
    ctx.save();
    ctx.globalAlpha = touchAlpha * .04;
    ctx.strokeStyle = 'rgba(42,48,72,1)';
    ctx.lineWidth = .3;

    for (let i = 0; i < 12; i++) {
      const angle = _sr() * Math.PI * 2;
      const dist = _sr() * shiftR;
      const sx = touchX + Math.cos(angle) * dist;
      const sy = touchY + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 3 + _sr() * 6, sy + (_sr() - .5) * 3);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── Drag trail stipple ───
  function drawDragTrailStipple(ctx) {
    if (dragTrail.length < 2 || !pressed) return;

    _seed = 2000 + Math.floor(clock * 200);
    for (let i = 0; i < dragTrail.length; i++) {
      const p = dragTrail[i];
      const age = (dragTrail.length - 1 - i) / dragTrail.length;
      const alpha = (1 - age) * (.015 + pressure * .02);
      if (alpha < .005) continue;

      _seed = 2000 + i * 37;
      const dotR = .3 + _sr() * .6;
      ctx.fillStyle = 'rgba(27,42,74,' + alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── Release ripple ───
  function drawReleaseRipple(ctx) {
    if (!releaseRipple) return;

    const r = releaseRipple;
    const radius = 15 + r.t * 60;
    const alpha = r.alpha * (1 - r.t);
    if (alpha < .005) {
      releaseRipple = null;
      return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'rgba(27,42,74,.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (r.t > .2) {
      const r2 = (r.t - .2) * 50;
      const a2 = alpha * .6;
      ctx.globalAlpha = a2;
      ctx.lineWidth = .8;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── Registration lines ───
  function drawRegistration(ctx) {
    ctx.save();

    const regBoost = .6 + Math.min(.4, tideProgress * .4);
    const settledBoost = settled ? 1.3 : 1;

    ctx.strokeStyle = `rgba(175,85,48,${(.11 * regBoost * settledBoost).toFixed(3)})`;
    ctx.lineWidth = .6;

    bridgePosts.forEach((p, idx) => {
      const dx = 1.2 + (idx % 3) * .4;
      const dy = -1.2 - ((idx + 1) % 2) * .3;
      ctx.beginPath();
      ctx.moveTo(p.x + dx, p.y1 + dy);
      const midY = (p.y1 + p.y2) / 2;
      ctx.lineTo(p.x + dx + .3 * ((idx % 2 === 0) ? 1 : -1), midY + dy);
      ctx.lineTo(p.x + dx - .2, p.y2 + dy);
      ctx.stroke();
    });

    {
      const hillY = (x) => waterline - (.022 + Math.sin(x * .004) * .015 + Math.sin(x * .009) * .007) * H;
      const rdx = 1.8;
      const rdy = -1.2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const jitter = Math.sin(x * .31) * .4;
        if (x === 0) ctx.moveTo(x + rdx, hillY(x) + rdy + jitter);
        else ctx.lineTo(x + rdx, hillY(x) + rdy + jitter);
      }
      ctx.stroke();
    }

    boats.forEach((b, idx) => {
      const dx1 = 1 + idx * .3;
      const dy1 = -1 - (idx % 2) * .4;
      ctx.strokeStyle = `rgba(175,85,48,${(.08 * regBoost * settledBoost).toFixed(3)})`;
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(b.x + dx1, b.y + b.h - 1 + dy1);
      ctx.quadraticCurveTo(
        b.x + b.w * .18 + dx1, b.y - 1 + dy1,
        b.x + b.w * .5 + dx1, b.y - b.h * .5 - 1 + dy1
      );
      ctx.quadraticCurveTo(
        b.x + b.w * .82 + dx1, b.y - 1 + dy1,
        b.x + b.w + dx1, b.y + b.h - 1 + dy1
      );
      ctx.closePath();
      ctx.stroke();

      const dx2 = -1.5 - idx * .2;
      const dy2 = 1 + (idx % 3) * .3;
      ctx.strokeStyle = `rgba(90,100,140,${(.05 * regBoost * settledBoost).toFixed(3)})`;
      ctx.lineWidth = .4;
      ctx.beginPath();
      ctx.moveTo(b.x + dx2, b.y + b.h + dy2);
      ctx.quadraticCurveTo(
        b.x + b.w * .18 + dx2, b.y + dy2,
        b.x + b.w * .5 + dx2, b.y - b.h * .5 + dy2
      );
      ctx.quadraticCurveTo(
        b.x + b.w * .82 + dx2, b.y + dy2,
        b.x + b.w + dx2, b.y + b.h + dy2
      );
      ctx.closePath();
      ctx.stroke();
    });

    reeds.forEach((r, idx) => {
      const dx = (idx % 3 - 1) * 1.1;
      const dy = ((idx + 1) % 2 === 0 ? -1 : 1) * .9;
      ctx.strokeStyle = `rgba(175,85,48,${(.04 * regBoost * settledBoost).toFixed(3)})`;
      ctx.lineWidth = .35;
      ctx.beginPath();
      ctx.moveTo(r.x + dx, r.baseY + dy - .5);
      const tipX = r.x + r.lean * r.h * .6 + dx;
      const tipY = r.baseY - r.h + dy;
      ctx.quadraticCurveTo(
        r.x + r.lean * r.h * .25 + dx,
        r.baseY - r.h * .5 + dy,
        tipX, tipY
      );
      ctx.stroke();
    });

    if (bridgePosts.length >= 2) {
      const left = bridgePosts[1], right = bridgePosts[2];
      const bridgeY = waterline - H * .04;
      ctx.strokeStyle = `rgba(175,85,48,${(.07 * regBoost * settledBoost).toFixed(3)})`;
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(left.x - .8, bridgeY - 1.2);
      const midX = (left.x + right.x) / 2;
      const midY = bridgeY - H * .018 - .8;
      ctx.quadraticCurveTo(midX, midY, right.x - .8, bridgeY - 1.2);
      ctx.stroke();
    }

    ctx.strokeStyle = `rgba(120,100,130,${(.045 * regBoost * settledBoost).toFixed(3)})`;
    ctx.lineWidth = .4;

    bridgePosts.forEach((p, idx) => {
      const dx = -1.8 - (idx % 2) * .5;
      const dy = 2 + ((idx + 2) % 3) * .4;
      ctx.beginPath();
      ctx.moveTo(p.x + dx, p.y1 + dy);
      const midY = (p.y1 + p.y2) / 2;
      ctx.lineTo(p.x + dx - .3 * ((idx % 2 === 0) ? 1 : -1), midY + dy);
      ctx.lineTo(p.x + dx + .2, p.y2 + dy);
      ctx.stroke();
    });

    const mkSize = 8;
    const mkOffset = 14;
    const marks = [
      [mkOffset, mkOffset],
      [W - mkOffset, mkOffset],
      [mkOffset, H - mkOffset],
      [W - mkOffset, H - mkOffset],
    ];
    marks.forEach(([mx, my], idx) => {
      ctx.strokeStyle = `rgba(175,85,48,${(.13 * regBoost).toFixed(3)})`;
      ctx.lineWidth = .7;
      ctx.beginPath();
      ctx.moveTo(mx - mkSize - 3, my);
      ctx.lineTo(mx + mkSize + 3, my);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mx, my - mkSize - 3);
      ctx.lineTo(mx, my + mkSize + 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(mx, my, mkSize, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(175,85,48,${(.065 * regBoost).toFixed(3)})`;
      ctx.lineWidth = .5;
      const offDx = (idx % 2 === 0) ? 1.5 : -1;
      const offDy = (idx > 1) ? 1.5 : -1;
      ctx.beginPath();
      ctx.moveTo(mx - mkSize - 1, my + offDy);
      ctx.lineTo(mx + mkSize + 1, my + offDy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mx + offDx, my + offDy, mkSize, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.restore();
  }

  // ─── Input handlers ───
  function onDown(x, y) {
    pressed = true;
    settling = false;
    resetting = false;
    lastX = x;
    lastY = y;
    touchX = x;
    touchY = y;
    touchAlpha = 0;
    dragTrail = [{ x, y }];
    releaseRipple = null;
    if (tideFront <= 0) {
      tideFront = x;
      initialTideFront = x;
    }
    tideFrontVel = 0;
    _dirty = true; // force redraw on press
  }

  function onMove(x, y) {
    if (!pressed) return;
    const dx = x - lastX;
    const dist = Math.abs(dx);

    tideFrontVel = dx * .5;
    pressure = Math.min(1, pressure + Easing.press(dist * .004));
    tideFront = Math.max(0, Math.min(W, tideFront + tideFrontVel));
    tideProgress += Easing.soak(dist * .007);

    touchX = x;
    touchY = y;
    dragTrail.push({ x, y });
    if (dragTrail.length > 20) dragTrail.shift();

    lastX = x;
    lastY = y;
    _dirty = true;
  }

  function onUp() {
    pressed = false;
    pressure = Math.max(0, pressure - .08);
    tideProgress += .3;

    releaseRipple = { x: touchX, y: touchY, t: 0, alpha: .6 };

    if (!resetting) {
      settling = true;
      settleProgress = 0;
      settleBloom = Math.max(.15, pressure * .6 + tideProgress * .02);
      tideSettleExtra = 0;
      initialTideFront = tideFront;
    }
    _dirty = true;
  }

  function resetTouchState() {
    touchX = 0;
    touchY = 0;
    touchAlpha = 0;
    dragTrail = [];
    releaseRipple = null;
  }

  function resetScene() {
    resetting = true;
    resetProgress = 0;
    settling = false;
    settleBloom = 0;
    tideSettleExtra = 0;
    resetStartTideFront = tideFront;
    resetStartTideProgress = tideProgress;
    resetTouchState();
    _dirty = true;
  }

  function idleDrift(t) {
    clock += .016;

    // Touch glow ramps UP while pressing
    if (pressed) {
      touchAlpha = Math.min(1, touchAlpha + .06);
    }

    if (tideFront > 0) {
      tideFront += Math.sin(t * 1.1) * .25;
    } else {
      tideFront = Math.sin(t * 0.7) * 2;
    }
    tideProgress += .004;
    pressure = Math.max(0, pressure - .0025);

    touchAlpha = Math.max(0, touchAlpha - .03);
    if (touchAlpha < .01) dragTrail = [];

    if (releaseRipple) {
      releaseRipple.t += .012;
      if (releaseRipple.t >= 1) releaseRipple = null;
    }

    if (settling) {
      settleProgress = Math.min(1, settleProgress + .005);
      const sp = settleProgress;

      tideSettleExtra += .15 * (1 - sp * .6);
      tideFront = initialTideFront + tideSettleExtra;

      pressure *= .995;
      settleBloom *= .998;

      if (sp >= 1 && settling) {
        settling = false;
        settled = true;
        const el = document.getElementById('final-title');
        if (el) {
          el.classList.add('visible');
          el.style.bottom = (4 + Math.max(0, (settleBloom - .3) * 1.5).toFixed(1)) + 'vh';
        }
      }
    }

    if (resetting) {
      resetProgress = Math.min(1, resetProgress + .008);
      const rp = Easing.inOut(resetProgress);

      tideFront = resetStartTideFront * (1 - rp);
      tideProgress = resetStartTideProgress * (1 - rp);
      pressure = 0;
      settleBloom *= (1 - rp * .95);

      if (pigmentCtx) {
        pigmentCtx.globalCompositeOperation = 'destination-out';
        pigmentCtx.fillStyle = 'rgba(0,0,0,' + (.04 + rp * .06).toFixed(3) + ')';
        pigmentCtx.fillRect(0, 0, W, H);
        pigmentCtx.globalCompositeOperation = 'source-over';
      }

      if (rp >= 1) {
        resetting = false;
        tideFront = -1;
        tideProgress = 0;
        pressure = 0;
        settleBloom = 0;
        tideSettleExtra = 0;
        settled = false;
        if (pigmentCtx) {
          pigmentCtx.clearRect(0, 0, W, H);
        }
        const el = document.getElementById('final-title');
        if (el) el.classList.remove('visible');
      }
    }
  }

  return { init, draw, onDown, onMove, onUp, idleDrift, resetScene, resetTouchState };
})();
