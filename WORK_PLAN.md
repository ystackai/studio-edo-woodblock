# Kawanakajima Samurai Autonomous Validation v10 — Living Plan

**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v10`
**Last Updated:** 2026-06-21T08:45Z

## Current State

- **Branch HEAD:** `eaa5175` — seed autonomous samurai validation v10
- **No PR** open for this branch yet.
- **No non-planner work orders** completed on this v10 branch. All assets on the branch are inherited from prior iterations (v3–v8) and serve as reference only.
- **Infrastructure:** Asset Foundry healthy (200 OK), Unity MCP reachable (gamedev-mcp-server 8.0.0.0, Kawanakajima scene loaded), Blender 3.4.1 available.

## Stance

Per the v10 requirements, the deliverable cannot be claimed until fresh v10 pilot assets pass an independent visual gate, followed by full 20-samurai production, a final visual gate, Unity playable build, and browser polish. Nothing is ready yet — all criteria are pending for v10.

## Strategy

1. **Batch 1 (ready now):** Pilot asset generation (4 samurai: 2 Takeda + 2 Uesugi) + independent pilot visual gate.
2. **Batch 2 (after pilot gate passes):** Full 20-samurai expansion + independent final visual gate.
3. **Batch 3 (after final gate passes):** Unity playable build integration with v10 assets.
4. **Batch 4 (after Unity verified):** Browser game polish with v10 assets.
5. **Final:** PR open to `main` with complete v10 evidence.

## Completed

- None (this is the first planning pass for v10; previous work orders v3–v9 are superseded and not v10 proof).

## Ready Tickets

```yaml
tickets:
    - id: v10-pilot-asset-gen
      title: Generate 4 pilot samurai (2 Takeda, 2 Uesugi) via Asset Foundry + Blender
      goal: >
        Produce exactly 4 materially distinct samurai models (2 Takeda, 2 Uesugi) via
        Asset Foundry Blender jobs, with Blender 3.4-compatible scripts. Save GLB,
        source .blend, and 6-camera renders (front, side, rear, three-quarter, top,
        contact sheet) under
        games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v10/pilot-4/.
        Include ASSET_MANIFEST.md for pilot-4. Never self-approve the visual gate.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: []
    - id: v10-pilot-visual-gate
      title: Independent pilot visual gate inspection
      goal: >
        Separate non-planner work order that inspects the pilot-4 renders and contact
        sheets. Checks: upright silhouettes, feet grounded in front/side/rear, no
        detached limbs or capsule anatomy, face/head/neck/shoulder readability, distinct
        variants (not clones). Pass/fail decision before downstream work proceeds.
      profile: qwen3.6:35b-a3b-coding-mxfp8
      depends_on: [v10-pilot-asset-gen]
```

## Pending Tickets

| Ticket | Depends On | Notes |
|--------|-----------|-------|
| `v10-full-asset-gen` | `v10-pilot-visual-gate` | Full 20 samurai under `samurai-v10/full-20/` |
| `v10-final-visual-gate` | `v10-full-asset-gen` | Independent inspection of all 20 variants |
| `v10-unity-integration` | `v10-final-visual-gate` | Unity scene with v10 assets, playable build |
| `v10-browser-polish` | `v10-unity-integration` | Browser game update with v10 assets |
| `v10-pr-open` | `v10-browser-polish` | Open/update PR to `main` with v10 evidence |

## Risk

- Blender scripts must be split into small chunks (under 120 lines per command) to avoid the v8 stall pattern.
- Visual gate must be a separate work order, never self-approved.
- If pilot assets fail visual gate, iterate the Blender script and re-render before expanding to full 20.
