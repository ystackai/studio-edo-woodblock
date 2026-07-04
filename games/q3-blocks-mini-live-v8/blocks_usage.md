# Blocks Usage — q3-blocks-mini-live-v8

## Modules copied from `.factoryx/foundry/blocks-2d/`

### game-loop.js
- **Status**: Copied verbatim, no changes.
- **How used**: `FoundryLoop.start()` is called in `game.js` with an `update(dt)` that moves the player, drops falling blocks, checks catches/misses, and a `render(alpha)` that paints the background bands, guide lines, falling blocks, player paddle, score text, and game-over overlay. The fixed timestep (1/60 s) keeps block fall speed and player movement frame-rate independent. `FoundryLoop.time()` is used inside `update` to gate periodic block spawning.

### input.js
- **Status**: Copied verbatim, no changes.
- **How used**: `FoundryInput.install(canvas, { actions: { left: ['ArrowLeft','KeyA'], right: ['ArrowRight','KeyD'] } })` is called at startup. In the `update` tick, `FoundryInput.held('left')` / `held('right')` drive the player paddle left/right. `FoundryInput.consume('left')` / `consume('right')` restarts the game after game-over. `FoundryInput.update(dt)` is called last in every update frame to age the press buffer.

## Key changes
- None. Both modules were copied as-is from the foundry to preserve load-bearing invariants: fixed timestep in `game-loop.js` and the 120 ms press buffer in `input.js`.
