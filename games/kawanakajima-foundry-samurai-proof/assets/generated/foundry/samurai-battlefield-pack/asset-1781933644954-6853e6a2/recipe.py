#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw


BLENDER_SCRIPT = r'''
from __future__ import annotations

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


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def look_at(obj, target):
    direction = Vector(target) - Vector(obj.location)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def mat(name, color, rough=0.65, metallic=0.0):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (color[0], color[1], color[2], color[3] if len(color) > 3 else 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    return material


def assign(obj, material):
    obj.data.materials.append(material)
    return obj


def smooth(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    try:
        bpy.ops.object.shade_smooth()
    except Exception:
        pass
    obj.select_set(False)
    try:
        obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    except Exception:
        pass
    return obj


def rot_point(point, yaw):
    x, y, z = point
    c = math.cos(yaw)
    s = math.sin(yaw)
    return (x * c - y * s, x * s + y * c, z)


def world_point(origin, yaw, point):
    rx, ry, rz = rot_point(point, yaw)
    return (origin[0] + rx, origin[1] + ry, origin[2] + rz)


def cube_obj(name, origin, yaw, loc, scale, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=world_point(origin, yaw, loc), rotation=(rot[0], rot[1], rot[2] + yaw))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, material)
    try:
        bevel = obj.modifiers.new("soft bevel", "BEVEL")
        bevel.width = min(scale) * 0.08
        bevel.segments = 2
        obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    except Exception:
        pass
    return obj


def sphere_obj(name, origin, yaw, loc, scale, material, segments=24, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=world_point(origin, yaw, loc))
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    assign(obj, material)
    smooth(obj)
    return obj


def cyl_obj(name, origin, yaw, loc, radius, depth, material, vertices=24, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=world_point(origin, yaw, loc), rotation=(rot[0], rot[1], rot[2] + yaw))
    obj = bpy.context.object
    obj.name = name
    assign(obj, material)
    smooth(obj)
    return obj


def cone_obj(name, origin, yaw, loc, r1, r2, depth, material, vertices=32, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth, location=world_point(origin, yaw, loc), rotation=(rot[0], rot[1], rot[2] + yaw))
    obj = bpy.context.object
    obj.name = name
    assign(obj, material)
    smooth(obj)
    return obj


def curve_obj(name, origin, yaw, points, material, bevel=0.018):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 8
    curve.bevel_depth = bevel
    curve.bevel_resolution = 3
    spl = curve.splines.new("POLY")
    spl.points.add(len(points) - 1)
    for point, co in zip(spl.points, points):
        wx, wy, wz = world_point(origin, yaw, co)
        point.co = (wx, wy, wz, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def add_ground(materials):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.035))
    ground = bpy.context.object
    ground.name = "shinano countryside battlefield ground"
    ground.dimensions = (15.5, 11.0, 0.06)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(ground, materials["grass"])

    # Dirt road through the meeting point.
    for x in [-4.8, -2.4, 0.0, 2.4, 4.8]:
        cube_obj("worn dirt road segment", (x, 0, 0), 0, (0, 0, 0.005), (2.7, 1.05, 0.022), materials["dirt"], (0, 0, math.radians(3 if x < 0 else -3)))

    # Water and rice paddies.
    cube_obj("narrow blue river channel", (0, 3.55, 0), 0, (0, 0, 0.01), (13.5, 0.42, 0.018), materials["water"])
    for idx, x in enumerate([-5.7, -3.7, 3.7, 5.7]):
        cube_obj(f"flooded rice paddy {idx+1}", (x, -3.7, 0), 0, (0, 0, 0.012), (1.55, 1.15, 0.018), materials["paddy"])
        for y in [-4.1, -3.7, -3.3]:
            curve_obj(f"rice paddy green shoots {idx+1} {y}", (x, y, 0), 0, [(-0.55, 0, 0.04), (-0.2, 0.02, 0.08), (0.2, -0.02, 0.08), (0.55, 0, 0.04)], materials["rice"], bevel=0.004)

    # Distant hills.
    for name, loc, scale in [
        ("distant left cedar hill", (-6.0, 4.4, 0.28), (2.0, 0.9, 0.52)),
        ("distant center mountain ridge", (-0.4, 4.8, 0.38), (3.3, 0.85, 0.72)),
        ("distant right cedar hill", (5.8, 4.2, 0.24), (2.3, 0.85, 0.48)),
    ]:
        sphere_obj(name, (0, 0, 0), 0, loc, scale, materials["hill"], segments=32, rings=12)

    # Trees, placed off the combat lane.
    for i, (x, y) in enumerate([(-6.8, 2.2), (-5.9, 3.1), (-4.8, 2.5), (4.7, 2.1), (5.6, 3.0), (6.7, 2.35), (-6.2, -2.6), (6.1, -2.7)]):
        cyl_obj(f"cedar trunk {i+1}", (x, y, 0), 0, (0, 0, 0.27), 0.045, 0.54, materials["trunk"], vertices=12)
        cone_obj(f"cedar dark crown {i+1}", (x, y, 0), 0, (0, 0, 0.82), 0.34, 0.05, 0.85, materials["cedar"], vertices=18)


def add_banner_mon(prefix, origin, yaw, faction, materials):
    mon_material = materials["brass"]
    if faction == "takeda":
        for idx, (dx, dz) in enumerate([(-0.045, 0.045), (0.045, 0.045), (-0.045, -0.045), (0.045, -0.045)]):
            cube_obj(f"{prefix} four-diamond mon {idx+1}", origin, yaw, (0.03 + dx, 0.265, 1.91 + dz), (0.045, 0.009, 0.045), mon_material, (0, 0, math.radians(45)))
    else:
        sphere_obj(f"{prefix} sun-ring mon", origin, yaw, (0.03, 0.262, 1.91), (0.074, 0.007, 0.074), mon_material, segments=24, rings=8)
        sphere_obj(f"{prefix} sun-ring center cloth", origin, yaw, (0.03, 0.258, 1.91), (0.039, 0.005, 0.039), materials["uesugi_banner"], segments=16, rings=8)


def add_warrior(entry, materials):
    origin = entry["position"]
    yaw = entry["yaw"]
    faction = entry["faction"]
    idx = entry["index"]
    prefix = entry["id"]
    armor = materials["takeda_armor"] if faction == "takeda" else materials["uesugi_armor"]
    cloth = materials["takeda_cloth"] if faction == "takeda" else materials["uesugi_cloth"]
    banner = materials["takeda_banner"] if faction == "takeda" else materials["uesugi_banner"]
    cord = materials["takeda_cord"] if faction == "takeda" else materials["uesugi_cord"]
    iron = materials["iron"]
    leather = materials["leather"]
    brass = materials["brass"]
    blade = materials["blade"]
    height = 0.94 + (idx % 4) * 0.025

    # Body.
    sphere_obj(f"{prefix} human torso under armor", origin, yaw, (0, 0, 0.92 * height), (0.20, 0.13, 0.34 * height), cloth, segments=24, rings=12)
    sphere_obj(f"{prefix} armored cuirass rounded volume", origin, yaw, (0, -0.018, 1.03 * height), (0.25, 0.15, 0.31 * height), armor, segments=24, rings=12)
    sphere_obj(f"{prefix} masked head", origin, yaw, (0, -0.055, 1.55 * height), (0.092, 0.070, 0.105), iron, segments=24, rings=12)
    sphere_obj(f"{prefix} kabuto helmet bowl", origin, yaw, (0, -0.02, 1.67 * height), (0.135, 0.105, 0.070), iron, segments=32, rings=12)
    cone_obj(f"{prefix} kabuto brim", origin, yaw, (0, -0.02, 1.61 * height), 0.18, 0.13, 0.045, iron, vertices=36)

    # Helmet crests.
    if faction == "takeda":
        curve_obj(f"{prefix} crescent maedate crest", origin, yaw, [(-0.11, -0.13, 1.70 * height), (-0.04, -0.21, 1.82 * height), (0.04, -0.21, 1.82 * height), (0.11, -0.13, 1.70 * height)], brass, bevel=0.008)
    else:
        curve_obj(f"{prefix} left antler maedate", origin, yaw, [(-0.02, -0.13, 1.69 * height), (-0.10, -0.21, 1.83 * height), (-0.18, -0.17, 1.88 * height)], brass, bevel=0.008)
        curve_obj(f"{prefix} right antler maedate", origin, yaw, [(0.02, -0.13, 1.69 * height), (0.10, -0.21, 1.83 * height), (0.18, -0.17, 1.88 * height)], brass, bevel=0.008)

    # Armor plates and lacing.
    for row, z in enumerate([1.20, 1.06, 0.92]):
        cube_obj(f"{prefix} front lamellar row {row+1}", origin, yaw, (0, -0.174, z * height), (0.52, 0.035, 0.075), armor if row % 2 == 0 else iron)
        curve_obj(f"{prefix} odoshi lacing row {row+1}", origin, yaw, [(-0.27, -0.199, z * height + 0.035), (0, -0.215, z * height + 0.015), (0.27, -0.199, z * height + 0.035)], cord, bevel=0.004)
    for side in [-1, 1]:
        sphere_obj(f"{prefix} shoulder sode undercloth {side}", origin, yaw, (side * 0.27, -0.005, 1.26 * height), (0.08, 0.08, 0.08), cloth, segments=16, rings=8)
        for plate in range(3):
            cube_obj(f"{prefix} shoulder plate {side} {plate+1}", origin, yaw, (side * 0.37, -0.045, (1.22 - plate * 0.11) * height), (0.20, 0.036, 0.070), armor if plate % 2 == 0 else iron, (0, 0, math.radians(side * 5)))
        sphere_obj(f"{prefix} upper arm {side}", origin, yaw, (side * 0.34, -0.005, 0.92 * height), (0.055, 0.045, 0.22), cloth, segments=16, rings=8)
        sphere_obj(f"{prefix} forearm kote {side}", origin, yaw, (side * 0.38, -0.07, 0.66 * height), (0.045, 0.035, 0.18), iron, segments=16, rings=8)
        sphere_obj(f"{prefix} glove {side}", origin, yaw, (side * 0.39, -0.11, 0.45 * height), (0.035, 0.030, 0.035), leather, segments=12, rings=6)
        sphere_obj(f"{prefix} hakama leg {side}", origin, yaw, (side * 0.09, 0.0, 0.43 * height), (0.060, 0.050, 0.29), cloth, segments=16, rings=8)
        sphere_obj(f"{prefix} shin guard {side}", origin, yaw, (side * 0.105, -0.03, 0.21 * height), (0.045, 0.035, 0.17), iron, segments=16, rings=8)
        cube_obj(f"{prefix} waraji sandal {side}", origin, yaw, (side * 0.11, -0.095, 0.035), (0.085, 0.16, 0.020), leather, (0, 0, math.radians(side * 3)))

    for side in [-1, 0, 1]:
        cube_obj(f"{prefix} kusazuri skirt {side}", origin, yaw, (side * 0.095, -0.135, 0.70 * height), (0.085, 0.035, 0.18), armor if side != 0 else iron)

    # Weapons: alternate katana, yari spear, and raised sword silhouettes.
    pose = entry["pose"]
    if pose == "spear":
        curve_obj(f"{prefix} yari shaft", origin, yaw, [(-0.33, -0.18, 0.42), (0.36, -0.31, 1.74 * height)], materials["wood"], bevel=0.010)
        cone_obj(f"{prefix} yari steel point", origin, yaw, (0.39, -0.33, 1.80 * height), 0.025, 0.002, 0.11, blade, vertices=18, rot=(math.radians(72), 0, math.radians(-26)))
    elif pose == "raised":
        curve_obj(f"{prefix} raised katana blade", origin, yaw, [(-0.24, -0.17, 0.92), (-0.18, -0.32, 1.23), (-0.12, -0.46, 1.58)], blade, bevel=0.010)
        cyl_obj(f"{prefix} raised katana grip", origin, yaw, (-0.28, -0.12, 0.80), 0.028, 0.20, leather, vertices=14, rot=(math.radians(20), math.radians(18), math.radians(-14)))
    else:
        curve_obj(f"{prefix} guard katana blade", origin, yaw, [(-0.36, -0.25, 0.73), (-0.08, -0.39, 0.93), (0.26, -0.47, 1.05)], blade, bevel=0.010)
        cyl_obj(f"{prefix} katana grip", origin, yaw, (-0.47, -0.15, 0.64), 0.030, 0.21, leather, vertices=14, rot=(math.radians(70), 0, math.radians(-50)))

    # Back banner.
    curve_obj(f"{prefix} sashimono bamboo pole", origin, yaw, [(0.21, 0.12, 0.78), (0.23, 0.24, 1.93 * height)], materials["wood"], bevel=0.008)
    cube_obj(f"{prefix} sashimono panel", origin, yaw, (0.31, 0.265, 1.60 * height), (0.17, 0.018, 0.30), banner, (0, 0, math.radians((idx % 5 - 2) * 1.6)))
    add_banner_mon(prefix, origin, yaw, faction, materials)


def warrior_entries():
    entries = []
    poses = ["guard", "spear", "raised", "guard", "spear"]
    for faction, side, yaw in [("takeda", -1, math.pi / 2), ("uesugi", 1, -math.pi / 2)]:
        for idx in range(10):
            rank = idx // 5
            file = idx % 5
            x = side * (2.2 + rank * 0.78 + (file % 2) * 0.10)
            y = (file - 2) * 0.70 + (rank * 0.16)
            entries.append({
                "id": f"{faction}-samurai-{idx+1:02d}",
                "faction": faction,
                "index": idx,
                "position": (x, y, 0),
                "yaw": yaw + math.radians((file - 2) * 3.0),
                "pose": poses[(idx + (0 if faction == "takeda" else 2)) % len(poses)],
            })
    return entries


def build_scene(spec, out):
    clear_scene()
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 24
        scene.eevee.use_gtao = True
        scene.eevee.gtao_distance = 4
        scene.eevee.gtao_factor = 1.2
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 820
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.world = bpy.data.worlds.new("misty shinano dawn")
    scene.world.color = (0.045, 0.055, 0.058)

    materials = {
        "grass": mat("muted shinano field grass", (0.19, 0.29, 0.16), 0.85),
        "dirt": mat("worn muddy battlefield road", (0.34, 0.25, 0.16), 0.90),
        "water": mat("shallow river blue grey", (0.12, 0.22, 0.28), 0.55),
        "paddy": mat("flooded rice paddy reflection", (0.16, 0.25, 0.22), 0.60),
        "rice": mat("young rice shoots", (0.26, 0.42, 0.18), 0.75),
        "hill": mat("distant cedar hillside", (0.10, 0.18, 0.12), 0.86),
        "cedar": mat("dark cedar foliage", (0.04, 0.10, 0.065), 0.88),
        "trunk": mat("cedar trunk bark", (0.18, 0.10, 0.055), 0.86),
        "iron": mat("blackened iron armor", (0.020, 0.020, 0.019), 0.42, 0.72),
        "takeda_armor": mat("Takeda oxblood lacquer", (0.145, 0.014, 0.010), 0.58, 0.10),
        "uesugi_armor": mat("Uesugi weathered blue lacquer", (0.030, 0.075, 0.145), 0.58, 0.10),
        "takeda_cloth": mat("Takeda dark indigo cloth", (0.018, 0.028, 0.052), 0.84),
        "uesugi_cloth": mat("Uesugi ash blue cloth", (0.060, 0.066, 0.074), 0.84),
        "takeda_banner": mat("Takeda red sashimono", (0.12, 0.018, 0.014), 0.86),
        "uesugi_banner": mat("Uesugi pale sashimono", (0.74, 0.70, 0.58), 0.86),
        "takeda_cord": mat("Takeda tan odoshi cord", (0.48, 0.35, 0.17), 0.76),
        "uesugi_cord": mat("Uesugi blue odoshi cord", (0.18, 0.36, 0.58), 0.76),
        "leather": mat("dark worn leather", (0.10, 0.055, 0.027), 0.78),
        "brass": mat("aged brass mons and crests", (0.62, 0.43, 0.15), 0.48, 0.38),
        "blade": mat("brushed steel blades", (0.76, 0.78, 0.74), 0.28, 0.88),
        "wood": mat("bamboo and yari shafts", (0.45, 0.30, 0.13), 0.72),
    }
    add_ground(materials)
    entries = warrior_entries()
    for entry in entries:
        add_warrior(entry, materials)

    # Low fog bands give the scene a dawn battlefield read without hiding the assets.
    fog = mat("thin blue morning mist", (0.20, 0.26, 0.28, 0.32), 0.95)
    for y, z, width in [(-1.6, 0.18, 10.0), (1.5, 0.25, 11.5), (3.0, 0.32, 12.0)]:
        cube_obj("low dawn mist band", (0, y, 0), 0, (0, 0, z), (width, 0.05, 0.035), fog)

    bpy.ops.object.light_add(type="SUN", location=(0, -4, 6))
    sun = bpy.context.object
    sun.name = "low dawn sun"
    sun.data.energy = 2.1
    sun.rotation_euler = (math.radians(45), math.radians(0), math.radians(32))
    bpy.ops.object.light_add(type="AREA", location=(0, -5.0, 5.2))
    key = bpy.context.object
    key.name = "large soft battlefield key"
    key.data.energy = 360
    key.data.size = 6.5

    bpy.ops.object.camera_add(location=(6.7, -8.0, 4.2))
    cam = bpy.context.object
    cam.name = "battlefield evidence camera"
    look_at(cam, (0, 0, 0.88))
    cam.data.lens = 35
    scene.camera = cam

    note = bpy.data.objects.new("asset_foundry_samurai_battlefield_pack_metadata", None)
    note["prompt"] = spec.get("prompt", "")
    note["style"] = spec.get("style", "")
    note["warrior_count"] = len(entries)
    note["factions"] = "takeda:10,uesugi:10"
    bpy.context.collection.objects.link(note)

    blend_path = out / "samurai_battlefield_pack_source.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    glb_path = out / "samurai_battlefield_pack.glb"
    bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", export_yup=True)

    views = {
        "wide_clash": ((6.7, -8.0, 4.2), (0, 0, 0.88), 35),
        "overhead_layout": ((0.0, -0.1, 10.8), (0, 0, 0.1), 42),
        "takeda_line": ((-5.8, -4.8, 2.4), (-2.7, 0, 0.92), 48),
        "uesugi_line": ((5.8, -4.8, 2.4), (2.7, 0, 0.92), 48),
        "center_meeting": ((0.0, -5.9, 2.4), (0, 0, 0.92), 48),
    }
    render_paths = {}
    for name, (loc, target, lens) in views.items():
        cam.location = loc
        look_at(cam, target)
        cam.data.lens = lens
        scene.render.filepath = str(out / f"samurai_battlefield_{name}.png")
        bpy.ops.render.render(write_still=True)
        render_paths[name] = scene.render.filepath

    manifest = {
        "scene": "kawanakajima-samurai-battlefield-pack",
        "warrior_count": len(entries),
        "factions": {
            "takeda": [entry["id"] for entry in entries if entry["faction"] == "takeda"],
            "uesugi": [entry["id"] for entry in entries if entry["faction"] == "uesugi"],
        },
        "warriors": [
            {
                "id": entry["id"],
                "faction": entry["faction"],
                "pose": entry["pose"],
                "position": list(entry["position"]),
                "yaw_degrees": round(math.degrees(entry["yaw"]), 2),
            }
            for entry in entries
        ],
    }
    manifest_path = out / "samurai_battlefield_manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True))

    stats = {
        "warrior_count": len(entries),
        "takeda_count": 10,
        "uesugi_count": 10,
        "object_count": len(bpy.data.objects),
        "mesh_count": len(bpy.data.meshes),
        "material_count": len(bpy.data.materials),
        "inspection_views": list(views.keys()),
    }
    (out / "blender_outputs.json").write_text(json.dumps({
        "blend": str(blend_path),
        "glb": str(glb_path),
        "manifest": str(manifest_path),
        "renders": render_paths,
        "stats": stats,
    }, indent=2, sort_keys=True))


def main():
    argv = args_after_dash()
    spec_path = Path(argv[argv.index("--spec") + 1])
    out_path = Path(argv[argv.index("--out") + 1])
    spec = json.loads(spec_path.read_text())
    build_scene(spec, out_path)


if __name__ == "__main__":
    main()
'''


def make_contact_sheet(paths: list[Path], out: Path) -> None:
    thumbs = []
    labels = []
    for path in paths:
        img = Image.open(path).convert("RGB")
        img.thumbnail((520, 330))
        thumbs.append(img.copy())
        labels.append(path.stem.replace("samurai_battlefield_", ""))
    sheet = Image.new("RGB", (1040, 910), (18, 18, 18))
    draw = ImageDraw.Draw(sheet)
    draw.text((18, 8), "20-samurai battlefield pack: stable evidence cameras", fill=(230, 225, 210))
    for idx, img in enumerate(thumbs):
        x = (idx % 2) * 520
        y = (idx // 2) * 290 + 32
        sheet.paste(img, (x + (520 - img.width) // 2, y))
        draw.text((x + 18, y + img.height + 6), labels[idx], fill=(230, 225, 210))
    sheet.save(out)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--spec", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    spec_path = Path(args.spec)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    spec = json.loads(spec_path.read_text())

    blender = shutil.which("blender")
    if not blender:
        raise SystemExit("blender executable not found")

    blender_script = out / "samurai_battlefield_pack_blender.py"
    blender_script.write_text(BLENDER_SCRIPT)
    cmd = [
        blender,
        "--background",
        "--python",
        str(blender_script),
        "--",
        "--spec",
        str(spec_path),
        "--out",
        str(out),
    ]
    proc = subprocess.run(cmd, cwd=out, text=True, capture_output=True)
    (out / "blender_stdout.log").write_text(proc.stdout)
    (out / "blender_stderr.log").write_text(proc.stderr)
    if proc.returncode != 0:
        raise SystemExit(proc.returncode)

    blender_outputs = json.loads((out / "blender_outputs.json").read_text())
    render_paths = [Path(value) for value in blender_outputs["renders"].values()]
    contact_sheet = out / "samurai_battlefield_contact_sheet.png"
    make_contact_sheet(render_paths, contact_sheet)

    summary = {
        "asset_name": spec.get("asset_name", "samurai_battlefield_pack"),
        "recipe": "samurai_battlefield_pack",
        "outputs": {
            "source_blend": blender_outputs["blend"],
            "glb": blender_outputs["glb"],
            "manifest": blender_outputs["manifest"],
            "poster": blender_outputs["renders"]["wide_clash"],
            "contact_sheet": str(contact_sheet),
            "blender_script": str(blender_script),
            "blender_stdout": str(out / "blender_stdout.log"),
            "blender_stderr": str(out / "blender_stderr.log"),
        },
        "stats": {
            **blender_outputs["stats"],
            "prompt_format": "/goal",
            "stable_camera_views": len(render_paths),
        },
        "notes": [
            "Generated through Asset Foundry using a /goal-style prompt.",
            "Scene contains 20 named samurai: 10 Takeda and 10 Uesugi, staged in opposing ranks on a Japanese countryside battlefield.",
            "Outputs include a single scene GLB, source blend, warrior manifest, and repeatable review camera contact sheet.",
        ],
    }
    (out / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
