# Verification — Pictures of the Floating World

**Work Order:** `work-order-1783332231063-7-2`  
**Artifact:** `games/ukiyo-e-printer/index.html`  
**Last Updated:** 2026-07-06

## Static Verification

All checks pass:

- ✅ Canvas element present
- ✅ Baren hold mechanic (`isHolding`, `holdProgress`)
- ✅ Ink stroke drawing with variable opacity (`strokePts`, `drawStroke`)
- ✅ Velocity-aware ink opacity (`calcStrokeVelocityOp`)
- ✅ Ink splatter on fast strokes
- ✅ Paper saturation mechanic (`saturationLevel`, rapid-click penalty)
- ✅ Ambient audio init (`AudioContext`, wind, drones with LFO modulation)
- ✅ Sound toggle (`soundBtn`, `soundOn` flag, default = on)
- ✅ Finish with seal stamp (`印`, download PNG)
- ✅ Mist layers (16 drifting ellipses with seasonal color shifts)
- ✅ Deckle edge (paper texture border)
- ✅ Mouse parallax (Fuji and mist respond to cursor)
- ✅ Keyboard accessibility (`aria-label` on all buttons, `focus-visible`)
- ✅ Mobile touch (`touch-action: none`, 44px+ touch targets)
- ✅ Ink bleed (capillary spread on strokes)
- ✅ Hold-duration opacity (longer holds = darker ink)
- ✅ Saturation decay (paper recovers over time)
- ✅ Paper darkening at dense ink areas
- ✅ Random bell chime during quiet moments
- ✅ JS syntax: ✅ Valid (node --check passes)

## Browser Smoke Test

**Preview URL:** `games/ukiyo-e-printer/index.html` (also at `.factoryx/preview-entrypoint`)

### Verification Steps (Manual)
1. Open the preview URL.
2. Click on the paper — observe organic ink bloom with irregular edges.
3. Drag to draw a stroke — observe variable opacity based on stroke speed.
4. Hold on the paper — observe paper depression, friction sound, and vermilion at 60%+.
5. Click FINISH — observe seal stamp download with woodblock thud sound.
6. Wait 15+ seconds without interaction — observe temple bell chime.
7. Click RESET — observe paper sweep fade effect.

### Known Limitations
- Headless Chromium screenshot capture unavailable in container (X11/display server missing).
- Audio testing requires a real browser with user gesture.
- Mobile/touch testing requires physical device.