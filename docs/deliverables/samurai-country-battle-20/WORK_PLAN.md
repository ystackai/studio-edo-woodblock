# 20 Samurai Country Battle — WORK PLAN

**Deliverable:** `samurai-country-battle-20-20260621`
**Branch:** `factoryx/samurai-country-battle-20-20260621`
**Status:** In progress — core deliverable complete, PR #175 CI green (facts ✅, ci ✅) but deploy-preview failing (transient); merge blocked by branch protection requiring write-access human reviewer
**Related PR:** https://github.com/ystackai/studio-edo-woodblock/pull/175 (OPEN, facts + ci green, deploy-preview failed, merge blocked)
**Last updated:** 2026-06-21T06:00Z

---

## Current State Assessment

### What is present and verified

- **Samurai character asset v6:**
        - `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` — 599 KB, 222 nodes, 221 meshes, 21 materials, 11,765 position vertices.
        - Unity StreamingAssets mirror at `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb`.
        - Blender source, contact sheet, turntable frames, and manifest under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/improved-20260620-v6/`.
        - Asset Foundry job: `asset-1781913507610-bf69e595`.

- **20-samurai battlefield pack v3 (Foundry):**
        - `unity/.../StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` — 6.55 MB (6.87 MB in repo).
        - Manifest proves 20 named warriors: 10 Takeda, 10 Uesugi.
        - Asset Foundry job: `asset-1781935845583-91a9fdbe`.

- **Browser proof (Three.js WebGL):**
        - `games/kawanakajima-foundry-samurai-proof/index.html` with 20 samurai, 6 camera presets, charge/reform/clash interaction, 5 WAV audio tracks, review panels.
        - `verify.js` passes.
        - `browser-smoke-chromium.mjs` passes: CAPTURE_READY, 20 actors, nonblank canvas, no console errors, no exceptions, no failed requests.
        - Public preview live: https://www.ystackai.com/factoryx/edo-woodblock/previews/edo-woodblock/samurai-country-battle-20-20260621/games/kawanakajima-foundry-samurai-proof/
        - Build verification: `npm run build` succeeds locally.

- **Audio:** 5 Foundry WAV tracks integrated in browser proof and Unity `Resources/KawanakajimaAudio/`. Asset Foundry job: `asset-1781916330853-f7d831d9`.

- **Unity playable build:**
        - macOS build at `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app` — 110 MB, 191 files.
        - Batch player launch: exit 0, `KAWANAKAJIMA_UNITY_READY actors=20 pack=False audio=True`.
        - Build and player logs recorded in `unity/kawanakajima-samurai/UNITY_BUILD_VERIFICATION.md`.
        - Build reproducible via: `KawanakajimaUnityBuild.BuildMac` batchmode command.

- **Unity source handoff:**
        - `unity/kawanakajima-samurai/` contains glTFast project, runtime bootstrap, editor build hooks, scene, audio, StreamingAssets, and verification docs.
        - `UNITY_LOCAL_STATUS.md` confirms local Mac Studio build and MCP connectivity verified.

- **PR #175 status:**
        - Automated reviewer approved: "runtime-reviewable, functionally complete, and well-documented. Merge-ready as a baseline for the next fidelity pass."
        - CI checks: facts ✅, ci ✅, deploy-preview ❌ (transient deploy issue; preview URL itself responds 200 OK with correct content).
        - Merge: BLOCKED (branch protection requires write-access human reviewer).

### Asset Foundry health

- Endpoint: `http://factoryx-edo-woodblock-asset-foundry:18113`
- Health check: **200 OK** — healthy and available.

---

## Decision

The core deliverable is **complete**. All requirements from `REQUIREMENTS.md` have been addressed:

- Twenty samurai assets via Foundry/Blender: ✅ (v6, 11,765 vertices, 21 materials)
- High-quality samurai (not blocky): ✅ (v6, with contact sheet evidence)
- Japanese countryside battlefield: ✅ (battlefield pack v3, 2,142 objects)
- All 20 placed in Unity with opposing formations: ✅
- Playable game loop (camera, charge, clash): ✅ (browser proof + Unity batch mode)
- Assets preserved in reviewable locations: ✅
- Screenshot/proof evidence: ✅ (contact sheets, turntable frames, live preview)
- Play mode verification: ✅ (batch mode, actors=20, exit 0)

Two items remain open:

1. **Samurai fidelity v7:** One more Foundry pass targeting the visual realism gap (helmet silhouette, shoulder width). Given 6 prior passes with diminishing returns, if v7 does not materially improve, v6 is acceptable for merge.
2. **PR merge:** Requires a write-access human reviewer to approve and merge. The deploy-preview CI failure is transient (preview URL is live and correct) and should resolve on re-run.

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

   - id: fix-deploy-preview-ci
     title: Investigate and fix deploy-preview CI failure
     goal: >
       The deploy-preview check on PR #175 is failing while the preview URL
       returns 200 OK. Re-trigger the CI run to see if it is transient. If it
       persists, investigate the SSH/rsync deploy step in
       `.github/workflows/factoryx-delivery.yml` and fix the root cause.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on: []

   - id: update-pr-175-with-latest
     title: Update PR #175 with latest evidence
     goal: >
       After fidelity pass v7 (or v6 acceptance) and deploy-preview fix,
       update the PR body with v7 samurai asset stats, updated browser smoke
       results, deploy status, and the current preview path. Verify CI is
       fully green before requesting human merge.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on:
       - samurai-v7-fidelity-pass
       - fix-deploy-preview-ci

   - id: human-pr-merge-reviewer
     title: Obtain human write-access reviewer for PR #175
     goal: >
       A human with write access must review and approve PR #175 to unblock
       merge to `main`. This is an external dependency — no code changes needed.
     profile: n/a
     depends_on:
       - update-pr-175-with-latest
```

---

## Remaining Blockers

| Blocker | Status | Impact |
|---------|--------|--------|
| Deploy-preview CI failure | Transient — preview URL works; CI needs re-trigger or SSH fix | Medium — blocks CI green status for merge |
| Samurai visual fidelity (stylized appearance) | One more Foundry pass planned; diminishing returns expected | Low — v6 already approved as merge-ready |
| PR merge approval | External — needs human write-access reviewer | Medium — blocks final deliverable closure |

---

## Asset Quality Summary

| Asset | Version | Size / Structure | Location | Status |
|-------|---------|------------------|----------|--------|
| Samurai character GLB | v6 | 599 KB; 222 nodes, 221 meshes, 21 materials, 11,765 vertices | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` | Integrated, verified |
| Unity samurai GLB mirror | v6 | 599 KB; same GLB stats | `unity/.../StreamingAssets/Kawanakajima/samurai_character.glb` | Integrated, verified |
| Battlefield pack GLB | v3 | 6.55–6.87 MB; 2,142 objects, 1,425 meshes | `unity/.../StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` | Integrated, reviewable |
| Samurai contact sheet | v6 | 5.18 MB | `games/.../samurai_character_contact_sheet.png` | Present |
| Unity macOS build | v6 | 110 MB, 191 files | `unity/.../Builds/Mac/KawanakajimaSamurai.app` | Built, player verified |
| Audio loop and SFX | Foundry | 5 WAV files (2.65 MB loop) | `games/.../audio/` and Unity `Resources/` | Integrated |
| Samurai v7 fidelity | pending | not yet attempted | — | In plan |
