# UNITY_BLOCKER

**Work Order:** work-order-1781940455825-6-1 (guarded Unity retry) — prior: work-order-1781920715097-7-1 (retry; canonical branch work-order-1781913967751-7-1)

Unity Editor is not available in the Hetzner worker container runtime. The Unity MCP listener is now available through the Mac host bridge and is reachable from the deployed Edo worker.

- `unity --version` returns `0.1.0-beta.7` (standalone Unity CLI is present).
- `unity editors -i` returns only the header `Version Arch Default Platforms`, so no Editor is installed.
- The Hetzner host was critically low on disk after deployment; cleanup recovered `/` to about 3.2G free, still below a comfortable Unity Editor install margin.
- Mac Unity MCP listener route: `http://172.21.0.1:25666`.
- Authenticated worker probe: `POST /api/system-tools/ping` with `Authorization: Bearer $UNITY_MCP_TOKEN` returns HTTP 200 and `{"result":"pong"}`.
- Invalid probes such as `GET /`, `/health`, or dummy bearer tokens may return 400/404/401 and should not be treated as listener failure.
- A Unity source handoff now exists at `unity/kawanakajima-samurai/` with copied GLB/WAV assets, the v3 20-samurai battlefield scene pack GLB/manifest, a runtime bootstrap, and Editor build hooks.
- No Unity Editor scene/build was created or verified in this PR.
- This deliverable is the browser/Three.js review proof plus a Unity source handoff only.
- If final shipping requires Unity, the next run should drive the already reachable Mac Unity MCP listener to load the handoff project, insert the assets, and produce build evidence.

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

**No Unity build artifact produced. No playable Unity completion claimed.** Source handoff + browser proof only. Listener reachability is resolved via the Mac bridge; scene/build verification remains open.
