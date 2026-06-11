# Work Log — Living Print: Wave Horizon (Trial e1r3/b, Variant B)

## Implementation

Built a single self-contained HTML file: `games/trial-p1-living-print-b/index.html`

**Core elements:**
- Warm paper grain texture (procedural cellulose fibers, impurities, warmth variation)
- Single wave-form horizon breathing organically (4 overlapping sine harmonics)
- 14 drifting mist clouds as primary expressive material
- Deep indigo ink for wave body (gradient #1A2744 → lighter)
- Pale celestial disc, 5 bird silhouettes, vignette, edge aging

**Interaction (Baren Press):**
- Press/hold to deepen ink, spring-damped physics (k=4.5, damp=3.8)
- Ink bloom particles appear when pressing near the wave
- Secondary ripple lines emerge under pressure
- Wave crest thickens, vignette darkens, birds respond

**Audio:** Near-silent brown-noise wind + 52/78Hz hum, gesture-only, depth-modulated.

**Payload:** ~20KB, zero external deps, offline-capable.

## Bug Fix: createRadialGradient non-finite error

**Root cause:** `MistCloud` instances were created at module scope *before* `resize()` was called, so `W` and `H` were `undefined`. This caused `this.w` to be `NaN`, which failed in `createRadialGradient(cx, cy, 0, cx, cy, this.w * 0.5)`.

**Fix:** Moved mist initialization into `resize()` via `initMists()`, called after `W`/`H` are set. Verified with headless Chromium: no uncaught errors, canvas renders correctly.

## Anchor Self-Review (Final)

| Anchor | Score | Notes |
|--------|-------|-------|
| **Graphics** | 4 | Strong composition. Paper, wave, mist, birds. Screenshot-worthy ukiyo-e aesthetic. |
| **Sound** | 4 | Near-silent by design. Brown-noise wind + hum creates atmosphere without intrusion. |
| **Fun** | 4 | The press creates visible, accumulating ink blooms. Birds scatter. Ripple propagates. Meditative but with clear feedback loops. |
| **Unique Style** | 5 | Unmistakably Edo. Baren press metaphor, paper grain, wave horizon — only this studio could make it. |

All anchors at 4 or above. No further passes needed.
