# Kawanakajima Samurai Autonomous Validation v11 — Working Plan

## Status Assessment (2026-06-21)

- **Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v11` — freshly seeded (commit `ecaaa8e`).
- **Completed non-planner work orders for this deliverable:** None. All inherited assets and prior build artifacts remain reference-only per v11 rules.
- **Asset Foundry:** healthy (Blender available at `/usr/bin/blender`, no HuggingFace/OpenAI providers).
- **Unity MCP:** listed as available at `http://host.docker.internal:27481/mcp` — will need live verification before Unity work.
- **PR:** no PR open for v11 branch yet.

## Plan Rationale

v11 requirements mandate a strict gating sequence: pilot asset generation -> independent pilot visual gate -> full 20-samurai expansion -> final visual gate -> downstream Unity/audio/browser/PR. Previous attempts failed because they skipped gates or self-approved. This plan respects the hard gates and keeps the ready batch small so results can be inspected before proceeding.

## Ready Tickets (First Batch)

These tickets are ready to spawn now. They form the foundation for all subsequent work.

```yaml
tickets:
    - id: v11-pilot-asset-gen
      title: Blender pilot asset generation - 4 samurai (2 Takeda, 2 Uesugi)
      goal: >
        Generate exactly four materially distinct samurai models using Asset Foundry Blender.
        Produce two Takeda (red faction) and two Uesugi (blue faction) variants with clean
        anatomy, armor, helmet/face/hand/foot detail. Save GLB source, Blender .blend, renders,
        and six-camera contact sheets under games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v11/pilot-4/.
        Never self-approve visual quality; record observed flaws in the work log.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: []
    - id: v11-pilot-visual-gate
      title: Independent pilot visual gate - inspect 4 samurai renders
      goal: >
        Inspect the saved pilot render contact sheets from v11-pilot-asset-gen.
        Verify each samurai reads as an upright human silhouette with readable armor,
        helmet, face, shoulders, hands, feet. Flag any detached/floating limbs, capsule/cylinder
        body parts, toy proportions, or paddle feet. Record pass/fail for each variant and
        an overall pilot gate decision. Do NOT spawn downstream work until this gate passes.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: [v11-pilot-asset-gen]
```

## Blocked Tickets (Spawn After Gate Completion)

These tickets must wait until upstream tickets complete and pass.

- `v11-full-asset-gen` - Generate the full 20-samurai set (10 Takeda + 10 Uesugi) under `.../samurai-v11/full-20/`. Requires `v11-pilot-visual-gate` to pass.
- `v11-final-visual-gate` - Inspect the complete 20-samurai set for realism and distinctness. Requires `v11-full-asset-gen`.
- `v11-unity-integration` - Integrate verified assets into the Unity project via MCP. Requires `v11-final-visual-gate`.
- `v11-browser-polish` - Polish the Three.js/browser proof with verified assets. Requires `v11-unity-integration` or parallel after visual gates pass.
- `v11-audio-final` - Final audio integration if not covered by foundry assets. Requires `v11-pilot-visual-gate` pass.
- `v11-pr-create` - Create/update the PR with all evidence. Requires all upstream gates.
- `v11-merge-verify` - Final verification of merged state. Requires `v11-pr-create`.

## Hard Gates Recap

| Gate | Requirement |
|------|-------------|
| Pilot asset gen | 4 distinct samurai (2T/2U) with GLB + Blender source |
| Pilot visual gate | Independent review of pilot renders - pass/fail recorded |
| Full asset gen | 20 distinct samurai (10T/10U) - only after pilot gate passes |
| Final visual gate | Independent review of full set - pass/fail recorded |
| Unity integration | Assets integrated into Unity scene via MCP |
| Browser proof | Playable Three.js proof with verified assets |
| PR & merge | Only after all gates pass |
