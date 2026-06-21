# Kawanakajima Samurai Autonomous Validation v12

## Goal

Use FactoryX on the Mac-local Edo stack to autonomously produce a coherent samurai game deliverable:

- 20 warring samurai in total.
- 10 Takeda/red-side samurai and 10 Uesugi/blue-side samurai.
- The factions meet on a Japanese countryside battlefield.
- High-quality samurai assets are generated with Blender/Asset Foundry evidence.
- Assets are independently visually gated before expansion and before Unity/browser promotion.
- A Unity world is created or updated through the reachable Unity MCP listener and verified as playable when possible.
- A browser/Three.js proof remains playable and reviewable.
- Audio/music evidence is included or freshly verified.
- PR/merge/finalization happens only after the required evidence exists.

## Autonomy Rule

This run is a clean validation attempt after v11 was superseded. Do not count inherited files, older PRs, old screenshots, old Unity notes, or earlier generated assets as completion proof unless a fresh non-planner work order attached to this deliverable verifies them after this deliverable was created.

If a human/Codex operator manually rescues assets, Unity state, database state, or worker state after this validation starts, do not mark the deliverable done. Record the root cause, fix FactoryX, and repeat from a new validation branch.

## FactoryX Fixes Already Applied

- `3889a28` - Prevent asset tickets from self-approving visual gates.
- `ac7dc7d` - Prevent giant script and binary log stalls.
- `4d2bd18` - Require parseable deliverable planner YAML.
- `618a46b` - Fail planner runs without committed work plans.
- `9d6e0e1` - Allow autonomous asset generation before the dependent visual gate.
- `f3a8b57` - Prefer patch edits for large asset scripts.

Current local image:

`ghcr.io/tallhamn/factoryx:20260621-mac-patch-edits-asset-script-fix`

## Required Sequence

1. Planner writes and commits a parseable root `WORK_PLAN.md`.
2. First ready implementation work must create a pilot batch of exactly four fresh samurai assets:
   - 2 Takeda/red faction variants.
   - 2 Uesugi/blue faction variants.
   - Save source `.blend`, exported `.glb`, repeatable camera renders, and contact sheets under:
     `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v12/pilot-4/`
3. A separate visual-gate work order must inspect the pilot contact sheets. Asset generation must not approve itself.
4. Only after pilot visual gate passes, generate the full 20-samurai set under:
   `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v12/full-20/`
5. A separate final visual-gate work order must inspect all 20 samurai.
6. Only after final visual gate passes, proceed to Unity MCP world integration, browser proof integration, audio verification, PR/finalization, and merge verification.

## Asset Quality Gates

Each samurai must read as an upright human figure in front, side, rear, three-quarter, and top inspection views. The review must fail if any focal character has:

- detached or floating limbs;
- sideways/prone orientation;
- capsule/cylinder primitive anatomy;
- paddle feet or tiny unreadable feet;
- blocky Minecraft-like proportions;
- cropped head or unreadable face/helmet;
- one cloned model claimed as many variants;
- grey untextured placeholder materials;
- props that hide the body instead of improving the silhouette.

The asset-generation worker must record observed flaws but must not claim the visual gate passed.

## Unity MCP Gate

Unity work must verify the live MCP listener at `http://host.docker.internal:27481/mcp` using the standard streamable HTTP JSON-RPC flow or Codex MCP tools. Do not use stale `/api/...` bridge routes. If the Unity Editor/listener is unavailable, write a source-controlled Unity handoff and `UNITY_BLOCKER.md`; do not claim a playable Unity build.

## Done Criteria

The deliverable is complete only when current v12-attached work orders prove:

- pilot assets were created and independently inspected;
- full 20 assets were created and independently inspected;
- Unity world work was performed and verified or a precise Unity blocker was committed;
- browser proof opens and runs with current verified assets;
- music/audio is present and verified;
- PR/finalization records evidence and no required work remains.
