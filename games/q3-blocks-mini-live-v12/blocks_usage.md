# blocks_usage.md — Q3 blocks mini-live v12

**Creative intent**: "This should feel like steering a small boat through a midnight canal in Edo, dodging floating debris while a low drone fills the mist."

## Modules used

| Module | Source | Role |
|---|---|---|
| `game-loop.js` | `.factoryx/foundry/blocks-2d/game-loop.js` | Fixed-timestep 60fps loop; used via `FoundryLoop.start({ update, render })` in `game.js` line 117 |
| `input.js` | `.factoryx/foundry/blocks-2d/input.js` | Keyboard (ArrowLeft/KeyA, ArrowRight/KeyD) + pointer steering with press buffering; installed via `FoundryInput.install(canvas, { actions })` in `game.js` line 115 |
| `webaudio-kit.js` | `.factoryx/foundry/sound/webaudio-kit.js` | WebAudio one-shots; `FoundryAudio.install()` armed at boot (game.js line 116), `droneStart(55)` + `click()` on first gesture (line 67), `whoosh()` on debris spawn (line 81), `pickup()` every 5 dodges (line 86), `fail()` on obstacle hit (line 5), `droneStop()` on debrief (line 72) |

## Reused vs adapted

- **game-loop.js**: reused verbatim — no changes.
- **input.js**: reused verbatim — no changes.
- **webaudio-kit.js**: reused verbatim — no changes.

## Key design notes

- **Phase machine**: `waiting` → `playing` → `hit` → `debrief`. Input consumed before state gates — pointer/keyboard transitions happen at the top of `update()` without early-return guards.
- **First paint**: the waiting scene renders a non-uniform canvas (dark water gradient, wave lines, a bobbing boat, title text) before any interaction.
- **Audio on first gesture**: `FoundryAudio.install()` arms gesture listeners at boot; the first pointerdown/keydown creates the AudioContext, starts the drone pad, and plays a click one-shot in the same frame as the phase transition.
- **No asset foundry**: this launch opted out of generated assets; all visuals are drawn procedurally, audio uses WebAudio oscillators from the foundry kit.
