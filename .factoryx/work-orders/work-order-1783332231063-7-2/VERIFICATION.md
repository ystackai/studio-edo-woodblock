# Verification — Pictures of the Floating World (work-order-1783332231063-7-2)

**Artifact:** `games/ukiyo-e-printer/index.html`  
**Last Updated:** 2026-07-06

## Code Verification

- ✅ JavaScript syntax: Valid (node -c passes)
- ✅ Canvas element present with DPR support
- ✅ Scene canvas (`sceneC`) with procedural ukiyo-e landscape: sky gradient, sun/moon, layered mountains (3 layers with atmospheric perspective), Mt. Fuji with snowcap and tendrils, Japanese clouds, lake with reflections, pine tree foreground, rocks, grasses
- ✅ Deckle edge paper texture with washi fibers
- ✅ Ink bloom with organic capillary edge darkening
- ✅ Ink stroke with variable opacity, bleed, and edge darkening
- ✅ Density map with saturation tracking
- ✅ Baren press mechanic: hold ring grows with pressure, ink accumulates
- ✅ Hold-duration opacity: longer holds = darker, larger marks
- ✅ Print complete state (density threshold triggers visual + audio feedback)
- ✅ Density meter UI element
- ✅ Ambient audio: wind, drones, paper rustle, triggered on user gesture
- ✅ Sound toggle, reset, and finish/download controls
- ✅ Keyboard accessibility: R=reset, S=finish, J=sound toggle
- ✅ Mobile responsive: touch targets ≥ 44px, touch-action: none
- ✅ Mouse parallax for mist layers

## Browser Runtime Verification

- ⚠️ Headless chromium screenshot unavailable in this runtime environment
- ✅ Syntax validation: node -c passes for embedded JavaScript
- ✅ HTML structure valid: complete page with canvas, overlay, controls
- ✅ Preview URL: `games/ukiyo-e-printer/index.html`
- ✅ HTTP 200 response from local server

## Manual Play Test (to verify locally)

1. Open `games/ukiyo-e-printer/index.html` in a browser
2. See the title "浮世絵 — Press the Baren" and subtitle
3. Press/tap anywhere on the paper — observe ink bloom with organic edges
4. Drag to draw strokes — observe variable opacity based on speed
5. Hold and press — observe growing press ring and ink accumulation
6. Wait patiently — paper slowly recovers (saturation decay)
7. After ~10-15 deliberate marks, observe "完成" (complete) overlay
8. Press FINISH to download your print with seal stamp (印)
9. Press RESET to clear and start again
10. Toggle sound with J key — ambient wind and bell begin on first interaction
