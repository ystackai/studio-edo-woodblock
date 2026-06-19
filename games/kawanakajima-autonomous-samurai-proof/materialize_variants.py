#!/usr/bin/env python3
"""Materialize 20 team variant GLBs from the Foundry baseline source .blend.
Uses direct bpy color shifts on key materials for Takeda (oxblood) vs Uesugi (indigo).
"""
from __future__ import annotations
import bpy
import sys
from pathlib import Path
import math

BASE_BLEND = Path("assets/samurai-baseline-source.blend").resolve()
OUT_DIR = Path("assets").resolve()
OUT_DIR.mkdir(parents=True, exist_ok=True)

TAKEDA_COUNT = 10
UESUGI_COUNT = 10

# Material name fragments from the recipe we observed
LACQUER = "deep oxblood urushi lacquer"
CLOTH = "weathered indigo cloth"
BANNER = "battlefield sashimono cloth"
IRON = "dark burnished iron with subtle wear"

def tint_material(mat, base_rgb, roughness=None, metallic=None):
    if not mat or not mat.use_nodes:
        return
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if not bsdf:
        return
    bsdf.inputs["Base Color"].default_value = (*base_rgb, 1.0)
    if roughness is not None:
        bsdf.inputs["Roughness"].default_value = roughness
    if metallic is not None:
        bsdf.inputs["Metallic"].default_value = metallic

def build_variant(team: str, idx: int, lacquer_rgb, cloth_rgb, banner_rgb, extra_rot=0.0):
    # reload clean each time
    bpy.ops.wm.open_mainfile(filepath=str(BASE_BLEND))

    # find and tint
    for mat in bpy.data.materials:
        name = mat.name.lower()
        if "oxblood" in name or "lacquer" in name:
            tint_material(mat, lacquer_rgb, roughness=0.48)
        elif "indigo" in name or "cloth" in name:
            tint_material(mat, cloth_rgb, roughness=0.78)
        elif "sashimono" in name or "banner" in name:
            tint_material(mat, banner_rgb, roughness=0.82)
        elif "iron" in name:
            # slight wear variation
            tint_material(mat, (0.04, 0.038, 0.036), roughness=0.32, metallic=0.78)

    # Slight unique pose/turn per actor for visual distinction (no two identical in frame)
    for obj in bpy.data.objects:
        if obj.type == 'MESH' and ("arm" in obj.name.lower() or "katana" in obj.name.lower() or "hand" in obj.name.lower()):
            obj.rotation_euler[2] += math.radians(extra_rot * 0.6)
        if "banner" in obj.name.lower() or "sashimono" in obj.name.lower():
            obj.rotation_euler[1] += math.radians(extra_rot * 0.3)

    # export
    safe_team = team.lower()
    out_name = f"actor-{safe_team}-{idx:02d}"
    glb_path = OUT_DIR / f"{out_name}.glb"
    try:
        bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", export_yup=True)
        print(f"exported {glb_path}")
    except Exception as e:
        print("export error", glb_path, e)
        (OUT_DIR / f"{out_name}.error").write_text(str(e))

def main():
    # Takeda oxblood team (more saturated red lacquer, warm banner)
    for i in range(TAKEDA_COUNT):
        rot = (i - 4.5) * 1.2
        build_variant("takeda", i, 
                      lacquer_rgb=(0.18, 0.02, 0.015),   # deeper oxblood
                      cloth_rgb=(0.022, 0.028, 0.055), 
                      banner_rgb=(0.16, 0.025, 0.02), 
                      extra_rot=rot)

    # Uesugi indigo team (cooler indigo lacquer/cloth/banner dominant)
    for i in range(UESUGI_COUNT):
        rot = (i - 4.5) * -1.1
        build_variant("uesugi", i, 
                      lacquer_rgb=(0.03, 0.05, 0.12),    # indigo-ish armor
                      cloth_rgb=(0.015, 0.035, 0.09), 
                      banner_rgb=(0.02, 0.045, 0.11), 
                      extra_rot=rot)

    print("20 variants materialized.")

if __name__ == "__main__":
    main()
