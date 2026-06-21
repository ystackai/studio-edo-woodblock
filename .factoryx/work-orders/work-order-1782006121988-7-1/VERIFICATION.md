# Verification — Unity WebGL/Mac Build Attempt

**Work Order:** work-order-1782006121988-7-1  
**Date:** 2026-06-21T02:00–02:15 UTC  
**Status:** BLOCKED — Unity MCP listener unreachable

## MCP Listener Probes

### Probe 1: `http://host.docker.internal:27481/mcp`
- **Initial probe (02:09 UTC):** HTTP 200, server = `gamedev-mcp-server` v8.0.0.0
  - Initialized session successfully (got `Mcp-Session-Id`)
  - `tools/list` returned empty tools array: `{"result":{"tools":[]}}`
  - No Unity-specific tools available (`scene-list-opened`, `script-execute`, etc. not registered)
  - This means the Unity Editor is either not running or the MCP plugin (`com.ivanmurzak.unity.mcp`) is not loaded
- **Final probe (02:15 UTC):** HTTP 000 (connection refused) — server completely unreachable

### Probe 2: `http://172.21.0.1:25666`
- **Initial probe:** HTTP 000 (connection refused) — was never reachable from this container
- **Final probe:** HTTP 000 (connection refused) — still unreachable

## Why Unity tools weren't available

The MCP server at `host.docker.internal:27481` is the generic `gamedev-mcp-server` C# SDK (v8.0.0.0). Unity-specific tools (like `scene-list-opened`, `script-execute`, `build-webgl`, `build-mac`) are registered by the `com.ivanmurzak.unity.mcp` package **inside** the Unity Editor. Since:

1. No Unity tools were registered by the MCP server (empty tools list)
2. The server later became completely unreachable (connection refused)

…this indicates the Unity Editor on the Mac Studio is **not running** with the Kawanakajima project loaded. The MCP plugin cannot register tools without an active Unity project.

## Previous Successful Builds (for reference)

From `UNITY_LOCAL_STATUS.md` and `UNITY_BUILD_VERIFICATION.md` (both dated 2026-06-20):
- Mac Studio with Unity 2023.2.20f1 was previously able to:
  - Open the Kawanakajima project
  - Run `KawanakajimaUnityBuild.CreateOrRefreshScene`
  - Build to `Builds/Mac/KawanakajimaSamurai.app` (112 MB)
  - Register 38 MCP tools via `com.ivanmurzak.unity.mcp` v0.81.1
  - Execute `editor-application-get-state`, `scene-list-opened`, `assets-find` successfully

The current worker cannot reproduce these because the Mac listener is not available.

## Conclusion

**The Unity build cannot be completed in this runtime.** The Mac-host MCP listener is unreachable. The branch already contains:
- A complete Unity source handoff (`unity/kawanakajima-samurai/`)
- Runtime bootstrap script (546 lines) with all scene elements created procedurally
- Build hooks script (81 lines) with `BuildWebGL` and `BuildMac` menu items
- All GLB and WAV assets in StreamingAssets

**Remediation:** The Mac Studio must have the Unity Editor running with the Kawanakajima project open and the MCP plugin loaded. Then re-run this work order from a worker with network access to that Mac.

See also `UNITY_BLOCKER.md` for detailed remediation steps.
