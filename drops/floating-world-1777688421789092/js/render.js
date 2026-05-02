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
  };

  let W = 0, H = 0;
  let tideFront = -1;
  let tideProgress = 0;
  let pressed = false;
  let pressure = 0;
  let lastX = 0, lastY = 0;
  let moonX, moonY, moonR, waterline;
  let boats = [], reeds = [], bridgePosts = [], lanternXs = [];

  function init(canvas) {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    moonX = W * .8;
    moonY = H * .12;
    moonR = Math.min(W, H) * .06;
    waterline = H * .5;

    boats = [
      { x: W * .18, y: waterline + H * .12, w: W * .12, h: H * .04, tilt: -.03 },
      { x: W * .62, y: waterline + H * .06, w: W * .09, h: H * .035, tilt: .04 },
      { x: W * .38, y: waterline + H * .24, w: W * .1, h: H * .03, tilt: -.01 },
    ];

    reeds = [];
    const zones = [
      { cx: W * .06, n: 5, spread: .04 },
      { cx: W * .94, n: 5, spread: .04 },
      { cx: W * .22, n: 3, spread: .025 },
    ];
    zones.forEach(z => {
      for (let i = 0; i < z.n; i++) {
        reeds.push({
          x: z.cx + (Math.random() - .5) * z.spread * W,
          baseY: waterline + H * (.06 + Math.random() * .22),
          h: H * (.09 + Math.random() * .14),
          lean: (Math.random() - .5) * .35,
          phase: Math.random() * Math.PI * 2,
        });
      }
    });

    bridgePosts = [
      { x: W * .48, y1: waterline - H * .03, y2: waterline + H * .18 },
      { x: W * .50, y1: waterline - H * .025, y2: waterline + H * .17 },
      { x: W * .44, y1: waterline - H * .04, y2: waterline + H * .15 },
      { x: W * .54, y1: waterline - H * .035, y2: waterline + H * .16 },
    ];
    lanternXs = bridgePosts.map(p => p.x);

    tideFront = -1;
    tideProgress = 0;
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

  function tideAt(x) {
    if (tideFront <= 0) return 0;
    const d = x - tideFront;
    if (d < 0) return 0;
    const zone = 180 + pressure * 120;
    if (d > zone) return 1;
    return d / zone;
  }

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    drawPaper(ctx);
    drawSky(ctx);
    drawHills(ctx);
    drawWater(ctx);
    drawMoon(ctx);
    drawMoonReflection(ctx);
    drawBridge(ctx);
    drawLanterns(ctx);
    drawBoats(ctx);
    drawLanternReflections(ctx);
    drawReeds(ctx);
    drawTide(ctx);
    drawRegistration(ctx);
  }

  function drawPaper(ctx) {
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, W, H);
  }

  function drawSky(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, waterline);
    grad.addColorStop(0, '#B5BFCB');
    grad.addColorStop(1, C.sky);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, waterline);

    ctx.fillStyle = 'rgba(240,240,232,.15)';
    const starPositions = [[.2, .15], [.35, .08], [.5, .18], [.65, .12], [.88, .06], [.12, .2], [.75, .22], [.42, .25], [.92, .16], [.08, .11], [.58, .05], [.3, .28]];
    starPositions.forEach((s, i) => {
      ctx.beginPath();
      ctx.arc(s[0] * W, s[1] * H, 1 + (i % 3) * .3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawHills(ctx) {
    const baseAlpha = .5 - tideProgress * .15;
    const hillY = (x) => waterline - (.022 + Math.sin(x * .004) * .015 + Math.sin(x * .009) * .007) * H;

    ctx.fillStyle = 'rgba(90,122,90,' + baseAlpha + ')';
    ctx.beginPath();
    ctx.moveTo(0, waterline);
    for (let x = 0; x <= W; x += 3) ctx.lineTo(x, hillY(x));
    ctx.lineTo(W, waterline);
    ctx.fill();

    ctx.strokeStyle = 'rgba(42,48,72,.18)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      if (x === 0) ctx.moveTo(x, hillY(x));
      else ctx.lineTo(x, hillY(x));
    }
    ctx.stroke();
  }

  function drawWater(ctx) {
    const baseGrad = ctx.createLinearGradient(0, waterline, 0, H);
    baseGrad.addColorStop(0, C.water);
    baseGrad.addColorStop(1, '#6A7D90');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, waterline, W, H - waterline);

    ctx.strokeStyle = 'rgba(200,208,219,.22)';
    ctx.lineWidth = .5;
    for (let y = waterline + 4; y < H; y += 7) {
      ctx.beginPath();
      for (let x = 0; x < W; x += 4) {
        const wave = Math.sin(x * .006 + y * .025 + tideProgress * 3) * 1.5;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
  }

  function drawMoon(ctx) {
    ctx.fillStyle = C.moon;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(240,240,232,.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR + 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(240,240,232,.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR + 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawMoonReflection(ctx) {
    const reflY = waterline + (waterline - moonY) * .35;
    const mR = moonR * .4;
    const ta = tideAt(moonX);

    for (let i = 0; i < 9; i++) {
      const ry = reflY + i * 5;
      const rx = moonX + Math.sin(i * .65 + tideProgress * 2) * (2 + i * .4);
      const rw = mR * (.4 + i * .1);
      const alpha = (.18 * (1 - ta)) + .06;

      ctx.fillStyle = 'rgba(240,240,232,' + alpha + ')';
      ctx.beginPath();
      ctx.ellipse(rx, ry, rw, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBridge(ctx) {
    const bridgeY = waterline - H * .04;

    ctx.strokeStyle = lerpColor(C.paper, C.black, .55);
    ctx.lineWidth = 3;

    bridgePosts.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y1);
      ctx.lineTo(p.x, p.y2);
      ctx.stroke();
    });

    if (bridgePosts.length >= 2) {
      const left = bridgePosts[2], right = bridgePosts[3];
      ctx.strokeStyle = lerpColor(C.paper, C.black, .45);
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(left.x, bridgeY);
      const midX = (left.x + right.x) / 2;
      const midY = bridgeY - H * .015;
      ctx.quadraticCurveTo(midX, midY, right.x, bridgeY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(left.x, bridgeY + 6);
      ctx.quadraticCurveTo(midX, midY + 6, right.x, bridgeY + 6);
      ctx.stroke();
    }
  }

  function drawLanterns(ctx) {
    const bridgeY = waterline - H * .04;
    const positions = [[2], [3]];

    positions.forEach(idx => {
      const p = bridgePosts[idx[0]];
      const lx = p.x;
      const ly = bridgeY + 10;
      const ta = tideAt(lx);

      ctx.fillStyle = lerpColor(C.black, C.amber, .3 + ta * .5);
      ctx.fillRect(lx - 4, ly, 8, 12);

      ctx.strokeStyle = 'rgba(42,48,72,.3)';
      ctx.lineWidth = .8;
      ctx.strokeRect(lx - 4, ly, 8, 12);

      ctx.fillStyle = 'rgba(212,160,74,' + (.15 + ta * .2) + ')';
      ctx.fillRect(lx - 6, ly - 2, 12, 16);
    });
  }

  function drawLanternReflections(ctx) {
    const positions = [[2], [3]];
    positions.forEach((idx, i) => {
      const p = bridgePosts[idx[0]];
      const lx = p.x;
      const reflY = waterline + H * (.05 + i * .03);
      const reflH = H * (.1 + i * .02);
      const ta = tideAt(lx);
      const alpha = .12 * ta + .04;

      // Column glow
      ctx.fillStyle = 'rgba(212,160,74,' + alpha + ')';
      ctx.fillRect(lx - 2, reflY, 4, reflH);

      for (let sy = reflY; sy < reflY + reflH; sy += 4) {
        const sx = lx + Math.sin(sy * .08 + i + tideProgress) * 2;
        ctx.fillStyle = 'rgba(212,160,74,' + (alpha * .5) + ')';
        ctx.fillRect(sx - 1.5, sy, 3, 1);
      }
    });
  }

  function drawBoats(ctx) {
    boats.forEach((b, i) => {
      const cx = b.x + b.w / 2, cy = b.y;
      const ta = tideAt(cx);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(b.tilt + Math.sin(tideProgress * 1.5 + i) * .008);
      ctx.translate(-cx, -cy);

      const hullColor = lerpColor(C.water, C.black, .25 + ta * .5);
      ctx.fillStyle = hullColor;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.h);
      ctx.quadraticCurveTo(b.x + b.w * .18, b.y, b.x + b.w * .5, b.y - b.h * .45);
      ctx.quadraticCurveTo(b.x + b.w * .82, b.y, b.x + b.w, b.y + b.h);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(42,48,72,' + (.3 + ta * .3) + ')';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.h);
      ctx.quadraticCurveTo(b.x + b.w * .18, b.y, b.x + b.w * .5, b.y - b.h * .45);
      ctx.quadraticCurveTo(b.x + b.w * .82, b.y, b.x + b.w, b.y + b.h);
      ctx.closePath();
      ctx.stroke();

      if (ta > .15) {
        const hatchAlpha = (ta - .15) * 1.4;
        ctx.strokeStyle = 'rgba(42,48,72,' + (hatchAlpha * .3) + ')';
        ctx.lineWidth = .6;
        const step = 3, n = Math.floor(b.w / step);
        for (let k = 0; k < n; k++) {
          const hx = b.x + k * step + 1.5;
          const frac = k / n;
          const byTop = b.y - b.h * (.45 * (1 - Math.pow(2 * frac - 1, 2)));
          const byBot = b.y + b.h;
          for (let hy = byTop + 2; hy < byBot; hy += 3) {
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(hx + step * .7, hy + 1.8);
            ctx.stroke();
          }
        }
      }

      // Stippled pigment as tide deepens
      if (ta > .4) {
        const stipAlpha = (ta - .4) * 1.6;
        ctx.fillStyle = 'rgba(27,42,74,' + (stipAlpha * .12) + ')';
        for (let s = 0; s < 8; s++) {
          const sx = b.x + Math.random() * b.w;
          const frac = (sx - b.x) / b.w;
          const syBase = b.y - b.h * (.45 * (1 - Math.pow(2 * frac - 1, 2)));
          const sy = syBase + Math.random() * (b.y + b.h - syBase);
          ctx.beginPath();
          ctx.arc(sx, sy, .8 + Math.random() * .6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });
  }

  function drawReeds(ctx) {
    reeds.forEach((r, i) => {
      const ta = tideAt(r.x);
      const sway = Math.sin(tideProgress * .8 + r.phase) * 2;

      const rAlpha = .45 + ta * .45;
      const stalkColor = lerpColor(C.water, C.reed, rAlpha);

      // Stalk
      ctx.strokeStyle = stalkColor;
      ctx.lineWidth = 1.6;
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

      // Key line for carved feel
      ctx.strokeStyle = 'rgba(42,48,72,.15)';
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(r.x, r.baseY);
      ctx.quadraticCurveTo(
        r.x + r.lean * r.h * .25 + sway * .5,
        r.baseY - r.h * .5,
        tipX, tipY
      );
      ctx.stroke();

      // Reed top tufts - stippled pigment
      if (ta > .2) {
        const stipAlpha = (ta - .2) * 1.6;

        // Long blade segments
        ctx.strokeStyle = 'rgba(90,122,90,' + (stipAlpha * .25) + ')';
        ctx.lineWidth = .8;
        for (let b = 0; b < 3; b++) {
          ctx.beginPath();
          const startT = .6 + b * .1;
          const sx2 = r.x + r.lean * r.h * startT + sway * startT;
          const sy2 = r.baseY - r.h * startT;
          ctx.moveTo(sx2, sy2);
          ctx.quadraticCurveTo(
            sx2 + (2 + b * 1.5), sy2 - 5 - b * 2,
            sx2 + (4 + b * 2), sy2 - 10 - b * 3
          );
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(90,122,90,' + (stipAlpha * .2) + ')';
        for (let d = 0; d < 6; d++) {
          ctx.beginPath();
          ctx.arc(
            tipX + (Math.random() - .5) * 6,
            tipY + (Math.random() - .5) * 4,
            .7 + Math.random() * .5,
            0, Math.PI * 2
          );
          ctx.fill();
        }
      }
    });
  }

  function drawTide(ctx) {
    if (tideFront <= 0) return;

    const zone = 180 + pressure * 120;

    for (let x = Math.max(0, tideFront - 20); x < Math.min(W, tideFront + zone + 20); x += 2) {
      const d = x - tideFront;
      if (d < 0 || d > zone) continue;
      const t = d / zone;

      // Tide wave line
      const waveX = tideFront + t * zone;
      const waveY = tideFront > 0 ? waterline + H * .25 + Math.sin(waveX * .015 + tideProgress * 2) * (H * .03) : H / 2;

      // Indigo wash overlay - ink soaking into paper
      const alpha = .08 + Math.sin(t * Math.PI) * (.2 + pressure * .25);
      if (alpha > .03) {
        ctx.fillStyle = 'rgba(27,42,74,' + alpha + ')';
        ctx.fillRect(x, waterline - H * .06, 2, H * .75);
      }

      // Wave front line (the dark ink border)
      if (t < .08) {
        const edgeAlpha = .4 * (1 - t / .08);
        ctx.strokeStyle = 'rgba(27,42,74,' + edgeAlpha + ')';
        ctx.lineWidth = 2 + pressure * 2;
        ctx.beginPath();
        ctx.moveTo(x, waterline - H * .04);
        ctx.lineTo(x, waterline + H * .68);
        ctx.stroke();

        // Ink wetness edge highlight
        ctx.strokeStyle = 'rgba(240,240,232,' + (edgeAlpha * .4) + ')';
        ctx.lineWidth = .8;
        ctx.beginPath();
        ctx.moveTo(x + 2, waterline - H * .04);
        ctx.lineTo(x + 2, waterline + H * .68);
        ctx.stroke();
      }

      // Fine hatch lines in the tide zone
      if (t > .1 && t < .85) {
        const hatchT = (t - .1) / (.75);
        const hatchAlpha = Math.sin(hatchT * Math.PI) * (.06 + pressure * .08);
        if (hatchAlpha > .02) {
          ctx.strokeStyle = 'rgba(42,48,72,' + hatchAlpha + ')';
          ctx.lineWidth = .4;
          const spacing = 5;
          for (let hy = waterline - H * .05; hy < waterline + H * .65; hy += spacing) {
            const off = (hy % (spacing * 2) < spacing) ? 0 : spacing / 2;
            ctx.beginPath();
            ctx.moveTo(x + off, hy);
            ctx.lineTo(x + off + 3, hy + 2);
            ctx.stroke();
          }
        }
      }

      // Stippled pigment deep in tide
      if (t > .4 && Math.random() < .04) {
        ctx.fillStyle = 'rgba(27,42,74,' + (t * .12) + ')';
        ctx.beginPath();
        ctx.arc(x, waterline + Math.random() * H * .6, .6 + Math.random() * .4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawRegistration(ctx) {
    ctx.save();
    ctx.globalAlpha = .035;
    ctx.strokeStyle = 'rgba(180,90,50,1)';
    ctx.lineWidth = .5;

    bridgePosts.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p.x + 1.2, p.y1 - 1.2);
      ctx.lineTo(p.x + 1.2, p.y2 - 1.2);
      ctx.stroke();
    });

    boats.forEach(b => {
      ctx.beginPath();
      ctx.moveTo(b.x + .8, b.y + b.h - .8);
      ctx.quadraticCurveTo(b.x + b.w * .18 + .8, b.y - .8, b.x + b.w * .5 + .8, b.y - b.h * .45 - .8);
      ctx.quadraticCurveTo(b.x + b.w * .82 + .8, b.y - .8, b.x + b.w + .8, b.y + b.h - .8);
      ctx.stroke();
    });

    ctx.restore();
  }

  function onDown(x, y) {
    pressed = true;
    lastX = x;
    lastY = y;
    if (tideFront <= 0) {
      tideFront = x;
    }
  }

  function onMove(x, y) {
    if (!pressed) return;
    const dx = x - lastX;
    const dist = Math.abs(dx);
    pressure = Math.min(1, pressure + dist * .006);

    tideFront += dx * .6;
    tideProgress += dist * .01;

    lastX = x;
    lastY = y;
  }

   function onUp() {
    pressing = false;
    pressure = Math.max(0, pressure - .1);
    tideProgress += .5;
    }

  function idleDrift(t) {
    tideFront += Math.sin(t * 1.2) * .3;
    tideProgress += .005;
    pressure = Math.max(0, pressure - .003);
    }

  return { init, draw, onDown, onMove, onUp, idleDrift };
})();
