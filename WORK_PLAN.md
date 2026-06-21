# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v17

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch HEAD:** `f21efb4` (planner: pilot-4 visual gate + pilot-5 asset gen v23 + pilot-5 visual gate v24 planned)
**Created:** 2026-06-21

## Assessment

**Pilot-4 assets are complete and present:** 4 samurai (2 Takeda + 2 Uesugi) with GLB exports, .blend source files, 6 inspection views, hero render, contact sheet, and ASSET_MANIFEST.md under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-4/`. Total payload ~21 MB. PR #178 is open for this evidence. PR review notes the output is "readable but stylized/toy-like, not realistic production quality."

**Critical blocker: pilot-4 has never been independently visually gated with a PR or saved verdict.** The v23 visual gate agent completed but failed to produce a PR URL or saved evidence — the exact same pattern as earlier visual gate attempts (v17, v22).

**Pilot-5 generation has failed three times** (v19, v20, v22). All agents wrote only `/tmp` fragments via heredocs with no repo-based Blender script and no pilot-5 artifacts. The existing `generate-pilot4-samurai.py` (588 lines, proven pipeline) demonstrates the correct approach: save script to repo, then run via `blender --background --python`.

**Root causes:**
1. Visual gate agents must save pass/fail verdict and observed flaws to VERIFICATION.md (and optionally open a PR). Evidence must be committed, not just console output.
2. Asset-gen agents must start from the existing working `generate-pilot4-samurai.py` and use small patch edits; must verify spec IDs are takeda-03/04, uesugi-03/04 before rendering; must run a syntax/dry-run before Blender execution.

No open PR exists for the `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17` branch's implementation tickets. PR #178 covers pilot-4 asset evidence only.

## Updated tickets (batch 3)

Since the v23 visual gate failed and v22 pilot-5 asset gen failed, new ticket IDs are needed. This batch re-runs the visual gate with explicit evidence requirements, then proceeds to pilot-5 generation from the proven script.

```yaml
tickets:
    - id: v17-pilot-visual-gate-v24
      title: Independent visual gate of pilot-4 samurai contact sheets (retry v24)
      goal: >
        Independently inspect pilot-4 contact sheets and individual renders at
        games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
        samurai-v17/pilot-4/. Evaluate each samurai (takeda-01, takeda-02,
        uesugi-01, uesugi-02) against quality gates: upright pose, readable
        anatomy with connected limbs and feet, no detached limbs/props, no
        Minecraft/capsule proportions, no grey untextured primitives, distinct
        helmets and crests. Save pass/fail per samurai with observed flaws to
        .factoryx/work-orders/<your-work-order-id>/VERIFICATION.md and
        FEEDBACK.md. MUST commit evidence files to the branch. If any samurai
        fails, describe the specific flaw for the next ticket to fix.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: []
    - id: v17-pilot-asset-gen-v24
      title: Generate fresh pilot-5 samurai assets via repo-based Blender script (retry)
      goal: >
        Generate four new pilot samurai models (takeda-03, takeda-04,
        uesugi-03, uesugi-04) by forking the existing
        generate-pilot4-samurai.py into a new
        games/kawanakajima-foundry-samurai-proof/generate-pilot5-samurai.py
        using small patch edits (not heredocs). Verify the spec list contains
        exactly takeda-03,takeda-04,uesugi-03,uesugi-04 with no stale pilot-4
        IDs before rendering. Run with `blender --background --python`, produce
        GLB exports, .blend source files, 6 inspection view PNGs per samurai, a
        contact sheet, and hero render under
        games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/
        samurai-v17/pilot-5/. Record observed limitations in ASSET_MANIFEST.md
        but never self-approve the visual gate.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: [v17-pilot-visual-gate-v24]
    - id: v17-pilot-visual-gate-v25
      title: Independent visual gate of pilot-5 samurai contact sheets (retry)
      goal: >
        Independently inspect the pilot-5 contact sheets and individual
        renders at games/kawanakajima-foundry-samurai-proof/assets/generated/
        foundry/samurai-v17/pilot-5/. Evaluate each samurai (takeda-03,
        takeda-04, uesugi-03, uesugi-04) against the same quality gates as
        pilot-4. Record pass/fail per samurai with observed flaws saved to the
        work order VERIFICATION.md. If pilot-4 gate found flaws, verify those
        specific issues are resolved in pilot-5.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: [v17-pilot-asset-gen-v24]
```

## Future tickets (not yet ready)

The following will become ready once pilot assets are visually gated and approved:

- **Full 20-samurai generation** — 10 Takeda + 10 Uesugi from approved pilot design via Blender/Asset Foundry; 6 inspection views + contact sheet + manifest per samurai
- **Final visual gate** — independent review of all 20 samurai assets
- **Unity world integration** — load approved v17 assets into Unity scene via MCP; if listener unavailable, update source handoff with `UNITY_BLOCKER.md`
- **Browser proof integration** — wire approved v17 GLB assets into Three.js `index.html`, verify samurai load and render
- **Audio/music verification** — confirm file-backed audio works in browser proof
- **PR/finalization** — after all evidence exists; include work order IDs, asset paths, pass/fail table, and what remains

## Required sequence (reference)

1. ✅ Pilot assets generated (work-order-1782040253085-7-5, pilot-4)
2. ⏳ **Pilot-4 visual gate (v24)** — independent review with saved VERIFICATION.md evidence
3. ⏳ **Fresh pilot asset gen (v24)** — new pilot-5 assets, repo-based script, spec-ID verification
4. ⏳ **Pilot-5 visual gate (v25)** — independent review of pilot-5 assets
5. ⏳ Full 20-samurai generation
6. ⏳ Final visual gate
7. ⏳ Unity world integration / browser proof / audio
8. ⏳ PR/finalization/merge
