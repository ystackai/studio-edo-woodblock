# Verification — samurai-country-battle-20-20260621

**Recorded:** 2026-06-21
**Status:** In progress — Unity build artifact missing

## Browser Proof Verification

- `node verify.js`: **PASS** — all structure/asset/size checks pass
- `node browser-smoke-chromium.mjs`: **PASS** — CAPTURE_READY, 20 actors, nonblank canvas, no console errors, no 404s
- WebGL context created: yes
- 20 samurai loaded (10 Takeda / 10 Uesugi): yes
- Camera presets (6): working
- Charge/Reform/Clash interactions: working
- Audio: file-backed WAVs from Foundry, gated behind user gesture (AUDIO toggle)

## Unity Verification

- Project opens: yes (on Mac Studio)
- Scene loads: yes — `Kawanakajima.unity` with 20 samurai actors
- glTFast reflection bootstrap: verified (v8.3 fix)
- Mac build (112 MB): produced locally on Mac Studio but **not committed to this branch**
- MCP listener (`localhost:25666`): verified, 38 tools available, scene state confirmed

## Blocking Issue

Unity Mac build artifact (`Builds/Mac/KawanakajiraSamurai.app`) is not committed to the branch. An agent with Mac access must commit it (via git LFS) to complete verification.
