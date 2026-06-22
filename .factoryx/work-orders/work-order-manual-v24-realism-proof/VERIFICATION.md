# Samurai v24 Realism Proof Verification

Verification date: 2026-06-21

Worktree:

`/tmp/studio-edo-v24`

Branch:

`factoryx/factory-edo-woodblock/samurai-v24-realism-proof-pair`

## Commands Run

Generator syntax check:

```bash
python3 -m py_compile games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v24/samurai_v24_blender.py
```

Blender log scan:

```bash
for log in games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v24/*/blender_*.log; do
  grep -E 'Error: Python|Traceback|Exception|TypeError' "$log"
done
```

Result: no Python errors, tracebacks, exceptions, or type errors were found in either Blender log.

## Output Presence

Both proof characters produced:

- GLB runtime asset
- Blend source file
- Six named still views
- Eight turntable frames
- Contact sheet
- Spec JSON
- Blender output JSON
- Blender render log

## Visual Inspection

Contact sheets inspected:

- `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v24/takeda-01/contact_sheet.png`
- `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v24/uesugi-01/contact_sheet.png`

Observed improvements over v23:

- Helmet/head mass is smaller and less mascot-like.
- Shoulders are less broad and less detached from the torso.
- Sleeves and hakama cover more primitive limb geometry.
- Darker faction materials reduce the toy-like plastic color read.
- Surface scuffs add a small amount of material breakup.

Remaining visual blockers:

- Body still reads as assembled from primitives rather than sculpted anatomy under armor.
- Armor plates remain too uniform and mechanically placed.
- Face/mempo remains simplified and blocky.
- Hands, feet, and weapons are serviceable but not realistic enough for a high-quality game asset.
- Overall character still reads as stylized miniature rather than realistic samurai.

## Gate Decision

Mechanical render/export gate: pass.

Visual realism gate: fail.

The next proof should move beyond primitive assembly and either use a skinned humanoid base mesh or generate a more continuous sculpted mesh before adding armor. Continuing to tune plate dimensions alone is unlikely to reach the requested visual bar.
