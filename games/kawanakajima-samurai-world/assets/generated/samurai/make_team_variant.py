#!/usr/bin/env python3
"""Fast team variant exporter for Kawanakajima samurai.
Run with: blender -b --python this.py -- --blend /abs/source.blend --team takeda --out-glb /abs/out.glb
"""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

import bpy


def args_after_dash():
    if "--" in sys.argv:
        return sys.argv[sys.argv.index("--") + 1:]
    return sys.argv[1:]


def recolor_for_team(team: str):
    """Replace key material colors in current scene for team side."""
    team = team.lower()
    if team == "takeda":
        primary = (0.42, 0.035, 0.025)  # oxblood lacquer
        secondary = (0.025, 0.035, 0.085)  # indigo cloth
        crest = (0.75, 0.55, 0.15)
        lacing = (0.55, 0.38, 0.18)
    elif team == "uesugi":
        primary = (0.025, 0.04, 0.12)  # deep indigo
        secondary = (0.18, 0.06, 0.04)
        crest = (0.65, 0.62, 0.58)
        lacing = (0.42, 0.30, 0.15)
    else:
        primary = (0.125, 0.012, 0.010)
        secondary = (0.018, 0.030, 0.060)
        crest = (0.58, 0.39, 0.13)
        lacing = (0.47, 0.34, 0.17)

    changed = []
    for m in bpy.data.materials:
        if not m.use_nodes:
            continue
        bsdf = m.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            continue
        name_l = m.name.lower()
        old = tuple(bsdf.inputs["Base Color"].default_value[:3])
        if any(k in name_l for k in ("lacquer", "do", "cuirass", "sode", "kusazuri", "mempo", "helmet", "kabuto", "armor")):
            bsdf.inputs["Base Color"].default_value = (*primary, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.48
            changed.append((m.name, "primary"))
        elif any(k in name_l for k in ("cloth", "hakama", "under", "silk")):
            bsdf.inputs["Base Color"].default_value = (*secondary, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.82
            changed.append((m.name, "secondary"))
        elif any(k in name_l for k in ("crest", "maedate", "brass", "fitting")):
            bsdf.inputs["Base Color"].default_value = (*crest, 1.0)
            bsdf.inputs["Metallic"].default_value = 0.55
            changed.append((m.name, "crest"))
        elif "cord" in name_l or "lacing" in name_l or "odoshi" in name_l:
            bsdf.inputs["Base Color"].default_value = (*lacing, 1.0)
            changed.append((m.name, "lacing"))
    return changed


def export_glb(out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        bpy.ops.export_scene.gltf(filepath=str(out_path), export_format="GLB", export_yup=True)
        return True, None
    except Exception as e:
        return False, str(e)


def main():
    argv = args_after_dash()
    ap = argparse.ArgumentParser()
    ap.add_argument("--blend", required=True)
    ap.add_argument("--team", required=True, choices=["takeda", "uesugi", "neutral"])
    ap.add_argument("--out-glb", required=True)
    ap.add_argument("--out-blend", default=None)
    args = ap.parse_args(argv)

    # Load the source blend (replaces current scene)
    bpy.ops.wm.open_mainfile(filepath=str(Path(args.blend).resolve()))

    changed = recolor_for_team(args.team)
    print(f"Recolored {len(changed)} materials for team={args.team}: {[c[0] for c in changed[:6]]}...")

    if args.out_blend:
        bpy.ops.wm.save_as_mainfile(filepath=str(Path(args.out_blend).resolve()))

    ok, err = export_glb(Path(args.out_glb).resolve())
    if not ok:
        print("GLB export error:", err, file=sys.stderr)
        sys.exit(2)

    side = Path(args.out_glb).with_suffix(".variant.json")
    side.write_text(json.dumps({
        "source_blend": str(Path(args.blend).resolve()),
        "team": args.team,
        "changed_materials": len(changed),
        "glb": str(Path(args.out_glb).resolve()),
    }, indent=2))
    print("Exported", args.out_glb)


if __name__ == "__main__":
    main()
