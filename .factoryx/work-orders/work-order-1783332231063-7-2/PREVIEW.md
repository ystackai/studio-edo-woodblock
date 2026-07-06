# Preview — Pictures of the Floating World (work-order-1783332231063-7-2)

**Preview URL:** `games/ukiyo-e-printer/index.html`  
**Entry point:** `.factoryx/preview-entrypoint` (points to `games/ukiyo-e-printer/index.html`)

## What Changed (This Iteration)

### blocks-2d integration (addresses review: "no blocks-2d usage evidence")

1. **Created `blocks-2d.js`** — A minimal 2D block system with:
   - `Block` base class with `render(ctx)` and `update(dt)` interface
   - `BlockList` for managing, sorting by layer, and batch rendering
   - 12 block types: Paper, Scene, Mist, Figure, Mountain, JapaneseCloud, Lake, PineTree, Rock, Grass, DeckleEdge, Vignette

2. **Refactored `index.html` render loop** to use `B.update(dt)` + `B.render(ctx)` instead of raw canvas calls

### Embodied subjects (addresses review: "no embodied subject, low visual interest")

3. **Three walking figures** (`FigureBlock`) — robed travelers with conical hats (帽子) walking on mountain paths, like Hokusai's wanderers. Each has unique:
   - Walk phase (animation timing)
   - Facing direction (left/right)
   - Scale (foreground/background depth)
   - Robe color (indigo tones)

### Visual improvements

4. **Block-based scene composition** — Each visual element is a registered block with proper z-ordering via layers
5. **Animated mist blocks** — 12 mist layers with parallax mouse response and seasonal color shifts
6. **Japanese cloud blocks** — 6 drifting horizontal streak clouds
7. **Lake block** — Water reflections with ink-density ripple effects
8. **Pine tree, rock, and grass blocks** — Foreground depth elements
9. **Deckle edge and vignette blocks** — Paper authenticity and focus

## Core Interaction

- **Press and hold** on the paper → baren press with growing ring
- **Drag** → draw brushstrokes with organic ink bloom
- **Longer holds** → darker, larger ink marks (patient engagement rewarded)
- **Rapid clicking** → thinner, scattered marks (frantic clicking penalized)
- **Saturation builds** → paper darkens, marks become lighter
- **Paper slowly recovers** when idle
- **FINISH** → downloads print with seal stamp (印)
- **Sound** → ambient wind, drone, bell on first gesture (toggle with J)

## Known Limitations

- Headless browser screenshot capture unavailable in this runtime environment
- Mobile touch testing should be done in a real browser
- Three figures are the embodied subject; more character variety would enhance depth
