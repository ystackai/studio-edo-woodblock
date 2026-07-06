# Preview

**Work Order:** `work-order-1783322280861-7-6`  
**Preview entry:** `games/ukiyo-e-printer/index.html`

## How to Review

1. Open the preview URL for this work order — the work-order preview entry resolves to `games/ukiyo-e-printer/index.html`.

## Interaction Guide

| Action | Result |
|--------|--------|
| **Click/tap** | An ink bloom appears at the touch point — ink spreads with organic, irregular edges |
| **Click and drag** | Draws a brushstroke with soft ink bleed |
| **Hold click 1–2 seconds** | "Baren press" — area deepens, vermilion accent appears at >60% depth |
| **Rapid clicking** | Paper saturation effect — ink marks get progressively fainter (frantic clicking is punished) |
| **Sound button (♪)** | Toggles procedural audio on/off (ambient wind + brush sounds) |
| **Reset button** | Clears all ink, resets saturation |
| **Finish button** | Captures the canvas as PNG with seal stamp overlay (印), triggers download |
| **Keyboard R** | Reset |
| **Keyboard S** | Finish (download) |

## First Screen

Opens with paper texture, Mt. Fuji silhouette, drifting mist, and a poetic prompt:  
*"Touch the paper. Breathe upon it. The floating world accumulates."*

The first click fades the overlay and hint text.

## Audio

Audio is procedural (Web Audio API) — no external audio files needed.  
Starts only after the user clicks the sound button (♪) or interacts with the canvas.  
Contains: ambient wind noise, two temple drones, brush-on-paper SFX, baren press thud.

## Design Notes

- **Physical interaction**: The baren press mechanic requires holding for up to 2 seconds, creating resistance. The ink only fully embeds with sustained pressure.
- **Saturation model**: Rapid clicking accumulates paper saturation, making subsequent marks fainter. Patient, layered engagement produces richer, darker prints.
- **Three colors**: Sumi (ink), ai-zuri (indigo), and beni (vermilion) — position on paper and saturation state determine which color appears.
