import math
import os
import shutil
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


ROOT = Path(__file__).resolve().parents[2]
GAME_DIR = ROOT / "games" / "kawanakajima-foundry-samurai-proof"
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

    for x, y, s in [(-5.3, -4.4, 1.2), (5.0, -3.7, 1.0), (-4.7, 4.3, 0.9), (4.4, 4.1, 1.25)]:
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
        placement = Matrix.Translation(Vector((x, y, 0))) @ Matrix.Rotation(zrot, 4, "Z") @ Matrix.Scale(scale, 4) @ normalize
        first = None
        for src in source_objects:
            copy = src.copy()
            copy.data = src.data
            copy.animation_data_clear()
            copy.name = f"{side}_{idx:02d}_{src.name}"
            copy.matrix_world = placement @ src.matrix_world
            bpy.context.collection.objects.link(copy)
            first = first or copy
        actor_targets.setdefault(side, Vector((x, y, 0.95)))
        if first is not None:
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y - 0.23, 1.28))
            banner = bpy.context.object
            banner.name = f"{side}_{idx:02d}_faction_color_check"
            banner.dimensions = (0.04, 0.44, 0.34)
            banner.rotation_euler[2] = zrot
            banner.data.materials.append(team_mat)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    for obj in source_objects:
        bpy.data.objects.remove(obj, do_unlink=True)

    bpy.ops.object.light_add(type="SUN", location=(-3.5, -4.0, 6.0))
    sun = bpy.context.object
    sun.name = "soft_morning_sun"
    sun.data.energy = 2.2
    sun.rotation_euler = (math.radians(45), 0, math.radians(-35))

    bpy.ops.object.light_add(type="AREA", location=(1.5, -3.5, 3.2))
    area = bpy.context.object
    area.name = "cool_front_fill"
    area.data.energy = 420
    area.data.size = 4.0

    world = bpy.context.scene.world or bpy.data.worlds.new("kawanakajima_world")
    bpy.context.scene.world = world
    world.color = (0.035, 0.038, 0.034)

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 3
    scene.eevee.gtao_factor = 1.4
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = 0.25
    scene.view_settings.gamma = 1.0

    bpy.ops.object.camera_add()
    camera = bpy.context.object
    scene.camera = camera

    views = {
        "overview": ((4.6, -7.1, 3.4), (0.0, 0.0, 0.85), 45),
        "redClose": ((-3.1, -3.9, 1.85), (-1.75, -1.15, 0.95), 68),
        "blueClose": ((3.15, 3.65, 1.85), (1.75, 1.05, 0.95), 68),
        "sideProfile": ((6.4, -0.25, 1.65), (0.15, 0.25, 0.9), 55),
        "topFormation": ((0.0, -0.1, 9.0), (0.0, -0.05, 0.0), 35),
        "assetInspect": ((-3.2, -2.9, 1.75), (-1.9, -1.1, 1.05), 82),
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
