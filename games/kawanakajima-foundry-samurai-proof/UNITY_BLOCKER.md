# UNITY_BLOCKER

**Work Order:** work-order-1781940455825-6-1 (guarded Unity retry) — prior: work-order-1781920715097-7-1 (retry; canonical branch work-order-1781913967751-7-1)

Unity Editor is not available inside the worker container runtime. The Unity Editor is hosted on the Mac, and the deployed Edo worker reaches it through the standard streamable MCP endpoint at `http://host.docker.internal:27481/mcp`.

- `unity --version` returns `0.1.0-beta.7` (standalone Unity CLI is present).
- `unity editors -i` returns only the header `Version Arch Default Platforms`, so no Editor is installed.
- The Hetzner host was critically low on disk after deployment; cleanup recovered `/` to about 3.2G free, still below a comfortable Unity Editor install margin.
- Mac Unity MCP listener route from worker containers: `http://host.docker.internal:27481/mcp`.
- Verified worker probe: JSON-RPC `initialize`, then `tools/list`, then `tools/call` with `{"name":"scene-list-opened","arguments":{}}`.
- Verified result: `gamedev-mcp-server` 8.0.0.0, 38 tools, loaded scene `Kawanakajima`, `RootCount=73`, `IsLoaded=true`, `IsDirty=false`, path `Assets/Kawanakajima/Scenes/Kawanakajima.unity`.
- Invalid probes such as bare endpoint GETs, legacy bridge routes, or calling tool names directly as JSON-RPC methods may return 400/404/method-not-found and should not be treated as listener failure.
- A Unity source handoff now exists at `unity/kawanakajima-samurai/` with copied GLB/WAV assets, the v3 20-samurai battlefield scene pack GLB/manifest, a runtime bootstrap, and Editor build hooks.
- A Unity Editor scene and Mac build have been verified from the Mac-local Unity setup; the source handoff and verification notes are in `unity/kawanakajima-samurai/`.
- The Mac build artifact is not committed to git; the verified output path is `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`.
- Further Unity verification should use the standard MCP route above, not the historical Hetzner bridge.

The Unity source handoff is the correct starting point for subsequent Unity integration. It copies the single-character GLB, the full 20-samurai battlefield pack GLB/manifest, and WAV assets; declares Unity glTFast; creates the playable 20-samurai countryside scene at runtime; and includes a `P`/PACK toggle for inspecting the Foundry-authored battlefield pack once Unity can run.

See also: `.factoryx/work-orders/work-order-1781913967751-7-1/ASSET_MANIFEST.md` and `games/kawanakajima-foundry-samurai-proof/ASSET_MANIFEST.md`.

## Guarded Retry 1781940455825-6-1 — Fresh Preflight (2026-06-20)

Historical Hetzner-only preflight commands run before any Unity build claim:

- `unity --version` → 0.1.0-beta.7 (CLI wrapper only)
- `unity editors -i` → VersionArchDefaultPlatforms (no Editors)
- `unity auth status` → "You are not signed in..."
- `unity license` → (empty)
- `df -h /cache` → 1.1G free (97%)
- `unity-mcp-cli status unity/kawanakajima-samurai` → Editor not running + listener connection refused on localhost:23914
- Build attempt → "Error: Editor 2022.3.0f1 (x86_64) is not installed."

Historical result: no Unity build artifact was produced by that Hetzner-only attempt. Current Mac-local evidence supersedes this blocker: the Unity source handoff, MCP scene state, and Mac build verification are documented under `unity/kawanakajima-samurai/`.
