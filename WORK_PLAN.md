# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v17

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch HEAD:** `7ea507e` (planner: plan next steps — pilot visual gate retry v18, cancelled)
**Created:** 2026-06-21

## Assessment

**Pilot-4 assets exist** on the canonical branch (merged from v17.1 branch): 4 samurai models (2 Takeda + 2 Uesugi) with GLB exports, .blend sources, 6 inspection views each, contact sheet, and hero render. Asset manifest and self-inspection notes are present. Assets show upright poses, grounded feet, and distinct helmet crests.

**Visual gate attempts have failed/cancelled twice** (`v17-pilot-visual-gate` failed with empty evidence, `v17-pilot-visual-gate-v18` cancelled). No independent review evidence exists for pilot-4 assets. Per the deliverable requirements, pilot assets are not approved until a fresh visual-gate work order passes.

**No non-planner work orders marked `done`** since `created_at_ms` (1782040054861) except the pilot asset generation (`work-order-1782040253085-7-5`). All subsequent planner runs were cancelled. Per the autonomy rule, no inherited files or older evidence count as v17 completion proof.

**Pattern detected:** Asset generation succeeds -> visual gate fails/cancels -> repeated cancelled planner attempts. The previous asset batch is unapproved. A fresh asset iteration is needed to break this cycle before any visual gate.

**Unity MCP:** Source handoff exists at `unity/kawanakajima-samurai/`. Unity integration deferred until assets are visually gated.

**No PR** exists for the `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17` branch.

## Ready tickets (batch 1)

A fresh pilot asset iteration is needed. Pilot-4 assets are unapproved; two visual gate attempts failed. Generate new pilot variants with improved detail, then gate them independently.

```yaml
tickets:
    - id: v17-pilot-asset-gen-v19
      title: Generate fresh pilot-5 samurai assets (2 Takeda + 2 Uesugi)
      goal: >
        Generate four new pilot samurai models (takeda-03, takeda-04,
        uesugi-03, uesugi-04) via Blender procedural generation with
        improved armor detail, distinct helmet crests, and grounded pose.
        Save GLB and .blend source for each under
        games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
        samurai-v17/pilot-5/. Render 6 inspection views + contact sheet
        per samurai. Record observations but never self-approve the visual gate.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: []
    - id: v17-pilot-visual-gate-v19
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
      depends_on: [v17-pilot-asset-gen-v19]
```

## Future tickets (not yet ready)

The following will become ready once the above tickets complete:

- **Full 20-samurai generation** — 10 Takeda + 10 Uesugi from approved pilot-5 design via Blender/Asset Foundry; 6 inspection views + contact sheet + manifest per samurai
- **Final visual gate** — independent review of all 20 samurai assets
- **Unity world integration** — load approved v17 assets into Unity scene via MCP; if listener unavailable, update source handoff with `UNITY_BLOCKER.md`
- **Browser proof integration** — wire approved v17 GLB assets into Three.js `index.html`, verify 20 samurai load and render
- **Audio/music verification** — confirm file-backed audio works in browser proof
- **PR/finalization** — after all evidence exists; include work order IDs, asset paths, pass/fail table

## Required sequence (reference)

1. ✅ Pilot assets generated (work-order-1782040253085-7-5)
2. ✅ Pilot visual gate (cancelled — no evidence)
3. ✅ Planner retries (cancelled — stale)
4. ⏳ **Fresh pilot asset generation (v19)** — new assets to break the gate failure cycle
5. ⏳ **Fresh pilot visual gate (v19)** — independent review of new assets
6. ⏳ Full 20-samurai generation
7. ⏳ Final visual gate
8. ⏳ Unity world integration / browser proof / audio
9. ⏳ PR/finalization/merge
