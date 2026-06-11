# Preview: Rain Lantern 雨灯

## Path
`games/trial-e1b-p3-lantern-rain-b/index.html`

## Description
A single paper lantern hangs in dusk rain. Rain streaks diagonally across the scene, bamboo silhouettes sway on the right, distant mountains fade into dark indigo. The lantern's warm glow pushes through wet paper, casting a soft reflection on the ground below.

## Controls
- **Touch/Click (hold):** Shield the lantern with a hand silhouette. Flame steadies, rain sound begins.
- **Release:** Hand lowers, flame gradually destabilizes again.
- **Spacebar:** Same as touch/click, for keyboard access.
- **First interaction:** Initializes audio context (rain sound, user-initiated only).

## Design Decisions
- Canvas-based 2D rendering, no external dependencies
- All assets procedurally generated (grain texture, rain particles, bamboo)
- Color palette: deep dusk indigo, warm vermilion, amber flame
- Audio: bandpass-filtered noise, only plays when shielding
- Easing on all motion (shield hand, flame steadiness, rain)
- Touch targets cover entire canvas (> 44px)
- Responsive sizing with DPR-aware canvas
- Paper grain overlay across entire frame
