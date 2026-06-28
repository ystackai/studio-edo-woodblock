# Verification — Rain Lantern

## Static checks
- [x] HTML validates (DOCTYPE, charset, viewport)
- [x] JS paren/brace balance: OK
- [x] File size: 18KB (well under 2MB)
- [x] No external dependencies (no CDN, no network requests)
- [x] Audio only user-initiated (雨声 button)

## Runtime behavior to verify in browser
- [ ] Page loads without console errors
- [ ] Intro screen shows "雨灯" with tap-to-enter
- [ ] Lantern renders with warm amber glow and wooden ribs
- [ ] Rain streaks fall diagonally
- [ ] Touching lantern shields it (rain deflects, glow ring appears)
- [ ] Holding lantern increases patience (flame steadier, less flicker)
- [ ] Releasing returns lantern to natural sway
- [ ] 雨声 button toggles rain audio
- [ ] 60fps on mid laptop

## Browser runtime verification
- Check DevTools Console for errors
- Check Performance tab for frame drops
- Test on mobile (touch) and desktop (mouse)
