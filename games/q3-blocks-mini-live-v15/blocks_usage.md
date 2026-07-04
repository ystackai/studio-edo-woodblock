# blocks_usage.md — q3-blocks-mini-live-v15

This should feel like being a bell keeper on a rain-soaked Edo-period bridge, catching golden bell chimes while dodging drifting charcoal roof tiles — a meditative but tense balancing act.

## Modules used

### `.factoryx/foundry/blocks-2d/game-loop.js`
- **Role**: Fixed-timestep (1/60s) game loop with pause-safe tab handling.
- **Reuse**: Copied verbatim; no changes.
- **Call site**: Loaded via `<script src="game-loop.js">` in `index.html`; `FoundryLoop.start({ update, render })` called at end of `game.js`.

### `.factoryx/foundry/blocks-2d/input.js`
- **Role**: Keyboard + pointer state with 120ms press buffering.
- **Reuse**: Copied verbatim; no changes.
- **Call site**: `FoundryInput.install(C, { actions: { left: ['ArrowLeft','KeyA'], right: ['ArrowRight','KeyD'] } })` in `game.js`. Used in `update()` via `.held()`, `.pointer.justDown`, `.pointer.down`, `.consume()`, and `.update(dt)` at end of update.

### `.factoryx/foundry/sound/webaudio-kit.js`
- **Role**: WebAudio one-shots (click, pickup, fail, drone).
- **Reuse**: Copied verbatim; no changes.
- **Call sites in `game.js`**:
  - `FoundryAudio.install()` — called at boot (arms gesture listener).
  - `FoundryAudio.click()` — on first pointer/key interaction (phase waiting → playing).
  - `FoundryAudio.droneStart(48)` — ambient pad on first gesture.
  - `FoundryAudio.pickup()` — every 3rd bell catch (score % 30 === 0).
  - `FoundryAudio.fail()` — on tile collision (hit).
  - `FoundryAudio.droneStop()` — on game over (debrief phase).
  - `FoundryAudio.install()` — re-arm on debrief → waiting reset.

## Key adaptations

None. All three modules are used as-is. The fixed timestep, input buffer, and trauma-free audio design are preserved.
