# Blocks Usage — q3-blocks-mini-live-v10

## Modules copied from `.factoryx/foundry/`

### `game-loop.js` (from `.factoryx/foundry/blocks-2d/game-loop.js`)
- **Status**: Copied unchanged.
- **Called in**: `game.js` line 60 — `FoundryLoop.start({ update, render })` kicks off the fixed-timestep loop at 60 Hz. Both `update(dt)` and `render(alpha)` are called every frame.

### `input.js` (from `.factoryx/foundry/blocks-2d/input.js`)
- **Status**: Copied unchanged.
- **Called in**: `game.js` line 10 — `FoundryInput.install(C, { actions: { left, right } })` binds ArrowLeft/A and ArrowRight/D. In `update(dt)` lines 19-21, `FoundryInput.held()` drives catcher movement, `FoundryInput.pointer.down` enables mouse/touch steering, and `FoundryInput.consume()` triggers start. `FoundryInput.update(dt)` is called at the end of every update tick (lines 16, 21, 40).

### `webaudio-kit.js` (from `.factoryx/foundry/sound/webaudio-kit.js`)
- **Status**: Copied unchanged.
- **Called in**: `game.js` line 9 — `FoundryAudio.install()` arms the audio context on user gesture. During gameplay: `FoundryAudio.pickup()` on successful catch (line 35), `FoundryAudio.fail()` on missed objects or ink hits (lines 30, 35), `FoundryAudio.droneStart(55)` when play begins (line 15), `FoundryAudio.droneStop()` and `FoundryAudio.success()` at game end (line 26).

## Key changes
- None. All three modules are copied verbatim from the Foundry blocks directory.
