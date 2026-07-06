# Asset Manifest — Pictures of the Floating World

**Work Order:** `work-order-1783332231063-7-2`  
**Asset:** Ukiyo-e Printer (interactive print-making experience)

## Generated / Authored Assets

All assets are **procedurally generated** within the single-file HTML application. No external files are loaded.

| File | Source | Size | Integration |
|------|--------|------|-------------|
| `games/ukiyo-e-printer/index.html` | Procedural canvas drawing (washi texture, Fuji silhouette, mist, ink blooms/strokes, seal stamp) | ~32 KB | Core game — serves as the reviewable artifact |
| `games/ukiyo-e-printer/index.html` (audio) | Web Audio API: bandpass noise (wind), sine oscillators (drones), decay noise (brush SFX), frequency-sweep sine (baren thud) | ~0 KB (runtime-generated) | Triggered on user gesture — `initAudio()`, `playBrushSound()`, `playBarenTouch()` |

### Asset Provenance

- **Paper texture**: Procedural `getImageData` noise + horizontal/vertical fiber lines on an offscreen canvas. Deckle edge simulated via radial gradient + irregular border strokes.
- **Mount Fuji**: Quadratic bezier silhouette with snow caps, rendered on a separate canvas for static composition.
- **Mist layers**: 12 drifting ellipses with parallax offset, sine-wave vertical drift, and variable opacity.
- **Ink marks**: Radial gradient blooms with capillary edge darkening; brushstroke paths with ink bleed and edge darkening.
- **Audio**: All synthesized via Web Audio API — no external audio files.
- **Seal stamp**: Canvas-drawn red rectangle with `印` character, randomized position and rotation.

### Browser Verification

- **Canvas 2D**: Universally supported in all modern browsers.
- **Web Audio API**: Requires user gesture to start (implemented).
- **Touch events**: `touch-action: none` prevents scroll on mobile.
- **Performance**: DPR capped at 2; mist layers bounded at 12; no particle systems.
- **Keyboard**: `R` = reset, `S` = finish, `J` = toggle sound.
- **First interaction**: Title overlay fades after first pointer event.

## Blockers

- None. All assets are procedural and self-contained in the single HTML file.
- No Asset Foundry integration required — the experience is fully procedural.
