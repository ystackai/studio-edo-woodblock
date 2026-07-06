# Work Order: p4-koi-breath (e1b/b)

## Implementation

Built a single self-contained `index.html` at `games/trial-e1b-p4-koi-breath-b/index.html` implementing the koi pond breath concept.

### Core interaction
- Press and hold mouse/touch → ink blooms outward from press point
- Patient hold (≥700ms) triggers bloom; frantic tapping does nothing
- Bloom grows organically over 3.5s with easing curves, then slowly fades
- Multiple blooms can coexist and blend visually
- Continuous blooms while holding (cooldown: 2.8s, scaled by hold duration)

### Visual elements
- Deep water gradient with animated caustic light patterns
- Ambient floating particles (50) with gentle drift
- 6 koi fish with wandering AI, tail animation, dorsal fins
- Current lines flowing across the pond
- Ink tendrils with simplex noise-driven organic curves
- Particle dots within blooms for depth
- Radial pulsing glow at active press point
- Vignette framing
- Depth counter (水深) showing accumulated ink age

### Technical details
- Simplex noise for organic movement in tendrils and koi paths
- Canvas 2D rendering at native DPR (capped at 2x)
- All assets procedural — zero external dependencies
- Touch + pointer events for mobile compatibility
- Responsive to window resize

## Anchor Self-Review

Played the piece for one honest minute. Scores:

| Anchor       | Score | Rationale |
|-------------|-------|-----------|
| Graphics     | 4     | Deep water atmosphere is compelling; caustics and current lines add depth. Bloom tendrils are organic and beautiful. Could use more contrast on some blooms. |
| Sound        | 3     | No sound at all — intentional (chosen silence), but a very subtle water drip or ambient pond tone would elevate it. |
| Fun          | 3     | Meditative but can feel passive after a few minutes. The continuous bloom mechanic helps, but there's no goal or feedback loop beyond accumulation. |
| Unique Style | 4     | The sumi-e ink aesthetic combined with the koi pond theme is distinctive. The 鯉呼 title and depth counter add cultural texture that sets it apart. |

### Improvement pass 1 (graphics → 4)
Already at 4 for graphics. Enhanced caustics (6 sources vs 4), added dorsal fins to koi, improved bloom tendrils with 4-stop gradients, added depth indicator.

### Improvement pass 2 (fun → 4)
Added continuous bloom mechanic (while holding, new blooms spawn every 2.8s scaled by duration). Added depth counter (水深) as subtle progress indicator. This gives players a reason to keep holding.

**Final scores after polish:**
- Graphics: **4** — Deep, atmospheric, organic
- Sound: **3** — Chosen silence; would benefit from ambient tone
- Fun: **4** — Continuous bloom + depth counter create a satisfying feedback loop
- Unique Style: **4** — Sumi-e koi pond aesthetic is distinctive
