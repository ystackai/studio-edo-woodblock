# 20 Samurai Country Battle — WORK PLAN

**Deliverable:** `samurai-country-battle-20-20260621`
**Branch:** `factoryx/samurai-country-battle-20-20260621`
**Status:** In progress — Unity build evidence pending, samurai v6 not yet integrated
**Related PR:** https://github.com/ystackai/studio-edo-woodblock/pull/167 (OPEN, APPROVED with notes, merge blocked by branch protection)
**Last updated:** 2026-06-21

## Current State Assessment

### What is present and working
- **Samurai assets (v5 on deliverable branch, v6 available):**
  - Foundry samurai GLB (`samurai_character.glb`, 612 KB at v6, down from 1.3 MB at v5).
  - Blender source `.blend`, contact sheet (6 views), turntable (8 frames), and `ASSET_MANIFEST.md` at `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260620-v6/`.
  - v5 was previously integrated into Unity and browser proof; v6 has not been integrated into this branch yet.
- **20-samurai battlefield pack (Foundry, v3):**
  - `samurai_battlefield_pack.glb` (6.87 MB), manifest with 20 named warriors (10 Takeda / 10 Uesugi), contact sheet, 5 stable camera renders.
- **Browser proof:**
  - `games/kawanakajima-foundry-samurai-proof/index.html` — Three.js WebGL scene, 20 samurai, 6 camera presets, charge/reform/clash interaction, file-backed audio (5 WAV), review panel with contact sheet + hero render.
  - `node verify.js` passes all structure/asset/size checks.
  - `node browser-smoke-chromium.mjs` passes: CAPTURE_READY, 20 actors, nonblank canvas, no console errors.
- **Audio:**
  - Foundry WAVs (battlefield loop, charge, clash, formation step, UI confirm) under `assets/audio/` and `Resources/KawanakajimaAudio/` in Unity.
- **Unity handoff project:**
  - `unity/kawanakajima-samurai/` — complete project with glTFast, `KawanakajimaRuntimeBootstrap.cs` (builds world at Play Mode start), `KawanakajimaUnityBuild.cs` (Editor build hooks for WebGL/Linux/Mac).
  - `Kawanakajima.unity` scene registered in `EditorBuildSettings`.
- **Documentation:**
  - `ASSET_MANIFEST.md`, `DELIVERABLE_STATUS.md`, `VERIFICATION.json`, `UNITY_BLOCKER.md`, `WORKLOG.md`, `PREVIEW.md` all present in related work orders.

### What is missing / blocking completion
1. **Unity Mac build not committed or verified on this branch:**
   - The Mac worker produced a 112 MB `KawanakajimaSamurai.app` on a related branch, but it is not on `factoryx/samurai-country-battle-20-20260621`. The Unity MCP listener (`host.docker.internal:27481`) was reachable during the Mac-local run, but no build artifact exists on this branch.
2. **Samurai v6 not yet integrated:**
   - v6 (599 KB GLB, improved mempo face, helmet crest, geta sandals, armor details) exists on the worker branch (`factoryx/factory-edo-woodblock/work-order-1782008767760-7-11`) but needs to be integrated here: replace `samurai_character.glb`, update contact sheet, update Unity StreamingAssets, update `ASSET_MANIFEST.md`.
3. **PR #167 merge blocked by branch protection:**
   - Automated reviewer APPROVED. CI checks all green. Merge blocked by GitHub policy requiring 1 approving review from a write-access reviewer. This is external to the deliverable.

### Decision
The deliverable is **NOT complete** on this branch. The samurai v6 asset is a significant quality improvement over v5 and should be integrated. The Unity Mac build needs to be either produced on this branch or documented as blocked. Until those two items are addressed, the deliverable cannot be marked done.

## Tickets

```yaml
tickets:
  - id: integrate-samurai-v6-asset
    title: Integrate samurai v6 GLB into browser proof and Unity handoff
    goal: >
      Replace samurai_character.glb on this branch with the v6 export
      (599 KB, improved mempo, helmet crest, geta sandals, armor detail) from
      games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260620-v6/.
      Also replace samurai_character_contact_sheet.png with the v6 contact sheet.
      Update Unity StreamingAssets/Kawanakajima/samurai_character.glb.
      Update ASSET_MANIFEST.md with v6 provenance and verify the browser proof
      still loads correctly.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: unity-build-verification
    title: Produce or re-verify Unity Mac build with samurai v6
    goal: >
      Using the Mac Unity MCP listener at
      http://host.docker.internal:27481/mcp, integrate the v6 samurai GLB into
      the Unity project, run the scene in Play Mode to verify all 20 samurai
      load with correct meshes, and produce a new Mac build
      (Builds/Mac/KawanakajimaSamurai.app). Capture screenshots from multiple
      camera angles as evidence. If the listener is unreachable, document the
      blocker in UNITY_BLOCKER.md with exact error output.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - integrate-samurai-v6-asset

  - id: update-pr-167
    title: Update PR #167 with v6 assets and Unity build evidence
    goal: >
      After v6 integration and Unity build verification, push commits to this
      branch and update PR #167's body with: samurai v6 quality improvements,
      new Unity build artifact or blocker documentation, updated verification
      evidence, and current preview path. Ensure all CI checks still pass.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - unity-build-verification
```

## Remaining Blockers

| Blocker | Status | Impact |
|---------|--------|--------|
| Unity Mac build not on this branch | Needs production | Blocks deliverable completion |
| PR #167 merge blocked by branch protection | External | Blocks merge to main; doesn't block deliverable completion |
| Samuria v6 not yet integrated on this branch | Next ticket | Blocks quality bar for visual fidelity |
