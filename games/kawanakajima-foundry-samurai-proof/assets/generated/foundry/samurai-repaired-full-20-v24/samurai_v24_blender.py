from __future__ import annotations
import json, math, sys
from pathlib import Path
import bpy
from mathutils import Vector

def args_after_dash():
    if "--" in sys.argv: return sys.argv[sys.argv.index("--") + 1:]
    return sys.argv[1:]


FACTION_COLORS = {
    "takeda": {"armor": (0.29, 0.018, 0.014), "cloth": (0.075, 0.010, 0.010), "banner": (0.45, 0.030, 0.020), "crest": (0.58, 0.43, 0.12)},
    "uesugi": {"armor": (0.018, 0.045, 0.27), "cloth": (0.014, 0.030, 0.13), "banner": (0.030, 0.075, 0.38), "crest": (0.58, 0.60, 0.64)},
}

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
    try: bpy.ops.object.shade_smooth()
    except: pass
    obj.select_set(False)
    try: obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    except: pass
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
        bevel.width = 0.016
        bevel.segments = 2
        obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    except: pass
    return obj

def plate_obj(name, loc, scale, material, rot=(0, 0, 0)):
    obj = cube_obj(name, loc, scale, material, rot)
    try:
        bevel = obj.modifiers.get("small worn bevels")
        if bevel:
            bevel.width = 0.010
            bevel.segments = 3
    except: pass
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

def curve_obj(name, points, material, bevel=0.016):
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

def add_plate_row(prefix, z, count, width, height, y, material, x0=-0.48, overlap=0.72):
    plates = []
    for i in range(count):
        x = x0 + i * width * overlap
        center_bias = (i - (count - 1) / 2)
        rot = (math.radians(2.0), math.radians(center_bias * 0.75), math.radians(center_bias * 1.55))
        plate = plate_obj(
            f"{prefix} bevelled lamellar plate {i+1:02d}",
            (x, y, z),
            (width * 0.88, 0.026, height * 0.72),
            material,
            rot=rot,
        )
        plates.append(plate)
    return plates

def add_armor_lacing(prefix, xs, z_top, z_bottom, y, material):
    for i, x in enumerate(xs):
        curve_obj(
            f"{prefix} vertical odoshi lace {i+1:02d}",
            [(x, y - 0.012, z_top), (x * 0.94, y - 0.020, (z_top + z_bottom) / 2), (x * 0.90, y - 0.010, z_bottom)],
            material,
            bevel=0.0038,
        )

def cloth_panel(name, loc, scale, material, rot=(0, 0, 0)):
    obj = plate_obj(name, loc, scale, material, rot)
    try:
        bevel = obj.modifiers.get("small worn bevels")
        if bevel:
            bevel.width = 0.020
            bevel.segments = 4
    except: pass
    return obj

def add_surface_scuffs(prefix, material, y, z_values, x_values, side=1):
    for zi, z in enumerate(z_values):
        for xi, x in enumerate(x_values):
            if (zi + xi) % 3 == 1:
                continue
            x0 = x * side
            curve_obj(
                f"{prefix} irregular lacquer scuff {zi:02d}-{xi:02d}",
                [(x0 - 0.022 * side, y, z + 0.010), (x0 + 0.018 * side, y - 0.004, z - 0.006)],
                material,
                bevel=0.0018,
            )

def build_better_hand(side, base_x, base_y, base_z, leather):
    s = 1 if side > 0 else -1
    label = "left" if side < 0 else "right"
    palm = sphere_obj(f"{label} leather palm volume", (base_x, base_y - 0.012, base_z + 0.018), (0.058, 0.036, 0.062), leather, segments=24, rings=12, rot=(0, 0, math.radians(7 * side)))
    fingers = [
        ("index", 0.021, 0.063, 0.071),
        ("middle", 0.007, 0.073, 0.076),
        ("ring", -0.008, 0.066, 0.070),
        ("pinky", -0.022, 0.054, 0.060),
    ]
    for name, xoff, reach, lift in fingers:
        x = base_x + s * xoff
        start = (x, base_y - 0.035, base_z + 0.036)
        mid = (x + s * 0.006, base_y - reach, base_z + lift)
        tip = (x + s * 0.004, base_y - reach - 0.012, base_z + lift + 0.002)
        curve_obj(f"{label} articulated {name} finger", [start, mid, tip], leather, bevel=0.007)
        sphere_obj(f"{label} {name} fingertip", tip, (0.010, 0.009, 0.010), leather, segments=12, rings=6)
    thumb_base = (base_x + s * 0.036, base_y + 0.000, base_z + 0.026)
    thumb_tip = (base_x + s * 0.058, base_y - 0.028, base_z + 0.049)
    curve_obj(f"{label} opposed thumb", [thumb_base, (base_x + s * 0.052, base_y - 0.014, base_z + 0.039), thumb_tip], leather, bevel=0.009)
    sphere_obj(f"{label} thumb fingertip", thumb_tip, (0.012, 0.010, 0.012), leather, segments=12, rings=6)
    return palm

def build_better_foot(side, base_x, base_y, base_z, leather, cord):
    s = 1 if side > 0 else -1
    label = "left" if side < 0 else "right"
    foot = sphere_obj(f"{label} split-toe tabi foot volume", (base_x, base_y - 0.028, base_z + 0.024), (0.075, 0.135, 0.034), leather, segments=28, rings=12, rot=(math.radians(2), 0, math.radians(side * 4)))
    sphere_obj(f"{label} separated big toe", (base_x + s * 0.030, base_y - 0.128, base_z + 0.037), (0.024, 0.034, 0.018), leather, segments=14, rings=8, rot=(0, 0, math.radians(side * 4)))
    sphere_obj(f"{label} outer toe group", (base_x - s * 0.018, base_y - 0.126, base_z + 0.032), (0.030, 0.030, 0.016), leather, segments=14, rings=8, rot=(0, 0, math.radians(side * 3)))
    cube_obj(f"{label} woven waraji sole grounded", (base_x, base_y - 0.030, base_z - 0.010), (0.125, 0.295, 0.018), leather, (0, 0, math.radians(side * 3)))
    curve_obj(f"{label} sandal toe strap", [(base_x + s*0.030, base_y - 0.142, base_z + 0.045), (base_x, base_y - 0.075, base_z + 0.050), (base_x - s*0.030, base_y - 0.142, base_z + 0.040)], cord, bevel=0.0038)
    curve_obj(f"{label} heel strap", [(base_x + s*0.040, base_y + 0.070, base_z + 0.010), (base_x - s*0.040, base_y + 0.070, base_z + 0.010)], cord, bevel=0.0028)
    return foot

def build_scene(spec, out):
    clear_scene()
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 32
        scene.eevee.use_gtao = True
    scene.render.resolution_x = 960
    scene.render.resolution_y = 720
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.05
    scene.world = bpy.data.worlds.new("charcoal studio world")
    scene.world.color = (0.015, 0.016, 0.015)

    faction = spec.get("faction", "takeda").lower()
    faction_colors = FACTION_COLORS.get(faction, FACTION_COLORS["takeda"])
    iron = mat("dark burnished iron", (0.031, 0.030, 0.028), 0.34, 0.82)
    lacquer = mat(f"{faction} lacquered armor", faction_colors["armor"], 0.52, 0.10)
    black = mat("matte black silk", (0.007, 0.007, 0.006), 0.88, 0.0)
    cloth = mat(f"{faction} cloth", faction_colors["cloth"], 0.82, 0.0)
    banner_cloth = mat(f"{faction} sashimono cloth", faction_colors["banner"], 0.84, 0.0)
    cord = mat("aged tan odoshi lacing", (0.45, 0.32, 0.15), 0.74, 0.0)
    leather = mat("dark brown worn leather", (0.098, 0.050, 0.022), 0.68, 0.0)
    skin = mat("subdued natural skin", (0.36, 0.235, 0.155), 0.64, 0.0)
    brass = mat(f"{faction} crest metal", faction_colors["crest"], 0.48, 0.48)
    blade = mat("brushed steel katana blade", (0.70, 0.73, 0.71), 0.24, 0.90)
    edge = mat("bright sharpened blade edge", (0.95, 0.96, 0.90), 0.15, 1.0)
    wear = mat("worn lacquer edges", (0.66, 0.55, 0.35), 0.60, 0.22)

    cube_obj("matte charcoal inspection plinth", (0, 0, -0.08), (4.0, 3.4, 0.05), mat("plinth", (0.023, 0.024, 0.023), 0.86))

    # v24: keep the body taller and clothed, while reducing the mascot-like head and helmet mass.
    sphere_obj("ribcage under-kimono volume", (0, -0.025, 1.80), (0.205, 0.128, 0.340), black, segments=40, rings=16)
    sphere_obj("narrow waist under-kimono volume", (0, -0.060, 1.54), (0.150, 0.102, 0.245), black, segments=36, rings=14)
    sphere_obj("small visible human forehead behind mempo", (0, -0.018, 2.390), (0.067, 0.074, 0.086), skin, segments=40, rings=16)
    cyl_obj("thin exposed neck", (0, -0.006, 2.185), 0.046, 0.17, skin, vertices=28)
    cyl_obj("neck guard collar", (0, 0, 2.14), 0.105, 0.20, cloth, vertices=32)

    sphere_obj("compact segmented kabuto helmet bowl", (0, 0, 2.505), (0.145, 0.122, 0.083), iron, segments=64, rings=20)
    cone_obj("thin kabuto brim", (0, 0, 2.445), 0.208, 0.148, 0.032, iron, vertices=80)
    cone_obj("layered rear shikoro neck guard", (0, 0.112, 2.270), 0.185, 0.120, 0.188, iron, vertices=64, rot=(math.radians(80), 0, 0))
    for side in (-1, 1):
        cube_obj(f"{'left' if side < 0 else 'right'} compact side helmet flange", (side * 0.192, 0.012, 2.385), (0.082, 0.026, 0.170), iron, (0, math.radians(6 * side), math.radians(7 * side)))
    curve_obj("thin golden maedate crescent crest", [(-0.105, -0.164, 2.570), (-0.040, -0.205, 2.695), (0, -0.218, 2.735), (0.040, -0.205, 2.695), (0.105, -0.164, 2.570)], brass, bevel=0.006)
    cyl_obj("crest central rivet", (0, -0.180, 2.585), 0.018, 0.016, brass, vertices=28, rot=(math.radians(90), 0, 0))

    plate_obj("left angular mempo cheek plate", (-0.045, -0.132, 2.305), (0.060, 0.026, 0.084), lacquer, (math.radians(-7), math.radians(-8), math.radians(-8)))
    plate_obj("right angular mempo cheek plate", (0.045, -0.132, 2.305), (0.060, 0.026, 0.084), lacquer, (math.radians(-7), math.radians(8), math.radians(8)))
    plate_obj("mempo chin guard", (0, -0.140, 2.238), (0.096, 0.024, 0.040), iron, (math.radians(-4), 0, 0))
    cube_obj("mempo nose ridge", (0, -0.151, 2.292), (0.017, 0.038, 0.054), iron, (math.radians(-10), 0, 0))
    cube_obj("left narrow eye slit", (-0.036, -0.154, 2.372), (0.030, 0.007, 0.010), black)
    cube_obj("right narrow eye slit", (0.036, -0.154, 2.372), (0.030, 0.007, 0.010), black)
    cube_obj("mempo grim mouth slit", (0, -0.166, 2.288), (0.088, 0.006, 0.008), black)
    for side in (-1, 1):
        curve_obj(f"{'left' if side < 0 else 'right'} mask moustache bristle", [(side*0.03, -0.182, 2.34), (side*0.13, -0.228, 2.36), (side*0.218, -0.218, 2.378)], black, bevel=0.0025)
    for i, z in enumerate([2.125, 2.060, 1.995]):
        add_plate_row(f"throat guard row {i+1}", z, 5, 0.108, 0.042, -0.158, iron if i % 2 else lacquer, x0=-0.218)

    cloth_panel("front under-kimono chest panel", (0, -0.215, 1.77), (0.405, 0.030, 0.545), cloth, (math.radians(2.0), 0, 0))
    cloth_panel("rear under-kimono back panel", (0, 0.205, 1.73), (0.380, 0.030, 0.520), cloth, (math.radians(-2.0), 0, 0))
    sphere_obj("upper do cuirass fitted shell", (0, -0.020, 1.80), (0.330, 0.165, 0.275), lacquer, segments=48, rings=16)
    sphere_obj("lower do cuirass narrowed shell", (0, -0.040, 1.52), (0.265, 0.140, 0.220), lacquer, segments=44, rings=14)
    for row, z in enumerate([1.985, 1.845, 1.705, 1.565, 1.425]):
        add_plate_row(f"front cuirass row {row+1}", z, 8, 0.112, 0.072, -0.248, iron if row % 2 else lacquer, x0=-0.385)
        add_plate_row(f"rear cuirass row {row+1}", z, 8, 0.112, 0.072, 0.242, iron if row % 2 else lacquer, x0=-0.385)
    add_armor_lacing("front cuirass", [-0.28, -0.17, -0.06, 0.06, 0.17, 0.28], 2.035, 1.385, -0.278, cord)
    add_armor_lacing("rear cuirass", [-0.25, -0.12, 0.0, 0.12, 0.25], 1.970, 1.400, 0.270, cord)
    add_surface_scuffs("front cuirass", wear, -0.286, [1.94, 1.81, 1.68, 1.55, 1.43], [-0.31, -0.19, -0.08, 0.07, 0.21, 0.32])
    add_surface_scuffs("rear cuirass", wear, 0.278, [1.88, 1.73, 1.59, 1.46], [-0.27, -0.12, 0.06, 0.22])
    for side in (-1, 1):
        for row, z in enumerate([1.90, 1.765, 1.63]):
            cube_obj(f"{'left' if side < 0 else 'right'} side cuirass plate {row+1}", (side * 0.448, -0.016, z), (0.06, 0.278, 0.098), iron if row % 2 else lacquer, (0, 0, math.radians(3.5 * side)))

    for side in (-1, 1):
        sphere_obj(f"{'left' if side < 0 else 'right'} shoulder undercloth", (side * 0.405, -0.014, 1.925), (0.095, 0.074, 0.072), cloth, segments=28, rings=14)
        for i, z in enumerate([1.95, 1.85, 1.75, 1.65]):
            plate_obj(f"{'left' if side < 0 else 'right'} narrow sode shoulder plate {i+1}", (side * 0.505, -0.045, z), (0.145, 0.036, 0.054), lacquer if i % 2 else iron, (math.radians(1.5), math.radians(3 * side), math.radians(5 * side)))
        cloth_panel(f"{'left' if side < 0 else 'right'} long hanging sleeve cloth", (side * 0.455, -0.065, 1.345), (0.100, 0.034, 0.560), cloth, (math.radians(3), math.radians(4 * side), math.radians(5 * side)))
        sphere_obj(f"{'left' if side < 0 else 'right'} hidden upper arm volume", (side * 0.470, -0.016, 1.405), (0.040, 0.035, 0.265), black, segments=28, rings=14, rot=(0, 0, math.radians(6 * side)))
        sphere_obj(f"{'left' if side < 0 else 'right'} small shoulder armor cap", (side * 0.475, -0.03, 1.900), (0.068, 0.052, 0.073), lacquer, segments=24, rings=12)
        sphere_obj(f"{'left' if side < 0 else 'right'} kote forearm guard", (side * 0.515, -0.076, 1.055), (0.040, 0.032, 0.250), iron, segments=28, rings=14, rot=(0, math.radians(7 * side), math.radians(5 * side)))
        build_better_hand(side, side * 0.515, -0.132, 0.780, leather)

    for side in (-1, 0, 1):
        for i, z in enumerate([1.195, 1.035, 0.875]):
            cube_obj(f"kusazuri skirt plate {side:+d} row {i+1}", (side * 0.175, -0.212, z), (0.145, 0.04, 0.165), lacquer if i % 2 else iron, (math.radians(4.5), 0, math.radians(side * 3.5)))
            cube_obj(f"rear kusazuri skirt plate {side:+d} row {i+1}", (side * 0.175, 0.20, z), (0.145, 0.04, 0.165), iron if i % 2 else lacquer, (math.radians(-4.5), 0, math.radians(side * 3.5)))
    add_surface_scuffs("front skirt armor", wear, -0.220, [1.16, 1.01, 0.88], [-0.22, -0.08, 0.10, 0.24])
    for side in (-1, 1):
        cloth_panel(f"{'left' if side < 0 else 'right'} broad hanging hakama outer cloth", (side * 0.165, -0.064, 0.725), (0.165, 0.043, 0.575), cloth, (math.radians(2), math.radians(4 * side), math.radians(3 * side)))
        cloth_panel(f"{'left' if side < 0 else 'right'} deep side hakama fold", (side * 0.290, -0.004, 0.750), (0.082, 0.048, 0.510), black, (math.radians(1), math.radians(10 * side), math.radians(6 * side)))
    for side in (-1, 1):
        sphere_obj(f"{'left' if side < 0 else 'right'} hidden hakama trouser leg volume", (side * 0.128, 0.0, 0.705), (0.050, 0.044, 0.360), black, segments=28, rings=14)
        sphere_obj(f"{'left' if side < 0 else 'right'} slim shin greave", (side * 0.155, -0.036, 0.385), (0.036, 0.029, 0.245), iron, segments=28, rings=14)
        build_better_foot(side, side * 0.165, -0.102, 0.077, leather, cord)
        for k, xoff in enumerate([-0.033, 0.0, 0.033]):
            curve_obj(f"{'left' if side < 0 else 'right'} hakama pleat {k+1}", [(side*(0.126+xoff), -0.070, 1.080), (side*(0.152+xoff), -0.058, 0.730), (side*(0.180+xoff), -0.052, 0.335)], black, bevel=0.0032)

    curve_obj("drawn katana blade spine", [(-0.77, -0.228, 0.695), (-0.475, -0.355, 1.045), (-0.195, -0.495, 1.415), (0.078, -0.615, 1.815)], blade, bevel=0.012)
    curve_obj("bright sharpened katana edge", [(-0.755, -0.252, 0.695), (-0.445, -0.38, 1.045), (-0.165, -0.52, 1.415), (0.098, -0.64, 1.815)], edge, bevel=0.004)
    cyl_obj("wrapped katana grip", (-0.895, -0.168, 0.565), 0.042, 0.33, leather, vertices=20, rot=(math.radians(56), math.radians(0), math.radians(-31)))
    cube_obj("square tsuba guard", (-0.775, -0.248, 0.715), (0.155, 0.024, 0.105), brass, (math.radians(56), 0, math.radians(-31)))
    curve_obj("lacquered saya scabbard at left hip", [(-0.535, 0.178, 1.045), (-0.775, 0.168, 0.775), (-1.015, 0.148, 0.515)], lacquer, bevel=0.032)
    curve_obj("waist sash tying armor", [(-0.575, -0.078, 1.275), (-0.245, -0.208, 1.235), (0.175, -0.198, 1.235), (0.575, -0.078, 1.275)], cord, bevel=0.016)

    curve_obj("bamboo sashimono back pole", [(0.315, 0.215, 1.045), (0.355, 0.305, 2.485)], cord, bevel=0.01)
    cube_obj("small lacquered sashimono crossbar", (0.355, 0.285, 2.325), (0.29, 0.016, 0.016), brass, (0, 0, math.radians(2.5)))
    cube_obj("cloth sashimono banner panel", (0.465, 0.305, 2.055), (0.245, 0.022, 0.455), banner_cloth, (0, 0, math.radians(1.5)))
    sphere_obj("simple round clan mon on banner", (0.465, 0.288, 2.105), (0.048, 0.0045, 0.048), brass, segments=28, rings=10)

    bpy.ops.object.light_add(type="AREA", location=(2.6, -3.3, 4.3))
    key = bpy.context.object; key.name = "cool key"; key.data.energy = 520; key.data.size = 3.8
    bpy.ops.object.light_add(type="AREA", location=(-2.9, 2.4, 3.0))
    rim = bpy.context.object; rim.name = "rim"; rim.data.energy = 150; rim.data.size = 2.0; rim.data.color = (0.68, 0.85, 0.96)

    bpy.ops.object.camera_add(location=(2.95, -4.15, 2.36))
    cam = bpy.context.object
    cam.name = "hero cam"
    look_at(cam, (0, -0.03, 1.54))
    cam.data.lens = 55
    scene.camera = cam

    note = bpy.data.objects.new("samurai_v24_provenance", None)
    note["prompt"] = spec.get("prompt", "")
    bpy.context.collection.objects.link(note)

    blend_path = str(out / "samurai_character_source.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    glb_path = str(out / "samurai_character.glb")
    try:
        bpy.ops.export_scene.gltf(filepath=glb_path, export_format="GLB", export_yup=True)
    except Exception as e:
        (out / "export_err.txt").write_text(str(e))

    views = {
        "hero": ((2.95, -4.15, 2.36), (0, -0.03, 1.54), 55),
        "front": ((0, -4.95, 1.76), (0, 0, 1.44), 62),
        "left": ((-4.4, -0.06, 1.72), (0, 0, 1.44), 62),
        "rear": ((0, 4.7, 1.70), (0, 0, 1.44), 62),
        "top": ((0.03, -0.2, 5.2), (0, 0, 1.26), 55),
        "three_quarter": ((-3.45, -3.65, 2.08), (0, 0, 1.44), 52),
    }
    for name, (loc, target, lens) in views.items():
        cam.location = loc
        look_at(cam, target)
        cam.data.lens = lens
        scene.render.filepath = str(out / f"samurai_character_{name}.png")
        bpy.ops.render.render(write_still=True)

    # minimal turntable (8 frames)
    for i in range(8):
        angle = (math.pi * 2) * i / 8
        cam.location = (math.sin(angle) * 4.2, math.cos(angle) * -4.2, 2.05)
        look_at(cam, (0, 0, 1.47))
        cam.data.lens = 52
        scene.render.filepath = str(out / f"turntable_{i:03d}.png")
        bpy.ops.render.render(write_still=True)

    (out / "blender_outputs.json").write_text(json.dumps({"glb": glb_path, "blend": blend_path, "improvements": "v24 compact helmet/head, tighter shoulders, sleeve-covered arms, broader hakama cloth silhouette, darker faction palette, lacquer scuffs, preserved multi-angle verification cameras"}, indent=2))

def main():
    argv = args_after_dash()
    spec = json.loads(Path(argv[argv.index("--spec") + 1]).resolve().read_text())
    out = Path(argv[argv.index("--out") + 1]).resolve()
    build_scene(spec, out)

if __name__ == "__main__":
    main()
