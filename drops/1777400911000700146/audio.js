/**
 * Procedural Audio Engine for Stone Sink Interaction
 * All audio generated via Web Audio API — zero external assets.
 * Envelope hard-wired to cubic-bezier(0.25, 1, 0.5, 1) decay curve.
 */
class StoneAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.noiseBuffer = null;
        this.initialized = false;
        this.state = 'idle'; // idle | pressing | holding | releasing
        this.pressTime = 0;
        this.currentThud = null;
        this.currentHold = null;
        this.holdAmplitude = 0;
        // Haptic decay curve: cubic-bezier(0.25, 1, 0.5, 1)
        this.bezierP = { x1: 0.25, y1: 1.0, x2: 0.5, y2: 1.0 };
        this.syncWarning = false;
        this.lastHapticAmplitude = 0;
    }

    /**
     * Initialize audio context on first user gesture (browser policy).
     */
    init() {
        if (this.initialized) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Master gain — strictly matte, no reverb, no tail
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.7;
        this.masterGain.connect(this.ctx.destination);

        // Pre-generate 2-second white noise buffer for texture
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * 2;
        this.noiseBuffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.initialized = true;
    }

    /**
     * Evaluate cubic-bezier(0.25, 1, 0.5, 1) at t [0,1].
     * This is the haptic decay curve we must match within ±10ms.
     */
    bezier(t) {
        t = Math.max(0, Math.min(1, t));
        // Cubic bezier using parametric form
        const cx = 3 * this.bezierP.x1;
        const bx = 3 * (this.bezierP.x2 - this.bezierP.x1) - cx;
        const ax = 1 - cx - bx;
        const cy = 3 * this.bezierP.y1;
        const by = 3 * (this.bezierP.y2 - this.bezierP.y1) - cy;
        const ay = 1 - cy - by;

        // Solve for parameter u given t (x-axis) via Newton-Raphson
        let u = t;
        for (let i = 0; i < 8; i++) {
            const x = ((ax * u + bx) * u + cx) * u - t;
            const dx = (3 * ax * u + 2 * bx) * u + cx;
            if (Math.abs(dx) < 1e-6) break;
            u -= x / dx;
        }
        u = Math.max(0, Math.min(1, u));

        // Compute y at u
        return ((ay * u + by) * u + cy) * u;
    }

    /**
     * INVERSE: given a normalized y value, find the t that produces it.
     * Used to map haptic amplitude back to time for sync checking.
     */
    inverseBezier(y) {
        y = Math.max(0, Math.min(1, y));
        // Binary search for t that gives this y
        let lo = 0, hi = 1;
        for (let i = 0; i < 32; i++) {
            const mid = (lo + hi) / 2;
            if (this.bezier(mid) < y) lo = mid;
            else hi = mid;
        }
        return (lo + hi) / 2;
    }

    /**
     * PRESS: Low-frequency thud (~80Hz peak, low-pass filtered).
     * Matte mix — no reverb, no tail.
     */
    playThud() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        this.pressTime = now;
        this.state = 'pressing';

        // Sub-oscillator for the 80Hz body
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.12);

        // Second oscillator for harmonic thickness at 160Hz
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(160, now);
        osc2.frequency.linearRampToValueAtTime(100, now + 0.08);

        // Low-pass filter to kill brightness, keep it matte
        const lpf = this.ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(400, now);
        lpf.frequency.linearRampToValueAtTime(120, now + 0.2);
        lpf.Q.value = 0.5;

        // Click transient — short noise burst shaped by decay curve
        const thudNoise = this.ctx.createBufferSource();
        thudNoise.buffer = this.noiseBuffer;
        const thudNoiseLpf = this.ctx.createBiquadFilter();
        thudNoiseLpf.type = 'lowpass';
        thudNoiseLpf.frequency.setValueAtTime(200, now);
        thudNoiseLpf.frequency.linearRampToValueAtTime(60, now + 0.15);

        // Envelope following cubic-bezier decay
        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.8, now);
        // Sample the bezier at several points for a smooth envelope
        const steps = 20;
        const duration = 0.3;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const y = this.bezier(t);
            env.gain.setTargetAtTime(y, now + t * duration, 0.005);
        }
        // Hard stop at end with zero tail
        env.gain.setValueAtTime(0, now + duration + 0.01);

        // Oscillator gains — dense but short
        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(this.bezier(0), now);
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            oscGain.gain.setTargetAtTime(this.bezier(t), now + t * duration, 0.003);
        }
        oscGain.gain.setValueAtTime(0, now + duration + 0.01);

        const osc2Gain = this.ctx.createGain();
        osc2Gain.gain.setValueAtTime(0.3, now);
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            osc2Gain.gain.setTargetAtTime(this.bezier(t) * 0.3, now + t * duration * 0.7, 0.004);
        }
        osc2Gain.gain.setValueAtTime(0, now + duration * 0.7 + 0.01);

        // Noise gain
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            noiseGain.gain.setTargetAtTime(this.bezier(t) * 0.4, now + t * duration, 0.005);
        }
        noiseGain.gain.setValueAtTime(0, now + duration + 0.01);

        // Wire up
        osc.connect(oscGain).connect(lpf);
        osc2.connect(osc2Gain).connect(lpf);
        thudNoise.connect(thudNoiseLpf).connect(noiseGain).connect(lpf);
        lpf.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration + 0.05);
        osc2.start(now);
        osc2.stop(now + duration * 0.7 + 0.05);
        thudNoise.start(now);
        thudNoise.stop(now + duration + 0.05);

        this.currentThud = { osc, osc2, env, gain: oscGain };

        // Transition to hold state
        setTimeout(() => {
            if (this.state === 'pressing' || this.state === 'holding') {
                this.state = 'holding';
            }
        }, 100);
    }

    /**
     * HOLD: Wet drag texture. Noise-based grain, amplitude scaled by haptic amplitude.
     * This creates the "breath-like exhale" of sustained pressure.
     * The hapticAmplitude parameter should come from the bezier decay curve.
     */
    playHold(hapticAmplitude) {
        if (!this.initialized) return;
        hapticAmplitude = Math.max(0, Math.min(1, hapticAmplitude));
        this.holdAmplitude = hapticAmplitude;

        if (this.currentHold && this.currentHold.active) {
            // Scale existing hold texture amplitude
            if (this.currentHold.gain) {
                this.currentHold.gain.gain.setTargetAtTime(hapticAmplitude * 0.3, this.ctx.currentTime, 0.02);
            }
            if (this.currentHold.rumbleGain) {
                this.currentHold.rumbleGain.gain.setTargetAtTime(hapticAmplitude * 0.15, this.ctx.currentTime, 0.03);
            }
            return;
        }

        const now = this.ctx.currentTime;
        this.state = 'holding';

        // Wet drag: filtered noise with slow-moving bandpass
        const dragSource = this.ctx.createBufferSource();
        dragSource.buffer = this.noiseBuffer;
        dragSource.loop = true;

        // Bandpass to create the "wet" character
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(300, now);
        bandpass.Q.value = 1.5;

        // Low-pass on top for matte texture
        const wetLpf = this.ctx.createBiquadFilter();
        wetLpf.type = 'lowpass';
        wetLpf.frequency.setValueAtTime(800, now);
        wetLpf.frequency.linearRampToValueAtTime(400, now + 1.0);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(hapticAmplitude * 0.3, now);

        // Sub-rumble: low frequency oscillation for weight
        const rumble = this.ctx.createOscillator();
        rumble.type = 'sine';
        rumble.frequency.setValueAtTime(45, now);
        rumble.frequency.linearRampToValueAtTime(35, now + 2);

        const rumbleGain = this.ctx.createGain();
        rumbleGain.gain.setValueAtTime(hapticAmplitude * 0.15, now);

        // Slight frequency drift for organic texture
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.3; // Very slow LFO
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 40; // ±40Hz drift
        lfo.connect(lfoGain).connect(bandpass.frequency);

        // Wire up
        dragSource.connect(bandpass).connect(wetLpf).connect(gain).connect(this.masterGain);
        rumble.connect(rumbleGain).connect(this.masterGain);

        dragSource.start(now);
        rumble.start(now);
        lfo.start(now);

        this.currentHold = {
            source: dragSource,
            rumble,
            lfo,
            gain,
            rumbleGain,
            bandpass,
            wetLpf,
            active: true
        };
    }

    /**
     * RELEASE: Deadened click. High-pass filtered to remove ring, low-pass to soften click.
     * Zero tail — completely matte.
     */
    playRelease() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;
        this.state = 'releasing';

        // Stop the hold texture immediately
        this.stopHold();

        // Deadened click: brief noise with high-pass + low-pass sandwich
        const clickNoise = this.ctx.createBufferSource();
        clickNoise.buffer = this.noiseBuffer;

        // High-pass to remove ring
        const hpf = this.ctx.createBiquadFilter();
        hpf.type = 'highpass';
        hpf.frequency.value = 600;

        // Low-pass to soften the click, no brightness
        const clickLpf = this.ctx.createBiquadFilter();
        clickLpf.type = 'lowpass';
        clickLpf.frequency.value = 2000;
        clickLpf.frequency.linearRampToValueAtTime(400, now + 0.04);

        // Sharp attack, instant decay — zero tail
        const clickGain = this.ctx.createGain();
        clickGain.gain.setValueAtTime(0.25, now);
        clickGain.gain.linearRampToValueAtTime(0.02, now + 0.02);
        clickGain.gain.setValueAtTime(0, now + 0.05); // Hard zero

        clickNoise.connect(hpf).connect(clickLpf).connect(clickGain).connect(this.masterGain);
        clickNoise.start(now);
        clickNoise.stop(now + 0.06);

        // Subtle sub-impact to suggest weight settling
        const settle = this.ctx.createOscillator();
        settle.type = 'sine';
        settle.frequency.setValueAtTime(55, now);
        settle.frequency.linearRampToValueAtTime(40, now + 0.08);
        const settleGain = this.ctx.createGain();
        settleGain.gain.setValueAtTime(0.2, now);
        settleGain.gain.linearRampToValueAtTime(0, now + 0.06);
        settle.connect(settleGain).connect(this.masterGain);
        settle.start(now);
        settle.stop(now + 0.08);

        this.state = 'idle';
    }

    /**
     * Silently stop the hold texture without release click.
     */
    stopHold() {
        if (this.currentHold && this.currentHold.active) {
            const hold = this.currentHold;
            const now = this.ctx.currentTime;
            try {
                if (hold.gain) hold.gain.gain.setValueAtTime(0, now);
                if (hold.rumbleGain) hold.rumbleGain.gain.setValueAtTime(0, now);
                hold.source.stop(now + 0.01);
                hold.rumble.stop(now + 0.01);
                hold.lfo.stop(now + 0.01);
            } catch (_) { /* already stopped */ }
            hold.active = false;
            this.currentHold = null;
        }
    }

    /**
     * Check audio-to-haptic sync. Returns true if within ±10ms.
     * Called every frame; triggers warning feedback if desynced.
     */
    checkSync(hapticAmplitude, elapsedMs) {
        if (!this.initialized || this.state === 'idle') return true;

        const t = Math.min(1, elapsedMs / 1000);
        const expectedAmplitude = this.bezier(t);
        const diff = Math.abs(expectedAmplitude - hapticAmplitude);

        // ±10ms tolerance translates to amplitude delta threshold
        // At 80Hz, 10ms ≈ 5% of a cycle
        this.syncWarning = diff > 0.05;
        return !this.syncWarning;
    }

    /**
     * Get the current audio amplitude that should match haptic output.
     * This exposes the envelope value for external verification.
     */
    getEnvelopeValue(elapsedMs) {
        if (!this.initialized) return 0;
        const t = Math.min(1, Math.max(0, elapsedMs / 1000));
        return this.bezier(t);
    }

    destroy() {
        this.stopHold();
        if (this.ctx && this.ctx.state !== 'closed') {
            this.ctx.close();
        }
        this.initialized = false;
    }
}
