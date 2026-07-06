# ASSET MANIFEST — work-order-1783322280861-7-6

## Ukiyo-e Printer (games/ukiyo-e-printer/index.html)

### Procedural Assets (self-contained, no external dependencies)

| Asset | Type | Source | Integration |
|-------|------|--------|-------------|
| Paper texture | Procedural canvas | Generated at init — 1024×768 noise + fiber lines | Background layer, drawn behind all other elements |
| Mt. Fuji | Procedural canvas | Generated at init — silhouette + snow caps + clouds | Mid-ground, drawn after paper, before mist and ink |
| Mist layers | Procedural canvas | 8 animated mist ellipses, drift speed randomized | Foreground ink layer, drawn before ink marks |
| Ink bloom | Procedural radial gradient | Drawn on pointer down with irregular edges | Core interaction feedback |
| Ink strokes | Procedural path | Drawn on pointer move with variable width | Core interaction feedback |
| Baren press | Procedural radial gradient + vermilion accent | Drawn on pointer hold, deepens over 2 seconds | Core interaction — press to embed ink |
| Seal stamp (印) | Procedural canvas rect + kanji | Drawn on finish, bottom-right corner with random offset | Download overlay |

### Audio Assets (procedural Web Audio API)

| Asset | Type | Source | Integration |
|-------|------|--------|-------------|
| Wind noise | Filtered noise (bandpass 380Hz, Q=0.4) | Generated at AudioContext init, looped | Ambient background, starts on sound toggle |
| Temple drone | Sine oscillator 82Hz | Generated at AudioContext init | Ambient background layer |
| Second drone | Sine oscillator 123.5Hz | Generated at AudioContext init | Ambient harmonic layer |
| Brush sound | Decaying random noise (highpass 600Hz) + sine | Triggered on each ink mark | Brush-on-paper SFX |
| Baren thud | Sine 90→35Hz decay | Triggered on hold at 15-30% progress | Baren press tactile feedback |

### Verification

- Browser: Open `games/ukiyo-e-printer/index.html` directly — no build step required
- Canvas renders at 1024×768 (DPR-scaled), responsive fit to viewport
- Audio starts only after user gesture (sound toggle button or first interaction)
- Download produces PNG with seal stamp overlay
- All assets are self-contained in single HTML file — no network dependencies
