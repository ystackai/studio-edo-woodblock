# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v17

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch HEAD:** `ccff4a6` (planner: pilot-5 asset gen + visual gate v20 — both failed/cancelled)
**Created:** 2026-06-21

## Assessment

**pilot-4 assets exist** (2 Takeda + 2 Uesugi): GLB exports, .blend sources, 6 inspection views each, contact sheet, hero render, and ASSET_MANIFEST.md — all accepted by prior planner.

**pilot-4 assets are NOT approved.** Visual-gate attempts (v17-pilot-visual-gate, v17-pilot-visual-gate-v18) both failed. No independent review evidence exists for pilot-4 or pilot-5. Per deliverable requirements, pilot assets must be independently visually gated before promotion.

**pilot-5 generation failed twice** (v19, v20). Both agents wrote only /tmp fragments via heredocs — no repo-based Blender script, no Blender execution, no pilot-5 artifacts. The Asset Foundry Blender provider is healthy and reachable. The existing `generate-pilot4-samurai.py` (588 lines) on the branch proves the pipeline works when scripts are written properly.

**Unity MCP** configured at `http://host.docker.internal:27481/mcp` — untested for this deliverable.
**Browser proof** (`index.html` + Three.js GLTFLoader) exists on branch — untested with v17 assets.

**Key blocker:** The recurring wedge is agents writing /tmp fragments instead of saving proper Python scripts to the repository. This plan avoids that pattern by making script-based generation a hard requirement in the ticket.

**No PR** exists for the `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17` branch.

## Ready tickets (batch 1)

Break the wedge: generate pilot-5 assets via a proper repo-based Blender Python script (not heredocs), then gate them independently.

```yaml
tickets:
   - id: v17-pilot-asset-gen-v21
    title: Generate fresh pilot-5 samurai assets via repo-based Blender script
    goal: >
      Generate four new pilot samurai models (takeda-03, takeda-04,
      uesugi-03, uesugi-04) via a proper Blender Python script saved
      to the repository at
      games/kawanakajima-foundry-samurai-proof/generate-pilot5-samurai.py.
      The script must be written using patch edits (not heredocs), run
      with `blender --background --python`, produce GLB exports, .blend
      source files, 6 inspection view PNGs per samurai, a contact sheet,
      and hero render under
      games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
      samurai-v17/pilot-5/. Design each samurai with materially distinct
      helmets (not clones), grounded anatomy, readable silhouettes.
      Explicitly avoid: capsule/cylinder primitive bodies, detached limbs,
      floating feet, blocky Minecraft proportions, grey untextured
      placeholders. Record observations but never self-approve the
      visual gate.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
   - id: v17-pilot-visual-gate-v21
    title: Independent visual gate of pilot-5 samurai contact sheets
    goal: >
      Independently inspect the pilot-5 contact sheets and individual
      renders at games/kawanakajima-foundry-samurai-proof/assets/generated/
      foundry/samurai-v17/pilot-5/. Evaluate each samurai (takeda-03,
      takeda-04, uesugi-03, uesugi-04) against quality gates: upright pose,
      readable anatomy with connected limbs and feet, no detached limbs/props,
      no Minecraft/capsule proportions, no grey untextured primitives,
      distinct helmets and crests. Record pass/fail per samurai with
      observed flaws saved to the work order VERIFICATION.md. If all pass,
      approve promotion to full 20-samurai generation.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v17-pilot-asset-gen-v21]
```

## Future tickets (not yet ready)

The following will become ready once pilot-5 is generated and visually gated:

- **Full 20-samurai generation** — 10 Takeda + 10 Uesugi from approved pilot-5 design via Blender/Asset Foundry; 6 inspection views + contact sheet + manifest per samurai
- **Final visual gate** — independent review of all 20 samurai assets
- **Unity world integration** — load approved v17 assets into Unity scene via MCP; if listener unavailable, update source handoff with `UNITY_BLOCKER.md`
- **Browser proof integration** — wire approved v17 GLB assets into Three.js `index.html`, verify 20 samurai load and render
- **Audio/music verification** — confirm file-backed audio works in browser proof
- **PR/finalization** — after all evidence exists; include work order IDs, asset paths, pass/fail table

## Required sequence (reference)

1. ✅ Pilot assets generated (work-order-1782040253085-7-5, pilot-4)
2. ⏳ **Fresh pilot asset generation (v21)** — new pilot-5 assets, repo-based script (not heredocs)
3. ⏳ **Fresh pilot visual gate (v21)** — independent review of pilot-5 assets
4. ⏳ Full 20-samurai generation
5. ⏳ Final visual gate
6. ⏳ Unity world integration / browser proof / audio
7. ⏳ PR/finalization/merge
