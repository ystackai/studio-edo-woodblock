# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v17

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch HEAD:** `6331873` (planner: pilot-5 v21 planned, not executed)
**Created:** 2026-06-21

## Assessment

**Pilot-4 assets exist and are well-structured:** 4 samurai (2 Takeda + 2 Uesugi), each with GLB export, .blend source, 6 inspection views, hero render, contact sheet, and comprehensive ASSET_MANIFEST.md. All self-assessed as upright with grounded feet and distinct helmets — but this is self-assessment, not independent review.

**Pilot-4 has NEVER been independently visually gated.** Both visual-gate attempts (v17, v18) failed or were cancelled. Per deliverable requirements, pilot assets must be independently visually gated before any expansion. This is the immediate blocker.

**Pilot-5 generation failed twice** (v19, v20). Both agents wrote only /tmp fragments via heredocs — no repo-based Blender script, no Blender execution, no pilot-5 artifacts. The existing `generate-pilot4-samurai.py` (588 lines, working pipeline) proves the pipeline is functional when scripts are authored properly.

**Unity MCP** configured at `http://host.docker.internal:27481/mcp` — untested for this deliverable.
**Browser proof** (`index.html` + Three.js GLTFLoader) exists on branch — untested with v17 assets.

**Key blocker (resolved by this plan):** The recurring wedge is agents writing /tmp fragments instead of saving proper Python scripts to the repository. This plan gates pilot-4 first (the assets already exist), then attempts pilot-5 with a repo-based script approach.

**No PR** exists for the `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17` branch.

## Ready tickets (batch 1)

Gate pilot-4 (which already exists but is unapproved), then generate pilot-5 via a proper repo-based script, then gate pilot-5.

```yaml
tickets:
  - id: v17-pilot-visual-gate-v22
    title: Independent visual gate of pilot-4 samurai contact sheets
    goal: >
      Independently inspect the pilot-4 contact sheets and individual
      renders at games/kawanakajima-foundry-samurai-proof/assets/generated/
      foundry/samurai-v17/pilot-4/. Evaluate each samurai (takeda-01,
      takeda-02, uesugi-01, uesugi-02) against quality gates: upright pose,
      readable anatomy with connected limbs and feet, no detached limbs/props,
      no Minecraft/capsule proportions, no grey untextured primitives,
      distinct helmets and crests. Record pass/fail per samurai with
      observed flaws saved to the work order VERIFICATION.md. If all pass,
      approve promotion. If any fail, note specific flaws for pilot-5
      iteration.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
  - id: v17-pilot-asset-gen-v22
    title: Generate fresh pilot-5 samurai assets via repo-based Blender script
    goal: >
      Generate four new pilot samurai models (takeda-03, takeda-04,
      uesugi-03, uesugi-04) via a proper Blender Python script saved
      to the repository at
      games/kawanakajima-foundry-samurai-proof/generate-pilot5-samurai.py.
      Start from the existing generate-pilot4-samurai.py (588 lines,
      proven pipeline) and use small patch edits to create the v22
      script — do NOT write the script as a heredoc or /tmp fragment.
      Run with `blender --background --python`, produce GLB exports,
      .blend source files, 6 inspection view PNGs per samurai, a contact
      sheet, and hero render under
      games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
      samurai-v17/pilot-5/. Design each samurai with materially distinct
      helmets (not clones), grounded anatomy, and readable silhouettes.
      Record observed limitations in ASSET_MANIFEST.md but never self-approve
      the visual gate.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
  - id: v17-pilot-visual-gate-v23
    title: Independent visual gate of pilot-5 samurai contact sheets
    goal: >
      Independently inspect the pilot-5 contact sheets and individual
      renders at games/kawanakajima-foundry-samurai-proof/assets/generated/
      foundry/samurai-v17/pilot-5/. Evaluate each samurai (takeda-03,
      takeda-04, uesugi-03, uesugi-04) against quality gates: upright pose,
      readable anatomy with connected limbs and feet, no detached limbs/props,
      no Minecraft/capsule proportions, no grey untextured primitives,
      distinct helmets and crests. Record pass/fail per samurai with
      observed flaws saved to the work order VERIFICATION.md. If all pass
      and pilot-4 gate passed, approve both batches for full 20-samurai
      generation.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v17-pilot-asset-gen-v22]
```

## Future tickets (not yet ready)

The following will become ready once pilot assets are visually gated and approved:

- **Full 20-samurai generation** — 10 Takeda + 10 Uesugi from approved pilot design via Blender/Asset Foundry; 6 inspection views + contact sheet + manifest per samurai
- **Final visual gate** — independent review of all 20 samurai assets
- **Unity world integration** — load approved v17 assets into Unity scene via MCP; if listener unavailable, update source handoff with `UNITY_BLOCKER.md`
- **Browser proof integration** — wire approved v17 GLB assets into Three.js `index.html`, verify 20 samurai load and render
- **Audio/music verification** — confirm file-backed audio works in browser proof
- **PR/finalization** — after all evidence exists; include work order IDs, asset paths, pass/fail table

## Required sequence (reference)

1. ✅ Pilot assets generated (work-order-1782040253085-7-5, pilot-4)
2. ⏳ **Pilot-4 visual gate (v22)** — independent review of existing pilot-4 assets (unapproved)
3. ⏳ **Fresh pilot asset generation (v22)** — new pilot-5 assets, repo-based script (not heredocs)
4. ⏳ **Fresh pilot visual gate (v23)** — independent review of pilot-5 assets
5. ⏳ Full 20-samurai generation
6. ⏳ Final visual gate
7. ⏳ Unity world integration / browser proof / audio
8. ⏳ PR/finalization/merge
