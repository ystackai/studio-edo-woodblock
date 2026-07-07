# Preview — Drifting River Prints

## Overview
Compose fleeting ukiyo-e river scenes by dragging drifting koi and waterweed onto a blank scroll. When elements align with the flow, they lock into place with a satisfying snap.

## How to Play
1. **Touch/click the scroll** to begin — pieces drift in from the edges
2. **Drag pieces** (koi, waterweed, wave crests) toward their dashed-outline target positions
3. **Release near the target** — if within range, the piece locks with a wooden clack and subtle screen shake
4. **Complete all 5 pieces** to see the full composition, then the temple bell sounds and the scene dissolves
5. **Touch again** to compose a new print

## Preview
- **Root:** `drops/drift-river-prints/index.html`
- **Entry:** `.factoryx/preview-entrypoint` → `drops/drift-river-prints/index.html`
- **PR:** #202

## Fix Applied
- Added missing `screen-shake.js` (FoundryShake module) — resolved `ReferenceError: FoundryShake is not defined`
