#!/usr/bin/env python3
"""
Batch driver for v17 samurai full-20 generation.
Wraps pilot4 helpers: build_samurai, reset_for_new_samurai, make_team_mats.
Outputs to samurai-v17/full-20/ with per-ID subdirectories.

Usage:
  blender --background --python batch_samurai_v17.py [--list] [--ids id1,id2,...] [--start N] [--end N]
  python3 batch_samurai_v17.py --list      # dry-run, no Blender needed
"""
import math
import os
import sys
from pathlib import Path

# Path resolution (before bpy import)
_SCRIPT_DIR = Path(__file__).resolve().parent
_ROOT = _SCRIPT_DIR.parents[1]
_GAME_DIR = _ROOT / "games" / "kawanakajima-foundry-samurai-proof"
_OUT_BASE = _GAME_DIR / "assets" / "generated" / "foundry" / "samurai-v17" / "full-20"

# All 20 samurai specs: (team, samurai_name, variant_idx)
_ALL_SAMURAI = [
    # Takeda (red side) - 10 variants
    ("takeda",    "takeda-01",    0),
    ("takeda",    "takeda-02",    1),
    ("takeda",    "takeda-03",    2),
    ("takeda",    "takeda-04",    3),
    ("takeda",    "takeda-05",    0),
    ("takeda",    "takeda-06",    1),
    ("takeda",    "takeda-07",    2),
    ("takeda",    "takeda-08",    3),
    ("takeda",    "takeda-09",    0),
    ("takeda",    "takeda-10",    1),
    # Uesugi (blue side) - 10 variants
    ("uesugi",    "uesugi-01",    0),
    ("uesugi",    "uesugi-02",    1),
    ("uesugi",    "uesugi-03",    2),
    ("uesugi",    "uesugi-04",    3),
    ("uesugi",    "uesugi-05",    0),
    ("uesugi",    "uesugi-06",    1),
    ("uesugi",    "uesugi-07",    2),
    ("uesugi",    "uesugi-08",    3),
    ("uesugi",    "uesugi-09",    0),
    ("uesugi",    "uesugi-10",    1),
]


def _parse_args():
    """Parse script arguments, ignoring Blender's own CLI flags."""
    args = sys.argv[1:]
    script_args = []
    for a in args:
        if a == "--":
            break
        script_args.append(a)

    do_list = "--list" in script_args
    ids_filter = None
    start_idx = None
    end_idx = None

    if "--ids" in script_args:
        idx = script_args.index("--ids")
        if idx + 1 < len(script_args):
            ids_filter = script_args[idx + 1].split(",")

    if "--start" in script_args:
        idx = script_args.index("--start")
        if idx + 1 < len(script_args):
            start_idx = int(script_args[idx + 1])

    if "--end" in script_args:
        idx = script_args.index("--end")
        if idx + 1 < len(script_args):
            end_idx = int(script_args[idx + 1])

    if do_list:
        specs = _ALL_SAMURAI
        if ids_filter:
            specs = [s for s in specs if s[1] in ids_filter]
        if start_idx is not None:
            specs = specs[start_idx:end_idx if end_idx is not None else None]
        print(f"Planned {len(specs)} samurai:")
        for team, name, vidx in specs:
            out_dir = _OUT_BASE / name
            print(f"    [{team:8s}] {name} (variant {vidx}) -> {out_dir}")
        return {"do_list": True, "specs": specs}

    specs = _ALL_SAMURAI
    if ids_filter:
        specs = [s for s in specs if s[1] in ids_filter]
    if start_idx is not None:
        specs = specs[start_idx:end_idx if end_idx is not None else None]
    return {"do_list": False, "specs": specs}


# Blender import (below argument parsing so --list works without Blender)
try:
    import bpy
    from mathutils import Vector
except Exception:
    if not _parse_args().get("do_list"):
        print("Run via: blender --background --python batch_samurai_v17.py", file=sys.stderr)
        sys.exit(1)
    sys.exit(0)

# Import pilot4 helpers - use absolute path for reliability in Blender context
sys.path.insert(0, str(_GAME_DIR))
sys.path.insert(0, str(_SCRIPT_DIR))

try:
    from generate_pilot4_samurai import (
        build_samurai,
        reset_for_new_samurai,
        make_team_mats,
    )
except ImportError as e:
    print(f"FATAL: Cannot import pilot4 helpers: {e}", file=sys.stderr)
    sys.exit(1)


def _export_glb(filepath):
    bpy.ops.export_scene.gltf(filepath=str(filepath), export_format="GLB",
                             export_materials="EXPORT", export_apply=True)
    print(f"  GLB exported: {filepath}")


def _save_blend(filepath):
    bpy.ops.wm.save_as_mainfile(filepath=str(filepath))
    print(f"  Blend saved: {filepath}")


def _render_views_per_id(samurai_name, out_dir):
    """Render views with unique per-ID filenames under samurai_name/."""
    views = [
        ("front",      (-1.55, -3.0, 1.25), (0, 0, 0.95), 48),
        ("side_l",     (3.0, -0.2, 1.2),      (0, 0, 0.95), 52),
        ("rear",       (-1.55, 3.0, 1.25),     (0, 0, 0.95), 48),
        ("qtr_fl",     (-2.1, -2.5, 1.35), (0, 0, 0.98), 48),
        ("qtr_fr",     (2.1, -2.5, 1.35),     (0, 0, 0.98), 48),
        ("top",        (0.12, -0.2, 3.65), (0, 0, 0.82), 34),
    ]

    rendered = []
    for name, loc, target, lens in views:
        cam_data = bpy.data.cameras.new(f"cam_{samurai_name}_{name}")
        cam = bpy.data.objects.new(f"cam_{samurai_name}_{name}", cam_data)
        bpy.context.collection.objects.link(cam)
        bpy.context.scene.camera = cam

        cam.location = loc
        cam.data.lens = lens
        cam.data.sensor_width = 32

        direction = Vector(target) - cam.location
        cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

        path = out_dir / f"{name}.png"
        bpy.context.scene.render.filepath = str(path)
        bpy.context.view_layer.update()
        bpy.ops.render.render(write_still=True)
        rendered.append(path)
        print(f"  Rendered {name} -> {path}")

    # Contact sheet (4 views)
    try:
        from PIL import Image as PILImage
        sheet = PILImage.new("RGB", (1440, 1800), (18, 16, 13))
        positions = [(0, 0), (720, 0), (0, 900), (720, 900)]
        for i, path in enumerate(rendered[:4]):
            sheet.paste(PILImage.open(path).resize((720, 900)), positions[i])
        sheet_path = out_dir / f"contact_sheet_{samurai_name}.png"
        sheet.save(str(sheet_path))
        print(f"  Contact sheet: {sheet_path}")
    except Exception as exc:
        print(f"  Contact sheet compose skipped: {exc}")

    # Hero shot
    cam_data_hero = bpy.data.cameras.new(f"cam_{samurai_name}_hero")
    cam_hero = bpy.data.objects.new(f"cam_{samurai_name}_hero", cam_data_hero)
    bpy.context.collection.objects.link(cam_hero)
    bpy.context.scene.camera = cam_hero
    cam_hero.location = (-1.45, -2.85, 1.2)
    cam_hero.data.lens = 45
    cam_hero.data.sensor_width = 32
    direction = Vector((0, 0, 0.98)) - cam_hero.location
    cam_hero.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

    hero_path = out_dir / f"hero_{samurai_name}.png"
    bpy.context.scene.render.filepath = str(hero_path)
    bpy.context.view_layer.update()
    bpy.ops.render.render(write_still=True)
    print(f"  Hero shot: {hero_path}")


def main():
    args = _parse_args()
    if args["do_list"]:
        return

    specs = args["specs"]
    print(f"\n{'='*60}")
    print(f"Samurai Batch - {len(specs)} assets")
    print(f"{'='*60}")

    _OUT_BASE.mkdir(parents=True, exist_ok=True)

    all_meshes = {}
    for i, (team, samurai_name, variant_idx) in enumerate(specs):
        print(f"\n[{i+1}/{len(specs)}] Building: {samurai_name} (variant {variant_idx})")
        print(f"{'='*60}")

        # Per-ID output directory
        out_dir = _OUT_BASE / samurai_name
        out_dir.mkdir(parents=True, exist_ok=True)

        # Reset and build
        reset_for_new_samurai()
        M = make_team_mats(team)
        mesh_count = build_samurai(variant_idx, samurai_name, M)
        all_meshes[samurai_name] = mesh_count

        # Save blend and export GLB
        blend_path = out_dir / f"{samurai_name}_source.blend"
        _save_blend(blend_path)

        glb_path = out_dir / f"{samurai_name}.glb"
        _export_glb(glb_path)

        # Render views (per-ID filenames)
        _render_views_per_id(samurai_name, out_dir)

        # Clean for next samurai
        reset_for_new_samurai()

    # Summary
    print(f"\n{'='*60}")
    print("Full 20 Samurai Batch Complete")
    print(f"{'='*60}")
    for name, count in all_meshes.items():
        print(f"      {name}: {count} mesh objects")
    print(f"\nAll artifacts in: {_OUT_BASE}")


if __name__ == "__main__":
    main()
