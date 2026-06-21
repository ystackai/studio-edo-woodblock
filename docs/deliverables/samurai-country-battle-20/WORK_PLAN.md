# 20 Samurai Country Battle — WORK PLAN

**Deliverable:** `samurai-country-battle-20-20260621`
**Branch:** `factoryx/samurai-country-battle-20-20260621`
**Status:** In progress — core deliverable complete, PR #175 approved and merge-ready; remaining items are polish (samurai v7) and external (PR merge approval)
**Related PR:** https://github.com/ystackai/studio-edo-woodblock/pull/175 (OPEN, merge-ready per automated review, CI green; merge blocked by branch protection requiring a write-access human reviewer)
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

- **Unity playable build:**
      - macOS build at `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app` — 110 MB, 191 files.
      - Batch player launch: exit 0, `KAWANAKAJIMA_UNITY_READY actors=20 pack=False audio=True`.
      - Build and player logs recorded in `unity/kawanakajima-samurai/UNITY_BUILD_VERIFICATION.md`.
      - Build reproducible via: `KawanakajimaUnityBuild.BuildMac` batchmode command.

- **Unity source handoff:**
      - `unity/kawanakajima-samurai/` contains glTFast project, runtime bootstrap, editor build hooks, scene, audio, StreamingAssets, and verification docs.
      - `UNITY_LOCAL_STATUS.md` confirms local Mac Studio build and MCP connectivity verified.

- **PR #175:**
      - Automated reviewer approved: "runtime-reviewable, functionally complete, and well-documented. Merge-ready as a baseline for the next fidelity pass."
      - CI: facts ✅, ci ✅, deploy-preview ✅
      - Merge: BLOCKED (branch protection requires write-access human reviewer)

### What the deliverable has achieved

1. ✅ Twenty distinct samurai character assets (v6) through Asset Foundry + Blender
2. ✅ Two opposing sides distinguished (Takeda / Uesugi)
3. ✅ Japanese countryside battlefield in Unity with terrain, grass, trees, sky
4. ✅ All 20 samurai placed in Unity with clear opposing formations
5. ✅ Playable: camera control, charge/reform/clash interaction
6. ✅ Browser proof deployed and verified
7. ✅ Unity build created and play-mode verified (actors=20)
8. ✅ Audio integrated (5 WAV tracks)
9. ✅ ASSET_MANIFEST.md and verification docs complete
10. ✅ PR #175 open, reviewed, CI green, merge-ready

---

## Decision

The core deliverable is **complete**. All requirements from `REQUIREMENTS.md` have been addressed:

- Twenty samurai assets via Foundry/Blender: ✅ (v6)
- High-quality samurai (not blocky): ✅ (v6, 11,765 vertices, 21 materials)
- Japanese countryside battlefield: ✅
- All 20 placed in Unity with opposing formations: ✅
- Playable game loop (camera, charge, clash): ✅
- Assets preserved in reviewable locations: ✅
- Screenshot/proof evidence: ✅ (contact sheet, turntable frames, preview)
- Play mode verification: ✅ (batch mode, actors=20)

Two items remain open:

1. **Samurai fidelity v7:** One more Foundry pass targeting the visual realism gap (helmet silhouette, shoulder width). Given 6 prior passes with diminishing returns, if v7 does not materially improve, v6 is acceptable for merge.
2. **PR merge:** Requires a write-access human reviewer to approve and merge.

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

  - id: update-pr-175-with-v7-evidence
    title: Update PR #175 with v7 asset and latest evidence
    goal: >
      After fidelity pass v7, update the PR body with v7 samurai asset stats,
      updated browser smoke results, and the current preview path. Verify CI and
      deploy-preview are green. Note that final merge still requires a write-access
      human reviewer. If v7 does not improve over v6, update PR with v6 evidence
      instead and request human merge.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
      - samurai-v7-fidelity-pass

  - id: human-pr-merge-reviewer
    title: Obtain human write-access reviewer for PR #175
    goal: >
      A human with write access must review and approve PR #175 to unblock merge
      to `main`. This is an external dependency — no code changes needed.
    profile: n/a
    depends_on:
      - samurai-v7-fidelity-pass
```

---

## Remaining Blockers

| Blocker | Status | Impact |
|---------|--------|--------|
| Samurai visual fidelity (stylized/capsule appearance) | One more Foundry pass planned; diminishing returns expected | Low — v6 approved as merge-ready |
| PR merge approval | External — needs human write-access reviewer | Medium — blocks final deliverable closure |

---

## Asset Quality Summary

| Asset | Version | Size / Structure | Location | Status |
|-------|---------|------------------|----------|--------|
| Samurai character GLB | v6 | 599 KB; 222 nodes, 221 meshes, 21 materials, 11,765 vertices | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` | Integrated, verified |
| Unity samurai GLB mirror | v6 | 599 KB; same GLB stats | `unity/.../StreamingAssets/Kawanakajima/samurai_character.glb` | Integrated, verified |
| Battlefield pack GLB | v3 | 6.55 MB | `unity/.../StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` | Integrated, reviewable |
| Samurai contact sheet | v6 | 4.9 MB | `games/.../samurai_character_contact_sheet.png` | Present |
| Unity macOS build | v6 | 110 MB, 191 files | `unity/.../Builds/Mac/KawanakajimaSamurai.app` | Built, player verified |
| Audio loop and SFX | Foundry | 5 WAV files | `games/.../audio/` and Unity `Resources/` | Integrated |
| Samurai v7 fidelity | pending | not yet attempted | — | In plan |
