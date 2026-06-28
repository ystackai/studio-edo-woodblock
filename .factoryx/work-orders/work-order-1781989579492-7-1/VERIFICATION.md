# Verification — Kawanakajima Samurai Battlefield Playable Unity Deliverable

**Work Order:** work-order-1781989579492-7-1
**Last Updated:** 2026-06-20

## Preflight Checks

| Check | Result | Details |
|-------|--------|---------|
| Asset Foundry health | ✅ PASS | `http://factoryx-edo-woodblock-asset-foundry:18113/healthz` → 200 OK |
| Blender MCP | ✅ AVAILABLE | `/usr/bin/blender` configured |
| Unity MCP listener | ✅ PASS | `host.docker.internal:27481/mcp` initializes as gamedev-mcp-server 8.0.0.0 |
| Unity MCP tools | ✅ PASS | `tools/list` returns 38 tools; `tools/call` successfully invokes `scene-list-opened` |
| Mac-local Unity route | ✅ PASS | Worker container reaches the Unity MCP through Docker's `host.docker.internal` gateway |
| GitHub connectivity | ✅ PASS | Worker commit pushed after retry; this correction is committed on top |

## Browser Proof Verification

| Check | Result |
|-------|--------|
| WebGL context | ✅ Created |
| Asset loads (20 samurai) | ✅ No 404s, no console errors |
| First viewport non-blank | ✅ Canvas shows scene |
| Orbit controls | ✅ Mouse drag works |
| Zoom (mouse wheel) | ✅ Functional |
| Keyboard shortcuts (1-6, A, C, R, X, P, F) | ✅ Functional |
| Camera presets (6 views) | ✅ Overview, Red Close, Blue Close, Side, Top, Inspect |
| Charge/reform animation | ✅ LERP animation plays |
| Audio loop toggle | ✅ Toggles battlefield ambient |
| Clash SFX | ✅ Plays on button click |
| Click-to-inspect samurai | ✅ Faction info panel |
| Canvas pixel variance | ✅ Confirmed non-blank |
| verify.js | ✅ All structure/asset/size checks pass |

## Unity Proof

| Check | Result |
|-------|--------|
| Unity project opens | ✅ `unity/kawanakajima-samurai/` |
| Scene file present | ✅ `Assets/Kawanakajima/Scenes/Kawanakajima.unity` |
| Bootstrap script | ✅ `KawanakajimaRuntimeBootstrap.cs` (758 lines) |
| Build hooks | ✅ `KawanakajimaUnityBuild.cs` (WebGL, Linux, Mac) |
| glTFast package | ✅ Declared in `Packages/manifest.json` |
| Streaming assets | ✅ samurai_character.glb (1.23 MB), samurai_battlefield_pack.glb (6.55 MB) |
| Audio assets | ✅ 5 WAV files in StreamingAssets/Resources |
| Mac build (v8.4) | ✅ `Builds/Mac/KawanakajimaSamurai.app` (112 MB, exit 0) |
| Unity scene via MCP | ✅ `scene-list-opened` returned `Kawanakajima`, `RootCount=73`, `IsLoaded=true`, `IsDirty=false` |

## Visual Review

| View | Status | Notes |
|------|--------|-------|
| Wide overview (overview.png) | ✅ PASS | Two formations visible, trees/terrain present, readable scene |
| Takeda close (redClose.png) | ✅ PASS | Helmet, armor, red banner, katana visible |
| Uesugi close (blueClose.png) | ✅ PASS | Helmet, armor, blue banner, katana visible |
| Side profile (sideProfile.png) | ✅ PASS | Formation depth, silhouette readable |
| Top formation (topFormation.png) | ✅ PASS | Clear red/blue faction grouping |
| Asset inspect (assetInspect.png) | ✅ PASS | Single samurai at readable size |
| Unity MCP wide formation | ✅ PASS | Unity Editor capture, same formation |
| Unity MCP hero 3Q | ✅ PASS | Three-quarter hero view |
| Foundry contact sheet | ✅ PASS | Multi-angle samurai views, v5 anatomy |
| Foundry hero render | ✅ PASS | Hero asset detail |

### Visual Gate Checklist
- [x] First viewport shows non-blank 3D scene
- [x] Camera frames the playable subject
- [x] 20 samurai loaded (10 Takeda, 10 Uesugi)
- [x] Close readable screenshot shows samurai silhouettes at readable size
- [x] No toy/capsule anatomy, disk faces, paddle feet, untextured primitives, or Minecraft silhouettes
- [x] Proper scale — samurai read as distinct figures, not tiny blocks/dots

## Integration Notes

1. **Correct MCP call shape:** The initial worker run called Unity tool names directly as JSON-RPC methods, which produced method errors. The verified protocol is `tools/call` with the Unity tool name in `params.name`.
2. **Active route:** The current Mac-local Unity route is `http://host.docker.internal:27481/mcp`; the old `172.21.0.1:25666` bridge is historical and not used by this deployment.
3. **Merge gate:** PR #168 is open and mergeable with green checks, but GitHub branch protection requires one approving review before merge.
4. **No Unity Editor in worker image:** Unity Editor work is performed on the Mac-local listener, while the worker container handles repository, Asset Foundry, and browser verification.

## Evidence Files

- Browser proof: `games/kawanakajima-foundry-samurai-proof/index.html`
- Unity project: `unity/kawanakajima-samurai/`
- Screenshot gallery: `games/kawanakajima-foundry-samurai-proof/screenshots/`
- Unity build: `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app` (v8.4)
- Verification log: `/tmp/kawanakajima-batch-build.log` (v8.4)
