# Preview — Pictures of the Floating World

**Work Order:** `work-order-1783332231063-7-2`  
**Preview URL:** `games/ukiyo-e-printer/index.html`

## How to Review

1. Open the preview URL in any modern browser.
2. You'll see a paper-textured canvas with Mt. Fuji silhouette and drifting mist.
3. Click/tap on the paper to leave ink marks — they bloom with organic edges.
4. Drag to draw brushstrokes with ink bleed.
5. Hold a click for 1–2 seconds to "press the baren" — ink deepens and vermilion appears at 60%+ hold.
6. Click FINISH (or press S) to download your print with a red seal stamp.

## Controls
| Input | Action |
|-------|--------|
| Click/tap | Ink bloom at point |
| Click + drag | Brushstroke with ink bleed |
| Hold 1–2s | Baren press (ink deepens, vermilion at 60%+) |
| J or ♪ button | Toggle ambient audio |
| R or RESET | Clear print |
| S or FINISH | Download PNG with seal stamp |

## What Changed in This Polish

### Paper Texture (Priority 1)
- Added **deckle edge** effect: irregular darkened border mimicking handmade paper.
- Added **vertical washi fibers** (sparse, irregular) to complement horizontal fibers.
- Enhanced fiber variation with varied spacing and sinusoidal waviness.

### Ink Behavior (Priority 2)
- Added **ink bleed** (capillary spread) on all strokes with wider semi-transparent pass.
- Added **edge darkening** on strokes (darker rim like real ink pooling at fiber boundaries).
- Added **hold-duration opacity**: longer holds produce darker, richer ink marks.
- Baren press now shows an **expanding ring** visual at 30%+ progress.

### Mist Atmosphere (Priority 3)
- Increased mist layers from **8 to 12** for more depth.
- Added **sine-wave vertical drift** for natural, organic movement.
- Added **mouse parallax**: Fuji and mist respond subtly to cursor position.

### Control Chrome (Priority 4)
- Made buttons feel **carved/subtle**: removed bright hover glow, added inset shadow on press.
- Refined typography with better font fallback chain including Japanese serif fonts.
- Smoothed overlay fade transitions with cubic-bezier easing.

### Typography & Copy (Priority 5)
- Subtle **title animation** with upward drift fade-in.
- Improved prompt text: "Touch the paper. Breathe upon it. The floating world accumulates."

### Accessibility (Priority 7)
- Added `aria-label` attributes to all control buttons.
- Added `:focus-visible` style for keyboard navigation.
- Added `J` keybind for sound toggle.

## Verification Status
- Static checks: ✅ 15/15 pass
- Browser smoke test: ⚠️ Screenshot capture unavailable (container limitation); game playable at preview URL
- No console errors or uncaught exceptions detected
