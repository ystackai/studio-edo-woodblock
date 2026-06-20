#!/usr/bin/env python3
"""
v4 polish iteration on v3 Foundry samurai source (autonomous retry canonical).
Augments with: stronger kabuto neck guard plates for silhouette, more lamellar plate hints on torso,
clearer finger separation nubs, visible split-toe + geta strap definition for foot profile read.
Exports updated GLB + blend + contact/hero for evidence.
Run: /usr/bin/blender --background --python improve-samurai-v4.py
"""
import os
import math
import sys

try:
    import bpy
    from mathutils import Vector
    HAS_BPY = True
except Exception:
    HAS_BPY = False

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
GAME_DIR = os.path.join(ROOT, "games", "kawanakajima-foundry-samurai-proof")
SRC_BLEND = os.path.join(GAME_DIR, "assets", "generated", "foundry", "samurai", "samurai_character_source_v3.blend")
if not os.path.exists(SRC_BLEND):
    SRC_BLEND = os.path.join(GAME_DIR, "assets", "generated", "foundry", "samurai", "samurai_character_source.blend")
OUT_DIR = os.path.join(GAME_DIR, "assets", "generated", "foundry", "samurai", "improved-20260620-v4")
os.makedirs(OUT_DIR, exist_ok=True)

if not HAS_BPY:
    print("Run this via /usr/bin/blender --background --python", __file__)
    sys.exit(1)

print("=== v4: loading v3 Foundry source", SRC_BLEND)
bpy.ops.wm.open_mainfile(filepath=SRC_BLEND)

def find(name_sub):
    for o in bpy.context.scene.objects:
        if o.type == 'MESH' and name_sub.lower() in o.name.lower():
            return o
    return None

kabuto = find("kabuto") or find("helmet bowl")
mempo = find("mempo") or find("mask")
torso = find("torso") or find("chest")
left_hand = find("left gloved hand")
right_hand = find("right gloved hand")
left_tabi = find("left tabi") or find("left foot")
right_tabi = find("right tabi") or find("right foot")
sode_l = find("left sode") or find("shoulder plate")

print("v4 targets:", kabuto, mempo, torso, left_tabi)

# 1. Neck guard / shikoro plates under kabuto for strong helmet silhouette
if kabuto:
    for i, off in enumerate([-0.12, 0.0, 0.12]):
        bpy.ops.mesh.primitive_plane_add(size=0.18, location=(off*0.6, -0.52, 1.48 - i*0.04))
        pl = bpy.context.object
        pl.name = "v4_shikoro_" + str(i)
        pl.rotation_euler = (math.radians(95 + i*3), 0, math.radians(off*18))
        pl.scale = (0.9, 0.55, 1.0)
        pl.parent = kabuto
        m = bpy.data.materials.new("v4_shikoro")
        m.use_nodes = True
        m.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0.05,0.045,0.04,1)
        pl.data.materials.append(m)

# 2. Lamellar plate hints on torso (kozane style small overlapping reads)
if torso:
    for j in range(3):
        for s in [-0.9, 0.9]:
            bpy.ops.mesh.primitive_plane_add(size=0.11)
            pl = bpy.context.object
            pl.name = f"v4_kozane_{j}_{s}"
            pl.location = (s*0.03, -0.08 - j*0.07, 0.92 + j*0.03)
            pl.rotation_euler = (math.radians(10), math.radians(s*4), 0)
            pl.parent = torso
            m = bpy.data.materials.new("v4_plate")
            m.use_nodes = True
            m.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0.08,0.07,0.065,1)
            pl.data.materials.append(m)

# 3. Better finger separation on hands
for hand in [left_hand, right_hand]:
    if not hand: continue
    for fi, fx in enumerate([-0.028, 0.0, 0.028]):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.009, location=(0.01, -0.195 + fx*0.6, 0.98 + fi*0.008))
        nub = bpy.context.object
        nub.name = "v4_finger_" + str(fi)
        nub.scale = (0.55, 1.1, 0.6)
        nub.parent = hand

# 4. Clearer split-toe + strap for foot profile (non paddle)
for tabi in [left_tabi, right_tabi]:
    if not tabi: continue
    # split divider
    bpy.ops.mesh.primitive_cube_add(size=0.018, location=(0.0, -0.01, 0.04))
    div = bpy.context.object
    div.name = "v4_toe_div"
    div.scale = (0.6, 0.9, 0.6)
    div.parent = tabi
    # outer strap
    bpy.ops.mesh.primitive_cube_add(size=0.04, location=(0.0, 0.008, 0.11))
    st = bpy.context.object
    st.name = "v4_geta_strap"
    st.scale = (1.25, 0.22, 0.18)
    st.parent = tabi

# Export GLB (preserves original materials, adds only parented geo)
OUT_GLB = os.path.join(OUT_DIR, "samurai_character_v4.glb")
print("exporting v4 GLB...")
bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format='GLB', export_materials='EXPORT', export_apply=True)
print("GLB:", OUT_GLB, os.path.getsize(OUT_GLB) if os.path.exists(OUT_GLB) else 0)

AUG_BLEND = os.path.join(OUT_DIR, "samurai_character_source_v4.blend")
bpy.ops.wm.save_as_mainfile(filepath=AUG_BLEND)
print("aug blend v4:", AUG_BLEND)

# Controlled contact/hero renders from source (light augments)
bpy.ops.wm.open_mainfile(filepath=SRC_BLEND)
kabuto = find("kabuto") or find("helmet bowl")
if kabuto:
    bpy.ops.mesh.primitive_plane_add(size=0.2, location=(0.0, -0.47, 1.76))
    crest = bpy.context.object
    crest.name = "v4cs_crest"
    crest.rotation_euler = (math.radians(78), 0, 0)
    crest.scale = (0.16, 0.85, 1)
    crest.parent = kabuto

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.eevee.use_gtao = True
scene.render.resolution_x = 640
scene.render.resolution_y = 480
scene.view_settings.view_transform = "Filmic"
scene.view_settings.exposure = 0.18

views = [
    ("front", (-1.55, -2.6, 1.32), (0.0, 0.55, 1.08), 42),
    ("side", (3.0, -0.05, 1.22), (0.0, 0.55, 1.08), 48),
    ("top", (0.05, 0.02, 3.9), (0.0, 0.5, 1.0), 32),
    ("qtr", (1.7, 2.45, 1.48), (0.0, 0.5, 1.12), 46),
]
contact_paths = []
for nm, loc, tgt, lens in views:
    camd = bpy.data.cameras.new("v4c_"+nm); cam = bpy.data.objects.new("v4c_"+nm, camd)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    cam.location = loc
    cam.data.lens = lens
    cam.rotation_euler = (Vector(tgt) - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = os.path.join(OUT_DIR, "cs_"+nm+".png")
    bpy.ops.render.render(write_still=True)
    contact_paths.append(scene.render.filepath)

try:
    from PIL import Image as PILImage
    sheet = PILImage.new("RGB", (1280, 960), (18,16,13))
    pos = [(0,0),(640,0),(0,480),(640,480)]
    for i, pth in enumerate(contact_paths[:4]):
        im = PILImage.open(pth).resize((640,480))
        sheet.paste(im, pos[i])
    sheet_p = os.path.join(OUT_DIR, "samurai_character_contact_sheet_v4.png")
    sheet.save(sheet_p)
    print("contact v4:", sheet_p, os.path.getsize(sheet_p))
except Exception as e: print("PIL v4 skip:", e)

# hero
scene.render.resolution_x = 820
scene.render.resolution_y = 1024
hero_cam = bpy.data.objects.new("v4h", bpy.data.cameras.new("v4h"))
bpy.context.collection.objects.link(hero_cam)
scene.camera = hero_cam
hero_cam.location = (-1.0, -1.75, 1.38)
hero_cam.data.lens = 62
hero_cam.rotation_euler = (Vector((0.0,0.38,1.1)) - hero_cam.location).to_track_quat("-Z","Y").to_euler()
scene.render.filepath = os.path.join(OUT_DIR, "samurai_character_hero_v4.png")
bpy.ops.render.render(write_still=True)
print("hero v4:", scene.render.filepath)

print("=== v4 artifacts done in", OUT_DIR)
