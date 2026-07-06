# Preview: Living Print — Wave Horizon (trial e1b/b)

## Path
`games/trial-e1b-p1-living-print-b/index.html`

## Description
A single self-contained HTML file rendering a wave-form horizon in ink on paper grain. The piece features:

- **Paper grain**: Procedurally generated warm-toned paper texture using fractal Brownian motion, subtly animated
- **Wave horizon**: Layered horizon — a main undulating wave line with ink-like gradient fills, plus a distant mountain silhouette
- **Mist drifts**: 50 semi-transparent mist particles that drift slowly across the canvas; mist thins and slows under baren press
- **Baren press**: Pressing and holding deepens the ink — darkening the wave, adding a vignette, scattering ink bleed dots, and growing thin ink tendrils
- **Cumulative deepening**: Ink bleeds inward and accumulates with each press, leaving a subtle trace that fades slowly
- **Near-silent**: No audio autoplay; soft paper/ambient sounds only initiate after user gesture
- **Resistance**: Baren press has physical resistance feel — first 200ms feels heavier

## How to play
1. Open the preview in a browser
2. Press and hold anywhere on the canvas (the "baren press")
3. Release to let the piece breathe again
4. Repeat to deepen the ink — the piece remembers your presses

## Notes
- Responsive to any screen size
- No external dependencies — all assets are procedurally generated
- Touch-friendly with `touch-action: none` and full pointer event support
- ~60fps with delta capping for smooth playback
