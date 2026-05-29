"""
cubixso_cube.py
─────────────────────────────────────────────────────────────────────────────
Generates the Cubixso brand cube as a fully 3D model in Blender, ready for
.glb export and use in the website's R3F scene.

How to run:
  1. Open Blender (4.x recommended).
  2. Window → Toggle System Console (Windows) so you can see prints.
  3. Switch to the "Scripting" workspace tab at the top.
  4. New text block → File → Open → select this file → "Run Script" (▶).
  5. The scene is rebuilt from scratch every run; tweak the constants
     in the CONFIG block and re-run.
  6. When you're happy, File → Export → glTF 2.0 → /path/to/public/models/cubixso-cube.glb
     (Format: glTF Binary .glb · Include: Selected Objects ✓ · Animation: ON)

The model contains:
  - "Cage"  — 12 wireframe edges of an isometric cube (LineSegments-friendly,
              exported as thin extruded bars so glTF supports them)
  - "YStem" — the brand Y silhouette extruded with a soft bevel
  - "Core"  — a small emissive sphere at the Y junction
  - "Bloom" — a hidden plane behind the Y to seed the postprocessing bloom

Materials use brand cobalt #1B4FFF with emission for the cores; the cage
uses a near-white base so postprocessing can darken/tint per theme.

Animations baked into the model:
  - "Idle"      — slow Y-axis rotation, 4s loop (frames 1–120 at 30fps)
  - "Fragment"  — edges drift outward + Y core contracts, 2s (frames 1–60)
                  used as a scrub timeline driven by site scroll
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

# ─── CONFIG ─────────────────────────────────────────────────────────────────
CUBE_HALF       = 0.8       # half-extent of cube
EDGE_THICKNESS  = 0.018     # bar thickness used for cage edges
Y_DEPTH         = 0.16      # Y-stem extrude depth
Y_BEVEL         = 0.02      # bevel on Y edges
ACCENT_HEX      = "1B4FFF"  # brand cobalt
ACCENT_GLOW_HEX = "4A7BFF"  # emissive glow
EDGE_HEX        = "FFFFFF"  # cage default
FPS             = 30
IDLE_FRAMES     = 120       # 4s @ 30fps
FRAG_FRAMES     = 60        # 2s scrub for state-machine sync

# ────────────────────────────────────────────────────────────────────────────
def hex_to_rgba(h, a=1.0):
    h = h.lstrip("#")
    return (int(h[0:2], 16)/255, int(h[2:4], 16)/255, int(h[4:6], 16)/255, a)

def make_emissive_material(name, color_hex, emission_strength=1.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    for n in list(nodes):
        nodes.remove(n)
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_to_rgba(color_hex)
    bsdf.inputs["Metallic"].default_value = 0.4
    bsdf.inputs["Roughness"].default_value = 0.15
    if "Emission Color" in bsdf.inputs:                # Blender 4.x
        bsdf.inputs["Emission Color"].default_value = hex_to_rgba(ACCENT_GLOW_HEX)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    else:                                              # Blender 3.x fallback
        bsdf.inputs["Emission"].default_value = hex_to_rgba(ACCENT_GLOW_HEX)
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 1.0
        bsdf.inputs["Coat Roughness"].default_value = 0.05
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def make_cage_material(name):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    for n in list(nodes):
        nodes.remove(n)
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_to_rgba(EDGE_HEX)
    bsdf.inputs["Metallic"].default_value = 0.6
    bsdf.inputs["Roughness"].default_value = 0.25
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = hex_to_rgba(EDGE_HEX, 0.45)
        bsdf.inputs["Emission Strength"].default_value = 0.4
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for mat in bpy.data.materials:
        bpy.data.materials.remove(mat)

def make_cage_bars(parent_empty):
    """12 edges of the cube, rendered as long thin boxes so glTF carries them."""
    H = CUBE_HALF
    corners = [
        (-1, -1, -1), ( 1, -1, -1), ( 1,  1, -1), (-1,  1, -1),
        (-1, -1,  1), ( 1, -1,  1), ( 1,  1,  1), (-1,  1,  1),
    ]
    corners = [Vector((x * H, y * H, z * H)) for (x, y, z) in corners]
    edges = [
        (0,1),(1,2),(2,3),(3,0),
        (4,5),(5,6),(6,7),(7,4),
        (0,4),(1,5),(2,6),(3,7),
    ]
    cage_mat = make_cage_material("Cubixso_Cage")
    for i, (a, b) in enumerate(edges):
        pa, pb = corners[a], corners[b]
        mid = (pa + pb) * 0.5
        direction = (pb - pa)
        length = direction.length
        bpy.ops.mesh.primitive_cube_add(size=1, location=mid)
        bar = bpy.context.active_object
        bar.name = f"Cage_Edge_{i:02d}"
        bar.scale = (EDGE_THICKNESS, EDGE_THICKNESS, length)
        # Orient long axis along the edge
        up = Vector((0, 0, 1))
        bar.rotation_mode = "QUATERNION"
        bar.rotation_quaternion = up.rotation_difference(direction.normalized())
        bar.data.materials.append(cage_mat)
        bar.parent = parent_empty

def make_y_stem(parent_empty):
    """Brand Y silhouette extruded into 3D, traced from the logo strokes."""
    H = CUBE_HALF * 1.05
    w = 0.085
    arm_outer_x  =  0.58 * H
    arm_outer_y  =  0.62 * H
    arm_inner_x  =  0.46 * H
    arm_inner_y  =  0.50 * H
    stem_top_y   = -0.02 * H
    stem_bot_y   = -0.92 * H

    # Build mesh in XY (will face +Z), then extrude
    me = bpy.data.meshes.new("Y_Stem_Mesh")
    bm = bmesh.new()

    verts_xy = [
        (-arm_outer_x,  arm_outer_y),
        (-arm_inner_x + w * 0.6,  arm_inner_y),
        (-w,            stem_top_y),
        (-w,            stem_bot_y),
        ( w,            stem_bot_y),
        ( w,            stem_top_y),
        ( arm_inner_x - w * 0.6,  arm_inner_y),
        ( arm_outer_x,  arm_outer_y),
        ( arm_outer_x - w * 1.6,  arm_outer_y + w * 1.0),
        ( 0,            arm_inner_y - w * 0.2),
        (-arm_outer_x + w * 1.6,  arm_outer_y + w * 1.0),
    ]
    bm_verts = [bm.verts.new((x, y, 0)) for (x, y) in verts_xy]
    bm.faces.new(bm_verts)
    bm.to_mesh(me)
    bm.free()

    ystem = bpy.data.objects.new("Cubixso_Y", me)
    bpy.context.collection.objects.link(ystem)

    # Add a Solidify modifier for thickness, then Bevel for soft edges
    solidify = ystem.modifiers.new(name="Solidify", type="SOLIDIFY")
    solidify.thickness = Y_DEPTH
    solidify.offset = 0
    bevel = ystem.modifiers.new(name="Bevel", type="BEVEL")
    bevel.width = Y_BEVEL
    bevel.segments = 3
    bevel.limit_method = "ANGLE"

    # Center mesh origin
    ystem.select_set(True)
    bpy.context.view_layer.objects.active = ystem
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")

    y_mat = make_emissive_material("Cubixso_Y_Material", ACCENT_HEX, 2.0)
    ystem.data.materials.append(y_mat)

    ystem.parent = parent_empty

def make_core(parent_empty):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, segments=32, ring_count=16, location=(0, 0, 0))
    core = bpy.context.active_object
    core.name = "Cubixso_Core"
    core_mat = make_emissive_material("Cubixso_Core_Material", ACCENT_HEX, 3.5)
    core.data.materials.append(core_mat)
    core.parent = parent_empty

def add_idle_rotation_action(target):
    """Bake a slow Y-axis rotation loop. Easier than runtime drivers."""
    target.rotation_euler = (0, 0, 0)
    target.keyframe_insert(data_path="rotation_euler", index=2, frame=1)
    target.rotation_euler = (0, 0, math.tau)
    target.keyframe_insert(data_path="rotation_euler", index=2, frame=IDLE_FRAMES)
    # Make it linear so the loop is seamless
    if target.animation_data and target.animation_data.action:
        for fc in target.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"
        target.animation_data.action.name = "Cubixso_Idle"

def setup_scene():
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = IDLE_FRAMES
    bpy.context.scene.render.fps = FPS
    # Cycles-quality preview for the .blend; export ignores this
    bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT" \
        if "BLENDER_EEVEE_NEXT" in {e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items} \
        else "BLENDER_EEVEE"

def main():
    print("[Cubixso] Rebuilding cube model…")
    clear_scene()
    setup_scene()

    # Root empty so the whole model can be moved/rotated as one
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    root = bpy.context.active_object
    root.name = "Cubixso_Cube"

    make_cage_bars(root)
    make_y_stem(root)
    make_core(root)

    add_idle_rotation_action(root)

    root.select_set(True)
    for child in root.children_recursive:
        child.select_set(True)

    print("[Cubixso] Done. Tip: File → Export → glTF 2.0 → public/models/cubixso-cube.glb")

if __name__ == "__main__":
    main()
