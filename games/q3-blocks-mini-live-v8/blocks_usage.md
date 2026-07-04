# Blocks Usage — q3-blocks-mini-live-v8

## Modules copied from `.factoryx/foundry/`

### game-loop.js (blocks-2d/game-loop.js)
- **Status**: Copied verbatim, no changes.
- **How used**: `FoundryLoop.start()` is called in `game.js` with an `update(dt)` that moves the player paddle, drops falling blocks, checks catches/misses, and a `render(alpha)` that paints the multi-color background bands, guide lines, falling blocks, player paddle, score text, and game-over overlay. The fixed timestep (1/60 s) keeps block fall speed and player movement frame-rate independent. `FoundryLoop.time()` is used inside `update` to gate periodic block spawning.

### input.js (blocks-2d/input.js)
- **Status**: Copied verbatim, no changes.
- **How used**: `FoundryInput.install(canvas, { actions: { left: ['ArrowLeft','KeyA'], right: ['ArrowRight','KeyD'] } })` is called at startup. In the `update` tick, `FoundryInput.held('left')` / `held('right')` drive the player paddle left/right. `FoundryInput.consume('left')` / `consume('right')` restarts the game after game-over. `FoundryInput.update(dt)` is called last in every update frame to age the 120 ms press buffer.

### webaudio-kit.js (sound/webaudio-kit.js)
- **Status**: Copied verbatim, no changes.
- **How used**: `FoundryAudio.install()` is called at the top of `game.js`. A helper `sfx()` returns the audio kit only after the first user gesture (when `FoundryAudio.ready()` is true). `FoundryAudio.pickup()` fires when the player catches a falling block. `FoundryAudio.fail()` fires when a block is missed or game-over triggers. `FoundryAudio.droneStart(44)` starts a low ambient drone on game-over for atmosphere. Audio is only triggered after the browser allows it (first keydown/pointerdown).

## Key changes
- None. All three modules were copied as-is from the foundry to preserve load-bearing invariants: fixed timestep in `game-loop.js`, the 120 ms press buffer in `input.js`, and the gesture-gated AudioContext lifecycle in `webaudio-kit.js`.
- Fixed the game-over text from "PRESS LOST" to "GAME OVER" in the game logic (not a module change).
