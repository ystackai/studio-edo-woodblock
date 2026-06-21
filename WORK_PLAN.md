# Kawanakajima Samurai — Autonomous Validation v3 Plan

**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v3`
**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v3`
**Date:** 2026-06-21

## Current State Assessment

### What is done
- **Samurai assets:** Blender v5 source + GLB export, contact sheets, hero render. 1.23 MB GLB with kabuto, mempo, lamellar armor, sashimono banner.
- **Battlefield pack:** 6.55 MB GLB with 20 samurai, terrain (road, river, rice paddies, cedar hills).
- **Audio:** 5 WAV files from Asset Foundry (battlefield loop, charge cue, clash accent, formation step, UI confirm).
- **Browser proof:** Functional WebGL game (20 samurai, 6 camera presets, charge/reform mechanics, audio toggle, click-to-inspect panel).
- **Unity project:** Scene with bootstrap script, 38 MCP tools registered, Mac build produces 112MB `.app`.
- **Verification:** `verify.js` passes; browser smoke test shows 20 actors, CAPTURE_READY, nonblank canvas.

### What is NOT done / blockers
1. **Samurai visual fidelity gate failed.** PR #167 automated reviewer (work-order-1782003645103-7-8) marked: *"Visual realism gate remains failed: current samurai are runtime-reviewable but still read low-poly/capsule and need a Blender fidelity pass before calling them production-realistic."* The v5 Blender source exists but has not been verified as production-quality.
2. **Unity build artifact not committed to branch.** Build succeeds on the Mac but no `.app` is in the repo.
3. **PR #167 merge blocked by branch protection.** GitHub requires 1 approving review from a write-access reviewer (the PR author cannot self-approve).
4. **Unity scene root count is 1** (bootstrap only). Actors are instantiated at runtime — this is the intended design but means the scene itself doesn't visibly contain gameplay until play mode.

### Asset Foundry status
- Healthz: healthy. Blender provider configured, Blender 3.4.1 available locally.
- Unity MCP at `host.docker.internal:27481`: reachable, 38 tools, scene loaded and verified.

### Verdict
The deliverable is **not yet complete**. The samurai visual quality gate is the primary blocker. The browser proof and Unity source handoff are functional. Unity build is verified but not committed. Branch protection blocks merge.

## Tickets

```yaml
tickets:
  - id: samurai-fidelity-v6-blender
    title: Samurai fidelity v6 — Blender pass to pass visual quality gate
    goal: >
      Produce a Blender fidelity pass (v6) of the samurai character that resolves
      the low-poly/capsule read from v5. Key improvements: believable anatomy with
      proper head/neck/shoulder/hand/foot structure, body-following lamellar armor,
      realistic helmet with crest (kabuto/kuwagata), cloth folds on hakama/sode,
      visible hands/feet/sandals (tabi/geta), and faction-distinguishable sashimono
      banners. Produce GLB export (~1 MB target), 5-angle contact sheet (front,
      side, rear, three-quarter, top), hero render, and turntable frames 0–7.
      Save .blend source. Visual review pass/fail must be recorded before v6 is
      considered done.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: integrate-v6-into-browser-and-unity
    title: Integrate samurai v6 into browser proof and Unity project
    goal: >
      Replace the current samurai_character.glb with the v6 GLB in both the
      browser proof (games/kawanakajima-foundry-samurai-proof/) and Unity streaming
      assets (unity/kawanakajima-samurai/Assets/StreamingAssets/). Re-run browser
      verification (verify.js) and Unity scene inspection (MCP scene-get-data,
      gameobject-find for samurai actors) to confirm 20 actors load without errors.
      Capture new screenshots at all 6 camera presets.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - samurai-fidelity-v6-blender

  - id: unity-build-and-commit-artifact
    title: Produce and commit Unity build artifact
    goal: >
      Trigger a Unity batchmode Mac build via the MCP listener (KawanakajimaUnityBuild.BuildMac)
      and commit the resulting Build/Mac/KawanakajimaSamurai.app or its
      archive to the branch under unity/kawanakajima-samurai/Builds/. Update
      UNITY_BUILD_VERIFICATION.md with the new build log. Verify the build opens
      and displays the samurai tableau.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - samurai-fidelity-v6-blender

  - id: update-pr-167-and-verify
    title: Update PR #167 with v6 assets and re-verify
    goal: >
      Amend PR #167 with the v6 samurai GLB, updated browser proof, updated
      Unity build artifact, refreshed screenshots, and updated ASSET_MANIFEST.md.
      Re-run verify.js and browser smoke test. Update PR body with v6 status.
      The merge blocker (branch protection requiring write-access review) remains
      and is tracked separately — this ticket ensures the PR is production-ready
      from a content perspective.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - integrate-v6-into-browser-and-unity
      - unity-build-and-commit-artifact
```

## Notes

- The samurai fidelity pass (v6) is the **most important ticket**. Without it, the
  deliverable cannot be called production-quality regardless of how many other
  systems are working.
- The Asset Foundry Blender provider is confirmed healthy and Blender 3.4.1 is
  available locally. The fidelity pass should use the v5 .blend source as a
  starting point, focusing on anatomy realism, armor detail, and material quality.
- After v6 integration and build, the PR merge blocker (branch protection) may
  require a human reviewer or admin merge. This is a GitHub policy issue, not a
  content issue.
- The Unity scene uses runtime bootstrap (1 root GameObject) — actors are
  instantiated from the GLB at runtime. This is intentional and matches the
  browser proof approach.
