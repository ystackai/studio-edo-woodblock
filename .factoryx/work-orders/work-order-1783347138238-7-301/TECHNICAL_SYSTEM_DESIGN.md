# Technical System Design

## Architecture

Keep the current single-game architecture:

- `games/ukiyo-e-printer/index.html` owns interaction state, canvas drawing,
  audio controls, and preview behavior.
- `games/ukiyo-e-printer/blocks-2d.js` remains unchanged for this pass.
- `drops/ukiyo-e-printer/index.html` remains the route shim.

## Implementation Shape

Add one small in-memory state variable for breath/wet-ink vapor. Decay it in
the existing render loop, increase it during patient holds and pressure-based
ink placement, draw a subtle vapor wisp near the baren, and include it in the
existing progress copy. Reset it with the rest of the print state.

## Verification Criteria

- `git diff --check` passes.
- `node -c games/ukiyo-e-printer/blocks-2d.js` remains green.
- The inline script extracted from `games/ukiyo-e-printer/index.html` passes
  `node -c`.
- FactoryX browser/runtime verification should still load the game, detect
  audio activity, and capture a nonblank post-interaction screenshot.

## Known Risks

- Canvas effects that are too opaque can obscure the print; keep the vapor
  subtle.
- Extra animation state must reset cleanly and decay over time.
- Accepted artifacts may still fail to count if the model judge times out;
  this is recorded as collection evidence, not a reason to inspect scores.

