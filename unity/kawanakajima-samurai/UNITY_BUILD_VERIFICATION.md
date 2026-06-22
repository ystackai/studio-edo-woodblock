# UNITY_BUILD_VERIFICATION

**Recorded:** 2026-06-20T15:27:40Z

Historical Unity Editor batchmode evidence from the local Mac Studio using Unity 2023.2.20f1.

This record predates the current source/asset QA pass. It is retained to show that the project has previously built on this host, but it must not be used as proof that the current PR has a fresh playable Unity build. Current status is recorded in `UNITY_CURRENT_QA_2026-06-21.md`: structural handoff passes and a managed-patched existing Mac player smoke passes with real GLBs, while a fresh Editor rebuild is blocked by local Unity license activation.

## Build

- Command: `KawanakajimaUnityBuild.BuildMac`
- Project: `unity/kawanakajima-samurai`
- Historical build result: succeeded
- Exit code 0
- Output: `Builds/Mac/KawanakajimaSamurai.app`
- Bundle size: 112 MB
- Bundle executable: `Contents/MacOS/KawanakajimaSamurai`
- Log: `/tmp/kawanakajima-batch-build.log`

The Mac target used `BurstAotSettings_StandaloneOSX.json` with Burst compilation disabled for this proof build. Current gameplay/assets have changed since this historical build; rerun `./run-local-unity-build.sh` after Unity license activation before claiming a fresh current playable build.

## MCP

- Unity-MCP plugin: `com.ivanmurzak.unity.mcp` 0.81.1
- Local listener: `http://localhost:25666`
- Worker routed listener: `http://172.21.0.1:25666`
- Worker preflight: success
- MCP protocol discovery: success, 38 tools reported
- `unity-mcp-cli wait-for-ready`: success
- `unity-mcp-cli status`: success
- Authenticated tool calls completed:
  - `editor-application-get-state`
  - `scene-list-opened`
  - `assets-find` for `t:Scene`

`assets-find` returned `Assets/Kawanakajima/Scenes/Kawanakajima.unity`.
