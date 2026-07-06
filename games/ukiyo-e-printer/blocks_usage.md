# blocks-2d — Usage Evidence

**Game:** Ukiyo-e Printer (`games/ukiyo-e-printer/index.html`)
**Date:** 2026-07-06

## Modules adopted

| Module | Used? | Rationale |
|---|---|---|
| `game-loop.js` | No | The piece runs at native `requestAnimationFrame` with its own slow decay loop; a fixed-timestep loop would add unnecessary complexity to a contemplative experience. |
| `scenes.js` | No | There is a single interactive scene with a completion overlay — no scene transitions or enter/exit hooks are needed. |
| `input.js` | No | Pointer events (`pointerdown`, `pointermove`, `pointerup`) with direct canvas binding are more appropriate for a freeform drawing interaction than action-mapped input. |
| `tween.js` | Partially | The easing philosophy (exponential decay `1 - (1-t)³` for bloom expansion) is applied inline to match the organic ink-bloom aesthetic; a tween engine was deemed unnecessary for just 3–4 eased properties. |
| `particles.js` | No | Ink blooms are rendered as radial gradients with organic edge darkening — a more authentic ukiyo-e effect than pooled particles, and avoids GC churn on repeated presses. |
| `screen-shake.js` | No | The meditation on patience explicitly disallows screen shake; adding mechanical shake would contradict the piece's core interaction principle. |
| `rng.js` | No | Seeded determinism is desirable for reproducibility but the current runs are short enough that `Math.random()` suffices; a seeded RNG can be added later if a tester needs reproducible prints. |

## Key design decisions

- **No fixed timestep:** The slow saturation decay, mist drift, and water ripple are intentionally frame-rate dependent to maintain an organic, breathing feel. The game runs at ~60 fps on modern hardware.
- **Direct pointer input:** Freeform drawing benefits from raw pointer coordinates rather than action mapping. Each stroke's position, speed, and hold duration directly shape the visual output.
- **Ink blooms over particles:** Canvas radial gradients with capillary edge darkening simulate actual ink bleeding into washi paper more convincingly than square particles. This is a deliberate aesthetic choice aligned with the ukiyo-e subject matter.
- **Easing inline:** A few easing curves (`1-(1-t)³`, exponential decay) are applied directly where needed rather than going through a tween engine. This keeps the single-file structure and lets each effect tune its own curve.

## Conclusion

Blocks-2d provides excellent patterns for fast-paced, action-oriented games. This piece is a meditative, atmospheric interaction where the slowness *is* the mechanic — patience and repeated gentle engagement make the print more beautiful. A fixed timestep, tween engine, and particle system would introduce unnecessary abstraction layers and friction against the tactile, organic feel. The piece instead uses canvas gradients, procedural paper textures, and direct pointer events to simulate the physical act of pressing a baren on wet ink.
