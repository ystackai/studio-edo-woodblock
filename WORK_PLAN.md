# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v17

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch HEAD:** `c7265a1` (planner: fresh pilot asset gen + visual gate v19, cancelled)
**Created:** 2026-06-21

## Assessment

**Pilot-4 assets exist** on the canonical branch: 4 samurai models (2 Takeda + 2 Uesugi) with GLB exports, .blend sources, 6 inspection views each, contact sheet, hero render, and ASSET_MANIFEST.md. Assets show upright poses, grounded feet, and distinct helmet crests per the manifest.

**Visual gate attempts have failed twice** (`v17-pilot-visual-gate` failed with empty evidence, `v17-pilot-visual-gate-v18` cancelled by admin). No independent review evidence exists for pilot-4 assets. Per the deliverable requirements, pilot assets are not approved until a fresh visual-gate work order passes.

**Pilot-5 generation attempt (v19, work-order-1782044620776) was cancelled** because the agent runner only wrote `/tmp` fragments via heredocs — no repo Python script, no Blender run, no pilot-5 artifacts produced. The asset batch remains unapproved.

**Cycle pattern:** Asset generation succeeds → visual gate fails/cancels → repeated cancelled planner attempts. The pilot-4 assets are unapproved; fresh pilot-5 assets with tighter constraints are needed to break the cycle. Unity integration remains deferred until assets are visually gated.

**No PR** exists for the `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17` branch.

## Ready tickets (batch 1)

Generate fresh pilot-5 assets with explicit file-based constraints (no /tmp fragments), then gate them independently.

```yaml
tickets:
  - id: v17-pilot-asset-gen-v20
    title: Generate fresh pilot-5 samurai assets (2 Takeda + 2 Uesugi)
    goal: >
      Generate four new pilot samurai models (takeda-03, takeda-04,
      uesugi-03, uesugi-04) via a proper Blender Python script saved
      to the repository (not heredocs or /tmp fragments). Save GLB
      exports, .blend source files, 6 inspection views, contact sheet,
      hero render, and ASSET_MANIFEST.md under
      games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
      samurai-v17/pilot-5/. Explicitly avoid: capsule/cylinder primitive
      bodies, detached limbs, floating feet, blocky Minecraft proportions,
      and grey untextured placeholders. Record observations but never
      self-approve the visual gate.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
  - id: v17-pilot-visual-gate-v20
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
    depends_on: [v17-pilot-asset-gen-v20]
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
2. ⏳ **Fresh pilot asset generation (v20)** — new pilot-5 assets with tighter file-based constraints
3. ⏳ **Fresh pilot visual gate (v20)** — independent review of pilot-5 assets
4. ⏳ Full 20-samurai generation
5. ⏳ Final visual gate
6. ⏳ Unity world integration / browser proof / audio
7. ⏳ PR/finalization/merge
