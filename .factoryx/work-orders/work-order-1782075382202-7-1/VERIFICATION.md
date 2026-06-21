# Verification - v17 Full 20 Samurai Batch

- `python3 games/kawanakajima-foundry-samurai-proof/generate-samurai-v17-full20.py --list` printed exactly 20 planned IDs.
- Blender 3.4.1 was available in the worker container.
- Render/export evidence after intervention:
  - GLB exports: 20
  - Blender source files: 20
  - PNG evidence files: 160
  - Complete per-ID render groups: 20
- Fatal marker scan across preserved Blender chunk logs returned 0 matches for `Error: Python`, `Traceback`, `Exception`, `TypeError`, and `IndexError`.
- Manual visual spot-check: `takeda-01/contact_sheet.png` is upright and fully framed, but stylized/toy-like. This is evidence for review, not visual approval.

Known limitations:

- Variants cycle four base silhouettes/material arrangements across 20 IDs.
- Blender weighted-normal auto-smooth warnings remain in logs.
- Separate visual review is still required before production promotion.
