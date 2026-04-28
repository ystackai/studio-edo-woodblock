/* game.js — Core interaction loop + Canvas 2D renderer.
 * Water surface as a heightfield grid with displacement mapping.
 * Press → impact → hold/drag → release → reset via damped spring physics.
 * All visuals matte, zero bloom/glow.
 */

(function () {
   'use strict';

  const canvas = document.getElementById('surface');
  const c = canvas.getContext('2d');

   /* --- Configuration --- */
  const GRID_W = 80;        // grid width in cells
  const GRID_H = 80;        // grid height in cells
  const RIPPLE_SPEED = 0.035;
  const DAMPING = 0.985;     // per-frame decay (damped spring)
  const LOOKAHEAD_MS = 150;  // ripple lookahead from touch
  const CELL_ASPECT = 1;

   /* Palette: deep indigo, charcoal silt, matte white highlights */
  const COLORS = {
    deep:   [10, 14, 26],   // deep indigo background
    water:  [30, 40, 72],   // water base
    silt:   [55, 50, 45],   // charcoal silt
    highlight: [220, 225, 235], // matte white water line
   };

   /* Heightfield grid — two buffers for ping-pong update */
  let current  = null;
  let previous = null;

  /* Render buffers */
  let cellW, cellH;

  /* Interaction state */
  let touches = []; // { x, y, active, startTime, lookaheadElapsed }
  let animId = null;

   /* --- Init --- */
  function initGrid() {
    const size = GRID_W * GRID_H;
    current  = new Float32Array(size);
    previous = new Float32Array(size);
   }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    cellW = canvas.width  / GRID_W;
    cellH = canvas.height / GRID_H;
   }

  function init() {
    initGrid();
    resize();
    window.addEventListener('resize', resize);
    setupEvents();
    AudioEngine.init();
    Haptics.init();
    if (!animId) {
      animId = requestAnimationFrame(loop);
    }
   }

   /* --- Physics Update --- */
  function updatePhysics() {
     /* Wave equation: new[i] = 2*current[i] - previous[i] + speed * neighbors */
    const size = GRID_W * GRID_H;
    const temp = new Float32Array(size);

    for (let y = 1; y < GRID_H - 1; y++) {
      for (let x = 1; x < GRID_W - 1; x++) {
        const i = y * GRID_W + x;
        temp[i] = (2 * current[i] - previous[i]
          + RIPPLE_SPEED * (
            current[i - 1]        +
            current[i + 1]        +
            current[i - GRID_W]   +
            current[i + GRID_W]   -
            4 * current[i]
          )
        );
      }
    }

     /* Apply touch inputs with 150ms lookahead */
    for (let t = 0; t < touches.length; t++) {
      const touch = touches[t];
      if (!touch.active) continue;

      const cx = Math.floor(touch.x / cellW);
      const cy = Math.floor(touch.y / cellH);
      const radius = 3 + Math.max(0, (touch.lookaheadElapsed - LOOKAHEAD_MS) * 0.01);

      for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
        for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
          const px = cx + dx;
          const py = cy + dy;
          if (px < 1 || px >= GRID_W - 1 || py < 1 || py >= GRID_H - 1) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;
          const strength = (1 - dist / radius) * 0.6;
          const i = py * GRID_W + px;
          if (touch.phase === 'press') {
            temp[i] += strength * 2.0;
          } else if (touch.phase === 'hold') {
            temp[i] += strength * 0.3;
          }
        }
      }
    }

     /* Swap buffers with damping */
    for (let i = 0; i < size; i++) {
      temp[i] *= DAMPING;
    }
    previous = current;
    current = temp;
   }

    /* --- Rendering --- */
  let rw, rh; // low-res render grid dimensions

  function initRenderBuffers() {
    rw = Math.min(canvas.width, GRID_W * 4);
    rh = Math.min(canvas.height, GRID_H * 4);
   }

  function render() {
    const w = canvas.width;
    const h = canvas.height;

      /* Deep indigo background */
    c.fillStyle = `rgb(${COLORS.deep.join(',')})`;
    c.fillRect(0, 0, w, h);

      /* Draw each cell as a solid block — woodblock aesthetic */
    for (let sy = 0; sy < GRID_H; sy++) {
      for (let sx = 0; sx < GRID_W; sx++) {
        const idx = sy * GRID_W + sx;
        const disp = current[idx];

          /* Map displacement to color: water + silt + highlight */
        let r, g, b;
        if (disp > 0.3) {
          const t = Math.min(1, (disp - 0.3) * 3);
          r = COLORS.water[0] + (COLORS.highlight[0] - COLORS.water[0]) * t;
          g = COLORS.water[1] + (COLORS.highlight[1] - COLORS.water[1]) * t;
          b = COLORS.water[2] + (COLORS.highlight[2] - COLORS.water[2]) * t;
         } else if (disp > 0) {
          const t = disp * 3;
          r = COLORS.water[0] + (COLORS.silt[0] - COLORS.water[0]) * t;
          g = COLORS.water[1] + (COLORS.silt[1] - COLORS.water[1]) * t;
          b = COLORS.water[2] + (COLORS.silt[2] - COLORS.water[2]) * t;
         } else {
          const t = Math.min(1, (-disp) * 4);
          r = COLORS.water[0] - (COLORS.water[0] * t * 0.5);
          g = COLORS.water[1] - (COLORS.water[1] * t * 0.5);
          b = COLORS.water[2] - (COLORS.water[2] * t * 0.3);
         }

        c.fillStyle = `rgb(${(Math.max(0, Math.min(255, r | 0)))},${(Math.max(0, Math.min(255, g | 0)))},${(Math.max(0, Math.min(255, b | 0)))})`;
        c.fillRect(Math.floor(sx * cellW), Math.floor(sy * cellH), Math.ceil(cellW), Math.ceil(cellH));
       }
     }

      /* Matte water line near top third */
    const lineGrid = Math.floor(GRID_H * 0.33);
    const lineY = Math.floor(h * 0.33);
    c.strokeStyle = `rgba(${COLORS.highlight.join(',')}, 0.35)`;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(0, lineY);
    for (let sx = 0; sx < GRID_W; sx++) {
      const wave = current[lineGrid * GRID_W + sx] || 0;
      c.lineTo(Math.floor(sx * cellW) + cellW / 2, lineY + wave * 10);
     }
    c.stroke();
    }

         /* Fill the cell region */
        const sx0 = Math.floor(sx * cellW);
        const sy0 = Math.floor(sy * cellH);
        const sx1 = Math.floor((sx + 1) * cellW);
        const sy1 = Math.floor((sy + 1) * cellH);

        for (let py = sy0; py < sy1; py++) {
          for (let px = sx0; px < sx1; px++) {
            const pi = (py * w + px) * 4;
            d[pi]     = Math.max(0, Math.min(255, r | 0));
            d[pi + 1] = Math.max(0, Math.min(255, g | 0));
            d[pi + 2] = Math.max(0, Math.min(255, b | 0));
            d[pi + 3] = 255;
          }
        }
      }
    }

    c.putImageData(imgData, 0, 0);

     /* Matte water line near top third */
    const lineY = Math.floor(h * 0.33);
    c.strokeStyle = `rgba(${COLORS.highlight.join(',')}, 0.35)`;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(0, lineY);
    for (let px = 0; px < w; px++) {
      const sx = Math.floor(px / cellW);
      if (sx >= GRID_W) break;
      const wave = current[lineY / cellH * GRID_W + sx] || 0;
      c.lineTo(px, lineY + wave * 8);
    }
    c.stroke();
   }

   /* --- Main Loop --- */
  let lastTime = 0;

  function loop(ts) {
    const dt = ts - lastTime;
    lastTime = ts;

     /* Update touch lookahead */
    for (let t = 0; t < touches.length; t++) {
      if (touches[t].active) {
        touches[t].lookaheadElapsed += dt;
        if (touches[t].phase === 'press' && touches[t].lookaheadElapsed > LOOKAHEAD_MS) {
          touches[t].phase = 'hold';
        }
      }
    }

    updatePhysics();
    render();

    animId = requestAnimationFrame(loop);
   }

   /* --- Input Handling --- */
  function setupEvents() {
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup',   onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
   }

  function onPointerDown(e) {
    e.preventDefault();
    AudioEngine.init();
     /* Ensure audio context is resumed (iOS requirement) */
    if (AudioEngine._audioCtx && AudioEngine._audioCtx.state === 'suspended') {
      AudioEngine._audioCtx.resume();
    }

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top)  * (canvas.height / rect.height);

    const touch = {
      id: e.pointerId,
      x: x,
      y: y,
      active: true,
      phase: 'press',
      lookaheadElapsed: 0,
      startTime: performance.now(),
    };
    touches.push(touch);

     /* Impact: haptic burst + audio thud */
    Haptics.impact();
    AudioEngine.playImpact();
   }

  function onPointerMove(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top)  * (canvas.height / rect.height);

    for (let i = 0; i < touches.length; i++) {
      if (touches[i].id === e.pointerId) {
        touches[i].x = x;
        touches[i].y = y;
        if (touches[i].phase === 'hold' && !touches[i].wasHapticHold) {
          touches[i].wasHapticHold = true;
          Haptics.hold();
        }
        break;
      }
    }
   }

  function onPointerUp(e) {
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].id === e.pointerId) {
        touches[i].active = false;
         /* Release: haptic decay + audio exhale */
        Haptics.release();
        AudioEngine.playRelease();
        break;
      }
    }
     /* Clean up inactive touches periodically */
    setTimeout(() => {
      touches = touches.filter(t => t.active);
    }, 4000);
   }

   /* --- Boot --- */
  window.addEventListener('load', init);
})();
