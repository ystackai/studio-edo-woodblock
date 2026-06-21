# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v17

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch HEAD:** `4c428e0` (pilot-4 assets merged)
**Created:** 2026-06-21

## Assessment

**Pilot-4 assets are now on the canonical branch** (merged from v17.1 branch). Four samurai models were generated via Blender 3.4.1 via Asset Foundry: 2 Takeda (red-side) and 2 Uesugi (blue-side), each with GLB, .blend source, 6 inspection views, contact sheet, and hero render.

**Visual gate is pending** — no non-planner work order has yet independently inspected the pilot contact sheets. Per the autonomy rule, all inherited assets and prior v12–v16 evidence do not count as v17 completion proof until a fresh non-planner work order verifies them.

**Unity MCP is blocked** — the Mac-local listener is not reachable from this worker. Unity work is deferred until the listener becomes available or a source handoff is sufficient.

**No non-planner work orders** for this deliverable have been marked complete. The first ready ticket is the independent visual gate.

## Ready tickets (batch 1)

These are the next steps. The visual-gate ticket is explicitly separate from the asset-gen ticket (assets must not approve themselves).

```yaml
tickets:
  - id: v17-pilot-visual-gate
    title: Independent visual gate of pilot samurai contact sheets
    goal: >
      Inspect the pilot contact sheets and individual renders produced by
      work-order-1782040253085-7-5 (pilot-4). Evaluate each samurai against
      the quality gates: upright pose, readable anatomy, connected feet, no
      detached limbs/props, no Minecraft-like proportions, no grey
      untextured primitives, no slab banners, distinct helmets. Record
      pass/fail per samurai with observed flaws. If any fail, the asset-gen
      owner should iterate before the full 20-samurai batch proceeds. If all
      pass, approve promotion to full generation.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
  - id: v17-full-samurai-asset-gen
    title: Generate full 20-samurai set (10 Takeda + 10 Uesugi)
    goal: >
      Using the approved pilot-4 design as reference, generate 20 samurai
      models (10 Takeda/red-side, 10 Uesugi/blue-side) via Blender + Asset
      Foundry. Each samurai must have grounded pose, distinct helmet/crest,
      lamellar armor, katana, geta sandals, sashimono banner. Save GLB and
      .blend for each under
      `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/full-20/`.
      Render 6 inspection views + contact sheet per samurai. Record provenance
      in ASSET_MANIFEST.md.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v17-pilot-visual-gate]
  - id: v17-final-visual-gate
    title: Independent visual gate of all 20 samurai assets
    goal: >
      Inspect the full 20-samurai contact sheets and renders from
      `v17-full-samurai-asset-gen`. Verify per-samurai quality gates: upright
      pose, readable anatomy, connected feet, no detached limbs, no
      Minecraft proportions, distinct helmets/crests, no grey untextured
      primitives. Record pass/fail per samurai. All must pass before Unity
      or browser integration proceeds.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v17-full-samurai-asset-gen]
```

## Future tickets (not yet ready)

The following will become ready once the above tickets complete:

- **Unity world integration** — load approved v17 assets into Unity scene via MCP (blocked until Unity MCP listener is reachable); if unavailable, write source handoff with `UNITY_BLOCKER.md`
- **Browser proof integration** — wire approved v17 GLB assets into the Three.js `index.html`, verify 20 samurai load and render
- **Audio/music verification** — confirm file-backed WAVs play correctly in the browser proof
- **PR/finalization** — after all evidence exists; include work order IDs, asset paths, pass/fail table, and note any inherited files

## Required sequence (reference)

1. ✅ Pilot assets generated (work-order-1782040253085-7-5, merged)
2. ⏳ **Pilot visual gate** (this ticket — independent review of pilot contact sheets)
3. ⏳ Full 20-samurai generation (after pilot gate passes)
4. ⏳ Final visual gate (after full generation)
5. ⏳ Unity world integration / browser proof / audio (after final gate)
6. ⏳ PR/finalization/merge (after all evidence)
