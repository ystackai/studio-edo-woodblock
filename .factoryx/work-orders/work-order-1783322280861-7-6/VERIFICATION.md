# Verification — work-order-1783322280861-7-6

## Static Checks

All static checks pass via `node verify.js`:

- [x] Canvas element present in ukiyo-e-printer
- [x] Baren hold mechanic (`isHolding`) implemented
- [x] Ink stroke drawing (`strokePts`) implemented
- [x] Paper saturation mechanic (`saturationLevel`) implemented
- [x] Ambient audio init (`AudioContext`) implemented
- [x] Sound toggle (`soundBtn`) implemented
- [x] Finish with seal stamp (`印`) implemented
- [x] Mist layers (`mist`) implemented
- [x] 24 GLB models present for Kawanakajima (20 samurai + 4 props)

## Browser Smoke Test

Run: open `games/ukiyo-e-printer/index.html` in any modern browser.

1. **First screen loads** — paper texture, Mt. Fuji, mist, overlay with title and hint
2. **Click/tap on paper** — ink bloom appears at touch point with organic edges
3. **Drag** — brushstroke drawn with soft ink bleed
4. **Hold click** — baren press visual deepens over 2 seconds, vermilion accent at 60%+
5. **Rapid clicking** — paper saturation increases, ink marks become fainter
6. **Sound toggle** — ambient wind + drones start playing
7. **Finish button** — PNG with seal stamp overlay downloads
8. **Reset button** — canvas cleared, saturation reset

## Game Feel Checklist

- [x] Core verb (baren press / ink application) demonstrated in first 30 seconds
- [x] Input response <100ms with visible feedback (bloom on click, stroke on drag)
- [x] Easing on all motion (bloom expansion cubic ease, hold progress linear with ease)
- [x] Audio only after user gesture (sound button toggle or canvas interaction)
- [x] Touch targets ≥44px (controls buttons)
- [x] Responsive — canvas fits viewport at any size
- [x] No external network dependencies
