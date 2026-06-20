# PREVIEW — work-order-1781940455825-6-1

**Deliverable:** Kawanakajima Samurai Unity Playable Build (guarded)

## Current Preview Entrypoint

Because Unity Editor / listener / space (1.1G free) / license are unavailable:

- **No Unity build artifact** exists.
- Preview for the **browser/Three.js proof** (using the exact same v3 Foundry assets):  
  `games/kawanakajima-foundry-samurai-proof/index.html`

Open that page → first viewport shows non-blank 3D Japanese countryside with 20 samurai (Takeda red + Uesugi blue-ish), camera frames the formation, drag/wheel controls, buttons for cameras + charge/reform + audio.

## Unity Path (when unblocked)

Once a worker can satisfy preflight:
- `unity/kawanakajima-samurai/Builds/WebGL/index.html` (or equivalent platform build)
- Plus `UNITY_BUILD_VERIFICATION.md` with Editor version, build log summary, and runtime evidence.

The `.factoryx/preview-entrypoint` currently points at the browser proof (preserved from pack integration).

## Verification Screenshots

See `.factoryx/work-orders/work-order-1781940455825-6-1/screenshots/` (if populated in this run) or sibling work-order screenshot dirs for contact/hero/formation/close views. All focal assets are the Foundry-authored GLBs; no replacement.

## Work Order Context Links

- Full goal + payload in the canonical PR body.
- **PR:** https://github.com/ystackai/studio-edo-woodblock/pull/163
- Blocker details: `UNITY_BLOCKER.md` (this dir)
- Verification: `VERIFICATION.md`
- Unity handoff: `unity/kawanakajima-samurai/`
- Browser proof + verify harness: `games/kawanakajima-foundry-samurai-proof/`
