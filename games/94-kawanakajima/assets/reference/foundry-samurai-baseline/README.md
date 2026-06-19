# Asset Foundry Samurai Baseline

This folder preserves the earlier Asset Foundry proof asset that looked "funny but coherent" and should be used as the visual baseline for the replacement samurai batch.

It is not photoreal, but it is materially better than the current low-poly Kawanakajima GLB batch because it was generated through the Asset Foundry HTTP API with Blender-backed source and repeatable inspection renders.

## Source

- API job: `asset-1781842494700-82b4a4e8`
- Prompt shape: `/goal ... self-verifiable camera/render loop ...`
- Generated through: Asset Foundry `POST /api/assets`
- Temporary proof root at generation time: `/private/tmp/factoryx-samurai-foundry-proof`

## Files

- `realistic_samurai_source.blend`: Blender source file.
- `realistic_samurai.glb`: exported model.
- `realistic_samurai_blender.py`: reproducible Blender generation script emitted by the proof recipe.
- `realistic_samurai_contact_sheet.png`: stable hero/front/left/rear/top/three-quarter inspection views.
- `realistic_samurai_hero.png`: poster render.
- `realistic_samurai_turntable.gif`: turntable render.
- `summary.json`: foundry output manifest and mesh/material/object counts.

## Replacement Criteria

Do not generate the next 19 samurai from `scripts/generate-kawanakajima-glbs.js`.

The replacement batch should use Blender or Asset Foundry/Blender MCP and should match or exceed this baseline:

- recognizable kabuto, mempo, shikoro, do cuirass, sode, kusazuri, kote, greaves, waraji, katana, and saya;
- stable inspection renders from the same camera set before approval;
- committed `.blend`, `.glb`, generation script, contact sheet, turntable, and manifest;
- no primitive cube/capsule/Minecraft silhouettes for central characters.

If the Blender/foundry path is unavailable, the correct outcome is to mark the work blocked, not to substitute low-poly JS primitives.
