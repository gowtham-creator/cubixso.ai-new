# Blender pipeline — Cubixso 3D cube

End-to-end workflow for authoring the brand cube in Blender and shipping
it as an optimized `.glb` to the website's R3F scene.

## 1 · Generate the base model in Blender

```
Open Blender 4.x
→ Scripting workspace
→ Open Text Block → blender/cubixso_cube.py
→ Run Script (▶)
```

Result: a "Cubixso_Cube" empty containing the cage edges, the Y stem
extrusion, an emissive core sphere, and a baked idle-rotation action.

## 2 · Iterate visually

In the Blender UI:

- Tweak the **emissive material** strength on `Cubixso_Y_Material` /
  `Cubixso_Core_Material` (Material Properties tab).
- Adjust **cage thickness** by editing `EDGE_THICKNESS` in the script and
  re-running (the script clears + rebuilds the scene each time).
- Add **camera + HDRI** if you want a marketing render; the site doesn't
  use these (R3F lights override them) but they help you preview.

If you have **Blender MCP** connected via Claude Desktop, ask it to:
- "scale the Y core 1.2× and re-export"
- "rotate the cage 12° around X for the marketing shot"
- "increase emission strength to 4.0"

## 3 · Export to glTF

```
File → Export → glTF 2.0
  Format            glTF Binary (.glb)
  Include           Selected Objects ✓   Custom Properties ✓
  Transform         +Y Up ✓
  Geometry          Apply Modifiers ✓     UVs ✓     Normals ✓     Tangents ✓
  Animation         Animations ✓          Limit to Playback Range ✓
  Compression       (leave off — we run Draco in step 4)
```

Save as: `/Users/gowthamreddy/cubixso/public/models/cubixso-cube.glb`

## 4 · Optimize with Draco

From the project root:

```bash
node scripts/optimize-glb.mjs public/models/cubixso-cube.glb public/models/cubixso-cube.glb
```

Typical savings: 50–70% file size.

## 5 · Use in the site

Open `src/components/scene/CubeScene.tsx` and swap:

```diff
-<Cube themeIsDark={isDark} />
+<CubeGLB themeIsDark={isDark} />
```

The state machine (hinged faces, particle overlays, scroll-driven
fragmentation) keeps working because both Cube and CubeGLB use the same
`useScrollProgress` hook and live inside the same group.

## Common knobs

| Property                   | Where                                          |
|----------------------------|------------------------------------------------|
| Cube size                  | `CUBE_HALF` in `cubixso_cube.py`               |
| Edge bar thickness         | `EDGE_THICKNESS` in `cubixso_cube.py`          |
| Y extrude depth            | `Y_DEPTH` in `cubixso_cube.py`                 |
| Y bevel softness           | `Y_BEVEL` in `cubixso_cube.py`                 |
| Brand color                | `ACCENT_HEX` in `cubixso_cube.py`              |
| Emissive glow              | `ACCENT_GLOW_HEX` in `cubixso_cube.py`         |
| Theme tint on cage         | `CubeGLB.tsx` useEffect → material.color       |
| Idle rotation speed        | `CubeGLB.tsx` useFrame → `delta * 0.22`        |
