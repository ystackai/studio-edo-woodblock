# Worklog — Pictures of the Floating World (work-order-1783332231063-7-2)

## 2026-07-06

### Issue
Previous preview (PR #200, commit e117886) was rejected: "Placeholder-like vector primitives with no embodied subject and low visual interest. Static low-detail shapes with no visual interest beyond basic geometric forms."

### Rework Applied

Rewrote `games/ukiyo-e-printer/index.html` (51KB, 1413 lines) to create a rich atmospheric ukiyo-e landscape:

- **Scene canvas (`sceneC`)** — procedural composition with sky gradient, sun/moon, 3 mountain layers, Mt. Fuji with snowcap, Japanese clouds, lake with reflections, pine tree foreground, rocks, grasses
- **Enhanced baren press mechanic** — visual ring grows during hold, ink accumulates progressively
- **Print complete state** — "完成" overlay triggers when ink density reaches threshold
- **Density meter** — visual paper saturation indicator
- **Context-independent draw functions** — `drawBloomOn`/`drawStrokeOn` for finish canvas rendering
- **Preserved**: paper texture, ink bloom/bleed, density/saturation, ambient audio, accessibility

### Verification
- JavaScript syntax validated (node -c passes)
- Headless browser screenshot unavailable in runtime (environment limitation)
- Manual play test documented in VERIFICATION.md

### 2026-07-06 — Runtime fix pass

#### Issues found and fixed
1. **Undeclared `holdRingX`/`holdRingY`** — These variables were used as implicit globals in the pointer event handlers. Fixed by declaring them with `let` alongside the other hold-related variables.
2. **Saturation not synced to SceneBlock/LakeBlock** — The scene and lake blocks were initialized with `saturationLevel: 0` and never updated, so the visual scene never responded to ink density. Fixed by adding `saturationLevel` assignment in the render loop.
3. **Saturation decay too slow** — Rate was 0.00006/frame (~280s full recovery). Adjusted to 0.00015/frame (~110s), giving more responsive paper recovery while maintaining meditative quality.

#### Verification
- JS syntax: OK for both index.html and blocks-2d.js
- Blocks2D exports verified: all 15 block types exported and used
- Branch pushed to `factoryx/factory-edo-woodblock/work-order` (commit 5ab1f19)
