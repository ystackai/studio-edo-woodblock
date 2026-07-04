# ASSET_MANIFEST — Lantern Tide

## Game
- **Deliverable**: `lantern-tide` — one-screen woodblock nightscape browser game
- **Path**: `games/lantern-tide/index.html`
- **Size**: 24 KB (self-contained HTML + JS, no build step)

## Asset Foundry — Audio

- **Recipe**: `cozy_audio_pack`
- **Job ID**: `asset-1783033074395-f71c05bb`
- **Recipe path**: `/asset-foundry/recipes/cozy_audio_pack.py`
- **Runner**: `python`
- **Prompt**: Quiet Japanese river ambience with paper lantern launch SFX and water ripple sounds
- **Style**: `zen-riverside`
- **State**: `completed`
- **Music duration**: 30.97s

### Copied files (from `/outputs/asset-1783033074395-f71c05bb/...`)

| Foundry path | Local path | Role |
|---|---|---|
| `music_v2/foundry_music_loop.wav` | `games/lantern-tide/assets/music_loop.wav` (5.3 MB) | Ambient music loop |
| `music_v2/music_v2_waveform.png` | `games/lantern-tide/assets/music_waveform.png` | Preview art |
| `sfx_v2/sfx_interaction.wav` | `games/lantern-tide/assets/sfx_launch.wav` | Paper lantern launch (crinkle) |
| `sfx_v2/sfx_movement.wav` | `games/lantern-tide/assets/sfx_water.wav` | Water ripple ambience |
| `sfx_v2/sfx_reveal.wav` | `games/lantern-tide/assets/sfx_catch.wav` | Lantern catch chime |
| `sfx_v2/sfx_payoff.wav` | `games/lantern-tide/assets/sfx_end.wav` | Ending/payoff sound |
| `sfx_v2/sfx_impact.wav` | `games/lantern-tide/assets/sfx_ripple.wav` | Water ripple on miss-click |
| `sfx_v2/sfx_v2_waveforms.png` | `games/lantern-tide/assets/sfx_waveforms.png` | SFX preview art |

### Integration points

- `AudioAssets.init()` — preloads all WAV files on page load via `fetch()`
- `AudioAssets.startMusic()` — fades in music loop after first user gesture (title click)
- `AudioAssets.playLaunch()` — fires when a new lantern spawns
- `AudioAssets.playCatch()` — fires when the player catches a lantern
- `AudioAssets.playWater()` — fires on catch for water ripple ambience
- `AudioAssets.playEnd()` — fires at the debrief/ending
- `AudioAssets.playRipple()` — fires on miss-click water ripple
- `AudioAssets.stopMusic()` — fades out music at game end
- `webaudio-kit.js` still provides `droneStart()` for a low A1 ambient pad during play

## Visual assets

- Canvas-drawn woodblock nightscape (procedural ink-style rendering):
  - Night sky gradient with stars and moon
  - Mountain silhouettes in 3 depth layers
  - Tree line (pine, cedar, bamboo silhouettes)
  - Reflective river surface with moon reflection and flow lines
  - Wooden dock with posts and planks
  - Paper lantern sprites with flickering glow
- Total payload: ~5.8 MB (dominated by music WAV)

## Foundry blocks used

| Module | Status | Role |
|---|---|---|
| `game-loop.js` | Reused | Fixed-timestep loop |
| `input.js` | Reused | Keyboard + pointer input with buffering |
| `scenes.js` | Reused | Title → Play → End state machine |
| `tween.js` | Reused | Easing for launch arcs, vignette fade |
| `particles.js` | Reused | Burst particles on lantern spawn/catch |
| `rng.js` | Reused | Seeded randomness for lantern drift variation |
| `screen-shake.js` | Reused | Micro-shake on lantern catch |
| `webaudio-kit.js` | Reused | Ambient drone pad, fallback SFX |
