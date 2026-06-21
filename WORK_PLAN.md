# WORK_PLAN — Kawanakajima Samurai Autonomous Validation v17

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v17`
**Branch HEAD:** `1004cb9` (planner seed commit)
**Created:** 2026-06-21

## Assessment

This is a fresh validation attempt (v17). No non-planner work orders have been completed on this branch. The branch contains inherited assets and scripts from v12–v16 iterations (samurai_character.glb v5, 20-samurai battlefield pack, audio files, Unity handoff), but per the autonomy rule these do not count as v17 completion proof.

Previous parallel v17 worker attempts generated pilot assets on separate branches (`8cdcb5c`, `c5b45e5`) but those were never pushed to the canonical branch; those commits are visible in repo history but not on this branch.

**Current state:**
- Asset Foundry: healthy, Blender 3.4.1 available at `/usr/bin/blender`
- Unity MCP listener: not reachable from this worker — Unity work is blocked (documented in `UNITY_BLOCKER.md`)
- Browser proof: exists from v16 but assets are inherited, not v17-proof
- No non-planner work orders committed on this branch yet

**Next action:** Follow the required sequence — pilot asset generation (4 samurai), independent visual gate, then full 20-samurai set. Unity integration waits until assets pass visual gate.

## Ready tickets (batch 1)

These are the first independent tickets to kick off v17. The visual-gate ticket is explicitly separate from the asset-gen ticket (assets must not approve themselves).

```yaml
tickets:
    - id: v17-pilot-samurai-asset-gen
      title: Generate four pilot samurai assets (2 Takeda + 2 Uesugi)
      goal: >
        Use the Asset Foundry Blender provider to generate four pilot samurai
        models (2 Takeda/red-side, 2 Uesugi/blue-side) with grounded anatomy,
        readable silhouettes, and no v12-style defects (capsule bodies,
        detached limbs, slab banners). Save each as GLB plus Blender source
        under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-4/`.
        Render six repeatable inspection views (front, side, rear, two
        three-quarter, top) and a contact sheet. Record an ASSET_MANIFEST.md
        with provenance, sizes, integration points, and visual inspection
        notes (without self-approval).
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: []
    - id: v17-pilot-visual-gate
      title: Independent visual gate of pilot samurai contact sheets
      goal: >
        Inspect the pilot contact sheets and individual renders produced by
        `v17-pilot-samurai-asset-gen`. Evaluate each samurai on the quality
        gates: upright pose, readable anatomy, connected feet, no detached
        limbs/props, no Minecraft-like proportions, no grey untextured
        primitives. Record pass/fail per samurai with observed flaws. If any
        fail, the asset-gen ticket owner should iterate before the full
        20-samurai batch proceeds. If all pass, approve promotion to full
        generation.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: [v17-pilot-samurai-asset-gen]
```

## Future tickets (not yet ready)

The following will become ready once the above tickets complete:

- **Full 20-samurai generation** — 10 Takeda + 10 Uesugi from approved pilot design
- **Final visual gate** — independent inspection of all 20 samurai
- **Unity world integration** — blocked until pilot assets are approved; requires Unity MCP listener
- **Browser proof integration** — wire approved v17 assets into the Three.js proof
- **Audio/music verification** — confirm file-backed WAVs work in the proof
- **PR/finalization** — after all evidence exists
