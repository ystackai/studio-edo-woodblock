# Kawanakajima Samurai Autonomous Validation v5

This is a fresh FactoryX validation run after v3 and v4 both failed to prove
autonomous recovery.

## Why Earlier Runs Are Invalid

v3 generated a v6 samurai contact sheet where the character was sideways or
prone and still read as primitive capsule geometry. A human/Codex operator
manually inspected the bad output, cancelled that run, and patched FactoryX so
future Blender character work must prove upright Z-up inspection views.

v4 then started before the planner had a strong baseline-evidence guard. Its
planner treated assets inherited from `main` as near-complete proof and spawned
PR/context housekeeping instead of a fresh asset/world/game validation pass.
That is not acceptable evidence for this autonomous-validation run.

## Goal

Produce a coherent Samurai game-world deliverable for Kawanakajima with:

- 20 visually reviewable samurai characters: 10 Takeda and 10 Uesugi.
- A Japanese countryside battlefield world suitable for a playable Unity scene.
- Reviewable generated visual assets, including Blender source and GLB/GLTF
  exports or an explicit tool blocker.
- Music or audio identity for the playable experience.
- A Unity world/build or a documented Unity blocker if the live Editor/listener
  cannot actually build.
- A small playable game slice that uses the generated assets.

## Hard Evidence Rules

- Files inherited from `main`, old branches, old PRs, old work-order folders,
  old screenshots, old Unity build notes, old asset manifests, and old GLBs are
  reference material only. They are not v5 completion proof.
- Completion must be supported by non-planner Work Orders attached to
  deliverable `kawanakajima-samurai-autonomous-validation-20260621-v5`.
- The attached non-planner Work Orders must be created after this v5 deliverable
  was registered and must commit or verify the evidence on this v5 branch.
- The first implementation batch must include a fresh Blender/foundry visual
  gate for the samurai assets before any PR creation, merge housekeeping, or
  build-artifact packaging.
- If this branch contains only this requirements file and a planner-created
  `WORK_PLAN.md`, the planner must create implementation or verification
  tickets and must not write `done: true`.
- If any human/Codex operator must patch the branch, assets, Unity source,
  database, or worker state after this planner starts, the result is not proof
  of autonomous recovery. Fix the root FactoryX/runtime issue and start a new
  validation branch.

## Asset Quality Bar

Use Asset Foundry, Blender, Blender MCP, or exposed 3D tooling for focal
character/world assets. Preserve source/export files and repeatable inspection
renders or screenshots for each generated asset pass.

For samurai characters:

- Use Blender Z as the up axis.
- Contact sheets must include named repeatable front, side, rear,
  three-quarter, and top views.
- Front/side/rear views must show the character upright and fully framed, with
  feet or grounded supports visually below the head.
- Reject sideways, prone, floating, disassembled, or incorrectly rotated
  characters.
- Reject toy/block/capsule anatomy, disk faces, paddle feet, or Minecraft-like
  box armor.
- Characters should read as stylized but believable armored humans with
  body-following armor, helmets, cloth, hands, feet, swords or spears, and
  faction-readable variation.

## Runtime Integration To Prove

The Mac-local FactoryX deployment is expected to run the workers and sidecars:

- Admin API: `http://127.0.0.1:8183`
- Preview/public read: `http://127.0.0.1:8182`
- Asset Foundry in the FactoryX Docker network
- Blender 3.4.1 and `blender-mcp` inside worker containers
- Local Ollama model backends for coding and vision review
- Unity MCP listener at `http://host.docker.internal:27481/mcp`
- Unity project path:
  `/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai`

Use MCP to verify the reachable Unity Editor/listener and build/play-mode
state. If the live Editor checkout differs from the worker checkout, commit
source-controlled Unity changes in this branch and document the handoff
precisely.

## Done Criteria

Only mark this deliverable done when the branch contains the final plan and
fresh v5 evidence for:

- Generated/reviewable assets and manifests.
- Unity scene/build/play-mode verification or a real Unity blocker.
- A playable game slice.
- Progress/preview/verification notes understandable to a non-coder reviewer.

The final `WORK_PLAN.md` may contain `done: true` only after attached
non-planner Work Orders for v5 have completed and prove the criteria above.
