# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v17

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch HEAD:** `2205d02` (planner-8: visual gate retry)
**Created:** 2026-06-21

## Assessment

**Pilot-4 assets are on the canonical branch** (merged from v17.1 branch). Four samurai models exist via Blender 3.4.1: 2 Takeda (red-side) and 2 Uesugi (blue-side), each with GLB, .blend source, 6 inspection views, contact sheet, and hero render. The assets show upright poses, grounded feet, no detached limbs, and distinct helmet crests.

**Previous visual gate failed** — work-order-1782041782494-7-9 (`v17-pilot-visual-gate`) produced empty evidence and was marked `failed`. The assets themselves appear structurally sound (no floating limbs, capsule anatomy, or slab banners), so a fresh visual gate attempt is warranted. The failure was likely a worker/runtime issue, not an asset-quality issue.

**No non-planner work orders** for this deliverable have been marked complete since `created_at_ms` except the asset gen. Per the autonomy rule, all inherited files and v12–v16 evidence do not count as v17 completion proof until fresh non-planner work orders verify them.

**Unity MCP is blocked** — the Mac-local listener is not reachable from this worker. Unity work is deferred until the listener becomes available or a source handoff is sufficient.

**No PR exists** for the `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17` branch.

## Ready tickets (batch 1)

A fresh visual gate is needed because the prior attempt failed with no evidence. Assets are available and look structurally sound.

```yaml
tickets:
  - id: v17-pilot-visual-gate-v18
    title: Independent visual gate of pilot samurai contact sheets (v18 retry)
    goal: >
      Independently inspect the pilot-4 contact sheets and individual renders
      at games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
      samurai-v17/pilot-4/. Evaluate each samurai (takeda-01, takeda-02,
      uesugi-01, uesugi-02) against quality gates: upright pose, readable
      anatomy with connected limbs and feet, no detached limbs/props, no
      Minecraft/capsule proportions, no grey untextured primitives, distinct
      helmets and crests. Record pass/fail per samurai with observed flaws
      saved to the work order VERIFICATION.md. If any fail, the asset-gen
      owner should iterate. If all pass, approve promotion to full 20-samurai
      generation.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
  - id: v17-full-samurai-asset-gen-v18
    title: Generate full 20-samurai set (10 Takeda + 10 Uesugi)
    goal: >
      Using the approved pilot-4 design as reference, generate 20 samurai
      models (10 Takeda/red-side, 10 Uesugi/blue-side) via Blender + Asset
      Foundry. Each samurai must have grounded pose, distinct helmet/crest,
      lamellar armor, katana, geta sandals, and sashimono banner. Save GLB
      and .blend for each under
      games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
      samurai-v17/full-20/. Render 6 inspection views + contact sheet per
      samurai and record provenance in ASSET_MANIFEST.md.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v17-pilot-visual-gate-v18]
  - id: v17-final-visual-gate-v18
    title: Independent visual gate of all 20 samurai assets
    goal: >
      Inspect the full 20-samurai contact sheets and renders from
      v17-full-samurai-asset-gen-v18 at
      games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
      samurai-v17/full-20/. Verify per-samurai quality gates: upright pose,
      readable anatomy, connected feet, no detached limbs, no Minecraft
      proportions, distinct helmets/crests, no grey untextured primitives, no
      cloned variants. Record pass/fail per samurai in VERIFICATION.md. All
      must pass before Unity or browser integration proceeds.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v17-full-samurai-asset-gen-v18]
```

## Future tickets (not yet ready)

The following will become ready once the above tickets complete:

- **Unity world integration** — load approved v17 assets into Unity scene via MCP (blocked until Unity MCP listener is reachable); if unavailable, write source handoff with `UNITY_BLOCKER.md`
- **Browser proof integration** — wire approved v17 GLB assets into the Three.js `index.html`, verify 20 samurai load and render
- **Audio/music verification** — confirm file-backed WAVs play correctly in the browser proof
- **PR/finalization** — after all evidence exists; include work order IDs, asset paths, pass/fail table, and note any inherited files

## Required sequence (reference)

1. ✅ Pilot assets generated (work-order-1782040253085-7-5, merged)
2. ⏳ **Pilot visual gate v18** — fresh independent review (this ticket, retry)
3. ⏳ Full 20-samurai generation (after pilot gate passes)
4. ⏳ Final visual gate (after full generation)
5. ⏳ Unity world integration / browser proof / audio (after final gate)
6. ⏳ PR/finalization/merge (after all evidence)
