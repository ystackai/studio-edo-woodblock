# 20 Samurai Country Battle — WORK PLAN

**Deliverable:** `samurai-country-battle-20-20260621`
**Branch:** `factoryx/samurai-country-battle-20-20260621`
**Status:** In progress — Unity Mac build artifact not committed; deliverable blocked on external build
**Related PR:** https://github.com/ystackai/studio-edo-woodblock/pull/167 (OPEN, APPROVED, merge blocked by branch protection — needs human reviewer)
**Last updated:** 2026-06-21

## Current State Assessment

### What is present and working on this branch

- **Samurai character asset (v5):**
   - `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` (1.29 MB, Foundry Blender v5 with lamellar armor, kabuto helmet, katana)
   - Unity StreamingAssets copy: `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb` (2.74 MB)
   - Contact sheet and hero render: `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_contact_sheet.png`, `samurai_character_hero.png`

- **20-samurai battlefield pack (v3, Foundry):**
   - `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` (6.87 MB)
   - Manifest with 20 named warriors (10 Takeda / 10 Uesugi)

- **Browser proof (Three.js WebGL):**
   - `games/kawanakajima-foundry-samurai-proof/index.html` — 20 samurai, 6 camera presets, charge/reform/clash interaction, 5 WAV audio tracks, review panel with contact sheet + hero render
   - `node verify.js` passes all structure/asset/size checks
   - `node browser-smoke-chromium.mjs` passes: CAPTURE_READY, 20 actors, nonblank canvas, no console errors

- **Audio:**
   - 5 Foundry WAVs: `battlefield_loop.wav` (2.53 MB), `charge_cue.wav`, `clash_accent.wav`, `formation_step.wav`, `ui_confirm.wav`
   - Integrated in browser proof and Unity `Resources/KawanakajimaAudio/`

- **Unity handoff project:**
   - `unity/kawanakajima-samurai/` — complete project with glTFast, `KawanakajimaRuntimeBootstrap.cs` (builds world at Play Mode start, 20 actors, charge/reform/clash mechanics, 6 camera presets, audio toggle), `KawanakajimaUnityBuild.cs` (Editor build hooks)
   - `Kawanakajima.unity` scene registered in `EditorBuildSettings`

- **Mac build evidence (local Mac only):**
   - `UNITY_BUILD_VERIFICATION.md` documents a successful Mac build (112 MB `.app`) produced on local Mac Studio with Unity 2023.2.20f1
   - Unity MCP plugin verified, scene load verified, 38 MCP tools available
   - **Build artifact NOT committed to this branch** — only documentation evidence exists

### What is missing / blocking completion

1. **Unity Mac build artifact not committed:** The 112 MB `KawanakajimaSamurai.app` exists on the Mac worker's local filesystem but was never pushed to this branch. Without a build artifact, the deliverable cannot be verified as truly complete. This requires either:
   - An agent with Mac access to commit the build artifact (via git LFS or subrepo), or
   - Re-producing the build on the Mac worker and committing it

2. **Samurai v6 not integrated:** A v6 Blender export was planned with improved details (mempo face, helmet crest, geta sandals), but v6 GLB was never produced on this branch. The v5 asset remains the integrated version. The worker's Foundry instance would need to be called again for a fidelity pass.

3. **PR #167 merge blocked:** The PR has automated APPROVED status and all CI checks green, but merge requires 1 approving review from a write-access reviewer. This is external to the deliverable but prevents final landing.

## Decision

The deliverable is **NOT complete** on this branch. The browser proof and Unity source handoff are coherent and reviewable, but the Unity Mac build artifact — the primary "playable game" evidence — is not committed. The samurai v6 fidelity pass is a quality enhancement but not blocking. Until the build artifact lands on this branch (or an equivalent verified build), the deliverable should remain in progress.

## Tickets

```yaml
tickets:
  - id: commit-unity-mac-build
    title: Commit Unity Mac build artifact to this branch
    goal: >
      On the Mac worker, copy the 112 MB
      `Builds/Mac/KawanakajimaSamurai.app` from the Unity project workspace
      into this branch's repo (add to git, respecting LFS for large files).
      Verify the .app runs without crash and includes all 20 samurai.
      If the build artifact no longer exists, re-run `KawanakajimaUnityBuild.BuildMac`
      and commit the fresh output.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: update-pr-167
    title: Update PR #167 body with current status and build evidence
    goal: >
      Push commits to this branch (Unity build artifact + any documentation),
      then update PR #167's body with: current samurai asset version, Unity build
      evidence (or blocker documentation if build fails), updated verification
      status, and correct preview path. Verify all CI checks still pass.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - commit-unity-mac-build

  - id: samurai-fidelity-v6-patch
    title: Integrate samurai v6 GLB quality pass (optional enhancement)
    goal: >
      If Foundry is reachable and responsive, produce a v6 samurai GLB with
      improved mempo face, helmet crest, geta sandals, and armor detail.
      Replace samurai_character.glb in both browser proof and Unity StreamingAssets.
      Update ASSET_MANIFEST.md and WORK_PLAN.md. If Foundry is unavailable or
      v5 quality is acceptable, mark this ticket as not-needed and document why.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
```

## Remaining Blockers

| Blocker | Status | Impact |
|---------|--------|--------|
| Unity Mac build artifact not committed to branch | Needs Mac worker action | Blocks deliverable completion |
| PR #167 merge blocked by branch protection | External (needs human reviewer) | Blocks merge to main; doesn't block deliverable completion |
| Samurai v6 fidelity pass | Not yet attempted | Quality enhancement, not blocking |
| VERIFICATION.md, PREVIEW.md, WORKLOG.md at deliverable level | Empty placeholders | Needs population with current evidence |

## Asset Quality Summary

| Asset | Version | Size | Location | Status |
|-------|---------|------|----------|--------|
| Samurai character GLB | v5 | 1.29 MB | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` | Integrated, reviewable |
| Battlefield pack GLB | v3 | 6.87 MB | `unity/.../StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` | Integrated, reviewable |
| Samurai contact sheet | v5 | 1.12 MB | `games/.../samurai_character_contact_sheet.png` | Present |
| Samurai hero render | v5 | 669 KB | `games/.../samurai_character_hero.png` | Present |
| Audio loop | Foundry | 2.53 MB | `games/.../audio/battlefield_loop.wav` + Unity | Integrated |
| Audio SFX (4x) | Foundry | <100 KB total | `games/.../audio/` + Unity | Integrated |
| Mac build (.app) | v1 | 112 MB | `unity/Builds/Mac/KawanakajimaSamurai.app` | **Not on branch** |
