# Worklog — work-order-1782006121988-7-1

**Title:** Attempt Unity WebGL/Mac build via Mac MCP listener  
**Date:** 2026-06-21

## Session Log

### 02:00 UTC — Initial Setup
- Confirmed workspace branch: `factoryx/factory-edo-woodblock/work-order-1782006121988-7-1` at `f5a739d`
- Confirmed Unity project structure at `unity/kawanakajima-samurai/` with:
   - `Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs` (546 lines)
   - `Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs` (81 lines, BuildWebGL + BuildMac menu items)
   - `Assets/Kawanakajima/Scenes/Kawanakajima.unity`
   - `Packages/manifest.json` with `com.ivanmurzak.unity.mcp` v0.81.1
   - Previous build verification: 112 MB Mac .app built successfully on 2026-06-20
- `unity-mcp-cli` v0.81.1 is installed in the container at `/usr/local/bin/unity-mcp-cli`

### 02:05 UTC — MCP Listener Discovery
- Probe 1: `http://host.docker.internal:27481/mcp` → HTTP 200 (server reachable)
   - Server: `gamedev-mcp-server` v8.0.0.0 (C# SDK)
   - Initialized a session successfully
   - `tools/list` returned empty array: `{"result":{"tools":[]}}`
   - **No Unity tools registered** — Unity Editor MCP plugin not active
- Probe 2: `http://172.21.0.1:25666` → HTTP 000 (connection refused, never reachable)

### 02:09 UTC — Deep MCP Probe
- Re-initialized session with auth token (`local-factoryx-unity`)
- Session ID obtained: `FamF7TP5k5r3d8ClHtOWfw`
- `tools/list` → still empty
- `resources/list` → connection dropped (server unstable)
- `prompts/list` → connection dropped

### 02:12 UTC — Unity-MCP CLI Attempts
- `unity-mcp-cli status <project-path>` → ERROR: Project path does not exist (Mac path is not accessible from container)
- `unity-mcp-cli run-tool scene-list-opened --url ... --token ...` → project path validation error (CLI requires local project)
- Tried `bootstrap-local` → requires `--token` flag
- Tried `open` with `--url` and `--token` → not applicable (this opens Unity locally, not on remote Mac)

### 02:15 UTC — Final Probe
- `host.docker.internal:27481` → HTTP 000 (completely unreachable, server down)
- `172.21.0.1:25666` → HTTP 000 (still unreachable)
- **Conclusion: Unity MCP listener is offline on the Mac**

## Result

**BLOCKED.** Unity build cannot be produced. The Mac-host MCP listener is unreachable and returns empty tool lists when briefly available. The Unity Editor on the Mac Studio is not running with the Kawanakajima project loaded.

## What was verified
- MCP listener URL is correct (returns 200 when server is up)
- Unity project structure is complete in the workspace
- Runtime bootstrap script exists and has all necessary elements
- Build hooks script exists with WebGL and Mac build methods
- Previous successful builds confirm the pipeline works when the Mac is available

## Next steps
1. Have the Mac Studio operator start the Unity Editor with the Kawanakajima project
2. Ensure the `com.ivanmurzak.unity.mcp` plugin loads and registers its tools
3. Re-run this work order from a worker with MCP connectivity
4. Alternatively, use a different worker with Unity Editor installed locally
