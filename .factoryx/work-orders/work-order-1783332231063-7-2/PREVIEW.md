# Preview — Pictures of the Floating World (work-order-1783332231063-7-2)

**Preview URL:** `games/ukiyo-e-printer/index.html`  
**Entry point:** `.factoryx/preview-entrypoint` (points to `games/ukiyo-e-printer/index.html`)
**Public card route:** `drops/ukiyo-e-printer/` redirects to the same current game artifact.

## What Changed (This Iteration)

### Runtime fixes
1. **Fixed undeclared `holdRingX`/`holdRingY` variables** — previously implicit globals, now properly declared as `let` to prevent ReferenceError in strict mode
2. **Fixed saturation sync** — `SceneBlock` and `LakeBlock` now receive the game's `saturationLevel` each frame, so the scene and water respond to ink density
3. **Adjusted saturation decay rate** — from 0.00006→0.00015 per frame for more responsive paper recovery (~110s vs ~280s full recovery)
4. **Aligned public drop route** — `drops/ukiyo-e-printer/` now redirects to `games/ukiyo-e-printer/`, so the shipped studio card opens the current baren/ink printer.

### Previous iterations (preserved)
5. **Blocks2D integration** — 12 block types exported and used for scene composition
6. **Embodied subjects** — Three walking FigureBlock instances (Hokusai-style travelers with conical hats)
7. **Rich scene composition** — Mt. Fuji, mountain layers, lake with reflections, pine tree, rocks, grasses
8. **Interactive ink mechanics** — baren press, brushstroke drawing, saturation model, print completion
9. **Ambient audio** — wind drone, paper rustle, bell (user-gesture triggered)

## Core Interaction

- **Press and hold** on the paper → baren press with growing ring (vermilion accent at 60%)
- **Drag** → draw brushstrokes with organic ink bloom and variable opacity
- **Longer holds** → darker, larger ink marks (patient engagement rewarded)
- **Rapid clicking** → thinner, scattered marks (frantic clicking penalized via saturation)
- **Saturation builds** → paper darkens, ink quality degrades
- **Paper slowly recovers** when idle
- **FINISH** → downloads print with seal stamp (印)
- **Sound** → ambient wind, paper rustle, bell on first gesture (toggle with J)

## Visual Assets

- Procedural washi paper texture (woven fiber lines, subtle noise)
- Mt. Fuji with snowcap and mist tendrils
- Three mountain layers with atmospheric perspective
- Lake with ink-density ripple reflections
- Foreground pine tree with recursive branches
- Rocks, grasses, deckle edge overlay
- Three walking figures with conical hats

## Known Limitations

- Audio is procedural (Web Audio API) — not from Asset Foundry
- Single canvas scene — no multi-print layering
- Mobile touch testing should be done in a real browser
