# Worklog: Koi Breath (鯉の呼吸)

## 2026-06-11

### Implementation
- Created `games/trial-e1b-p4-koi-breath-a/index.html` (single self-contained file)
- Implemented ink bloom system with organic blob rendering, tendrils, and vein lines
- Built koi fish with swimming AI, tail animation, and ink avoidance behavior
- Added mist particle system for atmospheric depth
- Implemented patient press detection: blooms only appear after steady hold ≥ 350ms
- Frantic taps (sub-250ms, rapid-fire) are ignored
- Blooms fade gracefully after reaching peak (8-15 second lifecycle)
- Accumulated blooms create a darkening ink vignette
- All assets inline: zero external dependencies, ~25KB total

### Design Decisions
- Single canvas rendering with requestAnimationFrame at 60fps
- Ink blooms use radial gradients with organic wobble distortion
- Koi fish have 5 color variants: white, orange, red, gold, black
- Pressure detection based on hold duration + movement threshold
- Ukiyo-e palette: paper whites (#f5f0e6), ink blacks (#121016), indigo (#161c37), vermilion (#412320)
