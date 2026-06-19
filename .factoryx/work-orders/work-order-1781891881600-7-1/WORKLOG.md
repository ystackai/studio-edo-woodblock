# WORKLOG — Discord Deliverable Kickoff: Pictures of the Floating World (work-order-1781891881600-7-1)

## 2026-06-19 start
- Inspected repo, current branch (factoryx/factory-edo-woodblock/work-order), PR #158 (open, CI green), existing kawanakajima (3D GLB viewer + clash), inkblade (2D slice), games structure, studio.json, prior work orders and their FEEDBACK/ASSET etc.
- Read primary playtest FEEDBACK (primitive box shapes on samurai GLBs; needs real modeled or mark blocked). Treated as blocking input.
- Confirmed no Blender/Asset Foundry/Unity MCP available (blocker).
- Read current WO context (mostly empty; screenshots dir only). Read relevant prior VERIF/PREVIEW for kawanakajima.
- Per instructions: addressed feedback before unrelated polish.

## Changes
- `scripts/generate-kawanakajima-glbs.js`:
  - Rewrote buildSamuraiMesh with significantly richer geometry: layered torso + tassets, segmented arms (upper/lower/hand), legs (thigh/shin/foot), detailed helmet + shikoro guards + crest mount, larger sode, belt/cord accents, improved weapons (crossbars, spikes, distinct blades), subtle per-id leans.
  - Added buildPropMesh + generation of 4 prop GLBs (lantern, stone, banner, rack) for mix of architecture/props/set dressing.
  - Re-ran generator; 24 GLBs now committed (tris ~420 for chars, small for props).
- `games/94-kawanakajima/index.html`:
  - Updated title, start prompt, stage hint, labels, footer to make "two prints in the courtyard", choose side, clash the instant clear as first experience (no extra explanation).
  - Added tatami floor lines + ink lantern silhouettes in stage band for courtyard dressing/atmosphere.
  - Enhanced clash: forward nudge on models + camera during encounter, post-clash verdict label.
  - Minor render tweak for clash push.
- Created/updated durable WO notes in `.factoryx/work-orders/work-order-1781891881600-7-1/`:
  - FEEDBACK.md (included playtest, how addressed, blocker).
  - ASSET_MANIFEST.md (24 assets, pipeline inspection, integration, provenance, blocker).
  - PREVIEW.md (entry, controls, what reviewer sees).
  - VERIFICATION.md (steps, checklist, limitations).
  - (WORKLOG.md this file)
- Preserved all prior working code (other drops, games/inkblade, verify harness, etc). Only touched kawanakajima as the active preview artifact.

## Next / polish (if budget remains)
- If time: wire one or two prop GLBs into the WebGL scene as actual placed objects (lantern left, stone right) for full file-backed set dressing.
- Capture fresh verification screenshots into this context and run harness.
- Update PR body with full current WO context + evidence.
- Re-run full verify.sh + any studio checks.

## Blockers / notes
- Unity vertical slice + Blender 19-asset request: unavailable in runtime → blocker recorded, browser equivalent delivered per playbook (browser-game-2d, taste-gate slice, file assets + manifest).
- Deadline 2026-06-20T09:57 — continue polishing until then or hard stop.

Work Order: work-order-1781891881600-7-1
