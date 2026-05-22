# Goal Execution Strategy — Edo Inkblade: Road Opens

**Work Order:** `work-order-edo-inkblade-road-opens-assets-20260522`
**Branch:** `factoryx/factory-edo-woodblock/edo-inkblade-road-opens-assets-20260522`
**Date:** 2026-05-22

## Objective

Build a single-file playable browser game slice where:
1. The player sees a blocked road with a guard/obstacle
2. The player engages in a short duel (timed inputs)
3. The road opens visually and unmistakably
4. The player walks through and gets clear win feedback

## Key Design Decisions

- **Single HTML file** (`games/inkblade/index.html`) — no build step, no framework, maximum portability
- **Canvas-based rendering** with ukiyo-e ink aesthetic (sumi-e brush strokes, woodblock print texture)
- **Simple input model**: arrow keys to move, SPACE to strike/due
- **Procedural placeholders first** — all visuals drawn with canvas primitives
- **Generated assets second** — use FACTORYX_GAME_ASSET_SERVICE_URL after the loop works

## Prior Run Lessons Applied

1. **No idle opponents** — guard actively attacks with visible windup animation
2. **No ambiguous silhouettes** — bold shapes, clear contrast, readable at any resolution
3. **No hidden road** — the blocked road and the open road must be visually unmistakable
4. **First screen IS the game** — no landing page, no "click to enter" beyond a start button for audio context
5. **Clear controls overlay** — visible HUD with arrow keys + SPACE labeled clearly

## Phases

### Phase 1: Playable Core Loop (Procedural)
- Canvas scene with road, gate, guard, and player
- Movement + duel mechanics
- Gate-open animation
- Walk-through + win screen
- HUD with controls + objective

### Phase 2: Asset Generation
- Check FACTORYX_GAME_ASSET_SERVICE_URL health
- Request: Flux background image (road/gate scene), MMAudio SFX (gate-open sound)
- Integrate with graceful procedural fallback

### Phase 3: Verification + PR
- Browser smoke test (Puppeteer)
- Update PREVIEW.md, VERIFICATION.md, asset-manifest.json
- Push, create PR
