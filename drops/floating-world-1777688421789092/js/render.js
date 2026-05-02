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
    // New: pigment pooling accents
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

  // ── Touch micro-interaction state ──
  let touchX = 0, touchY = 0;       // current pointer position
  let touchAlpha = 0;                 // 0→1 press glow intensity
  let dragTrail = [];                 // recent positions for trailing stipple
  let releaseRipple = null;          // { x, y, t, alpha } on release

   // Settle state
    let settling = false;
  let settleProgress = 0;        // 0→1 during settle animation
  let settleBloom = 0;           // pigment bloom intensity (fades slowly)
  let tideSettleExtra = 0;       // additional advance during settle
  let settled = false;            // final print state reached

     // Reset state
  let resetting = false;
  let resetProgress = 0;          // 0→1 during reset animation
  let resetStartTideFront = 0;   // tideFront at reset start
  let resetStartTideProgress = 0; // tideProgress at reset start

   // Permanent pigment bloom — accumulates in tide-washed regions
  let pigmentMap = null;        // offscreen canvas for accumulated ink
  let pigmentCtx = null;
  let grainPattern = null;      // pre-baked paper grain pattern
  let initialTideFront = -1;    // saved for reset

  function init(canvas) {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    moonX = W * .8;
    moonY = H * .12;
    moonR = Math.min(W, H) * .055;
    waterline = H * .48;

    // Rebuild pigment map
    pigmentMap = document.createElement('canvas');
    pigmentMap.width = W;
    pigmentMap.height = H;
    pigmentCtx = pigmentMap.getContext('2d');

    // Pre-bake paper grain pattern (procedural)
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
   }

  // ─── Paper grain: pre-baked procedural noise pattern ───
  function _bakeGrainPattern() {
    const sz = 256;
    const gc = document.createElement('canvas');
    gc.width = sz;
    gc.height = sz;
    const gctx = gc.getContext('2d');
    const img = gctx.createImageData(sz, sz);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 180 + Math.random() * 60;
      img.data[i] = v;
      img.data[i + 1] = v - 5;
      img.data[i + 2] = v - 12;
      img.data[i + 3] = 35; // very faint alpha
     }
    gctx.putImageData(img, 0, 0);
    grainPattern = document.createElement('canvas');
    grainPattern.width = sz;
    grainPattern.height = sz;
    grainPattern.getContext('2d').drawImage(gc, 0, 0);
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

  // Deterministic seeded random for stippling consistency per frame
  let _seed = 42;
  function _sr() {
    _seed = (_seed * 16807 + 0) % 2147483647;
    return _seed / 2147483647;
   }

  // ─── Tide query ───
  function tideAt(x) {
    if (tideFront <= 0) return 0;
    const d = x - tideFront;
    if (d < 0) return 0;
    const zone = 180 + pressure * 120;
    if (d > zone) return 1;
    // Smooth S-curve instead of linear: feels like ink soaking in
    return _smoothstep(d / zone);
   }
  function _smoothstep(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
   }

  // ─── Main draw pipeline ───
  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    drawPaper(ctx);
    drawSky(ctx);
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
    // Permanent pigment bloom layer (accumulated ink on paper)
    drawPigmentLayer(ctx);
    // Paper grain
    drawPaperGrain(ctx);
    // Registration lines (offset ghost lines)
    drawRegistration(ctx);
    // Touch micro-interactions drawn on top
    drawTouchGlow(ctx);
    drawGrainShift(ctx);
    drawDragTrailStipple(ctx);
    drawReleaseRipple(ctx);
   }

  function drawPaper(ctx) {
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, W, H);
    // Subtle warm paper variation
    const warm = ctx.createRadialGradient(W * .35, H * .35, 0, W * .5, H * .5, W * .7);
    warm.addColorStop(0, 'rgba(245,240,228,.3)');
    warm.addColorStop(1, 'rgba(230,224,210,.1)');
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, W, H);
   }

  // ─── Sky: flat muted wash, no gradients ───
  function drawSky(ctx) {
    ctx.fillStyle = '#B5BFCB';
    ctx.fillRect(0, 0, W, waterline);
    // Second pass: lighter wash near horizon
    ctx.fillStyle = 'rgba(200,208,219,.45)';
    ctx.fillRect(0, waterline - H * .08, W, H * .08);

    // Moon craters: tiny dark dots on the moon face
    // Drawn after moon to give carved detail
   }

  function drawHills(ctx) {
    const baseAlpha = .42 - tideProgress * .08;
    const hillY = (x) => waterline - (.022 + Math.sin(x * .004) * .015 + Math.sin(x * .009) * .007) * H;

    // Reed-green wash
    ctx.fillStyle = 'rgba(90,122,90,' + baseAlpha + ')';
    ctx.beginPath();
    ctx.moveTo(0, waterline);
    for (let x = 0; x <= W; x += 3) ctx.lineTo(x, hillY(x));
    ctx.lineTo(W, waterline);
    ctx.fill();

    // Key line (carved black outline)
    ctx.strokeStyle = 'rgba(42,48,72,.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
       if (x === 0) ctx.moveTo(x, hillY(x));
       else ctx.lineTo(x, hillY(x));
     }
    ctx.stroke();

    // Carved hatch marks on hills (traditional ukiyo-e shading)
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

  function drawWater(ctx) {
    // Flat wash instead of gradient
    ctx.fillStyle = C.water;
    ctx.fillRect(0, waterline, W, H - waterline);
    // Defer to a slightly darker band at bottom
    ctx.fillStyle = 'rgba(106,125,144,.35)';
    ctx.fillRect(0, waterline + H * .45, W, H * .25);

    // Wave lines: minimal, like hand-drawn horizontal strokes
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

  // ─── Moonlight shimmer on water: small luminous sparkles, deterministic ───
  function drawMoonlightShimmer(ctx) {
    // Only draws in water region
    _seed = 333 + Math.floor(clock * 37) % 10000;
    // Number of sparkles scales with screen width
    const count = Math.min(18, Math.floor(W / 45));
    for (let i = 0; i < count; i++) {
      // Deterministic x position from seeded random
      const sx = _sr() * W;
      const cy = moonY * 1.2;
      // Vertical position: weighted toward center of water region
      const waveY = Math.sin(sx * .003 + clock * .4 + i * 1.7) * H * .04;
      const sy = waterline + H * (.08 + _sr() * .55) + waveY;
      // Proximity to moon column center increases intensity
      const dx = Math.abs(sx - moonX);
      const proximity = Math.max(0, 1 - dx / (W * .35));
      // Shimmer: slow dual-frequency modulation (organic, not random)
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

  // ─── Moonlight column: soft luminous path from moon to water ───
  function drawMoonlightColumn(ctx) {
    const breath = Math.sin(clock * .25) * .5 + .5;
    const baseAlpha = .015 + breath * .012;
    const colW = moonR * 2.2;
    const topY = waterline - H * .06;
    // Tapered column via stacked ellipses
    const rows = 12;
    for (let r = 0; r < rows; r++) {
      const t = r / rows;
      const y = topY + t * H * .55;
      // Width narrows near moon, widens toward water surface
      const w = colW * (.3 + t * .7);
      const rowAlpha = baseAlpha * (1 - t * .4);
      ctx.fillStyle = 'rgba(240,240,232,' + rowAlpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(moonX, y, w, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMoon(ctx) {
    // Outer glow ring
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

    // Moon disc
    ctx.fillStyle = C.moon;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Craters: carved dots on the moon
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

    // Tide deepens the reflection (ink soaked in)
    const columnN = 10;
    for (let i = 0; i < columnN; i++) {
       const ry = reflY + i * 6;
       const rx = moonX + Math.sin(i * .55 + tideProgress * 1.8) * (1.5 + i * .35);
       const rw = mR * (.35 + i * .09) * (1 + ta * .3); // stretches wider as tide deepens
       const alpha = (.1 * (1 - ta * .5)) + .04;

       ctx.fillStyle = 'rgba(240,240,232,' + alpha + ')';
       ctx.beginPath();
       ctx.ellipse(rx, ry, rw, 1.4, 0, 0, Math.PI * 2);
       ctx.fill();
     }

    // Carved reflection key lines
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

    // Post outlines
    ctx.strokeStyle = lerpColor(C.paper, C.black, .6);
    ctx.lineWidth = 3;
    bridgePosts.forEach(p => {
       ctx.beginPath();
       ctx.moveTo(p.x, p.y1);
       ctx.lineTo(p.x, p.y2);
       ctx.stroke();
       // Carved detail: subtle second line offset (woodblock registration effect)
       ctx.strokeStyle = 'rgba(42,48,72,.12)';
       ctx.lineWidth = .8;
       ctx.beginPath();
       ctx.moveTo(p.x + .8, p.y1 - .8);
       ctx.lineTo(p.x + .8, p.y2 - .8);
       ctx.stroke();
      });

    if (bridgePosts.length >= 2) {
       const left = bridgePosts[1], right = bridgePosts[2];
       ctx.strokeStyle = lerpColor(C.paper, C.black, .5);
       ctx.lineWidth = 2.5;

       ctx.beginPath();
       ctx.moveTo(left.x, bridgeY);
       const midX = (left.x + right.x) / 2;
       const midY = bridgeY - H * .018;
       ctx.quadraticCurveTo(midX, midY, right.x, bridgeY);
       ctx.stroke();

        // Bridge underside hatch marks (ukiyo-e carved shading)
       ctx.strokeStyle = 'rgba(42,48,72,.08)';
       ctx.lineWidth = .4;
       const span = right.x - left.x;
       for (let i = 0; i < span / 5; i++) {
         const t = i / (span / 5);
         const bx = left.x + t * span;
         const by = bridgeY + H * .008;
         ctx.beginPath();
         ctx.moveTo(bx, by);
         ctx.lineTo(bx + 4, by + 2.5);
         ctx.stroke();
        }

       // Second arch line
       ctx.strokeStyle = lerpColor(C.paper, C.black, .35);
       ctx.lineWidth = 1.8;
       ctx.beginPath();
       ctx.moveTo(left.x, bridgeY + 6);
       ctx.quadraticCurveTo(midX, midY + 6, right.x, bridgeY + 6);
       ctx.stroke();
     }
   }

  function drawLanterns(ctx) {
    const bridgeY = waterline - H * .04;

    lanternXs.forEach((lx, idx) => {
       const ly = bridgeY + 14;
       const ta = tideAt(lx);

        // Lantern body: deepens with tide
       ctx.fillStyle = lerpColor(C.black, C.amber, .25 + ta * .55);
       ctx.fillRect(lx - 4, ly, 9, 14);

        // Key line: carved outline
       ctx.strokeStyle = 'rgba(42,48,72,.35)';
       ctx.lineWidth = .8;
       ctx.strokeRect(lx - 4, ly, 9, 14);

        // Inner glow: amber radiance (stronger as tide reveals)
       const glowAlpha = .12 + ta * .25;
       ctx.fillStyle = 'rgba(212,160,74,' + glowAlpha + ')';
       ctx.fillRect(lx - 6, ly - 3, 14, 19);

        // Top/cap detail
       ctx.fillStyle = 'rgba(42,48,72,.25)';
       ctx.fillRect(lx - 5, ly - 1, 11, 2);
       ctx.fillRect(lx - 5, ly + 14, 11, 2);

        // Small stipple dots on lantern body (carved pigment granulation)
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

  // ─── Lantern reflections: stretch and ripple as tide deepens ───
  function drawLanternReflections(ctx) {
    lanternXs.forEach((lx, i) => {
       const reflY = waterline + H * (.06 + i * .025);
       const reflH = H * (.14 + i * .02);
       const ta = tideAt(lx);
       const alpha = .08 + ta * .22;

        // Main column glow (stretches as tide passes)
       const stretch = 1 + ta * .8; // up to 1.8x longer
       const colH = reflH * stretch;

       // Draw as a series of segments for organic feel
       const segH = 4;
       for (let sy = reflY; sy < reflY + colH; sy += segH) {
         const segT = (sy - reflY) / colH;
         const sx = lx + Math.sin(sy * .06 + i * 1.3 + tideProgress * 2) * (2 + segT * 3);
         const segAlpha = alpha * (1 - segT * .6);
         ctx.fillStyle = 'rgba(212,160,74,' + segAlpha + ')';
         ctx.fillRect(sx - 2, sy, 4, segH - 1);
        }

        // Wider amber wash at base
       if (ta > .1) {
         const washAlpha = (ta - .1) * .08;
         ctx.fillStyle = 'rgba(212,160,74,' + washAlpha + ')';
         ctx.beginPath();
         ctx.ellipse(lx, reflY + colH * .5, 12 + ta * 6, colH * .3, 0, 0, Math.PI * 2);
         ctx.fill();
        }

        // Carved key lines on reflection
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

        // Hull shape
       const hullColor = lerpColor(C.water, C.darkIndigo, .2 + ta * .6);
       ctx.fillStyle = hullColor;
       ctx.beginPath();
       ctx.moveTo(b.x, b.y + b.h);
       ctx.quadraticCurveTo(b.x + b.w * .18, b.y - b.h * .3, b.x + b.w * .5, b.y - b.h * .5);
       ctx.quadraticCurveTo(b.x + b.w * .82, b.y - b.h * .3, b.x + b.w, b.y + b.h);
       ctx.closePath();
       ctx.fill();

        // Carved key line
       ctx.strokeStyle = 'rgba(42,48,72,' + (.28 + ta * .42) + ')';
       ctx.lineWidth = 1.4;
       ctx.beginPath();
       ctx.moveTo(b.x, b.y + b.h);
       ctx.quadraticCurveTo(b.x + b.w * .18, b.y - b.h * .3, b.x + b.w * .5, b.y - b.h * .5);
       ctx.quadraticCurveTo(b.x + b.w * .82, b.y - b.h * .3, b.x + b.w, b.y + b.h);
       ctx.closePath();
       ctx.stroke();

        // Registration offset ghost
       ctx.strokeStyle = 'rgba(180,90,50,' + (.04 + ta * .04) + ')';
       ctx.lineWidth = .6;
       ctx.beginPath();
       ctx.moveTo(b.x + 1.2, b.y + b.h - 1.2);
       ctx.quadraticCurveTo(b.x + b.w * .18 + 1.2, b.y - b.h * .3 - 1.2, b.x + b.w * .5 + 1.2, b.y - b.h * .5 - 1.2);
       ctx.quadraticCurveTo(b.x + b.w * .82 + 1.2, b.y - b.h * .3 - 1.2, b.x + b.w + 1.2, b.y + b.h - 1.2);
       ctx.closePath();
       ctx.stroke();

       if (ta > .1) {
         // ── Carved hatch marks: angled, variable length ──
         const hatchAlpha = _smoothstep((ta - .1) * 2) * .28;
         ctx.strokeStyle = 'rgba(42,48,72,' + hatchAlpha + ')';
         ctx.lineWidth = .5;
         const step = 4;
         const n = Math.floor(b.w / step);
         for (let k = 0; k < n; k++) {
           const frac = k / n;
           const byTop = b.y - b.h * (.5 * (1 - Math.pow(2 * frac - 1, 2)));
           const byBot = b.y + b.h;
           const hx = b.x + k * step + 2;
            // Alternate angle for hand-carved feel
           const angle = (k % 2 === 0) ? 1.8 : -1.2;
           const len = 3 + (k % 3);
           for (let hy = byTop + 2; hy < byBot; hy += 4) {
             ctx.beginPath();
             ctx.moveTo(hx, hy);
             ctx.lineTo(hx + len * .6, hy + angle);
             ctx.stroke();
            }
          }

         // ── Stippled pigment: granular dots (consistent seed per frame) ──
         if (ta > .35) {
           const stipAlpha = _smoothstep((ta - .35) * 2.5) * .16;
           const dotCount = Math.floor(6 + ta * 10);
           ctx.fillStyle = 'rgba(27,42,74,' + stipAlpha + ')';
           _seed = 42 + i * 100 + Math.floor(tideProgress * 10);
           for (let s = 0; s < dotCount; s++) {
             const sx = b.x + _sr() * b.w;
             const frac = (sx - b.x) / b.w;
             const syBase = b.y - b.h * (.5 * (1 - Math.pow(2 * frac - 1, 2)));
             const sy = syBase + _sr() * (b.y + b.h - syBase);
             ctx.beginPath();
             ctx.arc(sx, sy, .5 + _sr() * 1.2, 0, Math.PI * 2);
             ctx.fill();
            }
          }

         // ── Pigment pool: darker spot where ink collects at keel ──
         if (ta > .5) {
           const poolAlpha = _smoothstep((ta - .5) * 2) * .12;
           ctx.fillStyle = 'rgba(22,32,64,' + poolAlpha + ')';
           ctx.beginPath();
           ctx.ellipse(b.x + b.w * .45, b.y + b.h * .85, b.w * .3, b.h * .4, 0, 0, Math.PI * 2);
           ctx.fill();
          }
        }

        // ── Boat interior detail (appears at high tide) ──
       if (ta > .7) {
         const detAlpha = (ta - .7) * .15;
         // Small line suggesting a cabin/thatch
         ctx.strokeStyle = 'rgba(107,88,69,' + detAlpha + ')';
         ctx.lineWidth = .6;
         const cabinX = b.x + b.w * .35;
         const cabinW = b.w * .15;
         const cabinH = b.h * .6;
         ctx.strokeRect(cabinX, b.y - b.h * .2, cabinW, cabinH);
        }

       ctx.restore();
      });
   }

  function drawReeds(ctx) {
    reeds.forEach((r, i) => {
       const ta = tideAt(r.x);
       // Dual-frequency organic sway: slow base + subtle secondary ripple
      const base = Math.sin(clock * .55 + r.phase) * 1.8;
      const rip = Math.sin(clock * 1.1 + r.phase * 2.3 + i * .7) * .6;
      const breath = Math.sin(clock * .18 + i * 1.1) * .4;
      const sway = base + rip + breath + ta * Math.sin(tideProgress * .7 + r.phase);

       const rAlpha = .4 + ta * .5;
       const stalkColor = lerpColor(C.water, C.reed, rAlpha);

        // Stalk main stroke
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

        // Key line for carved feel (offset shadow)
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

        // Reed top tufts: blade segments and stippled dots
       if (ta > .15) {
         const stipAlpha = _smoothstep((ta - .15) * 2.5);

          // Blade segments: hand-carved angled strokes
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

          // Stippled dots at tips
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

        // Base stippling (where reed enters water, pigment collects)
       if (ta > .5) {
         const baseAlpha = _smoothstep((ta - .5) * 2) * .08;
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

  // ─── Tide band: the main ink wash ───
  function drawTide(ctx) {
    if (tideFront <= 0) return;

    const zone = 180 + pressure * 120;

    // ── Phase 1: Indigo wash column (ink soaking into paper) ──
    for (let x = Math.max(0, tideFront - 10); x < Math.min(W, tideFront + zone + 10); x += 2) {
       const d = x - tideFront;
       if (d < 0 || d > zone) continue;
       const t = _smoothstep(d / zone);

        // Primary indigo wash: fades toward edges like absorbent paper
       const alpha = .06 + Math.sin(t * Math.PI) * (.18 + pressure * .22);
       if (alpha > .025) {
         ctx.fillStyle = 'rgba(27,42,74,' + alpha.toFixed(3) + ')';
         ctx.fillRect(x, waterline - H * .04, 2, H * .72);
        }

        // Wave front edge: dark ink border (carved line)
       if (t > .01 && t < .09) {
         const edgeAlpha = .45 * Math.sin(t / .09 * Math.PI);
         ctx.strokeStyle = 'rgba(27,42,74,' + edgeAlpha + ')';
         ctx.lineWidth = 2.5 + pressure * 1.5;
         ctx.beginPath();
         ctx.moveTo(x, waterline - H * .05);
         const wave = Math.sin(x * .02 + tideProgress * 3) * 3;
         ctx.lineTo(x + wave, waterline + H * .65);
         ctx.stroke();

          // Ink wetness: pale highlight just behind the front
         ctx.strokeStyle = 'rgba(240,240,232,' + (edgeAlpha * .35) + ')';
         ctx.lineWidth = .7;
         ctx.beginPath();
         ctx.moveTo(x + 3, waterline - H * .05);
         ctx.lineTo(x + 3 + wave, waterline + H * .65);
         ctx.stroke();
        }
     }

    // ── Phase 2: Carved hatch marks (fine, staggered, per-column) ──
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

        // Multiple staggered hatch rows with varied angles
       const rows = 3;
       for (let row = 0; row < rows; row++) {
         const baseY = waterline - H * .03 + row * (H * .23);
         const angle = (row % 2 === 0) ? 2.2 : -1.6; // alternating angles
         const len = 3 + ((x + row * 7) % 4); // varied length
         const off = (row % 3) * 2.5; // horizontal stagger

         ctx.beginPath();
         ctx.moveTo(x + off, baseY + _sr() * 3);
         ctx.lineTo(x + off + len * .6, baseY + _sr() * 3 + angle);
         ctx.stroke();
        }
     }

    // ── Phase 3: Stippled pigment (granular, tide-reactive dots) ──
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

    // ── Phase 4: Pigment pooling in tide band (darker collect areas) ──
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

    // ─── Permanent pigment layer: tide leaves lasting ink marks ───
  function drawPigmentLayer(ctx) {
    if (tideFront <= 0 && !resetting && settleBloom < .01) return;

      // Accumulate new ink into offscreen canvas
    const zone = 180 + pressure * 120;
    const advanceX = Math.max(0, tideFront - 2);
    const paintW = Math.min(12, zone * .05);

    if (pressed && paintW > 0) {
      pigmentCtx.fillStyle = 'rgba(27,42,74,.015)';
      pigmentCtx.fillRect(advanceX, waterline - H * .04, paintW, H * .72);

        // Stipple into pigment layer
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

      // Draw accumulated pigment onto main canvas
    if (pigmentMap) {
      ctx.globalAlpha = .85;
      ctx.drawImage(pigmentMap, 0, 0);
      ctx.globalAlpha = 1;
       }

      // ── Settle pigment bloom: soft indigo glow at tide edge ──
    if (settleBloom > .005) {
      const bloomX = tideFront;
      const bloomWidth = 80 + settleBloom * 120;
      const bloomAlpha = settleBloom * .12;

        // Radial bloom: soft indigo pooling
      const grad = ctx.createRadialGradient(
        bloomX, waterline + H * .3, 0,
        bloomX, waterline + H * .3, bloomWidth
        );
        // Deep indigo core, fading to nearly nothing
      grad.addColorStop(0, 'rgba(22,32,64,' + (bloomAlpha * 1.5).toFixed(3) + ')');
      grad.addColorStop(.4, 'rgba(27,42,74,' + (bloomAlpha * .7).toFixed(3) + ')');
      grad.addColorStop(.8, 'rgba(43,58,103,' + (bloomAlpha * .25).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(43,58,103,0)');

      ctx.fillStyle = grad;
      ctx.fillRect(bloomX - bloomWidth, waterline - H * .04, bloomWidth * 2, H * .72);

        // Secondary bloom: lighter, wider (pigment bleeding into paper fibers)
      const grad2 = ctx.createRadialGradient(
        bloomX + 30, waterline + H * .35, 0,
        bloomX + 30, waterline + H * .35, bloomWidth * .7
        );
      grad2.addColorStop(0, 'rgba(43,58,103,' + (bloomAlpha * .4).toFixed(3) + ')');
      grad2.addColorStop(1, 'rgba(43,58,103,0)');

      ctx.fillStyle = grad2;
      ctx.fillRect(bloomX - bloomWidth * .5, waterline, bloomWidth * 1.5, H * .5);

                // Bloom stipple: fine dots spreading outward (simulates pigment granulation into paper)
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

  // ─── Paper grain: procedural texture overlay ───
  function drawPaperGrain(ctx) {
    if (grainPattern) {
       ctx.save();
       ctx.globalAlpha = .06;
       const pat = ctx.createPattern(grainPattern, 'repeat');
       if (pat) {
         ctx.fillStyle = pat;
         ctx.fillRect(0, 0, W, H);
        }
       ctx.restore();
     }

    // Additional subtle fiber lines
    ctx.save();
    ctx.globalAlpha = .02;
    ctx.strokeStyle = 'rgba(42,48,72,1)';
    ctx.lineWidth = .25;
    _seed = 700;
    for (let i = 0; i < 20; i++) {
       const yy = _sr() * H;
       const xx = _sr() * W;
       ctx.beginPath();
       ctx.moveTo(xx, yy);
       ctx.lineTo(xx + 8 + _sr() * 20, yy + (_sr() - .5) * 4);
       ctx.stroke();
     }
    ctx.restore();
  }

 // ── Touch glow: soft indigo pool under finger on press ──
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

    // Subtle amber highlight ring (lantern warmth reflected through wet paper)
    if (touchAlpha > .3) {
      const ringAlpha = (touchAlpha - .3) * .08;
      ctx.strokeStyle = 'rgba(212,160,74,' + ringAlpha.toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(touchX, touchY, glowR * .6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ── Grain shift: concentrated paper grain disturbance under finger ──
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

  // ── Drag trail stipple: tiny ink dots trailing behind finger movement ──
  function drawDragTrailStipple(ctx) {
    if (dragTrail.length < 2 || !pressed) return;

    _seed = 2000 + Math.floor(clock * 200);
    ctx.fillStyle = 'rgba(27,42,74,' + (.02 + pressure * .04) + ')';

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

  // ── Release ripple: expanding circle on touch release ──
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

    // Second inner ripple (delayed start, carved feel)
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

  // ─── Registration lines: visible woodblock offset ghosts ───
  function drawRegistration(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(175,85,48,.09)';
    ctx.lineWidth = .5;

     // Bridge post offset ghosts (warmer red-brown = classic registration color)
    bridgePosts.forEach(p => {
       ctx.beginPath();
       ctx.moveTo(p.x + 1.5, p.y1 - 1.5);
       ctx.lineTo(p.x + 1.5, p.y2 - 1.5);
       ctx.stroke();

        // Second, wider offset (multi-pass registration look)
       ctx.strokeStyle = 'rgba(175,85,48,.05)';
       ctx.beginPath();
       ctx.moveTo(p.x - 2, p.y1 + 2);
       ctx.lineTo(p.x - 2, p.y2 + 2);
       ctx.stroke();
       ctx.strokeStyle = 'rgba(175,85,48,.09)';
      });

     // Boat outline offset ghosts
    boats.forEach(b => {
       ctx.strokeStyle = 'rgba(175,85,48,.07)';
       ctx.beginPath();
       ctx.moveTo(b.x + 1, b.y + b.h - 1);
       ctx.quadraticCurveTo(b.x + b.w * .18 + 1, b.y - 1, b.x + b.w * .5 + 1, b.y - b.h * .45 - 1);
       ctx.quadraticCurveTo(b.x + b.w * .82 + 1, b.y - 1, b.x + b.w + 1, b.y + b.h - 1);
       ctx.stroke();
      });

     // Corner registration marks (traditional Japanese print markers)
    ctx.strokeStyle = 'rgba(175,85,48,.12)';
    ctx.lineWidth = .7;
    const mkSize = 8;
    const mkOffset = 14;
    const marks = [
       [mkOffset, mkOffset],
       [W - mkOffset, mkOffset],
       [mkOffset, H - mkOffset],
       [W - mkOffset, H - mkOffset],
     ];
    marks.forEach(([mx, my]) => {
        // Horizontal and vertical crosshair
       ctx.beginPath();
       ctx.moveTo(mx - mkSize - 4, my);
       ctx.lineTo(mx + mkSize + 4, my);
       ctx.stroke();
       ctx.beginPath();
       ctx.moveTo(mx, my - mkSize - 4);
       ctx.lineTo(mx, my + mkSize + 4);
       ctx.stroke();

        // Small circle at intersection
       ctx.beginPath();
       ctx.arc(mx, my, mkSize, 0, Math.PI * 2);
       ctx.stroke();

        // Offset copy (second registration pass)
       ctx.strokeStyle = 'rgba(175,85,48,.06)';
       ctx.beginPath();
       ctx.moveTo(mx - mkSize - 2, my + 1.5);
       ctx.lineTo(mx + mkSize + 2, my + 1.5);
       ctx.stroke();
       ctx.strokeStyle = 'rgba(175,85,48,.12)';
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
    touchAlpha = 1;
    dragTrail = [{ x, y }];
    releaseRipple = null;
    if (tideFront <= 0) {
        tideFront = x;
        initialTideFront = x;
        }
      }

  function onMove(x, y) {
    if (!pressed) return;
    const dx = x - lastX;
    const dist = Math.abs(dx);
    pressure = Math.min(1, pressure + dist * .004);

    tideFront = Math.max(0, Math.min(W, tideFront + dx * .5));
    tideProgress += dist * .007;

     // Track touch for visual feedback
    touchX = x;
    touchY = y;
    dragTrail.push({ x, y });
     // Keep trail to last 20 points
    if (dragTrail.length > 20) dragTrail.shift();

    lastX = x;
    lastY = y;
   }

  function onUp() {
    pressed = false;
    pressure = Math.max(0, pressure - .08);
    tideProgress += .3;

      // Trigger release ripple visual
    releaseRipple = { x: touchX, y: touchY, t: 0, alpha: .6 };

       // Begin settle: slow, intentional advance + pigment bloom
    if (!resetting) {
      settling = true;
      settleProgress = 0;
      settleBloom = Math.max(.15, pressure * .6 + tideProgress * .02);
      tideSettleExtra = 0;
      initialTideFront = tideFront;
       }
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
         }

  function idleDrift(t) {
   clock += .016;
   if (tideFront > 0) {
    tideFront += Math.sin(t * 1.1) * .25;
     } else {
       // Subtle idle shimmer at origin
    tideFront = Math.sin(t * 0.7) * 2;
     }
   tideProgress += .004;
   pressure = Math.max(0, pressure - .0025);

    // Touch feedback decay
   touchAlpha = Math.max(0, touchAlpha - .03);
    if (touchAlpha < .01) dragTrail = [];

    // Advance release ripple
   if (releaseRipple) {
     releaseRipple.t += .012;
     if (releaseRipple.t >= 1) releaseRipple = null;
    }

         // ── Settle animation ──
    if (settling) {
      settleProgress = Math.min(1, settleProgress + .005);
      const sp = settleProgress;

          // Slow, intentional tide advance during settle
      tideSettleExtra += .15 * (1 - sp * .6);
      tideFront = initialTideFront + tideSettleExtra;

          // Gentle pressure decay
      pressure *= .995;

          // Bloom fades very slowly
      settleBloom *= .998;

            // When settle reaches ~1, transition to idle (but bloom persists)
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

        // ── Reset animation: smooth return to origin ──
    if (resetting) {
      resetProgress = Math.min(1, resetProgress + .008);
      const rp = _smoothstep(resetProgress);

            // Tide front slides back from current position to origin
       tideFront = resetStartTideFront * (1 - rp);
       tideProgress = resetStartTideProgress * (1 - rp);
       pressure = 0;
       settleBloom *= (1 - rp * .95);

            // Fade pigment map
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
               // Clear pigment map fully
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
