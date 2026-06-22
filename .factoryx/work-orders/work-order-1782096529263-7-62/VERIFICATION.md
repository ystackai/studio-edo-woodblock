# Verification - Samurai v21 Realism Proof Pair

## Commands

- `python3 -m py_compile samurai_v21_blender.py` - PASS.
- `blender -b -P samurai_v21_blender.py -- --spec takeda-01/spec.json --out takeda-01` - PASS, exit 0.
- `blender -b -P samurai_v21_blender.py -- --spec uesugi-01/spec.json --out uesugi-01` - PASS, exit 0.
- Blender logs scanned for `Error: Python`, `Traceback`, `Exception`, and `TypeError` - PASS.
- Contact sheets generated with PIL for both IDs - PASS.

## Visual Review

### Improvements Over v20

- The round mascot torso is reduced. v21 uses a slimmer ribcage/waist underbody and separate upper/lower cuirass shell.
- The front armor no longer reads as flat rectangular slabs. The visible lamellar rows are curved ellipsoid plate volumes.
- Hands are no longer cube gloves. They use palm volumes, curve fingers, fingertip volumes, and opposed thumbs.
- Feet are longer and more grounded, with split-toe tabi/waraji treatment.
- Takeda and Uesugi faction color control still works: red Takeda and blue Uesugi are visibly distinct.

### Remaining Issues

- v21 is still stylized and toy-like in the face/helmet treatment.
- The repeated rounded lamellar plates now read slightly bead-like from the front.
- The side view remains thin and some props still obscure body readability.
- This is an improvement proof, not production-ready final samurai art.

## Gate Result

Visual gate: **partial improvement, not final production pass**.

Do not proceed directly to the full 20-character batch or Unity integration from v21 unless the desired art bar is accepted as stylized/funny rather than realistic. The next lowest-waste action is either:

- v22 proof focused on realistic face/helmet/armor material treatment and less bead-like lamellar geometry, or
- accept the stylized direction explicitly and generate the full 20 with variant controls.
