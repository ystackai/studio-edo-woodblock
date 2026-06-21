# 20 Samurai Country Battle — WORK PLAN

**Deliverable:** `samurai-country-battle-20-20260621`
**Branch:** `factoryx/samurai-country-battle-20-20260621`
**Status:** In progress — v6 integrated + fresh Mac build recorded; remaining: visual fidelity pass v7, PR merge
**Related PR:** https://github.com/ystackai/studio-edo-woodblock/pull/167 (OPEN, approved by automation, merge blocked by branch protection requiring a write-access human reviewer)
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
   - `index.html` with 20 samurai, 6 camera presets, charge/reform/clash interaction, 5 WAV audio tracks, review panels.
   - `verify.js` passes.
   - `browser-smoke-chromium.mjs` passes: CAPTURE_READY, 20 actors, nonblank canvas, no console errors, no exceptions, no failed requests.

- **Audio:** 5 Foundry WAVs integrated in browser proof and Unity `Resources/KawanakajimaAudio/`.

- **Unity handoff project:**
   - `unity/kawanakajima-samurai/` contains glTFast project, runtime bootstrap, editor build hooks, scene, audio, StreamingAssets, and verification docs.
   - `verify-unity-handoff.js` passes with v6 GLB.

- **Mac build evidence (fresh from this branch):**
   - `UNITY_BUILD_VERIFICATION.md` records a fresh v6 Mac build from this branch.
   - Local artifact: `/Users/marcus/codex-work/studio-edo-woodblock-samurai-country-battle-20-20260621/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`
   - Bundle: 110 MB, 191 files.
   - Batch player check exits 0 and logs `KAWANAKAJIMA_UNITY_READY actors=20 pack=False audio=True`.

- **CI/CD:** All checks green — facts, ci, deploy-preview pass; deploy-production skipped (expected for non-main).

### What the automated reviewer approved (PR #167)

> "The PR is **runtime-reviewable, functionally complete, and well-documented**. All CI checks pass, the browser smoke test passes cleanly, and the Unity source handoff is thorough."
>
> "This PR is merge-ready as a baseline for the next fidelity pass."

### What remains

1. **Visual fidelity gate — FAIL.** Wide formation screenshots still read as stylized low-poly/capsule figures. Multiple Blender/Foundry passes (v1 through v6) improved the samurai but none fully achieved a convincing realistic samurai silhouette. One more focused fidelity pass is needed.
2. **PR merge.** Branch protection requires one approving review from a write-access human reviewer. Automation cannot self-approve.

---

## Decision

The deliverable is **not yet complete**. The v6 samurai asset integration, fresh Mac build evidence, and Unity handoff structure are done and verified. One item remains before this work can close:

1. **One more Foundry/Blender fidelity pass** to address the visual realism gap (capsule/blocky samurai issue that has persisted through v1–v6). After that, the PR can be updated and merged pending human review.

---

## Tickets

```yaml
tickets:
   - id: samurai-v7-fidelity-pass
    title: Blender/Foundry samurai fidelity pass — v7
    goal: >
      Submit a Foundry Blender job targeting the visual realism gap identified by the
      PR reviewer. Focus on: capsule-to-block anatomy (wider shoulders, defined head/
      neck/helmet structure, visible legs rather than single cylinders), armor material
      variation, and a convincing kabuto/helmet silhouette. Export GLB under
       `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_v7.glb`,
      regenerate contact sheet, and update ASSET_MANIFEST.md.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

   - id: update-pr-167-with-v7-and-build
    title: Update PR #167 with v7 fidelity pass and build evidence
    goal: >
      After the fidelity pass v7 is integrated, update the PR body with v7 samurai
      asset stats, updated browser smoke results, fresh Mac build evidence (logs,
      screenshots), and the current preview path. Verify CI and deploy-preview are
      green. Note that final merge still requires a write-access human reviewer.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
       - samurai-v7-fidelity-pass
```

---

## Remaining Blockers

| Blocker | Status | Impact |
|---------|--------|--------|
| Samurai visual fidelity (capsule/blocky appearance) | Requires new Foundry Blender pass | Blocks "production-realistic" requirement |
| PR merge approval | External — needs human write-access reviewer | Blocks merge to `main` |
| Unity Mac build evidence | Recorded on branch | Done — local artifact path in `UNITY_BUILD_VERIFICATION.md` |
| Samurai v6 integration | Done on branch | Browser and Unity handoff verifiers pass |

---

## Asset Quality Summary

| Asset | Version | Size / Structure | Location | Status |
|-------|---------|------------------|----------|--------|
| Samurai character GLB | v6 | 599 KB; 222 nodes, 221 meshes, 21 materials, 11,765 vertices | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` | Integrated, verified |
| Unity samurai GLB mirror | v6 | 599 KB; same GLB stats | `unity/.../StreamingAssets/Kawanakajima/samurai_character.glb` | Integrated, verified |
| Battlefield pack GLB | v3 | 6.55 MB | `unity/.../StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` | Integrated, reviewable |
| Samurai contact sheet | v6 | 4.9 MB | `games/.../samurai_character_contact_sheet.png` | Present |
| Audio loop and SFX | Foundry | 5 WAV files | `games/.../audio/` and Unity `Resources/` | Integrated |
| Mac build evidence | v6 branch | 110 MB app, 191 files; player check exit 0 | `UNITY_BUILD_VERIFICATION.md` | Recorded |
| Samurai v7 fidelity | pending | not yet attempted | — | Blocking |
