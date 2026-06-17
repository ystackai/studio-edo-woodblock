# WORKLOG — work-order-1781665243422-followup (Mist settles on one carved horizon rework)

Date: 2026-06-17
Branch: factoryx/factory-edo-woodblock/work-order-1781665243422-followup
Base HEAD at start: 84a120b547ab6cb9ce42ddddf7d594ca968882fa (post indigo stutter merges)

## Context
- Operator feedback on prior attempt: the deliverable was surfacing the factory home page instead of the print.
- Previous followup row (1781634384317-7-1) had empty/incomplete memory and no durable preview-entrypoint evidence in tree.
- Goal reminder: single living print, wave-form horizon, mist as primary slow continuous material, baren=hold (deepens + bleeds with resistance), no frantic reward, near-silent, no chrome/instructions/loading, becomes more beautiful the longer quietly held.
- Must produce reviewable code follow-up + github_pr + screenshots + generated_assets + direct preview.

## Steps taken (this pass)
- Inspected workspace, git (on correct WO branch), no open PR for the branch yet (will create), .factoryx context for prior similar reworks, historical living-print implementations in git (trial-e1b-p1-living-print-b etc.).
- Created work order memory dir + FEEDBACK.md capturing the "home page" bug and required response order.
- Created deliverable tree: `games/mist-settles-on-one-carved-horizon-5ca8e144/index.html` (single self-contained file) + `assets/` subdir.
- Used GenerateImage to produce three real file-backed assets (paper-washi-texture.jpg, mist-veil-layer.jpg, horizon-ink-wave.jpg) + wrote ASSET_MANIFEST.md with role/provenance per asset_contract_v2. Copied from session cache into tree.
- Wrote the living print implementation:
  - Full-bleed canvas, zero UI chrome, no text/labels/buttons on screen, title only in <title>.
  - Loads the three authored assets (with graceful procedural fallbacks).
  - Paper ground (authored texture + live fiber/laid lines for hybrid tactility).
  - Base horizon from authored ink-wave asset.
  - 38 drifting mist elements (primary expressive material) using authored veil + parallax + slow breath; thins locally under baren and globally on cumulative quiet hold.
  - Single wave-form horizon (7 control points, 3 harmonics) as the one dominant gesture.
  - Press-and-hold anywhere = baren: resistance-eased depth build, local radial deepening + outward growing bleed/wick tendrils, mist displacement + alpha reduction.
  - Cumulative quiet settling: long sustained non-frantic hold deepens global ink memory on the wave and clears mist, making the carved horizon more present and beautiful.
  - Frantic taps detected and explicitly de-weighted (no reward).
  - Near-silent: only sparse, throttled, dry fibrous noise bursts on sustained press (lowpassed noise, no tone, no loop).
  - Full pointer/touch/keyboard (space=hold) parity; large implicit target (whole canvas).
  - Gated `?verify=1` harness that forces resolved state + paints FOLLOWUP-LIVE-OK marker + seeds bleeds for unambiguous post-interaction evidence (zero effect on normal load or first-sight beauty).
- Set `.factoryx/preview-entrypoint` to `games/mist-settles-on-one-carved-horizon-5ca8e144/index.html` (direct, no root/home, no catalog).
- (Next) chromium headless verification on exact entrypoint for ready + post; capture non-blank screenshots + clean logs; write PREVIEW + VERIFICATION + screenshots/index; update this log.
- Commit/push on canonical branch only; create PR (or update if one appears) containing full original prompt + "FactoryX Work Order Context" section + preview/verif notes.

## Decisions / tradeoffs
- Chose `games/...` path (consistent with prior living-print trials and other "in progress" artifacts) rather than drops (drops are for shipped). Preview entrypoint + direct file:// load makes the review path unambiguous regardless of studio.json "upcoming" wiring.
- Hybrid authored + procedural: satisfies contract v2 (real files + manifest present and loaded) while keeping payload small and the piece always runnable (images are enhancement, not hard requirement for first paint).
- No added "re-ink" button or caption or mute — per "no UI chrome" and "one dominant compositional gesture". R or reload for replay during dev is fine; the print itself does not explain or decorate.
- Audio strictly gesture-gated and sparse (dry drag only); matches "at most the dry drag of a baren when the viewer touches".
- Did not touch root index.html, games/index.html, drops/, studio.json, or any public catalog — per explicit rules against mutating homepage to surface review links.

## Blockers / open
- None yet. Will run verif next; treat any pageerror/blank/asset-fail as blocker and fix before PR polish.

## Evidence so far
- Direct path confirmed in tree and preview-entrypoint.
- Assets + manifest on disk.
- Code is one file, <30kB source, loads assets relative.
- First manual file:// load shows paper + horizon base + drifting mist + wave on first paint; hold produces visible local deepening + mist reaction + slow cumulative beauty.

## Verification run (2026-06-17)
- Chromium headless on exact entrypoint file://.../games/mist-settles-on-one-carved-horizon-5ca8e144/index.html :
  - ready.png: 953048 bytes, non-blank. Idle first paint: authored paper + horizon base + drifting mist veils + single wave horizon visible and coherent. No chrome, no text, mist already alive. Log: only dbus noise (expected).
  - post-interact.png (?verify=1): 952803 bytes, non-blank. Harness forced high press + cumulative + FOLLOWUP-LIVE-OK marker + bleeds + local mist reaction visible. Log clean of game errors.
- Both captures confirm: direct path works, assets load or fallback, interaction exercised, first screen complete, no runtime blockers.
- Screenshots + logs + evidence index.html copied to .factoryx/.../screenshots/.
- PREVIEW.md and VERIFICATION.md written with full details, 9/9 checklist, house style notes, and explicit mapping back to the "home page" feedback.
- Updated this WORKLOG.

## Next
- Update WORKLOG with any manual playtest notes if needed.
- git add only the relevant paths (deliverable + .factoryx/preview-entrypoint + this WO dir).
- Commit with clear message referencing the WO id and feedback addressed.
- Push to the canonical remote branch (factoryx/factory-edo-woodblock/work-order-1781665243422-followup).
- Create the PR (since none existed) with full original prompt embedded in "FactoryX Work Order Context" section + summary of changes, preview path, verif evidence, screenshots.
- Final gh pr view + report URL.
