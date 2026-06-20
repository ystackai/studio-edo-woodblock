# VERIFICATION — work-order-1781916431833-7-15

**Work Order:** work-order-1781916431833-7-15  
**Branch:** factoryx/factory-edo-woodblock/work-order-1781916431833-7-15  
**PR context:** https://github.com/ystackai/studio-edo-woodblock/pull/161 (canonical)

## Runtime checks performed
- Unity preflight (self-run):
  - unity --version: 0.1.0-beta.7
  - unity editors -i: VersionArchDefaultPlatforms (none)
  - df -h /cache: 4.4G avail
- No Unity Editor/project listener. UNITY_BLOCKER.md written with exact output. No Unity claims made.

## Browser verification
- node verify.js (from game dir): must exit 0 with BASIC STRUCTURE + ASSET CHECKS: PASS
- Includes: 20 actors, GLB present+size, contact+hero, audio wavs present+size, cams named, no oscillator audio code, window expose.
- 6 screenshots captured via capture (chromium headless + pixel gate): nonblank, mean brightness >20, size >30k, actual scene (ground+samurai visible).
- After each pass: weakest visible (e.g. flat ground, audio not starting, tiny focal) identified from capture + manual review, fixed, re-captured.

## Assets
- Samurai: asset-1781913507610-bf69e595 (GLB +5 files)
- Audio: asset-1781916330853-f7d831d9 (wav + mod + json + pngs) — integrated file-backed

## Preview entrypoint
games/kawanakajima-foundry-samurai-proof/index.html

## Status
- Structural + runtime + visual evidence: in progress / complete when 6 good shots + verify pass + manifests.
- Honest about runtime (Unity blocked).
