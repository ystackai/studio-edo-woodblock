/**
 * Ink Tide: Moonlit Harbor Press — Sparse Sound Bed
 * All audio procedural via Web Audio API. Zero external assets.
 *
 * Layers:
 *   - press  : soft wooden block tap + paper-fiber rub
 *   - drag   : gentle water/ink drag, amplitude linked to tide depth
 *   - release: soft settling thump + fading paper hiss
 *   - ambient: distant harbor tone (single low sustained oscillation)
 *
 * Rules:
 *   - Audio initializes strictly after a user gesture (click, touchstart).
 *   - Degrades gracefully — silent fallback if Web Audio is unavailable.
 *   - No brightness, no glassy physics, no synthetic arps.
 *   - Master gain kept low. Everything matte.
 */

class InkTideAudio {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.noiseBuffer = null;
        this.initialized = false;
        this.available = false;

        // Active hold layer handles
        this.dragSource = null;
        this.dragGain = null;
        this.dragBandpass = null;
        this.dragLfo = null;
        this.dragRumble = null;
        this.dragRumbleGain = null;

        // Harbor ambient handle
        this.harbourOsc = null;
        this.harbourGain = null;
    }

    /* ------------------------------------------------------------------ */
    /*  Init                                                              */
    /* ------------------------------------------------------------------ */

    /**
     * Must be called on a user gesture (click / touchstart).
     * Returns true when audio is live, false when silently degraded.
     */
    init() {
        if (this.initialized) return this.available;

        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) { this._degrade(); return false; }

            this.ctx = new Ctx();
            this.available = true;
        } catch (_) {
            this._degrade();
            return false;
        }

        // Master gain — restrained overall volume
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.35;
        this.masterGain.connect(this.ctx.destination);

        // Pre-bake 2 s white noise buffer
        const sr = this.ctx.sampleRate;
        const len = sr * 2;
        this.noiseBuffer = this.ctx.createBuffer(1, len, sr);
        const d = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

        // Start ambient harbor tone
        this._startHarbourTone();

        this.initialized = true;
        return true;
    }

    /** Quiet fallback when Web Audio cannot load */
    _degrade() {
        this.available = false;
        this.initialized = false;
    }

    /* ------------------------------------------------------------------ */
    /*  Ambient — distant harbor tone                                    */
    /* ------------------------------------------------------------------ */

    _startHarbourTone() {
        const now = this.ctx.currentTime;

        // Single low sustained oscillation at ~62 Hz (dark B-flat)
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 62;

        // Second harmonic, very quiet, for a faint reedy overtone
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = 124;

        const g1 = this.ctx.createGain();
        g1.gain.value = 0.06;

        const g2 = this.ctx.createGain();
        g2.gain.value = 0.02;

        // Slow LFO to make it feel "breathing"
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08;
        const lfoG = this.ctx.createGain();
        lfoG.gain.value = 3;
        lfo.connect(lfoG).connect(osc.frequency);

        osc.connect(g1).connect(this.masterGain);
        osc2.connect(g2).connect(this.masterGain);
        osc.start(now);
        osc2.start(now);
        lfo.start(now);

        this.harbourOsc = osc;
        this.harbourGain = g1;
    }

    /* ------------------------------------------------------------------ */
    /*  PRESS — wooden block tap + paper-fiber rub                      */
    /* ------------------------------------------------------------------ */

    /**
     * Wooden block tap: short percussive thump with a mid crack.
     * Paper rub: a brief filtered-burst of noise.
     */
    playPress() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;

        // --- Wooden tap ---
        // Sub body ~110 Hz
        const tapOsc = this.ctx.createOscillator();
        tapOsc.type = 'sine';
        tapOsc.frequency.setValueAtTime(110, now);
        tapOsc.frequency.linearRampToValueAtTime(65, now + 0.08);

        const tapG = this.ctx.createGain();
        tapG.gain.setValueAtTime(0.35, now);
        tapG.gain.linearRampToValueAtTime(0.04, now + 0.04);
        tapG.gain.linearRampToValueAtTime(0, now + 0.12);

        tapOsc.connect(tapG).connect(this.masterGain);
        tapOsc.start(now);
        tapOsc.stop(now + 0.14);

        // Mid crack ~340 Hz, shorter
        const crackOsc = this.ctx.createOscillator();
        crackOsc.type = 'sine';
        crackOsc.frequency.setValueAtTime(340, now);
        crackOsc.frequency.linearRampToValueAtTime(180, now + 0.04);

        const crackG = this.ctx.createGain();
        crackG.gain.setValueAtTime(0.12, now);
        crackG.gain.linearRampToValueAtTime(0, now + 0.06);

        crackOsc.connect(crackG).connect(this.masterGain);
        crackOsc.start(now);
        crackOsc.stop(now + 0.08);

        // --- Paper-fiber rub ---
        // Short noise burst, bandpass ~800 Hz, tight envelope
        const rubSource = this.ctx.createBufferSource();
        rubSource.buffer = this.noiseBuffer;

        const rubBp = this.ctx.createBiquadFilter();
        rubBp.type = 'bandpass';
        rubBp.frequency.setValueAtTime(900, now);
        rubBp.frequency.linearRampToValueAtTime(500, now + 0.15);
        rubBp.Q.value = 2;

        const rubG = this.ctx.createGain();
        rubG.gain.setValueAtTime(0.08, now);
        rubG.gain.linearRampToValueAtTime(0.02, now + 0.06);
        rubG.gain.linearRampToValueAtTime(0, now + 0.18);

        rubSource.connect(rubBp).connect(rubG).connect(this.masterGain);
        rubSource.start(now);
        rubSource.stop(now + 0.2);
    }

    /* ------------------------------------------------------------------ */
    /*  DRAG — water/ink drag + low filtered resonance                  */
    /* ------------------------------------------------------------------ */

    /**
     * depth: 0→1, controls amplitude of the drag layer.
     * Call repeatedly while the user drags.
     */
    playDrag(depth) {
        if (!this.initialized) return;
        depth = Math.max(0, Math.min(1, depth));

        // If the drag layer is already running, just scale it
        if (this.dragSource && this.dragSource.active !== false) {
            if (this.dragGain) {
                this.dragGain.gain.setTargetAtTime(depth * 0.12, this.ctx.currentTime, 0.04);
            }
            if (this.dragRumbleGain) {
                this.dragRumbleGain.gain.setTargetAtTime(depth * 0.06, this.ctx.currentTime, 0.05);
            }
            return;
        }

        const now = this.ctx.currentTime;

        // --- Water / ink drag noise ---
        const dragSrc = this.ctx.createBufferSource();
        dragSrc.buffer = this.noiseBuffer;
        dragSrc.loop = true;

        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(350, now);
        bp.Q.value = 1.2;

        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(700, now);
        lp.frequency.linearRampToValueAtTime(350, now + 1.5);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(depth * 0.12, now);

        // Subtle LFO drift for organic water movement
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.25;
        const lfoG = this.ctx.createGain();
        lfoG.gain.value = 50;
        lfo.connect(lfoG).connect(bp.frequency);

        dragSrc.connect(bp).connect(lp).connect(g).connect(this.masterGain);
        dragSrc.start(now);
        lfo.start(now);

        // --- Low rumble tied to depth ---
        const rumble = this.ctx.createOscillator();
        rumble.type = 'sine';
        rumble.frequency.setValueAtTime(40, now);

        const rumbleG = this.ctx.createGain();
        rumbleG.gain.setValueAtTime(depth * 0.06, now);

        rumble.connect(rumbleG).connect(this.masterGain);
        rumble.start(now);

        // Store handles
        this.dragSource = dragSrc;
        this.dragGain = g;
        this.dragBandpass = bp;
        this.dragLfo = lfo;
        this.dragRumble = rumble;
        this.dragRumbleGain = rumbleG;
    }

    /**
     * Stop the drag layer.
     */
    stopDrag() {
        if (!this.dragSource) return;

        const now = this.ctx.currentTime;
        const src = this.dragSource;

        try {
            if (this.dragGain) this.dragGain.gain.setValueAtTime(0, now);
            if (this.dragRumbleGain) this.dragRumbleGain.gain.setValueAtTime(0, now);
            src.stop(now + 0.01);
            this.dragRumble.stop(now + 0.01);
            this.dragLfo.stop(now + 0.01);
        } catch (_) { /* already stopped */ }

        src.active = false;
        this.dragSource = null;
        this.dragGain = null;
        this.dragBandpass = null;
        this.dragLfo = null;
        this.dragRumble = null;
        this.dragRumbleGain = null;
    }

    /* ------------------------------------------------------------------ */
    /*  RELEASE — settling thump + paper hiss                           */
    /* ------------------------------------------------------------------ */

    playRelease() {
        if (!this.initialized) return;

        // Kill the drag layer first
        this.stopDrag();

        const now = this.ctx.currentTime;

        // --- Settling thump ---
        const thumpOsc = this.ctx.createOscillator();
        thumpOsc.type = 'sine';
        thumpOsc.frequency.setValueAtTime(55, now);
        thumpOsc.frequency.linearRampToValueAtTime(32, now + 0.1);

        const thumpG = this.ctx.createGain();
        thumpG.gain.setValueAtTime(0.2, now);
        thumpG.gain.linearRampToValueAtTime(0, now + 0.08);

        thumpOsc.connect(thumpG).connect(this.masterGain);
        thumpOsc.start(now);
        thumpOsc.stop(now + 0.12);

        // --- Fading paper hiss ---
        const hissSrc = this.ctx.createBufferSource();
        hissSrc.buffer = this.noiseBuffer;

        const hissLpf = this.ctx.createBiquadFilter();
        hissLpf.type = 'lowpass';
        hissLpf.frequency.setValueAtTime(1200, now);
        hissLpf.frequency.linearRampToValueAtTime(200, now + 0.6);

        const hissG = this.ctx.createGain();
        hissG.gain.setValueAtTime(0.05, now);
        hissG.gain.linearRampToValueAtTime(0.01, now + 0.15);
        hissG.gain.linearRampToValueAtTime(0, now + 0.7);

        hissSrc.connect(hissLpf).connect(hissG).connect(this.masterGain);
        hissSrc.start(now);
        hissSrc.stop(now + 0.8);
    }

    /* ------------------------------------------------------------------ */
    /*  Lifecycle                                                         */
    /* ------------------------------------------------------------------ */

    destroy() {
        this.stopDrag();
        if (this.ctx && this.ctx.state !== 'closed') {
            try { this.ctx.close(); } catch (_) {}
        }
        this.initialized = false;
        this.available = false;
    }
}
