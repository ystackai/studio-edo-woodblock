# Kawanakajima Samurai Autonomous Validation v7 — WORK PLAN

**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v7`
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v7`
**Current HEAD:** `4c83fca2db8dfa7b02394caaa63153878335eb13` (seed commit)
**Assessed at:** 2026-06-21T07:15Z

## Status Assessment

This is a **fresh validation run**. The branch contains only the seed commit with `FACTORYX_DELIVERABLE_REQUIREMENTS.md`. No non-planner Work Orders are attached. All deliverable criteria remain PENDING:

| Criterion | Status | Notes |
|-----------|--------|-------|
| 20 samurai variants (10 per side) | PENDING | No v7 assets generated yet |
| Realistic upright samurai silhouettes | PENDING | Need fresh Blender/foundry generation |
| Unity world integration & playable game loop | PENDING | Source handoff exists but needs Unity MCP scene insertion and build |
| Original/generated audio integrated | PENDING | Foundry audio exists from prior iterations but needs fresh v7 integration |
| Browser/review surface | PENDING | Needs fresh v7 assets to display |

**Infrastructure:**
- Asset Foundry (`http://factoryx-edo-woodblock-asset-foundry:18113`) — **healthy**
- Unity MCP (`http://host.docker.internal:27481/mcp`) — **healthy** (gamedev-mcp-server v8.0.0.0)

**Blocked:** PR creation, Unity build, browser polish, merge — all depend on fresh v7 evidence.

## Strategy

Per v7 hard gates:
1. **First:** Generate fresh v7 samurai assets through Asset Foundry + Blender MCP with repeatable review views (front, side, rear, three-quarter, top). This is the visual-gate ticket.
2. **Then:** Integrate v7 assets into Unity scene via Unity MCP (scene insertion, actor placement, game loop verification).
3. **Then:** Finalize audio integration, browser review surface, open PR to main.

Each ticket must be completed (non-planner Work Order) before the next becomes ready.

## Active Tickets

```yaml
done: false
tickets:
   - id: v7-samurai-asset-gen
     title: Generate fresh v7 samurai assets via Asset Foundry + Blender MCP
     goal: >
       Use Asset Foundry Blender provider to generate at least 10 samurai assets
       (10 Takeda red, 10 Uesugi blue) with realistic upright human-readable silhouettes,
       armor, cloth, weapon, face/head, hand/foot, and material detail. Produce GLB files
       and repeatable review views (front, side, rear, three-quarter, top) saved under
       games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai/v7/.
       Write ASSET_MANIFEST.md with provenance, sizes, and visual-gate pass/fail notes.
       Blender 3.x API compatibility required.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on: []

   - id: v7-blender-visual-gate
     title: Visual gate review of v7 samurai assets
     goal: >
       Render contact sheets or inspection views for all v7 samurai variants.
       Verify upright standing pose, correct anatomy (head/neck/shoulder/hand/foot),
       non-Minecraft-like/non-capsule-like silhouettes, proper frame composition,
       and material quality. Record pass/fail per asset with improvement notes.
       Only when this ticket passes do downstream tickets unlock.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on:
       - v7-samurai-asset-gen

   - id: v7-unity-integration
     title: Integrate v7 assets into Unity scene via Unity MCP
     goal: >
       Use Unity MCP to import v7 GLB assets into the Kawanakajima scene,
       place 20 samurai actors (10 Takeda + 10 Uesugi) in the battlefield
       tableau, verify camera presets, charge/reform gameplay loop, and
       camera/audio controls. Produce Unity editor screenshots showing
       the scene populated with fresh v7 assets.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on:
       - v7-blender-visual-gate

   - id: v7-audio-integration
     title: Integrate original/audio assets into Unity and browser proof
     goal: >
       Integrate freshly generated or Asset Foundry-produced audio into both
       the Unity scene (via KawanakajimaRuntimeBootstrap audio system) and
       the browser proof (Three.js scene). Ensure audio only starts after
       user gesture. Record audio file provenance in ASSET_MANIFEST.md.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on:
       - v7-blender-visual-gate

   - id: v7-browser-review-surface
     title: Finalize browser review surface with v7 evidence
     goal: >
       Update the browser proof (index.html + verify.js) to display v7
       assets, show updated contact sheets and hero renders, and produce
       a coherent review surface. Run verify.js to confirm no runtime
       errors and non-blank rendered scene. Preview should open directly
       without external dependencies.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on:
       - v7-unity-integration
       - v7-audio-integration

   - id: v7-pr-and-merge
     title: Open PR with v7 evidence and merge
     goal: >
       Open PR from `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v7` to
       `main` with full v7 evidence: fresh assets, Unity integration screenshots,
       browser proof verification output, and ASSET_MANIFEST.md. PR body must include
       FactoryX Work Order Context section. Human merge reviewer for final approval.
     profile: qwen3.6:35b-a3b-coding-mxfp8
     depends_on:
       - v7-browser-review-surface
```

## Dependency Graph

```
v7-samurai-asset-gen
         │
         ▼
v7-blender-visual-gate
         │
         ├──────────┬──────────┐
         ▼           ▼           ▼
v7-unity-   v7-audio-   v7-browser-
integration  integration  review-surface
         │           │             │
         └──────┬───┘             │
                ▼                 ▼
          v7-pr-and-merge        │
                               (final merge)
```

## Notes

- All inherited assets from v3–v6 are reference-only; fresh v7 generation is required.
- Blender 3.x compatibility hard gates are in the deliverable requirements.
- Unity MCP is reachable; scene insertion and build verification will use MCP tools.
- Asset Foundry Blender provider is configured and healthy.
- No human/Codex operator has manually intervened on this branch; fresh validation from seed.
