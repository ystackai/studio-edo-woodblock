# UNITY_BLOCKER

**Work Order:** work-order-1781913967751-7-1

Unity Editor/MCP listener is not available in this worker container runtime.

- `unity --version` returns `0.1.0-beta.7` (standalone Unity CLI is present).
- `unity editors -i` returns only the header `Version Arch Default Platforms`, so no Editor is installed.
- `df -h /cache` shows `/dev/sda1 38G 32G 4.5G 88% /cache`; this is below the 18G minimum used by the FactoryX Unity Editor install helper.
- No Unity MCP project listener is running.
- No .unitypackage or C# project was created.
- This deliverable is the browser/Three.js review proof plus a Unity handoff only.
- If final shipping requires Unity, the host needs more disk or a different worker with an installed Unity Editor and Unity-side MCP package/listener.

The Foundry GLB source + browser proof here is the correct hand-off for subsequent Unity integration (import the glb, apply same formation/pose logic or bake variants, match the 6 camera views for consistency).

See also: `.factoryx/work-orders/work-order-1781913967751-7-1/ASSET_MANIFEST.md` and `games/kawanakajima-foundry-samurai-proof/ASSET_MANIFEST.md`.
