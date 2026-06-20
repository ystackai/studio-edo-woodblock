import math
import os
import shutil
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


ROOT = Path(__file__).resolve().parents[2]
GAME_DIR = ROOT / "games" / "kawanakajima-foundry-samurai-proof"
SOURCE_BLEND = GAME_DIR / "assets" / "generated" / "foundry" / "samurai" / "samurai_character_source_v5.blend"
if not SOURCE_BLEND.exists():
    SOURCE_BLEND = GAME_DIR / "assets" / "generated" / "foundry" / "samurai" / "samurai_character_source_v4.blend"
if not SOURCE_BLEND.exists():
    SOURCE_BLEND = GAME_DIR / "assets" / "generated" / "foundry" / "samurai" / "samurai_character_source_v3.blend"
if not SOURCE_BLEND.exists():
    SOURCE_BLEND = GAME_DIR / "assets" / "generated" / "foundry" / "samurai" / "samurai_character_source.blend"
SOURCE_HERO = GAME_DIR / "assets" / "generated" / "foundry" / "samurai" / "samurai_character_hero.png"
SOURCE_CONTACT = GAME_DIR / "assets" / "generated" / "foundry" / "samurai" / "samurai_character_contact_sheet.png"
SHOT_DIR = ROOT / ".factoryx" / "work-orders" / "work-order-1781913967751-7-1" / "screenshots"
GAME_SHOT_DIR = GAME_DIR / "screenshots"


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def bounds_for(objects):
    points = []
    for obj in objects:
        if obj.type != "MESH":
            continue
        for corner in obj.bound_box:
            points.append(obj.matrix_world @ Vector(corner))
    min_v = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    max_v = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return min_v, max_v


def material(name, color, roughness=0.8):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def add_tree(x, y, scale, trunk_mat, pine_mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.055 * scale, depth=0.55 * scale, location=(x, y, 0.275 * scale))
    trunk = bpy.context.object
    trunk.name = "pine_trunk"
    trunk.data.materials.append(trunk_mat)
    for i, radius in enumerate((0.42, 0.32, 0.22)):
        z = 0.54 * scale + i * 0.25 * scale
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=radius * scale, radius2=0, depth=0.55 * scale, location=(x, y, z))
        cone = bpy.context.object
        cone.name = "pine_canopy"
        cone.data.materials.append(pine_mat)


def build_scene():
    if not SOURCE_BLEND.exists():
        raise FileNotFoundError(SOURCE_BLEND)

    SHOT_DIR.mkdir(parents=True, exist_ok=True)
    GAME_SHOT_DIR.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE_BLEND))

    source_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if len(source_objects) < 50:
        raise RuntimeError(f"expected detailed source mesh set, found {len(source_objects)} mesh objects")

    min_v, max_v = bounds_for(source_objects)
    height = max_v.z - min_v.z
    center = (min_v + max_v) * 0.5
    normalize = Matrix.Scale(1.55 / height, 4) @ Matrix.Translation(Vector((-center.x, -center.y, -min_v.z)))

    for obj in list(bpy.context.scene.objects):
        if obj not in source_objects:
            bpy.data.objects.remove(obj, do_unlink=True)

    template = bpy.data.collections.new("normalized_foundry_samurai_template")
    for src in source_objects:
        copy = src.copy()
        copy.data = src.data
        copy.animation_data_clear()
        copy.name = f"template_{src.name}"
        copy.matrix_world = normalize @ src.matrix_world
        template.objects.link(copy)
    for obj in source_objects:
        bpy.data.objects.remove(obj, do_unlink=True)

    ground_mat = material("ink_washed_field", (0.26, 0.23, 0.18, 1))
    path_mat = material("trampled_central_path", (0.16, 0.13, 0.10, 1))
    red_mat = material("takeda_marker_red", (0.55, 0.10, 0.08, 1))
    blue_mat = material("uesugi_marker_blue", (0.10, 0.20, 0.38, 1))
    pine_mat = material("pine_ink_green", (0.12, 0.20, 0.16, 1))
    trunk_mat = material("pine_trunk_brown", (0.20, 0.13, 0.08, 1))

    bpy.ops.mesh.primitive_plane_add(size=13.0, location=(0, 0, -0.015))
    ground = bpy.context.object
    ground.name = "misty_kawanakajima_field"
    ground.data.materials.append(ground_mat)

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.002))
    path = bpy.context.object
    path.name = "central_trampled_path"
    path.dimensions = (1.05, 11.2, 0.012)
    path.rotation_euler[2] = math.radians(6)
    path.data.materials.append(path_mat)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # extra layered distant hills for Japanese countryside depth (ink wash read)
    for kk in range(3):
        hh = bpy.data.objects.new(f"far_hill_{kk}", bpy.data.meshes.new(f"fh{kk}"))
        bm = bpy.data.meshes.new(f"fh{kk}")
        # simple large plane as hill proxy
        bpy.ops.mesh.primitive_plane_add(size=22 + kk*3, location=(1.2*kk-1.5, -9.5 -kk*1.8, 0.6 + kk*0.15))
        hobj = bpy.context.object
        hobj.name = f"far_hill_{kk}"
        hobj.rotation_euler = (math.radians(-3), math.radians(8*kk-4), 0)
        hobj.scale = (1.6, 0.8, 0.06)
        hobj.data.materials.append(ground_mat)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    for x, y, s in [(-5.3, -4.4, 1.2), (5.0, -3.7, 1.0), (-4.7, 4.3, 0.9), (4.4, 4.1, 1.25), (-8.1, 1.6, 0.85), (7.8, 2.9, 0.78), (-1.8, -8.2, 0.95)]:
        add_tree(x, y, s, trunk_mat, pine_mat)

    placements = []
    for side, x, facing, team_mat in [("takeda", -1.9, math.radians(-8), red_mat), ("uesugi", 1.9, math.radians(172), blue_mat)]:
        for row in range(2):
            for col in range(5):
                y = -2.15 + col * 1.05 + (0.18 if row else 0)
                zrot = facing + math.radians((col - 2) * 2.5)
                placements.append((side, x + row * (-0.45 if x < 0 else 0.45), y, zrot, team_mat, row, col))

    actor_targets = {}
    for idx, (side, x, y, zrot, team_mat, row, col) in enumerate(placements):
        scale = 0.98 + ((idx % 4) - 1) * 0.025
        placement = Matrix.Translation(Vector((x, y, 0))) @ Matrix.Rotation(zrot, 4, "Z") @ Matrix.Scale(scale, 4)
        inst = bpy.data.objects.new(f"{side}_{idx:02d}_foundry_samurai", None)
        inst.instance_type = "COLLECTION"
        inst.instance_collection = template
        inst.matrix_world = placement
        bpy.context.collection.objects.link(inst)
        actor_targets.setdefault(side, Vector((x, y, 0.95)))
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.035, depth=0.018, location=(x, y - 0.33, 1.64), rotation=(math.radians(90), 0, zrot))
        mon = bpy.context.object
        mon.name = f"{side}_{idx:02d}_faction_mon"
        mon.data.materials.append(team_mat)

    bpy.ops.object.light_add(type="SUN", location=(-3.5, -4.0, 6.0))
    sun = bpy.context.object
    sun.name = "soft_morning_sun"
    sun.data.energy = 4.2
    sun.rotation_euler = (math.radians(42), 0, math.radians(-32))

    bpy.ops.object.light_add(type="AREA", location=(1.5, -3.5, 3.2))
    area = bpy.context.object
    area.name = "cool_front_fill"
    area.data.energy = 820
    area.data.size = 5.5

    # extra blue-side kicker for readable formation on Uesugi line
    bpy.ops.object.light_add(type="AREA", location=(4.5, 2.8, 4.8))
    bk = bpy.context.object
    bk.name = "blue_side_fill"
    bk.data.energy = 380
    bk.data.size = 3.8

    # rear rim for helmet crest + shoulder silhouette separation (cool tone)
    bpy.ops.object.light_add(type="AREA", location=(-1.2, 5.5, -7.5))
    rr = bpy.context.object
    rr.name = "rear_rim_silhouette"
    rr.data.energy = 520
    rr.data.size = 4.2

    world = bpy.context.scene.world or bpy.data.worlds.new("kawanakajima_world")
    bpy.context.scene.world = world
    world.color = (0.028, 0.03, 0.026)

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 3
    scene.eevee.gtao_factor = 1.4
    scene.render.resolution_x = 960
    scene.render.resolution_y = 600
    scene.render.film_transparent = False
    scene.eevee.taa_render_samples = 16
    scene.eevee.taa_samples = 16
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = 0.38
    scene.view_settings.gamma = 1.0

    bpy.ops.object.camera_add()
    camera = bpy.context.object
    scene.camera = camera

    views = {
        "overview": ((4.6, -7.1, 3.4), (0.0, 0.0, 0.85), 45),
        "redClose": ((-5.0, -4.9, 2.85), (-2.18, -2.0, 1.32), 38),
        "blueClose": ((5.0, -4.7, 2.85), (2.18, -1.95, 1.32), 38),
        "sideProfile": ((6.4, -0.25, 1.65), (0.15, 0.25, 0.9), 55),
        "topFormation": ((0.0, -0.1, 9.0), (0.0, -0.05, 0.0), 35),
        "assetInspect": ((-5.15, -5.0, 2.95), (-2.2, -2.0, 1.35), 38),
    }

    aliases = {
        "redClose": "red-close",
        "blueClose": "blue-close",
        "assetInspect": "inspect-asset",
    }

    for name, (location, target, lens) in views.items():
        camera.location = location
        camera.data.lens = lens
        camera.data.sensor_width = 32
        camera.data.dof.use_dof = False
        look_at(camera, target)
        scene.render.filepath = str(SHOT_DIR / f"{name}.png")
        bpy.ops.render.render(write_still=True)
        shutil.copyfile(SHOT_DIR / f"{name}.png", GAME_SHOT_DIR / f"{name}.png")
        if name in aliases:
            shutil.copyfile(SHOT_DIR / f"{name}.png", SHOT_DIR / f"{aliases[name]}.png")
            shutil.copyfile(SHOT_DIR / f"{name}.png", GAME_SHOT_DIR / f"{aliases[name]}.png")

    if SOURCE_HERO.exists():
        shutil.copyfile(SOURCE_HERO, SHOT_DIR / "foundry-hero.png")
        shutil.copyfile(SOURCE_HERO, GAME_SHOT_DIR / "foundry-hero.png")
    if SOURCE_CONTACT.exists():
        shutil.copyfile(SOURCE_CONTACT, SHOT_DIR / "foundry-contact-sheet.png")
        shutil.copyfile(SOURCE_CONTACT, GAME_SHOT_DIR / "foundry-contact-sheet.png")

    print(f"Rendered {len(views)} Kawanakajima views to {SHOT_DIR}")


if __name__ == "__main__":
    build_scene()
