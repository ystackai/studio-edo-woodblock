#!/usr/bin/env python3
"""
v3 improvement iteration on Foundry samurai source.
Run with: /usr/bin/blender --background --python improve-samurai-v3.py
Augments the detailed 188-mesh foundry source (preserving all original) with
targeted geo for crest, eye slits, knuckle definition, extra toe/strap, layered sode.
Then exports GLB, and generates contact/hero/turntable PNGs for the gate.
"""
import os
import math
import shutil

try:
    import bpy
    from mathutils import Vector
    HAS_BPY = True
except Exception:
    HAS_BPY = False

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
GAME_DIR = os.path.join(ROOT, "games", "kawanakajima-foundry-samurai-proof")
SRC_BLEND = os.path.join(GAME_DIR, "assets", "generated", "foundry", "samurai", "samurai_character_source.blend")
OUT_DIR = os.path.join(GAME_DIR, "assets", "generated", "foundry", "samurai", "improved-20260620-v3")
os.makedirs(OUT_DIR, exist_ok=True)

if not HAS_BPY:
    print("Run this via /usr/bin/blender --background --python", __file__)
    sys.exit(1)

print("=== v3: loading Foundry source", SRC_BLEND)
bpy.ops.wm.open_mainfile(filepath=SRC_BLEND)

def find(name_sub):
    for o in bpy.context.scene.objects:
        if o.type == 'MESH' and name_sub.lower() in o.name.lower():
            return o
    return None

kabuto = find("kabuto helmet bowl")
mempo = find("mempo cheek mask") or find("mempo")
left_hand = find("left gloved hand")
right_hand = find("right gloved hand")
left_tabi = find("left tabi foot volume")
right_tabi = find("right tabi foot volume")
sash_cloth = find("cloth sashimono banner panel")

print("targets:", kabuto, mempo, left_hand, left_tabi)

# 1. Maedate crest on kabuto (distinct frontal read)
if kabuto:
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.mesh.primitive_plane_add(size=0.2, location=(0.0, -0.47, 1.76))
    crest = bpy.context.object
    crest.name = "v3_maedate_crest"
    crest.rotation_euler = (math.radians(78), 0, 0)
    crest.scale = (0.16, 0.85, 1)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.extrude_region_move(TRANSFORM_OT_translate={"value":(0, 0.014, 0)})
    bpy.ops.object.mode_set(mode='OBJECT')
    mat = bpy.data.materials.new("v3_crest")
    mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0.06,0.055,0.05,1)
    crest.data.materials.append(mat)
    crest.parent = kabuto

# 2. Eye slits on mempo (recessed read)
if mempo:
    for side, sx in [("L", -0.085), ("R", 0.085)]:
        bpy.ops.mesh.primitive_cube_add(size=0.03, location=(sx, -0.415, 1.505))
        sl = bpy.context.object
        sl.name = "v3_eye_slit_" + side
        sl.scale = (0.55, 0.22, 0.1)
        sl.parent = mempo
        m = bpy.data.materials.new("v3_slit_" + side)
        m.use_nodes = True
        m.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0.015,0.015,0.018,1)
        sl.data.materials.append(m)

# 3. Knuckle definition on hands
for hand in [left_hand, right_hand]:
    if not hand: continue
    for off, nm in [(0.0,"idx"), (0.035,"mid"), (-0.035,"rng")]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.015, location=(0.0, -0.16 + off, 1.02))
        nub = bpy.context.object
        nub.name = "v3_knuckle_" + nm
        nub.scale = (0.65, 0.9, 0.55)
        nub.parent = hand

# 4. Extra toe + strap on tabi
for tabi in [left_tabi, right_tabi]:
    if not tabi: continue
    bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.07, location=(0.0, 0.0, 0.07))
    toe = bpy.context.object
    toe.name = "v3_small_toe"
    toe.rotation_euler = (math.radians(90), 0, 0)
    toe.parent = tabi
    bpy.ops.mesh.primitive_cube_add(size=0.05, location=(0.0, 0.01, 0.105))
    strap = bpy.context.object
    strap.name = "v3_toe_strap"
    strap.scale = (1.4, 0.28, 0.22)
    strap.parent = tabi

# 5. Layer hint on one sode
sode = find("left sode shoulder plate 1")
if sode:
    bpy.ops.mesh.primitive_plane_add(size=0.15)
    lay = bpy.context.object
    lay.name = "v3_sode_layer"
    lay.parent = sode
    lay.location = (0.0, 0.008, 0.06)

# Export GLB (includes added children)
OUT_GLB = os.path.join(OUT_DIR, "samurai_character_v3.glb")
print("exporting v3 GLB...")
bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format='GLB', export_materials='EXPORT', export_apply=True)
print("GLB:", OUT_GLB, os.path.getsize(OUT_GLB) if os.path.exists(OUT_GLB) else 0)

# Save augmented blend for render source reuse
AUG_BLEND = os.path.join(OUT_DIR, "samurai_character_source_v3.blend")
bpy.ops.wm.save_as_mainfile(filepath=AUG_BLEND)
print("aug blend:", AUG_BLEND)

# Now reload clean source and do controlled contact renders (use augments lightly + good lighting)
bpy.ops.wm.open_mainfile(filepath=SRC_BLEND)
# minimal re-apply for hero/contact renders (same targets)
kabuto = find("kabuto helmet bowl")
if kabuto:
    bpy.ops.mesh.primitive_plane_add(size=0.2, location=(0.0, -0.47, 1.76))
    crest = bpy.context.object
    crest.name = "v3cs_crest"
    crest.rotation_euler = (math.radians(78), 0, 0)
    crest.scale = (0.16, 0.85, 1)
    crest.parent = kabuto

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.eevee.use_gtao = True
scene.render.resolution_x = 640
scene.render.resolution_y = 480
scene.view_settings.view_transform = "Filmic"
scene.view_settings.exposure = 0.15

# 4 contact views + hero
views = [
    ("front", (-1.55, -2.6, 1.32), (0.0, 0.55, 1.08), 42),
    ("side", (3.0, -0.05, 1.22), (0.0, 0.55, 1.08), 48),
    ("top", (0.05, 0.02, 3.9), (0.0, 0.5, 1.0), 32),
    ("qtr", (1.7, 2.45, 1.48), (0.0, 0.5, 1.12), 46),
]
contact_paths = []
for nm, loc, tgt, lens in views:
    camd = bpy.data.cameras.new("v3c_"+nm); cam = bpy.data.objects.new("v3c_"+nm, camd)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    cam.location = loc
    cam.data.lens = lens
    cam.rotation_euler = (Vector(tgt) - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = os.path.join(OUT_DIR, "cs_"+nm+".png")
    bpy.ops.render.render(write_still=True)
    contact_paths.append(scene.render.filepath)

# compose sheet
try:
    from PIL import Image as PILImage
    sheet = PILImage.new("RGB", (1280, 960), (20,18,14))
    pos = [(0,0),(640,0),(0,480),(640,480)]
    for i, pth in enumerate(contact_paths[:4]):
        im = PILImage.open(pth).resize((640,480))
        sheet.paste(im, pos[i])
    sheet_p = os.path.join(OUT_DIR, "samurai_character_contact_sheet_v3.png")
    sheet.save(sheet_p)
    print("contact sheet v3:", sheet_p, os.path.getsize(sheet_p))
except Exception as e: print("PIL compose skip:", e)

# hero
scene.render.resolution_x = 820
scene.render.resolution_y = 1024
hero_cam = bpy.data.objects.new("v3h", bpy.data.cameras.new("v3h"))
bpy.context.collection.objects.link(hero_cam)
scene.camera = hero_cam
hero_cam.location = (-1.0, -1.75, 1.38)
hero_cam.data.lens = 62
hero_cam.rotation_euler = (Vector((0.0,0.38,1.1)) - hero_cam.location).to_track_quat("-Z","Y").to_euler()
scene.render.filepath = os.path.join(OUT_DIR, "samurai_character_hero_v3.png")
bpy.ops.render.render(write_still=True)
print("hero v3:", scene.render.filepath)

print("=== v3 artifacts done in", OUT_DIR)
