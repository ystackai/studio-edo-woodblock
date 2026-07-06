# Asset Manifest — Pictures of the Floating World

**Work Order:** `work-order-1783332231063-7-2`  
**Artifact:** `games/ukiyo-e-printer/index.html`  
**Last Updated:** 2026-07-06

## Generated / Authored Assets

All assets are **procedurally generated** within the single-file HTML application. No external files are loaded.

| File | Source | Size | Integration |
|------|--------|------|-------------|
| `games/ukiyo-e-printer/index.html` | Procedural canvas drawing (washi texture, Fuji silhouette, mist, ink blooms/strokes, seal stamp) | ~36 KB | Core game — serves as the reviewable artifact |
| `games/ukiyo-e-printer/index.html` (audio) | Web Audio API: bandpass noise (wind), sine oscillators (drones with LFO modulation), decay noise (brush SFX), layered friction (baren SFX), wet ink absorption sound, seal stamp thud, sweep (reset) | ~0 KB (runtime-generated) | Triggered on user gesture — see sound functions below |

### Asset Provenance

- **Paper texture**: Procedural `getImageData` noise + horizontal/vertical fiber lines on an offscreen canvas. Deckle edge simulated via radial gradient + irregular border strokes. Paper grain animation via subtle canvas offset.
- **Mount Fuji**: Quadratic bezier silhouette with snow caps, rendered on a separate canvas for static composition. Parallax responds to mouse position.
- **Mist layers**: 12 drifting ellipses with parallax offset, sine-wave vertical drift, variable opacity, and seasonal color shifts (~60s cycle). Mist thickens near dense ink areas.
- **Ink marks**: Radial gradient blooms with capillary edge darkening; brushstroke paths with ink bleed, edge darkening, and wet ink sheen highlight on recent strokes. Ink stain glow persists on dense areas.
- **Audio**: All synthesized via Web Audio API — no external audio files.
- **Seal stamp**: Canvas-drawn red rectangle with `印` character, randomized position and rotation.

### Audio Design

| Sound | Trigger | Method | Description |
|-------|---------|--------|-------------|
| Brush | Pointer move | `playBrushSound()` | Layered noise: dry brush texture + wet ink pitch variation |
| Baren friction | Hold + pointer move | `playBarenFriction(progress)` | Dual-layer: high-frequency brush rub + low-frequency pressure rumble |
| Baren touch | Hold interval (15-30%) | `playBarenFriction(holdProgress)` | Subtle touch feedback during press |
| Ink wet | Stroke completion | `playInkWetSound()` | Low-pass filtered noise — ink absorbing into paper |
| Seal thud | Finish button | `playSealThud()` | Deep resonant thud + high ring |
| Reset sweep | Reset button | `playResetSound()` | Descending sweep — erasing the print |
| Wind | Ambient | `initAudio()` | Bandpass-filtered noise with LFO variation |
| Drones | Ambient | `initAudio()` | 3 sine oscillators (61.7Hz, 123.5Hz wobble, 41Hz sub) |

### Browser Verification

- **Canvas 2D**: Universally supported in all modern browsers.
- **Web Audio API**: Initialized on first user gesture, ambient audio starts at low volume, toggle button works.
- **Touch events**: `touch-action: none` prevents scroll on mobile.
- **Performance**: DPR capped at 2; mist layers bounded at 12; no particle systems.
- **Keyboard**: `R` = reset, `S` = finish, `J` = toggle sound.
- **First interaction**: Title overlay fades after first pointer event. Vignette responds to ink density.
- **Audio probe**: Ambient audio initializes on first interaction and ramps up over 2 seconds. Sound is on by default.

## Blockers

- None. All assets are procedural and self-contained in the single HTML file.
- No Asset Foundry integration required — the experience is fully procedural.
- Headless Chromium screenshot capture unavailable in container (X11/display server missing). Documented in VERIFICATION.md.
