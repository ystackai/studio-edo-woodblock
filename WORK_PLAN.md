# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v17

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch HEAD:** `33b6965` (planner: pilot-4 visual gate + pilot-5 asset gen v22 + pilot-5 visual gate v23 planned)
**Created:** 2026-06-21

## Assessment

**Pilot-4 assets are complete and present:** 4 samurai (2 Takeda + 2 Uesugi) with GLB exports, .blend source files, 6 inspection views, hero render, contact sheet, and ASSET_MANIFEST.md under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-4/`. Total payload ~21 MB including all views.

**Critical blocker: pilot-4 has never been independently visually gated.** Two visual-gate attempts (v17, v22) both failed without producing reviewable evidence or PR artifacts. The v22 attempt "completed successfully but did not report a GitHub PR URL" — meaning the agent ran but failed to produce the expected deliverable.

**Pilot-5 generation has failed twice** (v19, v20, v22). All three agents wrote only `/tmp` fragments via heredocs with no repo-based Blender script, no Blender execution, and no pilot-5 artifacts. The existing `generate-pilot4-samurai.py` (573 lines, proven pipeline) proves the script approach works when authored correctly.

**Root cause of failures:**
1. Visual gate agents are not producing PR URLs or saved evidence files — need explicit output requirements.
2. Asset-gen agents are writing scripts as heredocs to `/tmp` instead of saving to the repo — need to start from the existing working script with patch edits.

**No open PR exists** for the `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17` branch.

**Unity MCP** at `http://host.docker.internal:27481/mcp` — untested for this deliverable.

## Updated tickets (batch 2)

Since both v22 visual gate and v22 asset-gen failed, new ticket IDs are needed. This batch focuses on getting pilot-4 visually gated first — if it passes, pilot-5 proceeds; if it fails, pilot-5 addresses the specific flaws.

```yaml
tickets:
   - id: v17-pilot-visual-gate-v23
     title: Independent visual gate of pilot-4 samurai contact sheets (retry)
     goal: >
       Independently inspect pilot-4 contact sheets and individual renders at
       games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
       samurai-v17/pilot-4/. Evaluate each samurai (takeda-01, takeda-02,
       uesugi-01, uesugi-02) against quality gates: upright pose, readable
       anatomy with connected limbs and feet, no detached limbs/props, no
       Minecraft/capsule proportions, no grey untextured primitives, distinct
       helmets and crests. Save pass/fail per samurai with observed flaws to
       .factoryx/work-orders/<your-work-order-id>/VERIFICATION.md and
       FEEDBACK.md. If any samurai fails, describe the specific flaw so the
       next ticket can fix it. MUST commit a PR URL or saved PR artifact to
       the work order context.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on: []
   - id: v17-pilot-asset-gen-v23
     title: Generate fresh pilot-5 samurai assets via repo-based Blender script
     goal: >
       Generate four new pilot samurai models (takeda-03, takeda-04,
       uesugi-03, uesugi-04) via a Blender Python script saved to the
       repository at
       games/kawanakajima-foundry-samurai-proof/generate-pilot5-samurai.py.
       Start from the existing generate-pilot4-samurai.py (573 lines, proven
       pipeline) and use small patch edits to create the v23 script.
       Run with blender --background --python, produce GLB exports, .blend
       source files, 6 inspection view PNGs per samurai, a contact sheet,
       and hero render under
       games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
       samurai-v17/pilot-5/. If pilot-4 gate failed, incorporate the
       specific flaw fixes from v17-pilot-visual-gate-v23 into this script.
       Record observed limitations in ASSET_MANIFEST.md but never self-approve
       the visual gate.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on: [v17-pilot-visual-gate-v23]
   - id: v17-pilot-visual-gate-v24
     title: Independent visual gate of pilot-5 samurai contact sheets
     goal: >
       Independently inspect the pilot-5 contact sheets and individual
       renders at games/kawanakajima-foundry-samurai-proof/assets/generated/
       foundry/samurai-v17/pilot-5/. Evaluate each samurai (takeda-03,
       takeda-04, uesugi-03, uesugi-04) against quality gates: upright pose,
       readable anatomy with connected limbs and feet, no detached limbs/props,
       no Minecraft/capsule proportions, no grey untextured primitives,
       distinct helmets and crests. Record pass/fail per samurai with
       observed flaws saved to the work order VERIFICATION.md.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on: [v17-pilot-asset-gen-v23]
```

## Future tickets (not yet ready)

The following will become ready once pilot assets are visually gated and approved:

- **Full 20-samurai generation** — 10 Takeda + 10 Uesugi from approved pilot design via Blender/Asset Foundry; 6 inspection views + contact sheet + manifest per samurai
- **Final visual gate** — independent review of all 20 samurai assets
- **Unity world integration** — load approved v17 assets into Unity scene via MCP; if listener unavailable, update source handoff with `UNITY_BLOCKER.md`
- **Browser proof integration** — wire approved v17 GLB assets into Three.js `index.html`, verify samurai load and render
- **Audio/music verification** — confirm file-backed audio works in browser proof
- **PR/finalization** — after all evidence exists; include work order IDs, asset paths, pass/fail table

## Required sequence (reference)

1. ✅ Pilot assets generated (work-order-1782040253085-7-5, pilot-4)
2. ⏳ **Pilot-4 visual gate (v23)** — independent review of existing pilot-4 assets
3. ⏳ **Fresh pilot asset generation (v23)** — new pilot-5 assets, repo-based script (not heredocs)
4. ⏳ **Fresh pilot visual gate (v24)** — independent review of pilot-5 assets
5. ⏳ Full 20-samurai generation
6. ⏳ Final visual gate
7. ⏳ Unity world integration / browser proof / audio
8. ⏳ PR/finalization/merge
