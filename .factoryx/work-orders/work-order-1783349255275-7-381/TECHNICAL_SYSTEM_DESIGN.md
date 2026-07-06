# Technical System Design

## Architecture

Keep the existing single-file interaction architecture:

- `games/ukiyo-e-printer/index.html` owns the pressure state, canvas drawing,
  copy, and audio hooks.
- `games/ukiyo-e-printer/blocks-2d.js` remains unchanged.
- The existing drop route and preview entrypoint remain unchanged.

## Implementation Shape

Add a small `fiberLift` pressure state. It decays in the render loop, rises
during patient holds and resisted pointer travel, renders as subtle paper-fiber
curves near the baren, appears in the progress copy when active, and resets
with the rest of the print state.

## Verification Criteria

- `git diff --check` passes.
- The inline script extracted from `games/ukiyo-e-printer/index.html` passes
  `node -c`.
- `node -c games/ukiyo-e-printer/blocks-2d.js` remains green.
- FactoryX browser/runtime verification should still publish the same preview
  path, detect audio activity, and capture a nonblank post-interaction canvas.

## Known Risks

- The fiber marks must stay subtle enough not to obscure the print.
- Extra animation state must decay and reset cleanly.
- The accepted artifact may still fail to increment Seed A/B if the model
  judge times out; that remains collection evidence, not a reason to peek.
