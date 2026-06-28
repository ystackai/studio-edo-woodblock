# Verification — Living Print

## Static checks
- [x] Single self-contained file at `games/trial-p1-living-print-a/index.html`
- [x] No external network dependencies (no CDN, no external assets)
- [x] File size ~13 KB (< 2 MB limit)
- [x] Valid HTML5 — proper DOCTYPE, closing tags
- [x] No external fonts or scripts

## Runtime checklist (manual / browser)
- [ ] Canvas renders paper grain + wave horizon on load
- [ ] Mist particles drift across the scene
- [ ] Press-and-hold deepens the ink impression (baren press)
- [ ] Release fades the impression back
- [ ] No console errors or pageerrors
- [ ] Works on both mouse and touch input
- [ ] Audio only plays after first user gesture
- [ ] Smooth 60fps rendering

## Game Feel
- [x] Core verb (press) discoverable on first sight
- [x] Input response < 100ms (canvas redraws on rAF)
- [x] Easing on all motion (press depth uses exponential ease)
- [x] Near-silent by default
- [x] Touch targets are the full canvas (≥ 44px equivalent)
- [x] No external dependencies, works offline after load
