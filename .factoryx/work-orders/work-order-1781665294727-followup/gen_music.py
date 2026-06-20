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
    dur = 0.52
    n = int(dur * SR)
    t = np.arange(n) / SR
    # richer wooden body: 3 partials + slight inharmonicity for "block" character
    f0 = 88.0
    body = (np.sin(2*np.pi*f0*t) +
            0.72*np.sin(2*np.pi*(f0*1.993)*t) +
            0.38*np.sin(2*np.pi*(f0*3.01 + 0.7)*t)) * 0.82
    # wooden click attack (tighter, brighter noise shaped)
    click = lowpass_noise(n, cutoff=2650, seed=7) * (1 - t/dur)**1.75 * 1.15
    # wet friction tail with longer organic decay
    tail = lowpass_noise(n, cutoff=820, seed=42) * np.exp(-t*4.8) * 0.9
    sig = (body * 0.58 + click * 0.88 + tail * 0.72) * env_adsr(n, 0.004, 0.05, 0.18, 0.35)
    # organic wobble + micro pitch drift for living stutter (more noticeable "terrible" was too clean)
    wob = 1.0 + 0.018 * np.sin(2*np.pi*2.9*t) + 0.007 * np.sin(2*np.pi*7.1*t)
    sig = sig * wob
    # final soft lp-ish roll + slight body resonance
    sig = np.convolve(sig, np.ones(3)/3, mode="same").astype(np.float32)
    sig = sig * 0.97 + 0.04 * np.sin(2*np.pi*178*t) * np.exp(-t*3.2)
    return sig

# 2) resolve-breath.wav : low warm breath-modulated pad, loop friendly ~3s
def make_resolve_breath():
    dur = 3.28
    n = int(dur * SR)
    t = np.arange(n) / SR
    # warmer low pad with slight detune + 5th for body (less "sine terrible", more wooden hollow)
    f1, f2 = 52.0, 79.0
    s1 = np.sin(2*np.pi*f1*t) * 0.78
    s2 = np.sin(2*np.pi*f2*t) * 0.58
    s3 = np.sin(2*np.pi*(f1*2.015)*t) * 0.22
    s4 = np.sin(2*np.pi*(f2*1.505 + 0.4)*t) * 0.11
    tone = (s1 + s2 + s3 + s4)
    # richer breath/air noise layer, slow amp + gentle high soft
    air = lowpass_noise(n, cutoff=580, seed=2026) * 0.32
    breath_mod = 0.68 + 0.32 * np.sin(2*np.pi * 0.265 * t)   # slower inhale/exhale
    sig = (tone * 0.79 + air) * breath_mod
    # slow evolving filter feel via amp + tiny pitch waver
    waver = 1.0 + 0.004 * np.sin(2*np.pi*0.11*t)
    sig = sig * waver
    # soft overall envelope so loop joins cleanly (tails to near zero at end)
    env = 0.88 + 0.12 * np.sin(2*np.pi*0.29*t)
    env = np.clip(env, 0.58, 1.0)
    # very gentle attack/release for seamless
    atk = int(0.22*SR); rel = int(0.26*SR)
    env[:atk] *= np.linspace(0.28,1,atk)
    env[-rel:] *= np.linspace(1,0.32,rel)
    sig = sig * env
    # final gentle darken + soft body
    sig = np.convolve(sig, np.ones(5)/5.0, mode="same").astype(np.float32)
    return sig * 0.90

# 3) friction-rub.wav : short tactile wood scrape + tick for baren press feel
def make_friction_rub():
    dur = 0.26
    n = int(dur * SR)
    t = np.arange(n) / SR
    # richer noisy scrape body with wood character
    scrape = lowpass_noise(n, cutoff=1180, seed=19) * (1.0 - 0.55*(t/dur)) * 1.1
    # woody tick attack + resonance
    tick = (np.random.RandomState(55).randn(n).astype(np.float32) * np.exp(-t*32))
    tick = np.convolve(tick, [0.15,0.7,0.15], mode="same")
    # body thump for baren press
    body = (np.sin(2*np.pi*165*t) + 0.5*np.sin(2*np.pi*331*t)) * np.exp(-t*18) * 0.35
    sig = (scrape * 0.72 + tick * 0.88 + body) * env_adsr(n, 0.003, 0.022, 0.07, 0.14)
    # slight resonance + micro noise for texture
    sig = sig + 0.09 * np.sin(2*np.pi*172*t) * np.exp(-t*19)
    sig = np.clip(sig * 1.03, -1,1).astype(np.float32)
    return sig

if __name__ == "__main__":
    print("Generating improved music stems for indigo-stutter (addressing terrible music feedback)...")
    save_wav(os.path.join(OUT, "stutter-drop.wav"), make_stutter_drop())
    save_wav(os.path.join(OUT, "resolve-breath.wav"), make_resolve_breath())
    save_wav(os.path.join(OUT, "friction-rub.wav"), make_friction_rub())
    print("Done. Verify in browser with pointer hold over the print.")
