# 20 Samurai Country Battle — WORK PLAN

**Deliverable:** `samurai-country-battle-20-20260621`
**Branch:** `factoryx/samurai-country-battle-20-20260621`
**Status:** In progress — v6 integrated, Unity Mac build evidence recorded, PR update/review still pending
**Related PR:** https://github.com/ystackai/studio-edo-woodblock/pull/167 (OPEN, approved by automation, merge blocked by branch protection requiring a write-access reviewer)
**Last updated:** 2026-06-21

## Current State Assessment

### What is present and working on this branch

- **Samurai character asset (v6):**
  - `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` is the v6 compressed GLB: 599 KB, 222 nodes, 221 meshes, 21 materials, 11,765 position vertices.
  - Unity StreamingAssets copy is also v6 at `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb`.
  - Blender source, contact sheet, turntable frames, and manifest are under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260620-v6/`.
  - Browser and Unity handoff verifiers now check GLB structure rather than using the old raw-size heuristic.

- **20-samurai battlefield pack (v3, Foundry):**
  - `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` is present.
  - Manifest proves 20 named warriors: 10 Takeda and 10 Uesugi.

- **Browser proof (Three.js WebGL):**
  - `games/kawanakajima-foundry-samurai-proof/index.html` includes 20 samurai, 6 camera presets, charge/reform/clash interaction, 5 WAV audio tracks, and review panels.
  - `node games/kawanakajima-foundry-samurai-proof/verify.js` passes.
  - `node games/kawanakajima-foundry-samurai-proof/browser-smoke-chromium.mjs` passes: CAPTURE_READY, 20 actors, nonblank canvas, no console errors, no exceptions, no failed requests.

- **Audio:**
  - 5 Foundry WAVs are integrated in the browser proof and Unity `Resources/KawanakajimaAudio/`.

- **Unity handoff project:**
  - `unity/kawanakajima-samurai/` contains the glTFast project, runtime bootstrap, editor build hooks, scene, audio, StreamingAssets, and verification docs.
  - `node unity/kawanakajima-samurai/verify-unity-handoff.js` passes with the v6 GLB.

- **Mac build evidence:**
  - `UNITY_BUILD_VERIFICATION.md` records a fresh v6 Mac build from this branch.
  - Local artifact: `/Users/marcus/codex-work/studio-edo-woodblock-samurai-country-battle-20-20260621/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`
  - Bundle: 110 MB, 191 files.
  - Batch player check exits 0 and logs `KAWANAKAJIMA_UNITY_READY actors=20 pack=False audio=True`.

### What is missing / blocking completion

1. **PR/merge path:**
   - Existing PRs are blocked by GitHub branch protection requiring a write-access human review. Automation cannot self-approve or bypass this.

### Decision

The v6 samurai asset integration and fresh Mac build evidence are recorded. The remaining internal task is to update the active PR/review status with that evidence. Final merge remains externally blocked by branch protection requiring a write-access human reviewer.

## Tickets

```yaml
tickets:
  - id: update-pr-175
    title: Update PR/review status with v6 and Unity build evidence
    goal: >
      Update PR #175 with: v6 samurai asset stats, browser smoke result,
      Unity handoff verification, Mac build command/result, local app artifact
      path, checksums, and the current preview path. Verify CI and
      deploy-preview are green. Note that final merge still requires a
      write-access human reviewer.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
```

## Remaining Blockers

| Blocker | Status | Impact |
|---------|--------|--------|
| Unity Mac build evidence from this branch | Recorded | Local artifact path and checksums in `UNITY_BUILD_VERIFICATION.md` |
| PR merge blocked by branch protection | External, needs human reviewer | Blocks merge to main |
| Samurai v6 integration | Done on branch | Browser and Unity handoff verifiers pass |

## Asset Quality Summary

| Asset | Version | Size / Structure | Location | Status |
|-------|---------|------------------|----------|--------|
| Samurai character GLB | v6 | 599 KB; 222 nodes, 221 meshes, 21 materials, 11,765 vertices | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` | Integrated, verified |
| Unity samurai GLB mirror | v6 | 599 KB; same GLB stats | `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb` | Integrated, verified |
| Battlefield pack GLB | v3 | 6.55 MB | `unity/.../StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` | Integrated, reviewable |
| Samurai contact sheet | v6 | 4.9 MB | `games/.../samurai_character_contact_sheet.png` | Present |
| Audio loop and SFX | Foundry | 5 WAV files | `games/.../audio/` and Unity `Resources/` | Integrated |
| Mac build evidence | v6 branch | 110 MB app, 191 files; player check exit 0 | `UNITY_BUILD_VERIFICATION.md` | Recorded |
