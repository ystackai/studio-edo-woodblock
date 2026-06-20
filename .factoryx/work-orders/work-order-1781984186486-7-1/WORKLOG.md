# Worklog — Kawanakajima Samurai Unity Playable Proof v8

## Timeline

### 2026-06-20

**v8.6 — Browser proof polish + v8.6 Unity camera suite (COMPLETED)**
- **Browser proof improvements:**
     - PCFSoft shadow maps (2K key light, 1K rim light)
     - ACES Filmic tone mapping (exposure 1.15) for cinematic HDR
     - Smooth cubic easing transitions between camera presets
     - Distant fog gradient plane for depth in paper-ink aesthetic
     - CSS radial gradient vignette overlay for cinematic framing
     - Actor breathing oscillation + subtle body sway + banner wind flutter (two-frequency)
     - Charge dynamics: increased distance (4.5 vs 3.9), wider spread, faster charge lean, faster timing (600ms vs 720ms)
- **Unity MCP v8.6 camera suite:**
     - Wide formation: Full battlefield with 10 red Takeda vs 10 blue Uesugi
     - Takeda close: Red samurai detail — helmet, armor, katana clearly visible
     - Uesugi close: Blue samurai detail — faction color distinct
     - Hero three-quarter: Dramatic shoulder-angle, red samurai off-center
     - Final scene: Full scene with KAWANAKAJIMA_UNITY_READY UI
- **Visual quality:** All samurai read as detailed characters, not primitive shapes. Faction colors clear in all angles.
- **Documentation:** VERIFICATION.md, PREVIEW.md, ASSET_MANIFEST.md, WORKLOG.md updated

**v8.5 — GLTFast mesh retention fix + camera angle suite (COMPLETED)**
- **Problem:** Unity reported 20 actors loaded, but a later mesh probe showed that the instantiated `MeshFilter` components had null `sharedMesh` references.
- **Root cause:** The runtime disposed successful GLTFast `GltfImport` instances immediately after instantiation, releasing meshes/materials still referenced by the instantiated scene objects.
- **Fix:** Retain successful GLTFast imports for the life of `KawanakajimaRuntimeBootstrap` and dispose them only in `OnDestroy()`.
- **Cleanup:** Use GLTFast's non-MonoBehaviour `UninterruptedDeferAgent` in the reflected constructor path to avoid runtime warnings from directly constructing a component.
- **Verification:** Unity MCP mesh probe on `Takeda_Samurai_09` reports 241/241 non-null meshes, 72,927 vertices, 241 renderers, and visible bounds.
- **Screenshot:** `screenshots/unity_mesh_retention_v8.5.png` is the authoritative Unity render proof.
- **Build:** Mac Unity build succeeded through Unity MCP at `Builds/Mac/KawanakajimaSamurai.app`.
- **Camera angles:** 4 additional screenshots — hero 3Q, Takeda close, Uesugi close, rear view — all pass quality gate.

**v8.4 — Camera angles + build probe (COMPLETED)**
- Captured 4 additional camera angle screenshots via Unity MCP:
     - Side view: Takeda samurai in profile — helmet, armor, weapon details visible
     - Top view: Top-down tactical view showing 10v10 formations on terrain
     - Blue close-up: Uesugi samurai close-up — helmet crest, armor, sword visible
     - Build verify: Scene after build menu refresh — scene persists correctly
- All 7 screenshots pass visual quality gate
- Scene build probe via `FactoryX/Kawanakajima/Create Or Refresh Scene` — successful
- Updated documentation: VERIFICATION.md, PREVIEW.md, ASSET_MANIFEST.md, WORKLOG.md

**v8.3 — GLTFast reflection bootstrap fix (COMPLETED)**
- **Problem:** `GLTFast.GltfImport` has no parameterless constructor; previous `Activator.CreateInstance()` returned null
- **Root cause:** GltfImport requires 4 interfaces: `IDownloadProvider`, `IDeferAgent`, `IMaterialGenerator`, `ICodeLogger`
- **Fix:** `CreateGltfImport()` now discovers concrete types via reflection (`DefaultDownloadProvider`, `TimeBudgetPerFrameDeferAgent`, `BuiltInMaterialGenerator`, `ConsoleLogger`), instantiates them, and passes to constructor
- **Verification:** Unity MCP scene probe confirms 20 samurai loaded, status `KAWANAKAJIMA_UNITY_READY`
- **Screenshots:** overview, red close, wide formation — all pass quality gate
- **Build:** Mac Unity build succeeded through Unity MCP at `Builds/Mac/KawanakajimaSamurai.app`
- **Files changed:** `unity/kawanakajima-samurai/Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs`
- **Commit:** `d0cd759`

**v8.2 — CreateGltfImport initial attempt (SKIPPED during rebase)**
- Discussed approach, superseded by v8.3

**v8.1 — First GLTFast fix attempt (SKIPPED during rebase)**
- Original reflection bootstrap attempt, superseded by improved approach

**v8 — Initial reflection bootstrap**
- Removed hard `using GLTFast;` import
- Used `System.Reflection` for runtime type discovery

## Final Status

- **Branch:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`
- **PR:** #167 (open, mergeable, targeting main)
- **Unity MCP:** reachable at `http://172.21.0.1:25666` — all probes pass
- **Scene state:** Kawanakajima, Play Mode, 20 actors loaded, status `KAWANAKAJIMA_UNITY_READY`
- **Mesh state:** Sample actor has 241/241 non-null meshes and 72,927 vertices
- **Screenshots:** 18 Unity proof images; v8.6 wide/takeda/uesugi/hero/final are latest
- **Build:** Mac app build succeeded through Unity MCP at `Builds/Mac/KawanakajimaSamurai.app` (112 MB)
- **Browser proof:** v8.6 polished with shadows, tone mapping, smooth camera, fog, vignette, animation
- **Quality gate:** All samurai read as detailed characters with readable silhouette, helmet, armor, weapons, and faction coloring

**v8.8 (2026-06-20 ~21:50 UTC):** Browser JS syntax fix + Unity MCP screenshot suite
- Fixed unclosed `forEach` callback in `tick()` animation loop of `index.html` (added `});` after `renderer.render`)
- Verified bracket/paren/square-bracket balance at 0 via syntax analysis
- Captured 3 new Unity MCP screenshots via `screenshot-game-view` and `screenshot-scene-view`:
     - Wide formation (691×352) — full battlefield, 20 samurai, Unity UI overlay
     - Hero close-up — samurai helmet, armor, katana detail
     - Scene view — editor viewport with terrain, trees, waterfall
- Updated VERIFICATION.md, DELIVERABLE_STATUS.md, PREVIEW.md
- Committed and pushed to branch `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`

**v9.2 (2026-06-20 ~23:00 UTC):** Bootstrap polish + documentation update
- Bootstrap: dust particles, screen shake, UI fade, idle sway, grass/water materials, cinematic camera
- Committed and pushed to PR #167 (commit 7e3d91a)
- Documentation: VERIFICATION.md, PREVIEW.md, ASSET_MANIFEST.md updated with v9.2 MCP screenshots
- MCP verification: ping OK, 73 tools, scene loaded with 20 actors
- MCP became unavailable after play mode toggle (known risk)
- 6 v9 MCP screenshots captured: wide formation, hero 3q, red close, blue close, scene view, game view
- Final commit: c3f8600 (documentation update)
