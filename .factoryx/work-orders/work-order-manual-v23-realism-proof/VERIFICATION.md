# Samurai v23 Realism Proof Verification

Verification date: 2026-06-21

Worktree:

`/tmp/studio-edo-v23`

Branch:

`factoryx/factory-edo-woodblock/samurai-v23-realism-proof-pair`

## Commands Run

Generator syntax check:

```bash
python3 -m py_compile games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v23/samurai_v23_blender.py
```

Blender log scan:

```bash
for log in games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v23/*/blender_*.log; do
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

- `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v23/takeda-01/contact_sheet.png`
- `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v23/uesugi-01/contact_sheet.png`

Observed improvements over v22:

- Better faction readability with less saturated lacquer colors.
- Armor lacing improves surface detail and removes some of the plain block read.
- Cloth panels and hakama elements make the lower body less cylindrical.
- The bead-armor failure from v21 remains fixed.

Remaining visual blockers:

- Helmet and head still read oversized and mascot-like.
- Arms and legs still use visibly simplified primitive construction.
- Armor plates still lack enough varied scale, thickness, wear, and material breakup for realism.
- Face/mempo area remains too geometric.
- Overall result is still closer to a stylized toy miniature than a realistic game-world samurai.

## Gate Decision

Mechanical render/export gate: pass.

Visual realism gate: fail.

The system should continue with a narrower next iteration before generating the remaining eighteen characters or feeding the set into Unity. The next proof should prioritize anatomically credible proportions, smaller helmet/head mass, non-primitive limb forms, layered cloth/armor thickness, and less uniform material response.
