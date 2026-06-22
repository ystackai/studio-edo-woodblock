# Verification - Samurai v22 Realism Proof Pair

## Commands

- `python3 -m py_compile samurai_v22_blender.py` - PASS.
- `blender -b -P samurai_v22_blender.py -- --spec takeda-01/spec.json --out takeda-01` - PASS, exit 0.
- `blender -b -P samurai_v22_blender.py -- --spec uesugi-01/spec.json --out uesugi-01` - PASS, exit 0.
- Blender logs scanned for `Error: Python`, `Traceback`, `Exception`, and `TypeError` - PASS.
- Contact sheets generated with PIL for both IDs - PASS.

## Visual Review

### Improvements Over v21

- The bead-like armor regression is fixed. Cuirass rows now read as bevelled lamellar plate bands rather than strings of spheres.
- The face/mempo is more angular and armored, less like a painted ball.
- Helmet and rear shikoro mass are reduced, improving the top/side silhouette.
- Takeda/Uesugi faction control still works: red Takeda and blue Uesugi are visibly distinct.

### Remaining Issues

- The character remains stylized and toy-like rather than realistic.
- Side views remain thin, and swords/banner/poles still obscure body readability.
- Limbs and armor are still procedural primitives rather than a realistic sculpted human/armor mesh.
- This proof should not be treated as a high-quality final asset for the full 20-character batch unless the art direction is explicitly accepted as stylized/funny.

## Gate Result

Visual gate: **improved over v21, still not final high-realism production pass**.

Recommended next step: either accept the stylized direction and generate the 20-character batch with material/pose/weapon/banner variants, or switch to a fundamentally different mesh strategy for v23 instead of further primitive tweaking.
