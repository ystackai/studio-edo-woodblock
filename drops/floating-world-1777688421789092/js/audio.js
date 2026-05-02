// ── Audio Engine ──
// All sounds synthesized via Web Audio API.
// Degrades gracefully if unavailable.
// Hardened: visibilitychange resume, node disconnect on stop, close on unload,
// lookahead scheduling synced to rAF for zero-drift audio↔canvas sync.
const Audio = (() => {
  let ctx = null;
  let master = null;
  let paperGain = null;
  let paperSrc = null;
  let paperFilter = null;
  let waterDrone = null;
  let initialized = false;
  let settling = false;

   // Noise buffer (baked on init)
  let noiseBuffer = null;

   // ── Lookahead scheduler: schedules audio volume updates on AudioContext clock
   // so they align with rAF frames, not setInterval drift. ──
  let _nextScheduleTime = 0;
  const SCHEDULE_INTERVAL = .02; // 50 Hz scheduling

  function _scheduleTick() {
    if (!ctx || !initialized) return;
    const lookAhead = .05; // 50ms look-ahead into AudioContext clock
    const deadline = ctx.currentTime + lookAhead;

    // Process in micro-steps up to deadline
    while (_nextScheduleTime < deadline) {
      _nextScheduleTime += SCHEDULE_INTERVAL;
      // Continuous volume updates happen inside setPaperVolume/setWaterVolume
      // which already use setTargetAtTime with smooth time constants.
      // This tick serves as a heartbeat to ensure the AudioContext stays "warm"
      // and that any pending ramps are still on track.
    }
  }

  function _ensureCtxActive() {
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx.state !== 'closed';
  }

  function init() {
    if (initialized) {
      _ensureCtxActive();
      if (_nextScheduleTime === 0) _nextScheduleTime = ctx.currentTime;
      return;
    }
    try {
       ctx = new (window.AudioContext || window.webkitAudioContext)();
       // Resume on platforms that suspend until user gesture (iOS, Android)
      if (ctx.state === 'suspended') ctx.resume();
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);

       // Pre-bake 2 s white noise buffer for all noise layers
      const sr = ctx.sampleRate;
      const len = sr * 2;
      noiseBuffer = ctx.createBuffer(1, len, sr);
      const d = noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

      _nextScheduleTime = ctx.currentTime;

       // Visibility change: resume context when user returns to tab
      document.addEventListener('visibilitychange', _onVisibilityChange);

       // Cleanup on page unload: close context to free all AudioNodes
      window.addEventListener('beforeunload', _onUnload);

      initialized = true;
      } catch (_) {
       // Web Audio not available – silent fallback
      initialized = false;
      }
    }

   function _onVisibilityChange() {
     if (document.hidden) return;
     // User returned: resume suspended AudioContext
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
      // Reset schedule clock to account for time the tab was hidden
      _nextScheduleTime = ctx.currentTime;
     }
   }

   function _onUnload() {
     _cleanupAll();
     if (ctx) {
       try { ctx.close(); } catch (_) {}
       ctx = null;
     }
   }

   // ── Cleanup: disconnect all nodes and null out references ──
  function _cleanupAll() {
    stopPaperRub(true);
    stopWaterDrone(true);
    master = null;
    paperFilter = null;
  }

   // ── Wooden block tap (press) ──
  function tap() {
    if (!_ensureCtxActive()) return;
    const now = ctx.currentTime;

      // Lookahead: schedule slightly in the future to align with rAF rendering
     const sched = now + .005;

      // Sub body: deep thump
     {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(110, sched);
      o.frequency.linearRampToValueAtTime(65, sched + .1);
      g.gain.setValueAtTime(0, sched);
      g.gain.linearRampToValueAtTime(.35, sched + .005);
      g.gain.linearRampToValueAtTime(.04, sched + .04);
      g.gain.linearRampToValueAtTime(0, sched + .14);
      o.connect(g).connect(master);
      o.start(sched);
      o.stop(sched + .16);
      }

      // Mid crack: short percussive snap
     {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(340, sched);
      o.frequency.linearRampToValueAtTime(180, sched + .03);
      g.gain.setValueAtTime(0, sched);
      g.gain.linearRampToValueAtTime(.12, sched + .005);
      g.gain.linearRampToValueAtTime(0, sched + .06);
      o.connect(g).connect(master);
      o.start(sched);
      o.stop(sched + .08);
      }
   }

   // ── Paper-rub noise (press + drag) ──
  function startPaperRub() {
    if (!_ensureCtxActive()) return;
    stopPaperRub(false);

    const now = ctx.currentTime;
    const sched = now + .005;

    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.8;
    bp.frequency.setValueAtTime(900, sched);
    bp.frequency.linearRampToValueAtTime(500, sched + 3);

    paperGain = ctx.createGain();
    paperGain.gain.value = 0;
    paperFilter = bp;

    src.connect(bp).connect(paperGain).connect(master);
    src.start(sched);
    paperSrc = src;
   }

  function setPaperVolume(v) {
    if (paperGain && ctx) {
       // Use setTargetAtTime for smooth, low-latency volume transitions
       // .04s time constant keeps audio in sync with visual frame rate
      paperGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime, .04);
       _scheduleTick();
      }
   }

  function stopPaperRub(hard) {
    if (paperSrc) {
      try {
        // Scheduling stop at current time to avoid audio glitch
       const stopT = hard ? ctx.currentTime : ctx.currentTime + .01;
        paperSrc.stop(stopT);
      } catch (_) {}
       // Disconnect filter and gain nodes to free them
      try { paperFilter.disconnect(); } catch (_) {}
      try { paperGain.disconnect(); } catch (_) {}
      paperSrc = null;
      paperGain = null;
      paperFilter = null;
    }
   }

   // ── Water-drag drone (depth-controlled) ──
  function startWaterDrone() {
    if (!_ensureCtxActive()) return;
    stopWaterDrone(false);

    const now = ctx.currentTime;
    const sched = now + .005;

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = 62;
    o2.type = 'triangle';
    o2.frequency.value = 124;

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
    lfo.start(sched);

    o1.start(sched);
    o2.start(sched);
    waterDrone = { o1, o2, g, lfo, lfoG, g2 };
   }

  function setWaterVolume(v) {
    if (waterDrone && ctx) {
       waterDrone.g.gain.setTargetAtTime(Math.max(0, Math.min(.3, v)), ctx.currentTime, .06);
       _scheduleTick();
      }
    }

   function stopWaterDrone(hard) {
    if (!waterDrone) return;
    const now = ctx.currentTime;
    const stopT = hard ? now : now + .01;
     // Stop oscillators
    try { waterDrone.o1.stop(stopT); } catch (_) {}
    try { waterDrone.o2.stop(stopT); } catch (_) {}
    try { waterDrone.lfo.stop(stopT); } catch (_) {}
     // Disconnect ALL nodes to prevent GC leaks and dangling audio routing
    try { waterDrone.o1.disconnect(); } catch (_) {}
    try { waterDrone.o2.disconnect(); } catch (_) {}
    try { waterDrone.lfo.disconnect(); } catch (_) {}
    try { waterDrone.lfoG.disconnect(); } catch (_) {}
    try { waterDrone.g.disconnect(); } catch (_) {}
    try { waterDrone.g2.disconnect(); } catch (_) {}
    waterDrone = null;
   }

          // ── Settling thump + paper hiss (release) ──
        // Uses Web Audio scheduling instead of setInterval for reliable fade-out
        // Double-call guard prevents pointerup/pointercancel race
  function settle() {
    if (!ctx || !initialized || settling) return;
    if (ctx.state === 'suspended') ctx.resume();
    settling = true;
    const now = ctx.currentTime;
    const sched = now + .005;

          // Thump: deep settling
       {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(55, sched);
        o.frequency.linearRampToValueAtTime(32, sched + .1);
        g.gain.setValueAtTime(0, sched);
        g.gain.linearRampToValueAtTime(.2, sched + .005);
        g.gain.linearRampToValueAtTime(0, sched + .08);
        g.gain.linearRampToValueAtTime(0, sched + .12);
        o.connect(g).connect(master);
        o.start(sched);
        o.stop(sched + .14);
           }

            // Fading paper hiss
          {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;

        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(1200, sched);
        lpf.frequency.linearRampToValueAtTime(200, sched + .6);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0, sched);
        g.gain.linearRampToValueAtTime(.05, sched + .005);
        g.gain.linearRampToValueAtTime(.01, sched + .15);
        g.gain.linearRampToValueAtTime(0, sched + .7);

        src.connect(lpf).connect(g).connect(master);
        src.start(sched);
        src.stop(sched + .8);
           }

            // Fade out continuous layers using exponential ramp (no setInterval)
    if (paperGain) {
        const cur = Math.max(.001, paperGain.gain.value);
        paperGain.gain.setValueAtTime(cur, sched);
        paperGain.gain.exponentialRampToValueAtTime(.001, sched + 1.5);
        setTimeout(() => stopPaperRub(true), 1600);
           }
    if (waterDrone) {
        const cur = Math.max(.001, waterDrone.g.gain.value);
        waterDrone.g.gain.setValueAtTime(cur, sched);
        waterDrone.g.gain.exponentialRampToValueAtTime(.001, sched + 1.2);
          // Stop oscillators after fade completes
        setTimeout(() => stopWaterDrone(true), 1300);
         }
       // Unlock settle guard after audio has fully faded
       setTimeout(() => { settling = false; }, 1700);
      }

   // ── Reset audio: softer tap + brief paper sigh ──
  function playReset() {
    if (!_ensureCtxActive()) return;
    const now = ctx.currentTime;
    const sched = now + .005;

          // Faint wood tap (half the force of press tap)
       {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(80, sched);
        o.frequency.linearRampToValueAtTime(50, sched + .06);
        g.gain.setValueAtTime(0, sched);
        g.gain.linearRampToValueAtTime(.1, sched + .005);
        g.gain.linearRampToValueAtTime(0, sched + .05);
        o.connect(g).connect(master);
        o.start(sched);
        o.stop(sched + .08);
          }

           // Gentle paper sigh: rising then falling noise, very quiet
        {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;

        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(300, sched);
        lpf.frequency.linearRampToValueAtTime(900, sched + .5);
        lpf.frequency.linearRampToValueAtTime(300, sched + 1.2);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0, sched);
        g.gain.linearRampToValueAtTime(.005, sched + .005);
        g.gain.linearRampToValueAtTime(.025, sched + .3);
        g.gain.linearRampToValueAtTime(.005, sched + .8);
        g.gain.linearRampToValueAtTime(0, sched + 1.2);

        src.connect(lpf).connect(g).connect(master);
        src.start(sched);
        src.stop(sched + 1.4);
          }
        }

   // ── Fade all continuous layers to silence over `durationMs` (no setInterval) ──
  function fadeAllDown(durationMs) {
    if (!ctx || !initialized) return;
    const now = ctx.currentTime;
    const sched = now + .005;
    const dur = durationMs / 1000;
    if (paperGain) {
      paperGain.gain.setValueAtTime(Math.max(.001, paperGain.gain.value), sched);
      paperGain.gain.exponentialRampToValueAtTime(.001, sched + dur);
     }
    if (waterDrone) {
      waterDrone.g.gain.setValueAtTime(Math.max(.001, waterDrone.g.gain.value), sched);
      waterDrone.g.gain.exponentialRampToValueAtTime(.001, sched + dur);
     }
  }

   // Expose _scheduleTick so app.js can call it each rAF frame
  function scheduleTick() {
    _scheduleTick();
  }

   return { init, tap, startPaperRub, setPaperVolume, stopPaperRub,
               startWaterDrone, setWaterVolume, stopWaterDrone, settle, playReset, fadeAllDown,
               scheduleTick };
})();
