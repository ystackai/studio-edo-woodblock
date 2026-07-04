# Blocks Usage — Timber Drop (q3-blocks-mini-live-v6)

## Modules Used

### game-loop.js
- **Source**: `.factoryx/foundry/blocks-2d/game-loop.js`
- **Reuse vs. Adapt**: Copied as-is, no changes.
- **Usage**: `FoundryLoop.start({ update, render })` in game.js. Provides fixed-timestep (1/60 s) loop with pause-on-blur and MAX_STEPS catch-up cap. The `update` function advances game state each tick; `render` draws with interpolation alpha.

### input.js
- **Source**: `.factoryx/foundry/blocks-2d/input.js`
- **Reuse vs. Adapt**: Copied as-is, no changes.
- **Usage**: `FoundryInput.install(canvas, { actions: { left, right, jump } })` in game.js. Maps ArrowLeft/A to "left", ArrowRight/D to "right", Space to "jump". Provides 120 ms press buffering (`FoundryInput.consume`) and pointer support. `FoundryInput.update(dt)` is called at the end of the update tick.

## Modules Not Used
- **particles.js** — no particle effects in this minimal proof.
- **scenes.js** — single-scene game; state machine not needed.
- **tween.js** — motion is direct velocity-based; no tween-driven animation.
- **screen-shake.js** — not needed for this minimal block-catcher.
- **rng.js** — used `Math.random()` for simplicity; seeded RNG not required.

## Key Design Decisions
- Fixed timestep from game-loop.js is preserved exactly — this is the load-bearing shape.
- Input buffering (120 ms) from input.js is preserved — load-bearing for responsive catch mechanics.
- The first paint (before any input) draws colored background bands, a player block, 4 falling blocks, score text, and guide lines — proving the canvas renders a non-uniform scene immediately.
- game.js is 173 lines (under the 180-line limit).
