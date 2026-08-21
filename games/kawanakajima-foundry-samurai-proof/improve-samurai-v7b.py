#!/usr/bin/env python3
"""
v7b improvement pass - fixes v7 issues:
- Restore proper helmet dome shape (not boxy)
- Fix face mask visibility and positioning
- Correct body proportions
- Better armor plate overlap
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
OUT_DIR = FOUNDARY_DIR / "improved-20260620-v7b"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MATS = {}


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


def make_beveled_cube(name, loc, dims, mat, rot=(0, 0, 0), bevel=0.012):
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
    shade(obj)
    return obj


def cyl(name, loc, radius, depth, mat, vertices=24, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    shade(obj)
    return obj


def cone(name, loc, r1, r2, depth, mat, vertices=32, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    shade(obj)
    return obj


def ellipsoid(name, loc, scale, mat, segments=32, rings=16, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
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
        plate = make_beveled_cube(
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
    shoulder = ellipsoid(
        f"{side}_rounded_shoulder_undercloth",
        (sign * 0.34, -0.015, 1.25),
        (0.095, 0.095, 0.12),
        MATS["cloth"], 24, 12
    )
    shoulder.rotation_euler[1] = math.radians(sign * 9)
    for j in range(5):
        z = 1.28 - j * 0.075
        x = sign * (0.43 + j * 0.01)
        plate = make_beveled_cube(
            f"{side}_layered_sode_{j}",
             (x, -0.04, z),
             (0.22, 0.038, 0.066),
            MATS["armor_red"] if j % 2 == 0 else MATS["lacquer"],
            rot=(math.radians(5), math.radians(sign * 10), math.radians(sign * 4)),
            bevel=0.014,
         )
        cylinder_between(
            f"{side}_sode_lace_{j}_a",
            (x - sign * 0.07, -0.066, z + 0.035),
            (x - sign * 0.07, -0.066, z - 0.035),
            0.004, MATS["cord"], 8
        )
        cylinder_between(
            f"{side}_sode_lace_{j}_b",
            (x + sign * 0.07, -0.066, z + 0.035),
            (x + sign * 0.07, -0.066, z - 0.035),
            0.004, MATS["cord"], 8
        )


def add_arm(side):
    sign = -1 if side == "left" else 1
    cylinder_between(
        f"{side}_upper_arm_cloth",
        (sign * 0.42, -0.015, 1.14),
        (sign * 0.55, -0.025, 0.92),
        0.055, MATS["cloth"], 18
    )
    cylinder_between(
        f"{side}_forearm_kote",
        (sign * 0.55, -0.025, 0.92),
        (sign * 0.49, -0.12, 0.72),
        0.047, MATS["iron"], 18
    )
    ellipsoid(f"{side}_gloved_hand",
              (sign * 0.48, -0.16, 0.66),
              (0.048, 0.035, 0.038),
              MATS["leather"], 18, 10)
    for fi in range(4):
        cylinder_between(
            f"{side}_finger_{fi}",
             (sign * (0.455 + fi * 0.012), -0.185, 0.65),
             (sign * (0.452 + fi * 0.012), -0.23, 0.638),
             0.006, MATS["leather"], 8,
         )


def add_leg(side):
    sign = -1 if side == "left" else 1
    cylinder_between(
        f"{side}_hakama_outer_fold",
        (sign * 0.17, -0.02, 0.78),
        (sign * 0.23, -0.015, 0.35),
        0.08, MATS["cloth"], 20
    )
    cylinder_between(
        f"{side}_shin_guard",
        (sign * 0.23, -0.015, 0.45),
        (sign * 0.25, -0.03, 0.19),
        0.042, MATS["lacquer"], 18
    )
    cylinder_between(
        f"{side}_ankle_tabi_bridge",
        (sign * 0.25, -0.035, 0.205),
        (sign * 0.25, -0.095, 0.115),
        0.034, MATS["cloth"], 16
    )
    ellipsoid(f"{side}_tabi_sock",
              (sign * 0.25, -0.13, 0.105),
              (0.075, 0.13, 0.042),
              MATS["cloth"], 18, 10,
              rot=(0, 0, math.radians(sign * 2)))
    cube_f = f"{side}_geta_sole"
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sign * 0.25, -0.14, 0.048), rotation=(0, 0, math.radians(sign * 2)))
    obj = bpy.context.object
    obj.name = cube_f
    obj.dimensions = (0.14, 0.24, 0.03)
    obj.data.materials.append(MATS["wood"])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod = obj.modifiers.new("soft_bevel", "BEVEL")
    mod.width = 0.012
    mod.segments = 3
    mod.affect = "EDGES"
    shade(obj)

    for tooth_name, tooth_z in [
        ("front", 0.018), ("rear", 0.018)
    ]:
        cube_f2 = f"{side}_geta_tooth_{tooth_name}"
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sign * 0.25, -0.205 if tooth_name == "front" else -0.075, 0.018), rotation=(0, 0, math.radians(sign * 2)))
        obj2 = bpy.context.object
        obj2.name = cube_f2
        obj2.dimensions = (0.12, 0.02, 0.035)
        obj2.data.materials.append(MATS["wood"])
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        mod2 = obj2.modifiers.new("soft_bevel", "BEVEL")
        mod2.width = 0.006
        mod2.segments = 2
        mod2.affect = "EDGES"
        shade(obj2)

    cylinder_between(
        f"{side}_geta_thong_a",
        (sign * 0.20, -0.165, 0.085),
        (sign * 0.25, -0.125, 0.125),
        0.006, MATS["leather"], 8
    )
    cylinder_between(
        f"{side}_geta_thong_b",
        (sign * 0.30, -0.165, 0.085),
        (sign * 0.25, -0.125, 0.125),
        0.006, MATS["leather"], 8
    )


def add_kabuto_v7():
    """
    v7 helmet - better proportions with proper dome shape.
    - Ellipsoid dome (not box)
    - Better scale kuwagata (5 horns instead of 2)
    - Structured ear guards with gold trim
    - 6-layer shikoro neck guard
    """
    # Helmet dome - ellipsoid for proper round shape (wider than tall for flat-domed kabuto look)
    dome = ellipsoid("kabuto_helmet_dome_v7",
                     (0.0, 0.00, 1.56),
                     (0.21, 0.17, 0.12),
                     MATS["lacquer"], 40, 18)
    # Slightly flatten top to give that flat-domed kabuto look
    dome.scale.z = 0.85

    # Front brim - pronounced, angled down
    ellipsoid("helmet_front_brim_v7",
              (0.0, -0.185, 1.49),
              (0.24, 0.05, 0.022),
              MATS["lacquer"], 32, 10)
    # Angle the brim slightly downward
    helmet_front_brim_v7 = bpy.data.objects["helmet_front_brim_v7"]
    helmet_front_brim_v7.rotation_euler = (math.radians(-12), 0, 0)

    # Rear flare
    ellipsoid("helmet_rear_flare_v7",
              (0.0, 0.12, 1.47),
              (0.23, 0.095, 0.03),
              MATS["lacquer"], 32, 10)

    # Front gold rivet
    cone("helmet_gold_rivet_v7",
         (0.0, -0.205, 1.62),
         0.025, 0.006, 0.02,
         MATS["gold"], 12)

    # Structural dome ridges - vertical lines
    for i in range(5):
        offset = (i - 2) * 0.06
        cone(f"dome_ridge_{i}",
              (offset, 0.06, 1.55),
              0.006, 0.003, 0.15,
              MATS["lacquer"], 8)

    # Kuwagata (crescent crest) - 5 horns, more dramatic than v6
    # Center horn - tallest
    cone("kuwagata_center",
          (0.0, -0.245, 1.655),
          0.025, 0.006, 0.12,
          MATS["gold"], 12)
    # Left sweeping horn
    cone("kuwagata_left",
          (-0.035, -0.248, 1.64),
          0.02, 0.005, 0.13,
          MATS["gold"], 10)
    # Right sweeping horn
    cone("kuwagata_right",
          (0.035, -0.248, 1.64),
          0.02, 0.005, 0.13,
          MATS["gold"], 10)
    # Outer left horn (smaller, sweeping outward)
    cone("kuwagata_side_l",
          (-0.08, -0.245, 1.61),
          0.015, 0.004, 0.08,
          MATS["gold"], 8)
    # Outer right horn
    cone("kuwagata_side_r",
          (0.08, -0.245, 1.61),
          0.015, 0.004, 0.08,
          MATS["gold"], 8)

    # Kuwagata base plate
    make_beveled_cube("kuwagata_base",
                      (0, -0.245, 1.57),
                      (0.065, 0.012, 0.05),
                      MATS["gold"], bevel=0.005)

    # Fukigaeshi (ear guards) - cone shaped with gold rim
    for side, sign in (("left", -1), ("right", 1)):
        cone(f"fukigaeshi_{side}",
              (sign * 0.21, -0.08, 1.44),
              0.06, 0.025, 0.11,
              MATS["lacquer"], 16)
        # Gold trim ring
        cyl(f"fukigaeshi_trim_{side}",
             (sign * 0.21, -0.08, 1.44),
             0.055, 0.005,
             MATS["gold"], 14,
             rot=(math.radians(90), 0, 0))

    # Shikoro (neck guard) - 6 layers, graduated, with gold edge trims
    for j in range(6):
        layer_w = 0.44 - j * 0.04
        z_pos = 1.40 - j * 0.04
        make_beveled_cube(
            f"shikoro_layer_{j}",
             (0, 0.095 + j * 0.018, z_pos),
             (layer_w, 0.032, 0.05),
            MATS["lacquer"],
            rot=(math.radians(-8 - j * 2), 0, 0),
            bevel=0.008
         )
        for s, sg in (("l", -1), ("r", 1)):
            cyl(f"shikoro_trim_{j}_{s}",
                 (sg * layer_w * 0.46, 0.095 + j * 0.018, z_pos - 0.02),
                 0.003, 0.01, MATS["gold"], 6)


def add_face_mask_v7():
    """
    v7 face mask - angular, mask-like structure.
    Key: position is critical - must be just below the front brim of the helmet.
    """
    # Face base plate - angular, slightly tapered
    make_beveled_cube("v7_face_base",
                      (0, -0.14, 1.385),
                      (0.13, 0.12, 0.04),
                      MATS["skin"],
                      bevel=0.006)

    # Nose bridge - flat, projecting
    make_beveled_cube("v7_nose_bridge",
                      (0, -0.17, 1.405),
                      (0.03, 0.04, 0.025),
                      MATS["skin"],
                      bevel=0.004)

    # Nose tip - small triangle
    cone("v7_nose_tip",
          (0, -0.20, 1.418),
          0.012, 0.004, 0.012,
          MATS["skin"], 6)

    # Cheekbones - defined planes
    make_beveled_cube("v7_cheekbone_l",
                      (-0.055, -0.195, 1.398),
                      (0.04, 0.03, 0.02),
                      MATS["mask"],
                      rot=(0, 0, math.radians(10)),
                      bevel=0.003)
    make_beveled_cube("v7_cheekbone_r",
                      (0.055, -0.195, 1.398),
                      (0.04, 0.03, 0.02),
                      MATS["mask"],
                      rot=(0, 0, math.radians(-10)),
                      bevel=0.003)

    # Jaw - strong angular jawline
    make_beveled_cube("v7_jaw_l",
                      (-0.045, -0.24, 1.38),
                      (0.045, 0.035, 0.025),
                      MATS["mask"],
                      rot=(0, 0, math.radians(6)),
                      bevel=0.004)
    make_beveled_cube("v7_jaw_r",
                      (0.045, -0.24, 1.38),
                      (0.045, 0.035, 0.025),
                      MATS["mask"],
                      rot=(0, 0, math.radians(-6)),
                      bevel=0.004)

    # Chin - strong, defined
    make_beveled_cube("v7_chin",
                      (0, -0.275, 1.368),
                      (0.055, 0.025, 0.03),
                      MATS["mask"],
                      bevel=0.005)

    # Mouth plate - rectangular with teeth lines
    make_beveled_cube("v7_mouth_plate",
                      (0, -0.258, 1.385),
                      (0.06, 0.018, 0.018),
                      MATS["mask"],
                      bevel=0.002)
    for i in range(3):
        make_beveled_cube(f"v7_mouth_tooth_{i}",
                          (0, -0.258, 1.392),
                          (0.035, 0.003, 0.001),
                          MATS["lacquer"],
                          bevel=0.001)

    # Brow ridge - prominent, war-like
    make_beveled_cube("v7_brow_ridge",
                      (0, -0.21, 1.40),
                      (0.12, 0.015, 0.022),
                      MATS["mask"],
                      rot=(math.radians(12), 0, 0),
                      bevel=0.003)

    # Eye sockets - deep recess
    make_beveled_cube("v7_eye_socket_l",
                      (-0.038, -0.22, 1.395),
                      (0.03, 0.01, 0.012),
                      MATS["lacquer"],
                      bevel=0.002)
    make_beveled_cube("v7_eye_socket_r",
                      (0.038, -0.22, 1.395),
                      (0.03, 0.01, 0.012),
                      MATS["lacquer"],
                      bevel=0.002)

    # Eye slits
    make_beveled_cube("v7_eye_slit_l",
                      (-0.038, -0.22, 1.402),
                      (0.024, 0.0035, 0.0035),
                      MATS["lacquer"],
                      bevel=0.001)
    make_beveled_cube("v7_eye_slit_r",
                      (0.038, -0.22, 1.402),
                      (0.024, 0.0035, 0.0035),
                      MATS["lacquer"],
                      bevel=0.001)

    # Moustache - thick, curling outward
    for side, sign in (("l", -1), ("r", 1)):
        make_beveled_cube(f"v7_moustache_{side}",
                          (sign * 0.03, -0.248, 1.38),
                          (0.05, 0.005, 0.01),
                          MATS["lacquer"],
                          bevel=0.0015)
        cone(f"v7_moustache_curl_{side}",
              (sign * 0.075, -0.255, 1.37),
              0.006, 0.002, 0.012,
              MATS["lacquer"], 8)


def add_torso_v7():
    """
    v7 torso - slimmer proportions, better defined.
    """
    # Underlayer - slimmer, defined torso
    make_beveled_cube("v7_chest_upper",
                      (0, 0.02, 1.055),
                      (0.32, 0.05, 0.2),
                      MATS["cloth"],
                      bevel=0.012)
    make_beveled_cube("v7_chest_mid",
                      (0, -0.015, 1.058),
                      (0.29, 0.045, 0.19),
                      MATS["cloth"],
                      bevel=0.01)
    make_beveled_cube("v7_torso_lower",
                      (0, -0.055, 1.048),
                      (0.26, 0.04, 0.17),
                      MATS["cloth"],
                      bevel=0.01)

    # Cuirass (do) - slimmer, better defined
    make_beveled_cube("v7_do_core",
                      (0, -0.035, 1.058),
                      (0.35, 0.08, 0.35),
                      MATS["armor_red"],
                      rot=(math.radians(1.5), 0, 0),
                      bevel=0.018)

    # Lamellar plates - 4 rows with graduated sizing
    add_plate_row("v7_front_upper", 1.22, -0.125, 0.37, 7, MATS["armor_red"], 0.0)
    add_plate_row("v7_front_mid", 1.12, -0.128, 0.34, 7, MATS["lacquer"], 0.015)
    add_plate_row("v7_front_lower", 1.025, -0.128, 0.31, 6, MATS["armor_red"], 0.02)
    add_plate_row("v7_front_abdomen", 0.93, -0.128, 0.27, 6, MATS["lacquer"], 0.025)

    # Side armor plates - graduated, better overlap
    for side, sign in (("left", -1), ("right", 1)):
        for row in range(5):
            plate_w = 0.045 + row * 0.004
            z_pos = 1.15 - row * 0.09
            make_beveled_cube(
                f"v7_side_plate_{side}_{row}",
                 (sign * (0.22 + row * 0.008), -0.008, z_pos),
                 (plate_w, 0.085, 0.065),
                MATS["lacquer"] if row % 2 else MATS["armor_red"],
                rot=(0, math.radians(sign * (15 + row * 2)), 0),
                bevel=0.008
             )

    # Obi sash - more defined
    make_beveled_cube("v7_obi_sash",
                      (0, -0.155, 0.84),
                      (0.28, 0.02, 0.025),
                      MATS["cord"],
                      bevel=0.005)
    ellipsoid("v7_obi_knot",
              (0.06, -0.158, 0.845),
              (0.022, 0.025, 0.015),
              MATS["cord"], 16, 10)

    # Kusazuri (skirt armor) - 4 pieces, better proportion, not hanging too low
    kusazuri_data = [
        (-0.12, math.radians(-3)),
        (-0.055, math.radians(-1)),
         (0.055, math.radians(1)),
         (0.12, math.radians(3)),
    ]
    for i, (x, rot) in enumerate(kusazuri_data):
        make_beveled_cube(
            f"v7_kusazuri_{i}",
             (x, -0.095, 0.71),
             (0.085, 0.045, 0.16),
            MATS["armor_red"],
            rot=(math.radians(9), 0, rot),
            bevel=0.008
         )
        for j in range(4):
            cyl(f"v7_kusazuri_lace_{i}_{j}",
                 (x + (j % 2) * 0.035 - 0.015, -0.13, 0.71 - j * 0.032),
                 0.003, 0.028, MATS["cord"], 6)

    # Blue lacing across front
    for i in range(5):
        cyl(f"v7_blue_lace_{i}",
             (-0.15 + i * 0.065, -0.158, 1.23),
             0.003, 0.24, MATS["cord"], 8)


def add_weapons_and_banner_v7():
    """V7 weapons and banner."""
    # Katana blade
    cyl("v7_katana_blade", (-0.40, -0.31, 0.62),
         0.006, 0.78, MATS["steel"], 8)
    cyl("v7_blade_edge", (-0.39, -0.308, 0.63),
         0.002, 0.72, MATS["gold"], 6)

    # Katana guard
    make_beveled_cube("v7_tsuba",
                      (-0.42, -0.31, 0.64),
                      (0.085, 0.018, 0.045),
                      MATS["gold"],
                      rot=(math.radians(42), 0, math.radians(-44)),
                      bevel=0.007)

    # Handle
    cyl("v7_tsuka", (-0.55, -0.30, 0.53),
         0.015, 0.12, MATS["leather"], 12)
    for i in range(5):
        cyl(f"v7_tsuka_wrap_{i}",
             (-0.53 + i * 0.011, -0.305, 0.54),
             0.016, 0.005, MATS["armor_red"], 12)

    # Pommel
    cyl("v7_kashira", (-0.595, -0.30, 0.52),
         0.018, 0.01, MATS["gold"], 12,
         rot=(math.radians(90), 0, 0))

    # Sashimono banner
    cyl("v7_banner_pole", (0.32, 0.14, 1.58),
         0.007, 0.82, MATS["wood"], 8)
    make_beveled_cube("v7_banner_cloth",
                      (0.34, 0.13, 1.55),
                      (0.18, 0.014, 0.35),
                      MATS["banner"],
                      rot=(0, math.radians(2), 0),
                      bevel=0.003)
    cyl("v7_banner_mon", (0.34, 0.13, 1.55),
         0.032, 0.003, MATS["banner_ink"], 16,
         rot=(math.radians(90), 0, 0))
    make_beveled_cube("v7_banner_tassel",
                      (0.34, 0.13, 1.72),
                      (0.025, 0.03, 0.007),
                      MATS["gold"],
                      rot=(0, math.radians(2), 0),
                      bevel=0.003)


def add_cloth_folds_v7():
    for side, sign in (("left", -1), ("right", 1)):
        for i in range(4):
            cylinder_between(
                f"v7_hakama_fold_{i}_{side}",
                 (sign * (0.12 + i * 0.045), -0.10, 0.75),
                 (sign * (0.155 + i * 0.045), -0.10, 0.37),
                 0.0045,
                MATS["cord"],
                 8,
             )


def build_samurai_v7():
    reset_scene()
    add_torso_v7()
    add_sode("left")
    add_sode("right")
    add_arm("left")
    add_arm("right")
    add_leg("left")
    add_leg("right")
    add_kabuto_v7()
    add_face_mask_v7()
    add_weapons_and_banner_v7()
    add_cloth_folds_v7()
    mesh_count = len([o for o in bpy.context.scene.objects if o.type == "MESH"])
    print(f"v7b mesh objects: {mesh_count}")


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
         ("left", (-3.0, -0.2, 1.2), (0, 0, 0.95), 52),
         ("rear", (-0.12, -3.0, 1.25), (0, 0, 1.85), 48),
     ]
    rendered = []
    for name, loc, target, lens in views:
        cam.location = loc
        cam.data.lens = lens
        cam.data.sensor_width = 32
        look_at(cam, target)
        path = OUT_DIR / f"cs_{name}_v7b.png"
        bpy.context.scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        rendered.append(path)

    try:
        from PIL import Image as PILImage
        sheet = PILImage.new("RGB", (1440, 2700), (18, 16, 13))
        positions = [(0, 0), (720, 0),
                      (0, 900), (720, 900),
                      (0, 1800), (720, 1800)]
        for i, path in enumerate(rendered):
            sheet.paste(PILImage.open(path).resize((720, 900)), positions[i])
        sheet_path = OUT_DIR / "samurai_character_contact_sheet_v7b.png"
        sheet.save(sheet_path)
        shutil.copyfile(sheet_path, GAME_DIR / "assets" / "samurai_character_contact_sheet.png")
    except Exception as exc:
        print("contact sheet compose skipped:", exc)

    configure_render(820, 1024, 0.22)
    cam.location = (-1.45, -2.85, 1.2)
    cam.data.lens = 45
    look_at(cam, (0, 0, 0.98))
    hero_path = OUT_DIR / "samurai_character_hero_v7b.png"
    bpy.context.scene.render.filepath = str(hero_path)
    bpy.ops.render.render(write_still=True)
    shutil.copyfile(hero_path, GAME_DIR / "assets" / "samurai_character_hero.png")

    configure_render(720, 900, 0.22)
    cam.data.lens = 50
    for i in range(8):
        angle = math.radians(i * 45)
        cam.location = (math.cos(angle) * 2.5, math.sin(angle) * -2.5, 1.2)
        look_at(cam, (0, 0, 0.98))
        turntable_path = OUT_DIR / f"turntable_{i:03d}_v7b.png"
        bpy.context.scene.render.filepath = str(turntable_path)
        bpy.ops.render.render(write_still=True)


def export_assets():
    source_path = OUT_DIR / "samurai_character_source_v7b.blend"
    root_source_path = FOUNDARY_DIR / "samurai_character_source_v7b.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(source_path))
    shutil.copyfile(source_path, root_source_path)
    glb_path = OUT_DIR / "samurai_character_v7b.glb"
    bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format="GLB",
                             export_materials="EXPORT", export_apply=True)
    shutil.copyfile(glb_path, GAME_DIR / "assets" / "samurai_character.glb")


def main():
    build_samurai_v7()
    export_assets()
    render_views()
    print("v7b artifacts complete:", OUT_DIR)


if __name__ == "__main__":
    main()
