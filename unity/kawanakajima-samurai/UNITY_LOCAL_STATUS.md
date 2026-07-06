# UNITY_LOCAL_STATUS

**Recorded:** 2026-06-22

Current local Unity/MCP status for the Kawanakajima Samurai project. Current QA is recorded in `UNITY_CURRENT_QA_2026-06-21.md`.

## Local Editor

- Editor binary: `/Users/marcus/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity`
- `Unity -version`: `2023.2.20f1`
- Scene generation: `KawanakajimaUnityBuild.CreateOrRefreshScene`
- Scene path: `Assets/Kawanakajima/Scenes/Kawanakajima.unity`

## Current Local Build

- Batch method: `KawanakajimaUnityBuild.BuildMac`
- Output: `Builds/Mac/KawanakajimaSamurai.app`
- Size: 111 MB
- Last verified: 2026-06-22T18:06:00Z
- Verification: `UNITY_BUILD_VERIFICATION.md`

`run-local-unity-build.sh` now passes on this Mac. The freshly built player also passes `smoke-built-player.sh` with the real samurai GLB, real battlefield pack GLB, and file-backed audio.

## Local MCP

- CLI/server tools installed under `/Users/marcus/codex-work/local-unity-tools`
- Unity project package: `com.ivanmurzak.unity.mcp` 0.81.1
- Listener URL: `http://localhost:25666`
- Worker routed URL: `http://172.21.0.1:25666`
- Worker preflight: passed
- MCP tool calls were verified against the running editor.

## Current MCP Recheck - 2026-06-22

`check-unity-mcp.sh --open` now launches the Editor and reaches:

```text
UNITY_MCP_READY url=http://localhost:27482
```

The script still warns when it sees a transient `-batchmode -quit` process because that process is not an interactive MCP-capable Editor session.

Remote worker capacity notes from the earlier Hetzner attempt remain in the work-order history.
