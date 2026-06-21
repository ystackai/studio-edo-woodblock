# Kawanakajima Samurai Autonomous Validation v2 — WORK PLAN

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v2`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v2`
**Status:** Unity build attempt BLOCKED (MCP listener unreachable); remaining: browser-proof-polish, asset-quality-improvement, open-pr

## Current State Assessment

### What's present and working
- **Browser proof** (`games/kawanakajima-foundry-samurai-proof/index.html`): Three.js WebGL scene with 20 samurai (10 Takeda/red, 10 Uesugi/blue), orbit/zoom controls, 6 named camera presets (overview, red close, blue close, side, top, inspect), charge/reform gameplay loop, file-backed audio (battlefield loop, charge/clash/step/confirm cues from Asset Foundry), review panel with contact sheet + hero image. VERIFICATION.json passes all structure/asset/size checks. Canvas is non-blank, no console errors on load.
- **Asset provenance**: `samurai_character.glb` (1.28 MB, Foundry job `asset-1781913507610-bf69e595`), battlefield pack GLB (6.87 MB, job `asset-1781935845583-91a9fdbe`), WAV audio files (job `asset-1781916330853-f7d831d9`), contact sheet PNGs, hero renders. All under `games/kawanakajima-foundry-samurai-proof/assets/`.
- **Unity source handoff** (`unity/kawanakajima-samurai/`): Complete Unity project with glTFast package, Kawanakajima scene, runtime bootstrap script (546 lines), build hooks (81 lines), copied GLB/WAV assets, EditorBuildSettings with scene registered.
- **ASSET_MANIFEST.md**: Present with provenance, integration points, and browser verification details.

### What's blocked or incomplete
- **Unity build artifact**: No Unity build has been produced on this branch. The Asset Foundry is healthy and Blender is available locally, but the Unity MCP listener (Mac host) is unreachable from this worker runtime. The `unity` CLI (0.1.0-beta.7) is a wrapper — it requires a running Unity Editor to actually build.
- **Asset visual quality**: Vision review on the Foundry samurai flagged "blocky cubes, flat paddle feet, and disk face" — stylized but not production-ready. v5 was an improvement over earlier passes but still shows these artifacts in close-up renders.
- **No non-planner work orders** attached to deliverable `kawanakajima-samurai-autonomous-validation-20260621-v2`.
- **Missing screenshots directory** on this branch (present on v1 but not carried forward to v2).

### Decision
This deliverable is **NOT complete**. Per the hard validation rule: "If the branch contains only this requirements file and a planner-created WORK_PLAN.md, the planner must create implementation or verification tickets. It must not write done: true."

The immediate blocker is the Unity build. The next steps are:
1. Attempt one more time to reach the Mac Unity MCP listener for a build.
2. If that fails again, document the blocker permanently and focus on polishing the browser proof (adding screenshots, improving visual quality via Blender passes on the Foundry asset if possible).

## Tickets

```yaml
tickets:
  - id: unity-build-attempt
    title: Attempt Unity WebGL/Mac build via Mac MCP listener
    goal: >
      Connect to the Mac-host Unity MCP listener (http://host.docker.internal:27481/mcp
      or http://172.21.0.1:25666), verify the Kawanakajima project loads, and produce
      a WebGL or Mac standalone build. If the listener is reachable, run the
      FactoryX/Kawanakajima/Create Or Refresh Scene menu item followed by either
      BuildWebGL or BuildMac. Capture build output as evidence.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: unity-blocker-document
    title: Document Unity build blocker with remediation path
    goal: >
      If the Unity build attempt fails (listener unreachable), produce a clear
      UNITY_BLOCKER.md entry for this deliverable with: (a) exact error/probe results,
      (b) disk space status on worker and Mac hosts, (c) recommended next steps
      (e.g., provision a Mac with Unity Editor, or produce a WebGL build via another
      worker with Editor installed). This becomes the handoff artifact for a future
      run.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - unity-build-attempt

  - id: browser-proof-polish
    title: Polish browser proof — screenshots, audio verification, game feel
    goal: >
      On the browser proof at games/kawanakajima-foundry-samurai-proof/:
      (1) Generate and commit the screenshots directory with 6 repeatable camera
      captures (overview, redClose, blueClose, sideProfile, topFormation, assetInspect)
      that are non-blank and large enough for silhouette judgment.
      (2) Verify all game feel checklist items: core verb in first 30s, input
      response under 100ms, easing on motion, hit/score feedback, audio after user
      gesture, touch targets at least 44px.
      (3) Add any missing audio cues or visual feedback identified in the game feel
      checklist.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: asset-quality-improvement
    title: Improve samurai asset visual quality via Blender
    goal: >
      Use the locally available Blender 3.4.1 to inspect the Foundry GLB asset,
      identify the least convincing visible issues (blocky forms, paddle feet,
      flat helmet face), and produce an improved version if feasible. If the
      Foundry asset can be improved through Blender rework, export the improved
      GLB and update all integration points (browser proof, Unity handoff,
      ASSET_MANIFEST.md). Preserve source .blend and repeatable inspection renders.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - browser-proof-polish

  - id: open-pr
    title: Open or update PR from work order branch to main
    goal: >
      Once the Unity build artifact (or blocker documentation) and browser proof
      polish are complete, open or update PR #167 with a FactoryX Work Order Context
      section including the work order ID, implemented scope, preview path,
      verification output, known issues, and what still needs polish.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - unity-build-attempt
      - browser-proof-polish
      - asset-quality-improvement
```
