#!/usr/bin/env python3
"""
Generate improved sparse, physical, hesitant music assets for the Indigo Stutter slice.
Addresses feedback "music ... are terrible" with organic wooden/wet friction character,
breath-modulated pad, and tactile rub -- gesture-tied, attention-reactive, Tsutaya-sparse house style.
No external deps beyond numpy + stdlib wave.
Run: python3 .factoryx/work-orders/work-order-1781665294727-followup/gen_music.py
Outputs to drops/indigo-stutter/assets/ the three WAV stems + updates sizes in manifest (manual or follow-on).
"""

import numpy as np
import wave
import os

SR = 44100
OUT = "drops/indigo-stutter/assets"

os.makedirs(OUT, exist_ok=True)

def save_wav(path, data_f32):
    """Save mono float32 [-1,1] as 16-bit PCM WAV."""
    data = np.clip(data_f32, -1.0, 1.0)
    pcm = (data * 32767.0).astype(np.int16)
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"wrote {path} {os.path.getsize(path)} bytes ({len(data)/SR:.2f}s)")

def env_adsr(n, a=0.005, d=0.06, s=0.3, r=0.25):
    """Simple ADSR envelope (linear)."""
    a_n = int(a * SR)
    d_n = int(d * SR)
    r_n = int(r * SR)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.zeros(n, dtype=np.float32)
    if a_n: e[:a_n] = np.linspace(0, 1, a_n, endpoint=False)
    if d_n: e[a_n:a_n+d_n] = np.linspace(1, s, d_n, endpoint=False)
    if s_n: e[a_n+d_n:a_n+d_n+s_n] = s
    if r_n: e[-r_n:] = np.linspace(s, 0, r_n)
    return e

def lowpass_noise(n, cutoff=1800, seed=123):
    """Simple FIR-ish lowpassed noise via cumsum + decay (cheap)."""
    rng = np.random.RandomState(seed)
    x = rng.randn(n).astype(np.float32)
    # crude integrator + decay for body
    y = np.zeros(n, dtype=np.float32)
    a = np.exp(-2 * np.pi * cutoff / SR)
    s = 0.0
    for i in range(n):
        s = s * a + (1-a) * x[i]
        y[i] = s
    return y * 0.6

# 1) stutter-drop.wav : hesitant wooden knock + wet tail, short organic
def make_stutter_drop():
    dur = 0.48
    n = int(dur * SR)
    t = np.arange(n) / SR
    # low body thump (slightly detuned sines)
    f0 = 92.0
    body = (np.sin(2*np.pi*f0*t) + 0.6*np.sin(2*np.pi*(f0*1.995)*t)) * 0.85
    # wooden click attack (noise burst bandpassed-ish)
    click = lowpass_noise(n, cutoff=2400, seed=7) * (1 - t/dur)**1.6
    # wet friction tail (higher noise, slower)
    tail = lowpass_noise(n, cutoff=950, seed=42) * np.exp(-t*5.5)
    sig = (body * 0.55 + click * 0.9 + tail * 0.65) * env_adsr(n, 0.003, 0.04, 0.15, 0.32)
    # gentle wobble / organic
    wob = 1.0 + 0.012 * np.sin(2*np.pi*3.2*t)
    sig = sig * wob
    # final soft lp-ish roll
    sig = np.convolve(sig, np.ones(3)/3, mode="same").astype(np.float32) * 0.98
    return sig

# 2) resolve-breath.wav : low warm breath-modulated pad, loop friendly ~3s
def make_resolve_breath():
    dur = 3.15
    n = int(dur * SR)
    t = np.arange(n) / SR
    # two low fundamentals + soft harmonic
    f1, f2 = 54.0, 81.5
    s1 = np.sin(2*np.pi*f1*t) * 0.75
    s2 = np.sin(2*np.pi*f2*t) * 0.55
    s3 = np.sin(2*np.pi*(f1*2.02)*t) * 0.18
    tone = (s1 + s2 + s3)
    # breath/air noise layer, slow amp
    air = lowpass_noise(n, cutoff=620, seed=2026) * 0.28
    breath_mod = 0.72 + 0.28 * np.sin(2*np.pi * 0.28 * t)   # slow inhale/exhale
    sig = (tone * 0.82 + air) * breath_mod
    # soft overall envelope so loop joins cleanly (tails to near zero at end)
    env = 0.9 + 0.1 * np.sin(2*np.pi*0.31*t)
    env = np.clip(env, 0.6, 1.0)
    # very gentle attack/release for seamless
    atk = int(0.18*SR); rel = int(0.22*SR)
    env[:atk] *= np.linspace(0.3,1,atk)
    env[-rel:] *= np.linspace(1,0.35,rel)
    sig = sig * env
    # final gentle darken
    sig = np.convolve(sig, np.ones(5)/5.0, mode="same").astype(np.float32)
    return sig * 0.92

# 3) friction-rub.wav : short tactile wood scrape + tick for baren press feel
def make_friction_rub():
    dur = 0.22
    n = int(dur * SR)
    t = np.arange(n) / SR
    # noisy scrape body
    scrape = lowpass_noise(n, cutoff=1350, seed=19) * (1.0 - 0.6*(t/dur))
    # woody tick attack
    tick = (np.random.RandomState(55).randn(n).astype(np.float32) * np.exp(-t*38))
    tick = np.convolve(tick, [0.2,0.6,0.2], mode="same")
    sig = (scrape * 0.75 + tick * 0.9) * env_adsr(n, 0.002, 0.018, 0.08, 0.12)
    # slight resonance
    sig = sig + 0.12 * np.sin(2*np.pi*180*t) * np.exp(-t*22)
    sig = np.clip(sig * 1.05, -1,1).astype(np.float32)
    return sig

if __name__ == "__main__":
    print("Generating improved music stems for indigo-stutter (addressing terrible music feedback)...")
    save_wav(os.path.join(OUT, "stutter-drop.wav"), make_stutter_drop())
    save_wav(os.path.join(OUT, "resolve-breath.wav"), make_resolve_breath())
    save_wav(os.path.join(OUT, "friction-rub.wav"), make_friction_rub())
    print("Done. Verify in browser with pointer hold over the print.")
