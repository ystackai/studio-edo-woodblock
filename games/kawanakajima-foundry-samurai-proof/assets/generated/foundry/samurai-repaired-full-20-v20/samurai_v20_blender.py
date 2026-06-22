from __future__ import annotations
import json, math, sys
from pathlib import Path
import bpy
from mathutils import Vector

def args_after_dash():
    if "--" in sys.argv: return sys.argv[sys.argv.index("--") + 1:]
    return sys.argv[1:]


FACTION_COLORS = {
    "takeda": {"armor": (0.72, 0.04, 0.03), "cloth": (0.13, 0.012, 0.010), "banner": (0.85, 0.06, 0.03), "crest": (0.72, 0.52, 0.13)},
    "uesugi": {"armor": (0.04, 0.10, 0.62), "cloth": (0.035, 0.07, 0.30), "banner": (0.07, 0.18, 0.78), "crest": (0.70, 0.72, 0.76)},
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
        rot = (0, 0, math.radians((i - (count - 1) / 2) * 1.5))
        plates.append(cube_obj(f"{prefix} lamellar plate {i+1:02d}", (x, y, z), (width, 0.032, height), material, rot))
    return plates

def build_better_hand(side, base_x, base_y, base_z, leather):
    s = 1 if side > 0 else -1
    palm = cube_obj(f"{'left' if side < 0 else 'right'} gloved hand", (base_x, base_y - 0.01, base_z + 0.01), (0.064, 0.050, 0.070), leather, (0, 0, math.radians(8 * side)))
    fingers = []
    fingers.append( cube_obj(f"{'left' if side < 0 else 'right'} hand finger index", (base_x + s*0.012, base_y - 0.032, base_z + 0.055), (0.017, 0.040, 0.020), leather, (math.radians(14), 0, math.radians(4*side))) )
    fingers.append( cube_obj(f"{'left' if side < 0 else 'right'} hand finger middle", (base_x + s*0.002, base_y - 0.038, base_z + 0.058), (0.017, 0.046, 0.019), leather, (math.radians(9), 0, 0)) )
    fingers.append( cube_obj(f"{'left' if side < 0 else 'right'} hand finger ring", (base_x - s*0.01, base_y - 0.034, base_z + 0.052), (0.015, 0.042, 0.017), leather, (math.radians(5), 0, math.radians(-3*side))) )
    fingers.append( cube_obj(f"{'left' if side < 0 else 'right'} hand finger pinky", (base_x - s*0.022, base_y - 0.028, base_z + 0.044), (0.013, 0.036, 0.015), leather, (math.radians(-3), 0, math.radians(-7*side))) )
    fingers.append( cube_obj(f"{'left' if side < 0 else 'right'} hand thumb base", (base_x + s*0.027, base_y + 0.006, base_z + 0.020), (0.020, 0.017, 0.026), leather, (math.radians(28), math.radians(12*side), math.radians(38*side))) )
    fingers.append( cube_obj(f"{'left' if side < 0 else 'right'} hand thumb tip", (base_x + s*0.040, base_y + 0.000, base_z + 0.036), (0.013, 0.013, 0.020), leather, (math.radians(12), math.radians(9*side), math.radians(28*side))) )
    for f in fingers:
        f.parent = palm
        f.matrix_parent_inverse = palm.matrix_world.inverted()
    return palm

def build_better_foot(side, base_x, base_y, base_z, leather, cord):
    s = 1 if side > 0 else -1
    foot = sphere_obj(f"{'left' if side < 0 else 'right'} tabi foot volume", (base_x, base_y - 0.004, base_z + 0.022), (0.085, 0.068, 0.035), leather, segments=26, rings=12, rot=(0, 0, math.radians(side * 6)))
    cube_obj(f"{'left' if side < 0 else 'right'} tabi big toe", (base_x + s * 0.017, base_y - 0.016, base_z + 0.040), (0.030, 0.036, 0.020), leather, (math.radians(9), 0, math.radians(side * 5)))
    cube_obj(f"{'left' if side <  0 else 'right'} woven waraji sole", (base_x, base_y - 0.006, base_z - 0.002), (0.140, 0.275, 0.026), leather, (0, 0, math.radians(side * 4)))
    curve_obj(f"{'left' if side < 0 else 'right'} sandal toe strap", [(base_x + s*0.010, base_y - 0.032, base_z + 0.032), (base_x, base_y - 0.010, base_z + 0.044), (base_x - s*0.010, base_y - 0.032, base_z + 0.032)], cord, bevel=0.0035)
    curve_obj(f"{'left' if side < 0 else 'right'} heel strap", [(base_x + s*0.028, base_y + 0.016, base_z + 0.006), (base_x - s*0.028, base_y + 0.016, base_z + 0.006)], cord, bevel=0.0025)
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

    # v20: two-volume torso for tapered human silhouette
    sphere_obj("chest volume", (0, -0.02, 1.78), (0.22, 0.125, 0.34), black, segments=40, rings=16)
    sphere_obj("waist volume", (0, -0.06, 1.56), (0.18, 0.10, 0.24), black, segments=36, rings=14)
    sphere_obj("head visible behind mempo", (0, -0.018, 2.42), (0.105, 0.125, 0.155), skin, segments=40, rings=16)
    cyl_obj("neck guard collar", (0, 0, 2.16), 0.12, 0.28, cloth, vertices=32)

    sphere_obj("segmented kabuto helmet bowl", (0, 0, 2.56), (0.228, 0.184, 0.135), iron, segments=64, rings=20)
    cone_obj("wide kabuto brim", (0, 0, 2.49), 0.338, 0.23, 0.055, iron, vertices=80)
    cone_obj("rear shikoro neck guard flare", (0, 0.16, 2.28), 0.338, 0.22, 0.28, iron, vertices=64, rot=(math.radians(80), 0, 0))
    for side in (-1, 1):
        cube_obj(f"{'left' if side < 0 else 'right'} side helmet flange", (side * 0.262, 0.016, 2.42), (0.145, 0.036, 0.26), iron, (0, math.radians(7 * side), math.radians(8 * side)))
    curve_obj("golden maedate crescent crest", [(-0.19, -0.19, 2.67), (-0.07, -0.27, 2.86), (0, -0.29, 2.92), (0.07, -0.27, 2.86), (0.19, -0.19, 2.67)], brass, bevel=0.014)
    cyl_obj("crest central rivet", (0, -0.215, 2.66), 0.024, 0.02, brass, vertices=28, rot=(math.radians(90), 0, 0))

    sphere_obj("dark iron mempo cheek mask", (0, -0.13, 2.33), (0.148, 0.046, 0.124), lacquer, segments=42, rings=16)
    cube_obj("mempo nose ridge", (0, -0.158, 2.285), (0.026, 0.052, 0.062), iron, (math.radians(-10), 0, 0))
    cube_obj("left eye slit", (-0.052, -0.164, 2.395), (0.036, 0.01, 0.016), black)
    cube_obj("right eye slit", (0.052, -0.164, 2.395), (0.036, 0.01, 0.016), black)
    cube_obj("mempo grim mouth slit", (0, -0.178, 2.31), (0.168, 0.009, 0.011), black)
    for side in (-1, 1):
        curve_obj(f"{'left' if side < 0 else 'right'} mask moustache bristle", [(side*0.03, -0.182, 2.34), (side*0.13, -0.228, 2.36), (side*0.218, -0.218, 2.378)], black, bevel=0.0025)
    for i, z in enumerate([2.135, 2.065, 1.995]):
        add_plate_row(f"throat guard row {i+1}", z, 5, 0.128, 0.05, -0.16, iron if i % 2 else lacquer, x0=-0.258)

    sphere_obj("rounded do cuirass silhouette", (0, -0.01, 1.72), (0.418, 0.228, 0.50), lacquer, segments=56, rings=20)
    for row, z in enumerate([1.99, 1.845, 1.70, 1.555, 1.41]):
        add_plate_row(f"front cuirass row {row+1}", z, 9, 0.108, 0.092, -0.262, iron if row % 2 else lacquer, x0=-0.448)
        add_plate_row(f"rear cuirass row {row+1}", z, 9, 0.108, 0.092, 0.255, iron if row % 2 else lacquer, x0=-0.448)
    for side in (-1, 1):
        for row, z in enumerate([1.90, 1.765, 1.63]):
            cube_obj(f"{'left' if side < 0 else 'right'} side cuirass plate {row+1}", (side * 0.448, -0.016, z), (0.06, 0.278, 0.098), iron if row % 2 else lacquer, (0, 0, math.radians(3.5 * side)))

    for side in (-1, 1):
        sphere_obj(f"{'left' if side < 0 else 'right'} shoulder undercloth", (side * 0.48, -0.016, 1.95), (0.14, 0.09, 0.09), cloth, segments=28, rings=14)
        for i, z in enumerate([1.97, 1.84, 1.71, 1.58]):
            cube_obj(f"{'left' if side < 0 else 'right'} sode shoulder plate {i+1}", (side * 0.63, -0.046, z), (0.248, 0.056, 0.098), lacquer if i % 2 else iron, (0, math.radians(2 * side), math.radians(7 * side)))
        sphere_obj(f"{'left' if side < 0 else 'right'} armored upper arm", (side * 0.53, -0.016, 1.43), (0.065, 0.055, 0.29), cloth, segments=28, rings=14, rot=(0, 0, math.radians(7 * side)))
        sphere_obj(f"{'left' if side < 0 else 'right'} sode shoulder armor", (side * 0.56, -0.03, 1.92), (0.10, 0.07, 0.11), lacquer, segments=24, rings=12)
        sphere_obj(f"{'left' if side < 0 else 'right'} kote forearm guard", (side * 0.60, -0.076, 1.055), (0.058, 0.045, 0.26), iron, segments=28, rings=14, rot=(0, math.radians(7 * side), math.radians(5 * side)))
        build_better_hand(side, side * 0.60, -0.132, 0.765, leather)

    for side in (-1, 0, 1):
        for i, z in enumerate([1.195, 1.035, 0.875]):
            cube_obj(f"kusazuri skirt plate {side:+d} row {i+1}", (side * 0.175, -0.212, z), (0.145, 0.04, 0.165), lacquer if i % 2 else iron, (math.radians(4.5), 0, math.radians(side * 3.5)))
            cube_obj(f"rear kusazuri skirt plate {side:+d} row {i+1}", (side * 0.175, 0.20, z), (0.145, 0.04, 0.165), iron if i % 2 else lacquer, (math.radians(-4.5), 0, math.radians(side * 3.5)))
    for side in (-1, 1):
        sphere_obj(f"{'left' if side < 0 else 'right'} hakama trouser leg", (side * 0.135, 0.0, 0.705), (0.07, 0.058, 0.38), cloth, segments=28, rings=14)
        sphere_obj(f"{'left' if side < 0 else 'right'} shin greave", (side * 0.165, -0.036, 0.385), (0.052, 0.038, 0.26), iron, segments=28, rings=14)
        build_better_foot(side, side * 0.175, -0.102, 0.088, leather, cord)
        for k, xoff in enumerate([-0.033, 0.0, 0.033]):
            curve_obj(f"{'left' if side < 0 else 'right'} hakama pleat {k+1}", [(side*(0.126+xoff), -0.068, 1.065), (side*(0.146+xoff), -0.056, 0.725), (side*(0.166+xoff), -0.05, 0.365)], black, bevel=0.0025)

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

    note = bpy.data.objects.new("samurai_v2_provenance", None)
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

    (out / "blender_outputs.json").write_text(json.dumps({"glb": glb_path, "blend": blend_path, "improvements": "parented fingers, split-toe tabi, recessed eyes, stronger forms"}, indent=2))

def main():
    argv = args_after_dash()
    spec = json.loads(Path(argv[argv.index("--spec") + 1]).resolve().read_text())
    out = Path(argv[argv.index("--out") + 1]).resolve()
    build_scene(spec, out)

if __name__ == "__main__":
    main()
