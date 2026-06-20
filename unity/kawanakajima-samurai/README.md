# Kawanakajima Samurai Unity Handoff

This is the Unity source handoff for the Foundry Samurai proof in PR #161.

It is not a completed Unity build yet because the FactoryX worker currently has Unity CLI/MCP binaries but no installed Unity Editor and no Unity-side MCP listener. The project is structured so the next worker with a real Editor can open it, create the scene, and build without rediscovering assets.

## Contents

- `Assets/StreamingAssets/Kawanakajima/samurai_character.glb` - live Foundry Samurai asset from job `asset-1781913507610-bf69e595`.
- `Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` - live Foundry 20-samurai battlefield scene pack v3 from job `asset-1781935845583-91a9fdbe`.
- `Assets/StreamingAssets/Kawanakajima/samurai_battlefield_manifest.json` - 20 named warriors, 10 Takeda and 10 Uesugi, with positions and poses.
- `Assets/Resources/KawanakajimaAudio/*.wav` - file-backed audio from Foundry job `asset-1781916330853-f7d831d9`.
- `Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs` - runtime scene builder and playable loop.
- `Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs` - menu and batch build entrypoints.
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

Expected build outputs:

- `unity/kawanakajima-samurai/Builds/WebGL/`
- `unity/kawanakajima-samurai/Builds/Linux/KawanakajimaSamurai`

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

See `.factoryx/work-orders/work-order-1781940455825-6-1/UNITY_BLOCKER.md` for the full guarded-retry record and escalation verdict.

Until a worker with real Editor + license + listener + disk appears, treat this as a ready-to-open source project + the browser Three.js proof at `games/kawanakajima-foundry-samurai-proof/`. Do not claim a Unity deliverable.
