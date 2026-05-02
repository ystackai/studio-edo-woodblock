// ── Audio Engine ──//
// All sounds synthesized via Web Audio API.
// Degrades gracefully if unavailable.//
const Audio = (() => {
  let ctx = null;
  let master = null;
  let waterOsc = null;
  let paperGain = null;
  let initialized = false;

  function init() {
    if (initialized) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
      initialized = true;
    } catch (_) {
      // Web Audio not available – silent fallback
    }
  }

  // ── Wooden block tap (press) ──
  function tap() {
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(180, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + .12);
    g.gain.setValueAtTime(.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .18);
    o.connect(g);
    g.connect(master);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + .18);
  }

  // ── Paper-rub noise (press + drag) ──
  function startPaperRub() {
    if (!ctx) return;
    const bufLen = ctx.sampleRate * .8;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      d[i] = (Math.random() * 2 - 1) * .18;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 700;
    paperGain = ctx.createGain();
    paperGain.gain.value = 0;
    src.connect(f);
    f.connect(paperGain);
    paperGain.connect(master);
    src.start();
    waterOsc = src;
  }
  function setPaperVolume(v) {
    if (paperGain) paperGain.gain.setTargetAtTime(v, ctx.currentTime, .04);
  }
  function stopPaperRub() {
    if (waterOsc) {
      waterOsc.stop();
      waterOsc = null;
      paperGain = null;
    }
  }

  // ── Water-drag drone (depth-controlled) ──
  let waterDrone = null;
  function startWaterDrone() {
    if (!ctx) return;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = 62;
    o2.type = 'sine';
    o2.frequency.value = 63.5;
    const g = ctx.createGain();
    g.gain.value = 0;
    o1.connect(g);
    o2.connect(g);
    g.connect(master);
    o1.start();
    o2.start();
    waterDrone = { o1, o2, g };
  }
  function setWaterVolume(v) {
    if (waterDrone) waterDrone.g.gain.setTargetAtTime(v, ctx.currentTime, .06);
  }

  // ── Settling thump + paper hiss (release) ──
  function settle() {
    if (!ctx) return;
    // Thump
    {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(80, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + .35);
      g.gain.setValueAtTime(.45, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .45);
      o.connect(g);
      g.connect(master);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + .45);
    }
    // Hiss
    {
      const bufLen = ctx.sampleRate * 1.2;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        d[i] = (Math.random() * 2 - 1) * .12;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 400;
      f.Q.value = .8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + 1.2);
      src.connect(f);
      f.connect(g);
      g.connect(master);
      src.start(ctx.currentTime);
      src.stop(ctx.currentTime + 1.2);
    }
  }

  return { init, tap, startPaperRub, setPaperVolume, stopPaperRub,
           startWaterDrone, setWaterVolume, settle };
})();
