# Kawanakajima Samurai Autonomous Validation v2 — WORK PLAN

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v2`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v2`
**PR:** #207 (OPEN, awaiting review)
**Status:** Not complete — Unity build blocked, samurai v6 needs Unity wire
**Updated:** 2026-08-21

## Current State Assessment

### What's present and working
- **Browser proof** (`games/kawanakajima-foundry-samurai-proof/index.html`): Three.js WebGL scene with 20 samurai (10 Takeda/red, 10 Uesugi/blue), orbit/zoom controls, 6 named camera presets, charge/reform gameplay loop, file-backed audio from Asset Foundry, review panel with contact sheet + hero image. VERIFICATION.json passes all structure/asset/size checks. Canvas is non-blank, no console errors on load.
- **Samurai asset upgraded to v6:** `samurai_character.glb` replaced with smooth-shaded v6 (3.0 MB, 108K verts, auto-smooth 45° on 149 mesh objects). Source: Blender 3.4.1, work-order-1787277782713-8-5.
- **20-samurai battlefield pack:** 6.55 MB GLB from Asset Foundry v3 fidelity pass, 10 Takeda + 10 Uesugi on countryside battlefield.
- **Asset Foundry audio:** File-backed WAVs (battlefield_loop, charge, clash, step, confirm) from Foundry job.
- **Unity source handoff** (`unity/kawanakajima-samurai/`): Complete project with glTFast, Kawanakajima scene, runtime bootstrap, build hooks, copied assets.
- **Samurai v6 GLB** copied to `unity/.../samurai_character_v6.glb` but **not yet wired** into Unity bootstrap (which still references the old GLB).
- **ASSET_MANIFEST.md:** Updated with v6 provenance and integration details.
- **PR #167** (main validation branch v1): Already merged into `main` on 2026-06-28 with all CI green.

### What's blocked or incomplete
- **Unity build artifact:** No Unity build has been produced. The Mac-host Unity MCP listener (`http://host.docker.internal:27481/mcp`) is unreachable from this worker runtime (connection refused, code 7). This is the primary blocker.
- **Unity samurai v6 wire:** The v6 GLB exists as a separate file in the Unity handoff but the bootstrap script still references the original GLB filename.
- **PR #207** is open but has not been reviewed/merged.

### Decision
This deliverable is **NOT complete**. Per the hard validation rule: "If the branch contains only this requirements file and a planner-created WORK_PLAN.md, the planner must create implementation or verification tickets. It must not write `done: true`."

The browser proof is reviewable and samurai assets are on v6. PR #207 is already open with all existing work documented. The remaining actionable work is:
1. Wire samurai v6 into the Unity handoff bootstrap (planner can do this directly)
2. Attempt Unity build via MCP listener (blocked until listener is reachable)

## Updated Tickets

```yaml
tickets:
   - id: unity-v6-sync
    title: Wire samurai v6 into Unity bootstrap
    goal: >
      Replace the samurai_character.glb reference in the Unity bootstrap
      script with samurai_character_v6.glb (the smooth-shaded v6 asset).
      Ensure the Unity project still references the correct file path and
      the bootstrap would load v6 without errors when Unity runs.
      This is a text-only change to the Unity C# bootstrap script — no
      binary changes needed since v6 GLB is already staged as
      samurai_character_v6.glb in StreamingAssets.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []

   - id: unity-build-attempt
    title: Attempt Unity WebGL/Mac build via Mac MCP listener
    goal: >
      Probe the Mac-host Unity MCP listener at
      http://host.docker.internal:27481/mcp (fallback:
      http://172.21.0.1:25666/mcp). If reachable, load the Kawanakajima
      project, verify the scene compiles, then produce a WebGL or Mac
      standalone build via existing build methods. Capture build output
      and binary as evidence. If unreachable, proceed to blocker docs.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
       - unity-v6-sync

   - id: unity-blocker-document
    title: Document Unity build blocker with remediation path
    goal: >
      If the Unity build attempt fails (listener unreachable or build
      error), ensure UNITY_BLOCKER.md is current with: (a) exact probe
      results and error output, (b) disk space status on worker and Mac
      hosts, (c) recommended next steps. Preserve the Unity source
      handoff as starting point for future runs.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on:
       - unity-build-attempt

   - id: browser-proof-final-check
    title: Final browser proof verification
    goal: >
      Run node verify.js on games/kawanakajima-foundry-samurai-proof/
      to confirm all checks pass with v6 samurai asset. Verify all 6
      screenshots are non-blank and show samurai silhouettes clearly.
      Update VERIFICATION.json with a current timestamp if needed.
    profile: qwen3.6:35b-a3b-coding-mxfp8
    depends_on: []
```

## Notes

- **PR #207 is already open** — no separate PR ticket needed. The PR body includes the FactoryX Work Order Context section.
- The `unity-v6-sync` ticket is the highest-priority actionable item since it requires no external listener and is a simple script reference change.
- Unity build attempts may be retried in future runs when the Mac MCP listener is reachable.
- The browser proof is functional and reviewable; the final check is a quick verification pass, not a major change.
