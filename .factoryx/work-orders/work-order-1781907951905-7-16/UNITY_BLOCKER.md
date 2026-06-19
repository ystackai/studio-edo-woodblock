# UNITY_BLOCKER

Unity is not available in this runtime.

## Probes performed (2026-06-19)
- `which unity` → empty
- `which Unity` → empty
- `which UnityHub` → empty
- `ls /Applications/Unity*` → no match
- `ls /opt/unity*` → no match
- `command -v blender` succeeded (Blender  used for foundry), but no Unity

## Commands that would be used if present (for reference)
```bash
# Typical detection + run
which Unity || which unity || echo "no Unity"
# Editor version probe
"/Applications/Unity/Hub/Editor/..." 2>/dev/null || true
# MCP / editor scripting would be at Unity MCP endpoint if configured
```

## What was produced instead
- Clean scaffold directory: `unity/kawanakajima-autonomous-samurai-proof/`
- This blocker document.
- The same 20 GLBs can be dropped into a Unity project `Assets/` when a licensed editor is available; no code changes required for the assets themselves.

Do not interpret absence of Unity artifacts as a completed Unity world. The deliverable is the browser Three.js proof + all Foundry assets + docs.
