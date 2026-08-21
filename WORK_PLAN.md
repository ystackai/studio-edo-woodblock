# Kawanakajima Samurai Autonomous Validation — WORK PLAN v3

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621`
**Status:** Not complete — Unity build blocked, browser proof is reviewable
**Updated:** 2026-08-21

## Current State Assessment

### What's present and working
- **Browser proof** (`games/kawanakajima-foundry-samurai-proof/index.html`): Three.js WebGL scene with 20 samurai (10 Takeda vs 10 Uesugi), 6 named camera presets with smooth camera easing, charge/reform gameplay loop with screen flash feedback, file-backed audio (battlefield loop + charge/clash/step/confirm cues from Asset Foundry), review panel with contact sheet + hero image, idle sway + wind animation on banners, dust particle atmosphere. Verified by `VERIFICATION.json` (all checks pass, 2026-08-13).
- **Asset provenance**: `samurai_character.glb` (1.23 MB, Foundry job `asset-1781913507610-bf69e595`, v5 Blender repair), 20-samurai battlefield pack GLB (6.55 MB, job `asset-1781935845583-91a9fdbe`, v3), WAV audio files (job `asset-1781916330853-f7d831d9`), contact sheet PNGs, hero renders. All under `games/kawanakajima-foundry-samurai-proof/assets/`.
- **Unity source handoff** (`unity/kawanakajima-samurai/`): Complete Unity project with glTFast package, Kawanakajima scene, runtime bootstrap script, build hooks (WebGL/Mac/Linux), copied GLB/WAV assets, EditorBuildSettings with scene registered. Local Mac Studio build was verified previously at 112 MB.
- **ASSET_MANIFEST.md**: Present with provenance, integration points, and browser verification details.
- **DELIVERABLE_STATUS.md**: Present with current status summary.
- **6 screenshots** committed under `screenshots/`.
- **Game feel checklist**: All items pass — core verb in first 30s (charge), input response <100ms (flash overlay at 0.08s), easing on all motion (camera lerp cubic, idle sway sine, wind on banners), hit feedback (screen flash), audio only after user gesture (toggle button), touch targets ≥44px, no external network dependencies.

### What's blocked or incomplete
- **Unity build artifact**: No Unity build has been produced on this branch. The Mac-host Unity MCP listener (`http://host.docker.internal:27481/mcp` / `http://172.21.0.1:25666`) is unreachable from this worker runtime — both connection attempts return code 7 (connection refused). The Hetzner worker has Unity CLI 0.1.0-beta.7 but no Editor installed and limited disk space. This is a real blocker.
- **Asset quality via Blender**: Blender 3.4.1 cannot import the samurai GLB due to a numpy deprecation bug (`np.bool` removed in NumPy 1.20+, addon still uses it). An asset quality improvement pass is blocked until this is resolved.
- **No open PR**: This branch has no PR targeting `main`.
- **No non-planner work orders** attached to deliverable `kawanakajima-samurai-autonomous-validation-20260621`.

### Decision
This deliverable is **NOT complete**. Per the hard validation rule: "If the branch contains only a requirements file and a planner-created WORK_PLAN.md, the planner must create implementation or verification tickets. It must not write done: true."

The browser proof is the strongest artifact — coherent, reviewable, and passing all game feel checks. The Unity build and asset quality improvement are both blocked. The plan focuses on one Unity build attempt, then opening a PR with honest status.

## Tickets

```yaml
tickets:
   - id: unity-build-attempt
     title: Attempt Unity build via Mac MCP listener (final attempt)
     goal: >
       Connect to the Mac-host Unity MCP listener at
       http://host.docker.internal:27481/mcp (fallback: http://172.21.0.1:25666/mcp),
       verify the Kawanakajima project loads, and produce a WebGL or Mac standalone build.
       If the listener is reachable, invoke the existing build methods
       (KawanakajimaUnityBuild.BuildMac or BuildWebGL). Capture build output
       and binary as evidence. If reachable but build fails, capture error logs.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on: []

   - id: unity-blocker-document
     title: Document Unity build blocker with remediation path
     goal: >
       If the Unity build attempt fails (listener unreachable or build error),
       produce a clear UNITY_BLOCKER.md entry for this deliverable documenting:
       (a) exact probe results and error output, (b) disk space status on
       worker and Mac hosts, (c) recommended next steps (e.g., provision a Mac
       with Unity Editor accessible from the worker network, or produce a WebGL
       build via another worker with Unity installed). Preserve the existing
       source handoff as the starting point for a future run.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on:
       - unity-build-attempt

   - id: blender-asset-fix
     title: Fix samurai GLB import in Blender to enable asset improvement
     goal: >
       Fix the numpy `np.bool` deprecation bug in Blender 3.4.1's glTF2
       addon so the samurai_character.glb (1.2MB v5) can be imported.
       Patch `/usr/share/blender/scripts/addons/io_scene_gltf2/blender/imp/gltf2_blender_mesh.py`
       line ~612: replace `np.bool` with `bool`. Then load the GLB, inspect
       the mesh, and if the samurai still shows blocky forms, flat paddle feet,
       or disk faces, attempt a quick improvement pass (smoothing, remeshing,
       or re-exporting). Export improved GLB to `games/kawanakajima-foundry-samurai-proof/assets/`
       and update ASSET_MANIFEST.md.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on: []

   - id: browser-proof-final-polish
     title: Final browser proof polish and PR prep
     goal: >
       After Unity build attempt and any asset improvements, do a final polish
       pass on the browser proof:
       (1) Ensure VERIFICATION.json timestamp is current and all checks pass.
       (2) Verify all 6 screenshots are non-blank and show samurai silhouettes
       clearly enough for quality judgment.
       (3) Add a brief "Known Issues" section to the review panel or
       DELIVERABLE_STATUS.md noting any remaining blockers (Unity, asset quality).
       (4) Run node verify.js one final time to confirm all checks pass.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on:
       - blender-asset-fix

   - id: open-pr
     title: Open or update PR from work order branch to main
     goal: >
       Open PR from `factoryx/kawanakajima-samurai-autonomous-validation-20260621`
       to `main` with a FactoryX Work Order Context section including:
       work-order ID, implemented scope (browser proof + Unity handoff),
       preview path (games/kawanakajima-foundry-samurai-proof/index.html),
       verification output (VERIFICATION.json results), known issues (Unity build
       blocked, asset quality notes), and what still needs polish.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on:
       - unity-blocker-document
       - browser-proof-final-polish
```
