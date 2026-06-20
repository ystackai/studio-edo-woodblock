# Verification Log — Kawanakajima Samurai Unity Playable Proof v8

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

### Screenshots

| Shot | File | Description |
|------|------|-------------|
| Overview | `screenshots/unity_verify_v8.3.png` | Default camera with all 20 samurai on battlefield |
| Close (Red) | `screenshots/unity_red_close_v8.3.png` | Close-up of red Takeda samurai with blue Uesugi in background |
| Wide Formation | `screenshots/unity_wide_formation_v8.3.png` | Full battlefield with terrain, trees, hills, and both formations |

### Quality Gate

- ✅ Samurai silhouettes are readable (detailed characters, not primitives)
- ✅ Helmet/helmet shapes, armor, and sashimono banners visible
- ✅ Red/blue faction distinction clear
- ✅ Battlefield terrain with ink-styled hills and pine trees
- ✅ UI shows `KAWANAKAJIMA_UNITY_READY`
- ✅ No compile errors from GLTFast reflection bootstrap

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

### What Changed

- `CreateGltfImport` in `KawanakajimaRuntimeBootstrap.cs` now discovers GLTFast's 4 required interface types via reflection and passes concrete instances to the constructor
- Fallback `BuildArgs` loop preserved for other constructors

## Camera Angle Suite (v8.5)

**Date:** 2026-06-20  
**Status:** ✅ PASS

Additional camera-angle screenshots captured via Unity MCP `script-execute` + `screenshot-scene-view`:

| Shot | File | Description |
|------|------|-------------|
| Hero Three-Quarter | `screenshots/unity_hero_three_quarter_v8.5.png` | Dramatic shoulder-angle close-up, red Takeda samurai off-center (rule of thirds) |
| Takeda Close | `screenshots/unity_takeda_close_v8.5.png` | Red samurai close inspection — helmet, armor, katana clearly visible |
| Uesugi Close | `screenshots/unity_uesugi_close_v8.5.png` | Blue samurai close inspection — faction color distinct from red |
| Rear View | `screenshots/unity_rear_view_v8.5.png` | Both armies from behind, sashimono banners visible, hills and mist in background |

### Quality Gate — v8.5

- ✅ Hero three-quarter view frames the samurai off-center with readable silhouette, helmet, armor, and weapon
- ✅ Takeda close: helmet crest, lamellar armor, katana/saya, and red faction color all clearly visible
- ✅ Uesugi close: blue faction armor distinct; samurai body, helmet, and weapons identifiable
- ✅ Rear view: both armies visible with sashimono banners, battlefield depth with hills and trees
- ✅ All samurai read as detailed characters, not primitive shapes
- ✅ No blank canvas, no off-camera scenes, no unidentifiable silhouettes

### Complete Screenshot Inventory

| Shot | File | Quality |
|------|------|---------|
| Overview | `screenshots/unity_verify_v8.3.png` | ✅ Full scene, 20 samurai, all visible |
| Close (Red) | `screenshots/unity_red_close_v8.3.png` | ✅ Red Takeda samurai close |
| Wide Formation | `screenshots/unity_wide_formation_v8.3.png` | ✅ Full battlefield with terrain |
| Side Profile | `screenshots/unity_side_v8.4.png` | ✅ Formation side view |
| Top Down | `screenshots/unity_top_v8.4.png` | ✅ Tactical top-down formation |
| Blue Close | `screenshots/unity_blue_close_v8.4.png` | ✅ Blue Uesugi samurai close |
| Build Verify | `screenshots/unity_build_verify_v8.4.png` | ✅ Post-build scene check |
| Final | `screenshots/unity_final_v8.4.png` | ✅ Blue samurai hero shot |
| Hero 3Q | `screenshots/unity_hero_three_quarter_v8.5.png` | ✅ Dramatic hero angle |
| Takeda Close | `screenshots/unity_takeda_close_v8.5.png` | ✅ Red samurai detail |
| Uesugi Close | `screenshots/unity_uesugi_close_v8.5.png` | ✅ Blue samurai detail |
| Rear View | `screenshots/unity_rear_view_v8.5.png` | ✅ Both armies from behind |
