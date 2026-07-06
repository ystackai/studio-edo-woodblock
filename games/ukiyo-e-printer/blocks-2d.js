/**
 * blocks-2d — Minimal 2D block system for the ukiyo-e printer.
 *
 * Each block has:
 *   - properties (position, size, color, opacity, etc.)
 *   - render(ctx) draws itself onto a CanvasRenderingContext2D
 *   - update(dt) advances time-dependent state (mist drift, bloom animation, etc.)
 *   - layer controls z-order (lower = drawn first = behind)
 *   - visible controls whether it renders
 */
const Blocks2D = (() => {
  let blocks = [];
  let frameCount = 0;

  class Block {
    constructor(props = {}) {
      this.x = props.x || 0;
      this.y = props.y || 0;
      this.w = props.w || 64;
      this.h = props.h || 64;
      this.color = props.color || '#000000';
      this.opacity = props.opacity != null ? props.opacity : 1;
      this.visible = props.visible != null ? props.visible : true;
      this.layer = props.layer || 0;
      this.rotation = props.rotation || 0;
      this.anim = props.anim || null;
    }
    render(ctx) { if (this.visible) this._draw(ctx); }
    _draw(ctx) {}
    update(dt) { if (this.anim) this.anim(frameCount, dt); }
  }

  class PaperBlock extends Block {
    constructor(ctx, canvas, props = {}) {
      super(props);
      this.paperCanvas = canvas;
      this.paperCtx = ctx;
      this.phase = props.phase || 0;
    }
    _draw(ctx) {
      ctx.save();
      const grainOffset = Math.sin(this.phase) * 1.5;
      ctx.globalAlpha = 0.72;
      ctx.drawImage(this.paperCanvas, grainOffset, 0);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    update(dt) { this.phase += dt * 0.005; }
  }

  class SceneBlock extends Block {
    constructor(sceneCanvas, props = {}) {
      super(props);
      this.sceneCanvas = sceneCanvas;
      this.saturationLevel = props.saturationLevel || 0;
      this.mistBoost = props.mistBoost || 0;
    }
    _draw(ctx) {
      ctx.save();
      // Draw scene base
      ctx.drawImage(this.sceneCanvas, 0, 0);

      // Density-based scene darkening
      if (this.saturationLevel > 0.1) {
        ctx.globalAlpha = this.saturationLevel * 0.08;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, ctx.canvas.width / (ctx.canvas.width / ctx.canvas.parentElement?.clientWidth || 1024), ctx.canvas.height);
        ctx.globalAlpha = 1;
      }
      // Mist boost overlay
      if (this.mistBoost > 0.001) {
        ctx.globalAlpha = this.mistBoost;
        ctx.fillStyle = 'rgba(248,244,235,0.15)';
        ctx.fillRect(0, 0, ctx.canvas.width / (ctx.canvas.width / ctx.canvas.parentElement?.clientWidth || 1024), ctx.canvas.height);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
  }

  class InkBloomBlock extends Block {
    constructor(cx, cy, radius, opacity, color) {
      super({ x: cx, y: cy });
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
      this.opacity = opacity;
      this.color = color;
      this.t = 0;
      this.dur = 350 + Math.random() * 350;
      this.maxRadius = radius;
    }
    _draw(ctx) {
      const t = Math.min(1, this.t / this.dur);
      const e = 1 - Math.pow(1 - t, 3);
      const r = this.maxRadius * (0.45 + e * 0.75);
      const op = this.opacity * e;
      if (op < 0.005) return;

      const hexA = (a) => Math.min(1, Math.max(0, a) * 255 | 0).toString(16).padStart(2, '0');
      const cAlpha = (c, a) => c + hexA(a);

      ctx.save();
      const g = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, r);
      g.addColorStop(0, cAlpha(this.color, 0.85 * op));
      g.addColorStop(0.35, cAlpha(this.color, 0.48 * op));
      g.addColorStop(0.65, cAlpha(this.color, 0.14 * op));
      g.addColorStop(1, cAlpha(this.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Capillary edge darkening
      ctx.globalAlpha = 0.2 * op;
      ctx.strokeStyle = cAlpha('#000000', 0.5);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const rr = r * (0.85 + 0.15 * Math.sin(a * 7 + this.cx) * Math.cos(a * 5 + this.cy));
        const px = this.cx + Math.cos(a) * rr;
        const py = this.cy + Math.sin(a) * rr;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    update(dt) {
      this.t += dt;
    }
    get done() { return this.t >= this.dur; }
  }

  class InkStrokeBlock extends Block {
    constructor(pts, radius, opacity, color, holdDuration = 0) {
      super({ x: pts[0]?.x || 0, y: pts[0]?.y || 0 });
      this.pts = pts;
      this.radius = radius;
      this.opacity = opacity;
      this.color = color;
      this.holdDuration = holdDuration;
    }
    _draw(ctx) {
      const getOp = (o) => Math.max(0.06, o * (1 - this.opacity * 0.65));
      const getRad = (r) => r * (1 - this.opacity * 0.3);
      const hexA = (a) => Math.min(1, Math.max(0, a) * 255 | 0).toString(16).padStart(2, '0');
      const cAlpha = (c, a) => c + hexA(a);

      const bo = getOp(this.opacity);
      const br = getRad(this.radius);
      const holdBoost = this.holdDuration > 0 ? Math.min(0.45, this.holdDuration / 2000) : 0;
      const finalOp = Math.min(0.95, bo + holdBoost * 0.35);

      // Main stroke
      ctx.save();
      ctx.strokeStyle = cAlpha(this.color, finalOp);
      ctx.lineWidth = br * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(this.pts[0].x, this.pts[0].y);
      for (let j = 1; j < this.pts.length; j++) {
        ctx.lineTo(this.pts[j].x, this.pts[j].y);
      }
      ctx.stroke();

      // Ink bleed
      ctx.globalAlpha = finalOp * 0.3;
      ctx.lineWidth = br * 4.5;
      ctx.strokeStyle = cAlpha(this.color, 0.5);
      ctx.beginPath();
      ctx.moveTo(this.pts[0].x, this.pts[0].y);
      for (let j = 1; j < this.pts.length; j++) {
        ctx.lineTo(this.pts[j].x, this.pts[j].y);
      }
      ctx.stroke();

      // Edge darkening
      ctx.globalAlpha = finalOp * 0.15;
      ctx.lineWidth = br * 1.4;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(this.pts[0].x, this.pts[0].y);
      for (let j = 1; j < this.pts.length; j++) {
        ctx.lineTo(this.pts[j].x, this.pts[j].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  class MistBlock extends Block {
    constructor(x, y, w, h, speed, opacity, phase, driftAmp, driftFreq) {
      super({ x, y, w, h, opacity });
      this.speed = speed;
      this.phase = phase;
      this.driftAmp = driftAmp;
      this.driftFreq = driftFreq;
      this.parallaxX = 0;
      this.parallaxY = 0;
      this.baseX = x;
      this.baseY = y;
    }
    _draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      const seasonT = (frameCount % 3600) / 3600;
      const seasonR = 235 + Math.sin(seasonT * Math.PI * 2) * 15;
      const seasonG = 230 + Math.sin(seasonT * Math.PI * 2 + 1) * 12;
      const seasonB = 220 + Math.sin(seasonT * Math.PI * 2 + 2) * 10;
      const mistColor = `rgba(${seasonR | 0},${seasonG | 0},${seasonB | 0}`;
      const g = ctx.createLinearGradient(this.x, this.y, this.x + this.w, this.y);
      g.addColorStop(0, mistColor + ',0)');
      g.addColorStop(0.35, mistColor + ',0.9)');
      g.addColorStop(0.65, mistColor + ',0.9)');
      g.addColorStop(1, mistColor + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(this.x + this.w / 2, this.y + this.driftOffset, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    update(dt, mouseX = 0, mouseY = 0, W = 1024, H = 768) {
      this.phase += dt * 0.001 * this.speed;
      this.driftOffset = Math.sin(this.phase * this.driftFreq * 1000) * this.driftAmp;
      const px = ((mouseX / W) - 0.5) * this.parallaxX;
      const py = ((mouseY / H) - 0.5) * this.parallaxY;
      this.x = this.baseX + px;
      this.y = this.baseY + py;
    }
  }

  class FigureBlock extends Block {
    /**
     * A walking figure silhouette in ukiyo-e style.
     * Simple but evocative — a robed figure on a mountain path,
     * like Hokusai's wanderers or Utamaro's travelers.
     */
    constructor(x, y, scale = 1, props = {}) {
      super({ x, y, w: 40 * scale, h: 70 * scale, opacity: props.opacity || 0.55, layer: 3, color: '#0f172a' });
      this.scale = scale;
      this.walkPhase = props.walkPhase || 0;
      this.walkSpeed = props.walkSpeed || 0.015;
      this.facing = props.facing || 1; // 1 = right, -1 = left
      this.headColor = props.headColor || '#1a2240';
      this.robeColor = props.robeColor || '#0f172a';
    }
    _draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      const s = this.scale;
      const f = this.facing;
      const walk = Math.sin(this.walkPhase);
      const bobY = Math.abs(Math.sin(this.walkPhase * 0.5)) * 1.5 * s;

      ctx.translate(this.x, this.y - bobY);
      ctx.scale(f, 1);

      // Shadow on ground
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = this.opacity;

      // Legs
      ctx.strokeStyle = this.robeColor;
      ctx.lineWidth = 2.5 * s;
      ctx.lineCap = 'round';
      const legSpread = 4 * s + Math.sin(this.walkPhase) * 2 * s;
      // Left leg
      ctx.beginPath();
      ctx.moveTo(-2 * s, -4 * s);
      ctx.quadraticCurveTo(-legSpread * 0.5, -1 * s, -legSpread, 1 * s);
      ctx.stroke();
      // Right leg
      ctx.beginPath();
      ctx.moveTo(2 * s, -4 * s);
      ctx.quadraticCurveTo(legSpread * 0.5, 0, legSpread, 1 * s);
      ctx.stroke();

      // Robe / body — flowing garment
      ctx.fillStyle = this.robeColor;
      ctx.beginPath();
      ctx.moveTo(-10 * s, -4 * s);
      ctx.quadraticCurveTo(-12 * s, -20 * s, -7 * s, -30 * s);
      ctx.quadraticCurveTo(0, -33 * s, 7 * s, -30 * s);
      ctx.quadraticCurveTo(12 * s, -20 * s, 10 * s, -4 * s);
      // Lower robe flares
      ctx.quadraticCurveTo(14 * s, 2 * s, 10 * s, 4 * s);
      ctx.lineTo(-10 * s, 4 * s);
      ctx.quadraticCurveTo(-14 * s, 2 * s, -10 * s, -4 * s);
      ctx.fill();

      // Robe fold lines
      ctx.strokeStyle = 'rgba(248,244,235,0.12)';
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(-2 * s, -28 * s);
      ctx.quadraticCurveTo(0, -15 * s, 1 * s, -4 * s);
      ctx.stroke();

      // Arms
      ctx.strokeStyle = this.robeColor;
      ctx.lineWidth = 2.5 * s;
      const armSwing = Math.sin(this.walkPhase) * 5 * s;
      // Left arm
      ctx.beginPath();
      ctx.moveTo(-8 * s, -26 * s);
      ctx.quadraticCurveTo(-14 * s + armSwing, -18 * s, -13 * s + armSwing, -8 * s);
      ctx.stroke();
      // Right arm
      ctx.beginPath();
      ctx.moveTo(8 * s, -26 * s);
      ctx.quadraticCurveTo(14 * s - armSwing, -18 * s, 13 * s - armSwing, -8 * s);
      ctx.stroke();

      // Hands (simple circles)
      ctx.fillStyle = this.headColor;
      ctx.beginPath();
      ctx.arc(-13 * s + armSwing, -8 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(13 * s - armSwing, -8 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = this.headColor;
      ctx.beginPath();
      ctx.arc(0, -36 * s, 5.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Hat (traditional conical/sun hat — 帽子)
      ctx.fillStyle = '#8b7355';
      ctx.beginPath();
      ctx.moveTo(-10 * s, -40 * s);
      ctx.quadraticCurveTo(0, -50 * s, 10 * s, -40 * s);
      ctx.quadraticCurveTo(0, -38 * s, -10 * s, -40 * s);
      ctx.fill();

      ctx.restore();
    }
    update(dt) {
      this.walkPhase += dt * this.walkSpeed;
    }
  }

  class MountainBlock extends Block {
    constructor(points, color, opacity, props = {}) {
      super({ x: 0, y: 0, w: 1024, h: 100, opacity });
      this.points = points; // array of {x, y} relative to layer
      this.color = color;
      this.baseY = props.baseY || 0;
      this.parallaxX = props.parallaxX || 0;
      this.parallaxY = props.parallaxY || 0;
    }
    _draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y + this.baseY);
      for (let i = 1; i < this.points.length; i++) {
        const p = this.points[i];
        if (p.curve) {
          ctx.bezierCurveTo(p.cx1, p.cy1, p.cx2, p.cy2, p.x, p.y + this.baseY);
        } else {
          ctx.lineTo(p.x, p.y + this.baseY);
        }
      }
      ctx.lineTo(ctx.canvas.width, this.baseY + 100);
      ctx.lineTo(0, this.baseY + 100);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    update(dt, mouseX = 0, mouseY = 0, W = 1024, H = 768) {
      const px = ((mouseX / W) - 0.5) * this.parallaxX;
      const py = ((mouseY / H) - 0.5) * this.parallaxY;
      this.baseX = px;
      this.baseY = py;
    }
  }

  class SunBlock extends Block {
    constructor(x, y, radius, glowRadius, props = {}) {
      super({ x, y, w: radius * 2, h: radius * 2 });
      this.radius = radius;
      this.glowRadius = glowRadius;
      this.haloRadius = props.haloRadius || radius * 3;
      this.haloOp = props.haloOp || 0.45;
    }
    _draw(ctx) {
      ctx.save();
      // Sun glow
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.haloRadius);
      glow.addColorStop(0, `rgba(245,220,175,${this.haloOp})`);
      glow.addColorStop(0.4, `rgba(240,215,165,0.15)`);
      glow.addColorStop(1, 'rgba(240,215,165,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Sun body
      ctx.fillStyle = 'rgba(248,235,210,0.55)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner ring
      ctx.strokeStyle = 'rgba(248,235,210,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  class PineTreeBlock extends Block {
    constructor(x, baseY, props = {}) {
      super({ x, y: baseY, w: 100, h: 300 });
      this.baseY = baseY;
      this.depth = props.depth || 5;
      this.branches = props.branches || [];
    }
    _drawBranch(ctx, bx, by, angle, length, depth) {
      if (depth <= 0 || length < 8) return;
      const ex = bx + Math.cos(angle) * length;
      const ey = by + Math.sin(angle) * length;
      ctx.strokeStyle = 'rgba(20,28,48,0.8)';
      ctx.lineWidth = Math.max(1, depth * 0.8);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo((bx + ex) / 2 + Math.sin(angle) * 5, (by + ey) / 2, ex, ey);
      ctx.stroke();

      // Needle clusters
      for (let i = 0; i < 3 + depth; i++) {
        const t = 0.3 + (i / (3 + depth)) * 0.7;
        const nx = bx + (ex - bx) * t + (Math.random() - 0.5) * 6;
        const ny = by + (ey - by) * t + (Math.random() - 0.5) * 6;
        ctx.fillStyle = 'rgba(20,28,48,0.65)';
        ctx.beginPath();
        ctx.ellipse(nx, ny, 8 + Math.random() * 8, 3 + Math.random() * 3, angle + (Math.random() - 0.5) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      this._drawBranch(ctx, ex, ey, angle - 0.4, length * 0.6, depth - 1);
      this._drawBranch(ctx, ex, ey, angle + 0.35, length * 0.55, depth - 1);
      this._drawBranch(ctx, ex, ey, angle - 0.15, length * 0.7, depth - 1);
    }
    _draw(ctx) {
      ctx.save();
      ctx.fillStyle = 'rgba(20,28,48,0.85)';
      // Trunk
      ctx.beginPath();
      ctx.moveTo(this.x - 5, this.baseY);
      ctx.quadraticCurveTo(this.x - 3, this.baseY - 120, this.x + 1, this.baseY - 200);
      ctx.quadraticCurveTo(this.x + 5, this.baseY - 120, this.x + 7, this.baseY);
      ctx.fill();

      ctx.strokeStyle = 'rgba(20,28,48,0.8)';
      this._drawBranch(ctx, this.x + 1, this.baseY - 200, -0.8, 70, this.depth);
      this._drawBranch(ctx, this.x + 1, this.baseY - 200, -1.6, 60, this.depth);
      this._drawBranch(ctx, this.x + 1, this.baseY - 200, -0.2, 55, this.depth - 1);
      this._drawBranch(ctx, this.x + 1, this.baseY - 140, -1.0, 50, this.depth - 1);
      this._drawBranch(ctx, this.x + 1, this.baseY - 140, -1.5, 45, this.depth - 1);
      ctx.restore();
    }
  }

  class LakeBlock extends Block {
    constructor(y, props = {}) {
      super({ x: 0, y, w: 1024, h: 200 });
      this.y = y;
      this.ripplePhase = props.ripplePhase || 0;
      this.saturationLevel = props.saturationLevel || 0;
    }
    _draw(ctx) {
      ctx.save();
      // Water gradient
      const lakeGrad = ctx.createLinearGradient(0, this.y, 0, ctx.canvas.height);
      lakeGrad.addColorStop(0, 'rgba(120,135,160,0.3)');
      lakeGrad.addColorStop(0.3, 'rgba(100,118,148,0.35)');
      lakeGrad.addColorStop(1, 'rgba(80,95,125,0.4)');
      ctx.fillStyle = lakeGrad;
      ctx.fillRect(0, this.y, ctx.canvas.width, ctx.canvas.height - this.y);

      // Water reflections
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = 'rgba(44,58,95,0.5)';
      ctx.lineWidth = 1;
      for (let ly = this.y + 8; ly < ctx.canvas.height - 10; ly += 3 + Math.random() * 4) {
        const wobble = Math.sin(ly * 0.05) * 8;
        ctx.beginPath();
        ctx.moveTo(W * 0.35 + wobble, ly);
        ctx.bezierCurveTo(W * 0.42, ly + Math.sin(ly * 0.1) * 3, W * 0.48, ly - Math.sin(ly * 0.08) * 4, W * 0.52 + wobble, ly);
        ctx.bezierCurveTo(W * 0.56, ly + Math.sin(ly * 0.06) * 3, W * 0.62, ly - Math.sin(ly * 0.05) * 4, W * 0.68 + wobble, ly);
        ctx.stroke();
      }
      ctx.restore();

      // Ripple on lake responds to ink density
      if (this.saturationLevel > 0.05) {
        ctx.save();
        ctx.globalAlpha = this.saturationLevel * 0.06;
        for (let ly = this.y + 5; ly < ctx.canvas.height - 5; ly += 4) {
          const ripple = Math.sin(this.ripplePhase + ly * 0.05);
          const rippleW = ripple * 3;
          ctx.strokeStyle = 'rgba(248,244,235,0.5)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(W * 0.3, ly);
          for (let rx = W * 0.3; rx < W * 0.7; rx += 10) {
            ctx.lineTo(rx + rippleW, ly + Math.sin(rx * 0.02 + this.ripplePhase) * 1);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();
    }
    update(dt) {
      this.ripplePhase += dt * 0.02;
    }
  }

  class JapaneseCloudBlock extends Block {
    constructor(x, y, w, h, props = {}) {
      super({ x, y, w, h, opacity: props.opacity || 0.15 });
      this.baseX = x;
      this.baseY = y;
      this.driftSpeed = props.driftSpeed || 0.02;
      this.phase = props.phase || 0;
    }
    _draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = 'rgba(255,252,245,0.8)';
      ctx.beginPath();
      ctx.ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    update(dt) {
      this.phase += dt * this.driftSpeed;
      this.x = this.baseX + Math.sin(this.phase) * 15;
      this.y = this.baseY + Math.cos(this.phase * 0.7) * 3;
    }
  }

  class DeckleEdgeBlock extends Block {
    constructor() {
      super({ x: 0, y: 0 });
    }
    _draw(ctx) {
      ctx.save();
      // Radial deckle edge darkening
      const deckleGrad = ctx.createRadialGradient(
        ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width * 0.32,
        ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width * 0.62
      );
      deckleGrad.addColorStop(0, 'rgba(248,244,235,0)');
      deckleGrad.addColorStop(0.55, 'rgba(248,244,235,0)');
      deckleGrad.addColorStop(0.78, 'rgba(200,190,170,0.12)');
      deckleGrad.addColorStop(1, 'rgba(180,170,150,0.28)');
      ctx.fillStyle = deckleGrad;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Deckle fiber edges
      ctx.strokeStyle = 'rgba(160,145,125,0.08)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) {
        const side = i % 4;
        ctx.beginPath();
        if (side === 0) {
          ctx.moveTo(0, 4 + Math.random() * 6);
          for (let x = 0; x < ctx.canvas.width; x += 30 + Math.random() * 40) {
            ctx.lineTo(x, 4 + Math.random() * 8);
          }
        } else if (side === 1) {
          ctx.moveTo(0, ctx.canvas.height - 4 - Math.random() * 6);
          for (let x = 0; x < ctx.canvas.width; x += 30 + Math.random() * 40) {
            ctx.lineTo(x, ctx.canvas.height - 4 - Math.random() * 8);
          }
        } else if (side === 2) {
          ctx.moveTo(4 + Math.random() * 6, 0);
          for (let y = 0; y < ctx.canvas.height; y += 30 + Math.random() * 40) {
            ctx.lineTo(4 + Math.random() * 8, y);
          }
        } else {
          ctx.moveTo(ctx.canvas.width - 4 - Math.random() * 6, 0);
          for (let y = 0; y < ctx.canvas.height; y += 30 + Math.random() * 40) {
            ctx.lineTo(ctx.canvas.width - 4 - Math.random() * 8, y);
          }
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  class VignetteBlock extends Block {
    constructor(saturationLevel) {
      super({ x: 0, y: 0 });
      this.saturationLevel = saturationLevel;
    }
    _draw(ctx) {
      ctx.save();
      const vigOp = Math.min(0.6, 0.35 + this.saturationLevel * 0.25);
      const vig = ctx.createRadialGradient(
        ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width * 0.4,
        ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width * 0.7
      );
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, `rgba(26,26,24,${vigOp})`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
    update(dt, sat) { this.saturationLevel = sat; }
  }

  class RockBlock extends Block {
    constructor(x, y, props = {}) {
      super({ x, y });
      this.points = props.points || [
        { x: 0, y: 0 },
        { curve: true, x: 40, y: -15, cx1: 5, cx2: 10 },
        { curve: true, x: 80, y: -8, cx1: 55, cx2: 70 },
        { x: 100, y: 5 },
        { x: 90, y: 20 },
        { x: 10, y: 18 },
      ];
      this.color = props.color || 'rgba(50,60,80,0.55)';
    }
    _draw(ctx) {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      const p0 = this.points[0];
      ctx.moveTo(this.x + p0.x, this.y + p0.y);
      for (let i = 1; i < this.points.length; i++) {
        const p = this.points[i];
        if (p.curve) {
          ctx.bezierCurveTo(
            this.x + p.cx1, this.y + p.cy1,
            this.x + p.cx2, this.y + p.cy2,
            this.x + p.x, this.y + p.y
          );
        } else {
          ctx.lineTo(this.x + p.x, this.y + p.y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  class GrassBlock extends Block {
    constructor(startX, count, props = {}) {
      super({ x: startX, y: 0 });
      this.count = count;
      this.startX = startX;
      this.baseY = props.baseY || 0;
      this.swayPhase = props.swayPhase || 0;
    }
    _draw(ctx) {
      ctx.save();
      ctx.strokeStyle = 'rgba(60,75,95,0.35)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      for (let i = 0; i < this.count; i++) {
        const x = this.startX + i * (3 + Math.random() * 4);
        const gh = 15 + Math.random() * 25;
        const sway = Math.sin(this.swayPhase + i * 0.5) * 3;
        ctx.beginPath();
        ctx.moveTo(x, this.baseY);
        ctx.quadraticCurveTo(x + sway, this.baseY - gh * 0.5, x + sway * 1.5, this.baseY - gh);
        ctx.stroke();
      }
      ctx.restore();
    }
    update(dt) {
      this.swayPhase += dt * 0.003;
    }
  }

  // ── Block List / Scene Manager ─────────────────────────────
  const BlockList = {
    _items: [],

    add(block) {
      this._items.push(block);
      return block;
    },

    remove(block) {
      const idx = this._items.indexOf(block);
      if (idx >= 0) this._items.splice(idx, 1);
    },

    get all() { return this._items; },

    get visible() { return this._items.filter(b => b.visible); },

    // Sort by layer (lower = drawn first = behind)
    get sorted() {
      return [...this._items].sort((a, b) => a.layer - b.layer);
    },

    render(ctx) {
      for (const b of this.sorted) {
        b.render(ctx);
      }
    },

    update(dt, extra = {}) {
      for (const b of this._items) {
        b.update(dt, extra.mouseX, extra.mouseY, extra.W, extra.H);
      }
    },

    clear() {
      this._items = [];
    },

    count() {
      return this._items.length;
    },

    byLayer(layer) {
      return this._items.filter(b => b.layer === layer);
    }
  };

  return {
    Block,
    BlockList,
    blocks: BlockList,
    PaperBlock,
    SceneBlock,
    InkBloomBlock,
    InkStrokeBlock,
    MistBlock,
    FigureBlock,
    MountainBlock,
    SunBlock,
    PineTreeBlock,
    LakeBlock,
    JapaneseCloudBlock,
    DeckleEdgeBlock,
    VignetteBlock,
    RockBlock,
    GrassBlock,
    frameCount: () => frameCount
  };
})();
