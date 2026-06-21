# Kawanakajima Samurai Autonomous Validation v16 — Plan

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v16`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v16`
**Created:** 2026-06-21

## Assessment

This is a fresh validation run (v16). Previous iterations (v12–v15) produced useful assets and a coherent browser proof, but:

- v12 had toy-like samurai assets (capsule bodies, floating limbs, blocky proportions).
- v13 and v14 failed because the planner entered YAML validation loops.
- v15 committed a parseable plan but one worker ran on the stale v14 branch.

**Current state:** Browser proof exists with 20 samurai (Takeda red / Uesugi blue), file-backed audio, repeatable 6-camera inspection, charge/reform interaction. Unity source handoff exists with assets mirrored. Unity MCP listener is reachable at `http://host.docker.internal:27481/mcp` and the Kawanakajima scene is open. Asset Foundry is healthy.

**What's needed for v16:** Per the deliverable requirements, the first work must be a **pilot batch of exactly 4 fresh samurai assets** (2 Takeda/red + 2 Uesugi/blue) generated via Asset Foundry + Blender, saved to the v16 path. These must be independently visually gated before expanding to the full 20. Unity integration, audio/music, and PR/finalization come after.

No completed non-planner work orders exist for this deliverable yet. Every inherited asset, screenshot, and Unity build from v12–v15 remains PENDING for v16.

## Tickets

```yaml
tickets:
   - id: v16-pilot-asset-gen
    title: Generate pilot v16 samurai assets (4: 2 red + 2 blue)
    goal: >
      Call Asset Foundry to generate 4 fresh samurai models — 2 Takeda (red faction) and 2 Uesugi (blue faction).
      For each samurai save the Blender source (.blend), exported GLB, repeatable camera renders (front/side/rear/three-quarter/top),
      and a contact sheet under games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v16/pilot-4/.
      Record Foundry job IDs, asset provenance, and visual inspection notes. Never approve own visual gate.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
   - id: v16-pilot-visual-gate
    title: Independent visual gate on pilot v16 samurai
    goal: >
      Separately inspect the pilot contact sheets from v16-pilot-asset-gen. Verify each samurai reads as an upright human figure
      with correct anatomy (no floating limbs, no capsule bodies, no paddle feet, no cropped heads).
      Record pass/fail per samurai and overall gate result.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v16-pilot-asset-gen]
   - id: v16-unity-integration
    title: Unity MCP world integration with approved v16 assets
    goal: >
      Verify Unity MCP listener at http://host.docker.internal:27481/mcp. Load the Kawanakajima scene,
      insert the approved v16 samurai GLB(s) and battlefield pack, verify the 20-samurai tableau loads,
      and produce a playable scene screenshot or short video evidence. Document any blockers in UNITY_BLOCKER.md.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
   - id: v16-browser-proof-integration
    title: Integrate fresh v16 assets into browser proof
    goal: >
      Update games/kawanakajima-foundry-samurai-proof/index.html to use the v16 samurai GLB(s).
      Verify the browser proof opens without errors, loads 20 samurai, and all interactions (charge, reform, camera presets, audio, inspect) work.
      Run node verify.js and capture runtime evidence.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: [v16-pilot-asset-gen]
```

## Execution Order

1. **v16-pilot-asset-gen** runs first (no dependencies). Produces 4 samurai under v16 pilot path.
2. **v16-pilot-visual-gate** runs after pilot assets exist, independently inspects them.
3. **v16-unity-integration** can run in parallel with pilot generation or visual gate — it verifies Unity MCP and integrates assets.
4. **v16-browser-proof-integration** runs after pilot assets are available.
5. After pilot visual gate passes, plan the full 20-samurai generation as the next batch.
