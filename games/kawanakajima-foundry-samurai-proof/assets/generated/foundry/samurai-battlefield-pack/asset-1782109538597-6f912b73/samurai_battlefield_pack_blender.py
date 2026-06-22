
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


def mat(name, color, rough=0.65, metallic=0.0, alpha=None):
    if alpha is None:
        alpha = color[3] if len(color) > 3 else 1.0
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (color[0], color[1], color[2], alpha)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    if alpha < 1.0:
        material.blend_method = "BLEND"
        material.show_transparent_back = True
        bsdf.inputs["Alpha"].default_value = alpha
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


def mesh_obj(name, origin, yaw, verts, faces, material):
    mesh = bpy.data.meshes.new(name + " mesh")
    world_verts = [world_point(origin, yaw, vert) for vert in verts]
    mesh.from_pydata(world_verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    assign(obj, material)
    try:
        obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    except Exception:
        pass
    return obj


def plate_obj(name, origin, yaw, loc, width, height, thickness, material, rot_z=0.0, taper=0.78, belly=0.010):
    """A convex tapered lamellar plate. This avoids the Minecraft slab read."""
    bottom = width * 0.5
    top = bottom * taper
    z0 = -height * 0.5
    z1 = height * 0.5
    y_front = -thickness * 0.5
    y_back = thickness * 0.5
    y_mid = y_front - belly
    raw = [
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
    verts = []
    cz = math.cos(rot_z)
    sz = math.sin(rot_z)
    for x, y, z in raw:
        rx = x * cz - y * sz
        ry = x * sz + y * cz
        verts.append((loc[0] + rx, loc[1] + ry, loc[2] + z))
    faces = [
        (0, 1, 4, 3), (1, 2, 5, 4),
        (6, 9, 10, 7), (7, 10, 11, 8),
        (0, 6, 7, 1), (1, 7, 8, 2),
        (3, 4, 10, 9), (4, 5, 11, 10),
        (0, 3, 9, 6), (2, 8, 11, 5),
    ]
    obj = mesh_obj(name, origin, yaw, verts, faces, material)
    try:
        bevel = obj.modifiers.new("lacquered worn edges", "BEVEL")
        bevel.width = min(width, height) * 0.045
        bevel.segments = 2
    except Exception:
        pass
    return obj


def cloth_panel_obj(name, origin, yaw, loc, width, height, material, wave=0.018, strips=4):
    verts = []
    faces = []
    for i in range(strips + 1):
        x = -width * 0.5 + width * i / strips
        y = math.sin(i * 1.7) * wave
        verts.append((loc[0] + x, loc[1] + y, loc[2] - height * 0.5))
        verts.append((loc[0] + x, loc[1] - wave * 0.35, loc[2] + height * 0.5))
    for i in range(strips):
        faces.append((i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2))
    return mesh_obj(name, origin, yaw, verts, faces, material)


def flat_panel_obj(name, origin, yaw, loc, width, height, material):
    verts = [
        (loc[0] - width * 0.5, loc[1], loc[2] - height * 0.5),
        (loc[0] + width * 0.5, loc[1], loc[2] - height * 0.5),
        (loc[0] + width * 0.5, loc[1], loc[2] + height * 0.5),
        (loc[0] - width * 0.5, loc[1], loc[2] + height * 0.5),
    ]
    return mesh_obj(name, origin, yaw, verts, [(0, 1, 2, 3)], material)


def terrain_obj(name, width, depth, material):
    cols = 12
    rows = 9
    verts = []
    faces = []
    for iy in range(rows):
        y = -depth * 0.5 + depth * iy / (rows - 1)
        for ix in range(cols):
            x = -width * 0.5 + width * ix / (cols - 1)
            z = -0.035 + math.sin(ix * 1.19 + iy * 0.37) * 0.012 + math.cos(iy * 0.91) * 0.009
            verts.append((x, y, z))
    for iy in range(rows - 1):
        for ix in range(cols - 1):
            a = iy * cols + ix
            faces.append((a, a + 1, a + cols + 1, a + cols))
    obj = mesh_obj(name, (0, 0, 0), 0, verts, faces, material)
    try:
        obj.modifiers.new("soft rolling field normals", "WEIGHTED_NORMAL")
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
    feature_count = 0
    terrain_obj("rolling shinano countryside battlefield ground", 15.8, 11.1, materials["grass"])
    feature_count += 1

    # Painted dawn backdrop: keeps review renders out of a grey studio void.
    flat_panel_obj("painted dawn sky backdrop", (0, 5.72, 0), 0, (0, 0, 2.35), 40.0, 4.75, materials["sky"])
    flat_panel_obj("warm low horizon haze band", (0, 5.68, 0), 0, (0, 0, 0.93), 39.0, 0.42, materials["horizon"])
    feature_count += 2

    # Dirt road through the meeting point.
    for x in [-4.8, -2.4, 0.0, 2.4, 4.8]:
        sphere_obj("worn muddy road oval", (x, 0, 0), 0, (0, 0, 0.000), (1.55, 0.54, 0.022), materials["dirt"], segments=36, rings=10)
        sphere_obj("trampled pale dust patch", (x + 0.45, 0.12, 0), 0, (0, 0, 0.010), (0.52, 0.18, 0.006), materials["dust"], segments=24, rings=8)
        feature_count += 2

    # Water and rice paddies.
    sphere_obj("narrow blue river channel", (0, 3.55, 0), 0, (0, 0, 0.005), (6.95, 0.21, 0.014), materials["water"], segments=64, rings=8)
    feature_count += 1
    for idx, x in enumerate([-5.7, -3.7, 3.7, 5.7]):
        sphere_obj(f"flooded rice paddy {idx+1}", (x, -3.7, 0), 0, (0, 0, 0.006), (0.86, 0.62, 0.012), materials["paddy"], segments=36, rings=8)
        feature_count += 1
        for y in [-4.1, -3.7, -3.3]:
            curve_obj(f"rice paddy green shoots {idx+1} {y}", (x, y, 0), 0, [(-0.55, 0, 0.04), (-0.2, 0.02, 0.08), (0.2, -0.02, 0.08), (0.55, 0, 0.04)], materials["rice"], bevel=0.004)
            feature_count += 1
    for i, x in enumerate([-3.3, -2.2, -1.1, 1.1, 2.2, 3.3]):
        curve_obj(f"riverbank reed cluster {i+1}", (x, 3.27, 0), 0, [(-0.030, 0, 0.02), (-0.010, 0.012, 0.20), (0.020, -0.006, 0.05)], materials["reed"], bevel=0.004)
        curve_obj(f"far riverbank reed cluster {i+1}", (x + 0.24, 3.83, 0), 0, [(-0.020, 0, 0.02), (0.004, -0.010, 0.17), (0.028, 0.006, 0.05)], materials["reed"], bevel=0.004)
        feature_count += 2

    # Foreground grass and battlefield debris break up the toy-board silhouette.
    for i in range(56):
        gx = -7.1 + (i % 14) * 1.08 + math.sin(i * 1.7) * 0.12
        gy = -4.8 + (i // 14) * 2.75 + math.cos(i * 0.9) * 0.20
        if abs(gy) < 0.62 and abs(gx) < 5.7:
            continue
        h = 0.10 + (i % 5) * 0.018
        curve_obj(f"uneven battlefield grass tuft {i+1}", (gx, gy, 0), 0, [(-0.025, 0, 0.02), (-0.004, 0.010, h), (0.030, -0.006, 0.025)], materials["rice"], bevel=0.003)
        feature_count += 1
    for i, (x, y) in enumerate([(-1.4, -0.74), (-0.8, 0.68), (0.9, -0.58), (1.8, 0.48), (-2.2, 0.36), (2.5, -0.32)]):
        sphere_obj(f"small battlefield stone {i+1}", (x, y, 0), 0, (0, 0, 0.035), (0.075, 0.052, 0.032), materials["stone"], segments=16, rings=8)
        feature_count += 1

    # Distant hills.
    for name, loc, scale in [
        ("distant left cedar hill", (-6.0, 4.4, 0.28), (2.0, 0.9, 0.52)),
        ("distant center mountain ridge", (-0.4, 4.8, 0.38), (3.3, 0.85, 0.72)),
        ("distant right cedar hill", (5.8, 4.2, 0.24), (2.3, 0.85, 0.48)),
        ("far blue shinano mountain silhouette", (-2.5, 5.45, 0.88), (2.6, 0.20, 0.48)),
        ("far right shinano mountain silhouette", (4.4, 5.35, 0.74), (2.1, 0.18, 0.38)),
    ]:
        sphere_obj(name, (0, 0, 0), 0, loc, scale, materials["hill"], segments=32, rings=12)
        feature_count += 1

    # Trees, placed off the combat lane.
    for i, (x, y) in enumerate([(-6.8, 2.2), (-5.9, 3.1), (-4.8, 2.5), (-3.8, 3.4), (4.0, 3.35), (4.7, 2.1), (5.6, 3.0), (6.7, 2.35), (-6.2, -2.6), (6.1, -2.7)]):
        cyl_obj(f"cedar trunk {i+1}", (x, y, 0), 0, (0, 0, 0.27), 0.045, 0.54, materials["trunk"], vertices=12)
        cone_obj(f"cedar dark crown {i+1}", (x, y, 0), 0, (0, 0, 0.82), 0.34, 0.05, 0.85, materials["cedar"], vertices=18)
        feature_count += 2
    return {
        "environment_feature_count": feature_count,
        "sky_backdrop_count": 1,
        "tree_count": 10,
        "rice_paddy_count": 4,
        "river_reed_count": 12,
    }


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
    skin = materials["skin"]
    shadow = materials["shadow"]
    wear = materials["edge_wear"]
    height = 0.94 + (idx % 4) * 0.025

    # Body.
    sphere_obj(f"{prefix} dark robe torso under armor", origin, yaw, (0, 0, 0.91 * height), (0.15, 0.095, 0.32 * height), cloth, segments=28, rings=14)
    sphere_obj(f"{prefix} rounded do cuirass silhouette", origin, yaw, (0, -0.012, 1.06 * height), (0.22, 0.12, 0.30 * height), armor, segments=32, rings=16)
    sphere_obj(f"{prefix} subdued face behind mempo", origin, yaw, (0, -0.090, 1.54 * height), (0.065, 0.032, 0.087), skin, segments=28, rings=12)
    sphere_obj(f"{prefix} dark iron mempo mask", origin, yaw, (0, -0.132, 1.49 * height), (0.086, 0.022, 0.067), iron, segments=28, rings=10)
    cube_obj(f"{prefix} narrow eye shadow slit", origin, yaw, (0, -0.157, 1.555 * height), (0.118, 0.006, 0.014), shadow)
    sphere_obj(f"{prefix} kabuto helmet bowl", origin, yaw, (0, -0.018, 1.67 * height), (0.125, 0.094, 0.062), iron, segments=40, rings=14)
    cone_obj(f"{prefix} kabuto brim", origin, yaw, (0, -0.020, 1.61 * height), 0.176, 0.124, 0.043, iron, vertices=48)
    for sh_row, z in enumerate([1.54, 1.47, 1.40]):
        for sh_col in [-1, 0, 1]:
            plate_obj(
                f"{prefix} rear shikoro lamellar neck plate r{sh_row+1} c{sh_col+2}",
                origin,
                yaw,
                (sh_col * 0.052, 0.092 + sh_row * 0.008, z * height),
                0.060,
                0.052,
                0.014,
                iron if sh_row % 2 else armor,
                rot_z=math.radians(sh_col * 2.0),
                taper=0.70,
                belly=0.006,
            )
    for rib, xoff in enumerate([-0.050, 0.0, 0.050]):
        curve_obj(f"{prefix} raised kabuto rib {rib+1}", origin, yaw, [(xoff, -0.104, 1.67 * height), (xoff * 0.7, -0.045, 1.725 * height), (xoff * 0.2, 0.035, 1.69 * height)], wear, bevel=0.0032)

    # Helmet crests.
    if faction == "takeda":
        curve_obj(f"{prefix} crescent maedate crest", origin, yaw, [(-0.11, -0.13, 1.70 * height), (-0.04, -0.21, 1.82 * height), (0.04, -0.21, 1.82 * height), (0.11, -0.13, 1.70 * height)], brass, bevel=0.008)
    else:
        curve_obj(f"{prefix} left antler maedate", origin, yaw, [(-0.02, -0.13, 1.69 * height), (-0.10, -0.21, 1.83 * height), (-0.18, -0.17, 1.88 * height)], brass, bevel=0.008)
        curve_obj(f"{prefix} right antler maedate", origin, yaw, [(0.02, -0.13, 1.69 * height), (0.10, -0.21, 1.83 * height), (0.18, -0.17, 1.88 * height)], brass, bevel=0.008)

    # Armor plates and lacing.
    for row, z in enumerate([1.23, 1.11, 0.99, 0.87]):
        for col in range(5):
            xoff = -0.185 + col * 0.092
            plate_obj(
                f"{prefix} individual front lamellar plate r{row+1} c{col+1}",
                origin,
                yaw,
                (xoff, -0.139, z * height),
                0.082,
                0.090,
                0.018,
                armor if (row + col) % 2 == 0 else iron,
                rot_z=math.radians((col - 2) * 1.4),
                taper=0.74,
                belly=0.010,
            )
        curve_obj(f"{prefix} odoshi lacing row {row+1}", origin, yaw, [(-0.245, -0.169, z * height + 0.037), (-0.08, -0.184, z * height + 0.016), (0.08, -0.184, z * height + 0.016), (0.245, -0.169, z * height + 0.037)], cord, bevel=0.0036)
        for xoff in [-0.16, 0.0, 0.16]:
            curve_obj(f"{prefix} chipped lacquer highlight r{row+1} {xoff}", origin, yaw, [(xoff - 0.030, -0.190, z * height + 0.030), (xoff + 0.030, -0.192, z * height + 0.038)], wear, bevel=0.0019)
    for row, z in enumerate([1.20, 1.08, 0.96, 0.84]):
        for col in range(4):
            xoff = -0.135 + col * 0.090
            plate_obj(
                f"{prefix} rear lamellar back plate r{row+1} c{col+1}",
                origin,
                yaw,
                (xoff, 0.118, z * height),
                0.080,
                0.082,
                0.016,
                iron if (row + col) % 2 == 0 else armor,
                rot_z=math.radians((col - 1.5) * 1.1),
                taper=0.72,
                belly=0.008,
            )
        curve_obj(f"{prefix} rear odoshi lacing row {row+1}", origin, yaw, [(-0.198, 0.151, z * height + 0.031), (-0.060, 0.166, z * height + 0.014), (0.060, 0.166, z * height + 0.014), (0.198, 0.151, z * height + 0.031)], cord, bevel=0.0030)
    for xoff in [-0.17, -0.06, 0.06, 0.17]:
        curve_obj(f"{prefix} rear lacquer edge scratch {xoff}", origin, yaw, [(xoff - 0.025, 0.174, 1.16 * height), (xoff + 0.026, 0.176, 1.19 * height)], wear, bevel=0.0018)
    for side in [-1, 1]:
        sphere_obj(f"{prefix} shoulder sode undercloth {side}", origin, yaw, (side * 0.255, -0.005, 1.26 * height), (0.062, 0.064, 0.065), cloth, segments=18, rings=8)
        for plate in range(4):
            plate_obj(
                f"{prefix} articulated sode shoulder plate {side} {plate+1}",
                origin,
                yaw,
                (side * 0.348, -0.052, (1.25 - plate * 0.088) * height),
                0.155,
                0.062,
                0.016,
                armor if plate % 2 == 0 else iron,
                rot_z=math.radians(side * 4.0),
                taper=0.76,
                belly=0.009,
            )
            curve_obj(f"{prefix} sode lacing {side} {plate+1}", origin, yaw, [(side * 0.276, -0.078, (1.25 - plate * 0.088) * height + 0.021), (side * 0.348, -0.088, (1.25 - plate * 0.088) * height), (side * 0.418, -0.078, (1.25 - plate * 0.088) * height + 0.021)], cord, bevel=0.0028)
        sphere_obj(f"{prefix} upper arm {side}", origin, yaw, (side * 0.315, -0.002, 0.91 * height), (0.042, 0.038, 0.205), cloth, segments=18, rings=8)
        sphere_obj(f"{prefix} forearm kote {side}", origin, yaw, (side * 0.365, -0.064, 0.66 * height), (0.038, 0.030, 0.165), iron, segments=18, rings=8)
        sphere_obj(f"{prefix} glove {side}", origin, yaw, (side * 0.378, -0.107, 0.46 * height), (0.030, 0.025, 0.031), leather, segments=14, rings=6)
        sphere_obj(f"{prefix} hakama trouser leg {side}", origin, yaw, (side * 0.082, 0.0, 0.43 * height), (0.052, 0.044, 0.285), cloth, segments=18, rings=8)
        sphere_obj(f"{prefix} shin guard {side}", origin, yaw, (side * 0.102, -0.032, 0.21 * height), (0.038, 0.030, 0.160), iron, segments=18, rings=8)
        cube_obj(f"{prefix} woven waraji sandal {side}", origin, yaw, (side * 0.110, -0.095, 0.035), (0.080, 0.155, 0.018), leather, (0, 0, math.radians(side * 3)))
        curve_obj(f"{prefix} sandal toe strap {side}", origin, yaw, [(side * 0.085, -0.140, 0.052), (side * 0.110, -0.102, 0.075), (side * 0.135, -0.140, 0.052)], cord, bevel=0.0026)

    for side in [-1, 0, 1]:
        for row, z in enumerate([0.76, 0.63]):
            plate_obj(
                f"{prefix} kusazuri skirt {side} row {row+1}",
                origin,
                yaw,
                (side * 0.086, -0.120, z * height),
                0.082,
                0.125,
                0.016,
                armor if (side + row) % 2 else iron,
                rot_z=math.radians(side * 3),
                taper=0.70,
                belly=0.010,
            )

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
    cloth_panel_obj(f"{prefix} wind-bent sashimono cloth panel", origin, yaw, (0.31, 0.265, 1.60 * height), 0.18, 0.32, banner, wave=0.014 + (idx % 3) * 0.004, strips=4)
    add_banner_mon(prefix, origin, yaw, faction, materials)


def warrior_entries():
    entries = []
    poses = ["guard", "spear", "raised", "guard", "spear"]
    for faction, side, yaw in [("takeda", -1, math.pi / 2), ("uesugi", 1, -math.pi / 2)]:
        for idx in range(10):
            rank = idx // 5
            file = idx % 5
            x = side * (1.30 + rank * 0.62 + (file % 2) * 0.08)
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
        if hasattr(scene.eevee, "use_gtao"):
            scene.eevee.use_gtao = True
        if hasattr(scene.eevee, "gtao_distance"):
            scene.eevee.gtao_distance = 4
        if hasattr(scene.eevee, "gtao_factor"):
            scene.eevee.gtao_factor = 1.2
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 820
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.world = bpy.data.worlds.new("misty shinano dawn")
    scene.world.color = (0.30, 0.36, 0.38)

    materials = {
        "grass": mat("muted shinano field grass", (0.19, 0.29, 0.16), 0.85),
        "sky": mat("painted pale dawn sky", (0.30, 0.36, 0.38), 0.95),
        "horizon": mat("warm sunrise horizon haze", (0.55, 0.42, 0.27), 0.92),
        "dirt": mat("worn muddy battlefield road", (0.34, 0.25, 0.16), 0.90),
        "dust": mat("dry trampled road dust", (0.48, 0.42, 0.30), 0.92),
        "water": mat("shallow river blue grey", (0.12, 0.22, 0.28), 0.55),
        "paddy": mat("flooded rice paddy reflection", (0.16, 0.25, 0.22), 0.60),
        "rice": mat("young rice shoots", (0.26, 0.42, 0.18), 0.75),
        "reed": mat("dry riverbank reeds", (0.42, 0.36, 0.18), 0.78),
        "stone": mat("small grey battlefield stones", (0.20, 0.21, 0.19), 0.82),
        "hill": mat("distant cedar hillside", (0.10, 0.18, 0.12), 0.86),
        "cedar": mat("dark cedar foliage", (0.04, 0.10, 0.065), 0.88),
        "trunk": mat("cedar trunk bark", (0.18, 0.10, 0.055), 0.86),
        "shadow": mat("deep face and cloth shadow", (0.006, 0.006, 0.006), 0.90),
        "iron": mat("charcoal blackened iron armor", (0.042, 0.040, 0.035), 0.66, 0.28),
        "takeda_armor": mat("Takeda oxblood lacquer", (0.145, 0.014, 0.010), 0.58, 0.10),
        "uesugi_armor": mat("Uesugi weathered blue lacquer", (0.030, 0.075, 0.145), 0.58, 0.10),
        "takeda_cloth": mat("Takeda dark indigo cloth", (0.018, 0.028, 0.052), 0.84),
        "uesugi_cloth": mat("Uesugi ash blue cloth", (0.060, 0.066, 0.074), 0.84),
        "takeda_banner": mat("Takeda red sashimono", (0.12, 0.018, 0.014), 0.86),
        "uesugi_banner": mat("Uesugi pale sashimono", (0.74, 0.70, 0.58), 0.86),
        "takeda_cord": mat("Takeda tan odoshi cord", (0.48, 0.35, 0.17), 0.76),
        "uesugi_cord": mat("Uesugi blue odoshi cord", (0.18, 0.36, 0.58), 0.76),
        "leather": mat("dark worn leather", (0.10, 0.055, 0.027), 0.78),
        "skin": mat("subdued visible face skin", (0.30, 0.19, 0.13), 0.74),
        "brass": mat("aged brass mons and crests", (0.62, 0.43, 0.15), 0.48, 0.38),
        "blade": mat("brushed steel blades", (0.76, 0.78, 0.74), 0.28, 0.88),
        "wood": mat("bamboo and yari shafts", (0.45, 0.30, 0.13), 0.72),
        "edge_wear": mat("worn lacquer edge highlights", (0.58, 0.43, 0.24), 0.62, 0.12),
    }
    environment_stats = add_ground(materials)
    entries = warrior_entries()
    for entry in entries:
        add_warrior(entry, materials)
    takeda_front = max(entry["position"][0] for entry in entries if entry["faction"] == "takeda")
    uesugi_front = min(entry["position"][0] for entry in entries if entry["faction"] == "uesugi")
    center_gap = round(uesugi_front - takeda_front, 3)

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
        "takeda_line": ((0.95, -4.0, 2.15), (-2.75, 0, 0.98), 58),
        "uesugi_line": ((-0.95, -4.0, 2.15), (2.75, 0, 0.98), 58),
        "center_meeting": ((0.0, -5.6, 2.35), (0, 0, 0.98), 52),
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
        "center_gap": center_gap,
        **environment_stats,
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
