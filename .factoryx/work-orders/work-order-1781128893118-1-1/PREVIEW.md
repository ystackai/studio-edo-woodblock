# Preview — Living Print

## Open the print
- **Relative:** `games/living-print/`
- The preview root opens the living print directly.

## What you see
A single wave-form horizon in deep indigo ink on warm handmade paper. Mist drifts slowly across the scene. The piece is complete on first sight — no loading, no instructions, no menus.

## Interaction
- **Press and hold** anywhere (tap/hold on mobile, click/hold on desktop, or hold Space/Enter) to press the print deeper.
- The ink darkens and deepens with sustained pressure — like using a baren on wet woodblock paper.
- Releasing leaves some ink "dried in" — the print remembers your touch.
- Repeat to deepen further; the mist thins as the ink settles.

## Audio
- Near-silent by default. A barely audible paper rustle plays on the first press — only after user gesture.

## Technical
- Single self-contained `index.html`, ~16 KB, zero external dependencies.
- Canvas-based rendering at `requestAnimationFrame`.
- All assets (paper grain, ink texture) generated procedurally.
