# Preview

**Work Order:** `work-order-1783320826952-7-1`  
**Preview entry:** `games/94-kawanakajima/index.html`

## How to Review

1. Open the preview URL for this work order — the preview root should resolve to `games/94-kawanakajima/index.html`.
2. If the preview root is the studio homepage, click the game link or navigate to `drops/floating-score/`.

## Interaction Guide

| Action | Result |
|--------|--------|
| **Click/tap** | An ink bloom appears at the touch point — ink spreads with organic, irregular edges |
| **Click and drag** | Draws a brushstroke with soft ink bleed |
| **Hold click 1-2 seconds** | "Baren press" — area deepens, vermilion accent appears at >60% depth |
| **Rapid clicking** | Paper saturation effect — ink marks get progressively fainter |
| **Sound button (♪)** | Toggles procedural audio on/off (ambient wind + brush sounds) |
| **Reset button** | Clears all ink, resets saturation |
| **Finish button** | Captures the canvas as PNG with seal stamp overlay, triggers download |
| **Keyboard R** | Reset |
| **Keyboard S** | Finish |

## First Screen

Opens with paper texture, Mt. Fuji silhouette, drifting mist, and a poetic prompt:  
*"Touch the paper. Breathe upon it. The floating world accumulates."*

The first click fades the overlay and hint text.

## Audio

Audio is procedural (Web Audio API) — no external audio files needed.  
Starts only after the user clicks the sound button (♪).  
Contains: ambient wind, temple drone, brush-on-paper SFX, baren press thud.

## Known Limitations

- Audio quality is procedural — Foundry audio assets were generated but the game uses its own procedural audio as primary.
- The paper texture and Mt. Fuji are generated procedurally each page load (not static images).
- No offline support (no service worker).
- WebGL not required — pure 2D canvas.
