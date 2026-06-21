# Kawanakajima Samurai Autonomous Validation v3

This branch is a fresh FactoryX validation run after deploying the local Mac
runtime integration and the autonomous-completion guard.

## Goal

Produce a coherent Samurai game-world deliverable for Kawanakajima with:

- 20 visually reviewable samurai characters: 10 per side.
- A Japanese countryside battlefield world suitable for a playable Unity scene.
- Reviewable generated visual assets, including Blender/GLB source or exports where appropriate.
- Music or audio identity for the playable experience.
- A Unity world/build or a documented Unity blocker if the live Editor/listener cannot actually build.
- A small playable game slice that uses the generated assets.

## Hard Validation Rule

This run is not successful if completion is inferred from older PRs, older
branches, older assets, or manual operator edits made after the planner starts.

Historical work may be inspected as reference material, but it does not prove
this deliverable complete. Completion must be supported by non-planner Work
Orders attached to this deliverable and by source-controlled files on this
branch.

If the branch contains only this requirements file and a planner-created
`WORK_PLAN.md`, the planner must create implementation or verification tickets.
It must not write `done: true`.

If a human/Codex operator must patch the branch, assets, Unity source, database,
or worker state after the planner starts, the result is not proof of autonomous
recovery. Fix the root FactoryX/runtime issue and start a fresh validation
branch.

## Asset Quality Bar

Use Asset Foundry, Blender, Blender MCP, or exposed 3D tooling for focal 3D
character/world assets. Each generated asset pass must preserve source/export
files and repeatable inspection renders or screenshots.

For samurai characters, reject toy/block/capsule anatomy, disk faces, paddle
feet, or Minecraft-like box armor. The characters should read as stylized but
believable armored humans with body-following armor, helmets, cloth, hands,
feet, swords or spears, and faction-readable variation.

## Unity Machine Integration

The local Mac Unity MCP listener is expected at
`http://host.docker.internal:27481/mcp`, with the Unity project at
`/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai`.

The FactoryX worker image has Blender, Blender MCP, Unity CLI, Unity MCP server
tooling, and the URL-mode Unity MCP bridge configured. Use MCP to verify the
reachable Editor/listener and build/play-mode state. If the live Editor checkout
differs from the worker checkout, commit source-controlled Unity changes in this
branch and document the handoff precisely.

## Done Criteria

Only mark the deliverable done when the branch contains the final plan and
evidence for:

- Generated/reviewable assets and manifests.
- Unity scene/build/play-mode verification or a real Unity blocker.
- A playable game slice.
- Progress/preview/verification notes understandable to a non-coder reviewer.

The final `WORK_PLAN.md` may contain `done: true` only after those attached
non-planner Work Orders exist and have completed.
