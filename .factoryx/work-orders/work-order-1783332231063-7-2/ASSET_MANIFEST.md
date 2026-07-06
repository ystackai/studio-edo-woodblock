# Asset Manifest — Pictures of the Floating World

**Work Order:** `work-order-1783332231063-7-2`  
**Artifact:** `games/ukiyo-e-printer/index.html`  
**Last Updated:** 2026-07-06

## Generated / Authored Assets

All assets are **procedurally generated** within the single-file HTML application. No external files are loaded.

| File | Source | Size | Integration |
|------|--------|------|-------------|
| `games/ukiyo-e-printer/index.html` | Procedural canvas drawing | ~38 KB | Core game — serves as the reviewable artifact |

### Asset Provenance

- **Paper texture**: Multi-scale procedural washi with fiber variation, warm tonal gradient, deckle edge.
- **Mount Fuji**: Quadratic bezier silhouette with snow caps, atmospheric base veil.
- **Mist layers**: 16 drifting ellipses with parallax, seasonal color shifts (90s cycle), per-layer phase offsets.
- **Ink marks**: Organic blooms (64-point irregular edges), velocity-aware strokes, brush-end fade, ink splatter.
- **Seal stamp**: Canvas-drawn vermilion rectangle with 印 character, randomized position.
- **Audio**: All synthesized via Web Audio API — no external audio files.

### Audio Design

| Sound | Trigger | Method | Description |
|-------|---------|--------|-------------|
| Brush | Pointer move | `playBrushSound()` | Dry bristle + wet ink layers with amplitude modulation |
| Baren friction | Hold + pointer move | `playBarenFriction(progress)` | Two-layer: brush rub + pressure rumble, frequency rises with pressure |
| Ink wet | Stroke completion | `playInkWetSound()` | Low-pass noise + subtle tonal component |
| Seal thud | Finish button | `playSealThud()` | Woodblock thud with harmonics and bell-like ring |
| Reset sweep | Reset button | `playResetSound()` | Descending sweep with filter sweep |
| Wind | Ambient | `initAudio()` | Bandpass filtered noise with LFO variation |
| Drones | Ambient | `initAudio()` | 3 sine oscillators (61.7Hz, 92.5Hz wobble, 41Hz sub) |
| Temple bell | Quiet periods | `scheduleBellIfQuiet()` | Randomized chime after 15s+ of inactivity |

## Browser Verification

- **Canvas 2D**: Universally supported in all modern browsers.
- **Web Audio API**: Initialized on first user gesture.
- **Touch events**: `touch-action: none` prevents scroll on mobile.
- **Performance**: DPR capped at 2; mist layers bounded at 16; no particle systems.
- **Keyboard**: `R` = reset, `S` = finish, `J` = toggle sound.
- **Saturation decay**: Paper slowly recovers from saturation (patient play rewarded).
- **Ink accumulation**: Dense areas darken paper via multiply blend mode.