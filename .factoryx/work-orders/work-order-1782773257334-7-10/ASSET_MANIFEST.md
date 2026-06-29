# Asset Manifest — Edo Living Print

## Generated assets

No pre-rendered image/audio assets are used. All visuals are **canvas-native procedural art** drawn with `Canvas2D` API:

- **Paper grain**: seeded noise + fiber streaks, rendered once at load
- **Mount Fuji**: bezier curves with ink-wash gradient, snow cap appears at stage 1
- **Wave horizon**: layered sine waves with ink-wash fill, responds to press position
- **Boat with figure**: simple silhouette, appears at stage 2
- **Cherry blossoms**: 20 particles, pink oval petals with rotation, stage 2+
- **Birds**: 5 V-shaped silhouettes, wing animation, stage 3+
- **Rain**: 100 line particles, stage 4+
- **Crane**: hand-drawn procedural crane with flapping wings, stage 4+ (hidden joy reveal)
- **Moon**: radial gradient glow + disc, stage 5
- **Cloud wisps**: 4 ukiyo-e style streaks, stage 1+
- **Mist**: 36 radial-gradient particles, always present
- **Ink pools**: radial gradients at press points, accumulate over session

## Audio (procedural)

All audio generated with Web Audio API oscillators on first user gesture:
- **Wind**: bandpass-filtered noise, volume scales with depth
- **Rain**: highpass-filtered noise, stage 4+
- **Stage transitions**: koto-like pluck (triangle + harmonic sine), different pitch per stage
- **Press SFX**: short filtered noise burst on each press start

## Integration points

- Single file: `games/edo-living-print/index.html`
- Preview redirect: `games/index.html` → `edo-living-print/`

## Payload

- **Total**: ~28KB (single HTML file, no external requests)
- **No images**: all art drawn procedurally
- **No audio files**: all sound synthesized in-browser

## Browser verification

- Open `games/edo-living-print/index.html` in any modern browser
- Press and hold — depth increases, elements appear progressively
- Release — depth slowly decays
- After ~30s of cumulative pressing, crane and rain should appear
- No console errors expected
