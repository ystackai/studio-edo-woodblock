# Asset Manifest

## Generated Assets

| Asset | Path | Size | Method | Browser Check |
|---|---|---|---|---|
| Game (HTML/CSS/JS) | `games/edo-moon-bridge-toy-canary-20260630t0454z/index.html` | ~25 KB | Hand-authored canvas game | `node --check` JS syntax: PASS |

## Asset Notes
- No foundry pipeline available for this run; all visuals are in-code canvas rendering
- All audio is Web Audio API oscillators (triangle/sine waves), generated at gesture time
- Paper texture is procedurally generated at init (256x256 canvas)
- No external network dependencies; works offline after load

## Integration Points
- Canvas `#c`: full-screen, handles pointer events
- AudioContext: created on first `pointerdown`, uses triangle/sine oscillators
- UI overlay: `#lantern-count`, `#hint`, `#finale-text`, `#restart`, `#stamp`

## Blockers
- Asset foundry (`factoryx-edo-woodblock-asset-foundry:18113`) was not verified for this run
- No PNG/WebP sprite assets generated — visuals are pure canvas
