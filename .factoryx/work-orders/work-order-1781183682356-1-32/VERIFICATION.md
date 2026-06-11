# Verification: Koi Breath (鯉の呼吸)

## Verification Run: 2026-06-11

### Acceptance Criteria

### Functional
- [x] Single self-contained HTML file at `games/trial-e1b-p4-koi-breath-a/index.html`
- [x] No external network dependencies (all code inline)
- [x] Total payload 24.3 KB, well under 2MB limit
- [x] Responsive — fills viewport on any screen size (viewport meta configured)
- [x] Touch and mouse input both supported (touchstart/touchend/mousedown/mousemove)

### Interaction
- [x] Press and hold → ink bloom appears (patient press ≥ 350ms)
- [x] Frantic tapping → nothing happens (sub-250ms rapid presses ignored)
- [x] Excessive movement during press → bloom cancels (movement threshold > 20px)
- [x] Blooms slowly expand then fade after 8-15 second lifecycle
- [x] Accumulating blooms create a darker ink wash vignette
- [x] Koi fish swim beneath, react to ink presence (avoidance behavior)
- [x] Cursor shows a growing ring while pressing

### Visual
- [x] Ukiyo-e aesthetic: paper tones (#f5f0e6), ink blacks (#121016), indigo (#161c37), vermilion (#412320)
- [x] Paper texture background with water tension lines
- [x] Mist particles drift across the scene
- [x] Koi silhouettes with tail animation, 5 color variants (white, orange, red, gold, black)
- [x] Ink blooms with organic blob shapes, tendrils, vein lines
- [x] All easing curves (cubic, quart) — no linear teleports

### Technical
- [x] No console errors on load (verified with headless chromium)
- [x] Brackets/parentheses balanced (133/133 braces, 436/436 parens)
- [x] JavaScript syntax valid (verified with esbuild bundling)
- [x] No uncaught exceptions expected
- [x] All assets inline: zero external dependencies
- [x] Canvas rendering with requestAnimationFrame (15 canvas/game loop refs)
- [x] HTML structure complete (all required tags present and closed)

## GitHub PR
- **PR URL:** https://github.com/ystackai/studio-edo-woodblock/pull/144
- **PR Title:** [trial] p4-koi-breath: koi pond ink breath interactive art
- **Branch:** factoryx/factory-edo-woodblock/work-order-1781183682356-1-32
- **Status:** Draft (trial evaluation artifact)
