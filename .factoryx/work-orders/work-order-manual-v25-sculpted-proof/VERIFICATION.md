# Samurai v25 Sculpted Proof Verification

Verification date: 2026-06-21

Worktree:

`/tmp/studio-edo-v25`

Branch:

`factoryx/factory-edo-woodblock/samurai-v25-sculpted-proof-pair`

## Commands Run

Generator syntax check:

```bash
python3 -m py_compile games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v25/samurai_v25_blender.py
```

Blender log scan:

```bash
for log in games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v25/*/blender_*.log; do
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

- `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v25/takeda-01/contact_sheet.png`
- `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v25/uesugi-01/contact_sheet.png`

Observed improvements over v24:

- Hakama and sleeve areas have more organic folds.
- Legs read less like flat cuboids.
- Lacquer and cloth surfaces have more breakup.
- Paired faction variants remain consistent.

Remaining visual blockers:

- Armor rows are still too uniform and procedural.
- Face/mempo remains simplified.
- Torso still reads as assembled components rather than a human body under armor.
- Overall result remains stylized and miniature-like, not realistic enough for the requested high-quality game assets.

## Gate Decision

Mechanical render/export gate: pass.

Visual realism gate: fail.

The next proof should change strategy: use or generate a humanoid base mesh with more natural body proportions, then layer armor and cloth onto that base. Continuing to adjust the current primitive/plate generator is unlikely to produce the requested quality.
