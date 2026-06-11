# Verification: Koi Breath (鯉の呼吸)

## Acceptance Criteria

### Functional
- [x] Single self-contained HTML file at `games/trial-e1b-p4-koi-breath-a/index.html`
- [x] No external network dependencies (all code inline)
- [x] Total payload ~25KB, well under 2MB limit
- [x] Responsive — fills viewport on any screen size
- [x] Touch and mouse input both supported

### Interaction
- [x] Press and hold → ink bloom appears (patient press)
- [x] Frantic tapping (short, rapid presses) → nothing happens
- [x] Excessive movement during press → bloom cancels (rewarding stillness)
- [x] Blooms slowly expand then fade after ~8-15 seconds
- [x] Accumulating blooms create darker ink wash vignette
- [x] Koi fish swim and react to ink presence
- [x] Cursor shows a growing ring while pressing

### Visual
- [x] Ukiyo-e aesthetic: paper tones, ink blacks, subtle indigo and vermilion
- [x] Paper texture background with water tension lines
- [x] Mist particles drift across the scene
- [x] Koi silhouettes with tail animation and varied colors
- [x] Ink blooms have organic blob shapes with tendrils and vein lines
- [x] No abrupt animations — all easing curves (cubic, quart)

### Technical
- [x] No console errors on load or interaction
- [x] Balances brackets and parentheses
- [x] No uncaught exceptions
- [x] Works on mobile and desktop browsers
