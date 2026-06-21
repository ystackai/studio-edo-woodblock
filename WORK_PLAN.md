# Kawanakajima Samurai — Autonomous Validation v3 Plan

**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v3`
**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v3`
**Date:** 2026-06-21

## Current State Assessment

### What is done
- **Samurai v6 asset:** Blender source + GLB export (612 KB, reduced from 1.23 MB v5). Key improvements: deepened mempo face mask (nose bridge, cheekbones, jawline), enhanced kuwagata crest with fukigaeshi ear guards, improved geta sandals (split toe, ankle thong, shin guard lacing), armor edge accent trims, fabric fold details. Visual review from contact sheet confirms readable samurai silhouette with helmet, armor, and proper proportions. Foundry provenance: job `asset-1782008767760-7-11`.
- **Browser proof:** Functional Three.js WebGL game with 20 samurai (10 Takeda, 10 Uesugi), 6 camera presets, charge/reform mechanics, audio toggle, click-to-inspect panel, review panel with contact sheet and hero image. Verified with `node verify.js` — BASIC STRUCTURE + ASSET CHECKS: PASS.
- **Audio:** 5 WAV files from Asset Foundry (battlefield loop, charge cue, clash accent, formation step, UI confirm), all file-backed and mirrored in Unity Resources.
- **Unity handoff:** `KawanakajimaRuntimeBootstrap.cs` with GLTFast integration, 38 MCP tools registered, Mac build produces 112 MB `.app`, Editor build hooks for WebGL and Linux.
- **Battlefield pack:** 6.55 MB GLB with 20 samurai, terrain (road, river, rice paddies, cedar hills). Foundry provenance: job `asset-1781935845583-91a9fdbe` (v3 fidelity pass).
- **Asset Foundry:** Healthz healthy; Blender provider configured.

### What is NOT done / blockers
1. **Samurai v6 not yet integrated into v3 branch.** The v6 asset exists on PR #174 but the v3 branch still has v5 assets. v3 needs the v6 GLB for the visual fidelity gate to pass.
2. **No PR for the v3 branch.** PR #167 is for a different branch (`v8` Unity loop). v3 needs its own PR targeting main.
3. **PR #174 deploy-preview failed.** The samurai v6 PR has a failing deploy-preview check — need to verify this resolves when cherry-picked onto v3 (likely environment-specific since v6 GLB is smaller than v5).
4. **Unity build artifact not committed.** The Mac build (.app) exists on the local Mac but is not in git. This is a handoff item — the build must be produced and committed.

### PR Status
- **PR #167** (`factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`): merge blocked by branch protection (needs write-access review), all CI checks passing (facts, ci, deploy-preview), REVIEW_REQUIRED.
- **PR #174** (`factoryx/factory-edo-woodblock/work-order-1782008767760-7-11`): samurai v6 asset, merge blocked by branch protection, deploy-preview FAILING, facts/ci passing.
- **v3 branch**: no PR created yet.

### Verdict
The deliverable is **not yet complete**. The samurai v6 asset is verified and ready for integration. The primary blocker is getting the v6 asset integrated into the v3 branch, creating a PR, and getting a human reviewer. The Unity build artifact needs to be produced and committed.

## Tickets

```yaml
tickets:
  - id: samurai-v6-integrate-into-v3
    title: Integrate samurai v6 asset into v3 branch (browser proof + Unity handoff)
    goal: >
      Cherry-pick samurai v6 GLB (612 KB) and Blender source from commit 7728416
      (PR #174) into this v3 branch. Replace `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb`
      and `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb`.
      Copy v6 Blender source, contact sheet, hero render, and turntable frames under
      `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260620-v6/`.
      Re-run `verify.js` and confirm the browser proof still loads 20 samurai without errors.
      Update `ASSET_MANIFEST.md` to reference v6 provenance.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: create-v3-pr-and-verify-deploy
    title: Create PR for v3 branch and verify deploy-preview passes
    goal: >
      Push the updated v3 branch (with samurai v6 integrated) to origin and create
      a PR targeting `main`. Include FactoryX Work Order Context section in PR body.
      Verify that deploy-preview check PASSES (PR #174 failed but v3 may differ since
      it won't have the extra metadata files PR #174 added). If deploy-preview fails,
      diagnose and fix the issue (file size, build script, path).
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - samurai-v6-integrate-into-v3

  - id: unity-build-and-commit-artifact
    title: Produce and commit Unity Mac build artifact
    goal: >
      Trigger Unity batchmode Mac build via the Mac-host MCP listener
      (http://host.docker.internal:27481/mcp, tool: `KawanakajimaUnityBuild.BuildMac`)
      and commit the resulting `.app` or archive under `unity/kawanakajima-samurai/Builds/`.
      Update `UNITY_BUILD_VERIFICATION.md` with build log, file size, and verification
      notes. The build should load samurai v6 assets and display the tableau.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - samurai-v6-integrate-into-v3

  - id: update-work-order-context-files
    title: Update FEEDBACK, PREVIEW, VERIFICATION, WORKLOG for v3
    goal: >
      Update all work order context files:
      - `FEEDBACK.md`: record samurai v6 visual review result (pass/fail with details)
      - `PREVIEW.md`: update preview URL and what the reviewer can interact with
      - `VERIFICATION.md`: document verify.js results, browser smoke test results,
        Unity handoff status, and any blockers
      - `WORKLOG.md`: timestamped summary of v3 plan and actions taken
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - samurai-v6-integrate-into-v3
```

## Notes

- The samurai v6 asset is the **critical path item** — without it, the visual fidelity gate remains failed.
- v6 GLB (612 KB) is actually **smaller** than v5 (1.23 MB), so deploy-preview should not be blocked by file size.
- PR #174's deploy-preview failure may be environment-specific (e.g., extra metadata files or build script issues on that branch). v3's simpler diff may pass.
- Unity build requires the Mac Editor — verify listener availability before attempting.
- After samurai v6 integration, verify: 20 samurai load, no JS errors, canvas nonblank, verify.js passes.
- Human reviewer needed for merge (branch protection). All CI checks can be green but merge still requires approval.
- If deploy-preview fails on v3 PR, investigate the CI logs and fix the root cause before marking the deliverable complete.
