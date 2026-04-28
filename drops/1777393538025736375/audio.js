/* audio.js — WebAudioContext for:
 * 1. Koto drone (82 Hz low-frequency ambient)
 * 2. Impact "soft thud" (120 Hz low-pass kick + woodblock)
 * 3. Release "exhale" (3.2 s reverb tail)
 * All through a single compressor to prevent clipping.
 */

(function () {
  'use strict';

  let ctx = null;
  let compressor = null;
  let droneOsc = null;
  let droneGain = null;
  let masterGain = null;
  let initialized = false;

  /* cubic-bezier(0.25, 1, 0.5, 1) approximated as an audio envelope.
   * t=0→1, eased via the bezier curve: starts fast, decelerates into a long tail.
   */
  function cubicBezierEase(t) {
    /* Approximate cubic-bezier(0.25, 1, 0.5, 1) with a polynomial fit.
     * This curve rises quickly then tapers — good for a "drop" envelope.
     */
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const a = 0.25, b = 1.0, c = 0.5, d = 1.0;
    /* Use the parametric form — simple approximation via 1 - (1-t)^2 * (1 - t*0.5) */
    return t * t * (3 - 2 * t) * 0.9 + t * 0.1;
  }

  /* Impulse response for the 3.2 s reverb — generated from noise */
  function createReverbIR(duration, decays) {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const env = Math.exp(-decays * i / sampleRate);
        data[i] = (Math.random() * 2 - 1) * env;
       }
     }
    return impulse;
  }

  function init() {
    if (initialized) return;
    initialized = true;

    ctx = new (window.AudioContext || window.webkitAudioContext)();

    /* Single compressor to prevent clipping */
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressor.connect(ctx.destination);

    /* Master gain (for ducking) */
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(compressor);

    /* Koto drone: 82 Hz, low-frequency oscillator with harmonics */
    droneOsc = ctx.createOscillator();
    droneOsc.type = 'sine';
    droneOsc.frequency.value = 82;
    droneGain = ctx.createGain();
    droneGain.gain.value = 0.12;
    droneOsc.connect(droneGain);
    droneGain.connect(masterGain);
    droneOsc.start();

    /* Second harmonic for warmth */
    const drone2 = ctx.createOscillator();
    drone2.type = 'triangle';
    drone2.frequency.value = 82 * 2.01;
    const g2 = ctx.createGain();
    g2.gain.value = 0.04;
    drone2.connect(g2);
    g2.connect(masterGain);
    drone2.start();
  }

  /* Impact sound: soft thud = 120 Hz kick (low-pass) + woodblock strike */
  function playImpact() {
    if (!ctx) { init(); }
    const now = ctx.currentTime;

    /* Duck the master gain by 6 dB when haptics peak */
    masterGain.gain.setTargetAtTime(0.5, now, 0.02);
    masterGain.gain.setTargetAtTime(0.8, now + 0.15, 0.1);

    /* Low-pass filtered kick at 120 Hz */
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 250;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    /* cubic-bezier envelope: fast attack, slow release */
    env.gain.linearRampToValueAtTime(0.7, now + 0.015);
    env.gain.setTargetAtTime(0, now + 0.03, 0.08);

    osc.connect(filter);
    filter.connect(env);
    env.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.4);

    /* Woodblock strike — short noise burst */
    const noiseLen = ctx.sampleRate * 0.04;
    const buf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseLen * 0.15));
     }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 2200;
    nf.Q.value = 3;
    noise.connect(nf);
    nf.connect(masterGain);
    noise.start(now);
  }

  /* Release exhale: 3.2 s reverb tail */
  function playRelease() {
    if (!ctx) { init(); }
    const now = ctx.currentTime;

    /* Create a "sigh" — descending noise through reverb */
    const sighLen = ctx.sampleRate * 0.6;
    const buf = ctx.createBuffer(1, sighLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < sighLen; i++) {
      const t = i / sighLen;
      data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.3;
     }
    const source = ctx.createBufferSource();
    source.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.5);
    filter.Q.value = 1.2;

    /* Reverb — 3.2 s tail */
    const reverb = ctx.createConvolver();
    reverb.buffer = createReverbIR(3.2, 2.0);

    source.connect(filter);
    filter.connect(reverb);
    reverb.connect(masterGain);
    source.start(now);

    /* Gentle sine exhale */
    const exhaleOsc = ctx.createOscillator();
    exhaleOsc.type = 'sine';
    exhaleOsc.frequency.setValueAtTime(220, now);
    exhaleOsc.frequency.exponentialRampToValueAtTime(110, now + 1.2);
    const exGain = ctx.createGain();
    exGain.gain.setValueAtTime(0.08, now);
    exGain.gain.setTargetAtTime(0, now + 0.05, 0.3);
    exhaleOsc.connect(exGain);
    exGain.connect(reverb);
    exhaleOsc.start(now);
    exhaleOsc.stop(now + 2.5);
  }

    window.AudioEngine = {
    init: init,
    playImpact: playImpact,
    playRelease: playRelease,
    get _audioCtx() { return ctx; },
   };
})();
