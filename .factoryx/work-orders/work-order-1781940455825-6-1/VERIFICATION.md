# VERIFICATION - work-order-1781940455825-6-1

**Recorded:** 2026-06-20T12:45:31Z

## Result

The Samurai Unity handoff now has a real local Mac build and a live Unity-MCP listener on this machine.

## Unity Editor

- Local machine: Mac Studio, Apple Silicon, 256 GB RAM
- Unity Editor: 2023.2.20f1
- Editor path: `/Users/marcus/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity`
- Project: `unity/kawanakajima-samurai`
- Scene generation: `KawanakajimaUnityBuild.CreateOrRefreshScene`
- Generated scene: `Assets/Kawanakajima/Scenes/Kawanakajima.unity`

## Build Evidence

- Batch method: `KawanakajimaUnityBuild.BuildMac`
- Exit: 0
- Unity log summary: `Build Finished, Result: Success`
- Output: `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`
- Bundle size: 120 MB
- Durable gate file: `UNITY_BUILD_VERIFICATION.md`

The app bundle is ignored by the Unity project `.gitignore`, so the committed evidence is the source project, generated Unity metadata, scene, package lock, and verification files.

## MCP Evidence

- Local tool install: `/Users/marcus/codex-work/local-unity-tools`
- Unity-MCP package: `com.ivanmurzak.unity.mcp` 0.81.1
- Local listener: `http://localhost:25666`
- Listener process: `gamedev-m` on TCP 25666
- `unity-mcp-cli wait-for-ready`: success
- `unity-mcp-cli status`: success

Authenticated MCP tool calls completed:

- `editor-application-get-state`
- `scene-list-opened`
- `assets-find` with `t:Scene`, returning `Assets/Kawanakajima/Scenes/Kawanakajima.unity`

## Asset Integration

- Foundry battlefield pack: 20 samurai, 10 Takeda and 10 Uesugi
- Single samurai character GLB mirrored under Unity StreamingAssets
- WAV audio mirrored under Unity Resources
- Runtime bootstrap loads GLBs via glTFast and builds the playable scene

## Notes

The earlier Hetzner worker findings remain useful history: that machine lacked capacity for this Unity job. The successful Unity path is now the local Mac Studio route documented here.
