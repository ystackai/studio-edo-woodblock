# Kawanakajima Samurai Unity Handoff

This is the Unity source handoff for the Foundry Samurai proof in PR #161.

It is not a completed Unity build yet because the FactoryX worker currently has Unity CLI/MCP binaries but no installed Unity Editor and no Unity-side MCP listener. The project is structured so the next worker with a real Editor can open it, create the scene, and build without rediscovering assets.

## Contents

- `Assets/StreamingAssets/Kawanakajima/samurai_character.glb` - live Foundry Samurai asset from job `asset-1781913507610-bf69e595`.
- `Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` - live Foundry 20-samurai battlefield scene pack v3 from job `asset-1781935845583-91a9fdbe`.
- `Assets/StreamingAssets/Kawanakajima/samurai_battlefield_manifest.json` - 20 named warriors, 10 Takeda and 10 Uesugi, with positions and poses.
- `Assets/Resources/KawanakajimaAudio/*.wav` - file-backed audio from Foundry job `asset-1781916330853-f7d831d9`.
- `Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs` - runtime scene builder and playable loop.
- `Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs` - menu and WebGL, Linux, and Mac batch build entrypoints.
- `Packages/manifest.json` - declares Unity glTFast (`com.unity.cloud.gltfast`) so the GLB can load at runtime.

Unity's glTFast package is the official Unity package for glTF/GLB loading. The package documentation says to install it by package name `com.unity.cloud.gltfast`, and its runtime docs show loading via URL/file path and instantiating the main scene from script.

## Manual Editor Path

1. Open this folder in Unity 2022.3+ or Unity 6.
2. Let Package Manager resolve `com.unity.cloud.gltfast`.
3. Run `FactoryX > Kawanakajima > Create Or Refresh Scene`.
4. Open `Assets/Kawanakajima/Scenes/Kawanakajima.unity`.
5. Press Play.

Controls:

- Mouse drag: orbit camera.
- Mouse wheel: zoom.
- `1` to `6`: repeatable cameras.
- `C`: charge.
- `R`: reform.
- `A`: toggle music.
- `X`: clash accent.
- `P`: toggle the full Foundry-authored 20-samurai battlefield pack view.

## Batch Build Commands

From a worker with a Unity Editor installed:

```bash
Unity \
  -batchmode \
  -quit \
  -projectPath unity/kawanakajima-samurai \
  -executeMethod KawanakajimaUnityBuild.BuildWebGL \
  -logFile /tmp/kawanakajima-unity-webgl.log
```

```bash
Unity \
  -batchmode \
  -quit \
  -projectPath unity/kawanakajima-samurai \
  -executeMethod KawanakajimaUnityBuild.BuildLinux \
  -logFile /tmp/kawanakajima-unity-linux.log
```

```bash
Unity \
  -batchmode \
  -quit \
  -projectPath unity/kawanakajima-samurai \
  -executeMethod KawanakajimaUnityBuild.BuildMac \
  -logFile /tmp/kawanakajima-unity-mac.log
```

Expected build outputs:

- `unity/kawanakajima-samurai/Builds/WebGL/`
- `unity/kawanakajima-samurai/Builds/Linux/KawanakajimaSamurai`
- `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`

## Current Blocker (updated for guarded retry work-order-1781940455825-6-1)

**This is a source handoff only. No playable Unity build was or can be produced in the current runtime.**

Exact preflight (re-exec 2026-06-20 ~07:50, 1.1G):
- `unity --version`: 0.1.0-beta.7 (thin CLI wrapper)
- `unity editors -i`: VersionArchDefaultPlatforms (no Editor installed)
- `unity auth status`: You are not signed in.
- `unity license`: (empty)
- `df -h /cache`: 1.1 GB free (insufficient; ~18 GB required)
- `unity-mcp-cli status unity/kawanakajima-samurai`:
  - WARN: Unity is not running with this project
  - ERROR: Not available (connection refused) @ http://localhost:23914
- Build attempt: `Error: Editor 2022.3.0f1 (x86_64) is not installed.`

Unity MCP not registered for this run. A Unity MCP server binary alone is not a listener — the Editor must be running the package and status must report reachable.

See `.factoryx/work-orders/work-order-1781940455825-6-1/UNITY_BLOCKER.md` (and new `ASSET_MANIFEST.md` there) for the full guarded-retry record, fresh preflight outputs (~07:53), and generated asset evidence.

Additional operator-side local verification on 2026-06-20T08:22:39Z:
- Unity Hub installed locally.
- A Unity 2023.2.20f1 package was expanded without sudo and the Editor binary launched in batchmode (`-version` returned `2023.2.20f1`).
- `verify-unity-handoff.js` passed.
- The WebGL build attempt failed before import/build because no Unity license/token/ULF was active.

Additional operator-side local verification on 2026-06-20T09:43:35Z:
- The same extracted Unity 2023.2.20f1 Editor binary still launches in batchmode.
- The extracted Editor payload includes MacStandaloneSupport, so `BuildMac()` was added as the locally available standalone build route.
- `CreateOrRefreshScene` still failed before import/build because no Unity license/token/ULF was active.

See `.factoryx/work-orders/work-order-1781940455825-6-1/LOCAL_UNITY_ATTEMPT.md`.

Until a worker with real Editor + license + listener + disk appears, treat this as a ready-to-open source project + the browser Three.js proof at `games/kawanakajima-foundry-samurai-proof/`. Do not claim a Unity deliverable.
