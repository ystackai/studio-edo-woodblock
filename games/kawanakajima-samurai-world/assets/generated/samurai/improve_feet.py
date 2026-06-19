#!/usr/bin/env python3
"""Quick improvement pass: make waraji sandals less paddle-like by giving volume and toe definition.
Run: blender -b --python improve_feet.py -- --in-blend /path.blend --out-glb /out.glb
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def args_after_dash():
    if "--" in sys.argv:
        return sys.argv[sys.argv.index("--") + 1:]
    return sys.argv[1:]


def improve_sandals():
    changed = 0
    for obj in list(bpy.data.objects):
        if "waraji" in obj.name.lower() and obj.type == 'MESH':
            # give some height and rounder look by scaling local z a bit and moving
            obj.scale[2] = 1.6  # thicker sole
            # add a simple toe cap as child cylinder if possible
            try:
                loc = obj.location
                # create a small bevel-ish by adding a thin cylinder at front
                bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.12, location=(loc[0], loc[1]-0.08 if 'left' in obj.name.lower() else loc[1]+0.08, loc[2]+0.01), rotation=(0,0,1.57))
                toe = bpy.context.object
                toe.name = obj.name + " toe"
                toe.scale = (1.0, 0.6, 0.5)
                # parent roughly
                toe.parent = obj
                changed += 1
            except Exception:
                pass
    # also try to smooth more
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            try:
                bpy.context.view_layer.objects.active = obj
                obj.select_set(True)
                bpy.ops.object.shade_smooth()
                obj.select_set(False)
            except Exception:
                pass
    return changed


def export_glb(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(path), export_format="GLB", export_yup=True)


def main():
    argv = args_after_dash()
    ap = argparse.ArgumentParser()
    ap.add_argument("--in-blend", required=True)
    ap.add_argument("--out-glb", required=True)
    ap.add_argument("--team", default="takeda")
    args = ap.parse_args(argv)

    bpy.ops.wm.open_mainfile(filepath=str(Path(args.in_blend).resolve()))
    n = improve_sandals()
    print(f"Improved {n} sandals, added volume/toe detail")
    export_glb(Path(args.out_glb).resolve())
    print("Exported improved", args.out_glb)


if __name__ == "__main__":
    main()
