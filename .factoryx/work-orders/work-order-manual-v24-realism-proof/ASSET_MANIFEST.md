# Samurai v24 Realism Proof Asset Manifest

Manual proof branch: `factoryx/factory-edo-woodblock/samurai-v24-realism-proof-pair`

This proof preserves a paired Takeda/Uesugi samurai render generated through the Blender asset foundry path. It follows v23 and tests whether tighter human proportions and less primitive limb exposure improve the visual quality enough to justify expanding to the full twenty-character batch.

## Generated Bundle

Bundle path:

`games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v24/`

Generator:

`games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v24/samurai_v24_blender.py`

## Assets

### Takeda Proof Character

Directory:

`games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v24/takeda-01/`

Primary outputs:

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
- `blender_takeda-01.log`

### Uesugi Proof Character

Directory:

`games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v24/uesugi-01/`

Primary outputs:

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
- `blender_uesugi-01.log`

## v24 Intent

v24 is a realism-oriented iteration over v23. The generator changes were focused on the most visible v23 blockers:

- Reduced kabuto helmet, brim, crest, side flanges, forehead, and mempo scale.
- Tightened shoulder armor closer to the torso.
- Replaced exposed upper-arm read with longer sleeve cloth.
- Broadened hakama cloth and deepened side folds.
- Darkened faction colors to reduce plastic primary-color intensity.
- Added small lacquer scuffs to break up overly flat armor surfaces.
- Preserved v23's paired faction output, Blender source export, GLB export, and repeatable camera views.

## Verdict

This is a useful improvement over v23, but it is not yet a production-pass character set. The characters read less bobbleheaded and less wide-shouldered, and the faction variants remain consistent. However, the torso, limbs, armor plates, and face/mask still reveal too much primitive construction. The visual gate remains failed, so the system should not expand this generator to the remaining eighteen samurai or proceed to Unity world assembly yet.
