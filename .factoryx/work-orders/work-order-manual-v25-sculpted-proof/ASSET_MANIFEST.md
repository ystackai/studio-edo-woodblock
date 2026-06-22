# Samurai v25 Sculpted Proof Asset Manifest

Manual proof branch: `factoryx/factory-edo-woodblock/samurai-v25-sculpted-proof-pair`

This proof preserves a paired Takeda/Uesugi samurai render generated through the Blender asset foundry path. It follows v24 and tests whether replacing flat block cloth with sculpted mesh panels and procedural material breakup is enough to move the proof toward the requested high-quality samurai assets.

## Generated Bundle

Bundle path:

`games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v25/`

Generator:

`games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v25/samurai_v25_blender.py`

## Assets

Both `takeda-01` and `uesugi-01` include:

- `samurai_character.glb`
- `samurai_character_source.blend`
- `contact_sheet.png`
- `samurai_character_hero.png`
- `samurai_character_front.png`
- `samurai_character_left.png`
- `samurai_character_rear.png`
- `samurai_character_top.png`
- `samurai_character_three_quarter.png`
- `turntable_000.png` through `turntable_007.png`
- `spec.json`
- `blender_outputs.json`
- Blender render log

## v25 Intent

v25 is a construction-method iteration over v24:

- Added sculpted mesh cloth panels with folds instead of cube-based robe panels.
- Added mesh hakama folds and sleeve surfaces.
- Added procedural displacement/noise to lacquer and cloth surfaces.
- Preserved v24's compact helmet/head and darker faction colors.
- Preserved paired faction output, Blender source export, GLB export, and repeatable camera views.

## Verdict

v25 improves the leg cloth and surface variation, but it still does not pass the visual realism gate. The asset still reads as a stylized miniature assembled from procedural components. The next productive strategy should use a humanoid base mesh or generated rigged/sculpted body before armor layering, rather than continuing to tune procedural primitives.
