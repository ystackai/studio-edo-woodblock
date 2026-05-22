# Verification

Pending browser smoke after supervisor seed.

Manual checks expected:
- Page loads without console errors.
- Player moves with WASD/arrows.
- Space slash damages enemies and cuts knots.
- Gate 1 opens after guard defeat.
- Gate 2 opens after knots are cut.
- Gate 3 opens after captain defeated and seal placed at shrine.
- Sunrise bridge triggers win.
- Lantern reaching zero triggers loss/restart.

## Static verification - 2026-05-22T18:28Z

- **HTTP 200**: File serves correctly (19,258 bytes, content-type: text/html)
- **JS syntax**: All braces/parens/brackets balanced (0/0/0)
- **Backtick balance**: 16 backticks, all paired
- **Feature checks**: All 8 new features confirmed present in source:
  - HUD flame bar update ✓
  - HUD objective text update ✓
  - HUD progress update ✓
  - Canvas section label ✓
  - Slash glow effect ✓
  - Compass distance label ✓
  - Knot interaction hint ✓
  - Low flame vignette ✓

### Browser smoke test
Pending — needs live browser to verify gameplay. Manual steps:
1. Open `games/inkblade/index.html` in browser
2. Press any key to start
3. Verify WASD/arrow movement works
4. Move toward Gate 1 (compass points north)
5. Space to slash the guard, verify damage feedback
6. Verify gate opens on guard defeat
7. Continue to Gate 2, cut knots, verify gate opens
8. Continue to Gate 3, pick up seal, place at shrine, defeat captain
9. Verify bridge opens, cross it for win
10. Test lantern loss (let enemies hit you)
11. Verify restart works

