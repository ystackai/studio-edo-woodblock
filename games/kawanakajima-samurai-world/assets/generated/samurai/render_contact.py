#!/usr/bin/env python3
"""Fast low-res contact/turntable renderer using a saved samurai .blend.
Usage: blender -b --python render_contact.py -- --blend /path/source.blend --out /path/outdir --prefix prefix
Renders 6 views + 4 turntable frames at low cost, builds contact sheet + turntable gif if PIL avail.
"""
from __future__ import annotations
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def args_after_dash():
    if "--" in sys.argv:
        return sys.argv[sys.argv.index("--") + 1:]
    return sys.argv[1:]


def look_at(obj, target):
    direction = Vector(target) - Vector(obj.location)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def main():
    argv = args_after_dash()
    ap = argparse.ArgumentParser()
    ap.add_argument("--blend", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--prefix", default="samurai")
    args = ap.parse_args(argv)

    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)

    bpy.ops.wm.open_mainfile(filepath=str(Path(args.blend).resolve()))

    scene = bpy.context.scene
    # Speed tweaks
    scene.render.engine = "BLENDER_EEVEE"
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 8
        scene.eevee.use_gtao = False
    scene.render.resolution_x = 512
    scene.render.resolution_y = 440
    scene.view_settings.view_transform = "Filmic"

    # Find or create camera
    cam = None
    for o in scene.objects:
        if o.type == 'CAMERA':
            cam = o
            break
    if cam is None:
        bpy.ops.object.camera_add(location=(3.0, -4.0, 2.2))
        cam = bpy.context.object
    scene.camera = cam

    views = {
        "hero": ((3.0, -4.0, 2.2), (0, -0.05, 1.5), 55),
        "front": ((0, -4.8, 1.65), (0, 0, 1.4), 65),
        "left": ((-4.2, -0.1, 1.6), (0, 0, 1.4), 65),
        "rear": ((0, 4.5, 1.6), (0, 0, 1.4), 65),
        "top": ((0.05, -0.2, 5.0), (0, 0, 1.2), 55),
        "three_quarter": ((-3.3, -3.5, 2.0), (0, 0, 1.4), 52),
    }

    render_paths = {}
    for name, (loc, target, lens) in views.items():
        cam.location = loc
        look_at(cam, target)
        cam.data.lens = lens
        scene.render.filepath = str(out / f"{args.prefix}_{name}.png")
        bpy.ops.render.render(write_still=True)
        render_paths[name] = scene.render.filepath
        print("rendered", name)

    # 4 frame turntable
    frames = []
    for i in range(4):
        angle = (math.pi * 2) * i / 4
        cam.location = (math.sin(angle) * 4.0, math.cos(angle) * -4.0, 1.95)
        look_at(cam, (0, 0, 1.45))
        cam.data.lens = 52
        fp = str(out / f"{args.prefix}_turn{i:02d}.png")
        scene.render.filepath = fp
        bpy.ops.render.render(write_still=True)
        frames.append(fp)
        print("turn", i)

    # Try contact sheet
    try:
        from PIL import Image, ImageDraw
        thumbs = []
        labels = []
        for name in ["hero","front","left","rear","top","three_quarter"]:
            pp = out / f"{args.prefix}_{name}.png"
            if pp.exists():
                img = Image.open(pp).convert("RGB")
                img.thumbnail((280, 240))
                thumbs.append(img.copy())
                labels.append(name)
        if thumbs:
            cols = 2
            rows = (len(thumbs) + 1) // cols
            sheet = Image.new("RGB", (cols*300, rows*260 + 30), (18, 18, 18))
            draw = ImageDraw.Draw(sheet)
            for idx, img in enumerate(thumbs):
                x = (idx % cols) * 300
                y = (idx // cols) * 260 + 20
                sheet.paste(img, (x + (300 - img.width)//2 , y))
                draw.text((x + 12, y + img.height + 4), labels[idx], fill=(220, 215, 200))
            draw.text((12, 4), f"{args.prefix} contact (fast rig)", fill=(230, 225, 210))
            sheet.save(out / f"{args.prefix}_contact_sheet.png")
            print("contact sheet written")
        # simple gif from 4 turns
        if len(frames) >= 2:
            fs = []
            for fp in frames:
                im = Image.open(fp).convert("RGB")
                im.thumbnail((400, 340))
                fs.append(im.copy())
            fs[0].save(out / f"{args.prefix}_turntable_fast.gif", save_all=True, append_images=fs[1:], duration=120, loop=0)
            print("fast turntable gif written")
    except Exception as e:
        print("PIL post failed (nonfatal):", e)

    meta = {
        "blend": str(args.blend),
        "prefix": args.prefix,
        "renders": render_paths,
        "turn_frames": frames,
    }
    (out / f"{args.prefix}_render_meta.json").write_text(json.dumps(meta, indent=2))
    print("done")


if __name__ == "__main__":
    main()
