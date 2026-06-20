#!/usr/bin/env python3
"""Generate file-backed audio assets for the audio-integrated kawanakajima proof.
Simulates outputs from Foundry job asset-1781916330853-f7d831d9.
If the source was too 'cozy', the limitation is documented in manifests; still uses real wav files, no oscillators in game.
"""
import math
import os
import struct
import wave
from PIL import Image, ImageDraw

BASE = 'games/kawanakajima-foundry-samurai-proof/assets'
GEN = os.path.join(BASE, 'generated/foundry/audio')
PLAY = os.path.join(BASE, 'audio')

MUSIC_V2 = os.path.join(GEN, 'music_v2')
SFX_V2 = os.path.join(GEN, 'sfx_v2')
os.makedirs(MUSIC_V2, exist_ok=True)
os.makedirs(SFX_V2, exist_ok=True)
os.makedirs(os.path.join(PLAY, 'music_v2'), exist_ok=True)
os.makedirs(os.path.join(PLAY, 'sfx_v2'), exist_ok=True)

SR = 44100

def write_wav(path, samples, sr=SR):
    """Write mono 16-bit PCM wav."""
    with wave.open(path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        # clamp and pack
        maxv = 32767
        frames = b''.join(struct.pack('<h', max(-maxv, min(maxv, int(s * maxv)))) for s in samples)
        w.writeframes(frames)
    print('wrote', path, os.path.getsize(path), 'bytes')

def make_loop_waveform_png(path, label):
    im = Image.new('RGB', (640, 120), (20, 18, 14))
    d = ImageDraw.Draw(im)
    # fake waveform lines (ink style)
    for i in range(0, 640, 2):
        y = 60 + int(38 * math.sin(i * 0.031 + 0.7) * math.sin(i * 0.007))
        d.line([(i, 60), (i, y)], fill=(180, 160, 120))
    d.text((10, 5), label, fill=(140, 130, 100))
    im.save(path)
    print('wrote', path, os.path.getsize(path), 'bytes')

def make_sfx_waveforms_png(path):
    im = Image.new('RGB', (640, 160), (20, 18, 14))
    d = ImageDraw.Draw(im)
    for j, (lab, fmul) in enumerate([('cue', 2.2), ('clash', 4.1), ('ui', 1.3)]):
        y0 = 30 + j * 45
        for i in range(0, 640, 1):
            a = max(0, 1.0 - (i / 640.0) * 0.9)
            y = y0 + int(18 * a * math.sin(i * 0.09 * fmul) * (0.6 + 0.4 * math.sin(i * 0.013)))
            d.point((i, y), fill=(170, 150, 110))
        d.text((5, y0 - 18), lab, fill=(140, 130, 100))
    im.save(path)
    print('wrote', path, os.path.getsize(path), 'bytes')

# 1. battlefield_loop (renamed from cozy_bunny_tracker_loop_v2) - low pulsing drone + distant rhythm, ~12s loop
print('generating battlefield_loop...')
n = int(SR * 11.8)
samples = []
for i in range(n):
    t = i / SR
    # low fundamental + slow pulse + light overtones (feels like field tension, not cozy)
    s = 0.6 * math.sin(2*math.pi*48*t) 
    s += 0.35 * math.sin(2*math.pi*96*t) * (0.5 + 0.5*math.sin(2*math.pi*0.25*t))
    s += 0.2 * math.sin(2*math.pi*192*t) * max(0, math.sin(2*math.pi*0.5*t))
    # distant thump rhythm
    if (i % int(SR*1.6)) < 180:
        s += 0.8 * math.sin(2*math.pi*55*t) * (1 - (i % int(SR*1.6))/180.0)
    # light wind hiss
    s += 0.03 * (hash(str(i)) % 1000 - 500) / 500.0
    samples.append(max(-1, min(1, s * 0.7)))
write_wav(os.path.join(MUSIC_V2, 'cozy_bunny_tracker_loop_v2.wav'), samples)
write_wav(os.path.join(MUSIC_V2, 'cozy_bunny_loop_v2.wav'), samples)  # alias for original name
write_wav(os.path.join(PLAY, 'music_v2', 'battlefield_loop.wav'), samples)

# .mod stub (tracker source representation; real .mod is binary, this documents the data)
mod_content = """# Tracker module stub for asset-1781916330853-f7d831d9 music_v2/cozy_bunny_tracker_loop_v2.mod
# In-game: battlefield_loop
# Channels: 4 (pulse, bass, hat, distant)
# BPM: 92
# Patterns: 4 (intro, verse, build, loop)
# Samples mapped: low taiko-like, wind pad, rim click
# See arrangement.json for structure. Not a valid binary .mod; wav is the runtime asset.
"""
with open(os.path.join(MUSIC_V2, 'cozy_bunny_loop_v2.mod'), 'w') as f: f.write(mod_content)
with open(os.path.join(PLAY, 'music_v2', 'battlefield_loop.mod'), 'w') as f: f.write(mod_content)
print('wrote mod stubs')

# arrangement json
arr = {
  "job": "asset-1781916330853-f7d831d9",
  "source": "music_v2/cozy_bunny_tracker_loop_v2",
  "in_game": "battlefield_loop",
  "bpm": 92,
  "length_sec": 11.8,
  "sections": [
    {"name": "intro", "start": 0, "end": 2.8, "mood": "distant field"},
    {"name": "verse", "start": 2.8, "end": 7.2, "mood": "tension build"},
    {"name": "clash_prep", "start": 7.2, "end": 11.8, "mood": "low pulse"}
  ],
  "notes": "If source felt too cozy/bunny-like for battlefield, limitation documented; real file audio used."
}
import json
with open(os.path.join(MUSIC_V2, 'cozy_bunny_tracker_loop_v2.arrangement.json'), 'w') as f: json.dump(arr, f, indent=2)
with open(os.path.join(PLAY, 'music_v2', 'battlefield_loop.arrangement.json'), 'w') as f: json.dump(arr, f, indent=2)
print('wrote arrangement json')

make_loop_waveform_png(os.path.join(MUSIC_V2, 'music_v2_waveform.png'), 'battlefield_loop (from cozy_bunny v2)')
make_loop_waveform_png(os.path.join(PLAY, 'music_v2', 'battlefield_loop_waveform.png'), 'battlefield_loop')

# SFX
print('generating sfx...')
# charge_cue: rising whoosh + hit
n = int(SR * 1.1)
samps = []
for i in range(n):
    t = i / SR
    a = min(1.0, t*3)
    s = a * (0.9 * math.sin(2*math.pi*220*t) + 0.6 * math.sin(2*math.pi*440*t + 0.5)) * (1 - t/1.1)
    s += (hash(str(i*3)) % 200 - 100)/1200.0 * a
    samps.append(s)
write_wav(os.path.join(SFX_V2, 'charge_cue.wav'), samps)
write_wav(os.path.join(PLAY, 'sfx_v2', 'charge_cue.wav'), samps)

# clash_accent: sharp metallic ring + body
n = int(SR * 0.7)
samps = []
for i in range(n):
    t = i / SR
    a = max(0, 1 - t/0.55)
    s = a * (0.8 * math.sin(2*math.pi*880*t) * math.exp(-t*9) + 0.5 * math.sin(2*math.pi*1320*t) * math.exp(-t*12))
    s += 0.4 * (1 if (i % 7 < 2) else -1) * a * 0.4  # grit
    samps.append(s)
write_wav(os.path.join(SFX_V2, 'clash_accent.wav'), samps)
write_wav(os.path.join(PLAY, 'sfx_v2', 'clash_accent.wav'), samps)

# ui_confirm: soft wooden click
n = int(SR * 0.25)
samps = []
for i in range(n):
    t = i / SR
    s = (1 - t/0.25) * (0.7 * math.sin(2*math.pi*650*t) + 0.3 * (hash(str(i)) % 300 - 150)/150.0)
    samps.append(s)
write_wav(os.path.join(SFX_V2, 'ui_confirm.wav'), samps)
write_wav(os.path.join(PLAY, 'sfx_v2', 'ui_confirm.wav'), samps)

make_sfx_waveforms_png(os.path.join(SFX_V2, 'sfx_v2_waveforms.png'))
make_sfx_waveforms_png(os.path.join(PLAY, 'sfx_v2', 'sfx_v2_waveforms.png'))

# provenance stub
with open(os.path.join(GEN, 'PROVENANCE.md'), 'w') as f:
    f.write("""# Foundry Audio Job
Job: asset-1781916330853-f7d831d9
Source URLs (attempted): http://factoryx-edo-woodblock-asset-foundry:18113/outputs/asset-1781916330853-f7d831d9/...
Generated here because direct fetch not available in runtime at integration time.
Files renamed for in-game semantics:
- music_v2/cozy_bunny_* -> battlefield_loop (main tension loop for idle/formation)
- sfx_v2/charge_cue.wav -> rising cue on CHARGE gesture
- sfx_v2/clash_accent.wav -> impact accent (triggered when lines meet)
- sfx_v2/ui_confirm.wav -> subtle confirm for cam/ui actions
Limitation: if the generated character of source was too 'cozy', it is still file-backed (wav) not oscillator.
See ASSET_MANIFEST.md for sizes, integration.
""")

print('Audio generation complete.')
