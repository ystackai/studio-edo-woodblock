# UNITY_BUILD_VERIFICATION

**Recorded:** 2026-06-20T15:27:40Z

Unity Editor batchmode completed on the local Mac Studio using Unity 2023.2.20f1.

## Build

- Command: `KawanakajimaUnityBuild.BuildMac`
- Project: `unity/kawanakajima-samurai`
- Build result: succeeded
- Exit code 0
- Output: `Builds/Mac/KawanakajimaSamurai.app`
- Bundle size: 112 MB
- Bundle executable: `Contents/MacOS/KawanakajimaSamurai`
- Log: `/tmp/kawanakajima-batch-build.log`

The Mac target uses `BurstAotSettings_StandaloneOSX.json` with Burst compilation disabled for this proof build. Gameplay and assets are unchanged.

## MCP

- Unity-MCP plugin: `com.ivanmurzak.unity.mcp` 0.81.1
- Local listener: `http://localhost:27481/mcp`
- Worker routed listener: `http://host.docker.internal:27481/mcp`
- Worker preflight: success
- MCP protocol discovery: success, 38 tools reported
- Standard MCP JSON-RPC `tools/call` completed:
  - `scene-list-opened`

`scene-list-opened` returned `Assets/Kawanakajima/Scenes/Kawanakajima.unity`, `RootCount=73`, `IsLoaded=true`, and `IsDirty=false`.
