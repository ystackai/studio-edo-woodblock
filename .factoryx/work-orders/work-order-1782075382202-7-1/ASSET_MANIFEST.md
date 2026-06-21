# Asset Manifest - v17 Full 20 Samurai Batch

Work Order: work-order-1782075382202-7-1
Generated: 2026-06-21
Generator: games/kawanakajima-foundry-samurai-proof/generate-samurai-v17-full20.py
Output root: games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/full-20/

## Scope

Generated 20 reviewable Blender samurai assets for Kawanakajima: 10 Takeda/red-side IDs and 10 Uesugi/blue-side IDs.

## Asset IDs

- takeda-01
- takeda-02
- takeda-03
- takeda-04
- takeda-05
- takeda-06
- takeda-07
- takeda-08
- takeda-09
- takeda-10
- uesugi-01
- uesugi-02
- uesugi-03
- uesugi-04
- uesugi-05
- uesugi-06
- uesugi-07
- uesugi-08
- uesugi-09
- uesugi-10

## Evidence Per ID

Each ID has:

- `{id}.glb` runtime export
- `{id}_source.blend` Blender source
- `{id}/cs_front.png`
- `{id}/cs_side_l.png`
- `{id}/cs_rear.png`
- `{id}/cs_qtr_fl.png`
- `{id}/cs_qtr_fr.png`
- `{id}/cs_top.png`
- `{id}/contact_sheet.png`
- `{id}/hero.png`

## Counts

- GLB exports: 20
- Blender source files: 20
- PNG evidence files: 160
- Complete per-ID render evidence groups: 20
- Approximate asset root size: 200 MB

## Generation Notes

- Started from the approved repo pilot script and expanded the spec list to `takeda-01..takeda-10` and `uesugi-01..uesugi-10`.
- Added per-ID render directories so contact sheets and hero renders are not overwritten by later variants.
- Added resumable `--start/--end` rendering and cycled the four proven pilot geometry variants with modulo for the full 20-ID batch.
- Blender logs for the preserved chunks contained zero fatal Python markers: `Error: Python`, `Traceback`, `Exception`, `TypeError`, or `IndexError`.
- Blender emitted weighted-normal auto-smooth warnings. These did not stop export/render generation but should be treated as polish debt.

## Visual Limitations

This manifest does not approve the visual gate. Manual inspection of `takeda-01/contact_sheet.png` showed an upright, fully framed, readable samurai-themed model with armor, kabuto, sword, banner, and footwear. It also remains stylized/toy-like with primitive body volumes and should go through a separate visual-review gate before promotion to production assets.

## Intervention Notes

During monitoring, a recovery command used `blender ... -- --start ...`, while the script initially parsed arguments with `argparse.parse_known_args()` over raw `sys.argv`. That caused the parser to ignore the intended slice and begin a duplicate full rerender. The duplicate process was stopped, the live generator was patched to strip Blender's `--` separator before parsing render filters, and FactoryX prompt guidance was patched upstream so future workers prove the exact Blender chunk command selects the intended IDs.
