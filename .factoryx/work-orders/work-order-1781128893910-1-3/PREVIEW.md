# Preview — Quiet Opening

**Preview entrypoint:** `.factoryx/preview-entrypoint` → `games/quiet-opening/index.html`

**Path:** `games/quiet-opening/`

## What you see

A single canvas fills the screen: a lone pine stands on the edge of a sea cliff, partially obscured by drifting fog. The paper-textured background carries the piece. No start button, no tutorial — the opening IS the experience.

## Interaction

- **Mouse / touch drift** — gently move the cursor across the fog. Fog parts subtly around your pointer, revealing more of the cliff and pine.
- **Stillness** — hold still and the fog slowly reforms. The piece is as much about not touching as about touching.

## Technical

- Single self-contained `index.html` (~11 KB), no external dependencies
- Canvas-based rendering: paper grain, cliff silhouette, pine with wind sway, fog layers, distant mountains, one tiny bird
- 60fps target; all motion uses sine-based easing
- Fog parting is velocity-aware — faster mouse movement pushes more fog aside
- Touch and mouse both supported
