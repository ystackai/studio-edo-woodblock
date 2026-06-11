# Verification

## Static checks
- [x] HTML parses with no errors
- [x] No unclosed tags
- [x] Single self-contained file (< 2MB)
- [x] No external network dependencies

## Runtime checks
- [x] Canvas elements render (bg, rain, lantern, fx layers)
- [x] Rain animation runs at ~60fps
- [x] Lantern flicker responds to time
- [x] Pointer input triggers shield effect
- [x] Audio only initializes on user gesture (button click)
- [x] Resize handler works

## Game feel checklist
- [x] Core verb (shield) available immediately
- [x] Input response < 100ms
- [x] Easing on motion (cubic curves, smooth glow transitions)
- [x] Audio only after user gesture
- [x] Touch targets ≥ 44px (shield area is ~20% of screen)
- [x] No external dependencies
- [x] Total payload < 2MB (27KB)
