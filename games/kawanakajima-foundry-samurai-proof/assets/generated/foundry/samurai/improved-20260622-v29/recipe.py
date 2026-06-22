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


def mat(name, color, rough=0.55, metallic=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (color[0], color[1], color[2], alpha)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    if alpha < 1.0:
        m.blend_method = "BLEND"
        bsdf.inputs["Alpha"].default_value = alpha
    return m


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


def cube_obj(name, loc, scale, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, material)
    try:
        bevel = obj.modifiers.new("small worn bevels", "BEVEL")
        bevel.width = 0.018
        bevel.segments = 2
        obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    except Exception:
        pass
    return obj


def plate_obj(name, loc, width, height, thickness, material, rot=(0, 0, 0), taper=0.82, belly=0.018):
    """Thin tapered armor plate with a slight convex face; avoids blocky cube rows."""
    bottom = width * 0.5
    top = bottom * taper
    z0 = -height * 0.5
    z1 = height * 0.5
    y_front = -thickness * 0.5
    y_back = thickness * 0.5
    y_mid = y_front - belly
    verts = [
        (-bottom, y_front, z0),
        (0, y_mid, z0),
        (bottom, y_front, z0),
        (-top, y_front, z1),
        (0, y_mid, z1),
        (top, y_front, z1),
        (-bottom, y_back, z0),
        (0, y_back, z0),
        (bottom, y_back, z0),
        (-top, y_back, z1),
        (0, y_back, z1),
        (top, y_back, z1),
    ]
    faces = [
        (0, 1, 4, 3), (1, 2, 5, 4),
        (6, 9, 10, 7), (7, 10, 11, 8),
        (0, 6, 7, 1), (1, 7, 8, 2),
        (3, 4, 10, 9), (4, 5, 11, 10),
        (0, 3, 9, 6), (2, 8, 11, 5),
    ]
    mesh = bpy.data.meshes.new(name + " mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = rot
    assign(obj, material)
    try:
        bevel = obj.modifiers.new("soft hand-lacquered edges", "BEVEL")
        bevel.width = min(width, height) * 0.055
        bevel.segments = 3
        obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    except Exception:
        pass
    return obj


def sphere_obj(name, loc, scale, material, segments=48, rings=24, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    assign(obj, material)
    smooth(obj)
    return obj


def cyl_obj(name, loc, radius, depth, material, vertices=48, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    assign(obj, material)
    smooth(obj)
    return obj


def cone_obj(name, loc, r1, r2, depth, material, vertices=64, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    assign(obj, material)
    smooth(obj)
    return obj


def curve_obj(name, points, material, bevel=0.018):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 16
    curve.bevel_depth = bevel
    curve.bevel_resolution = 4
    spl = curve.splines.new("POLY")
    spl.points.add(len(points) - 1)
    for p, co in zip(spl.points, points):
        p.co = (co[0], co[1], co[2], 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def clamp01(value):
    return max(0.0, min(1.0, value))


def color_from_hex(value, fallback):
    if not isinstance(value, str):
        return fallback
    text = value.strip().lstrip("#")
    if len(text) != 6:
        return fallback
    try:
        return tuple(int(text[i:i+2], 16) / 255 for i in (0, 2, 4))
    except ValueError:
        return fallback


def mixed(color, amount):
    return tuple(clamp01(channel * amount) for channel in color)


def variant_config(spec):
    params = spec.get("params") or spec.get("parameters") or {}
    if not isinstance(params, dict):
        params = {}
    faction = str(params.get("faction") or "takeda").lower()
    try:
        variant_index = int(params.get("variant_index", 0))
    except Exception:
        variant_index = 0
    palettes = {
        "takeda": {
            "armor": (0.125, 0.012, 0.010),
            "cloth": (0.018, 0.030, 0.060),
            "banner": (0.105, 0.018, 0.014),
            "cord": (0.47, 0.34, 0.17),
            "crest": "crescent",
            "mon": "four-diamonds",
        },
        "uesugi": {
            "armor": (0.024, 0.050, 0.105),
            "cloth": (0.055, 0.058, 0.065),
            "banner": (0.78, 0.76, 0.68),
            "cord": (0.18, 0.34, 0.56),
            "crest": "antlers",
            "mon": "sun-ring",
        },
    }
    palette = dict(palettes.get(faction, palettes["takeda"]))
    palette["armor"] = color_from_hex(params.get("armor_color"), palette["armor"])
    palette["cloth"] = color_from_hex(params.get("cloth_color"), palette["cloth"])
    palette["banner"] = color_from_hex(params.get("banner_color"), palette["banner"])
    palette["cord"] = color_from_hex(params.get("cord_color"), palette["cord"])
    palette["crest"] = str(params.get("crest") or palette["crest"])
    palette["mon"] = str(params.get("mon") or palette["mon"])
    palette["faction"] = faction
    palette["variant_index"] = variant_index
    palette["pose"] = str(params.get("pose") or ["drawn", "guard", "raised"][variant_index % 3])
    palette["banner_tilt"] = math.radians(((variant_index % 5) - 2) * 2.5)
    palette["height_scale"] = 0.96 + (variant_index % 5) * 0.018
    return palette


def add_crest(shape, brass):
    if shape == "antlers":
        curve_obj("golden maedate left antler crest", [(-0.03, -0.22, 2.61), (-0.13, -0.30, 2.78), (-0.25, -0.24, 2.88)], brass, bevel=0.012)
        curve_obj("golden maedate right antler crest", [(0.03, -0.22, 2.61), (0.13, -0.30, 2.78), (0.25, -0.24, 2.88)], brass, bevel=0.012)
        curve_obj("left antler tine", [(-0.13, -0.30, 2.78), (-0.17, -0.34, 2.91)], brass, bevel=0.008)
        curve_obj("right antler tine", [(0.13, -0.30, 2.78), (0.17, -0.34, 2.91)], brass, bevel=0.008)
    elif shape == "sun":
        sphere_obj("round golden sun maedate crest", (0, -0.232, 2.68), (0.105, 0.014, 0.105), brass, segments=48, rings=14)
        for angle in range(0, 360, 45):
            rad = math.radians(angle)
            curve_obj(
                f"sun crest ray {angle:03d}",
                [(math.cos(rad) * 0.09, -0.244, 2.68 + math.sin(rad) * 0.09),
                 (math.cos(rad) * 0.16, -0.248, 2.68 + math.sin(rad) * 0.16)],
                brass,
                bevel=0.005,
            )
    else:
        curve_obj("golden maedate crescent crest", [(-0.16, -0.20, 2.62), (-0.07, -0.28, 2.77), (0, -0.30, 2.84), (0.07, -0.28, 2.77), (0.16, -0.20, 2.62)], brass, bevel=0.012)


def add_banner_mon(mon, loc, brass, banner_cloth):
    x, y, z = loc
    if mon == "four-diamonds":
        for dx, dz in [(-0.033, 0.033), (0.033, 0.033), (-0.033, -0.033), (0.033, -0.033)]:
            cube_obj("small Takeda diamond mon", (x + dx, y, z + dz), (0.042, 0.008, 0.042), brass, (0, 0, math.radians(45)))
    elif mon == "sun-ring":
        sphere_obj("round Uesugi sun mon", loc, (0.066, 0.006, 0.066), brass, segments=40, rings=12)
        sphere_obj("banner color center cutout for sun mon", (x, y - 0.001, z), (0.036, 0.004, 0.036), banner_cloth, segments=32, rings=8)
    else:
        sphere_obj("simple round clan mon on banner", loc, (0.052, 0.006, 0.052), brass, segments=32, rings=12)


def katana_pose_points(pose):
    if pose == "raised":
        return {
            "blade": [(-0.48, -0.22, 1.12), (-0.38, -0.36, 1.54), (-0.28, -0.52, 1.96), (-0.15, -0.68, 2.36)],
            "edge": [(-0.45, -0.245, 1.12), (-0.35, -0.385, 1.54), (-0.25, -0.545, 1.96), (-0.12, -0.705, 2.36)],
            "grip": (-0.55, -0.16, 0.92),
            "guard": (-0.48, -0.23, 1.10),
            "rot": (math.radians(16), math.radians(18), math.radians(-14)),
        }
    if pose == "guard":
        return {
            "blade": [(-0.76, -0.42, 1.28), (-0.36, -0.56, 1.36), (0.08, -0.66, 1.42), (0.52, -0.72, 1.48)],
            "edge": [(-0.76, -0.448, 1.25), (-0.35, -0.588, 1.33), (0.09, -0.688, 1.39), (0.53, -0.748, 1.45)],
            "grip": (-0.93, -0.31, 1.20),
            "guard": (-0.76, -0.42, 1.28),
            "rot": (math.radians(83), math.radians(0), math.radians(-72)),
        }
    return {
        "blade": [(-0.78, -0.23, 0.70), (-0.48, -0.36, 1.05), (-0.20, -0.50, 1.42), (0.08, -0.62, 1.82)],
        "edge": [(-0.76, -0.255, 0.70), (-0.45, -0.385, 1.05), (-0.17, -0.525, 1.42), (0.10, -0.645, 1.82)],
        "grip": (-0.90, -0.17, 0.57),
        "guard": (-0.78, -0.25, 0.72),
        "rot": (math.radians(57), math.radians(0), math.radians(-32)),
    }


def add_plate_row(prefix, z, count, width, height, y, material, x0=-0.48, overlap=0.72):
    plates = []
    for i in range(count):
        x = x0 + i * width * overlap
        arc = (i - (count - 1) / 2) / max(count - 1, 1)
        rot = (0, math.radians(arc * 7.5), math.radians(arc * 1.8))
        plates.append(
            plate_obj(
                f"{prefix} lamellar plate {i+1:02d}",
                (x, y, z),
                width,
                height,
                0.018,
                material,
                rot,
                taper=0.78,
                belly=0.012,
            )
        )
    return plates


def build_scene(spec, out):
    variant = variant_config(spec)
    clear_scene()
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 32
        if hasattr(scene.eevee, "use_gtao"):
            scene.eevee.use_gtao = True
        if hasattr(scene.eevee, "gtao_distance"):
            scene.eevee.gtao_distance = 3
        if hasattr(scene.eevee, "gtao_factor"):
            scene.eevee.gtao_factor = 1.3
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 880
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.08
    scene.world = bpy.data.worlds.new("charcoal studio world")
    scene.world.color = (0.018, 0.019, 0.018)

    iron = mat("dark burnished iron with subtle wear", (0.035, 0.034, 0.032), 0.36, 0.82)
    lacquer = mat(f"{variant['faction']} lacquer armor", variant["armor"], 0.54, 0.12)
    black = mat("matte black silk underlayer", (0.009, 0.009, 0.008), 0.88, 0.0)
    cloth = mat(f"{variant['faction']} weathered cloth", variant["cloth"], 0.82, 0.0)
    banner_cloth = mat(f"{variant['faction']} sashimono cloth", variant["banner"], 0.86, 0.0)
    cord = mat(f"{variant['faction']} odoshi lacing", variant["cord"], 0.76, 0.0)
    leather = mat("dark brown worn leather", (0.105, 0.055, 0.025), 0.70, 0.0)
    skin = mat("subdued natural skin behind mask", (0.28, 0.18, 0.12), 0.70, 0.0)
    brass = mat("aged brass crest fittings", (0.58, 0.39, 0.13), 0.50, 0.48)
    blade = mat("brushed steel katana blade", (0.72, 0.75, 0.73), 0.25, 0.9)
    edge = mat("bright sharpened blade edge", (0.96, 0.97, 0.92), 0.18, 1.0)
    wear = mat("exposed worn lacquer edges", mixed(variant["armor"], 3.8), 0.62, 0.25)

    # Ground.
    cube_obj("matte charcoal inspection plinth", (0, 0, -0.08), (4.2, 3.6, 0.06), mat("matte charcoal plinth", (0.025, 0.027, 0.026), 0.85), (0, 0, 0))

    # Body proportions and stance.
    sphere_obj("tapered torso under robe volume", (0, 0, 1.60), (0.27, 0.145, 0.48), black)
    sphere_obj("shadowed face visible behind mempo", (0, -0.018, 2.39), (0.118, 0.088, 0.145), skin, segments=48, rings=20)
    sphere_obj("neck guard cloth", (0, 0, 2.16), (0.18, 0.13, 0.12), cloth, segments=40, rings=16)

    # Kabuto helmet: bowl, skirt, crest, side flanges.
    sphere_obj("segmented kabuto helmet bowl", (0, 0, 2.53), (0.205, 0.165, 0.118), iron, segments=72, rings=24)
    cone_obj("wide kabuto brim", (0, 0, 2.46), 0.285, 0.205, 0.052, iron, vertices=96)
    cone_obj("rear shikoro neck guard flare", (0, 0.16, 2.26), 0.28, 0.19, 0.27, iron, vertices=72, rot=(math.radians(82), 0, 0))
    for side in (-1, 1):
        cube_obj(f"{'left' if side < 0 else 'right'} side helmet flange", (side * 0.235, 0.02, 2.40), (0.11, 0.034, 0.225), iron, (0, math.radians(8 * side), math.radians(10 * side)))
        for k, z in enumerate([2.54, 2.58, 2.62]):
            curve_obj(f"{'left' if side < 0 else 'right'} kabuto raised rib {k+1}", [(side*0.02, -0.16, z), (side*0.12, -0.11, z+0.03), (side*0.21, -0.02, z)], wear, bevel=0.003)
    add_crest(variant["crest"], brass)
    cyl_obj("crest central rivet", (0, -0.225, 2.61), 0.024, 0.020, brass, vertices=32, rot=(math.radians(90), 0, 0))

    # Face mask and throat armor.
    sphere_obj("dark iron mempo cheek mask", (0, -0.146, 2.32), (0.148, 0.040, 0.118), iron, segments=56, rings=18)
    plate_obj("mempo nose ridge", (0, -0.186, 2.365), 0.040, 0.150, 0.012, lacquer, (0, 0, 0), taper=0.58, belly=0.004)
    cube_obj("mempo grim mouth slit", (0, -0.188, 2.30), (0.17, 0.010, 0.012), black)
    for side in (-1, 1):
        plate_obj(
            f"{'left' if side < 0 else 'right'} mempo cheek flange",
            (side * 0.105, -0.170, 2.30),
            0.065,
            0.115,
            0.010,
            lacquer,
            (0, math.radians(14 * side), math.radians(8 * side)),
            taper=0.72,
            belly=0.005,
        )
    for side in (-1, 1):
        curve_obj(f"{'left' if side < 0 else 'right'} mask moustache bristle", [(side*0.035, -0.188, 2.34), (side*0.14, -0.235, 2.36), (side*0.23, -0.225, 2.38)], black, bevel=0.003)
    for i, z in enumerate([2.13, 2.06, 1.99]):
        add_plate_row(f"throat guard row {i+1}", z, 5, 0.135, 0.055, -0.17, iron if i % 2 else lacquer, x0=-0.27)

    # Cuirass, lamellar plates, lacing.
    sphere_obj("shadowed upper do armor underframe", (0, -0.006, 1.78), (0.30, 0.118, 0.30), black, segments=64, rings=24)
    sphere_obj("shadowed lower do waist underframe", (0, -0.004, 1.45), (0.24, 0.100, 0.17), black, segments=56, rings=18)
    for row, z in enumerate([1.99, 1.84, 1.69, 1.54, 1.39]):
        add_plate_row(f"front cuirass row {row+1}", z, 9, 0.115, 0.098, -0.272, iron if row % 2 else lacquer, x0=-0.455)
        add_plate_row(f"rear cuirass row {row+1}", z, 9, 0.115, 0.098, 0.262, iron if row % 2 else lacquer, x0=-0.455)
        curve_obj(f"front tan lacing row {row+1}", [(-0.48, -0.302, z+0.055), (-0.17, -0.315, z+0.018), (0.17, -0.315, z+0.018), (0.48, -0.302, z+0.055)], cord, bevel=0.005)
        for sx in [-0.36, -0.18, 0.0, 0.18, 0.36]:
            curve_obj(f"front lacquer edge wear {row+1} {sx:.2f}", [(sx-0.035, -0.319, z+0.030), (sx+0.035, -0.321, z+0.043)], wear, bevel=0.0025)
    for side in (-1, 1):
        for row, z in enumerate([1.90, 1.76, 1.62]):
            plate_obj(
                f"{'left' if side < 0 else 'right'} side cuirass plate {row+1}",
                (side * 0.455, -0.02, z),
                0.115,
                0.275,
                0.018,
                iron if row % 2 else lacquer,
                (0, math.radians(86 * side), math.radians(4 * side)),
                taper=0.84,
                belly=0.010,
            )

    # Shoulder guards and sleeves.
    for side in (-1, 1):
        sphere_obj(f"{'left' if side < 0 else 'right'} compact shoulder undercloth", (side * 0.49, -0.02, 1.95), (0.080, 0.078, 0.105), cloth, segments=32, rings=16)
        for i, z in enumerate([1.97, 1.84, 1.71, 1.58]):
            plate_obj(
                f"{'left' if side < 0 else 'right'} sode shoulder plate {i+1}",
                (side * 0.64, -0.05, z),
                0.255,
                0.105,
                0.018,
                lacquer if i % 2 else iron,
                (0, math.radians(4 * side), math.radians(8 * side)),
                taper=0.76,
                belly=0.012,
            )
            curve_obj(f"{'left' if side < 0 else 'right'} sode lacing {i+1}", [(side*0.53, -0.086, z+0.035), (side*0.64, -0.095, z+0.010), (side*0.75, -0.086, z+0.035)], cord, bevel=0.004)
        sphere_obj(f"{'left' if side < 0 else 'right'} armored upper arm", (side * 0.54, -0.02, 1.43), (0.085, 0.075, 0.335), cloth, segments=32, rings=16, rot=(0, 0, math.radians(8 * side)))
        sphere_obj(f"{'left' if side < 0 else 'right'} kote forearm guard", (side * 0.61, -0.08, 1.05), (0.075, 0.055, 0.300), iron, segments=32, rings=16, rot=(0, math.radians(8 * side), math.radians(6 * side)))
        sphere_obj(f"{'left' if side < 0 else 'right'} gloved hand", (side * 0.61, -0.14, 0.76), (0.052, 0.042, 0.055), leather, segments=24, rings=12)

    # Skirt plates, thighs, greaves.
    for side in (-1, 0, 1):
        for i, z in enumerate([1.19, 1.03, 0.87]):
            plate_obj(
                f"kusazuri skirt plate {side:+d} row {i+1}",
                (side * 0.18, -0.218, z),
                0.150,
                0.170,
                0.018,
                lacquer if i % 2 else iron,
                (math.radians(5), 0, math.radians(side * 4)),
                taper=0.70,
                belly=0.014,
            )
            plate_obj(
                f"rear kusazuri skirt plate {side:+d} row {i+1}",
                (side * 0.18, 0.205, z),
                0.150,
                0.170,
                0.018,
                iron if i % 2 else lacquer,
                (math.radians(-5), 0, math.radians(side * 4)),
                taper=0.70,
                belly=0.014,
            )
    for side in (-1, 1):
        sphere_obj(f"{'left' if side < 0 else 'right'} hakama trouser leg", (side * 0.14, 0.0, 0.70), (0.095, 0.080, 0.455), cloth, segments=32, rings=16)
        sphere_obj(f"{'left' if side < 0 else 'right'} shin greave", (side * 0.17, -0.04, 0.38), (0.070, 0.052, 0.315), iron, segments=32, rings=16)
        sphere_obj(f"{'left' if side < 0 else 'right'} tabi foot volume", (side * 0.18, -0.11, 0.08), (0.075, 0.135, 0.025), leather, segments=24, rings=12, rot=(0, 0, math.radians(side * 4)))
        cube_obj(f"{'left' if side < 0 else 'right'} woven waraji sole", (side * 0.18, -0.12, 0.045), (0.125, 0.255, 0.026), leather, (0, 0, math.radians(side * 4)))
        curve_obj(f"{'left' if side < 0 else 'right'} sandal toe strap", [(side*0.15, -0.205, 0.075), (side*0.18, -0.145, 0.105), (side*0.21, -0.205, 0.075)], cord, bevel=0.004)
        for k, xoff in enumerate([-0.035, 0.0, 0.035]):
            curve_obj(f"{'left' if side < 0 else 'right'} hakama pleat {k+1}", [(side*(0.13+xoff), -0.072, 1.06), (side*(0.15+xoff), -0.060, 0.72), (side*(0.17+xoff), -0.055, 0.36)], black, bevel=0.003)

    # Katana: one drawn blade and one scabbard at hip.
    katana = katana_pose_points(variant["pose"])
    curve_obj(f"{variant['pose']} katana blade spine", katana["blade"], blade, bevel=0.014)
    curve_obj(f"{variant['pose']} bright sharpened katana edge", katana["edge"], edge, bevel=0.005)
    cyl_obj("wrapped katana grip", katana["grip"], 0.045, 0.34, leather, vertices=24, rot=katana["rot"])
    cube_obj("square tsuba guard", katana["guard"], (0.16, 0.028, 0.11), brass, katana["rot"])
    curve_obj("lacquered saya scabbard at left hip", [(-0.54, 0.18, 1.05), (-0.78, 0.17, 0.78), (-1.02, 0.15, 0.52)], lacquer, bevel=0.035)
    curve_obj("waist sash tying armor", [(-0.58, -0.08, 1.28), (-0.25, -0.21, 1.24), (0.18, -0.20, 1.24), (0.58, -0.08, 1.28)], cord, bevel=0.018)

    # Sashimono back banner: the close-view asset stays funny, but the army silhouette now
    # reads as a samurai on a battlefield even from a game camera.
    banner_tilt = variant["banner_tilt"]
    curve_obj("bamboo sashimono back pole", [(0.32, 0.22, 1.05), (0.36, 0.31, 2.48)], cord, bevel=0.012)
    cube_obj("small lacquered sashimono crossbar", (0.36, 0.29, 2.32), (0.30, 0.018, 0.018), brass, (0, 0, math.radians(3) + banner_tilt))
    cube_obj("cloth sashimono banner panel", (0.47, 0.31, 2.05), (0.25, 0.025, 0.46), banner_cloth, (0, 0, math.radians(2) + banner_tilt))
    add_banner_mon(variant["mon"], (0.47, 0.292, 2.10), brass, banner_cloth)

    # Rivets and lacing dots.
    for x in [-0.36, -0.24, -0.12, 0, 0.12, 0.24, 0.36]:
        for z in [1.94, 1.79, 1.64, 1.49]:
            sphere_obj(f"front brass rivet {x:.2f} {z:.2f}", (x, -0.326, z), (0.014, 0.009, 0.014), brass, segments=16, rings=8)
    for side in (-1, 1):
        for z in [2.10, 2.04, 1.98]:
            curve_obj(f"{'left' if side < 0 else 'right'} throat odoshi cord {z:.2f}", [(side*0.03, -0.206, z), (side*0.12, -0.218, z-0.015), (side*0.22, -0.204, z)], cord, bevel=0.0035)

    # Lighting and camera.
    bpy.ops.object.light_add(type="AREA", location=(2.7, -3.4, 4.4))
    key = bpy.context.object
    key.name = "large cool studio key"
    key.data.energy = 620
    key.data.size = 4.2
    bpy.ops.object.light_add(type="AREA", location=(-3.0, 2.5, 3.0))
    rim = bpy.context.object
    rim.name = "subtle rim light on armor edges"
    rim.data.energy = 180
    rim.data.size = 2.2
    rim.data.color = (0.72, 0.88, 1.0)
    bpy.ops.object.light_add(type="POINT", location=(0.0, -1.4, 1.8))
    face = bpy.context.object
    face.name = "low face glint"
    face.data.energy = 35
    face.data.color = (1.0, 0.78, 0.52)

    bpy.ops.object.camera_add(location=(3.1, -4.3, 2.35))
    cam = bpy.context.object
    cam.name = "hero inspection camera"
    look_at(cam, (0, -0.05, 1.55))
    cam.data.lens = 55
    scene.camera = cam

    # Metadata object with prompt text for provenance.
    note = bpy.data.objects.new("prompt_self_verifiable_samurai_asset", None)
    note["prompt"] = spec.get("prompt", "")
    note["style"] = spec.get("style", "")
    note["variant"] = json.dumps(variant, sort_keys=True)
    bpy.context.collection.objects.link(note)

    # Save source and export.
    blend_path = out / "samurai_character_source.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    glb_path = out / "samurai_character.glb"
    try:
        bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", export_yup=True)
    except Exception as exc:
        (out / "gltf_export_error.txt").write_text(str(exc))

    # Stable inspection cameras.
    views = {
        "hero": ((3.1, -4.3, 2.35), (0, -0.05, 1.55), 55),
        "front": ((0, -5.2, 1.75), (0, 0, 1.45), 70),
        "left": ((-4.6, -0.1, 1.72), (0, 0, 1.45), 70),
        "rear": ((0, 4.9, 1.70), (0, 0, 1.45), 70),
        "top": ((0.05, -0.25, 5.4), (0, 0, 1.25), 62),
        "three_quarter": ((-3.6, -3.8, 2.1), (0, 0, 1.45), 58),
    }
    render_paths = {}
    for name, (loc, target, lens) in views.items():
        cam.location = loc
        look_at(cam, target)
        cam.data.lens = lens
        scene.render.filepath = str(out / f"samurai_character_{name}.png")
        bpy.ops.render.render(write_still=True)
        render_paths[name] = scene.render.filepath

    frames = []
    for i in range(8):
        angle = (math.pi * 2) * i / 8
        cam.location = (math.sin(angle) * 4.4, math.cos(angle) * -4.4, 2.05)
        look_at(cam, (0, 0, 1.48))
        cam.data.lens = 58
        scene.render.filepath = str(out / f"turntable_{i:03d}.png")
        bpy.ops.render.render(write_still=True)
        frames.append(scene.render.filepath)

    stats = {
        "object_count": len(bpy.data.objects),
        "mesh_count": len(bpy.data.meshes),
        "material_count": len(bpy.data.materials),
        "inspection_views": list(views.keys()),
        "faction": variant["faction"],
        "variant_index": variant["variant_index"],
        "pose": variant["pose"],
        "crest": variant["crest"],
        "mon": variant["mon"],
    }
    (out / "blender_outputs.json").write_text(json.dumps({
        "blend": str(blend_path),
        "glb": str(glb_path),
        "renders": render_paths,
        "turntable_frames": frames,
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
        img.thumbnail((420, 360))
        thumbs.append(img.copy())
        labels.append(path.stem.replace("samurai_character_", ""))
    sheet = Image.new("RGB", (840, 1140), (18, 18, 18))
    draw = ImageDraw.Draw(sheet)
    for idx, img in enumerate(thumbs):
        x = (idx % 2) * 420
        y = (idx // 2) * 380 + 26
        sheet.paste(img, (x + (420 - img.width) // 2, y))
        draw.text((x + 18, y + img.height + 8), labels[idx], fill=(230, 225, 210))
    draw.text((18, 6), "samurai character inspection rig: stable camera contact sheet", fill=(230, 225, 210))
    sheet.save(out)


def make_turntable(frame_paths: list[Path], out: Path) -> None:
    frames = []
    for path in frame_paths:
        img = Image.open(path).convert("RGB")
        img.thumbnail((560, 480))
        frames.append(img.copy())
    if not frames:
        raise RuntimeError("no turntable frames were generated")
    frames[0].save(
        out,
        save_all=True,
        append_images=frames[1:],
        duration=80,
        loop=0,
        optimize=True,
    )


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

    blender_script = out / "samurai_character_blender.py"
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
    frame_paths = [Path(value) for value in blender_outputs["turntable_frames"]]
    contact_sheet = out / "samurai_character_contact_sheet.png"
    turntable = out / "samurai_character_turntable.gif"
    make_contact_sheet(render_paths, contact_sheet)
    make_turntable(frame_paths, turntable)

    summary = {
        "asset_name": spec.get("asset_name", "samurai_character"),
        "recipe": "samurai_character",
        "variant": spec.get("params") or spec.get("parameters") or {},
        "review_contract": spec.get("review_contract") or {},
        "outputs": {
            "source_blend": blender_outputs["blend"],
            "glb": blender_outputs["glb"],
            "poster": blender_outputs["renders"]["hero"],
            "contact_sheet": str(contact_sheet),
            "turntable": str(turntable),
            "blender_script": str(blender_script),
            "blender_stdout": str(out / "blender_stdout.log"),
            "blender_stderr": str(out / "blender_stderr.log"),
        },
        "stats": {
            **blender_outputs["stats"],
            "prompt_format": "/goal",
            "stable_camera_views": len(render_paths),
            "turntable_frames": len(frame_paths),
        },
        "notes": [
            "Generated through Asset Foundry using a /goal-style prompt.",
            "Stylized samurai model includes kabuto, mempo, shikoro, do cuirass, sode shoulder plates, kusazuri skirt plates, kote forearm guards, greaves, waraji sandals, katana blade, saya, lacing, rivets, and studio lighting.",
            "Contact sheet uses repeatable hero/front/left/rear/top/three-quarter cameras for self-verification.",
            "Variant params drive faction palette, crest, banner mon, and katana pose so repeated jobs can produce distinguishable warriors.",
            "Review contract is copied from the recipe manifest so callers can reject blocky or under-evidenced outputs instead of accepting a merely successful run.",
        ],
    }
    (out / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
