# blocks_usage.md — Q3 Blocks Mini Live v7

## game-loop.js (FoundryLoop)

- **Status:** copied verbatim from `.factoryx/foundry/blocks-2d/game-loop.js`, no changes.
- **Used for:** the fixed-timestep game loop driving all game logic at 60 Hz.
- **Integration:** `FoundryLoop.start({ update, render })` is called once at boot in `game.js`.
  `update(dt)` runs at exactly `FoundryLoop.STEP` (1/60 s) per tick — player movement, block
  spawning, collision, and buffer aging. `render(alpha)` draws background bands, guide lines,
  falling blocks, the player paddle, and score text. The `elapsed` timer (`FoundryLoop.time()`)
  is not directly used; tick accumulation in `update` handles periodic spawning.
- **Load-bearing shapes preserved:** fixed timestep (STEP = 1/60), MAX_STEPS cap at 5,
  visibilitychange pause/resume — all left as-is per the usage contract.

## input.js (FoundryInput)

- **Status:** copied verbatim from `.factoryx/foundry/blocks-2d/input.js`, no changes.
- **Used for:** keyboard and pointer input with 120 ms press buffering.
- **Integration:** `FoundryInput.install(canvas, { actions: { left: ['ArrowLeft','KeyA'],
  right: ['ArrowRight','KeyD'] } })` is called at boot. In `update(dt)`:
  `FoundryInput.held('left')` and `FoundryInput.held('right')` drive the player paddle vx.
  `FoundryInput.pointer.down` and `FoundryInput.pointer.x` enable click/drag aiming.
  `FoundryInput.update(dt)` is called at the end of every `update` to age the buffers,
  exactly as the contract specifies.
- **Load-bearing shapes preserved:** BUFFER = 0.12 s, consume-once semantics, pointer
  canvas-coordinate scaling — all unchanged.

## Summary

| Module       | Reused | Key change |
|--------------|--------|------------|
| game-loop.js | yes    | none — verbatim copy |
| input.js     | yes    | none — verbatim copy |
