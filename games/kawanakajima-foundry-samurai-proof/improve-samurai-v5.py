#!/usr/bin/env python3
"""
v5 repair pass for the Foundry samurai proof.

The earlier autonomous retries preserved the game wiring but drifted into a
blocky toy-soldier silhouette. This script builds a cleaner procedural samurai
source in Blender: human proportions, kabuto, mempo, lamellar armor, sode,
hakama, sandals, katana, and a restrained back sashimono.
"""
import math
import os
import shutil
import sys
from pathlib import Path

try:
    import bpy
    from mathutils import Vector
except Exception:
    print("Run this via /usr/bin/blender --background --python", __file__)
    sys.exit(1)


ROOT = Path(__file__).resolve().parents[2]
GAME_DIR = ROOT / "games" / "kawanakajima-foundry-samurai-proof"
FOUNDARY_DIR = GAME_DIR / "assets" / "generated" / "foundry" / "samurai"
OUT_DIR = FOUNDARY_DIR / "improved-20260620-v5"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def make_mat(name, color, roughness=0.72, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


MATS = {
    "lacquer": make_mat("deep_black_lacquer", (0.015, 0.013, 0.011, 1), 0.38),
    "iron": make_mat("dark_iron_edges", (0.055, 0.052, 0.048, 1), 0.5, 0.15),
    "armor_red": make_mat("aged_akai_lacquer", (0.31, 0.045, 0.035, 1), 0.52),
    "cord": make_mat("indigo_cord_lacing", (0.055, 0.075, 0.12, 1), 0.78),
    "cloth": make_mat("faded_indigo_hakama", (0.035, 0.052, 0.085, 1), 0.86),
    "skin": make_mat("weathered_skin", (0.42, 0.25, 0.17, 1), 0.72),
    "mask": make_mat("russet_mempo_mask", (0.18, 0.045, 0.035, 1), 0.6),
    "gold": make_mat("dulled_brass_mon", (0.76, 0.57, 0.22, 1), 0.42, 0.15),
    "leather": make_mat("dark_worn_leather", (0.11, 0.07, 0.04, 1), 0.72),
    "wood": make_mat("dark_stained_wood", (0.16, 0.09, 0.035, 1), 0.75),
    "steel": make_mat("brushed_steel_blade", (0.78, 0.78, 0.72, 1), 0.28, 0.45),
    "banner": make_mat("aged_crimson_sashimono", (0.44, 0.065, 0.045, 1), 0.8),
    "banner_ink": make_mat("painted_mon", (0.84, 0.73, 0.48, 1), 0.76),
}


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for block in (bpy.data.meshes, bpy.data.images):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def shade(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    try:
        bpy.ops.object.shade_smooth()
    except Exception:
        pass
    obj.select_set(False)
    return obj


def add_weighted_normal(obj):
    mod = obj.modifiers.new("weighted_normal", "WEIGHTED_NORMAL")
    mod.keep_sharp = True
    return obj


def ellipsoid(name, loc, scale, mat, segments=32, rings=16, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    shade(obj)
    return obj


def cube(name, loc, dims, mat, rot=(0, 0, 0), bevel=0.012):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dims
    obj.data.materials.append(mat)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new("soft_bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        mod.affect = "EDGES"
        add_weighted_normal(obj)
    return obj


def cyl(name, loc, radius, depth, mat, vertices=24, rot=(0, 0, 0), bevel=False):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    shade(obj)
    if bevel:
        mod = obj.modifiers.new("rim_bevel", "BEVEL")
        mod.width = 0.01
        mod.segments = 2
        add_weighted_normal(obj)
    return obj


def cone(name, loc, r1, r2, depth, mat, vertices=32, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    shade(obj)
    return obj


def cylinder_between(name, start, end, radius, mat, vertices=16):
    start = Vector(start)
    end = Vector(end)
    mid = (start + end) * 0.5
    length = (end - start).length
    obj = cyl(name, mid, radius, length, mat, vertices=vertices)
    obj.rotation_euler = (end - start).to_track_quat("Z", "Y").to_euler()
    return obj


def add_plate_row(prefix, z, y, width, cols, mat, inset=0.0):
    for i in range(cols):
        x = -width * 0.5 + (i + 0.5) * (width / cols)
        plate = cube(
            f"{prefix}_kozane_{int(z * 100)}_{i}",
            (x, y - 0.012 * abs(i - (cols - 1) / 2), z),
            (width / cols * 0.84, 0.034, 0.105),
            mat,
            rot=(math.radians(4), 0, math.radians((i - (cols - 1) / 2) * 1.5)),
            bevel=0.01,
        )
        plate.location.x *= 1.0 - inset


def add_sode(side):
    sign = -1 if side == "left" else 1
    shoulder = ellipsoid(f"{side}_rounded_shoulder_undercloth", (sign * 0.34, -0.015, 1.25), (0.095, 0.095, 0.12), MATS["cloth"], 24, 12)
    shoulder.rotation_euler[1] = math.radians(sign * 9)
    for j in range(5):
        z = 1.28 - j * 0.075
        x = sign * (0.43 + j * 0.01)
        plate = cube(
            f"{side}_layered_sode_{j}",
            (x, -0.04, z),
            (0.22, 0.038, 0.066),
            MATS["armor_red"] if j % 2 == 0 else MATS["lacquer"],
            rot=(math.radians(5), math.radians(sign * 10), math.radians(sign * 4)),
            bevel=0.014,
        )
        cylinder_between(f"{side}_sode_lace_{j}_a", (x - sign * 0.07, -0.066, z + 0.035), (x - sign * 0.07, -0.066, z - 0.035), 0.004, MATS["cord"], 8)
        cylinder_between(f"{side}_sode_lace_{j}_b", (x + sign * 0.07, -0.066, z + 0.035), (x + sign * 0.07, -0.066, z - 0.035), 0.004, MATS["cord"], 8)


def add_arm(side):
    sign = -1 if side == "left" else 1
    cylinder_between(f"{side}_upper_arm_cloth", (sign * 0.42, -0.015, 1.14), (sign * 0.55, -0.025, 0.92), 0.055, MATS["cloth"], 18)
    cylinder_between(f"{side}_forearm_kote", (sign * 0.55, -0.025, 0.92), (sign * 0.49, -0.12, 0.72), 0.047, MATS["iron"], 18)
    ellipsoid(f"{side}_gloved_hand", (sign * 0.48, -0.16, 0.66), (0.048, 0.035, 0.038), MATS["leather"], 18, 10)
    for fi in range(4):
        cylinder_between(
            f"{side}_finger_{fi}",
            (sign * (0.455 + fi * 0.012), -0.185, 0.65),
            (sign * (0.452 + fi * 0.012), -0.23, 0.638),
            0.006,
            MATS["leather"],
            8,
        )


def add_leg(side):
    sign = -1 if side == "left" else 1
    cylinder_between(f"{side}_hakama_outer_fold", (sign * 0.17, -0.02, 0.78), (sign * 0.23, -0.015, 0.35), 0.08, MATS["cloth"], 20)
    cylinder_between(f"{side}_shin_guard", (sign * 0.23, -0.015, 0.45), (sign * 0.25, -0.03, 0.19), 0.042, MATS["lacquer"], 18)
    cylinder_between(f"{side}_ankle_tabi_bridge", (sign * 0.25, -0.035, 0.205), (sign * 0.25, -0.095, 0.115), 0.034, MATS["cloth"], 16)
    ellipsoid(f"{side}_tabi_sock", (sign * 0.25, -0.13, 0.105), (0.075, 0.13, 0.042), MATS["cloth"], 18, 10, rot=(0, 0, math.radians(sign * 2)))
    cube(f"{side}_geta_sole", (sign * 0.25, -0.14, 0.048), (0.14, 0.24, 0.03), MATS["wood"], rot=(0, 0, math.radians(sign * 2)), bevel=0.012)
    cube(f"{side}_geta_tooth_front", (sign * 0.25, -0.205, 0.018), (0.12, 0.02, 0.035), MATS["wood"], rot=(0, 0, math.radians(sign * 2)), bevel=0.006)
    cube(f"{side}_geta_tooth_rear", (sign * 0.25, -0.075, 0.018), (0.12, 0.02, 0.035), MATS["wood"], rot=(0, 0, math.radians(sign * 2)), bevel=0.006)
    cylinder_between(f"{side}_geta_thong_a", (sign * 0.20, -0.165, 0.085), (sign * 0.25, -0.125, 0.125), 0.006, MATS["leather"], 8)
    cylinder_between(f"{side}_geta_thong_b", (sign * 0.30, -0.165, 0.085), (sign * 0.25, -0.125, 0.125), 0.006, MATS["leather"], 8)


def add_kabuto():
    ellipsoid("kabuto_helmet_bowl", (0.0, -0.02, 1.56), (0.23, 0.20, 0.13), MATS["lacquer"], 40, 18)
    ellipsoid("helmet_front_brim", (0.0, -0.185, 1.49), (0.25, 0.055, 0.025), MATS["lacquer"], 32, 10)
    ellipsoid("helmet_rear_flare", (0.0, 0.12, 1.47), (0.25, 0.105, 0.035), MATS["lacquer"], 32, 10)
    ellipsoid("helmet_gold_rivet", (0.0, -0.205, 1.62), (0.028, 0.018, 0.028), MATS["gold"], 18, 8)
    for side, sign in (("left", -1), ("right", 1)):
        cube(f"{side}_fukigaeshi_flare", (sign * 0.21, -0.08, 1.43), (0.055, 0.105, 0.18), MATS["lacquer"], rot=(0, math.radians(sign * 10), math.radians(sign * 18)), bevel=0.015)
    for j in range(4):
        cube(f"shikoro_neck_guard_{j}", (0.0, 0.095 + j * 0.025, 1.405 - j * 0.048), (0.46 - j * 0.045, 0.036, 0.055), MATS["lacquer"], rot=(math.radians(-8 - j * 2), 0, 0), bevel=0.01)
    # Brass crescent crest, restrained but readable.
    for side, sign in (("left", -1), ("right", 1)):
        horn = cylinder_between(f"maedate_crescent_{side}", (sign * 0.025, -0.235, 1.655), (sign * 0.16, -0.24, 1.83), 0.012, MATS["gold"], 12)
        horn.scale.x = 0.65
    cyl("maedate_center_stud", (0, -0.235, 1.64), 0.018, 0.035, MATS["gold"], 16, rot=(math.radians(90), 0, 0))


def add_face_mask():
    ellipsoid("visible_face_shadow", (0, -0.15, 1.38), (0.115, 0.055, 0.125), MATS["skin"], 24, 12)
    ellipsoid("mempo_cheek_mask", (0, -0.19, 1.31), (0.125, 0.05, 0.105), MATS["mask"], 24, 12)
    cube("left_eye_slit", (-0.052, -0.235, 1.405), (0.052, 0.012, 0.014), MATS["lacquer"], bevel=0.004)
    cube("right_eye_slit", (0.052, -0.235, 1.405), (0.052, 0.012, 0.014), MATS["lacquer"], bevel=0.004)
    cylinder_between("mempo_moustache_left", (-0.02, -0.235, 1.305), (-0.105, -0.248, 1.285), 0.006, MATS["lacquer"], 8)
    cylinder_between("mempo_moustache_right", (0.02, -0.235, 1.305), (0.105, -0.248, 1.285), 0.006, MATS["lacquer"], 8)


def add_torso():
    ellipsoid("cloth_torso_underlayer", (0, 0.0, 1.05), (0.25, 0.16, 0.31), MATS["cloth"], 32, 16)
    cube("do_cuirass_core", (0, -0.055, 1.07), (0.46, 0.12, 0.47), MATS["armor_red"], rot=(math.radians(2), 0, 0), bevel=0.035)
    for row, z in enumerate([1.25, 1.155, 1.06, 0.965, 0.87]):
        add_plate_row(f"front_row_{row}", z, -0.14, 0.42 - row * 0.015, 7 if row < 3 else 6, MATS["armor_red"] if row % 2 == 0 else MATS["lacquer"], row * 0.025)
    for side, sign in (("left", -1), ("right", 1)):
        for row in range(4):
            cube(
                f"{side}_side_lamellar_{row}",
                (sign * 0.255, -0.012, 1.18 - row * 0.095),
                (0.045, 0.095, 0.075),
                MATS["lacquer"] if row % 2 else MATS["armor_red"],
                rot=(0, math.radians(sign * 14), 0),
                bevel=0.01,
            )
    cylinder_between("obi_sash_front", (-0.25, -0.165, 0.84), (0.25, -0.165, 0.84), 0.015, MATS["cord"], 12)
    cube("kusazuri_front_left", (-0.11, -0.10, 0.72), (0.12, 0.055, 0.19), MATS["armor_red"], rot=(math.radians(8), 0, math.radians(-2)), bevel=0.012)
    cube("kusazuri_front_right", (0.11, -0.10, 0.72), (0.12, 0.055, 0.19), MATS["armor_red"], rot=(math.radians(8), 0, math.radians(2)), bevel=0.012)
    for i in range(5):
        cylinder_between(f"blue_lacing_front_{i}", (-0.18 + i * 0.09, -0.168, 1.26), (-0.18 + i * 0.09, -0.168, 0.9), 0.004, MATS["cord"], 8)


def add_weapons_and_banner():
    cylinder_between("katana_blade", (-0.43, -0.31, 0.64), (0.36, -0.34, 1.32), 0.008, MATS["steel"], 10)
    cylinder_between("katana_black_ridge", (-0.41, -0.315, 0.64), (0.34, -0.345, 1.3), 0.003, MATS["lacquer"], 8)
    cylinder_between("tsuka_wrapped_handle", (-0.55, -0.30, 0.54), (-0.42, -0.31, 0.65), 0.018, MATS["leather"], 12)
    cube("katana_tsuba_guard", (-0.43, -0.31, 0.64), (0.085, 0.018, 0.048), MATS["gold"], rot=(math.radians(42), 0, math.radians(-44)), bevel=0.008)
    cylinder_between("scabbard_at_hip", (0.19, 0.04, 0.83), (0.64, 0.02, 0.66), 0.023, MATS["lacquer"], 12)
    cylinder_between("sashimono_back_pole", (0.18, 0.13, 0.87), (0.18, 0.13, 1.82), 0.011, MATS["wood"], 10)
    flag = cube("small_back_sashimono_cloth", (0.32, 0.135, 1.56), (0.22, 0.018, 0.39), MATS["banner"], rot=(0, math.radians(1), 0), bevel=0.006)
    cyl("sashimono_mon_disc", (0.32, 0.12, 1.59), 0.045, 0.012, MATS["banner_ink"], 24, rot=(math.radians(90), 0, 0))


def build_samurai():
    reset_scene()
    add_torso()
    add_sode("left")
    add_sode("right")
    add_arm("left")
    add_arm("right")
    add_leg("left")
    add_leg("right")
    add_kabuto()
    add_face_mask()
    add_weapons_and_banner()
    # Subtle cloth folds on hakama.
    for side, sign in (("left", -1), ("right", 1)):
        for i in range(3):
            cylinder_between(
                f"{side}_hakama_fold_line_{i}",
                (sign * (0.12 + i * 0.045), -0.105, 0.76),
                (sign * (0.15 + i * 0.045), -0.105, 0.38),
                0.004,
                MATS["cord"],
                8,
            )
    # Groundless asset; keep origin around feet.
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH":
            obj.select_set(True)
        else:
            obj.select_set(False)
    print("v5 mesh objects:", len([o for o in bpy.context.scene.objects if o.type == "MESH"]))


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_render_lights():
    bpy.ops.object.light_add(type="SUN", location=(-2.5, -4, 6))
    sun = bpy.context.object
    sun.name = "softbox_key"
    sun.data.energy = 3.2
    sun.rotation_euler = (math.radians(43), 0, math.radians(-22))
    bpy.ops.object.light_add(type="AREA", location=(2.2, -3.2, 2.8))
    fill = bpy.context.object
    fill.name = "front_fill"
    fill.data.energy = 380
    fill.data.size = 4.8
    bpy.ops.object.light_add(type="AREA", location=(-2.6, 2.2, 2.5))
    rim = bpy.context.object
    rim.name = "rim_light"
    rim.data.energy = 280
    rim.data.size = 3.2


def configure_render(width, height, exposure=0.18):
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 3
    scene.eevee.gtao_factor = 1.25
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = exposure
    scene.view_settings.gamma = 1.0
    world = scene.world or bpy.data.worlds.new("asset_render_world")
    scene.world = world
    world.color = (0.035, 0.034, 0.03)


def render_views():
    add_render_lights()
    configure_render(720, 900, 0.22)
    cam_data = bpy.data.cameras.new("asset_camera")
    cam = bpy.data.objects.new("asset_camera", cam_data)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    views = [
        ("front", (-1.55, -3.0, 1.25), (0, 0, 0.95), 48),
        ("qtr", (1.65, -2.9, 1.35), (0, 0, 0.98), 48),
        ("side", (3.0, -0.2, 1.2), (0, 0, 0.95), 52),
        ("top", (0.12, -0.2, 3.65), (0, 0, 0.82), 34),
    ]
    rendered = []
    for name, loc, target, lens in views:
        cam.location = loc
        cam.data.lens = lens
        cam.data.sensor_width = 32
        look_at(cam, target)
        path = OUT_DIR / f"cs_{name}.png"
        bpy.context.scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        rendered.append(path)
    try:
        from PIL import Image as PILImage

        sheet = PILImage.new("RGB", (1440, 1800), (18, 16, 13))
        positions = [(0, 0), (720, 0), (0, 900), (720, 900)]
        for i, path in enumerate(rendered):
            sheet.paste(PILImage.open(path).resize((720, 900)), positions[i])
        sheet_path = OUT_DIR / "samurai_character_contact_sheet_v5.png"
        sheet.save(sheet_path)
        shutil.copyfile(sheet_path, GAME_DIR / "assets" / "samurai_character_contact_sheet.png")
    except Exception as exc:
        print("contact sheet compose skipped:", exc)
    configure_render(820, 1024, 0.22)
    cam.location = (-1.45, -2.85, 1.2)
    cam.data.lens = 45
    look_at(cam, (0, 0, 0.98))
    hero_path = OUT_DIR / "samurai_character_hero_v5.png"
    bpy.context.scene.render.filepath = str(hero_path)
    bpy.ops.render.render(write_still=True)
    shutil.copyfile(hero_path, GAME_DIR / "assets" / "samurai_character_hero.png")


def main():
    build_samurai()
    source_path = OUT_DIR / "samurai_character_source_v5.blend"
    root_source_path = FOUNDARY_DIR / "samurai_character_source_v5.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(source_path))
    shutil.copyfile(source_path, root_source_path)
    glb_path = OUT_DIR / "samurai_character_v5.glb"
    bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB", export_materials="EXPORT", export_apply=True)
    shutil.copyfile(glb_path, GAME_DIR / "assets" / "samurai_character.glb")
    render_views()
    print("v5 artifacts complete:", OUT_DIR)


if __name__ == "__main__":
    main()
