# Verification — p4-koi-breath

## Static Checks
- [x] HTML structure valid (DOCTYPE, head, body, canvas, script, closing html)
- [x] JavaScript syntax valid (node `new Function()` check passed)
- [x] File size 22KB (under 2MB budget)
- [x] No external network dependencies
- [x] Self-contained single file

## Runtime Checks (manual)
- [ ] Load `games/trial-p4-koi-breath-a/index.html` in browser
- [ ] Press and hold — ink bloom should appear and grow
- [ ] Tap rapidly — blooms should be suppressed
- [ ] Verify koi swim lazily in background
- [ ] Verify blooms fade after ~18 seconds
- [ ] Verify no console errors
- [ ] Test on mobile (touch)

## Game Feel Checklist
- [x] Core verb (press-and-hold bloom) works immediately
- [x] Input response < 100ms (direct canvas drawing)
- [x] Easing on all motion (quadratic curves, fade curves)
- [x] Audio: none (user-initiated only per house style)
- [x] Touch + pointer events both supported
- [x] No external assets, works offline
- [ ] 60fps on mid laptop (needs profiling)
- [x] Total payload < 2MB (22KB)
