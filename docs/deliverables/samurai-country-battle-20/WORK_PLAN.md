# 20 Samurai Country Battle — WORK PLAN

**Deliverable:** `samurai-country-battle-20-20260621`
**Branch:** `factoryx/samurai-country-battle-20-20260621`
**Status:** In progress — v6 asset integrated, Unity source handoff complete, browser proof verified; remaining: samurai fidelity v7, Unity build, PR merge
**Related PR:** https://github.com/ystackai/studio-edo-woodblock/pull/175 (OPEN, mergeable, CI green; merge blocked by branch protection requiring a write-access human reviewer)
**Last updated:** 2026-06-21

---

## Current State Assessment

### What is present and verified

- **Samurai character asset v6:**
     - `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` — 599 KB, 222 nodes, 221 meshes, 21 materials, 11,765 position vertices.
     - Unity StreamingAssets mirror at `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb`.
     - Blender source, contact sheet, turntable frames, and manifest under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260620-v6/`.

- **20-samurai battlefield pack v3 (Foundry):**
     - `unity/.../StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` — 6.55 MB.
     - Manifest proves 20 named warriors: 10 Takeda, 10 Uesugi.

- **Browser proof (Three.js WebGL):**
     - `games/kawanakajima-foundry-samurai-proof/index.html` with 20 samurai, 6 camera presets, charge/reform/clash interaction, 5 WAV audio tracks, review panels.
     - `verify.js` passes.
     - `browser-smoke-chromium.mjs` passes: CAPTURE_READY, 20 actors, nonblank canvas, no console errors, no exceptions, no failed requests.
     - Public preview live: https://www.ystackai.com/factoryx/edo-woodblock/previews/edo-woodblock/samurai-country-battle-20-20260621/games/kawanakajima-foundry-samurai-proof/

- **Audio:** 5 Foundry WAVs integrated in browser proof and Unity `Resources/KawanakajimaAudio/`.

- **Unity handoff project:**
     - `unity/kawanakajima-samurai/` contains glTFast project, runtime bootstrap, editor build hooks, scene, audio, StreamingAssets, and verification docs.

### What the automated reviewer approved (PR #175)

> "The PR is **runtime-reviewable, functionally complete, and well-documented**. All CI checks pass, the browser smoke test passes cleanly, and the Unity source handoff is thorough."
>
> "This PR is merge-ready as a baseline for the next fidelity pass."

### What remains

1. **Visual fidelity gap — persistent but diminishing returns.** Wide formation screenshots still read as stylized low-poly/capsule figures. Six Foundry/Blender passes (v1–v6) have improved anatomy incrementally; a seventh targeted pass is planned but diminishing returns are expected.
2. **Unity playable build.** The source handoff is complete and verified; however, the actual Unity player build needs to be created through the Mac-host Unity MCP listener (scene insertion + build verification).
3. **PR merge.** Branch protection requires one approving review from a write-access human reviewer. Automation cannot self-approve.

---

## Decision

The deliverable is **not yet complete**. The v6 samurai integration, Unity source handoff, and browser proof are all done and verified. Two items remain:

1. **One more Foundry/Blender fidelity pass** targeting the visual realism gap. Given 6 prior passes with marginal improvement, this pass should focus on a single high-impact change (e.g., helmet/hat silhouette, broader shoulders) rather than a broad overhaul. If v7 does not materially improve the silhouette, v6 is acceptable for merge as the PR is already approved as "merge-ready."
2. **Unity playable build verification** via the Mac-host MCP listener, if available.
3. **PR merge** pending human review.

---

## Tickets

```yaml
tickets:
  - id: samurai-v7-fidelity-pass
    title: Blender/Foundry samurai fidelity pass — v7
    goal: >
      Submit one focused Foundry Blender job targeting the samurai silhouette
      (helmet/hat shape, shoulder width, or armor proportion). Export GLB under
      `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_v7.glb`,
      regenerate contact sheet, update ASSET_MANIFEST.md.
      If v7 does not materially improve over v6, accept v6 and proceed to merge.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

  - id: unity-build-verify-through-mcp
    title: Unity playable build via Mac-host MCP listener
    goal: >
      Use the Mac-host Unity MCP listener to insert the scene, run Play Mode
      verification, and create a playable build (macOS or WebGL) with the
      samurai v6/v7 asset. Record build evidence in
      `docs/deliverables/samurai-country-battle-20/UNITY_BUILD_VERIFICATION.md`.
      If MCP listener is unavailable, note as blocker and proceed with source handoff.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - samurai-v7-fidelity-pass

  - id: update-pr-175-with-latest
    title: Update PR #175 with v7 asset and build evidence
    goal: >
      After fidelity pass v7 and Unity build are done, update the PR body with
      v7 samurai asset stats, updated browser smoke results, fresh build evidence
      (logs, screenshots), and the current preview path. Verify CI and deploy-preview
      are green. Note that final merge still requires a write-access human reviewer.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - samurai-v7-fidelity-pass
      - unity-build-verify-through-mcp
```

---

## Remaining Blockers

| Blocker | Status | Impact |
|---------|--------|--------|
| Samurai visual fidelity (stylized/capsule appearance) | One more Foundry pass planned; diminishing returns expected | Blocks "production-realistic" goal; v6 acceptable as fallback |
| Unity playable build | Needs Mac-host MCP listener for scene insert + build | Blocks full deliverable completeness; source handoff is verified |
| PR merge approval | External — needs human write-access reviewer | Blocks merge to `main` |

---

## Asset Quality Summary

| Asset | Version | Size / Structure | Location | Status |
|-------|---------|------------------|----------|--------|
| Samurai character GLB | v6 | 599 KB; 222 nodes, 221 meshes, 21 materials, 11,765 vertices | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` | Integrated, verified |
| Unity samurai GLB mirror | v6 | 599 KB; same GLB stats | `unity/.../StreamingAssets/Kawanakajima/samurai_character.glb` | Integrated, verified |
| Battlefield pack GLB | v3 | 6.55 MB | `unity/.../StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` | Integrated, reviewable |
| Samurai contact sheet | v6 | 4.9 MB | `games/.../samurai_character_contact_sheet.png` | Present |
| Audio loop and SFX | Foundry | 5 WAV files | `games/.../audio/` and Unity `Resources/` | Integrated |
| Mac build evidence | v6 branch | Not yet committed (Mac-host only) | `UNITY_BUILD_VERIFICATION.md` | Pending |
| Samurai v7 fidelity | pending | not yet attempted | — | In plan |
| Unity playable build | pending | needs Mac MCP listener | — | In plan |
