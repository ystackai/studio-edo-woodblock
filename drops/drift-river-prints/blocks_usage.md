# blocks_usage.md — drift-river-prints

## Modules used

| Module | Status | Notes |
|---|---|---|
| `game-loop.js` | Reused | Fixed-timestep loop drives title/play/end scenes |
| `scenes.js` | Reused | Three scenes: title, play, end — enter/exit hooks manage overlays |
| `input.js` | Reused | Pointer/touch drag for koi/waterweed elements |
| `tween.js` | Reused | `backOut` for snap-into-place, `sineInOut` for drift-back |
| `particles.js` | Reused | Burst on successful placement (colored to match element) |
| `rng.js` | Reused | Seeded with 'drift-river-prints' for flow lines, washi texture, piece positions |

## Key changes
- None — all modules reused as-is from `.factoryx/foundry/blocks-2d/`
- FoundryShake (screen-shake.js) also copied and used for subtle snap feedback

## Not used
- `screen-shake.js` — actually used via FoundryShake for snap feedback
