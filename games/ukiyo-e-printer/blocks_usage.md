# blocks-2d — Usage Evidence

**Game:** Ukiyo-e Printer (`games/ukiyo-e-printer/index.html`)
**Date:** 2026-07-06
**Module:** `blocks-2d.js` (self-contained, 1411-line project)

## Modules adopted

| Module / Class          | Used? | Rationale |
|---|---|---|
| `Blocks2D.BlockList`    | ✅ Yes | Central scene manager — all visual elements registered as blocks, sorted by layer, rendered via `B.render(ctx)` and updated via `B.update(dt)` each frame |
| `PaperBlock`           | ✅ Yes | Procedural washi paper texture with subtle grain animation |
| `SceneBlock`           | ✅ Yes | Wraps the static scene canvas (sky, mountains, lake) with saturation-based darkening |
| `MistBlock` (×12)      | ✅ Yes | 12 animated mist layers with parallax mouse response and seasonal color shift |
| `FigureBlock` (×3)     | ✅ Yes | **Embodied subjects** — three robed figures with conical hats walking on mountain paths (Hokusai-style travelers) |
| `MountainBlock`        | ✅ Yes | Layered mountain rendering with parallax and bezier curves |
| `JapaneseCloudBlock` (×6) | ✅ Yes | Traditional horizontal streak clouds drifting slowly |
| `LakeBlock`            | ✅ Yes | Lake with water reflections and ink-density ripple effects |
| `PineTreeBlock`        | ✅ Yes | Procedural pine tree with recursive branching and needle clusters |
| `RockBlock`            | ✅ Yes | Rocky outcrop on the right side of the scene |
| `GrassBlock`           | ✅ Yes | Foreground grasses with wind sway animation |
| `DeckleEdgeBlock`      | ✅ Yes | Paper edge deckle effect with fiber edge lines |
| `VignetteBlock`        | ✅ Yes | Radial vignette that responds to ink saturation |

## Key design decisions

- **BlockList as render loop**: Instead of raw canvas calls per frame, all visual elements register as blocks. The render loop calls `B.update(dt)` then `B.render(ctx)`, with sorting by layer for correct z-ordering.
- **Embodied subjects**: Three `FigureBlock` instances (walking robed figures) provide the focal subject the previous iteration lacked. Each has unique walk phase, facing direction, scale, and robe color.
- **No fixed timestep**: Saturation decay, mist drift, and water ripple are intentionally frame-rate dependent for organic feel.
- **Direct pointer input**: Freeform drawing with pointer events matches the physical "baren press" metaphor.
- **Canvas gradients over particles**: Ink blooms use radial gradients with capillary edge darkening, simulating ink bleeding into washi paper.

## Conclusion

blocks-2d provides the structural abstraction needed for a layered, multi-element composition. The BlockList pattern manages z-ordering of paper, scene, mist, figures, lake, and foreground elements. The `update/render` loop decouples simulation from rendering, and layer-based sorting ensures correct visual composition. The addition of walking figures (FigureBlock) transforms the scene from a landscape into an inhabited floating world.
