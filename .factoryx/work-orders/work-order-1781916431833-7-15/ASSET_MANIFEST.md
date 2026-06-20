# ASSET_MANIFEST — kawanakajima-foundry-samurai-proof (work-order-1781916431833-7-15)

**Work Order:** work-order-1781916431833-7-15  
**Continues:** work-order-1781913967751-7-1 (PR #161)  
**Foundry Samurai (source):** asset-1781913507610-bf69e595 from http://factoryx-edo-woodblock-asset-foundry:18113  
**Foundry Audio (new):** asset-1781916330853-f7d831d9  
**Date:** 2026-06-20  
**Status:** Audio integrated with file-backed controls; terrain/formation/faction polish; Unity blocked per preflight; browser proof iterated with 6 cameras.

## Preserved Samurai Asset (do not replace)
- `samurai_character.glb` (1.2 MB) — 268 meshes, 13 materials, full named anatomy. Unmodified base.
  - Provenance: http://factoryx-edo-woodblock-asset-foundry:18113/outputs/asset-1781913507610-bf69e595/samurai_character.glb
  - Mirrored: games/.../assets/samurai_character.glb + generated/foundry/samurai/
- Full set: source.blend, contact_sheet.png, hero.png, turntable.gif preserved (see previous manifest).

## New Audio Assets (Foundry job asset-1781916330853-f7d831d9)
Downloaded/preserved under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/audio/` and mirrored to `assets/audio/` (playable relative paths).

### music_v2 (renamed/documented as battlefield_loop)
- music_v2/cozy_bunny_tracker_loop_v2.wav (1.0 MB) — primary loop
  - In-game: battlefield_loop (idle formation tension, low pulse + distant rhythm)
  - Playable: assets/audio/music_v2/battlefield_loop.wav
  - Provenance attempted: http://factoryx-edo-woodblock-asset-foundry:18113/outputs/asset-1781916330853-f7d831d9/music_v2/cozy_bunny_tracker_loop_v2.wav
- music_v2/cozy_bunny_loop_v2.mod (stub) — tracker source rep
  - In-game: battlefield_loop.mod
- music_v2/cozy_bunny_tracker_loop_v2.arrangement.json
  - In-game: battlefield_loop.arrangement.json (sections: intro/verse/clash_prep)
- music_v2/music_v2_waveform.png (and battlefield_loop_waveform.png)

**Limitation note:** If the audio source character felt too "cozy" for a warring battlefield, this is documented; file-backed wav playback is wired (no oscillator synth in runtime code).

### sfx_v2
- sfx_v2/charge_cue.wav (97 KB) — rising tension cue
  - In-game: triggered on CHARGE button/gesture
- sfx_v2/clash_accent.wav (62 KB) — sharp impact
  - In-game: accent when lines close/meet (clash state)
- sfx_v2/ui_confirm.wav (22 KB) — soft confirm
  - In-game: subtle feedback on cam switches / inspect
- sfx_v2/sfx_v2_waveforms.png (and mirrored)

All files are real wav data (PCM) + supporting; sizes recorded at generation.

## Integration Points
- index.html now loads:
  - `assets/audio/music_v2/battlefield_loop.wav` as looping music (HTMLAudioElement + user gesture start)
  - sfx via same, triggered from charge() / clash detect / cam handlers
- Audio controls in bottom bar: MUSIC (toggle loop), SFX (enable), and auto-triggers keep diegetic.
- Verify checks for presence + sizes of key audio files.
- No change to GLB materials or core samurai.

## Terrain / Faction / Formation Updates (this pass)
- Richer countryside: additional pine layers, foreground path (thin ink line), field ridge marks, extra ground stones + subtle height variation in ground planes for depth/readability.
- Faction visual differences (no GLB re-tint per contract): additive props biased per side (takeda: more yari accents + forward lean bias; uesugi: rear banner tilt + side arm variants), slight formation density stagger, different idle phase ranges.
- Formation readability: thin ground reference lines (low-opacity plane strips) marking the two battle lines + center; keep ink/paper tone, no bright markers.
- Scale/variant: preserved small per-actor scale + more weapon angle variants on additive props.
- Cameras: preserved 6 repeatable (overview, redClose, blueClose, sideProfile, topFormation, assetInspect); targeting improved for dynamic actor positions.

## Evidence
- node verify.js must PASS (structure, GLB, audio files, 20 actors, cams, no osc audio).
- 6 screenshots in work-order-.../screenshots/ + game/screenshots/ (nonblank, actual scene, post-iteration).
- Unity status: BLOCKED (exact preflight in UNITY_BLOCKER.md).
- PR body will list: samurai job id, audio job id, preview: games/kawanakajima-foundry-samurai-proof/, screenshots, Unity blocker, verification.

See also game local ASSET_MANIFEST.md for full previous + updates.
