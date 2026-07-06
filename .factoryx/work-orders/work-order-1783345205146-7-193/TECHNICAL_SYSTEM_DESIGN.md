# Technical System Design

## Architecture

Keep the current single-game architecture:

- `games/ukiyo-e-printer/index.html` owns the interaction loop, UI, audio
  controls, canvas orchestration, and preview behavior.
- `games/ukiyo-e-printer/blocks-2d.js` owns reusable visual blocks.
- `drops/ukiyo-e-printer/index.html` remains a route shim to the game.
- `.factoryx/preview-entrypoint` should continue to point at the game path.

The implementation Work Order should make bounded changes in these existing
files, then update Work Order notes and verification evidence.

## Data And State

Use the existing in-memory game state for pressure, ink, print progress, audio
activity, and block rendering. If new state is needed, keep it local to the
ukiyo-e printer game and name it around the player-visible craft behavior, for
example pressure, grain, ink density, or paper memory.

## Integration Contracts

- Browser runtime verification must load the game entrypoint without page
  errors.
- The route shim must continue to send users from `drops/ukiyo-e-printer/` to
  `games/ukiyo-e-printer/`.
- Audio should remain user-gesture gated and should not throw if unavailable.
- Any asset or rendering provenance updates should be recorded in the Work
  Order context.

## Rollout Plan

1. Inspect the current game entrypoint and block module narrowly.
2. Apply one targeted polish pass to baren pressure, ink/paper response, sound
   feedback, or visible progression.
3. Run syntax checks for touched JavaScript.
4. Run the browser/runtime verification path or the closest local equivalent.
5. Update Work Order notes with scope, verification, and preview instructions.
6. Commit and push the canonical branch for FactoryX review.

## Verification Criteria

- `node -c games/ukiyo-e-printer/blocks-2d.js` passes if that file is touched.
- The inline game script syntax is checked if `index.html` script changes.
- Browser runtime verification reaches the active game without uncaught errors.
- A screenshot or preview note demonstrates the print responding to patient
  interaction.
- `git diff --check` passes before commit.

## Known Risks

- The current GitHub PR was closed because GitHub-side review/CI blocked merge;
  the implementation should rely on FactoryX local preview verification as the
  primary closeout signal unless CI failures are directly caused by touched
  code.
- Broad rewrites can regress the already accepted runtime path.
- Audio and canvas behavior can fail silently if new code assumes unavailable
  browser APIs; guard those paths.
