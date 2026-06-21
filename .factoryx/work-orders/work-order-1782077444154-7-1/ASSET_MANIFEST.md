# Asset Manifest - v17 Full 20-Samurai Batch

Work Order: `work-order-1782077444154-7-1`

Asset root: `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/full-20/`

## Contents

- 20 `.glb` exports
- 20 `.blend` source files
- 160 PNG evidence renders
- 20 complete per-ID evidence groups
- Generator: `games/kawanakajima-foundry-samurai-proof/generate-v17-20-samurai.py`

## IDs

Takeda/red side: `takeda-01` through `takeda-10`.

Uesugi/blue side: `uesugi-01` through `uesugi-10`.

Each ID has:

- `{id}.glb`
- `{id}_source.blend`
- `{id}/front.png`
- `{id}/side_l.png`
- `{id}/rear.png`
- `{id}/qtr_fl.png`
- `{id}/qtr_fr.png`
- `{id}/top.png`
- `{id}/contact_sheet_{id}.png`
- `{id}/hero_{id}.png`

## Generation Method

Procedural Blender 3.4.1 script derived from the approved v17 pilot generator. The batch cycles four proven helmet/body variants across 20 IDs, with red Takeda and blue Uesugi material sets.

## Verification

- 20 GLBs, 20 sources, 160 PNGs, and 20 complete evidence groups verified.
- No missing required files.
- No fatal Python/Blender script markers found in the generation log.
- The generator's Blender `--list --ids=...` proof was repaired and verified after the initial chunk command accidentally rendered the whole batch.

## Visual Gate

Failed / not production approved. The assets are upright, framed, and samurai-themed, but representative contact sheets still show doll-like proportions, primitive/capsule limbs, simplified hands/feet, and blocky armor. They should not be promoted as final realistic game assets without another geometry/fidelity pass.

## Known Limitations

- Four geometry/helmet variants are cycled across 20 IDs, so the batch does not provide 20 materially unique silhouettes.
- Weighted-normal Auto Smooth warnings appear in Blender logs; no fatal Python exception markers were found.
- Asset generation completed, but visual review remains a failed downstream gate.
