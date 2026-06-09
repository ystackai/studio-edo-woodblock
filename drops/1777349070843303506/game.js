/* ── Pictures of the Floating World ──
 * Stone–water interaction with procedural audio.
 * Zero external dependencies. Single-file JS.
──*/
(function () {
"use strict";

/* ═══════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════ */
var C = {
  gravity:       980,
  surfFrac:      0.34,          // water surface at 34% of height
  stoneR:        14,
  stoneFallY:    -80,           // start above canvas
  rippleSpeed:     180,
  rippleMax:       260,
  rippleCount:     5,
  rippleDelay:    140,
  sinkDelay:       350,        // time before stone sinks after impact
  sinkDuration:  2800,
  splashN:       30,
  particleLife:  800,
  waveAmp:       2.2,
  waveFreq:      0.006,
  waveSpeed:     0.0009,
  settleDur:     1800,
};

/* ═══════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════ */
var G = {
  on:          false,
  audioOn:     true,
  actx:        null,
  master:      null,
  ambSrc:      null,
  t:           0,           // global time (ms)
  stones:       [],
  ripples:    [],
  particles:  [],
  droplets:   [],
  n:           0,           // drop counter
  surfaceY:    0,
  W: 0, H: 0, Wd: 0, Hd: 0, // logical / device dimensions
  dpr: 1,
  started:     false,       // first user gesture happened
};

/* ═══════════════════════════════════════════
   DOM REFS
   ═══════════════════════════════════════════ */
var cvs = document.getElementById("world");
var c   = cvs.getContext("2d");
var overlay   = document.getElementById("overlay");
var muteBtn   = document.getElementById("mute");
var counter   = document.getElementById("counter");

/* ═══════════════════════════════════════════
   RESIZE
   ═══════════════════════════════════════════ */
function resize() {
  G.dpr = Math.min(window.devicePixelRatio || 1, 2);
  G.W = window.innerWidth;
  G.H = window.innerHeight;
  G.Wd = G.W * G.dpr;
  G.Hd = G.H * G.dpr;
  cvs.width  = G.Wd;
  cvs.height = G.Hd;
  c.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  G.surfaceY = G.H * C.surfFrac;
}
window.addEventListener("resize", resize);
resize();

/* ═══════════════════════════════════════════
   AUDIO ENGINE  (Web Audio API)
   ═══════════════════════════════════════════ */
var A = {
  init: function () {
    try {
      G.actx = new (window.AudioContext || window.webkitAudioContext)();
      G.master = G.actx.createGain();
      G.master.gain.value = 0.45;
      G.master.connect(G.actx.destination);
    } catch (_) { G.audioOn = false; }
  },
  ensure: function () {
    if (G.actx && G.actx.state === "suspended") G.actx.resume();
  },
  mute: function (yes) {
    if (!G.master) return;
    G.master.gain.setTargetAtTime(yes ? 0 : 0.45, G.actx.currentTime, 0.08);
  },

  /* ── Impact: layered thud + splash noise ── */
  impact: function () {
    if (!G.actx) return;
    var t = G.actx.currentTime;

     // Deep body
    this._osc("sine", 75, t, 28, t + 0.55, 0.55, 0.001, t + 0.75);
    // Mid crack
    this._osc("triangle", 240, t, 110, t + 0.09, 0.3, 0.001, t + 0.18);
    // High snap
    this._osc("sine", 820, t, 320, t + 0.035, 0.12, 0.001, t + 0.07);
    // Splash noise
    this._noise(t, 0.13, 0.2, 1400, 3);
  },

  /* ── Ripple: decaying triple-tone ── */
  ripple: function (delay) {
    if (!G.actx) return;
    var t = G.actx.currentTime + (delay || 0);
    var fqs = [280, 440, 340];
    fqs.forEach(function (f, i) {
      var osc = G.actx.createOscillator();
      var g   = G.actx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.7 + i * 0.15);
      g.gain.setValueAtTime(0.09, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.9 + i * 0.2);
      osc.connect(g); g.connect(G.master);
      osc.start(t); osc.stop(t + 1.2 + i * 0.2);
    });
  },

  /* ── Settle: slow sinking weight ── */
  settle: function () {
    if (!G.actx) return;
    var t = G.actx.currentTime;
    this._osc("sine", 58, t, 38, t + C.settleDur / 1000, 0.07, 0.02, t + C.settleDur / 1000 + 0.3);
    // Subtle harmonic
    this._osc("sine", 115, t, 75, t + C.settleDur / 1000, 0.025, 0.008, t + C.settleDur / 1000);
  },

  /* ── Ambient: low filtered noise ── */
  ambient: function () {
    if (!G.actx || G.ambSrc) return;
    var len = G.actx.sampleRate * 4;
    var buf = G.actx.createBuffer(1, len, G.actx.sampleRate);
    var d   = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1);
    G.ambSrc = G.actx.createBufferSource();
    G.ambSrc.buffer = buf;
    G.ambSrc.loop   = true;
    var lp = G.actx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 160;
    var g  = G.actx.createGain();
    g.gain.value = 0.045;
    G.ambSrc.connect(lp); lp.connect(g); g.connect(G.master);
    G.ambSrc.start();
  },

  /* ── Helpers ── */
  _osc: function (type, f0, t0, f1, t1, v0, v2, t2) {
    var o = G.actx.createOscillator();
    var g = G.actx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(f1, t1);
    g.gain.setValueAtTime(v0, t0);
    g.gain.exponentialRampToValueAtTime(v2, t2);
    o.connect(g); g.connect(G.master);
    o.start(t0); o.stop(t2 + 0.01);
  },
  _noise: function (t, dur, vol, centre, q) {
    var n   = G.actx.sampleRate * dur;
    var buf = G.actx.createBuffer(1, n, G.actx.sampleRate);
    var d   = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = G.actx.createBufferSource();
    src.buffer = buf;
    var bp = G.actx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = centre; bp.Q.value = q || 2;
    var g  = G.actx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(G.master);
    src.start(t); src.stop(t + dur + 0.01);
  },
};

/* ═══════════════════════════════════════════
   STONE DROP
   ═══════════════════════════════════════════ */
function dropStone(x, y) {
  if (!G.on) return;
  A.ensure();

  // Stone colour palette
  var cols = ["#6e6355","#5a5048","#7e7060","#605845","#8a7d6d"];
  var col  = cols[(G.n) % cols.length];

  var stone = {
    x: x,
    y: C.stoneFallY,
    targetY: G.surfaceY - 4,
    r:     C.stoneR,
    col:   col,
    phase: Math.random() * 6.28,
    state: "fall",      // fall → hit → sink → done
    vy:    0,
    born:  G.t,
    sinkT: 0,
    sinkP: 0,
    bottom: G.surfaceY + G.H * 0.55,
  };
  G.stones.push(stone);
  G.n++;
  showCounter();
}

/* ═══════════════════════════════════════════
   SPLASH EFFECTS (on surface impact)
   ═══════════════════════════════════════════ */
function splash(stone) {
  var sy = G.surfaceY;

  // Audio
  A.impact();
  // staggered ripples
  for (var i = 0; i < C.rippleCount; i++) {
    setTimeout(function (idx) { A.ripple(); }, i * C.rippleDelay, i);
    G.ripples.push({
      x: stone.x,
      y: sy + 1,
      born: G.t + i * C.rippleDelay,
      maxR: C.rippleMax + idx * 45,
      idx:  i,
    });
  }

  // Particles
  for (var j = 0; j < C.splashN; j++) {
    var a  = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.85;
    var sp = 50 + Math.random() * 140;
    G.particles.push({
      x: stone.x + (Math.random() - 0.5) * 12,
      y: sy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      sz: 1 + Math.random() * 2.8,
      born: G.t,
      life: 500 + Math.random() * 600,
      hue: Math.random() > 0.3,  // true = blue tint, false = warm stone
    });
  }
}

/* ═══════════════════════════════════════════
   UPDATE
   ═══════════════════════════════════════════ */
function update(dt) {
  G.stones.forEach(function (s) {
    switch (s.state) {
      case "fall": {
        s.vy += C.gravity * dt / 1000;
        s.y  += s.vy * dt / 1000;
        if (s.y >= s.targetY) {
          s.y = s.targetY; s.vy = 0;
          s.state = "hit";
          splash(s);
          setTimeout(function () {
            s.state = "sink";
            s.sinkT = 0;
            s.sinkP = 1;
            A.settle();
          }, C.sinkDelay);
        }
        break;
      }
      case "sink": {
        s.sinkT += dt;
        var p = Math.min(1, s.sinkT / C.sinkDuration);
        // ease-out cubic — weight settles, doesn't vanish
        s.sinkP = 1 - Math.pow(1 - p, 3);
        s.y = s.targetY + (s.bottom - s.targetY) * s.sinkP;
        if (p >= 1) {
          s.state = "done";
        }
        break;
      }
    }
  });

  // Clean up finished stones (keep last few for atmosphere)
  if (G.stones.length > 40) {
    G.stones = G.stones.filter(function (s) { return s.state !== "done"; });
  }

  // Clean ripples & particles
  var horizon = G.t - 4500;
  G.ripples  = G.ripples.filter(function (r) { return r.born + 3500 > horizon; });
  G.particles = G.particles.filter(function (p) { return p.born + p.life > horizon; });
}

/* ═══════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════ */
function render() {
  var W = G.W, H = G.H, sy = G.surfaceY;

  // ── Sky (top 34%) ──
  var sky = c.createLinearGradient(0, 0, 0, sy);
  sky.addColorStop(0,    "#06081a");
  sky.addColorStop(0.6,  "#090e24");
  sky.addColorStop(1,    "#0c1529");
  c.fillStyle = sky;
  c.fillRect(0, 0, W, sy);

  // ── Water (bottom 66%) ──
  var wt = c.createLinearGradient(0, sy, 0, H);
  wt.addColorStop(0,    "#0a1728");
  wt.addColorStop(0.35, "#0d1f36");
  wt.addColorStop(0.7,  "#081220");
  wt.addColorStop(1,    "#050a10");
  c.fillStyle = wt;
  c.fillRect(0, sy, W, H - sy);

  // ── Surface wave line ──
  drawWaveLine(sy, 0);
  drawWaveLine(sy + 5, 1.3);

  // ── Subtle caustics ──
  drawCaustics(sy);

  // ── Ripples ──
  G.ripples.forEach(function (r) {
    drawRipple(r);
  });

  // ── Particles ──
  G.particles.forEach(function (p) {
    drawParticle(p);
  });

  // ── Sunk stones (dark silhouettes on bottom) ──
  G.stones.forEach(function (s) {
    if (s.state === "done") {
      drawSunkStone(s);
    }
  });

  // ── Active stones ──
  G.stones.forEach(function (s) {
    if (s.state !== "done") drawStone(s);
  });
}

/* ── Surface wave ── */
function drawWaveLine(baseY, phaseOff) {
  c.beginPath();
  for (var x = 0; x <= G.W; x += 1.5) {
    var wave = Math.sin(x * C.waveFreq + G.t * C.waveSpeed + phaseOff) * C.waveAmp
             + Math.sin(x * C.waveFreq * 2.5 + G.t * C.waveSpeed * 1.6 + phaseOff * 2) * C.waveAmp * 0.35;
    var y = baseY + wave;
    x < 1 ? c.moveTo(x, y) : c.lineTo(x, y);
  }
  c.strokeStyle = "rgba(80,130,185," + (phaseOff ? 0.1 : 0.22) + ")";
  c.lineWidth = phaseOff ? 0.7 : 1.2;
  c.stroke();
}

/* ── Caustic light patches ── */
function drawCaustics(sy) {
  c.save();
  for (var i = 0; i < 6; i++) {
    var cx = (G.W * (0.12 + i * 0.16)) % G.W + Math.sin(G.t * 0.0004 + i * 2) * 25;
    var cy = sy + 50 + Math.sin(G.t * 0.0007 + i) * 18;
    var cr = 55 + Math.sin(G.t * 0.001 + i * 1.4) * 14;
    var gr = c.createRadialGradient(cx, cy, 0, cx, cy, cr);
    gr.addColorStop(0, "rgba(35,75,125,0.035)");
    gr.addColorStop(1, "rgba(35,75,125,0)");
    c.fillStyle = gr;
    c.beginPath(); c.arc(cx, cy, cr, 0, 6.28); c.fill();
  }
  c.restore();
}

/* ── Stone (active) ── */
function drawStone(s) {
  c.save();
  c.translate(s.x, s.y);

  // Shadow on surface
  if (s.y < G.surfaceY) {
    var sha = Math.max(0, 1 - (G.surfaceY - s.y) / 300) * 0.14;
    c.fillStyle = "rgba(0,0,0," + sha + ")";
    c.beginPath();
    c.ellipse(0, G.surfaceY - s.y + 8, s.r * 1.3, s.r * 0.25, 0, 0, 6.28);
    c.fill();
  }

  // Visibility fade during sink
  var alpha = 1;
  if (s.state === "sink") {
    alpha = Math.max(0.06, 1 - s.sinkP * 0.85);
  }
  c.globalAlpha = alpha;

  // Body gradient
  var gr = c.createRadialGradient(-s.r * 0.3, -s.r * 0.35, s.r * 0.08, 0, 0, s.r);
  gr.addColorStop(0,    "#a0907c");
  gr.addColorStop(0.45, s.col);
  gr.addColorStop(1,    "#3a3028");

  // Irregular silhouette (12-point ellipse-ish shape)
  c.fillStyle = gr;
  c.beginPath();
  for (var i = 0; i <= 12; i++) {
    var a  = (i / 12) * 6.28;
    var jit = 1 + Math.sin(a * 3 + s.phase) * 0.12
             + Math.cos(a * 5 + s.phase * 2.1) * 0.06;
    var sx = Math.cos(a) * s.r * jit;
    var sy2 = Math.sin(a) * s.r * jit * 0.82;
    i < 1 ? c.moveTo(sx, sy2) : c.lineTo(sx, sy2);
  }
  c.closePath();
  c.fill();

  // Texture lines
  c.globalAlpha = alpha * 0.18;
  c.strokeStyle = "rgba(160,140,110,0.35)";
  c.lineWidth = 0.5;
  for (var k = 0; k < 3; k++) {
    c.beginPath();
    var sx0 = (k - 1) * s.r * 0.4;
    c.moveTo(sx0 - s.r * 0.25, -s.r * 0.18);
    c.quadraticCurveTo(sx0, s.r * 0.35, sx0 + s.r * 0.25, s.r * 0.12);
    c.stroke();
  }

  // Highlight
  c.globalAlpha = alpha * 0.22;
  var hl = c.createRadialGradient(-s.r * 0.32, -s.r * 0.32, 0, -s.r * 0.32, -s.r * 0.32, s.r * 0.42);
  hl.addColorStop(0, "rgba(210,195,175,0.7)");
  hl.addColorStop(1, "rgba(210,195,175,0)");
  c.fillStyle = hl;
  c.beginPath();
  c.arc(-s.r * 0.32, -s.r * 0.32, s.r * 0.42, 0, 6.28);
  c.fill();

  c.restore();
}

/* ── Sunk stone (dark silhouette on silt) ── */
function drawSunkStone(s) {
  c.save();
  c.globalAlpha = 0.12;
  c.fillStyle = "#2a2520";
  c.beginPath();
  c.ellipse(s.x, s.bottom, s.r * 0.9, s.r * 0.45, 0, 0, 6.28);
  c.fill();
  c.restore();
}

/* ── Ripple ring ── */
function drawRipple(r) {
  var age  = G.t - r.born;
  if (age < 0) return;
  var prog = age / ((r.maxR * 1000) / C.rippleSpeed);
  if (prog > 1) return;
  var radius = age * C.rippleSpeed / 1000;

  // Fade in then fade out
  var a;
  if (age < 60) {            // fade in
    a = (age / 60) * 0.55;
  } else {
    a = (1 - prog) * 0.55;
  }

  c.save();
  c.globalAlpha = Math.max(0, a);

  // Main ring
  c.strokeStyle = "rgba(110,165,220," + (a * 1.1) + ")";
  c.lineWidth  = 1.8 + (1 - prog) * 1.2;
  c.beginPath();
  c.ellipse(r.x, r.y, radius, radius * 0.38, 0, 0, 6.28);
  c.stroke();

  // Inner echo
  if (r.idx % 2 === 0 && radius > 30) {
    c.globalAlpha = Math.max(0, a * 0.4);
    c.lineWidth = 0.7;
    c.beginPath();
    c.ellipse(r.x, r.y, radius * 0.78, radius * 0.3, 0, 0, 6.28);
    c.stroke();
  }

  c.restore();
}

/* ── Splash particle ── */
function drawParticle(p) {
  var age = G.t - p.born;
  if (age < 0 || age > p.life) return;
  var prog = age / p.life;
  if (prog > 1) return;

  var px = p.x + p.vx * age / 1000;
  var py = p.y + p.vy * age / 1000 + 0.5 * 550 * (age / 1000) * (age / 1000);
  var alpha = (1 - prog) * 0.75;
  var sz = p.sz * (1 - prog * 0.4);

  c.save();
  c.globalAlpha = Math.max(0, alpha);
  c.fillStyle = p.hue
    ? "rgba(135,185,230,0.85)"
    : "rgba(170,150,125,0.6)";
  c.beginPath();
  c.arc(px, py, sz, 0, 6.28);
  c.fill();
  c.restore();
}

/* ═══════════════════════════════════════════
   COUNTER
   ═══════════════════════════════════════════ */
function showCounter() {
  if (!counter) return;
  counter.textContent =  G.n + (G.n === 1 ? " stone" : " stones");
  counter.classList.remove("hidden");
  clearTimeout(showCounter._tid);
  showCounter._tid = setTimeout(function () {
    counter.classList.add("hidden");
  }, 4000);
}

/* ═══════════════════════════════════════════
   INPUT
   ═══════════════════════════════════════════ */
function onPointer(x, y) {
  // First tap: init audio + dismiss overlay
  if (!G.started) {
    G.started = true;
    G.on = true;
    A.init();
    A.ambient();
    overlay.classList.add("gone");
    setTimeout(function () { overlay.style.display = "none"; }, 1300);
  }
  dropStone(x, y);
}

var getPos = function (e) {
  if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
};

cvs.addEventListener("click", function (e) { var p = getPos(e); onPointer(p.x, p.y); });
cvs.addEventListener("touchstart", function (e) {
  e.preventDefault();
  var p = getPos(e);
  onPointer(p.x, p.y);
}, { passive: false });

/* Mute toggle */
muteBtn.textContent = G.audioOn ? "\u{1f50a}" : "\u{1f507}";
muteBtn.addEventListener("click", function () {
  G.audioOn = !G.audioOn;
  A.mute(!G.audioOn);
  muteBtn.textContent = G.audioOn ? "\u{1f50a}" : "\u{1f507}";
  muteBtn.classList.toggle("muted", !G.audioOn);
});

/* ═══════════════════════════════════════════
   MAIN LOOP
   ═══════════════════════════════════════════ */
var last = 0;
function loop(ts) {
  var dt = last ? Math.min(ts - last, 50) : 16;
  last = ts;
  G.t += dt;

  update(dt);
  render();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

})();
