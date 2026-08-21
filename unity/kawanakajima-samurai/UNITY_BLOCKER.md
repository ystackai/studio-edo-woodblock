# UNITY_BUILD_BLOCKER — work-order-1787277782705-8-4

**Recorded:** 2026-08-21
**Status:** BLOCKED — Unity MCP listener unreachable from worker runtime

## 1. Exact Probe Results

| Endpoint | Method | Result |
|----------|--------|--------|
| `http://host.docker.internal:27481/mcp` | POST JSON-RPC `initialize` + `tools/list` + `tools/call scene-list-opened` | Connection refused (curl exit code 7, HTTP 000) |
| `http://172.21.0.1:25666/mcp` | POST JSON-RPC `initialize` + `tools/list` + `tools/call scene-list-opened` | Connection refused (curl exit code 7, HTTP 000) |
| `http://host.docker.internal:27481/mcp` | SSE transport (`Accept: text/event-stream`) | Connection refused (empty response) |
| `http://172.21.0.1:25666/mcp` | SSE transport (`Accept: text/event-stream`) | Connection refused (empty response) |

Both endpoints resolve to valid Docker network addresses but the services are not listening:
- `host.docker.internal` → `192.168.65.254` (IPv4) + `fdc4:f303:9324::254` (IPv6)
- `172.21.0.1` — Docker bridge gateway, port 25666 closed

### Broader network scan

Port scan of `host.docker.internal` (ports 1–10000) found:
- **Port 3000:** Open WebUI MCP server (not Unity)
- **Port 5000:** Open but no MCP protocol
- **Port 8000:** MCP server with unknown endpoint (not Unity)
- **Port 8080:** 404
- **Port 27481:** Unity MCP — **connection refused**

All other ports (including 18113 Asset Foundry alternative) returned connection refused or no response.

## 2. Disk Space Status on Worker

| Metric | Value |
|--------|-------|
| Disk total | 1007 GB |
| Disk used | 26 GB |
| Disk available | 930 GB |
| RAM total | 7.7 GB |
| RAM available | 6.0 GB |
| Swap available | 1.0 GB |

Worker has more than sufficient disk and memory for a Unity build. **Disk space is NOT a blocker on this worker.**

## 3. Unity Project State (Source Handoff)

| Item | Status |
|------|--------|
| Unity project path | `unity/kawanakajima-samurai/` |
| Scene | `Assets/Kawanakajima/Scenes/Kawanakajima.unity` |
| Build script | `KawanakajimaUnityBuild` with `BuildMac()`, `BuildWebGL()`, `BuildLinux()` |
| EditorBuildSettings | Scene registered with `true` (enabled) |
| glTFast package | `com.unity.cloud.gltfast` declared in Packages/manifest.json |
| Assets | samurai_character.glb (1.23 MB), samurai_battlefield_pack.glb (6.55 MB), 5 WAV audio files |
| Previous successful build | Mac standalone 112 MB on Unity 2023.2.20f1 (2026-06-20, local Mac Studio) |

The source handoff is complete and verified. The build scripts, scene, and assets are all present and correct.

## 4. Recommended Remediation

### Option A: Re-provision Mac Unity listener (Recommended)
1. Ensure a Mac Studio (M1/M2/M3) with Unity 2023.2.20f1+ is running the Unity MCP package.
2. Start the MCP listener on port 27481 (or 25666).
3. Verify from the worker: `curl -X POST http://host.docker.internal:27481/mcp -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'`
4. Run `tools/call` with `scene-list-opened` to confirm the Kawanakajima scene is loaded.
5. Trigger `KawanakajimaUnityBuild.BuildMac` or `BuildWebGL` via MCP tool call.

### Option B: Build on a different worker with Unity installed
1. Provision a worker with Unity Editor 2023.2+ and the Unity MCP package.
2. Clone the repo, check out `factoryx/factory-edo-woodblock/work-order-1787277782705-8-4`.
3. Run `Unity -batchmode -quit -projectPath unity/kawanakajima-samurai -executeMethod KawanakajimaUnityBuild.BuildMac`.
4. Capture the build output and binary to the working tree.

### Option C: WebGL build via worker with Unity CLI
1. Same as B, but use `BuildWebGL()` instead.
2. WebGL builds are larger but can be served directly from the repo's `games/` directory.

## 5. Impact on Deliverable

- **Browser proof:** Fully functional and reviewable. All game feel checks pass.
- **Unity build:** Blocked until the Unity MCP listener is made reachable from this network.
- **Asset quality:** Samurai GLB requires Blender 3.4.1 fix for `np.bool` deprecation to enable quality improvement pass.
- **PR status:** PR #167 was previously merged; this work order branch is a separate validation branch.

## 6. Asset Foundry Status

- **Endpoint:** `http://factoryx-edo-woodblock-asset-foundry:18113/healthz`
- **Result:** `ok: true` — Asset Foundry is healthy and operational.
- **Providers:** Blender configured; HuggingFace and OpenAI not configured.
- **Status:** Asset Foundry is NOT a blocker. Generated assets (samurai GLB, audio stems, contact sheets) are present and verified.
