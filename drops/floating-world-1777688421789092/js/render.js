const Render = (() => {
  const C = {
    paper: '#F0E9D8',
    sky: '#B0BAC6',
    moon: '#F5F5ED',
    indigo: '#1B2A67',
    darkIndigo: '#0E1A3A',
    amber: '#D4A04A',
    reed: '#4A6A4A',
    wood: '#6B5845',
    black: '#1A2040',
    water: '#6A7F94',
    waterDeep: '#4A5F74',
    highlight: '#E8E2D0',
    poolIndigo: '#101830',
    skyGradTop: '#8A94A6',
    skyGradBot: '#B8C2CE',
    };

  let W = 0, H = 0;
   let zoneW = 180;
   function zoneWidth(p) { return 180 + (p || pressure) * 120; }
  let tideProgress = 0;
  let pressed = false;
  let pressure = 0;
  let lastX = 0, lastY = 0;
  let moonX, moonY, moonR, waterline;
  let boats = [], reeds = [], bridgePosts = [], lanternXs = [];
  let clock = 0;
  let frameCount = 0;

  // ── Press feedback: indigo halo + grain compression ──
  let pressHalo = { x: 0, y: 0, t: 0, alpha: 0 };
  let pressGrain = { x: 0, y: 0, t: 0, alpha: 0 };

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

    // ── Settle fiber texture: non-repeating texture shift when tide settles ──
   let _settleFiberSeed = 0;
   let _settleFibers = [];
   let _fiberTextureAlpha = 0;
   let _fiberTextureTarget = 0;

  // ── Performance: offscreen buffers ──
  let pigmentMap = null;
  let pigmentCtx = null;
  let grainPattern = null;
  let tideFrontVel = 0;
  let initialTideFront = -1;
  let _staticBg = null;       // offscreen canvas for paper+sky (truly static)
  let _grainCanvas = null;    // pre-filled grain pattern canvas
  let _dirty = true;          // dirty flag: forces redraw when true
  let _prevTideProgress = 0;   // last frame's tideProgress for change detection
  let _prevTideFront = -1;
  let _prevPressure = 0;
  let _prevClock = 0;

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
 // Moonlit, muted, atmospheric — reads as ukiyo-e immediately
   function _bakeStaticBg() {
       _staticBg = document.createElement('canvas');
       _staticBg.width = W;
       _staticBg.height = H;
     const c = _staticBg.getContext('2d');

       // Paper base: subtle warm tone, not white
     c.fillStyle = C.paper;
     c.fillRect(0, 0, W, H);

       // Moonlight wash: soft radial warmth from moon position
      {
       const warm = c.createRadialGradient(W * .8, H * .12, 0, W * .5, H * .4, W * .8);
       warm.addColorStop(0, 'rgba(240,240,228,.2)');
       warm.addColorStop(.4, 'rgba(240,240,228,.08)');
       warm.addColorStop(.7, 'rgba(235,230,218,.04)');
       warm.addColorStop(1, 'rgba(230,224,210,0)');
       c.fillStyle = warm;
       c.fillRect(0, 0, W, H);
       }

       // Sky: deep muted indigo-grey at top fading to softer grey near horizon
       // This creates the immediate ukiyo-e moonlit night atmosphere
      {
       const skyGrad = c.createLinearGradient(0, 0, 0, waterline);
       skyGrad.addColorStop(0, 'rgba(65,72,95,.88)');
       skyGrad.addColorStop(.2, 'rgba(85,95,118,.8)');
       skyGrad.addColorStop(.45, 'rgba(105,115,135,.68)');
       skyGrad.addColorStop(.7, 'rgba(130,142,162,.55)');
       skyGrad.addColorStop(.9, 'rgba(158,168,185,.42)');
       skyGrad.addColorStop(1, 'rgba(175,185,202,.35)');
       c.fillStyle = skyGrad;
       c.fillRect(0, 0, W, waterline);
       }

       // Horizon glow: warm amber reflection where sky meets water
       // Suggests distant lanterns and moonlight on the harbor surface
      {
        const horizGrad = c.createLinearGradient(0, waterline - H * .03, 0, waterline + H * .04);
        horizGrad.addColorStop(0, 'rgba(210,195,170,0)');
        horizGrad.addColorStop(.5, 'rgba(210,195,170,.15)');
        horizGrad.addColorStop(1, 'rgba(210,195,170,0)');
        c.fillStyle = horizGrad;
        c.fillRect(0, waterline - H * .03, W, H * .07);
       }

       // Distant land silhouette at low horizon
      {
        const landY = (x) => waterline - (.06 + Math.sin(x * .0018 + .5) * .025 + Math.sin(x * .004 + 1.2) * .012 + Math.sin(x * .009) * .006) * H;
        c.fillStyle = 'rgba(55,62,78,.3)';
        c.beginPath();
        c.moveTo(0, waterline);
        for (let x = 0; x <= W; x += 4) c.lineTo(x, landY(x));
        c.lineTo(W, waterline);
        c.fill();
        c.strokeStyle = 'rgba(42,48,62,.15)';
        c.lineWidth = .5;
        c.beginPath();
        for (let x = 0; x <= W; x += 4) {
          if (x === 0) c.moveTo(x, landY(x)); else c.lineTo(x, landY(x));
        }
         c.stroke();
        }
       }

   // ─── Bake paper grain — large tile, multi-scale noise, fiber directionality ───
   // Tile is 512×512 to reduce repeat visibility.  Random phase offsets per tile
   // instance further break the looping pattern.  The grain has three layers:
   //   1. Macro mottling: gentle regional brightness shifts (wet paper patches)
   //   2. Micro speckle: random fiber dust and pigment granules
   //   3. Directional fibers: elongated strokes with horizontal bias (paper grain)
   //      plus a smaller set of cross-grain fibers for visual interest.
   function _bakeGrainPattern() {
    const sz = 512;
    const gc = document.createElement('canvas');
    gc.width = sz;
    gc.height = sz;
    const gctx = gc.getContext('2d');

    // Layer 1+2: macro mottling + micro speckle via pixel buffer
    const img = gctx.createImageData(sz, sz);
    let _grainSeed = 7919;
    function _grainSr() { _grainSeed = (_grainSeed * 16807) % 2147483647; return _grainSeed / 2147483647; }
    for (let i = 0; i < img.data.length; i += 4) {
      const x = (i / 4) % sz;
      const y = Math.floor(i / 4 / sz);
      // Macro mottling: two overlapping low-freq waves produce organic patches
      const macro = (Math.sin(x * .031 + y * .023) * .28) +
                    (Math.sin(x * .009 - y * .017 + 1.2) * .18) +
                    (Math.cos(x * .013 + y * .027) * .12);
      // Micro speckle: per-pixel random variation
      const speckle = _grainSr() * .35;
      // Combine into base value with warm paper bias
      const v = 178 + (macro * 24) + (speckle * 20);
      img.data[i]     = Math.min(255, v);
      img.data[i + 1] = Math.min(255, v - 8);
      img.data[i + 2] = Math.min(255, v - 16);
      img.data[i + 3] = 32;
     }
    gctx.putImageData(img, 0, 0);

    // Layer 3A: Directional fibers — horizontal bias (12°–135°), varying length
    gctx.save();
    for (let i = 0; i < 80; i++) {
      const yy = _grainSr() * sz;
      const xx = _grainSr() * sz;
      // Horizontal-biased angle: predominantly left-right with slight variation
      const angle = (_grainSr() - .5) * .35;
      const len = 10 + _grainSr() * 38;
      const thickness = .15 + _grainSr() * .35;
      const alpha = .06 + _grainSr() * .14;
      gctx.strokeStyle = 'rgba(75,68,52,' + alpha + ')';
      gctx.lineWidth = thickness;
      gctx.beginPath();
      gctx.moveTo(xx, yy);
      // Slight bezier for organic feel — fibers aren't perfectly straight
      const cpx = xx + len * .5 + (_grainSr() - .5) * 4;
      const cpy = yy + (_grainSr() - .5) * 2.5;
      gctx.quadraticCurveTo(cpx, cpy, xx + len * Math.cos(angle), yy + len * Math.sin(angle));
      gctx.stroke();
     }
    gctx.restore();

    // Layer 3B: Cross-grain fibers — perpendicular, shorter, fewer
    gctx.save();
    for (let i = 0; i < 25; i++) {
      const yy = _grainSr() * sz;
      const xx = _grainSr() * sz;
      const angle = Math.PI * .5 + (_grainSr() - .5) * .6;
      const len = 5 + _grainSr() * 16;
      const alpha = .03 + _grainSr() * .08;
      gctx.strokeStyle = 'rgba(95,88,72,' + alpha + ')';
      gctx.lineWidth = .12 + _grainSr() * .2;
      gctx.beginPath();
      gctx.moveTo(xx, yy);
      gctx.lineTo(xx + len * Math.cos(angle), yy + len * Math.sin(angle));
      gctx.stroke();
     }
    gctx.restore();

    // Layer 3C: Tiny pigment granules — scattered dots
    gctx.save();
    for (let i = 0; i < 40; i++) {
      const xx = _grainSr() * sz;
      const yy = _grainSr() * sz;
      const r = .3 + _grainSr() * .8;
      const alpha = .04 + _grainSr() * .06;
      gctx.fillStyle = 'rgba(70,62,48,' + alpha + ')';
      gctx.beginPath();
      gctx.arc(xx, yy, r, 0, Math.PI * 2);
      gctx.fill();
     }
    gctx.restore();

    grainPattern = document.createElement('canvas');
    grainPattern.width = sz;
    grainPattern.height = sz;
    grainPattern.getContext('2d').drawImage(gc, 0, 0);

     // Pre-fill grain canvas for fast blit instead of createPattern each frame
     _grainCanvas = _createGrainCanvas();
   }

  // Create a full-size canvas filled with grain tiles with random phase offsets
  // to break the repeating pattern. Each tile is drawn at a slightly shifted
  // position so seam edges don't line up.
  function _createGrainCanvas() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const sz = 512;
    const repsX = Math.ceil(W / sz) + 2;
    const repsY = Math.ceil(H / sz) + 2;
    // Seeded random for consistent offsets across frames
    let tileSeed = 12347;
    function tileSr() { tileSeed = (tileSeed * 16807) % 2147483647; return tileSeed / 2147483647; }
    for (let ry = 0; ry < repsY; ry++) {
      for (let rx = 0; rx < repsX; rx++) {
        const offX = (tileSr() - .5) * 30;
        const offY = (tileSr() - .5) * 30;
        ctx.save();
        ctx.globalAlpha = .75 + tileSr() * .35;
        ctx.drawImage(grainPattern, rx * sz + offX, ry * sz + offY);
        ctx.restore();
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
    soak: t => { t = Math.max(0, Math.min(1, t)); return Math.min(1, Math.pow(t, 1.4) * (1 + (1 - Math.pow(t, .8)) * 1.2)); },
    smoothstep: t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); },
    inOut: t => -(Math.cos(Math.PI * Math.max(0, Math.min(1, t))) - 1) * .5,
    deepIn: t => { t = Math.max(0, Math.min(1, t)); return t * t * t; },
    easeOutSlow: t => { t = Math.max(0, Math.min(1, t)); return 1 - Math.pow(1 - t, 2.4); },
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

      // Track clock-driven animation changes (moonlight shimmer, reed sway, etc.)
     const clockChanged = (clock - _prevClock > .01) || _dirty;

     // Only redraw dynamic layers when tide, pressure, clock, or explicit dirty changes
     if (!tideChanged && !clockChanged && !pressed && !settling && !resetting) {
       // Nothing changed — skip expensive draw, still blit static BG above.
     } else {
       drawHills(ctx);
       drawWater(ctx);
       drawMoonlightColumn(ctx);
       drawPressFeeling(ctx);
       drawInitialPressFeedback(ctx);
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
       drawEdgeStain(ctx);
       drawSettleFibers(ctx);
       drawRegistration(ctx);
       drawTouchGlow(ctx);
       drawGrainShift(ctx);
       drawDragTrailStipple(ctx);
       drawReleaseRipple(ctx);
       drawVignette(ctx);
       drawPaperCast(ctx);
     }

     // Always update dirty-track state each frame so we detect changes correctly
     _prevTideProgress = tideProgress;
     _prevTideFront = tideFront;
     _prevPressure = pressure;
     _prevClock = clock;
  }

     // ─── Subtle press-depth color feeling: indigo deepens with pressure ───
  // A soft wash that blooms at the press point and tracks pressure depth.
  // Syncs with audio tap and paper rub layers.
  function drawPressFeeling(ctx) {
    if (!pressed || touchAlpha < .05) return;
    const r = 30 + pressure * 25;
    const grad = ctx.createRadialGradient(touchX, touchY, 0, touchX, touchY, r);
    const a = touchAlpha * (.04 + pressure * .06);
    grad.addColorStop(0, 'rgba(27,42,74,' + a.toFixed(3) + ')');
    grad.addColorStop(.6, 'rgba(27,42,74,' + (a * .3).toFixed(3) + ')');
    grad.addColorStop(1, 'rgba(27,42,74,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(touchX, touchY, r, 0, Math.PI * 2);
    ctx.fill();
   }

    // ─── Initial press feedback: indigo halo + paper grain compression ───
    // Fires on first press, expanding gently like ink blooming on absorbent paper.
    // Halo: organic, multi-layered speckle with irregular radius — never a perfect circle.
    // Grain: localized fiber compression, fibers pulled inward toward press point.
    // Timing: appears immediately with tap audio, fades as drag takes over.
   function drawInitialPressFeedback(ctx) {
     const ha = pressHalo.alpha;
     const ga = pressGrain.alpha;
     if (ha < .003 && ga < .003) return;

     // ── Organic indigo halo: layered blooming, NOT a perfect circle ──
     // Three layers: core bloom, mid-ring speckle, outer whisper
     if (ha > .003) {
       const t = pressHalo.t;
       const px = pressHalo.x;
       const py = pressHalo.y;

          // Core bloom: very soft radial wash, irregular radius per angle
       // Simulates ink pooling at the press point
       {
         const petalCount = 12;
         const baseR = 18 + t * 35;

         for (let p = 0; p < petalCount; p++) {
           const angle = (p / petalCount) * Math.PI * 2;
           const rNoise = Math.sin(angle * 5 + t * 8) * 6 + Math.cos(angle * 3 - t * 5) * 4;
           const r = (baseR + rNoise) * (1 + pressure * .25);

           const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
           const coreA = ha * (.06 + pressure * .05) * (.5 + Math.sin(angle * 3 + t * 4) * .3);
           if (coreA < .005) continue;

           grad.addColorStop(0, 'rgba(14,26,58,' + (coreA * 1.3).toFixed(4) + ')');
           grad.addColorStop(.4, 'rgba(27,42,74,' + (coreA * .6).toFixed(4) + ')');
           grad.addColorStop(1, 'rgba(27,42,74,0)');
           ctx.fillStyle = grad;
           ctx.beginPath();
           // Slightly offset center per petal for organic feel
           ctx.arc(
             px + Math.cos(angle) * 3 * (1 - t),
             py + Math.sin(angle) * 3 * (1 - t),
             r, angle - .3, angle + .3
             );
           ctx.fill();
           }
         }

          // Mid-ring stipple: scattered dots at intermediate radius
         // These dots suggest capillary wicking along fiber paths
        _seed = 9100 + Math.floor(t * 150);
       const midDotN = 8 + Math.floor(ha * 18);
       for (let i = 0; i < midDotN; i++) {
         const angle = _sr() * Math.PI * 2;
         const baseDist = 20 + _sr() * 35;
         const dist = baseDist * (1 + t * .8 + pressure * .3);
         const dx = px + Math.cos(angle) * dist;
         const dy = py + Math.sin(angle) * dist;
         const dR = .3 + _sr() * 1.5;
          // Density drops with distance and time
         const distFactor = Math.max(0, 1 - dist / (50 + t * 30));
         const dA = ha * (.04 + _sr() * .08) * distFactor;
         if (dA > .005) {
           ctx.fillStyle = 'rgba(14,26,58,' + dA.toFixed(4) + ')';
           ctx.beginPath();
           ctx.arc(dx, dy, dR, 0, Math.PI * 2);
           ctx.fill();
            }
          }

          // Outer whisper: very faint, irregular ring of dots
          // Appears only in first moment of press, fades quickly
        if (t < .5) {
          const whisperAlpha = ha * (1 - t * 2) * .04;
          if (whisperAlpha > .003) {
            _seed = 9200 + Math.floor(frameCount * 7);
            const whisperN = 5 + Math.floor(ha * 8);
            for (let i = 0; i < whisperN; i++) {
              const angle = _sr() * Math.PI * 2;
              const dist = 30 + _sr() * 25 + t * 20;
              const dx = px + Math.cos(angle) * dist;
              const dy = py + Math.sin(angle) * dist;
              const dR = .2 + _sr() * .8;
              ctx.fillStyle = 'rgba(22,32,64,' + (whisperAlpha * (.3 + _sr() * .7)).toFixed(4) + ')';
              ctx.beginPath();
              ctx.arc(dx, dy, dR, 0, Math.PI * 2);
              ctx.fill();
                }
              }
            }

          // Faint edge ring: irregular, NOT a perfect circle
          // Simulates the outermost reach of pigment on paper
         const ringT = Math.min(1, t * 1.5);
         const ringA = ha * .05 * (1 - ringT * .6);
         if (ringA > .005) {
           const ringR = (35 + ringT * 45) * (1 + pressure * .2);
           ctx.strokeStyle = 'rgba(14,26,58,' + ringA.toFixed(4) + ')';
           ctx.lineWidth = .8;
           ctx.setLineDash([1.5, 3 + ringT * 4]);
           ctx.beginPath();
           ctx.arc(px, py, ringR, 0, Math.PI * 2);
           ctx.stroke();
           ctx.setLineDash([]);
            }
          }

      // ── Paper grain compression: deterministic, position-seeded fiber displacement ───
      // Seed is derived from press position so the same spot always produces the same fiber pattern.
      // Three zones of compression, each with different fiber density and pull direction.
    if (ga > .003) {
      const compR = 28 + pressGrain.t * 22;
      // Position-seeded PRNG for deterministic fiber pattern
      let _sf = (Math.floor(pressGrain.x * 23) + Math.floor(pressGrain.y * 31) + 9500) % 2147483647;
      function _sfr() { _sf = (_sf * 16807) % 2147483647; return _sf / 2147483647; }

      ctx.save();

        // Inner zone: tight radial fibers directly under press — strongest compression
        {
          const innerR = compR * .38;
          const lineN = 6 + Math.floor(ga * 10);
          ctx.strokeStyle = 'rgba(90,85,70,' + (ga * .38).toFixed(4) + ')';
          ctx.lineWidth = .35;
          for (let i = 0; i < lineN; i++) {
            const angle = _sfr() * Math.PI * 2;
            const dist = _sfr() * innerR;
            const sx = pressGrain.x + Math.cos(angle) * dist;
            const sy = pressGrain.y + Math.sin(angle) * dist;
            // Strong inward pull: fibers visibly compressed toward press point
            const pullStrength = ga * .18 * (1 - dist / innerR);
            const pullX = (pressGrain.x - sx) * pullStrength;
            const pullY = (pressGrain.y - sy) * pullStrength;
            const len = 3 + _sfr() * 6;
            // Fibers align radially toward the press point with slight variation
            const fiberAngle = Math.atan2(pullY, pullX) + (_sfr() - .5) * .5;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            const endX = sx + len * Math.cos(fiberAngle) * .5 + pullX;
            const endY = sy + len * Math.sin(fiberAngle) * .5 + pullY;
            ctx.quadraticCurveTo(
              (sx + endX) / 2 + (_sfr() - .5) * 2.5,
              (sy + endY) / 2 + (_sfr() - .5) * 1.8,
              endX, endY
              );
            ctx.stroke();
          }
        }

        // Mid zone: moderate compression, fibers at cross-grain angles
        {
          const midR = compR * .65;
          const innerR2 = compR * .38;
          const lineN = 5 + Math.floor(ga * 7);
          ctx.strokeStyle = 'rgba(100,95,80,' + (ga * .22).toFixed(4) + ')';
          ctx.lineWidth = .25;
          for (let i = 0; i < lineN; i++) {
            const angle = _sfr() * Math.PI * 2;
            const rawDist = innerR2 + _sfr() * (midR - innerR2);
            const sx = pressGrain.x + Math.cos(angle) * rawDist;
            const sy = pressGrain.y + Math.sin(angle) * rawDist;
            const pullStrength = ga * .07 * (1 - (rawDist - innerR2) / (midR - innerR2));
            const pullX = (pressGrain.x - sx) * pullStrength;
            const pullY = (pressGrain.y - sy) * pullStrength;
            const len = 4 + _sfr() * 9;
            // Cross-grain: perpendicular to radial direction
            const radialAngle = Math.atan2(sy - pressGrain.y, sx - pressGrain.x);
            const fiberAngle = radialAngle + Math.PI * .5 + (_sfr() - .5) * .8;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + len * Math.cos(fiberAngle) + pullX, sy + len * Math.sin(fiberAngle) + pullY);
            ctx.stroke();
          }
        }

        // Outer zone: faint grain shift, tangential alignment
        {
          const outerR = compR;
          const midR2 = compR * .65;
          const lineN = 3 + Math.floor(ga * 4);
          ctx.strokeStyle = 'rgba(110,100,85,' + (ga * .12).toFixed(4) + ')';
          ctx.lineWidth = .2;
          for (let i = 0; i < lineN; i++) {
            const angle = _sfr() * Math.PI * 2;
            const rawDist = midR2 + _sfr() * (outerR - midR2);
            const sx = pressGrain.x + Math.cos(angle) * rawDist;
            const sy = pressGrain.y + Math.sin(angle) * rawDist;
            const len = 3 + _sfr() * 5;
            const radialAngle = Math.atan2(sy - pressGrain.y, sx - pressGrain.x);
            const fiberAngle = radialAngle + Math.PI * .5 + (_sfr() - .5) * .6;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + len * Math.cos(fiberAngle), sy + len * Math.sin(fiberAngle));
            ctx.stroke();
          }
        }

        // Compression ring: subtle annular deformation at press boundary
        // Simulates the paper dimpling in a circle around the press point
        {
          const ringCount = 2 + Math.floor(ga * 2);
          for (let rc = 0; rc < ringCount; rc++) {
            const ringR = (10 + rc * 8 + _sfr() * 4) * (1 + pressGrain.t * .15);
            const ringA = ga * (.04 - rc * .01);
            if (ringA < .005) continue;
            ctx.strokeStyle = 'rgba(95,88,72,' + ringA.toFixed(4) + ')';
            ctx.lineWidth = .25;
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += .3) {
              const wobble = Math.sin(a * 5 + _sfr() * 3) * 1.2;
              const rr = ringR + wobble;
              const rx = pressGrain.x + Math.cos(a) * rr;
              const ry = pressGrain.y + Math.sin(a) * rr;
              if (a === 0) ctx.moveTo(rx, ry);
              else ctx.lineTo(rx, ry);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }

        // Micro-compression stipple: tiny dots where fibers dimple
        _sf = (Math.floor(pressGrain.x * 17) + Math.floor(pressGrain.y * 29) + 9600) % 2147483647;
        const stipN = 4 + Math.floor(ga * 10);
        for (let i = 0; i < stipN; i++) {
          const angle = _sfr() * Math.PI * 2;
          const dist = _sfr() * compR * .55;
          const sx = pressGrain.x + Math.cos(angle) * dist;
          const sy = pressGrain.y + Math.sin(angle) * dist;
          const distFactor = 1 - dist / (compR * .55);
          const dA = ga * .1 * distFactor * (1 + pressGrain.t * .2);
          if (dA > .005) {
            ctx.fillStyle = 'rgba(80,75,60,' + dA.toFixed(4) + ')';
            ctx.beginPath();
            ctx.arc(sx, sy, .25 + _sfr() * .4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

      ctx.restore();
    }
  }

    // ─── Hills: layered silhouettes, immediate ukiyo-e read ───
  function drawHills(ctx) {
    const baseAlpha = .45 - tideProgress * .06;
    const hillY = (x) => waterline - (.025 + Math.sin(x * .004) * .018 + Math.sin(x * .009 + .6) * .008) * H;
    const hillYFar = (x) => waterline - (.032 + Math.sin(x * .003 + 1.4) * .022 + Math.sin(x * .007 + .3) * .01) * H;

    // Far hill layer: lighter, more distant
    ctx.fillStyle = 'rgba(115,135,115,' + (baseAlpha * .5) + ')';
    ctx.beginPath();
    ctx.moveTo(0, waterline);
    for (let x = 0; x <= W; x += 3) ctx.lineTo(x, hillYFar(x));
    ctx.lineTo(W, waterline);
    ctx.fill();

    ctx.strokeStyle = 'rgba(42,48,72,.12)';
    ctx.lineWidth = .6;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      if (x === 0) ctx.moveTo(x, hillYFar(x));
      else ctx.lineTo(x, hillYFar(x));
     }
    ctx.stroke();

    // Mid hill layer: main silhouette
    ctx.fillStyle = 'rgba(45,65,45,' + (baseAlpha * .65) + ')';
    ctx.beginPath();
    ctx.moveTo(0, waterline);
    for (let x = 0; x <= W; x += 3) ctx.lineTo(x, hillY(x));
    ctx.lineTo(W, waterline);
    ctx.fill();

    ctx.strokeStyle = 'rgba(30,35,55,.32)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      if (x === 0) ctx.moveTo(x, hillY(x));
      else ctx.lineTo(x, hillY(x));
     }
    ctx.stroke();

    if (tideProgress > .3) {
      const hatchA = Math.min(.12, (tideProgress - .3) * .1);
      ctx.strokeStyle = 'rgba(30,35,55,' + hatchA + ')';
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

    // ─── Water: moonlit harbor, deep and calm ───
  function drawWater(ctx) {
        // Base water: muted indigo-grey wash, flat like a printed block
     ctx.fillStyle = C.water;
     ctx.fillRect(0, waterline, W, H - waterline);

         // Deep indigo pool: the harbor bottom, darker as it deepens
      {
       const deepGrad = ctx.createLinearGradient(0, waterline + H * .3, 0, H);
       deepGrad.addColorStop(0, 'rgba(58,75,92,0)');
       deepGrad.addColorStop(.4, 'rgba(58,75,92,.45)');
       deepGrad.addColorStop(1, 'rgba(45,60,78,.6)');
       ctx.fillStyle = deepGrad;
       ctx.fillRect(0, waterline + H * .3, W, H * .7);
      }

         // Moonlit reflection band: horizontal shimmer strip at waterline
         // Suggests the harbor is flat and moonlit, key to the ukiyo-e mood
      {
       const reflGrad = ctx.createLinearGradient(0, waterline, 0, waterline + H * .12);
       reflGrad.addColorStop(0, 'rgba(200,205,215,.12)');
       reflGrad.addColorStop(.5, 'rgba(190,195,210,.06)');
       reflGrad.addColorStop(1, 'rgba(180,185,200,0)');
       ctx.fillStyle = reflGrad;
       ctx.fillRect(0, waterline, W, H * .12);
      }

        // Subtle horizontal wave lines: very faint, suggest calm water
        // Variable spacing and length for hand-printed feel
     ctx.strokeStyle = 'rgba(160,175,195,.1)';
     ctx.lineWidth = .35;
     _seed = 4000;
     for (let y = waterline + 5; y < H * .82; y += 10 + _sr() * 6) {
       ctx.beginPath();
       const rowLen = W * (.3 + _sr() * .5);
       const rowStart = _sr() * (W - rowLen);
       for (let x = rowStart; x < rowStart + rowLen; x += 6) {
         const wave = Math.sin(x * .004 + y * .015 + tideProgress * 2.5) * 1.2;
         if (x === rowStart) ctx.moveTo(x, y + wave);
         else ctx.lineTo(x, y + wave);
          }
       ctx.stroke();
       }
     }

    // ─── Moonlight shimmer: restrained, near the column ───
  function drawMoonlightShimmer(ctx) {
      _seed = 333 + Math.floor(clock * 37) % 10000;
    const count = Math.min(12, Math.floor(W / 55));
    for (let i = 0; i < count; i++) {
      const spread = W * .22;
      const sx = moonX + (_sr() - .5) * spread;
      const waveY = Math.sin(sx * .003 + clock * .3 + i * 1.7) * H * .02;
      const sy = waterline + H * (.06 + _sr() * .5) + waveY;
      const dx = Math.abs(sx - moonX);
      const proximity = Math.max(0, 1 - dx / (W * .2));
      const shimmer = (
         Math.sin(clock * .6 + i * 2.3 + sx * .002) * .5 + .5
        ) * (
         Math.sin(clock * .25 + i * 1.1) * .5 + .5
        );
      const alpha = .02 + shimmer * proximity * .1;
      if (alpha < .025) continue;
      const dotR = .5 + shimmer * .8;
      ctx.fillStyle = 'rgba(240,240,232,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(sx, sy, dotR * 1.8, dotR * .45, 0, 0, Math.PI * 2);
      ctx.fill();
       }
    }

     // ─── Moonlight column: soft, atmospheric, visible in first frame ───
  function drawMoonlightColumn(ctx) {
    const breath = Math.sin(clock * .2) * .5 + .5;
    const colW = moonR * 2.5;
    const topY = waterline - H * .03;
    const bottomY = waterline + H * .55;

      // Glow halo behind column
    {
      const haloGrad = ctx.createRadialGradient(moonX, waterline + H * .2, colW * .3, moonX, waterline + H * .2, colW * 1.5);
      const haloAlpha = .02 + breath * .015;
      haloGrad.addColorStop(0, 'rgba(240,240,232,' + haloAlpha.toFixed(3) + ')');
      haloGrad.addColorStop(1, 'rgba(240,240,232,0)');
      ctx.fillStyle = haloGrad;
      ctx.fillRect(moonX - colW * 1.5, waterline - H * .05, colW * 3, H * .65);
      }

    const rows = 18;
    for (let r = 0; r < rows; r++) {
      const t = r / rows;
      const y = topY + t * (bottomY - topY);
      const w = colW * (.25 + t * .8);
      const rowAlpha = (.018 + breath * .012) * (1 - t * .5);
      ctx.fillStyle = 'rgba(240,240,232,' + rowAlpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(moonX, y, w, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
       }
     }

      // ─── Moon: luminous, atmospheric, ukiyo-e presence ───
   function drawMoon(ctx) {
        // Outer halo: soft glow, breathes with clock
      {
       const breath = Math.sin(clock * .15) * .5 + .5;
       const haloR = moonR * (2.6 + breath * .4);
       const haloGrad = ctx.createRadialGradient(moonX, moonY, moonR * .6, moonX, moonY, haloR);
       haloGrad.addColorStop(0, 'rgba(240,240,232,' + (.06 + breath * .04) + ')');
       haloGrad.addColorStop(.3, 'rgba(240,240,232,' + (.03 + breath * .02) + ')');
       haloGrad.addColorStop(.7, 'rgba(240,240,232,.01)');
       haloGrad.addColorStop(1, 'rgba(240,240,232,0)');
       ctx.fillStyle = haloGrad;
       ctx.beginPath();
       ctx.arc(moonX, moonY, haloR, 0, Math.PI * 2);
       ctx.fill();
          }

        // Second halo layer: wider, softer atmospheric scatter
      {
       const haloR2 = moonR * 4;
       const grad2 = ctx.createRadialGradient(moonX, moonY, moonR, moonX, moonY, haloR2);
       grad2.addColorStop(0, 'rgba(220,225,218,.03)');
       grad2.addColorStop(.5, 'rgba(220,225,218,.01)');
       grad2.addColorStop(1, 'rgba(220,225,218,0)');
       ctx.fillStyle = grad2;
       ctx.beginPath();
       ctx.arc(moonX, moonY, haloR2, 0, Math.PI * 2);
       ctx.fill();
          }

        // ── Primary carved key line: bold, hand-printed black silhouette border ──
        // The key line (키선) defines the moon's shape as in a woodblock print.
        // Slightly irregular to suggest hand-carving, not machine perfection.
    ctx.strokeStyle = 'rgba(26,32,64,' + (.22 + tideProgress * .12) + ')';
    ctx.lineWidth = 1.6 + Math.abs(Math.sin(moonX * .1)) * .3;
    _drawMoonKeyline(ctx, moonX, moonY, moonR + 1.5, 0);

        // Woodblock registration offset: warm ochre, shifted +2px down-right (benizuri)
       // The offset suggests a second ink block was applied with slight misalignment.
    ctx.strokeStyle = 'rgba(175,85,48,' + (.09 + tideProgress * .06) + ')';
    ctx.lineWidth = .6;
    _drawMoonKeyline(ctx, moonX + 2.2, moonY + 1.8, moonR + 1.5, .3);

        // Third pass: cool indigo registration, shifted opposite direction
    ctx.strokeStyle = 'rgba(80,90,130,' + (.05 + tideProgress * .04) + ')';
    ctx.lineWidth = .4;
    _drawMoonKeyline(ctx, moonX - 1.4, moonY - 1.1, moonR + 1.5, -.25);

        // Moon body: slightly warm white, flat fill like hand-printed pigment
    ctx.fillStyle = C.moon;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

        // ── Inner key line: carved edge detail on the moon interior ──
        // Thin, dark ring just inside the edge to simulate carved wood depth
    ctx.strokeStyle = 'rgba(26,32,64,.08)';
    ctx.lineWidth = .5;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR - .8, 0, Math.PI * 2);
    ctx.stroke();

        // ── Moon surface texture: irregular craters and carved marks ──
        // Each mark is slightly offset to suggest hand-carving variation
    const craterPositions = [
      [-.28,-.22, .085], [.18,.25,.09], [-.12,.08,.075], [.3,-.08,.07],
      [.02,-.35,.065], [-.32,.12,.08], [.12,.38,.07], [-.05,.28,.06],
      [.22,-.28,.055], [-.2,.32,.06]
    ];
    craterPositions.forEach(cp => {
      const cx = moonX + cp[0] * moonR;
      const cy = moonY + cp[1] * moonR;
      const cr = moonR * cp[2];

        // Shadow side: slightly darker, suggesting carved depth
      ctx.fillStyle = 'rgba(218,218,210,.18)';
      ctx.beginPath();
      ctx.arc(cx + .5, cy + .3, cr, 0, Math.PI * 2);
      ctx.fill();

        // Crater rim: thin key line circle
      ctx.strokeStyle = 'rgba(26,32,64,.06)';
      ctx.lineWidth = .3;
      ctx.beginPath();
      ctx.arc(cx, cy, cr * 1.1, 0, Math.PI * 2);
      ctx.stroke();
          });

        // ── Tide-revealed: additional carved marks emerge as indigo wash passes ──
    if (tideProgress > .2) {
      const reveal = Easing.soak((tideProgress - .2) / .8);
        // Subtle carved texture marks across the moon surface
      _seed = 888;
      const markCount = Math.floor(6 + reveal * 8);
      ctx.strokeStyle = 'rgba(26,32,64,' + (reveal * .06) + ')';
      ctx.lineWidth = .25;
      for (let m = 0; m < markCount; m++) {
        const ma = _sr() * Math.PI * 2;
        const mr = _sr() * moonR * .7;
        const mx = moonX + Math.cos(ma) * mr;
        const my = moonY + Math.sin(ma) * mr;
        const ml = 1.5 + _sr() * 3;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + Math.cos(ma + .5) * ml, my + Math.sin(ma + .5) * ml);
        ctx.stroke();
        }
      }
    }

   // Helper: draws a slightly irregular moon keyline (hand-carved feel)
   function _drawMoonKeyline(ctx, cx, cy, r, phaseShift) {
     const segments = 64;
     ctx.beginPath();
     for (let i = 0; i <= segments; i++) {
       const a = (i / segments) * Math.PI * 2;
        // Carved irregularity: 3-4 hand-carved bumps around the circumference
       const irreg = Math.sin(a * 7 + phaseShift) * .8
                    + Math.sin(a * 13 + phaseShift * 1.7) * .4
                    + Math.sin(a * 3.7 - phaseShift * .5) * .6;
       const rr = r + irreg * .3;
       const px = cx + Math.cos(a) * rr;
       const py = cy + Math.sin(a) * rr;
       if (i === 0) ctx.moveTo(px, py);
       else ctx.lineTo(px, py);
       }
     ctx.closePath();
     ctx.stroke();
    }

  /* ─── Deterministic Ripple Reflections ───
   * Not liquid physics. Displacement is deterministic from tide state and
   * segment index, producing a "pigment soaking into paper" distortion that
   * stretches and warps as the dark indigo tide band passes.
   *
   * Ripple intensity = f(tideAt, pressure, depth) — always the same output
   * for the same inputs.  Mobile degrades by reducing segment count.
   */

  // Seeded ripple lookup — returns a stable displacement for any (seed, idx, time)
  function _rippleDistort(seed, idx, time, intensity) {
    return Math.sin(seed * 1.7 + idx * 2.3 + time * .7) * intensity * (1 + idx * .12);
  }
  // Secondary perpendicular ripple (creates cross-hatch distortion feel)
  function _rippleMicro(seed, idx, time, intensity) {
    return Math.cos(seed * 3.1 + idx * 1.9 - time * .4) * intensity * .45;
  }

  function drawMoonReflection(ctx) {
    const reflY = waterline + H * .04;
    const mR = moonR * .35;
    const ta = tideAt(moonX);

    // Ripple state: distortion grows as tide approaches and passes
    const rippleIntensity = pressure * 3.5 + ta * 5 + tideProgress * 2.2;
    const stretchFactor = 1 + ta * 1.4 + pressure * .6;

    // Mobile degrades: fewer segments on small screens
    const columnN = (W < 600) ? 7 : 14;
    const segH = 5 + (W < 600 ? 1 : 0);

    for (let i = 0; i < columnN; i++) {
      const segT = i / (columnN - 1);
      const ry = reflY + i * segH;
      const depth = segT * H * .4;

      // Deterministic horizontal ripple offset — pigment-soak warping
      const rippleX = _rippleDistort(42, i, tideProgress * 1.8, rippleIntensity * .3);
      const rippleMicro = _rippleMicro(42, i, tideProgress * 1.8, rippleIntensity * .15);

      // Vertical stretch: tide + pressure stretches the reflection like wet pigment
      const segStretch = stretchFactor * (1 + Math.sin(segT * Math.PI) * ta * .4);
      const ellH = (1.2 + ta * 1.8) * segStretch;

      // Width: each segment widens as tide passes, like ink blooming
      const rw = mR * (.3 + segT * .18) * (1 + ta * .5 + pressure * .15);

      // Position: base X + ripple offset
      const rx = moonX + rippleX + rippleMicro;

      // Alpha: fades with depth, but intensifies where tide has soaked through
      const baseAlpha = .06 * (1 - segT * .55);
      const tideBoost = ta * .08 * (1 - segT * .3);
      const alpha = baseAlpha + tideBoost;

      ctx.fillStyle = 'rgba(240,240,232,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(rx, ry, rw * segStretch * .7, ellH, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cross-cut lines: appear when tide passes, like carved ink lines through wet paper
    if (ta > .18) {
      const lineCount = (W < 600) ? 2 : 4;
      for (let i = 0; i < lineCount; i++) {
        const ry = reflY + (i + .5) * (H * .09);
        const rippleX = _rippleDistort(77, i, tideProgress * 2.1, rippleIntensity * .25);
        const rx = moonX + rippleX;
        const lineLen = mR * (.5 + ta * 1.2) * (1 + pressure * .3);
        const ca = (ta - .18) * .1 * (1 - i * .2);

        ctx.strokeStyle = 'rgba(42,48,72,' + ca.toFixed(3) + ')';
        ctx.lineWidth = .4 + ta * .3;
        ctx.beginPath();
        ctx.moveTo(rx - lineLen, ry);
        ctx.lineTo(rx + lineLen, ry);
        ctx.stroke();
      }
    }

    // Pigment bloom halo: soft warm glow where tide has soaked moon reflection
    if (ta > .3) {
      const bloomX = moonX + _rippleDistort(99, 5, tideProgress, rippleIntensity * .4);
      const bloomY = reflY + H * .12;
      const bloomR = mR * 1.8 * (1 + ta * .5);
      const bloomA = (ta - .3) * .04;

      const grad = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, bloomR);
      grad.addColorStop(0, 'rgba(240,240,232,' + bloomA.toFixed(3) + ')');
      grad.addColorStop(.5, 'rgba(240,240,232,' + (bloomA * .3).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(240,240,232,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bloomX, bloomY, bloomR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBridge(ctx) {
    const bridgeY = waterline - H * .04;

       // ══ Bridge posts: hand-carved silhouettes anchoring the composition ══
       // Each post has: bold key-line body, registration offsets, wood grain, and carved caps.
       // Posts anchor the center without cluttering — bold enough to read, restrained enough to breathe.
     const postW = 6;
     bridgePosts.forEach((p, idx) => {
       const ta = tideAt(p.x);
       const postAlpha = .65 + ta * .35;

          // ── Post body: solid dark fill, hand-printed weight ──
       ctx.fillStyle = lerpColor(C.paper, C.black, postAlpha);
       const postH = p.y2 - p.y1;
          // Slight hand-carved irregularity: top and bottom edges not perfectly flat
       const topBump = Math.sin(idx * 2.3) * .5;
       const botBump = Math.sin(idx * 3.1 + 1) * .4;
       ctx.fillRect(p.x - postW / 2, p.y1 - topBump, postW, postH + topBump + botBump);

          // ── Primary key-line: bold black border (karane block) ──
       ctx.strokeStyle = 'rgba(26,32,64,' + (.68 + ta * .2) + ')';
       ctx.lineWidth = 1.6;
       ctx.strokeRect(
         p.x - postW / 2 - .8, p.y1 - topBump - .8,
         postW + 1.6, postH + topBump + botBump + 1.6
         );

          // ── Registration offset: ochre (benizuri) — shifted right-down ──
       ctx.strokeStyle = 'rgba(175,85,48,' + (.08 + ta * .06) + ')';
       ctx.lineWidth = .5;
       ctx.strokeRect(
         p.x - postW / 2 + 1.6, p.y1 - topBump + 1.3,
         postW + 1.2, postH + topBump + botBump + 1.2
         );

          // ── Registration offset: indigo (aozuri) — shifted left-up ──
       ctx.strokeStyle = 'rgba(80,90,130,' + (.05 + ta * .04) + ')';
       ctx.lineWidth = .4;
       ctx.strokeRect(
         p.x - postW / 2 - 1.4, p.y1 - topBump - 1.1,
         postW + .8, postH + topBump + botBump + .8
         );

          // ── Inner carved depth: subtle right-edge shadow ──
          // Simulates the carved wood depth visible in a real print
       ctx.strokeStyle = 'rgba(26,32,64,.18)';
       ctx.lineWidth = .5;
       ctx.beginPath();
       ctx.moveTo(p.x + postW / 2 - 1.2, p.y1 + 2);
       ctx.lineTo(p.x + postW / 2 - 1.2, p.y2 - 2 + botBump);
       ctx.stroke();

          // ── Wood grain: vertical and horizontal fiber marks ──
          // Vertical grain: follows the post length
       ctx.strokeStyle = 'rgba(107,88,69,' + (.1 + ta * .06) + ')';
       ctx.lineWidth = .3;
          // Vertical fibers
       const vFiberCount = 2 + (idx % 2);
       for (let vf = 0; vf < vFiberCount; vf++) {
         const vfx = p.x - postW / 4 + vf * (postW / (vFiberCount * 2)) + Math.sin(idx + vf * 1.7) * .5;
         ctx.beginPath();
         ctx.moveTo(vfx, p.y1 + 4);
         ctx.lineTo(vfx + Math.sin(vf * 1.3 + idx) * .3, p.y2 - 4);
         ctx.stroke();
         }

          // Horizontal grain: short cross marks, always faintly visible
       ctx.strokeStyle = 'rgba(107,88,69,' + (.08 + ta * .05) + ')';
       const hGrainCount = 3 + ((idx * 3) % 3);
       for (let g = 0; g < hGrainCount; g++) {
         const gy = p.y1 + (p.y2 - p.y1) * (.2 + g * .2) + Math.sin(idx + g * 1.7) * 3;
         const gx = p.x - postW / 2 + 1.5 + (Math.sin(g * 2.1 + idx) - .5) * .8;
         const gLen = 2.5 + Math.sin(g * 1.3 + idx * .6) * 1.2;
         ctx.beginPath();
         ctx.moveTo(gx, gy);
         ctx.lineTo(gx + gLen, gy + (Math.sin(g + idx * 2) > .2 ? .5 : -.3));
         ctx.stroke();
         }

          // ── Post cap: carved top detail, always faintly visible ──
          // A wider top edge suggesting the post's wooden cap (kabuki)
       ctx.strokeStyle = 'rgba(26,32,64,' + (.12 + ta * .08) + ')';
       ctx.lineWidth = .6;
       const capW = postW + 3;
       const capH = 3;
       ctx.strokeRect(p.x - capW / 2, p.y1 - capH - topBump, capW, capH);
       ctx.fillStyle = 'rgba(26,32,64,' + (.06 + ta * .04) + ')';
       ctx.fillRect(p.x - capW / 2 + .5, p.y1 - capH - topBump + .5, capW - 1, capH - 1);

          // ── Tide-revealed: deeper cap carving and post base waterline detail ──
       if (ta > .2) {
         const reveal = Easing.soak((ta - .2) * 2.5);

              // Carved cap ridge: horizontal line across top of cap
         ctx.strokeStyle = 'rgba(26,32,64,' + (reveal * .15) + ')';
         ctx.lineWidth = .4;
         ctx.beginPath();
         ctx.moveTo(p.x - capW / 2 + 1, p.y1 - capH / 2 - topBump);
         ctx.lineTo(p.x + capW / 2 - 1, p.y1 - capH / 2 - topBump);
         ctx.stroke();

              // Waterline at post base: where water meets wood
         const waterlineY = p.y1 + postH * .55;
         ctx.strokeStyle = 'rgba(26,32,64,' + (reveal * .1) + ')';
         ctx.lineWidth = .35;
         ctx.beginPath();
         ctx.moveTo(p.x - postW / 2 - .5, waterlineY);
         ctx.lineTo(p.x + postW / 2 + .5, waterlineY);
         ctx.stroke();

              // Carved post mark: small diamond or circle at post midpoint
         ctx.strokeStyle = 'rgba(26,32,64,' + (reveal * .08) + ')';
         ctx.beginPath();
         ctx.arc(p.x, p.y1 + postH * .45, 1.5, 0, Math.PI * 2);
         ctx.stroke();
          }
        });

       // ══ Bridge deck: arched hanebashi (suspension bridge) ══
     if (bridgePosts.length >= 2) {
       const left = bridgePosts[1], right = bridgePosts[2];
       const midX = (left.x + right.x) / 2;
       const midY = bridgeY - H * .02;
       const deckDrop = bridgeY - midY;
       const span = right.x - left.x;

          // ── Shadow wash: indigo pool beneath the bridge ──
          // Creates a sense of depth and structure: the bridge casts a shadow on the water
       const washY = midY + 8;
       const washH = H * .045;
       const washGrad = ctx.createLinearGradient(0, washY, 0, washY + washH);
       washGrad.addColorStop(0, 'rgba(22,32,64,.1)');
       washGrad.addColorStop(.5, 'rgba(22,32,64,.04)');
       washGrad.addColorStop(1, 'rgba(22,32,64,0)');
       ctx.fillStyle = washGrad;
       ctx.fillRect(left.x - 15, washY, span + 30, washH);

          // ── Primary deck beam: bold arched key-line ──
          // The thick, carved curve that reads as the bridge's main structure
       ctx.strokeStyle = lerpColor(C.paper, C.black, .72);
       ctx.lineWidth = 3.2;
       ctx.lineCap = 'round';
       ctx.beginPath();
       ctx.moveTo(left.x - 2, bridgeY);
       ctx.quadraticCurveTo(midX, midY, right.x + 2, bridgeY);
       ctx.stroke();

          // ── Secondary beam: parallel line for carved thickness ──
       ctx.strokeStyle = lerpColor(C.paper, C.black, .42);
       ctx.lineWidth = 1.8;
       ctx.beginPath();
       ctx.moveTo(left.x - 1, bridgeY + 5);
       ctx.quadraticCurveTo(midX, midY + 5, right.x + 1, bridgeY + 5);
       ctx.stroke();

          // ── Deck planks: subtle horizontal hatches following the arch ──
       ctx.strokeStyle = 'rgba(42,48,72,' + (.06 + tideProgress * .025) + ')';
       ctx.lineWidth = .3;
       const plankCount = Math.floor(span / 7);
       for (let i = 0; i < plankCount; i++) {
         const t = (i + .5) / plankCount;
         const px = left.x + t * span;
            // Bezier interpolation for y following the arch
         const u = t;
         const curveY = (1 - u) * (1 - u) * bridgeY + 2 * (1 - u) * u * midY + u * u * bridgeY;
         const plankY = curveY + 8;
            // Planks skew to follow arch angle
         const skew = Math.sin(u * Math.PI) * -7;
         ctx.beginPath();
         ctx.moveTo(px - 2.5 + skew * .5, plankY);
         ctx.lineTo(px + 2.5 + skew * .5, plankY + Math.sin(u * Math.PI) * 2.5);
         ctx.stroke();
        }

          // ── Tide-revealed: suspension chains and structural details ──
       if (tideProgress > .15) {
         const reveal = Easing.soak((tideProgress - .15) / .85);

              // Suspension chains: vertical links from post tops to deck level
              // These suggest the hanebashi (suspension bridge) style
         ctx.strokeStyle = 'rgba(42,48,72,' + (reveal * .1) + ')';
         ctx.lineWidth = .5;
         const chainPosts = [bridgePosts[0], left, right];
         chainPosts.forEach((cp) => {
            // Chain: from post top to arched deck
           const t_cp = (cp.x - left.x) / span;
           const deckY_at = (1 - t_cp) * (1 - t_cp) * bridgeY + 2 * (1 - t_cp) * t_cp * midY + t_cp * t_cp * bridgeY;
           const chainY_top = cp.y1 - 4;
           const chainY_bot = deckY_at - 3;
           const segments = Math.max(3, Math.floor((chainY_bot - chainY_top) / 6));
           for (let s = 0; s < segments; s++) {
             const st = s / segments;
             const sy = chainY_top + st * (chainY_bot - chainY_top);
             const linkW = 2 + Math.sin(s * 1.3 + cp.x * .01) * .5;
             const linkH = 3;
             ctx.beginPath();
             ctx.arc(cp.x, sy + linkH / 2, linkW, 0, Math.PI);
             ctx.stroke();
              }
            });

              // Post-to-deck connections: small carved brackets at each end
           ctx.strokeStyle = 'rgba(26,32,64,' + (reveal * .07) + ')';
           ctx.lineWidth = .6;
              // Left bracket
           ctx.beginPath();
           ctx.arc(left.x, bridgeY + 3, 2, 0, Math.PI * 2);
           ctx.stroke();
              // Right bracket
           ctx.beginPath();
           ctx.arc(right.x, bridgeY + 3, 2, 0, Math.PI * 2);
           ctx.stroke();

              // Water ripples at post bases: where posts meet water
           ctx.strokeStyle = 'rgba(42,48,72,' + (reveal * .06) + ')';
           ctx.lineWidth = .3;
           bridgePosts.forEach((cp) => {
             const waterY = waterline + 4;
             const rippleW = 6 + reveal * 4;
             ctx.beginPath();
             ctx.arc(cp.x, waterY, rippleW, .1 * Math.PI, .9 * Math.PI);
             ctx.stroke();
          // Second ripple ring
             ctx.beginPath();
             ctx.arc(cp.x, waterY + 3, rippleW * .6, .15 * Math.PI, .85 * Math.PI);
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
      const lanternW = 8;
      const lanternH = 16;

        // ── Carved key-line silhouette: primary black edge (bold, hand-carved) ──
        // Traditional lantern shape: rectangular body with top/bottom caps and hanging ring
      ctx.strokeStyle = 'rgba(26,32,64,' + (.38 + ta * .22) + ')';
      ctx.lineWidth = 1.4;

        // Lantern body outline (rectangular with slight hand-carved irregularity)
      const bump = Math.sin(idx * 3.7 + lx * .01) * .4;
      ctx.beginPath();
      ctx.moveTo(lx - lanternW / 2, ly);
      ctx.lineTo(lx - lanternW / 2 + bump, ly + lanternH);
      ctx.lineTo(lx + lanternW / 2 - bump, ly + lanternH);
      ctx.lineTo(lx + lanternW / 2, ly);
      ctx.closePath();
      ctx.stroke();

        // Woodblock registration offset: ochre pass, slightly shifted (benizuri)
      ctx.strokeStyle = 'rgba(175,85,48,' + (.1 + ta * .07) + ')';
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(lx - lanternW / 2 + 1.8, ly + 1.5);
      ctx.lineTo(lx - lanternW / 2 + bump + 1.6, ly + lanternH + 1.2);
      ctx.lineTo(lx + lanternW / 2 - bump + 2, ly + lanternH + 1.8);
      ctx.lineTo(lx + lanternW / 2 + 1.4, ly + 1.6);
      ctx.closePath();
      ctx.stroke();

        // Second registration offset: cool indigo pass
      ctx.strokeStyle = 'rgba(80,90,130,' + (.06 + ta * .04) + ')';
      ctx.lineWidth = .4;
      ctx.beginPath();
      ctx.moveTo(lx - lanternW / 2 - 1.2, ly - 1);
      ctx.lineTo(lx - lanternW / 2 + bump - 1, ly + lanternH - .8);
      ctx.lineTo(lx + lanternW / 2 - bump - 1.5, ly + lanternH - 1.2);
      ctx.lineTo(lx + lanternW / 2 - .8, ly - 1.4);
      ctx.closePath();
      ctx.stroke();

        // ── Lantern body fill: amber glow, intensity modulated by tide ──
      const bodyFill = .18 + ta * .42;
      ctx.fillStyle = lerpColor(C.paper, C.amber, bodyFill);
      ctx.fillRect(lx - lanternW / 2 + .5, ly + .5, lanternW - 1, lanternH - 1);

        // ── Inner glow: warm amber radiating from center ──
      const glowAlpha = .08 + ta * .2;
      const glowGrad = ctx.createRadialGradient(lx, ly + lanternH / 2, 0, lx, ly + lanternH / 2, lanternW * 1.5);
      glowGrad.addColorStop(0, 'rgba(212,160,74,' + glowAlpha + ')');
      glowGrad.addColorStop(.5, 'rgba(212,160,74,' + (glowAlpha * .25) + ')');
      glowGrad.addColorStop(1, 'rgba(212,160,74,0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(lx - lanternW * 1.5, ly - lanternH * .3, lanternW * 3, lanternH * 1.6);

        // ── Hanging ring and hook at top ──
      ctx.strokeStyle = 'rgba(26,32,64,' + (.3 + ta * .15) + ')';
      ctx.lineWidth = 1;
        // Vertical suspension line from bridge
      ctx.beginPath();
      ctx.moveTo(lx, ly - 12);
      ctx.lineTo(lx, ly - 1);
      ctx.stroke();
        // Hook/crest at top
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(lx - 3, ly - 2);
      ctx.lineTo(lx + 3, ly - 2);
      ctx.stroke();
        // Hanging ring (small circle)
      ctx.lineWidth = .7;
      ctx.beginPath();
      ctx.arc(lx, ly - 5, 2, 0, Math.PI * 2);
      ctx.stroke();

        // ── Bottom cap with small tassel ──
      ctx.strokeStyle = 'rgba(26,32,64,' + (.28 + ta * .12) + ')';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(lx - 4.5, ly + lanternH - .5);
      ctx.lineTo(lx + 4.5, ly + lanternH - .5);
      ctx.stroke();
        // Tassel lines
      ctx.lineWidth = .4;
      const tasselEnd = ly + lanternH + 5 + ta * 3;
      ctx.beginPath();
      ctx.moveTo(lx - 1.5, ly + lanternH);
      ctx.lineTo(lx - 1, tasselEnd);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lx + 1.5, ly + lanternH);
      ctx.lineTo(lx + 1, tasselEnd);
      ctx.stroke();

        // ── Vertical ribs (lantern panel divisions, carved lines) ──
      ctx.strokeStyle = 'rgba(26,32,64,' + (.12 + ta * .08) + ')';
      ctx.lineWidth = .4;
      ctx.beginPath();
      ctx.moveTo(lx - lanternW / 4, ly + 1);
      ctx.lineTo(lx - lanternW / 4, ly + lanternH - 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lx + lanternW / 4, ly + 1);
      ctx.lineTo(lx + lanternW / 4, ly + lanternH - 1);
      ctx.stroke();

        // ── Horizontal bands (top and bottom frame of lantern body) ──
      ctx.strokeStyle = 'rgba(26,32,64,' + (.18 + ta * .1) + ')';
      ctx.lineWidth = .6;
      ctx.beginPath();
      ctx.moveTo(lx - lanternW / 2 + .5, ly + 1);
      ctx.lineTo(lx + lanternW / 2 - .5, ly + 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lx - lanternW / 2 + .5, ly + lanternH - 1);
      ctx.lineTo(lx + lanternW / 2 - .5, ly + lanternH - 1);
      ctx.stroke();

        // ── Tide-revealed: interior pigment speckle and carved character marks ──
      if (ta > .15) {
        const reveal = Easing.soak((ta - .15) * 2.5);
          // Amber speckle dots simulating hand-printed pigment
        _seed = 3000 + idx * 77;
        const dotN = Math.floor(5 + reveal * 6);
        ctx.fillStyle = 'rgba(212,160,74,' + (reveal * .12) + ')';
        for (let s = 0; s < dotN; s++) {
          ctx.beginPath();
          ctx.arc(
            lx + (_sr() - .5) * lanternW * .8,
            ly + 2 + _sr() * (lanternH - 4),
             .4 + _sr() * .8, 0, Math.PI * 2
          );
          ctx.fill();
         }

          // Carved character marks (suggest kanji without committing to legible text)
        ctx.strokeStyle = 'rgba(26,32,64,' + (reveal * .1) + ')';
        ctx.lineWidth = .35;
        const charY = ly + lanternH * .35;
        const charX = lx + (_sr() - .5) * 2;
          // Horizontal stroke
        ctx.beginPath();
        ctx.moveTo(charX - 2.5, charY);
        ctx.lineTo(charX + 2.5, charY + .3);
        ctx.stroke();
          // Vertical stroke
        ctx.beginPath();
        ctx.moveTo(charX + .5, charY - 2);
        ctx.lineTo(charX + .4, charY + 2.5);
        ctx.stroke();
          // Small curved stroke
        ctx.beginPath();
        ctx.arc(charX - 0.5, charY - .5, 1.2, .5, 2.5);
        ctx.stroke();
        }
     });
   }

   /* ─── Lantern Reflections with Deterministic Ripple ───
    * Each lantern reflection is broken into vertical segments.
    * As tide passes, the ripple distort function offsets each segment
    * horizontally, stretches vertically, and modulates color intensity —
    * giving a "wet pigment on paper" look without liquid physics.
    */
  function drawLanternReflections(ctx) {
    lanternXs.forEach((lx, i) => {
      const reflY = waterline + H * (.06 + i * .025);
      const reflH = H * (.16 + i * .02);
      const ta = tideAt(lx);

       // Ripple intensity tied to drag depth + tide
      const rippleInt = pressure * 4.5 + ta * 5.5 + tideProgress * 2.8;
      const stretch = 1 + ta * 1.2 + pressure * .7;

       // Mobile: fewer segments
      const segCount = (W < 600) ? 8 : 18;
      const segH = (reflH * stretch) / segCount;

      for (let s = 0; s < segCount; s++) {
        const segT = s / (segCount - 1);
        const sy = reflY + s * segH;

         // Deterministic ripple offset — same wave for all segments but
         // intensity grows with depth (segT) to simulate wet paper stretching
        const waveX = _rippleDistort(120 + i * 37, s + i * 10, tideProgress * 2, rippleInt * (.3 + segT * .5));
        const microX = _rippleMicro(120 + i * 37, s + i * 10, tideProgress * 2, rippleInt * .2);

         // Vertical stretch factor: deeper = wider blob (pigment bloom)
        const segStretch = stretch * (1 + segT * .6 * ta);
        const segW = (3 + ta * 5) * segStretch;

        const sx = lx + waveX + microX;
        const segAlpha = (.06 + ta * .2) * (1 - segT * .5);

        ctx.fillStyle = 'rgba(212,160,74,' + segAlpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.ellipse(sx, sy, segW * .5, segH * .45 * segStretch, waveX * .02, 0, Math.PI * 2);
        ctx.fill();
       }

       // Amber wash bloom: wide, low-alpha ellipse where tide has soaked
      if (ta > .08) {
        const washX = lx + _rippleDistort(150 + i * 23, 3, tideProgress, rippleInt * .3);
        const washAlpha = (ta - .08) * .06;
        const washRy = (reflH * stretch) * .5;

        ctx.fillStyle = 'rgba(212,160,74,' + washAlpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.ellipse(washX, reflY + washRy, 10 + ta * 8, washRy * .4, 0, 0, Math.PI * 2);
        ctx.fill();
       }

       // Carved cross-hatch lines appear at higher tide
      if (ta > .25) {
        const lineN = (W < 600) ? 2 : 4;
        for (let l = 0; l < lineN; l++) {
          const ly = reflY + (l + .5) * (reflH * stretch / lineN);
          const waveX = _rippleDistort(200 + i * 41, l + i * 7, tideProgress * 1.5, rippleInt * .2);
          const lx2 = lx + waveX;
          const ka = (ta - .25) * .08 * (1 - l * .15);
          const lineLen = 3 + ta * 4;

          ctx.strokeStyle = 'rgba(42,48,72,' + ka.toFixed(3) + ')';
          ctx.lineWidth = .3 + ta * .25;
          ctx.beginPath();
          ctx.moveTo(lx2 - lineLen, ly);
          ctx.lineTo(lx2 + lineLen, ly);
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

         // ── Hull fill: moonlit silhouette, always visible ──
      const hullBase = .35 + ta * .45;
      const hullColor = lerpColor(C.water, C.darkIndigo, hullBase);
      ctx.fillStyle = hullColor;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.h);
      ctx.quadraticCurveTo(b.x + b.w * .15, b.y - b.h * .35, b.x + b.w * .45, b.y - b.h * .55);
      ctx.quadraticCurveTo(b.x + b.w * .85, b.y - b.h * .25, b.x + b.w * .95, b.y + b.h * .4);
      ctx.lineTo(b.x + b.w, b.y + b.h * .8);
      ctx.quadraticCurveTo(b.x + b.w * .5, b.y + b.h * 1.1, b.x, b.y + b.h);
      ctx.closePath();
      ctx.fill();

        // ── Primary key-line: always strong, carved woodblock feel ──
      ctx.strokeStyle = 'rgba(26,32,64,' + (.55 + ta * .35) + ')';
      ctx.lineWidth = 2 + ta * .5;
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

        // ── Reed sway: compound, tide-responsive motion ──
        // Three phases modulate the sway:
        //   1. Ambient: gentle breeze, always present
        //   2. Tide approach: growing displacement as water draws near
        //   3. Tide passage: pronounced bowing as the tide band washes through
        //   4. Settling: slow oscillation decay after release

        // Ambient: multi-frequency slow oscillation
      const ambient1 = Math.sin(clock * .55 + r.phase) * 1.8;
      const ambient2 = Math.sin(clock * 1.1 + r.phase * 2.3 + i * .7) * .6;
      const ambient3 = Math.sin(clock * .18 + i * 1.1) * .4;
      const ambientSway = ambient1 + ambient2 + ambient3;

        // Tide-approach force: sine envelope keyed to distance from tide front
      let tideForce = 0;
      if (tideFront > 0) {
        const distToTide = r.x - tideFront;
        const approachZone = 250 + pressure * 180;
        if (distToTide > -zoneWidth() * .5 && distToTide < approachZone) {
          const approachT = Easing.smoothstep(Math.max(0, Math.min(1, (-distToTide + approachZone) / (approachZone + zoneWidth()))));
          const passageT = ta;
          combinedTide = Easing.inOut(approachT) * (1 - passageT) + passageT;
          tideForce = combinedTide * (8 + pressure * 12) *
            Math.sin(tideProgress * 1.3 + r.phase * .8 + i * .35);
          }
        }

        // Settling oscillation: decaying wave after release
      let settleForce = 0;
      if (settling) {
        const decay = Math.pow(1 - settleProgress, 1.8);
        settleForce = Math.sin(clock * 2.2 + r.phase * 3.1 + i * 1.7) *
          (5 + r.h * .01) * decay;
        }

      const sway = ambientSway + tideForce + settleForce;

        // Moonlit tint on reed tips during tide passage
      const moonlitTint = ta * .08;

      const rAlpha = .55 + ta * .45;
      const stalkColor = lerpColor(C.water, C.reed, rAlpha);

        // ── Primary stalk ──
      ctx.strokeStyle = stalkColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r.x, r.baseY);
      const tipX = r.x + r.lean * r.h * .6 + sway;
      const tipY = r.baseY - r.h;
      const midSwayX = r.x + r.lean * r.h * .25 + sway * .5;
      const midSwayY = r.baseY - r.h * .5;
      ctx.quadraticCurveTo(midSwayX, midSwayY, tipX, tipY);
      ctx.stroke();

        // ── Carved offset line (registration shadow) ──
      ctx.strokeStyle = 'rgba(42,48,72,.12)';
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(r.x + .6, r.baseY - .6);
      ctx.quadraticCurveTo(
        midSwayX + .6, midSwayY - .6,
        tipX + .6, tipY - .6
       );
      ctx.stroke();

        // ── Moonlit highlight on stalk (very faint, only during tide) ──
      if (moonlitTint > .005) {
        ctx.strokeStyle = `rgba(240,240,232,${moonlitTint.toFixed(3)})`;
        ctx.lineWidth = .4;
        ctx.beginPath();
        ctx.moveTo(r.x - .3, r.baseY - 2);
        ctx.quadraticCurveTo(midSwayX - .3, midSwayY, tipX - .3, tipY + 2);
        ctx.stroke();
       }

      if (ta > .15) {
        const stipAlpha = Easing.soak((ta - .15) * 2.5);

        ctx.strokeStyle = 'rgba(90,122,90,' + (stipAlpha * .3) + ')';
        ctx.lineWidth = .7;
        for (let b = 0; b < r.bladeCount; b++) {
          const startT = .55 + b * .12;
          const bSway = sway * startT;
          const sx2 = r.x + r.lean * r.h * startT + bSway;
          const sy2 = r.baseY - r.h * startT;
          ctx.beginPath();
          ctx.moveTo(sx2, sy2);
          const bladeLean = (b % 2 === 0) ? 1 : -1;
            // Blade tip follows sway: deeper bend as tide passes
          const bladeSwayTip = sway * (.3 + ta * .4) * bladeLean;
          ctx.quadraticCurveTo(
            sx2 + bladeLean * (2.5 + b * 1.2) + bladeSwayTip * .5,
            sy2 - 4 - b * 1.5,
            sx2 + bladeLean * (5 + b * 2.5) + bladeSwayTip,
            sy2 - 9 - b * 3
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

   let combinedTide = 0; // module-scoped to carry across reed iteration

    // ─── Tide band: ink soaking into absorbent paper ───
   // The leading edge is never a hard line — instead, indigo pigment
   // appears as stippled dots, lateral bleed strokes, and a soft wash
   // that gradually deepens into the full tide wash behind it.
   function drawTide(ctx) {
     if (tideFront <= 0) return;

     const zone = 180 + pressure * 120;
     const rowH = H * .72;

      // ══ Phase 0: Far-ahead whisper stipple
     // A very faint pre-shadow of dots, suggesting pigment reaching
     // ahead of the visible tide front through capillary fiber paths.
      _seed = 7000 + Math.floor(tideProgress * 40);
     const whisperDepth = 30 + pressure * 20;
     for (let i = 0; i < 12 + Math.floor(pressure * 8); i++) {
       const wx = tideFront - whisperDepth + (_sr() - .5) * whisperDepth;
       const wy = waterline - H * .03 + _sr() * rowH;
       const wR = .2 + _sr() * .6;
       const wA = (.015 + _sr() * .025) * (1 - _sr());
       if (wA > .005) {
         ctx.fillStyle = 'rgba(27,42,74,' + wA.toFixed(3) + ')';
         ctx.beginPath();
         ctx.arc(wx, wy, wR, 0, Math.PI * 2);
         ctx.fill();
          }
        }

      // ══ Phase 1: Leading edge — soft stippled fade-in (no hard cutoff)
     // Density follows a sin-curve: sparse at far edge, peak at tideFront,
     // then fades into the wash. Multi-sampled to avoid banding.
      const leadingEdgeW = 65 + pressure * 35;
      const washStart = Math.max(0, tideFront - leadingEdgeW);
      const washEnd = Math.min(W, tideFront + zone + 10);

        // ══ Leading wave line: carved dark edge that advances like a block print coming alive
        // A visible wavy ink line at the tide front, suggesting the carved block edge
        // sweeping across the paper. Three parallel lines with slight offsets create
        // the hand-printed registration feel.
       {
        const waveYBase = waterline;
        const waveAmp = 2 + pressure * 3;
        const waveFreq = .025 + pressure * .01;
        const lineCount = 3;

        for (let li = 0; li < lineCount; li++) {
          const offset = (li - 1) * (1.5 + pressure * .8);
          const lineAlpha = (.08 + pressure * .06) * (1 - li * .2);
          ctx.strokeStyle = 'rgba(14,26,58,' + lineAlpha.toFixed(3) + ')';
          ctx.lineWidth = .5 + (li === 0 ? .5 : 0);
          ctx.beginPath();
          for (let x = washStart; x <= washEnd; x += 4) {
            const waveOffset = Math.sin(x * waveFreq + tideProgress * 3 + li * 1.2) * waveAmp;
            const vertY = waveYBase + waveOffset + offset + Math.sin(x * .01 + tideProgress) * 8;
            // Only draw within the leading edge zone
            if (x >= tideFront - leadingEdgeW * .5 && x <= tideFront + zone * .12) {
              const edgeNorm = (x - (tideFront - leadingEdgeW * .5)) / (leadingEdgeW * .5 + zone * .12);
              const env = Math.sin(edgeNorm * Math.PI);
              if (env < .1) continue;
              if (x === washStart || Math.abs(x - tideFront) < leadingEdgeW * .5) {
                if (!ctx.isPointInPath) ctx.moveTo(x, vertY);
                else ctx.lineTo(x, vertY);
               }
             }
           }
          ctx.stroke();
         }
       }

        _seed = 8000 + Math.floor(tideProgress * 50);
      for (let x = washStart; x < washEnd; x += 2) {
        const d = x - tideFront;

          // Far ahead of front → whisper zone (handled above, skip here)
          // At front region: dense stipple with sin density envelope
        if (d >= -leadingEdgeW && d <= zone * .15) {
          const edgeT = (d + leadingEdgeW) / (leadingEdgeW + zone * .15);
          const densityEnv = Math.sin(edgeT * Math.PI) * (.5 + pressure * .5);
          const colCount = 1 + Math.floor(densityEnv * 5);
          for (let c = 0; c < colCount; c++) {
            const jx = x + _sr() * 3;
            const jy = waterline - H * .04 + _sr() * rowH;
            const jR = .3 + _sr() * 1.8;
            const baseAlpha = (.04 + pressure * .1);
            const jA = Math.sin(edgeT * Math.PI) * baseAlpha * (.3 + _sr() * .7);
            if (jA > .01) {
              ctx.fillStyle = 'rgba(14,26,58,' + jA.toFixed(3) + ')';
              ctx.beginPath();
              ctx.arc(jx, jy, jR, 0, Math.PI * 2);
              ctx.fill();
                }
              }
            }

          // Ahead of front: indigo wash bars with soft falloff
        if (d > 0) {
          const t = Easing.soak(d / zone);
           // Soft sinusoidal fade: no sharp step into the wash
          const alpha = .025 + Math.sin(t * Math.PI) * (.12 + pressure * .16);
          if (alpha > .015) {
            ctx.fillStyle = 'rgba(27,42,74,' + alpha.toFixed(3) + ')';
            ctx.fillRect(x, waterline - H * .04, 2, H * .72);
              }
            }
        }

      // ══ Phase 1.5: Lateral ink-bleed strokes
     // Short horizontal dashes at the leading edge, suggesting ink
     // spreading laterally through paper fibers (capillary wicking).
     // Only visible when tide is actively advancing.
      _seed = 7500 + Math.floor(tideProgress * 35);
     const bleedZoneW = leadingEdgeW * .6;
     const bleedYStart = waterline - H * .04;
     const bleedYEnd = bleedYStart + rowH;
     const bleedRowCount = Math.floor(10 + pressure * 8);
     for (let i = 0; i < bleedRowCount; i++) {
       const bx = tideFront - bleedZoneW * .5 + _sr() * bleedZoneW;
       const edgePos = (bx - (tideFront - bleedZoneW * .5)) / bleedZoneW;
       const fadeAlpha = Math.sin(edgePos * Math.PI) * (.03 + pressure * .04);
       if (fadeAlpha < .008) continue;

       const by = bleedYStart + _sr() * (bleedYEnd - bleedYStart);
       const bLen = 2 + _sr() * 8;
       const bAngle = (_sr() - .3) * .5; // mostly horizontal, slight tilt

       ctx.strokeStyle = 'rgba(22,32,64,' + fadeAlpha.toFixed(3) + ')';
       ctx.lineWidth = .25 + _sr() * .4;
       ctx.beginPath();
       ctx.moveTo(bx, by);
       ctx.lineTo(bx + bLen * Math.cos(bAngle), by + bLen * Math.sin(bAngle));
       ctx.stroke();
        }

      // ══ Phase 2: Hatch marks (cross-hatch revealed as tide passes)
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

      // ══ Phase 3: Stippled pigment (deeper tide)
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

      // ══ Phase 4: Pigment pooling
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

    // ── Edge stain: mimics ink bleed at the borders of a real woodblock print ──
   // Appears only in settled state, darkening the edges to frame the print.
   function drawEdgeStain(ctx) {
     if (!settled) return;
     const edgeAlpha = .025 + settleBloom * .015;
     const margin = 18 + settleBloom * 8;

        // Top and bottom edges
     {
       const g = ctx.createLinearGradient(0, 0, 0, margin);
       g.addColorStop(0, 'rgba(35,30,22,' + edgeAlpha.toFixed(4) + ')');
       g.addColorStop(1, 'rgba(35,30,22,0)');
       ctx.fillStyle = g;
       ctx.fillRect(0, 0, W, margin);
      }

     {
       const g = ctx.createLinearGradient(0, H - margin, 0, H);
       g.addColorStop(0, 'rgba(35,30,22,0)');
       g.addColorStop(1, 'rgba(35,30,22,' + edgeAlpha.toFixed(4) + ')');
       ctx.fillStyle = g;
       ctx.fillRect(0, H - margin, W, margin);
      }

        // Left and right edges (slightly stronger — traditional ban-eri registration bands)
     {
       const g = ctx.createLinearGradient(0, 0, margin, 0);
       g.addColorStop(0, 'rgba(30,26,18,' + (edgeAlpha * 1.2).toFixed(4) + ')');
       g.addColorStop(1, 'rgba(30,26,18,0)');
       ctx.fillStyle = g;
       ctx.fillRect(0, 0, margin, H);
      }

     {
       const g = ctx.createLinearGradient(W - margin, 0, W, 0);
       g.addColorStop(0, 'rgba(30,26,18,0)');
       g.addColorStop(1, 'rgba(30,26,18,' + (edgeAlpha * 1.2).toFixed(4) + ')');
       ctx.fillStyle = g;
       ctx.fillRect(W - margin, 0, margin, H);
      }
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

      // ─── Registration lines: hand-carved, irregular, variable-weight ───
      // Simulates multi-pass woodblock printing where each color block
      // was carved, inked, and pressed by hand with slight misalignment.
      // Lines are deliberately non-uniform: gaps, weight shifts, and
      // organic wobble to feel carved, not computed.
     // Helper: draws a wobbly line segment with hand-carved feel.
      // Varying weight along the path and random micro-deviations.
    function _drawWobblyLine(ctx, x1, y1, x2, y2, segments, seed) {
      let s = seed;
      function sr() { s = (s * 16807) % 2147483647; return s / 2147483647; }
      const steps = segments || 8;
      const dx = (x2 - x1) / steps;
      const dy = (y2 - y1) / steps;
      let px = x1, py = y1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      for (let i = 1; i <= steps; i++) {
        const jx = x1 + dx * i + (sr() - .5) * 1.4;
        const jy = y1 + dy * i + (sr() - .5) * 1.4;
        const cpx = (px + jx) / 2 + (sr() - .5) * 2;
        const cpy = (py + jy) / 2 + (sr() - .5) * 2;
        ctx.quadraticCurveTo(cpx, cpy, jx, jy);
        px = jx; py = jy;
       }
      ctx.stroke();
      }

     // Helper: draws a wobbly curve (quadratic) with hand-carved feel
    function _drawWobblyQuadratic(ctx, x1, y1, cx, cy, x3, y3, segments, seed) {
      let s = seed;
      function sr() { s = (s * 16807) % 2147483647; return s / 2147483647; }
      const steps = segments || 10;
      let prevX = null, prevY = null;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
         // Bezier formula: (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
        const ut = 1 - t;
        let bx = ut * ut * x1 + 2 * ut * t * cx + t * t * x3 + (sr() - .5) * 1.2;
        let by = ut * ut * y1 + 2 * ut * t * cy + t * t * y3 + (sr() - .5) * 1.2;
        if (i === 0) { ctx.moveTo(bx, by); }
        else if (prevX !== null) {
          const cpx = (prevX + bx) / 2 + (sr() - .5) * 1.8;
          const cpy = (prevY + by) / 2 + (sr() - .5) * 1.8;
          ctx.quadraticCurveTo(cpx, cpy, bx, by);
          }
        prevX = bx; prevY = by;
       }
      ctx.stroke();
      }

    function drawRegistration(ctx) {
      ctx.save();

       // Base visibility: always somewhat visible (woodblock character), grows with tide
      const regBase = .25 + Math.min(.75, tideProgress * .6);
      const settledBoost = settled ? 1.6 : 1;
      const ochreAlpha = (.12 * regBase * settledBoost);
      const indigoAlpha = (.07 * regBase * settledBoost);
      const keyAlpha = (.04 * regBase * settledBoost);

         // ══ PASS 1: Benizuri (warm ochre) — primary registration offset ══

         // Bridge post registration: each post has a unique offset with organic wobble
         // Multiple segments per post with gaps to simulate carved imperfection
      bridgePosts.forEach((p, idx) => {
        const dx = 1.8 + (idx % 3) * .5;
        const dy = -1.4 - ((idx + 1) % 2) * .4;
        const postH = p.y2 - p.y1;
        const segH = postH / 3;
        // Three segments along the post, each with slightly different wobble
        for (let si = 0; si < 3; si++) {
          const sy1 = p.y1 + si * segH + (Math.sin(idx * 3.1 + si) > .3 ? 0 : 2);
          const sy2 = p.y1 + (si + 1) * segH - (Math.cos(idx * 2.7 + si) > .2 ? 0 : 1.5);
          const seed = 10000 + idx * 1000 + si * 100;
          _drawWobblyLine(ctx, p.x + dx, sy1 + dy,
                            p.x + dx + Math.sin(idx * 1.7 + si * 2.3) * 1.2, sy2 + dy,
                            5, seed);
          }
          });

         // Bridge deck curve: ochre offset with wobble
      if (bridgePosts.length >= 2) {
        const leftPost = bridgePosts[1], rightPost = bridgePosts[2];
        const bY = waterline - H * .04;
        const midX_b = (leftPost.x + rightPost.x) / 2;
        const midY_b = bY - H * .018;
        ctx.strokeStyle = 'rgba(175,85,48,' + ochreAlpha.toFixed(3) + ')';
        ctx.lineWidth = .6;
        _drawWobblyQuadratic(ctx, leftPost.x + 1.5, bY - 1.5,
                              midX_b + 1.5, midY_b - 1.2,
                              rightPost.x + 1.5, bY - 1.5,
                              12, 20000);
         // Secondary deck curve offset — thinner, deeper misalignment
        ctx.lineWidth = .35;
        _drawWobblyQuadratic(ctx, leftPost.x + 2.2, bY + 3,
                              midX_b + 2.0, midY_b + 3.2,
                              rightPost.x + 2.3, bY + 3,
                              10, 20100);
          }

         // Moon registration: irregular concentric offset rings
      {
        const moonRegR = moonR + 3;
        const segments = 64;
         // Ochre offset ring with wobbly radius per segment
        ctx.strokeStyle = 'rgba(175,85,48,' + (ochreAlpha * .7).toFixed(3) + ')';
        ctx.lineWidth = .4;
        ctx.beginPath();
        let _mSeed = 30000;
        function _msr() { _mSeed = (_mSeed * 16807) % 2147483647; return _mSeed / 2147483647; }
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
           // Multi-frequency wobble in radius
          const irreg = Math.sin(a * 7) * .9
                      + Math.sin(a * 13 + 1.7) * .5
                      + Math.sin(a * 3.7 - .5) * .7
                      + (_msr() - .5) * .8;
          const rr = moonRegR + irreg * .35;
          const px = moonX + 2 + Math.cos(a) * rr;
          const py = moonY + 1.5 + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          }
        ctx.closePath();
        ctx.stroke();

         // Third pass: deeper offset, more irregular
        const segments2 = 48;
        let _mSeed2 = 30500;
        function _msr2() { _mSeed2 = (_mSeed2 * 16807) % 2147483647; return _mSeed2 / 2147483647; }
        ctx.strokeStyle = 'rgba(175,85,48,' + (ochreAlpha * .3).toFixed(3) + ')';
        ctx.lineWidth = .25;
        ctx.beginPath();
        for (let i = 0; i <= segments2; i++) {
          const a = (i / segments2) * Math.PI * 2;
          const irreg = Math.sin(a * 5 + 2) * 1.2
                      + Math.sin(a * 11 + .7) * .6
                      + (_msr2() - .5) * 1.0;
          const rr = moonRegR + .5 + irreg * .4;
          const px = moonX + 3.5 + Math.cos(a) * rr;
          const py = moonY + 2.5 + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          }
        ctx.closePath();
        ctx.stroke();
       }

         // Lantern registration: irregular offset outlines per lantern
      lanternXs.forEach((lx, idx) => {
        const bY2 = waterline - H * .04;
        const ly = bY2 + 14;
        const lw = 8, lh = 16;
        const bump = Math.sin(idx * 3.7 + lx * .01) * .5;
        ctx.strokeStyle = 'rgba(175,85,48,' + (ochreAlpha * .5).toFixed(3) + ')';
        ctx.lineWidth = .35;
         // Draw as 4 wobbly segments (each side of the lantern body)
        const seed = 40000 + idx * 1000;
        // Top edge
        _drawWobblyLine(ctx, lx - lw/2 + 1.6, ly + 1.2,
                         lx + lw/2 + 1.2, ly + 1.3 + bump, 4, seed + 1);
        // Right edge
        _drawWobblyLine(ctx, lx + lw/2 + 1.2, ly + 1.3 + bump,
                         lx + lw/2 - bump + 1.8, ly + lh + 1.5, 4, seed + 2);
        // Bottom edge
        _drawWobblyLine(ctx, lx + lw/2 - bump + 1.8, ly + lh + 1.5,
                         lx - lw/2 + bump + 1.4, ly + lh + 1, 4, seed + 3);
        // Left edge
        _drawWobblyLine(ctx, lx - lw/2 + bump + 1.4, ly + lh + 1,
                         lx - lw/2 + 1.6, ly + 1.2, 4, seed + 4);
          });

         // Far hill edge: ochre offset with variable gaps
       {
        const hillY_far = (x) => waterline - (.032 + Math.sin(x * .003 + 1.4) * .022 + Math.sin(x * .007 + .3) * .01) * H;
        ctx.strokeStyle = 'rgba(175,85,48,' + (ochreAlpha * .6).toFixed(3) + ')';
        ctx.lineWidth = .4;
        let segSeed = 50000;
        function segSr() { segSeed = (segSeed * 16807) % 2147483647; return segSeed / 2147483647; }
        ctx.beginPath();
        let inLine = true;
        for (let x = 0; x <= W; x += 4) {
          const jitter = Math.sin(x * .27 + 2.1) * .6 + (segSr() - .5) * .8;
           // Occasional gap: skip 8-20px segments to simulate carved imperfection
          if (Math.sin(x * .023) > .75) { inLine = true; }
          if (inLine) {
            const px = x + 1.8;
            const py = hillY_far(x) - 1.4 + jitter;
            if (inLine && (x === 0 || Math.sin((x - 4) * .023) <= .75)) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
            } else {
            ctx.moveTo(x + 1.8, 0); // off-screen skip
            }
          }
        ctx.stroke();
          }

         // ══ PASS 2: Aozuri (cool indigo) — secondary registration offset ══

         // Mid hill edge: indigo offset, opposite direction, with gaps
       {
        const hillY_mid = (x) => waterline - (.025 + Math.sin(x * .004) * .018 + Math.sin(x * .009 + .6) * .008) * H;
        ctx.strokeStyle = 'rgba(80,90,130,' + indigoAlpha.toFixed(3) + ')';
        ctx.lineWidth = .35;
        let aSeed = 60000;
        function aSr() { aSeed = (aSeed * 16807) % 2147483647; return aSeed / 2147483647; }
        ctx.beginPath();
        let inLine2 = true;
        for (let x = 0; x <= W; x += 4) {
          const jitter = Math.cos(x * .33 + 1.5) * .5 + (aSr() - .5) * .6;
          if (Math.cos(x * .019) > .7) { inLine2 = true; }
          if (inLine2) {
            const px = x - 1.4;
            const py = hillY_mid(x) + 1.1 + jitter;
            if (inLine2 && (x === 0 || Math.cos((x - 4) * .019) <= .7)) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
            } else {
            ctx.moveTo(x - 1.4, 0);
            }
          }
        ctx.stroke();
          }

         // Boat registration: irregular offset per boat, variable weight
      boats.forEach((b, idx) => {
        const dx2 = -1.5 - idx * .3;
        const dy2 = .9 + (idx % 3) * .35;
        ctx.strokeStyle = 'rgba(80,90,130,' + (indigoAlpha * .65).toFixed(3) + ')';
        ctx.lineWidth = .3 + (idx % 2) * .15;
         // Draw hull outline as multiple wobbly curve segments
        const seed = 70000 + idx * 1000;
        // Top hull curve (split into two quadratics for more wobble)
        _drawWobblyQuadratic(ctx,
          b.x + dx2, b.y + b.h + dy2,
          b.x + b.w * .18 + dx2, b.y + dy2 - .5,
          b.x + b.w * .45 + dx2, b.y - b.h * .5 + dy2,
          8, seed + 1);
        _drawWobblyQuadratic(ctx,
          b.x + b.w * .45 + dx2, b.y - b.h * .5 + dy2,
          b.x + b.w * .82 + dx2, b.y + dy2 + .3,
          b.x + b.w * .95 + dx2, b.y + b.h * .5 + dy2,
          8, seed + 2);
        // Bottom hull return
        _drawWobblyQuadratic(ctx,
          b.x + b.w * .95 + dx2, b.y + b.h * .5 + dy2,
          b.x + b.w * .5 + dx2, b.y + b.h * 1.1 + dy2,
          b.x + dx2, b.y + b.h + dy2,
          6, seed + 3);
       });

         // Bridge posts: indigo offset with variable wobble per post
      bridgePosts.forEach((p, idx) => {
        const dx = -1.8 - (idx % 2) * .6;
        const dy = 1.6 + ((idx + 2) % 3) * .4;
        const postH = p.y2 - p.y1;
        const segH = postH / 3;
        ctx.strokeStyle = 'rgba(80,90,130,' + (indigoAlpha * .55).toFixed(3) + ')';
        ctx.lineWidth = .3 + (idx % 3) * .08;
        for (let si = 0; si < 3; si++) {
          const sy1 = p.y1 + si * segH + (Math.cos(idx * 3.1 + si) > .3 ? 0 : 2);
          const sy2 = p.y1 + (si + 1) * segH - (Math.sin(idx * 2.7 + si) > .2 ? 0 : 1.5);
          const seed = 75000 + idx * 1000 + si * 100;
          _drawWobblyLine(ctx, p.x + dx, sy1 + dy,
                            p.x + dx + Math.cos(idx * 1.7 + si * 2.3) * 1.0, sy2 + dy,
                            5, seed);
          }
          });

         // Reed registration: sparse, on selected reeds with irregular offsets
      for (let i = 0; i < reeds.length; i += 2) {
        const r = reeds[i];
        const dx = -1.2 + (i % 3) * .6;
        const dy = ((i + 2) % 3) * .8;
        ctx.strokeStyle = 'rgba(80,90,130,' + (indigoAlpha * .3).toFixed(3) + ')';
        ctx.lineWidth = .2;
        const seed = 80000 + i * 700;
        const tipX_r = r.x + r.lean * r.h * .6 + dx + (Math.sin(i * 1.3) * .8);
        const tipY_r = r.baseY - r.h + dy + (Math.cos(i * 1.7) * .8);
        _drawWobblyQuadratic(ctx,
          r.x + dx, r.baseY + dy,
          r.x + r.lean * r.h * .25 + dx + Math.sin(i * 2.1) * .5,
          r.baseY - r.h * .5 + dy,
          tipX_r, tipY_r,
          6, seed);
          }

         // ══ PASS 3: Key block reinforcement — hand-carved dark registration ══
      ctx.strokeStyle = 'rgba(26,32,64,' + keyAlpha.toFixed(3) + ')';
      ctx.lineWidth = .25;

         // Key block: moon registration with tighter offset
        {
        const segments = 56;
        let kSeed = 85000;
        function ksR() { kSeed = (kSeed * 16807) % 2147483647; return kSeed / 2147483647; }
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          const irreg = Math.sin(a * 9) * .7
                      + Math.sin(a * 5 - 1) * .5
                      + (ksR() - .5) * .6;
          const rr = moonR + 2 + irreg * .25;
          const px = moonX - .5 + Math.cos(a) * rr;
          const py = moonY + .3 + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          }
        ctx.closePath();
        ctx.stroke();
       }

         // Key block: bridge deck with tight wobble
      if (bridgePosts.length >= 2) {
        const leftPost = bridgePosts[1], rightPost = bridgePosts[2];
        const bY3 = waterline - H * .04;
        const midX_k = (leftPost.x + rightPost.x) / 2;
        const midY_k = bY3 - H * .018;
        _drawWobblyQuadratic(ctx, leftPost.x - .8, bY3 - .5,
                              midX_k - .8, midY_k - .6,
                              rightPost.x - .8, bY3 - .5,
                              10, 90000);
          }

         // ══ Corner registration marks (kumiko/chokokō) ══
         // Irregular crosshairs with circles — each corner has unique offset per pass
      const mkSize = 8;
      const mkOffset = 14;
      const corners = [
          [mkOffset, mkOffset],
          [W - mkOffset, mkOffset],
          [mkOffset, H - mkOffset],
          [W - mkOffset, H - mkOffset],
          ];

      corners.forEach(([mx, my], idx) => {
        const uniq = idx * 1111;
         // Ochre pass: crosshair + circle, slightly wobbly
        ctx.strokeStyle = 'rgba(175,85,48,' + (.14 * regBase).toFixed(3) + ')';
        ctx.lineWidth = .6;
        _drawWobblyLine(ctx, mx - mkSize - 3 + Math.sin(uniq) * .5, my + Math.cos(uniq) * .4,
                         mx + mkSize + 3 + Math.sin(uniq + 1) * .5, my + Math.cos(uniq + 1) * .4,
                         4, 100000 + idx * 100 + 1);
        _drawWobblyLine(ctx, mx + Math.sin(uniq + 2) * .4, my - mkSize - 3 + Math.cos(uniq + 2) * .5,
                         mx + Math.sin(uniq + 3) * .4, my + mkSize + 3 + Math.cos(uniq + 3) * .5,
                         4, 100000 + idx * 100 + 2);
         // Circle with irregular radius
        ctx.beginPath();
        let cSeed = 100000 + idx * 100 + 3;
        function cSr() { cSeed = (cSeed * 16807) % 2147483647; return cSeed / 2147483647; }
        for (let ci = 0; ci <= 32; ci++) {
          const ca = (ci / 32) * Math.PI * 2;
          const cr = mkSize + Math.sin(ca * 5) * .8 + (cSr() - .5) * .6;
          const cpx = mx + Math.cos(ca) * cr;
          const cpy = my + Math.sin(ca) * cr;
          if (ci === 0) ctx.moveTo(cpx, cpy);
          else ctx.lineTo(cpx, cpy);
          }
        ctx.closePath();
        ctx.stroke();

         // Indigo pass: offset, tighter, more irregular
        ctx.strokeStyle = 'rgba(80,90,130,' + (.07 * regBase).toFixed(3) + ')';
        ctx.lineWidth = .35;
        const offDx = (idx % 2 === 0) ? 1.6 : -1.2;
        const offDy = (idx > 1) ? 1.4 : -1.1;
        _drawWobblyLine(ctx, mx - mkSize + offDx, my + offDy,
                         mx + mkSize + offDx, my + offDy, 4, 110000 + idx * 100 + 1);
        _drawWobblyLine(ctx, mx + offDx, my - mkSize + offDy,
                         mx + offDx, my + mkSize + offDy, 4, 110000 + idx * 100 + 2);
        // Irregular circle
        ctx.beginPath();
        let c2Seed = 110000 + idx * 100 + 3;
        function c2Sr() { c2Seed = (c2Seed * 16807) % 2147483647; return c2Seed / 2147483647; }
        for (let ci = 0; ci <= 28; ci++) {
          const ca = (ci / 28) * Math.PI * 2;
          const cr = mkSize + Math.sin(ca * 6 + 1) * .6 + (c2Sr() - .5) * .5;
          if (ci === 0) ctx.moveTo(mx + offDx + Math.cos(ca) * cr, my + offDy + Math.sin(ca) * cr);
          else ctx.lineTo(mx + offDx + Math.cos(ca) * cr, my + offDy + Math.sin(ca) * cr);
          }
        ctx.closePath();
        ctx.stroke();

         // Key block: smallest, centered
        ctx.strokeStyle = 'rgba(26,32,64,' + (.05 * regBase).toFixed(3) + ')';
        ctx.lineWidth = .2;
        ctx.beginPath();
        ctx.moveTo(mx - 3, my + Math.sin(uniq * .3) * .3);
        ctx.lineTo(mx + 3, my + Math.cos(uniq * .3) * .3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mx + Math.sin(uniq * .5) * .3, my - 3);
        ctx.lineTo(mx + Math.cos(uniq * .5) * .3, my + 3);
        ctx.stroke();
          });

         // ══ Edge registration bands (ban-eri) — irregular gaps ══
         // Variable-length dashed line to simulate the worn woodblock edge
       {
        const bandAlpha = (.03 * regBase * settledBoost).toFixed(3);
        const margin = 5;
        ctx.strokeStyle = 'rgba(26,32,64,' + bandAlpha + ')';
        ctx.lineWidth = .25;
        let eSeed = 120000;
        function eSr() { eSeed = (eSeed * 16807) % 2147483647; return eSeed / 2147483647; }

         // Top edge: variable dash lengths
        ctx.beginPath();
        let x = margin;
        while (x < W - margin) {
          const dashLen = 3 + eSr() * 8;
          const gapLen = 3 + eSr() * 7;
          const yOff = (eSr() - .5) * .8;
          ctx.moveTo(x, margin + yOff);
          ctx.lineTo(Math.min(x + dashLen, W - margin), margin + (eSr() - .5) * .8);
          x += dashLen + gapLen;
          }
        ctx.stroke();

         // Bottom edge
        ctx.beginPath();
        x = margin;
        while (x < W - margin) {
          const dashLen = 3 + eSr() * 8;
          const gapLen = 3 + eSr() * 7;
          const yOff = (eSr() - .5) * .8;
          ctx.moveTo(x, H - margin + yOff);
          ctx.lineTo(Math.min(x + dashLen, W - margin), H - margin + (eSr() - .5) * .8);
          x += dashLen + gapLen;
          }
        ctx.stroke();

         // Left edge
        ctx.beginPath();
        let y = margin;
        while (y < H - margin) {
          const dashLen = 3 + eSr() * 8;
          const gapLen = 3 + eSr() * 7;
          const xOff = (eSr() - .5) * .8;
          ctx.moveTo(margin + xOff, y);
          ctx.lineTo(margin + (eSr() - .5) * .8, Math.min(y + dashLen, H - margin));
          y += dashLen + gapLen;
          }
        ctx.stroke();

         // Right edge
        ctx.beginPath();
        y = margin;
        while (y < H - margin) {
          const dashLen = 3 + eSr() * 8;
          const gapLen = 3 + eSr() * 7;
          const xOff = (eSr() - .5) * .8;
          ctx.moveTo(W - margin + xOff, y);
          ctx.lineTo(W - margin + (eSr() - .5) * .8, Math.min(y + dashLen, H - margin));
          y += dashLen + gapLen;
          }
        ctx.stroke();
          }

         // ══ Tide-revealed: deep registration scars ══
      if (tideProgress > .4) {
        const reveal = Easing.soak((tideProgress - .4) / .6);
        const revealAlpha = reveal * .03 * settledBoost;

         // Moon surface: carved marks with variable angle and length
        let mScarSeed = 130000;
        function mScSr() { mScarSeed = (mScarSeed * 16807) % 2147483647; return mScarSeed / 2147483647; }
        const scarCount = Math.floor(5 + reveal * 10);
        ctx.strokeStyle = 'rgba(26,32,64,' + revealAlpha.toFixed(3) + ')';
        ctx.lineWidth = .15 + mScSr() * .15;
        for (let s = 0; s < scarCount; s++) {
          const sa = mScSr() * Math.PI * 2;
          const sr2 = mScSr() * moonR * .65;
          const sx = moonX + Math.cos(sa) * sr2;
          const sy = moonY + Math.sin(sa) * sr2;
          const angle = sa + (mScSr() - .5) * 1.2;
          const len = 1.5 + mScSr() * 3.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
          ctx.stroke();
          }

         // Bridge posts: third-pass detail with wobble
        ctx.strokeStyle = 'rgba(26,32,64,' + (reveal * .025).toFixed(3) + ')';
        ctx.lineWidth = .2 + (mScSr() - .5) * .1;
        bridgePosts.forEach((p, idx) => {
          const dx3 = .8 * ((idx % 2) ? -1 : 1) + (mScSr() - .5) * .4;
          const dy3 = .5 * ((idx % 2) ? 1 : -1) + (mScSr() - .5) * .3;
          const postH = p.y2 - p.y1;
          const midY = (p.y1 + p.y2) / 2;
           // Draw with a break in the middle for carved feel
          const breakPoint = .3 + mScSr() * .4;
          const breakY = p.y1 + postH * breakPoint + dy3;
          ctx.beginPath();
          ctx.moveTo(p.x + dx3, p.y1 + dy3);
          ctx.lineTo(p.x + dx3 + (mScSr() - .5) * .6, breakY - 3);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(p.x + dx3 + (mScSr() - .5) * .6, breakY + 3);
          ctx.lineTo(p.x + dx3 + (mScSr() - .5) * .8, p.y2 + dy3);
          ctx.stroke();
          });
            }

      ctx.restore();
      }

    // ─── Settle fiber texture generation ───
   // Each settle creates a unique, non-repeating pattern of fiber lines
   // that reinforce the tactile ukiyo-e aesthetic.
   function _generateSettleFibers() {
     _settleFibers = [];
     let s = _settleFiberSeed;
     function sr() {
       s = (s * 16807) % 2147483647;
       return s / 2147483647;
     }

     // Three layers of fiber: long structural fibers, mid-grain, and fine dust
     const density = 15 + Math.floor(tideProgress * 25);

       // Long directional fibers (follow the general paper grain)
     for (let i = 0; i < density * 3; i++) {
       const x = sr() * W;
       const y = sr() * H;
       const len = 10 + sr() * 45;
       const angle = .05 + sr() * .3;
         // Occasional cross-grain fiber for visual interest
       const crossGrain = sr() > .88;
       const finalAngle = crossGrain ? angle + 1.3 : angle;
       _settleFibers.push({
         x, y,
         x2: x + Math.cos(finalAngle) * len,
         y2: y + Math.sin(finalAngle) * len,
         alpha: .012 + sr() * .035,
         width: .2 + sr() * .4,
       });
     }

       // Mid-grain clusters: small groups of fibers near the tide front
     for (let i = 0; i < Math.floor(density * .6); i++) {
       const cx = tideFront + (sr() - .5) * 200;
       const cy = waterline + sr() * H * .5;
       for (let j = 0; j < 2 + Math.floor(sr() * 3); j++) {
         const angle = sr() * Math.PI;
         const len = 3 + sr() * 10;
         _settleFibers.push({
           x: cx + sr() * 8 - 4,
           y: cy + sr() * 8 - 4,
           x2: cx + Math.cos(angle) * len,
           y2: cy + Math.sin(angle) * len,
           alpha: .008 + sr() * .02,
           width: .15 + sr() * .25,
         });
       }
     }

       // Fine speckle: very faint dots scattered near high-tide zones
     for (let i = 0; i < Math.floor(density * .4); i++) {
       _settleFibers.push({
         x: tideFront + (sr() - .5) * 300,
         y: waterline + sr() * H * .6,
         dot: true,
         r: .3 + sr() * .7,
         alpha: .006 + sr() * .015,
       });
     }
   }

   // ─── Draw settle fiber texture ───
   function drawSettleFibers(ctx) {
     if (_fiberTextureAlpha < .001 || _settleFibers.length === 0) return;

     ctx.save();
     let s = _settleFiberSeed + 50000;
     for (let i = 0; i < _settleFibers.length; i++) {
       const f = _settleFibers[i];
       const a = f.alpha * _fiberTextureAlpha;
       if (a < .002) continue;

       if (f.dot) {
         ctx.fillStyle = 'rgba(120,110,90,' + a.toFixed(4) + ')';
         ctx.beginPath();
         ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
         ctx.fill();
       } else {
         ctx.strokeStyle = 'rgba(100,95,80,' + a.toFixed(4) + ')';
         ctx.lineWidth = f.width;
         ctx.beginPath();
         ctx.moveTo(f.x, f.y);
         ctx.lineTo(f.x2, f.y2);
         ctx.stroke();
       }
     }
     ctx.restore();
   }

   // ─── Negative space vignette ───
   // Guides the eye toward center-moon and harbor by darkening edges.
   // Very subtle: 3-5% alpha max. Only visible in settled state.
   function drawVignette(ctx) {
     const vAlpha = settled ? (.035 + settleBloom * .02) : 0;
     if (vAlpha < .005) return;

     const cx = W * .5;
     const cy = H * .4;
     const grad = ctx.createRadialGradient(cx, cy, Math.min(W, H) * .25, cx, cy, Math.max(W, H) * .72);
     grad.addColorStop(0, 'rgba(0,0,0,0)');
     grad.addColorStop(.5, 'rgba(0,0,0,0)');
     grad.addColorStop(.8, 'rgba(20,18,28,' + (vAlpha * .5).toFixed(4) + ')');
     grad.addColorStop(1, 'rgba(15,12,22,' + vAlpha.toFixed(4) + ')');
     ctx.fillStyle = grad;
     ctx.fillRect(0, 0, W, H);
   }

   // ─── Warm paper cast ───
   // Adds a slight warm tone over the entire composition in settled state
   // to simulate aged paper. Reinforces ukiyo-e aesthetic.
   function drawPaperCast(ctx) {
     const castAlpha = settled ? (.03 + settleBloom * .015) : 0;
     if (castAlpha < .005) return;

       // Warm paper tone: very subtle beige overlay
     ctx.fillStyle = 'rgba(230,215,185,' + castAlpha.toFixed(4) + ')';
     ctx.fillRect(0, 0, W, H);
   }

    // ─── Input handlers ───
   function onDown(x, y) {
     pressed = true;
     settling = false;
     resetting = false;
     settled = false;
     lastX = x;
     lastY = y;
     touchX = x;
     touchY = y;
     touchAlpha = 0;
      dragTrail = [{ x, y }];
      releaseRipple = null;
       _fiberTextureAlpha = 0;
       _settleFibers = [];

       // Initialize press feedback: halo and grain compression fire together
        pressHalo = { x, y, t: 0, alpha: 1 };
       pressGrain = { x, y, t: 0, alpha: 1 };
     if (tideFront <= 0) {
       tideFront = x;
       initialTideFront = x;
      }
     tideFrontVel = 0;
     _dirty = true; // force redraw on press
      const el = document.getElementById('final-title');
      if (el) el.classList.remove('visible');
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

        // Generate non-repeating fiber texture for this settle
       _settleFiberSeed = Math.floor(performance.now() % 99999) + frameCount;
       _generateSettleFibers();
       _fiberTextureTarget = .04 + Math.min(.08, tideProgress * .025);
      }
     _dirty = true;
    }

    function resetTouchState() {
      touchX = 0;
      touchY = 0;
      touchAlpha = 0;
      dragTrail = [];
      releaseRipple = null;
       _fiberTextureAlpha = 0;
       _fiberTextureTarget = 0;
      }

   function resetScene() {
     resetting = true;
     resetProgress = 0;
     settling = false;
     settled = false;
     settleBloom = 0;
     tideSettleExtra = 0;
     resetStartTideFront = tideFront;
     resetStartTideProgress = tideProgress;
     _settleFibers = [];
     resetTouchState();
      _dirty = true;
     const el = document.getElementById('final-title');
     if (el) el.classList.remove('visible');
    }

  function idleDrift(t) {
    clock += .014;

      // Fiber texture alpha: ramp up as tide settles, hold, then slow fade
    if (settling) {
      _fiberTextureAlpha += (_fiberTextureTarget - _fiberTextureAlpha) * .03;
       } else if (settled) {
        _fiberTextureAlpha += (_fiberTextureTarget * .9 - _fiberTextureAlpha) * .008;
       } else if (resetting) {
        _fiberTextureAlpha *= (1 - resetProgress * .15);
       } else {
        _fiberTextureAlpha *= .99;
      }

        // Touch glow ramps UP while pressing
    if (pressed) {
      touchAlpha = Math.min(1, touchAlpha + .05);
        // Press feedback: advance halo/grain time, fade as drag engagement grows
      pressHalo.t = Math.min(1, pressHalo.t + .025);
      pressGrain.t = Math.min(1, pressGrain.t + .02);
        // Halo fades faster once pressure builds (drag has taken over)
      pressHalo.alpha *= (1 - pressure * .04 - .008);
      pressGrain.alpha *= (1 - pressure * .05 - .012);
        } else {
         pressHalo.alpha *= .96;
         pressGrain.alpha *= .96;
    }

    if (tideFront > 0) {
      tideFront += Math.sin(t * .7) * .18;
      } else {
      tideFront = Math.sin(t * .45) * 2.5;
      }
    tideProgress += .003;
    pressure = Math.max(0, pressure - .002);

    touchAlpha = Math.max(0, touchAlpha - .025);
    if (touchAlpha < .01) dragTrail = [];

    if (releaseRipple) {
      releaseRipple.t += .01;
      if (releaseRipple.t >= 1) releaseRipple = null;
       }

    if (settling) {
      settleProgress = Math.min(1, settleProgress + .006);
      const sp = settleProgress;

      tideSettleExtra += .18 * (1 - sp * .5);
      tideFront = initialTideFront + tideSettleExtra;

      pressure *= .996;
      settleBloom *= .997;

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
