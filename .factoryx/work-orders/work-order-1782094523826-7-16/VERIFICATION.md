# Verification — Samurai v19 Proof Pair

## Commands Run

- `python3 -m py_compile games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-repaired-full-20-v19/samurai_v19_blender.py` — PASS.
- Blender render for `takeda-01` with absolute `--spec` and `--out` paths — PASS after fixing the earlier relative-path failure.
- Blender render for `uesugi-01` with absolute `--spec` and `--out` paths — PASS.
- Log scans checked for `Error: Python`, `Traceback`, `Exception`, and `TypeError` after successful reruns — no failure markers in the final render logs.
- Contact sheets generated with PIL for both proof IDs.

## Visual Review

- `takeda-01/contact_sheet.png`: visibly red/crimson armor and red sashimono/banner.
- `uesugi-01/contact_sheet.png`: visibly blue/indigo armor and blue sashimono/banner.
- The variant-control proof passes: differences are visible in rendered images, not just in folder names or spec prose.

## Quality Finding

The proof pair is still not production-realistic. It reads as a stylized toy/mascot samurai: rounded torso, simplified cylindrical limbs, simplified feet/hands, and block-like armor slabs. This is acceptable as evidence that the clone/spec-consumption bug is fixed, but it is not a sufficient fidelity baseline for full 20 production or Unity promotion.

## Next Required Action

Create the next Blender iteration by improving anatomy/silhouette realism before scaling to 20: more human torso proportions, narrower armor following body shape, better neck/shoulder/hand/foot structure, less round face/torso, and faction/pose variation preserved. Only after a new proof pair visually passes should full 20 production resume.
