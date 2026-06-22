# Samurai v17 Asset Smoke Evidence

Work order: `work-order-1782088443501-7-1`

## Produced smoke asset

- `games/kawanakajima-foundry-samurai-proof/generate-samurai-v17-batch.py`
  - Compact driver with Python-only and Blender `--list` support.
  - Proves filtered chunk selection before rendering.
- `games/kawanakajima-foundry-samurai-proof/generate-pilot5-samurai.py`
  - Patched banner variant indexing to cycle known banner data instead of failing on variants 4+.
- `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/full-20/takeda-01/`
  - `takeda-01.glb`
  - `takeda-01_source.blend`
  - `cs_front.png`
  - `cs_side_l.png`
  - `cs_rear.png`
  - `cs_qtr_fl.png`
  - `cs_qtr_fr.png`
  - `cs_top.png`
  - `contact_sheet.png`
  - `hero.png`

## Verification

- `python3 -m py_compile games/kawanakajima-foundry-samurai-proof/generate-samurai-v17-batch.py`
- `timeout 10s python3 games/kawanakajima-foundry-samurai-proof/generate-samurai-v17-batch.py --list --start 0 --end 2`
- `timeout 30s blender --background --python generate-samurai-v17-batch.py -- --list --start 0 --end 2`
- `timeout 240s blender --background --python generate-samurai-v17-batch.py -- --start 0 --end 1`

## Visual gate result

Failed. The smoke render is bright and framed, and GLB/BLEND/PNG evidence exists, but the character still reads as a toy/block mannequin rather than a production-quality samurai:

- capsule/doll body proportions
- cylinder-like limbs and simple paddle feet
- armor plates pasted onto a simplified body
- low-fidelity helmet/face treatment

Per the asset gate, the full 20-asset batch should not continue from this style. The next attempt should improve or replace the pilot geometry before rendering more variants.
