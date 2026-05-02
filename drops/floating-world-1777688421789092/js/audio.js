// ── Audio Engine ──
// All sounds synthesized via Web Audio API.
// Degrades gracefully if unavailable.
const Audio = (() => {
  let ctx = null;
  let master = null;
  let paperGain = null;
  let paperSrc = null;
  let waterDrone = null;
  let initialized = false;

   // Noise buffer (baked on init)
  let noiseBuffer = null;

  function init() {
    if (initialized) return;
    try {
       ctx = new (window.AudioContext || window.webkitAudioContext)();
       master = ctx.createGain();
       master.gain.value = 0.32;
       master.connect(ctx.destination);

        // Pre-bake 2 s white noise buffer for all noise layers
       const sr = ctx.sampleRate;
       const len = sr * 2;
       noiseBuffer = ctx.createBuffer(1, len, sr);
       const d = noiseBuffer.getChannelData(0);
       for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

       initialized = true;
      } catch (_) {
        // Web Audio not available – silent fallback
       initialized = false;
      }
    }

   // ── Wooden block tap (press) ──
  function tap() {
    if (!ctx || !initialized) return;
    const now = ctx.currentTime;

     // Sub body: deep thump
    {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(110, now);
      o.frequency.linearRampToValueAtTime(65, now + .1);
      g.gain.setValueAtTime(.35, now);
      g.gain.linearRampToValueAtTime(.04, now + .04);
      g.gain.linearRampToValueAtTime(0, now + .14);
      o.connect(g).connect(master);
      o.start(now);
      o.stop(now + .16);
     }

     // Mid crack: short percussive snap
    {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(340, now);
      o.frequency.linearRampToValueAtTime(180, now + .03);
      g.gain.setValueAtTime(.12, now);
      g.gain.linearRampToValueAtTime(0, now + .06);
      o.connect(g).connect(master);
      o.start(now);
      o.stop(now + .08);
     }
    }

   // ── Paper-rub noise (press + drag) ──
  function startPaperRub() {
    if (!ctx || !initialized) return;
    stopPaperRub(); // restart layer

    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800;
    bp.Q.value = 1.8;

     // Slow downward drift to simulate fiber settling
    const now = ctx.currentTime;
    bp.frequency.setValueAtTime(900, now);
    bp.frequency.linearRampToValueAtTime(500, now + 3);

    paperGain = ctx.createGain();
    paperGain.gain.value = 0;

    src.connect(bp).connect(paperGain).connect(master);
    src.start(now);
    paperSrc = src;
    }

  function setPaperVolume(v) {
    if (paperGain && ctx) {
       paperGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime, .04);
      }
    }

  function stopPaperRub() {
    if (paperSrc) {
       try { paperSrc.stop(ctx.currentTime + .01); } catch (_) {}
       paperSrc = null;
       paperGain = null;
      }
    }

   // ── Water-drag drone (depth-controlled) ──
  function startWaterDrone() {
    if (!ctx || !initialized) return;

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = 62;
    o2.type = 'triangle';
    o2.frequency.value = 124; // second harmonic

    const g = ctx.createGain();
    g.gain.value = 0;

    // Harmonic oscillator very quiet
    const g2 = ctx.createGain();
    g2.gain.value = .3;
    o2.connect(g2).connect(g);
    o1.connect(g);
    g.connect(master);

     // Slow LFO for breathing effect
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = .08;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 3;
    lfo.connect(lfoG).connect(o1.frequency);
    lfo.start();

    o1.start();
    o2.start();
    waterDrone = { o1, o2, g, lfo };
    }

  function setWaterVolume(v) {
    if (waterDrone && ctx) {
       waterDrone.g.gain.setTargetAtTime(Math.max(0, Math.min(.3, v)), ctx.currentTime, .06);
      }
    }

   // ── Settling thump + paper hiss (release) ──
  function settle() {
    if (!ctx || !initialized) return;
    const now = ctx.currentTime;

     // Thump: deep settling
    {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(55, now);
      o.frequency.linearRampToValueAtTime(32, now + .1);
      g.gain.setValueAtTime(.2, now);
      g.gain.linearRampToValueAtTime(0, now + .08);
      g.gain.linearRampToValueAtTime(0, now + .12);
      o.connect(g).connect(master);
      o.start(now);
      o.stop(now + .14);
     }

     // Fading paper hiss
    {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;

      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(1200, now);
      lpf.frequency.linearRampToValueAtTime(200, now + .6);

      const g = ctx.createGain();
      g.gain.setValueAtTime(.05, now);
      g.gain.linearRampToValueAtTime(.01, now + .15);
      g.gain.linearRampToValueAtTime(0, now + .7);

      src.connect(lpf).connect(g).connect(master);
      src.start(now);
      src.stop(now + .8);
     }

     // Fade out continuous layers
    if (paperGain) {
       const fade = setInterval(() => {
         const cur = paperGain.gain.value;
         if (cur < .003) {
           clearInterval(fade);
           stopPaperRub();
           return;
          }
         setPaperVolume(cur * .9);
         }, 50);
      }
    if (waterDrone) {
       const fade = setInterval(() => {
         const cur = waterDrone.g.gain.value;
         if (cur < .003) {
           clearInterval(fade);
           return;
          }
         setWaterVolume(cur * .88);
         }, 50);
      }
    }

  return { init, tap, startPaperRub, setPaperVolume, stopPaperRub,
           startWaterDrone, setWaterVolume, settle };
})();
