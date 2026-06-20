# UNITY_BUILD_VERIFICATION

**Recorded:** 2026-06-20T12:45:31Z

Unity Editor batchmode completed on the local Mac Studio using Unity 2023.2.20f1.

## Build

- Command: `KawanakajimaUnityBuild.BuildMac`
- Project: `unity/kawanakajima-samurai`
- Build result: succeeded
- Exit code 0
- Output: `Builds/Mac/KawanakajimaSamurai.app`
- Bundle size: 120 MB
- Bundle executable: `Contents/MacOS/kawanakajima-samurai`

The Mac target uses `BurstAotSettings_StandaloneOSX.json` with Burst compilation disabled for this proof build. Gameplay and assets are unchanged.

## MCP

- Unity-MCP plugin: `com.ivanmurzak.unity.mcp` 0.81.1
- Local listener: `http://localhost:25666`
- `unity-mcp-cli wait-for-ready`: success
- `unity-mcp-cli status`: success
- Authenticated tool calls completed:
  - `editor-application-get-state`
  - `scene-list-opened`
  - `assets-find` for `t:Scene`

`assets-find` returned `Assets/Kawanakajima/Scenes/Kawanakajima.unity`.
