# Blocks Usage — Q3 Blocks Mini Live v9

## Modules Copied

| Module | Source | Copied To | Status |
|---|---|---|---|
| game-loop.js | `.factoryx/foundry/blocks-2d/game-loop.js` | `games/q3-blocks-mini-live-v9/game-loop.js` | Reused verbatim |
| input.js | `.factoryx/foundry/blocks-2d/input.js` | `games/q3-blocks-mini-live-v9/input.js` | Reused verbatim |
| webaudio-kit.js | `.factoryx/foundry/sound/webaudio-kit.js` | `games/q3-blocks-mini-live-v9/webaudio-kit.js` | Reused verbatim |

## Runtime Calls

### game-loop.js
- `FoundryLoop.start({ update: update, render: render })` — called in `game.js` `boot()` to start the fixed-timestep loop at 60 Hz. The `update` function advances game state (player position, cup movement, spawn timer, catch/miss logic). The `render` function draws the non-uniform brushstroke background, player basket, falling cups, HUD, and title/end overlays.

### input.js
- `FoundryInput.install(canvas, { actions: { left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], start: ['Space'] } })` — called in `game.js` `boot()` to wire keyboard and pointer input to the canvas.
- `FoundryInput.held('left')` / `FoundryInput.held('right')` — called every frame in `update(dt)` to move the player basket left/right.
- `FoundryInput.pointer.down` and `FoundryInput.pointer.x` — used for pointer/mouse drag movement of the basket.
- `FoundryInput.update(dt)` — called at the end of `update(dt)` to age input buffers.

### webaudio-kit.js
- `FoundryAudio.install()` — called in `boot()` to arm the gesture listener for AudioContext creation.
- `FoundryAudio.click()` — fired on game start/restart.
- `FoundryAudio.pickup()` — fired each time a cup is caught.
- `FoundryAudio.fail()` — fired each time a cup is missed.

## Key Changes

- **game-loop.js**: none — used verbatim.
- **input.js**: none — used verbatim.
- **webaudio-kit.js**: none — used verbatim.
- **game.js**: original, 115 lines, calls all three blocks above.
