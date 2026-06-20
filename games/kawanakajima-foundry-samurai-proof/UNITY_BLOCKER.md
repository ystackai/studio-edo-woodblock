# UNITY_BLOCKER

**Work Order:** work-order-1781913967751-7-1

Unity Editor/MCP listener is not available in this worker container runtime.

- `unity --version` returns `0.1.0-beta.7` (standalone Unity CLI is present).
- `unity editors -i` returns only the header `Version Arch Default Platforms`, so no Editor is installed.
- `df -h /cache` shows `/dev/sda1 38G 32G 4.5G 88% /cache`; this is below the 18G minimum used by the FactoryX Unity Editor install helper.
- No Unity MCP project listener is running.
- A Unity source handoff now exists at `unity/kawanakajima-samurai/` with copied GLB/WAV assets, a runtime bootstrap, and Editor build hooks.
- No Unity Editor build was created or verified.
- This deliverable is the browser/Three.js review proof plus a Unity source handoff only.
- If final shipping requires Unity, the host needs more disk or a different worker with an installed Unity Editor and Unity-side MCP package/listener.

The Unity source handoff is the correct starting point for subsequent Unity integration. It copies the GLB/WAV assets, declares Unity glTFast, creates the 20-samurai countryside scene at runtime, and keeps the same six review camera concepts for consistency.

See also: `.factoryx/work-orders/work-order-1781913967751-7-1/ASSET_MANIFEST.md` and `games/kawanakajima-foundry-samurai-proof/ASSET_MANIFEST.md`.
