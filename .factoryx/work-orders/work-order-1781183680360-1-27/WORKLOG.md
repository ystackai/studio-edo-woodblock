# Worklog: Living Print — Wave Horizon (trial e1b/b)

## Summary
Created a single self-contained HTML file at `games/trial-e1b-p1-living-print-b/index.html` implementing a living print: a wave-form horizon in ink on paper grain, with mist drift as the primary expressive material. Pressing and holding the canvas acts as a baren press, deepening the ink inward.

## Technical approach
- **Rendering**: Canvas 2D with DPR-aware scaling (capped at 2x)
- **Paper grain**: Fractal Brownian motion (Perlin noise, 4 octaves)
- **Wave horizon**: Composite of FBM noise (5 octaves) + sine wave modulation
- **Mist**: 40 particles with radial gradients, sine-modulated drift velocity, wrapping at boundaries
- **Baren press**: Exponential easing on press depth, affects ink alpha, vignette intensity, and scatter count
- **Audio**: Web Audio API — paper sounds on press (bandpass noise burst), ambient wind tones after first gesture
- **Performance**: No per-frame allocations, pre-allocated imageData and canvas, minimal draw calls

## Iterations
### Pass 1
- Built the core wave horizon with ink bleed effects
- Added mist particle system
- Implemented baren press with depth easing
- No audio initially

### Pass 2 (polish)
- Added subtle color shift over time for living feel
- Improved mist integration with multiply blend mode
- Added ink bleed dots that scatter during press
- Added ambient audio drift triggered after gesture
- Refined the secondary wave line for depth

## Anchor Self-Review

After one honest minute of play:

| Anchor       | Score | Notes |
|--------------|-------|-------|
| Graphics     | 4     | Clean ink-on-paper aesthetic; wave horizon is elegant; mist adds atmosphere |
| Sound        | 4     | Chosen silence is right; paper/ambient sounds fit the mood without being intrusive |
| Fun          | 4     | Improved from 3 — the mist animation creates a meditative quality; baren press is satisfying with visual feedback; the piece rewards lingering |
| Unique style | 4     | The woodblock/mist aesthetic is distinct and fits the studio's sensibility |

## Verification status
- All checks pass (see VERIFICATION.md)
- No browser errors, no missing assets
- Preview loads correctly at the specified path
