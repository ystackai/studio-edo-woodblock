# Kawanakajima Samurai Autonomous Validation v2 — WORK PLAN

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v2`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v2`
**Status:** Not complete — Unity build blocked, browser proof reviewable
**Updated:** 2026-08-21

## Current State Assessment

### What's present and working
- **Browser proof** (`games/kawanakajima-foundry-samurai-proof/index.html`): Three.js WebGL scene with 20 samurai (10 Takeda/red, 10 Uesugi/blue), orbit/zoom controls, 6 named camera presets, charge/reform gameplay loop, file-backed audio (battlefield loop, charge/clash/step/confirm cues from Asset Foundry), review panel with contact sheet + hero image. VERIFICATION.json passes all structure/asset/size checks. Canvas is non-blank, no console errors on load.
- **Samurai asset upgraded:** `samurai_character.glb` replaced with v6 (3.0 MB, smooth-shaded + auto-smooth 45° on all 149 mesh objects). Reduces blocky/faceted appearance on armor plates while preserving geometry (108K verts, 138K faces). Source: Blender 3.4.1, work-order-1787277782713-8-5.
- **20-samurai battlefield pack:** 6.55 MB GLB from Asset Foundry v3 fidelity pass, 10 Takeda + 10 Uesugi on countryside battlefield.
- **Asset Foundry audio:** File-backed WAVs (battlefield_loop, charge, clash, step, confirm) from Foundry job.
- **Unity source handoff** (`unity/kawanakajima-samurai/`): Complete project with glTFast, Kawanakajima scene, runtime bootstrap, build hooks, copied assets.
- **ASSET_MANIFEST.md:** Updated with v6 provenance and integration details.
- **PR #167** (main validation branch v1): Already merged into `main` on 2026-06-28 with all CI checks green.

### What's blocked or incomplete
- **Unity build artifact:** No Unity build has been produced. The Mac-host Unity MCP listener (`http://host.docker.internal:27481/mcp`) is unreachable from this worker runtime (connection refused). This is the primary blocker.
- **Unity samurai v6 integration:** The Unity handoff still has the original samurai_character.glb, not v6.
- **No non-planner work orders** attached to deliverable `kawanakajima-samurai-autonomous-validation-20260621-v2`.

### Decision
This deliverable is **NOT complete**. Per the hard validation rule: "If the branch contains only this requirements file and a planner-created WORK_PLAN.md, the planner must create implementation or verification tickets. It must not write done: true."

The browser proof is reviewable and samurai assets are now on v6. The remaining blockers are: (1) Unity build production (needs Mac MCP listener), and (2) syncing v6 samurai into the Unity handoff.

## Tickets

```yaml
tickets:
  - id: unity-build-attempt
    title: Attempt Unity WebGL/Mac build via Mac MCP listener
    goal: >
      Connect to the Mac-host Unity MCP listener at
      http://host.docker.internal:27481/mcp (fallback: http://172.21.0.1:25666/mcp).
      Verify the Kawanakajima project loads, then produce a WebGL or Mac standalone
      build via the existing build methods (BuildMac or BuildWebGL). Capture build
      output and binary as evidence. If the listener is unreachable, fail fast and
      proceed to blocker documentation.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: unity-blocker-document
    title: Document Unity build blocker with remediation path
    goal: >
      If the Unity build attempt fails (listener unreachable or build error),
      produce a clear UNITY_BLOCKER.md entry documenting: (a) exact probe results
      and error output, (b) disk space status on worker and Mac hosts,
      (c) recommended next steps (e.g., provision a Mac with Unity Editor
      accessible from the worker network, or produce a WebGL build via another
      worker with Editor installed). Preserve the Unity source handoff as starting
      point for future runs.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - unity-build-attempt

  - id: unity-v6-sync
    title: Sync samurai v6 into Unity handoff
    goal: >
      Replace unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/
      samurai_character.glb with the v6 smooth-shaded version (samurai_character_v6.glb).
      Verify the Unity project still compiles and the bootstrap loads the samurai
      without errors.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: browser-proof-final-check
    title: Final browser proof verification
    goal: >
      Run node verify.js on games/kawanakajima-foundry-samurai-proof/ to confirm
      all checks pass with the v6 samurai asset. Verify all 6 screenshots are
      non-blank and show samurai silhouettes clearly. Update VERIFICATION.json
      with a current timestamp.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: open-pr
    title: Open or update PR from v2 branch to main
    goal: >
      Open or update PR from
      factoryx/kawanakajima-samurai-autonomous-validation-20260621-v2 to main
      with a FactoryX Work Order Context section including: work-order ID,
      implemented scope (browser proof + Unity handoff + samurai v6), preview
      path (games/kawanakajima-foundry-samurai-proof/index.html), verification
      output (VERIFICATION.json), known issues (Unity build blocked), and what
      still needs polish.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - unity-blocker-document
      - browser-proof-final-check
```
