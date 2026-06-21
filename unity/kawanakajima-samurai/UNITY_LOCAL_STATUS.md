# UNITY_LOCAL_STATUS

**Recorded:** 2026-06-20

The Kawanakajima Samurai Unity project now opens and builds on the local Mac Studio with Unity 2023.2.20f1.

## Local Editor

- Editor binary: `/Users/marcus/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity`
- `Unity -version`: `2023.2.20f1`
- Scene generation: `KawanakajimaUnityBuild.CreateOrRefreshScene`
- Scene path: `Assets/Kawanakajima/Scenes/Kawanakajima.unity`

## Local Build

- Batch method: `KawanakajimaUnityBuild.BuildMac`
- Output: `Builds/Mac/KawanakajimaSamurai.app`
- Size: 112 MB
- Last verified: 2026-06-20T15:27:40Z
- Verification: `UNITY_BUILD_VERIFICATION.md`

## Local MCP

- CLI/server tools installed under `/Users/marcus/codex-work/local-unity-tools`
- Unity project package: `com.ivanmurzak.unity.mcp` 0.81.1
- Listener URL: `http://localhost:27481/mcp` (Mac host)
- Worker routed URL: `http://host.docker.internal:27481/mcp`
- Worker preflight: passed via JSON-RPC `initialize`, `tools/list`, and `tools/call`
- MCP tool calls were verified against the running editor. `scene-list-opened` returned loaded scene `Kawanakajima`, `RootCount=73`, `IsLoaded=true`, `IsDirty=false`.

Remote worker capacity notes from the earlier Hetzner attempt remain in the work-order history.
