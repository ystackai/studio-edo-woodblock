# Work Log — Living Print

## Pass 1 — Core artifact
- Created `games/living-print/index.html` (single file, ~16 KB)
- Wave-form horizon with 4-frequency composition (broad swell + ripple + detail + micro-texture)
- Paper grain: procedural fiber streaks, water stains, edge vignette
- Ink: indigo gradient with granulation texture, bleed/halo at wave crest
- Mist: 22 layers at 3 depth levels, drifting with sinusoidal motion
- Baren press: press-and-hold with resistance curve, ink "drying in" on release
- Audio: single filtered-noise burst on first interaction only
- All structural/static checks passing

## Design notes
- The wave does not break — it breathes. Slow, wide sines create a horizon that feels alive without being animated into chaos.
- Press depth creates resistance: the deeper you press, the slower it responds. This is the baren feel.
- Mist thins as ink deepens — the act of pressing clarifies the scene, like rubbing a fresh print.
- No UI chrome, no title, no instructions. The print speaks for itself.
