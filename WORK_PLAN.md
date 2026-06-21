# WORK_PLAN - Kawanakajima Samurai Autonomous Validation v17

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17`
**Updated:** 2026-06-21
**HEAD:** `49dc726` — v17 refresh HEAD reference

## Assessment

Pilot-4 and pilot-5 evidence is consolidated on this canonical validation branch and independently accepted.

**Completed non-planner evidence:**

- Pilot-4 assets: `takeda-01`, `takeda-02`, `uesugi-01`, `uesugi-02` — accepted (work-order-1782048326461-7-9)
- Pilot-5 assets: `takeda-03`, `takeda-04`, `uesugi-03`, `uesugi-04` — accepted (work-order-1782049526263-7-17)

**Known limitations from pilot gates (carry into full-20):**

| Issue | Status |
|-------|--------|
| Elongated leg proportions (stylized) | Acceptable at pilot scale; note for v18 |
| Solid-color materials (no PBR maps) | Acceptable at pilot scale; note for v18 |
| No rig/skeleton (transform-based anim) | Acceptable at pilot scale; note for v18 |
| Flat banner planes | Acceptable at pilot scale; note for v18 |
| Short katana blades | Acceptable at pilot scale; note for v18 |
| Shared body geometry, differentiated by crest+color | Acceptable at pilot scale; note for v18 |

**Cancellation summary:** The full-20 generation ticket (v17-full-20-samurai-gen-v1) and several planner runs were admin-cancelled. No new blockers have appeared — the path forward remains the same.

**Key insight:** The slow loop was caused by accepted evidence living only on work-order branches while the canonical branch looked stale. The pilot pipeline (Blender scripts `generate-pilot4-samurai.py` / `generate-pilot5-samurai.py`) is repo-based and working. The next lowest-waste action is full-20 generation from this approved pilot pipeline, followed by a separate independent visual gate.

## Next Tickets

```yaml
tickets:
  - id: v17-full-20-samurai-gen-v2
    title: Generate full 20-samurai asset set from approved pilot pipeline
    goal: >
      Generate the full v17 set of 20 samurai assets: 10 Takeda/red-side
      variants and 10 Uesugi/blue-side variants under
      games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
      samurai-v17/full-20/. Start from the approved repo-based Blender
      pilot scripts (generate-pilot4-samurai.py, generate-pilot5-samurai.py),
      extend the spec list to takeda-01..takeda-10 and uesugi-01..uesugi-10.
      Before launching Blender, run a cheap planned-ID check proving the script
      will produce exactly those 20 IDs with no stale pilot-only output paths.
      Produce GLB exports, .blend sources, repeatable front/side/rear/
      three-quarter/top renders, contact sheets, hero render,
      ASSET_MANIFEST.md, and work-order evidence. Prefer materially distinct
      body silhouettes between variants over shared-body-geometry. Record
      observed limitations in ASSET_MANIFEST.md but do not self-approve the
      visual gate.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
  - id: v17-full-20-visual-gate-v1
    title: Independent final visual gate for all 20 samurai
    goal: >
      Independently inspect the full-20 samurai contact sheets and individual
      renders from v17-full-20-samurai-gen-v2. Verify all 20 requested IDs are
      present, upright, grounded, anatomically readable, clothed/armored as
      samurai, free of detached limbs or props, not Minecraft/capsule-like, not
      grey placeholders, and materially distinct enough for the validation
      scope. Save a per-samurai pass/fail table, observed flaws, and promotion
      recommendation to VERIFICATION.md. If any fail, stop with specific fixes
      instead of promoting to Unity/browser work.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v17-full-20-samurai-gen-v2]
```

## Future Tickets Not Yet Ready

- Unity MCP world integration after the full-20 visual gate passes.
- Browser/Three.js proof integration with the approved full-20 assets.
- Music/audio generation or fresh verification.
- Final PR/finalization/merge only after all evidence exists.
