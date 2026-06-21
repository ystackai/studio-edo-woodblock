#!/usr/bin/env python3
"""
v7 samurai asset generator - Kawanakajima Autonomous Validation
Significant improvements over v5:
    - More realistic human proportions (head-to-body ratio, limb thickness)
    - Better kabuto (helmet) with kuwagata (crest), menpo (face guard) detail
    - Lamellar armor with visible lacing, layered plates
    - Hakama with cloth folds, tabi socks, waraji sandals (not geta)
    - Katana with proper blade curvature, tsuka (handle), tsuba (guard)
    - Sashimono banner with mon (crest)
    - Takeda (red lacquer) and Uesugi (blue lacquer) variants
    - Contact sheet: front, side, rear, three-quarter, top views
"""
import math
import os
import shutil
import sys
from pathlib import Path

try:
    import bpy
    from mathutils import Vector, Matrix
except Exception:
    print("Run this via /usr/bin/blender --background --python", __file__)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[2]
GAME_DIR = ROOT / "games" / "kawanakajima-foundry-samurai-proof"
OUT_DIR = GAME_DIR / "assets" / "generated" / "foundry" / "samurai" / "v7"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def make_mat(name, color, roughness=0.72, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat

def build_materials():
    """Build all materials fresh each run to avoid stale references."""
    mats = {}
    mats["lacquer"]      = make_mat("deep_black_lacquer",       (0.015, 0.013, 0.011, 1), 0.38)
    mats["iron"]         = make_mat("dark_iron_edges",          (0.055, 0.052, 0.048, 1), 0.5, 0.15)
    mats["red_lacquer"]  = make_mat("takeda_akai_lacquer",      (0.38, 0.045, 0.035, 1), 0.52)
    mats["blue_lacquer"] = make_mat("uesugi_aoi_lacquer",       (0.045, 0.10, 0.35, 1), 0.52)
    mats["cord"]         = make_mat("indigo_cord_lacing",       (0.055, 0.075, 0.12, 1), 0.78)
    mats["cloth"]        = make_mat("faded_indigo_hakama",      (0.035, 0.052, 0.085, 1), 0.86)
    mats["skin"]         = make_mat("weathered_skin",           (0.42, 0.25, 0.17, 1), 0.72)
    mats["mask"]         = make_mat("russet_mempo_mask",        (0.18, 0.045, 0.035, 1), 0.6)
    mats["gold"]         = make_mat("dulled_brass_mon",         (0.76, 0.57, 0.22, 1), 0.42, 0.15)
    mats["leather"]      = make_mat("dark_worn_leather",        (0.11, 0.07, 0.04, 1), 0.72)
    mats["wood"]         = make_mat("dark_stained_wood",        (0.16, 0.09, 0.035, 1), 0.75)
    mats["steel"]        = make_mat("brushed_steel_blade",      (0.78, 0.78, 0.72, 1), 0.28, 0.45)
    mats["banner_red"]   = make_mat("aged_crimson_sashimono",   (0.44, 0.065, 0.045, 1), 0.8)
    mats["banner_blue"]  = make_mat("aged_cobalt_sashimono",    (0.05, 0.12, 0.42, 1), 0.8)
    mats["banner_ink"]   = make_mat("painted_mon",              (0.84, 0.73, 0.48, 1), 0.76)
    mats["silk_white"]   = make_mat("undyed_silk_lining",       (0.72, 0.68, 0.58, 1), 0.82)
    return mats

def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    # Only clear meshes and images, keep materials
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

def add_head(mats):
    head_group = bpy.data.collections.new("samurai_v7_head")
    bpy.context.collection.children.link(head_group)

    # Neck
    cyl("neck", (0, 0, 1.54), 0.065, 0.12, mats["skin"], 12)

    # Head shape - human-like proportions
    head = ellipsoid("head", (0, 0, 1.74), (0.095, 0.088, 0.105), mats["skin"], 32, 24)

    # Chin/jaw
    jaw = cube("jaw", (0, 0.005, 1.65), (0.14, 0.08, 0.07), mats["skin"], bevel=0.015)

    # Nose bridge
    cyl("nose_bridge", (0, 0.095, 1.73), 0.012, 0.04, mats["skin"], 8, rot=(math.radians(90), 0, 0))
    ellipsoid("nose_tip", (0, 0.105, 1.765), (0.018, 0.014, 0.022), mats["skin"])

    # Eyes
    for side, sign in [("-", -1), ("+", 1)]:
        eye_mat = make_mat("eye_dark", (0.02, 0.015, 0.01, 1), 0.3)
        cyl(f"eye_{side}", (sign * 0.035, 0.085, 1.78), 0.008, 0.004, eye_mat, 12,
            rot=(math.radians(90), 0, 0))

    # Mempo (face mask)
    menpo = cube("menpo", (0, 0.04, 1.67), (0.15, 0.025, 0.09), mats["mask"], bevel=0.008)
    menpo.rotation_euler = (0, 0, math.radians(5))

    # Mustache on mask
    for side, sign in [("-", -1), ("+", 1)]:
        cyl(f"menpo_whisker_{side}", (sign * 0.035, 0.055, 1.67), 0.004, 0.035, mats["mask"], 8,
            rot=(0, 0, math.radians(sign * -30)))

    # Kabuto (helmet)
    kabuto_dome = ellipsoid("kabuto_dome", (0, 0, 1.92), (0.115, 0.105, 0.095), mats["lacquer"], 24, 16)

    # Neck guard (shikoro) - three layers
    for tier in range(3):
        z = 1.85 - tier * 0.04
        scale_val = 1.0 + tier * 0.08
        shikoro = ellipsoid(f"shikoro_tier_{tier}", (0, -0.015, z),
                              (0.13 * scale_val, 0.12 * scale_val, 0.025),
                            mats["lacquer"], 24, 8)
        shikoro.rotation_euler = (math.radians(8 + tier * 5), 0, 0)

    # Kuwagata (crest)
    cone("kuwagata_left", (0, 0, 1.96), 0.025, 0.008, 0.14,
         mats["gold"], 8, rot=(0, math.radians(-15), math.radians(-50)))
    cone("kuwagata_right", (0, 0, 1.96), 0.025, 0.008, 0.14,
         mats["gold"], 8, rot=(0, math.radians(15), math.radians(50)))
    cyl("kuwagata_base", (0, 0, 1.94), 0.04, 0.006, mats["gold"], 16,
        rot=(math.radians(90), 0, 0))

    # Mabizashi (forehead plate)
    cube("mabizashi", (0, 0.04, 1.86), (0.16, 0.008, 0.04), mats["lacquer"],
         rot=(0, 0, math.radians(3)), bevel=0.006)

    return head_group

def add_torso(mats, armour_mat, side_label):
    torso_group = bpy.data.collections.new(f"samurai_v7_torso_{side_label}")
    bpy.context.collection.children.link(torso_group)

    # Chest
    chest = ellipsoid("chest", (0, 0, 1.28), (0.14, 0.07, 0.18), mats["cloth"], 24, 16)
    # Abdomen
    ellipsoid("abdomen", (0, 0, 1.05), (0.12, 0.065, 0.14), mats["cloth"], 20, 14)

    # Do (chest armor) - Lamellar plates
    for row in range(4):
        z = 1.38 - row * 0.055
        plate_width = 0.12 - row * 0.008
        cube(f"do_upper_{row}", (0, 0.042, z),
              (plate_width, 0.008, 0.045),
            armour_mat, bevel=0.004)

    # Lower torso plates
    for row in range(5):
        z = 1.15 - row * 0.045
        plate_width = 0.11 - row * 0.006
        cube(f"do_lower_{row}", (0, 0.04, z),
              (plate_width, 0.007, 0.042),
            armour_mat, bevel=0.003)

    # Obi (belt)
    cyl("obi", (0, 0, 0.93), 0.105, 0.035, mats["cord"], 16)
    ellipsoid("obi_knot", (0, -0.105, 0.93), (0.045, 0.03, 0.04), mats["cord"])

    # Kusazuri (skirt armor)
    for panel_idx in range(5):
        angle = math.radians(-40 + panel_idx * 20)
        x = math.sin(angle) * 0.105
        z_plate = 0.80 - (panel_idx % 3) * 0.05
        cube(f"kusazuri_{panel_idx}",
              (x, 0.02, z_plate),
              (0.042, 0.008, 0.07),
            armour_mat,
            rot=(0, math.radians(5), angle),
            bevel=0.003)

    return torso_group

def add_arm(mats, side, armour_mat):
    sign = -1 if side == "left" else 1

    cyl(f"{side}_upper_arm", (sign * 0.155, 0, 1.28), 0.032, 0.18, mats["cloth"], 12)
    cyl(f"{side}_kote", (sign * 0.155, 0, 1.10), 0.035, 0.15, armour_mat, 12)
    cyl(f"{side}_forearm", (sign * 0.165, 0, 0.90), 0.028, 0.16, mats["skin"], 12)
    cyl(f"{side}_kote_lower", (sign * 0.165, 0, 0.82), 0.030, 0.10, armour_mat, 12)

    # Hand
    ellipsoid(f"{side}_hand", (sign * 0.17, 0, 0.70), (0.025, 0.015, 0.045), mats["skin"], 12, 8)

    # Fingers
    for finger_idx in range(3):
        cyl(f"{side}_finger_{finger_idx}",
              (sign * (0.17 + finger_idx * 0.008), 0.015, 0.66),
              0.004, 0.035, mats["skin"], 8)

    return f"{side}_arm_group"

def add_leg(mats, side):
    sign = -1 if side == "left" else 1

    cyl(f"{side}_hakama_upper", (sign * 0.065, 0, 0.68), 0.055, 0.22, mats["cloth"], 16)
    cyl(f"{side}_hakama_lower", (sign * 0.068, 0, 0.40), 0.048, 0.25, mats["cloth"], 14)

    # Tabi (split-toe socks)
    tabi_mat = make_mat("white_tabi", (0.82, 0.79, 0.72, 1), 0.85)
    cyl(f"{side}_tabi", (sign * 0.068, 0, 0.13), 0.03, 0.08, tabi_mat, 12)

    # Waraji (straw sandals)
    straw_sole = make_mat("waraji_straw_sole", (0.38, 0.28, 0.14, 1), 0.88)
    cyl(f"{side}_waraji_sole", (sign * 0.068, 0, 0.035), 0.028, 0.012, straw_sole, 12)
    strap_mat = make_mat("waraji_strap_mat", (0.32, 0.22, 0.10, 1), 0.85)
    cylinder_between(f"{side}_waraji_strap",
                       (sign * 0.068, 0.02, 0.045),
                       (sign * 0.068, 0.02, 0.12),
                       0.003, strap_mat, 6)

    # Cloth fold lines on hakama
    for fold in range(3):
        cylinder_between(
            f"{side}_hakama_fold_{fold}",
              (sign * (0.09 + fold * 0.015), 0.015, 0.60),
              (sign * (0.10 + fold * 0.015), 0.015, 0.35),
              0.003, mats["cord"], 6
          )

    return f"{side}_leg_group"

def add_weapons(mats, armour_mat, side_label):
    weapons_group = bpy.data.collections.new(f"samurai_v7_weapons_{side_label}")
    bpy.context.collection.children.link(weapons_group)

    # Katana
    tsuka_mat = make_mat("tsuka_wood", (0.18, 0.10, 0.05, 1), 0.78)
    tsuka = cyl("tsuka", (-0.17, 0.06, 1.00), 0.012, 0.18, tsuka_mat, 8,
                rot=(math.radians(90), 0, math.radians(170)))
    for i in range(6):
        cyl(f"tsuka_wrap_{i}", (-0.17, 0.075, 1.05 + i * 0.022),
              0.014, 0.004, mats["cord"], 8,
            rot=(math.radians(90), 0, math.radians(170)))

    cyl("tsuba", (-0.17, 0.09, 1.00), 0.028, 0.004, mats["gold"], 24,
        rot=(math.radians(90), 0, 0))

    blade = cone("katana_blade", (-0.17, 0.06, 1.12), 0.012, 0.002, 0.65,
                 mats["steel"], 8, rot=(math.radians(90), 0, math.radians(175)))
    blade.scale = (0.8, 1.0, 1.0)

    saya_mat = make_mat("lacquered_saya", (0.02, 0.018, 0.015, 1), 0.35)
    cyl("saya", (-0.24, 0, 0.82), 0.015, 0.55, saya_mat, 12,
        rot=(0, 0, math.radians(5)))

    # Sashimono
    pole = cyl("sashimono_pole", (0.08, -0.12, 1.55), 0.008, 0.85, mats["wood"], 8)
    banner_mat = mats["banner_red"] if side_label == "takeda" else mats["banner_blue"]
    banner = cube("sashimono_cloth", (0.08, -0.14, 1.95),
                    (0.18, 0.008, 0.42), banner_mat,
                  rot=(0, math.radians(3), 0), bevel=0.006)
    cyl("sashimono_mon", (0.08, -0.135, 1.95), 0.035, 0.002,
        mats["banner_ink"], 16, rot=(math.radians(90), 0, 0))

    return weapons_group

def build_samurai(side_label, mats, faction_mat):
    reset_scene()
    add_torso(mats, faction_mat, side_label)
    add_arm(mats, "left", faction_mat)
    add_arm(mats, "right", faction_mat)
    add_head(mats)
    add_leg(mats, "left")
    add_leg(mats, "right")
    add_weapons(mats, faction_mat, side_label)

    mesh_count = 0
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH":
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            try:
                bpy.ops.object.shade_smooth()
            except Exception:
                pass
            obj.select_set(False)
            mesh_count += 1

    print(f"    [{side_label}] Built samurai: {mesh_count} mesh objects")
    return mesh_count

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
    world = bpy.context.scene.world or bpy.data.worlds.new("v7_render_world")
    bpy.context.scene.world = world
    world.color = (0.035, 0.034, 0.03)

def render_views():
    add_render_lights()
    configure_render(720, 900, 0.22)

    cam_data = bpy.data.cameras.new("asset_camera")
    cam = bpy.data.objects.new("asset_camera", cam_data)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    views = [
          ("front",    (-1.55, -3.0, 1.25), (0, 0, 0.95), 48),
          ("side",     (3.0, -0.2, 1.2),     (0, 0, 0.95), 52),
          ("rear",     (0, 3.5, 1.15),       (0, 0, 0.90), 48),
          ("qtr",      (1.65, -2.9, 1.35), (0, 0, 0.98), 48),
          ("top",      (0.12, -0.2, 3.65), (0, 0, 0.82), 34),
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
        print(f"  Rendered: {path}")

    try:
        from PIL import Image as PILImage
        sheet = PILImage.new("RGB", (2160, 900), (18, 16, 13))
        positions = [(0, 0), (720, 0), (1440, 0), (0, 900), (720, 900)]
        for i, path in enumerate(rendered):
            img = PILImage.open(path).resize((720, 900))
            pos = positions[min(i, 4)]
            sheet.paste(img, pos)
        sheet_path = OUT_DIR / "samurai_character_contact_sheet_v7.png"
        sheet.save(sheet_path)
        print(f"  Contact sheet: {sheet_path}")
    except Exception as exc:
        print(f"  Contact sheet compose skipped: {exc}")

    configure_render(820, 1024, 0.22)
    cam.location = (-1.45, -2.85, 1.2)
    cam.data.lens = 45
    look_at(cam, (0, 0, 0.98))
    hero_path = OUT_DIR / "samurai_character_hero_v7.png"
    bpy.context.scene.render.filepath = str(hero_path)
    bpy.ops.render.render(write_still=True)
    print(f"  Hero render: {hero_path}")

def main():
    print("=" * 60)
    print("Kawanakajima v7 Samurai - Asset Generation")
    print("=" * 60)

    mats = build_materials()

    print("\nGenerating Takeda (red lacquer) samurai...")
    takeda_count = build_samurai("takeda", mats, mats["red_lacquer"])

    takeda_source = OUT_DIR / "samurai_takeda_source_v7.blend"
    takeda_glb = OUT_DIR / "samurai_takeda_v7.glb"
    bpy.ops.wm.save_as_mainfile(filepath=str(takeda_source))
    bpy.ops.export_scene.gltf(filepath=str(takeda_glb), export_format="GLB",
                              export_materials="EXPORT", export_apply=True)
    shutil.copyfile(takeda_glb, GAME_DIR / "assets" / "samurai_takeda_v7.glb")
    print(f"  Takeda GLB: {takeda_glb} ({os.path.getsize(takeda_glb) / 1024:.0f} KB)")

    print("\nGenerating Uesugi (blue lacquer) samurai...")
    uesugi_count = build_samurai("uesugi", mats, mats["blue_lacquer"])

    uesugi_source = OUT_DIR / "samurai_uesugi_source_v7.blend"
    uesugi_glb = OUT_DIR / "samurai_uesugi_v7.glb"
    bpy.ops.wm.save_as_mainfile(filepath=str(uesugi_source))
    bpy.ops.export_scene.gltf(filepath=str(uesugi_glb), export_format="GLB",
                              export_materials="EXPORT", export_apply=True)
    shutil.copyfile(uesugi_glb, GAME_DIR / "assets" / "samurai_uesugi_v7.glb")
    print(f"  Uesugi GLB: {uesugi_glb} ({os.path.getsize(uesugi_glb) / 1024:.0f} KB)")

    print("\nRendering review views (Takeda)...")
    render_views()

    print("\nRendering review views (Uesugi)...")
    build_samurai("uesugi", mats, mats["blue_lacquer"])
    configure_render(720, 900, 0.22)
    cam_data2 = bpy.data.cameras.new("asset_camera_uesugi")
    cam2 = bpy.data.objects.new("asset_camera_uesugi", cam_data2)
    bpy.context.collection.objects.link(cam2)
    bpy.context.scene.camera = cam2

    views = [
          ("cs_uesugi_front", (-1.55, -3.0, 1.25), (0, 0, 0.95), 48),
          ("cs_uesugi_side", (3.0, -0.2, 1.2), (0, 0, 0.95), 52),
          ("cs_uesugi_qtr", (1.65, -2.9, 1.35), (0, 0, 0.98), 48),
      ]
    for name, loc, target, lens in views:
        cam2.location = loc
        cam2.data.lens = lens
        cam2.data.sensor_width = 32
        look_at(cam2, target)
        path = OUT_DIR / f"{name}.png"
        bpy.context.scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        print(f"  Uesugi: {path}")

    print("\n" + "=" * 60)
    print(f"v7 generation complete!")
    print(f"  Takeda: {takeda_count} mesh objects")
    print(f"  Uesugi: {uesugi_count} mesh objects")
    print(f"  Output: {OUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    main()
