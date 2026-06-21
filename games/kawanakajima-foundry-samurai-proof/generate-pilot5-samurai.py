"""
v17 Pilot-5 Samurai Asset Generation
Produces 4 new distinct samurai models: 2 Takeda (red) + 2 Uesugi (blue).
Grounded anatomy, readable silhouettes, no v12 defects.
Variants: takeda-03 (hawk crest), takeda-04 (spiked helm), uesugi-03 (circle mon), uesugi-04 (horned cross).

Blender 3.4 compatible. Run:
    blender --background --python generate-pilot5-samurai.py
"""
import math
import os
import sys
from pathlib import Path

try:
    import bpy
    from mathutils import Vector
except Exception:
    print("Run via: blender --background --python", file=sys.stderr)
    sys.exit(1)


# ─── Paths ───────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parents[2]
GAME_DIR = ROOT / "games" / "kawanakajima-foundry-samurai-proof"
OUT_BASE = GAME_DIR / "assets" / "generated" / "foundry" / "samurai-v17" / "pilot-5"
SCREENSHOT_DIR = GAME_DIR / "assets" / "generated" / "foundry" / "samurai-v17" / "pilot-5" / "screenshots"
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)

# ─── Materials ───────────────────────────────────────────────────────────────

def make_mat(name, color, roughness=0.72, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


def make_team_mats(team):
    """Build materials for a team. Red side vs Blue side color differentiation."""
    if team == "takeda":
        return {
            "lacquer":       make_mat("takeda_lacquer",       (0.012, 0.010, 0.008, 1), 0.35),
            "iron":         make_mat("takeda_iron",          (0.052, 0.048, 0.044, 1), 0.55, 0.18),
            "armor":        make_mat("takeda_armor_red",     (0.28, 0.040, 0.030, 1), 0.50),
            "armor_alt":    make_mat("takeda_armor_alt",     (0.14, 0.020, 0.015, 1), 0.48),
            "gold":         make_mat("takeda_gold",          (0.74, 0.55, 0.20, 1), 0.42, 0.18),
            "cord":         make_mat("takeda_cord",          (0.12, 0.04, 0.03, 1), 0.80),
            "cloth":        make_mat("takeda_cloth",         (0.030, 0.048, 0.080, 1), 0.85),
            "skin":         make_mat("takeda_skin",          (0.40, 0.24, 0.16, 1), 0.70),
            "mask":         make_mat("takeda_mask",          (0.16, 0.038, 0.028, 1), 0.58),
            "leather":      make_mat("takeda_leather",       (0.10, 0.065, 0.035, 1), 0.70),
            "wood":         make_mat("takeda_wood",          (0.15, 0.085, 0.030, 1), 0.72),
            "steel":        make_mat("takeda_steel",         (0.76, 0.76, 0.70, 1), 0.28, 0.48),
            "banner":       make_mat("takeda_banner_red",    (0.42, 0.058, 0.040, 1), 0.78),
            "banner_ink":   make_mat("takeda_banner_gold",   (0.82, 0.70, 0.46, 1), 0.74),
        }
    else:  # uesugi
        return {
            "lacquer":       make_mat("uesugi_lacquer",       (0.008, 0.010, 0.018, 1), 0.35),
            "iron":         make_mat("uesugi_iron",          (0.048, 0.050, 0.058, 1), 0.55, 0.18),
            "armor":        make_mat("uesugi_armor_blue",    (0.035, 0.055, 0.18, 1), 0.50),
            "armor_alt":    make_mat("uesugi_armor_alt",     (0.025, 0.035, 0.12, 1), 0.48),
            "gold":         make_mat("uesugi_silver",        (0.68, 0.70, 0.76, 1), 0.42, 0.18),
            "cord":         make_mat("uesugi_cord",          (0.04, 0.10, 0.18, 1), 0.80),
            "cloth":        make_mat("uesugi_cloth",         (0.028, 0.042, 0.070, 1), 0.85),
            "skin":         make_mat("uesugi_skin",          (0.38, 0.23, 0.15, 1), 0.70),
            "mask":         make_mat("uesugi_mask",          (0.12, 0.035, 0.055, 1), 0.58),
            "leather":      make_mat("uesugi_leather",       (0.09, 0.055, 0.045, 1), 0.70),
            "wood":         make_mat("uesugi_wood",          (0.14, 0.080, 0.035, 1), 0.72),
            "steel":        make_mat("uesugi_steel",         (0.74, 0.75, 0.72, 1), 0.28, 0.48),
            "banner":       make_mat("uesugi_banner_blue",   (0.045, 0.060, 0.22, 1), 0.78),
            "banner_ink":   make_mat("uesugi_banner_silver", (0.78, 0.80, 0.84, 1), 0.74),
        }


# ─── Helpers ─────────────────────────────────────────────────────────────────

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

# ─── Body Parts ──────────────────────────────────────────────────────────────

def add_sode(side, M, layer_count=5):
    sign = -1 if side == "left" else 1
    shoulder = ellipsoid(f"{side}_rounded_shoulder_undercloth", (sign * 0.34, -0.015, 1.25), (0.095, 0.095, 0.12), M["cloth"], 24, 12)
    shoulder.rotation_euler[1] = math.radians(sign * 9)
    for j in range(layer_count):
        z = 1.28 - j * 0.075
        x = sign * (0.43 + j * 0.01)
        plate = cube(
            f"{side}_layered_sode_{j}",
            (x, -0.04, z),
            (0.22, 0.038, 0.066),
            M["armor"] if j % 2 == 0 else M["armor_alt"],
            rot=(math.radians(5), math.radians(sign * 10), math.radians(sign * 4)),
            bevel=0.014,
         )
        cylinder_between(f"{side}_sode_lace_{j}_a", (x - sign * 0.07, -0.066, z + 0.035), (x - sign * 0.07, -0.066, z - 0.035), 0.004, M["cord"], 8)
        cylinder_between(f"{side}_sode_lace_{j}_b", (x + sign * 0.07, -0.066, z + 0.035), (x + sign * 0.07, -0.066, z - 0.035), 0.004, M["cord"], 8)


def add_arm(side, M):
    sign = -1 if side == "left" else 1
    # Upper arm covered in under-cloth
    cylinder_between(f"{side}_upper_arm_cloth", (sign * 0.42, -0.015, 1.14), (sign * 0.55, -0.025, 0.92), 0.055, M["cloth"], 18)
    # Kote (iron gauntlet)
    cylinder_between(f"{side}_forearm_kote", (sign * 0.55, -0.025, 0.92), (sign * 0.49, -0.12, 0.72), 0.047, M["iron"], 18)
    # Gloved hand
    ellipsoid(f"{side}_gloved_hand", (sign * 0.48, -0.16, 0.66), (0.048, 0.035, 0.038), M["leather"], 18, 10)
    # Fingers
    for fi in range(4):
        cylinder_between(
            f"{side}_finger_{fi}",
            (sign * (0.455 + fi * 0.012), -0.185, 0.65),
            (sign * (0.452 + fi * 0.012), -0.23, 0.638),
            0.006,
            M["leather"],
            8,
         )


def add_leg(side, M, variant_idx=0):
    sign = -1 if side == "left" else 1
    # Hakama fabric (legs spread in standing pose)
    cylinder_between(f"{side}_hakama_outer_fold", (sign * 0.17, -0.02, 0.78), (sign * 0.23, -0.015, 0.35), 0.08, M["cloth"], 20)
    # Shin guard (suneate)
    cylinder_between(f"{side}_shin_guard", (sign * 0.23, -0.015, 0.45), (sign * 0.25, -0.03, 0.19), 0.042, M["lacquer"], 18)
    # Tabi sock
    cylinder_between(f"{side}_ankle_tabi_bridge", (sign * 0.25, -0.035, 0.205), (sign * 0.25, -0.095, 0.115), 0.034, M["cloth"], 16)
    ellipsoid(f"{side}_tabi_sock", (sign * 0.25, -0.13, 0.105), (0.075, 0.13, 0.042), M["cloth"], 18, 10, rot=(0, 0, math.radians(sign * 2)))
    # Geta sandals with teeth
    cube(f"{side}_geta_sole", (sign * 0.25, -0.14, 0.048), (0.14, 0.24, 0.03), M["wood"], rot=(0, 0, math.radians(sign * 2)), bevel=0.012)
    cube(f"{side}_geta_tooth_front", (sign * 0.25, -0.205, 0.018), (0.12, 0.02, 0.035), M["wood"], rot=(0, 0, math.radians(sign * 2)), bevel=0.006)
    cube(f"{side}_geta_tooth_rear", (sign * 0.25, -0.075, 0.018), (0.12, 0.02, 0.035), M["wood"], rot=(0, 0, math.radians(sign * 2)), bevel=0.006)
    cylinder_between(f"{side}_geta_thong_a", (sign * 0.20, -0.165, 0.085), (sign * 0.25, -0.125, 0.125), 0.006, M["leather"], 8)
    cylinder_between(f"{side}_geta_thong_b", (sign * 0.30, -0.165, 0.085), (sign * 0.25, -0.125, 0.125), 0.006, M["leather"], 8)
    # Hakama fold detail
    for i in range(3):
        cylinder_between(
            f"{side}_hakama_fold_line_{i}",
            (sign * (0.12 + i * 0.045), -0.105, 0.76),
            (sign * (0.15 + i * 0.045), -0.105, 0.38),
            0.004,
            M["cord"],
            8,
         )


def add_torso(M, variant_idx=0):
    # Cloth underlayer
    ellipsoid("cloth_torso_underlayer", (0, 0.0, 1.05), (0.25, 0.16, 0.31), M["cloth"], 32, 16)
    # Do ( cuirass ) - slightly wider on variant 1, narrower on variant 3
    do_width = 0.46 + variant_idx * 0.02
    do_depth = 0.47 + variant_idx * 0.015
    cube("do_cuirass_core", (0, -0.055, 1.07), (do_width, 0.12, do_depth), M["armor"], rot=(math.radians(2), 0, 0), bevel=0.035)
    # Lamellar rows (front) — vary row count
    row_count = 5 + variant_idx
    for row, z in enumerate([1.25, 1.155, 1.06, 0.965, 0.87][:row_count]):
        cols = 7 if row < 3 else 6
        add_plate_row(f"front_row_{row}", z, -0.14, 0.42 - row * 0.015, cols, M["armor"] if row % 2 == 0 else M["armor_alt"], row * 0.025)
    # Side plates (sode linkage)
    for side, sign in (("left", -1), ("right", 1)):
        for row in range(4):
            cube(
                f"{side}_side_lamellar_{row}",
                (sign * 0.255, -0.012, 1.18 - row * 0.095),
                (0.045, 0.095, 0.075),
                M["lacquer"] if row % 2 else M["armor"],
                rot=(0, math.radians(sign * 14), 0),
                bevel=0.01,
             )
    # Obi sash
    cylinder_between("obi_sash_front", (-0.25, -0.165, 0.84), (0.25, -0.165, 0.84), 0.015, M["cord"], 12)
    # Kusazuri (skirt plates) — vary shape
    cube("kusazuri_front_left", (-0.11, -0.10, 0.72), (0.12, 0.055, 0.19), M["armor"], rot=(math.radians(8), 0, math.radians(-2)), bevel=0.012)
    cube("kusazuri_front_right", (0.11, -0.10, 0.72), (0.12, 0.055, 0.19), M["armor"], rot=(math.radians(8), 0, math.radians(2)), bevel=0.012)
    # Blue lacing on front
    for i in range(5):
        cylinder_between(f"blue_lacing_front_{i}", (-0.18 + i * 0.09, -0.168, 1.26), (-0.18 + i * 0.09, -0.168, 0.9), 0.004, M["cord"], 8)


def add_kabuto(M, variant_idx=0):
    # Helmet bowl
    ellipsoid("kabuto_helmet_bowl", (0.0, -0.02, 1.56), (0.23, 0.20, 0.13), M["lacquer"], 40, 18)
    # Front brim
    ellipsoid("helmet_front_brim", (0.0, -0.185, 1.49), (0.25, 0.055, 0.025), M["lacquer"], 32, 10)
    # Rear flare
    ellipsoid("helmet_rear_flare", (0.0, 0.12, 1.47), (0.25, 0.105, 0.035), M["lacquer"], 32, 10)
    # Gold rivet
    ellipsoid("helmet_gold_rivet", (0.0, -0.205, 1.62), (0.028, 0.018, 0.028), M["gold"], 18, 8)
    # Fukigaeshi (ear flares)
    for side, sign in (("left", -1), ("right", 1)):
        cube(f"{side}_fukigaeshi_flare", (sign * 0.21, -0.08, 1.43), (0.055, 0.105, 0.18), M["lacquer"], rot=(0, math.radians(sign * 10), math.radians(sign * 18)), bevel=0.015)
    # Shikoro (neck guard) — vary rows
    neck_rows = 4 + variant_idx
    for j in range(neck_rows):
        cube(f"shikoro_neck_guard_{j}", (0.0, 0.095 + j * 0.025, 1.405 - j * 0.048), (0.46 - j * 0.045, 0.036, 0.055), M["lacquer"], rot=(math.radians(-8 - j * 2), 0, 0), bevel=0.01)
    # Maedate (front crest) — varies by variant
    if variant_idx == 0:
        # Variant 0: Hawk/rooster crest (Takeda style)
        for side, sign in (("left", -1), ("right", 1)):
            horn = cylinder_between(f"maedate_hawk_{side}", (sign * 0.025, -0.235, 1.655), (sign * 0.18, -0.245, 1.86), 0.014, M["gold"], 12)
            horn.scale.x = 0.65
        cyl("maedate_hawk_stem", (0, -0.235, 1.64), 0.018, 0.035, M["gold"], 16, rot=(math.radians(90), 0, 0))
    elif variant_idx == 1:
        # Variant 1: Spiked helm (Takeda aggressive style)
        for side, sign in (("left", -1), ("right", 1)):
            horn = cyl(f"maedate_horn_{side}", (sign * 0.14, -0.225, 1.72), 0.012, 0.28, M["gold"], 12, rot=(math.radians(15), 0, math.radians(sign * 30)))
            # Add tip jewel
            ellipsoid(f"maedate_spike_tip_{side}", (sign * 0.26, -0.205, 1.97), (0.018, 0.018, 0.018), M["armor"], 12, 8)
        cyl("maedate_center_spire", (0, -0.24, 1.66), 0.025, 0.03, M["gold"], 16, rot=(math.radians(90), 0, 0))
    elif variant_idx == 2:
        # Variant 2: Circle mon (Uesugi style — "kanji" banner inspiration)
        for side, sign in (("left", -1), ("right", 1)):
            rod = cylinder_between(f"maedate_ensou_{side}", (sign * 0.03, -0.18, 1.60), (sign * 0.20, -0.28, 1.90), 0.012, M["gold"], 12)
            rod.scale.x = 0.7
        cyl("maedate_ensou_center", (0, -0.23, 1.64), 0.022, 0.04, M["gold"], 16, rot=(math.radians(90), 0, 0))
    else:
        # Variant 3: Horned cross / Yotsuba-gata (Uesugi warrior style)
        for side, sign in (("left", -1), ("right", 1)):
            # Main branch
            main = cyl(f"maedate_yotsuba_{side}_main", (sign * 0.08, -0.22, 1.70), 0.01, 0.32, M["gold"], 10, rot=(math.radians(20), 0, math.radians(sign * 25)))
            # Sub-branches
            sub_loc = (sign * 0.18, -0.18, 1.88)
            cyl(f"maedate_yotsuba_{side}_sub1", sub_loc, 0.006, 0.12, M["gold"], 8, rot=(math.radians(15), 0, math.radians(sign * 45)))
            cyl(f"maedate_yotsuba_{side}_sub2", (sub_loc[0] + sign * 0.06, sub_loc[1] + 0.02, sub_loc[2] - 0.02), 0.005, 0.08, M["gold"], 8, rot=(math.radians(25), 0, math.radians(sign * 60)))
    # Face mask (mempo)
    ellipsoid("visible_face_shadow", (0, -0.15, 1.38), (0.115, 0.055, 0.125), M["skin"], 24, 12)
    ellipsoid("mempo_cheek_mask", (0, -0.19, 1.31), (0.125, 0.05, 0.105), M["mask"], 24, 12)
    cube("left_eye_slit", (-0.052, -0.235, 1.405), (0.052, 0.012, 0.014), M["lacquer"], bevel=0.004)
    cube("right_eye_slit", (0.052, -0.235, 1.405), (0.052, 0.012, 0.014), M["lacquer"], bevel=0.004)
    # Mustache
    cylinder_between("mempo_moustache_left", (-0.02, -0.235, 1.305), (-0.105, -0.248, 1.285), 0.006, M["lacquer"], 8)
    cylinder_between("mempo_moustache_right", (0.02, -0.235, 1.305), (0.105, -0.248, 1.285), 0.006, M["lacquer"], 8)

def add_weapons_and_banner(M, variant_idx=0):
    # Katana - slight angle variation per variant
    katana_angle = math.radians(-12 + variant_idx * 3)
    cylinder_between("katana_blade", (-0.43, -0.31, 0.64), (0.36, -0.34, 1.32), 0.008, M["steel"], 10)
    cylinder_between("katana_black_ridge", (-0.41, -0.315, 0.64), (0.34, -0.345, 1.3), 0.003, M["lacquer"], 8)
    # Tsuka (wrapped handle)
    cylinder_between("tsuka_wrapped_handle", (-0.55, -0.30, 0.54), (-0.42, -0.31, 0.65), 0.018, M["leather"], 12)
    # Tsuba (guard)
    cube("katana_tsuba_guard", (-0.43, -0.31, 0.64), (0.085, 0.018, 0.048), M["gold"], rot=(math.radians(42), 0, math.radians(-44)), bevel=0.008)
    # Pommel
    cyl("katana_pommel", (-0.58, -0.30, 0.53), 0.015, 0.025, M["gold"], 16, rot=(math.radians(90), 0, 0))

    # Sashimono (banner) - varies by variant
    banner_data = [
        # Variant 0: Rectangular red with circle mon (Takeda)
        ("banner_cloth", (0.28, 0.155, 1.55), (0.18, 0.014, 0.35), "banner", "banner_ink"),
        ("banner_pole", (0.28, 0.06, 1.55), 0.008, 0.65, "wood"),
        ("banner_mon", (0.28, 0.14, 1.59), 0.035, 0.006, "banner_ink"),
        # Variant 1: Longer banner with horizontal stripes (Takeda aggressive)
        ("banner_cloth", (0.30, 0.175, 1.56), (0.20, 0.016, 0.42), "banner", "banner_ink"),
        ("banner_pole", (0.30, 0.08, 1.56), 0.009, 0.70, "wood"),
        ("banner_mon", (0.30, 0.17, 1.60), 0.042, 0.007, "banner_ink"),
        # Variant 2: Narrower banner (Uesugi)
        ("banner_cloth", (0.29, 0.150, 1.55), (0.16, 0.014, 0.32), "banner", "banner_ink"),
        ("banner_pole", (0.29, 0.065, 1.55), 0.008, 0.62, "wood"),
        ("banner_mon", (0.29, 0.135, 1.59), 0.030, 0.005, "banner_ink"),
        # Variant 3: Wide battle standard (Uesugi)
        ("banner_cloth", (0.30, 0.165, 1.56), (0.22, 0.016, 0.38), "banner", "banner_ink"),
        ("banner_pole", (0.30, 0.07, 1.56), 0.009, 0.67, "wood"),
        ("banner_mon", (0.30, 0.150, 1.60), 0.038, 0.006, "banner_ink"),
    ]

    start = variant_idx * 3
    for i in range(3):
        entry = banner_data[start + i]
        name = entry[0]
        if "pole" in name or "mon" in name:
             # Format: (name, loc_tuple, radius, depth, mat_name)
            loc = entry[1]
            radius = entry[2]
            depth = entry[3]
            mat_name = entry[4]
            if mat_name in M:
                cyl(name, loc, radius, depth, M[mat_name], 12 if "pole" in name else 16, rot=(math.radians(90), 0, 0), bevel=False)
        else:
             # Format: (name, loc_tuple, dims_tuple, mat_name, ink_name)
            loc = entry[1]
            dims = entry[2]
            mat_name = entry[3]
            ink_name = entry[4]
            cube(name, loc, dims, M[mat_name], rot=(0, math.radians(1), 0), bevel=0.006)
            cyl(f"{name}_mon", (loc[0], loc[1]-0.015, loc[2]+0.005), dims[2]*0.22, 0.003, M[ink_name], 16, rot=(math.radians(90), 0, 0))
def build_samurai(variant_idx, team_name, M):
    """Build a single samurai with specific variant ID and team materials."""
    reset_scene()

    # Build in order: torso -> sode -> arms -> legs -> kabuto -> face -> weapons/banner
    add_torso(M, variant_idx)
    add_sode("left", M, 5)
    add_sode("right", M, 5)
    add_arm("left", M)
    add_arm("right", M)
    add_leg("left", M, variant_idx)
    add_leg("right", M, variant_idx)
    add_kabuto(M, variant_idx)
    add_weapons_and_banner(M, variant_idx)

    mesh_count = len([o for o in bpy.context.scene.objects if o.type == "MESH"])
    print(f"[{team_name} v{variant_idx}] Built samurai with {mesh_count} mesh objects")
    return mesh_count


# ─── Render & Export ─────────────────────────────────────────────────────────

def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def configure_render(width, height, exposure=1.4):
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
    world = bpy.data.worlds.get("asset_render_world")
    if world is None:
        world = bpy.data.worlds.new("asset_render_world")
    scene.world = world
    world.use_nodes = True
    world.color = (0.22, 0.20, 0.18)


def add_render_lights():
    bpy.ops.object.light_add(type="SUN", location=(-2.5, -4, 6))
    sun = bpy.context.object
    sun.name = "softbox_key"
    sun.data.energy = 18.0
    sun.rotation_euler = (math.radians(43), 0, math.radians(-22))

    bpy.ops.object.light_add(type="AREA", location=(2.2, -3.2, 2.8))
    fill = bpy.context.object
    fill.name = "front_fill"
    fill.data.energy = 1200
    fill.data.size = 4.8

    bpy.ops.object.light_add(type="AREA", location=(-2.6, 2.2, 2.5))
    rim = bpy.context.object
    rim.name = "rim_light"
    rim.data.energy = 900
    rim.data.size = 3.2


def render_views(cam_name="asset_camera"):
    """Render 6 inspection views: front, side, rear, qtr1, qtr2, top."""
    add_render_lights()
    configure_render(720, 900, 1.6)

    # Add ground plane for context
    bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 0, -1.0))
    ground = bpy.context.object
    ground.name = "render_ground"
    ground_mat = make_mat("ground_mat", (0.15, 0.14, 0.12, 1.0), 0.9)
    ground.data.materials.append(ground_mat)
    ground.scale = (4, 4, 1)

    cam_data = bpy.data.cameras.new(cam_name)
    cam = bpy.data.objects.new(cam_name, cam_data)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    # 6 inspection views per samurai
    views = [
        ("front",   (-1.55, -3.0, 1.25), (0, 0, 0.95), 48),
        ("side_l",  (3.0, -0.2, 1.2),   (0, 0, 0.95), 52),
        ("rear",    (-1.55, 3.0, 1.25),  (0, 0, 0.95), 48),
        ("qtr_fl",  (-2.1, -2.5, 1.35), (0, 0, 0.98), 48),
        ("qtr_fr",  (2.1, -2.5, 1.35),  (0, 0, 0.98), 48),
        ("top",     (0.12, -0.2, 3.65), (0, 0, 0.82), 34),
    ]

    rendered = []
    for name, loc, target, lens in views:
        cam.location = loc
        cam.data.lens = lens
        cam.data.sensor_width = 32
        look_at(cam, target)
        path = OUT_BASE / f"cs_{name}.png"
        bpy.context.scene.render.filepath = str(path)
        bpy.context.view_layer.update()
        bpy.ops.render.render(write_still=True)
        rendered.append(path)
        print(f"  Rendered {name} → {path}")

    # Contact sheet
    try:
        from PIL import Image as PILImage
        sheet = PILImage.new("RGB", (1440, 1800), (18, 16, 13))
        positions = [(0, 0), (720, 0), (0, 900), (720, 900), (0, 900), (720, 900)]
        for i, path in enumerate(rendered[:4]):
            sheet.paste(PILImage.open(path).resize((720, 900)), (positions[i][0], positions[i][1]))
        sheet_path = OUT_BASE / "contact_sheet.png"
        sheet.save(sheet_path)
        print(f"  Contact sheet: {sheet_path}")
    except Exception as exc:
        print(f"  Contact sheet compose skipped: {exc}")

    # Hero shot (slightly angled, dramatic)
    configure_render(820, 1024, 1.6)
    cam.location = (-1.45, -2.85, 1.2)
    cam.data.lens = 45
    look_at(cam, (0, 0, 0.98))
    hero_path = OUT_BASE / "hero.png"
    bpy.context.scene.render.filepath = str(hero_path)
    bpy.context.view_layer.update()
    bpy.ops.render.render(write_still=True)
    print(f"  Hero shot: {hero_path}")


def export_glb(filepath):
    bpy.ops.export_scene.gltf(filepath=str(filepath), export_format="GLB",
                             export_materials="EXPORT", export_apply=True)
    print(f"  GLB exported: {filepath}")


def save_blend(filepath):
    bpy.ops.wm.save_as_mainfile(filepath=str(filepath))
    print(f"  Blend saved: {filepath}")


def reset_for_new_samurai():
    """Clean up all objects between samurai builds."""
    reset_scene()
     # Clear cameras
    for cam in bpy.data.cameras:
        bpy.data.cameras.remove(cam)


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    OUT_BASE.mkdir(parents=True, exist_ok=True)

    # Define 4 samurai: 2 Takeda (red) variants + 2 Uesugi (blue) variants
    samurai_specs = [
        ("takeda",   "takeda-03",   0),   # Variant 0: Hawk crest helm
        ("takeda",   "takeda-04",   1),   # Variant 1: Spiked helm
        ("uesugi",   "uesugi-03",   2),   # Variant 2: Circle mon helm
        ("uesugi",   "uesugi-04",   3),   # Variant 3: Horned cross helm
    ]
    # Reset and build
    all_meshes = {}
    for team, samurai_name, variant_idx in samurai_specs:
        print(f"\n{'='*60}")
        print(f"Building: {samurai_name} (variant {variant_idx})")
        print(f"{'='*60}")

        reset_for_new_samurai()
        M = make_team_mats(team)
        mesh_count = build_samurai(variant_idx, samurai_name, M)
        all_meshes[samurai_name] = mesh_count

    # Save blend
        blend_path = OUT_BASE / f"{samurai_name}_source.blend"
        save_blend(blend_path)

    # Export GLB
        glb_path = OUT_BASE / f"{samurai_name}.glb"
        export_glb(glb_path)

    # Render views
        render_views(f"cam_{samurai_name}")

    # Clean for next samurai
        reset_for_new_samurai()

    # Summary
    print(f"\n{'='*60}")
    print("Pilot-5 Asset Generation Complete")
    print(f"{'='*60}")
    for name, count in all_meshes.items():
        print(f"  {name}: {count} mesh objects")
    print(f"\nAll artifacts in: {OUT_BASE}")


if __name__ == "__main__":
    main()
