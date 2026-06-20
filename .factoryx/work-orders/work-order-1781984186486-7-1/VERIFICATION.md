# Verification Log — Kawanakajima Samurai Unity Playable Proof v8.6

## GLTFast Reflection Bootstrap Fix (v8.3)

**Date:** 2026-06-20  
**Status:** ✅ PASS

### Probe Results (Unity MCP script-execute)

1. **GLTFast types discovered:**
     - `GLTFast.GltfImport` — OK
     - `GLTFast.Loading.DefaultDownloadProvider` — OK
     - `GLTFast.TimeBudgetPerFrameDeferAgent` — OK
     - `GLTFast.Materials.BuiltInMaterialGenerator` — OK
     - `GLTFast.Logging.ConsoleLogger` — OK

2. **Constructor injection test:**
     - All 4 interface implementations instantiated via `Activator.CreateInstance()` — OK
     - `GltfImport` constructor invoked with concrete params — OK
     - Instance type: `GLTFast.GltfImport` — OK

3. **Scene state (Play Mode):**
     - Active scene: `Kawanakajima`
     - IsPlaying: `True`
     - Bootstrap: `OK`
     - Actors count: `20` (10 Takeda + 10 Uesugi)
     - Status: `KAWANAKAJIMA_UNITY_READY`
     - Root objects: 73

## Unity Mac Build Verification

**Date:** 2026-06-20
**Status:** PASS

The deployed FactoryX worker invoked the Mac Unity editor through Unity MCP and
called `KawanakajimaUnityBuild.BuildMac()` from `script-execute`.

Result:

- Build response: `success`
- Output path: `/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`
- Console build logs: `Kawanakajima Unity build succeeded`
- Unity console errors during build: `0`

## Unity Mesh Retention Verification (v8.5)

**Date:** 2026-06-20
**Status:** PASS

The first Unity handoff proof reported 20 actors, but a later mesh probe showed
that the instantiated `MeshFilter` components had null `sharedMesh` references.
The GLB files themselves were valid; the runtime was disposing the `GltfImport`
objects immediately after scene instantiation, which released the meshes and
materials that Unity needed to render.

`KawanakajimaRuntimeBootstrap` now retains successful GLTFast imports for the
life of the scene and disposes them in `OnDestroy()`.

### Probe Results (Unity MCP script-execute)

- Actor checked: `Takeda_Samurai_09`
- Mesh filters: `241`
- Mesh filters with non-null mesh: `241`
- Vertex count: `72,927`
- Renderer count: `241`
- Bounds: approximately `(3.59, 3.03, 4.16)`
- Status: `KAWANAKAJIMA_UNITY_READY`

### Authoritative Screenshot

| Shot | File | Description |
|------|------|-------------|
| Mesh retention proof | `screenshots/unity_mesh_retention_v8.5.png` | Deterministic camera render showing actual retained samurai body geometry, armor plates, banners, and weapons in Unity |

## Camera Angle Suite (v8.5)

**Date:** 2026-06-20  
**Status:** PASS

Additional camera-angle screenshots captured via Unity MCP `script-execute` + `screenshot-scene-view`:

| Shot | File | Description |
|------|------|-------------|
| Hero Three-Quarter | `screenshots/unity_hero_three_quarter_v8.5.png` | Dramatic shoulder-angle close-up, red Takeda samurai off-center (rule of thirds) |
| Takeda Close | `screenshots/unity_takeda_close_v8.5.png` | Red samurai close inspection — helmet, armor, katana clearly visible |
| Uesugi Close | `screenshots/unity_uesugi_close_v8.5.png` | Blue samurai close inspection — faction color distinct from red |
| Rear View | `screenshots/unity_rear_view_v8.5.png` | Both armies from behind, sashimono banners visible, hills and mist in background |

### Quality Gate — v8.5

- Hero three-quarter view frames the samurai off-center with readable silhouette, helmet, armor, and weapon
- Takeda close: helmet crest, lamellar armor, katana/saya, and red faction color all clearly visible
- Uesugi close: blue faction armor distinct; samurai body, helmet, and weapons identifiable
- Rear view: both armies visible with sashimono banners, battlefield depth with hills and trees
- All samurai read as detailed characters, not primitive shapes
- No blank canvas, no off-camera scenes, no unidentifiable silhouettes

## Browser Proof Polish (v8.6)

**Date:** 2026-06-20  
**Status:** PASS

Browser proof improvements:

| Feature | Detail |
|---------|--------|
| Shadows | PCFSoft shadow maps (2K key, 1K rim) |
| Tone mapping | ACES Filmic (exposure 1.15) for cinematic HDR |
| Camera | Smooth cubic easing transitions between presets |
| Depth | Distant fog gradient plane for paper-ink aesthetic |
| Vignette | CSS radial gradient for cinematic framing |
| Actor animation | Breathing oscillation + body sway + banner wind flutter (two-frequency) |
| Charge dynamics | Increased distance (4.5), wider spread, faster lean (600ms) |

### Browser Proof Verification

```
GLB size: 1.23 MB
Contact size: 1150 KB
Audio loop size: 2.53 MB
Battlefield pack size: 6.55 MB
BASIC STRUCTURE + ASSET CHECKS: PASS
```

## Unity MCP v8.6 Camera Angle Suite

**Date:** 2026-06-20  
**Status:** PASS

New camera-angle screenshots captured via Unity MCP `screenshot-camera`:

| Shot | File | Description |
|------|------|-------------|
| Wide Formation | `screenshots/v86_wide_formation.png` | Full battlefield, 10 red vs 10 blue with hills and pine trees |
| Takeda Close | `screenshots/v86_takeda_close.png` | Red samurai detail — helmet, armor, katana clearly visible |
| Uesugi Close | `screenshots/v86_uesugi_close.png` | Blue samurai detail — faction color distinct, armor visible |
| Hero Three-Quarter | `screenshots/v86_hero_3q.png` | Dramatic shoulder-angle, red samurai off-center |
| Final Scene | `screenshots/v86_final.png` | Full scene with KAWANAKAJIMA_UNITY_READY UI |

### Quality Gate — v8.6

- All samurai read as detailed characters with proper silhouette, helmet, armor, weapons
- Red Takeda / Blue Uesugi faction distinction clear in all angles
- Wide formation shows complete battlefield with terrain, hills, pine trees, field stones
- Close-ups show helmet crest (kabuto), lamellar armor (do), katana/saya, sashimono banner
- No blank canvas, no primitive shapes, no unidentifiable silhouettes
- Camera angles include wide, close, three-quarter, hero — coverage is comprehensive

## Complete Screenshot Inventory

| Shot | File | Quality |
|------|------|---------|
| Wide Formation (v8.6) | `screenshots/v86_wide_formation.png` | Full battlefield, 20 samurai |
| Takeda Close (v8.6) | `screenshots/v86_takeda_close.png` | Red samurai detail |
| Uesugi Close (v8.6) | `screenshots/v86_uesugi_close.png` | Blue samurai detail |
| Hero 3Q (v8.6) | `screenshots/v86_hero_3q.png` | Dramatic shoulder angle |
| Final Scene (v8.6) | `screenshots/v86_final.png` | Full scene with UI |
| Mesh Retention Proof | `screenshots/unity_mesh_retention_v8.5.png` | Functional proof of mesh retention |
| Overview | `screenshots/unity_verify_v8.3.png` | Full scene, 20 samurai |
| Close (Red) | `screenshots/unity_red_close_v8.3.png` | Red Takeda samurai |
| Wide Formation | `screenshots/unity_wide_formation_v8.3.png` | Full battlefield |
| Side Profile | `screenshots/unity_side_v8.4.png` | Side view |
| Top Down | `screenshots/unity_top_v8.4.png` | Tactical top-down |
| Blue Close | `screenshots/unity_blue_close_v8.4.png` | Blue Uesugi |
| Build Verify | `screenshots/unity_build_verify_v8.4.png` | Post-build check |
| Final | `screenshots/unity_final_v8.4.png` | Hero shot |
| Hero 3Q | `screenshots/unity_hero_three_quarter_v8.5.png` | Dramatic hero angle |
| Takeda Close | `screenshots/unity_takeda_close_v8.5.png` | Red samurai detail |
| Uesugi Close | `screenshots/unity_uesugi_close_v8.5.png` | Blue samurai detail |
| Rear View | `screenshots/unity_rear_view_v8.5.png` | Both armies from behind |

## Final Status

- **Branch:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`
- **PR:** #167 (open, mergeable, targeting main)
- **Unity MCP:** reachable at `http://172.21.0.1:25666` — all probes pass
- **Scene state:** Kawanakajima, Play Mode, 20 actors loaded, status `KAWANAKAJIMA_UNITY_READY`
- **Mesh state:** Sample actor has 241/241 non-null meshes and 72,927 vertices
- **Screenshots:** 18 Unity proof images; v8.6 wide/takeda/uesugi/hero/final are latest
- **Build:** Mac app build succeeded through Unity MCP at `Builds/Mac/KawanakajimaSamurai.app` (112 MB)
- **Browser proof:** v8.6 polished with shadows, tone mapping, smooth camera, fog, vignette, animation
- **Asset integration:** Foundry samurai GLB (1.23 MB) and battlefield pack GLB (6.55 MB) loaded and instantiated
- **Quality gate:** All samurai read as detailed characters with readable silhouette, helmet, armor, weapons, and faction coloring
