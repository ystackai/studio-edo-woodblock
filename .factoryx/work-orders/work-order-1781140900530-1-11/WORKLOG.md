# Work Log — p4-koi-breath

## Build Summary

Built a single self-contained `index.html` at `games/trial-p4-koi-breath-b/index.html` implementing an interactive koi pond surface where pressing breathes ink into the water.

## Design Decisions

- **Core mechanic**: Press and hold for ≥600ms to bloom ink. Frantic tapping produces only a ripple — no ink. The longer held, the larger and more complex the bloom.
- **Visual style**: Ukiyo-e woodblock aesthetic — warm paper texture with fiber grain, indigo-black ink wash, mist at edges, koi silhouettes in sumi/beni/karasugigo/kin color variants.
- **Koi behavior**: 6 koi fish swim with organic noise-based wandering, avoiding ink blooms (they flee from fresh ink).
- **Ink rendering**: Multi-layer ink blooms with organic bezier-curve shapes, radial gradients for wash effect, trailing ink particles that diffuse outward.
- **Audio**: User-initiated only. Gentle sine-wave water tones on press, deeper chord tones on bloom — gets richer with longer holds.
- **Accessibility**: Pointer events (mouse + touch) + spacebar keyboard alternative.

## Anchor Self-Review

| Anchor | Score | Notes |
|--------|-------|-------|
| **Graphics** | 4/5 | Ink wash on paper texture is atmospheric and screenshot-worthy. Multi-layer blooms create depth. Koi silhouettes are elegant. |
| **Sound** | 4/5 | Sparse water tones, user-initiated only. Gets richer with longer holds. Silence between interactions is intentional. |
| **Fun** | 4/5 | Meditative quality of watching ink bloom is compelling. Koi dodging adds life. Wanted to keep holding to see bigger blooms. |
| **Unique Style** | 4/5 | Distinctly Edo Woodblock — ukiyo-e ink wash, paper texture, koi silhouettes, mono no aware atmosphere. |

## Technical Notes

- File size: ~26KB (well under 2MB limit)
- No external dependencies — fully self-contained
- No runtime errors in headless Chromium verification
- Canvas 2D rendering, ~60fps expected on mid-range hardware
- DPR-aware canvas sizing for retina displays
