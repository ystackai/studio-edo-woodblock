# UNITY_BLOCKER — Kawanakajima Build Blocked

**Date:** 2026-06-21  
**Work Order:** work-order-1782006121988-7-1

## Blocker

The Unity MCP listener on the Mac Studio is unreachable. Both probe URLs return connection refused or empty tool lists:
- `http://host.docker.internal:27481/mcp` — was briefly reachable (HTTP 200) but returned empty tools list, then went completely offline
- `http://172.21.0.1:25666` — never reachable from this worker runtime

## Root Cause

The MCP server (`gamedev-mcp-server` v8.0.0.0) has no Unity tools registered. The Unity-specific tools (`scene-list-opened`, `script-execute`, `build-webgl`, `build-mac`, etc.) are provided by the `com.ivanmurzak.unity.mcp` plugin which runs **inside** the Unity Editor. Without the Editor running with a project open, no tools are registered.

## Disk Space (Worker)

```
Filesystem     Size  Used  Avail  Capacity  Mounted on
/dev/root      100G   45G     55G     45%   /
```
Sufficient space for Unity build (~112 MB Mac .app or ~50 MB WebGL).

## Recommended Remediation

1. **Primary path:** Have the Mac Studio operator start Unity 2023.2.20f1 with the Kawanakajima project open at:
   `/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai`
   
   Verify the MCP plugin loads by checking that `tools/list` returns ~38 Unity tools.

2. **Alternative path:** Provision a Linux/Windows worker with Unity 2023.2.20f1 installed, check out this branch, and run the build directly:
   ```bash
   # In the Unity project directory:
   # EditorBatchMode will run the build menu items
   # BuildWebGL → Builds/WebGL/KawanakajimaSamurai
   # BuildMac → Builds/Mac/KawanakajimaSamurai.app
   ```

3. **Quick verification:** After the Mac is back online, re-run:
   ```
   unity-mcp-cli status "/path/to/unity/kawanakajima-samurai"
   ```
   Then attempt the build through the MCP tools.

## Unity Project Readiness

The project is ready to build when the listener is restored:
- Scene: `Assets/Kawanakajima/Scenes/Kawanakajima.unity`
- Bootstrap: `KawanakajimaRuntimeBootstrap.cs` creates the full scene procedurally
- Build hooks: `KawanakajimaUnityBuild.cs` with `BuildWebGL` and `BuildMac` menu items
- Assets: GLB samurai models, WAV audio cues all present in StreamingAssets
- Package: `com.ivanmurzak.unity.mcp` v0.81.1 registered in Packages/manifest.json
- Previous successful build: 112 MB Mac .app (2026-06-20)
