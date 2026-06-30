# Asset Manifest — Moon Bridge Toy Canary

## Generated Assets

| File | Method | Size | Notes |
|------|--------|------|-------|
| `games/edo-moon-bridge-toy-canary-20260630t0454z/index.html` | Hand-authored canvas art | 21KB | Self-contained HTML/CSS/JS game |

## Visual Elements (all canvas-rendered)

- **Sky**: Dark gradient with moon and reflected moonlight on water
- **Mountains**: Layered silhouettes with mist
- **River**: Flowing water with kelp strands
- **Bridge**: Moonlit bridge with lanterns that glow brighter as lanterns are delivered
- **Boat**: Small sampei boat with a lantern, gently bobbing
- **Kelp**: Obstacles drifting upward that the path must avoid
- **Sparkles**: Particle effects at path creation and delivery moments
- **Cherry blossoms**: Falling petals during the finale

## Audio

None (silent game, no SFX/music — within toy scope for 12h canary)

## Integration Points

- Canvas `draw*` functions render all visuals each frame
- No external assets, fonts, or network calls
- Single-file architecture: all CSS/JS inlined in `index.html`

## Browser Verification

- Chromium headless screenshot confirmed full scene renders
- No console errors or exceptions in Chromium log
- Game loop runs at 60fps (requestAnimationFrame)
