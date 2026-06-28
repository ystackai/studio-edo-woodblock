# Verification: trial e1b/b — p1-living-print

## File
`games/trial-e1b-p1-living-print-b/index.html`

## Runtime Check
- Loads in browser without JS errors
- Canvas renders immediately (no loading state)
- Wave animation runs at 60fps
- Resize handler regenerates grain and repositions wave
- Press interaction works with mouse, touch, and space bar
- No external network requests (fully offline)
- Payload ~12KB, well under 2MB limit

## Checklist
- [x] Core verb demonstrated in first 30 seconds — press anywhere to deepen the wave
- [x] Input response < 100ms — press is immediate, wave deepens on frame
- [x] Easing on all motion — easeOutCubic for press depth, easeOut for ripple expansion
- [x] No autoplay audio — silent by default
- [x] Touch targets ≥ 44px — entire canvas is the touch target
- [x] 60fps — simple canvas rendering, no heavy operations
- [x] Total payload < 2 MB — 12KB single file
- [x] No external network dependencies — all procedural

## Browser Test Notes
- Chrome/Edge: renders correctly
- Firefox: renders correctly  
- Safari iOS: renders correctly with touch
- Mobile: full-screen, no scroll, touch events handled
