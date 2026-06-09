# Work Log — Edo Inkblade: Road Opens

## 2026-05-22

### Phase 1: Playable Core Loop
- Created `games/inkblade/index.html` with full game
- Implemented game states: START → APPROACH → DUEL → OPENING → CROSS → WIN
- Canvas-based rendering (960×540) with ukiyo-e aesthetic
- Player auto-walks toward gate, duel triggers on contact
- 3-round timing duel: guard winds up → player counter-strikes with SPACE
- Gate opens with animation → player walks through → win screen
- Procedural SFX for footsteps, strikes, hits, gate opening
- **Smoke test: PASS** (all states transitioned correctly, guard defeated, gate opened)

### Phase 2: Generated Assets
- Checked `FACTORYX_GAME_ASSET_SERVICE_URL` health: OK
- Available: Flux (ComfyUI), MMAudio
- Unavailable: Trellis 2, HeartMuLa (procedural-smoke fallback)
- Requested proof pack via `POST /v1/proof-pack`
- Generated:
  - Flux: Background image (960×540 PNG, 400KB) — Japanese road/gate scene
  - MMAudio: Gate-open SFX (WAV, 62KB)
  - HeartMuLa: Ambient loop (WAV, 353KB) — procedural smoke, marked prototype
- Integrated into game with graceful procedural fallback
- Created `public/assets/asset-manifest.json`

### Phase 3: Docs + Verification
- Created PREVIEW.md with play instructions
- Created VERIFICATION.md with test results
- All acceptance criteria verified

## 2026-06-09 (Re-run)

### Merge Conflict Resolution
- PR #109 was in CONFLICTING/DIRTY state due to main advancing with 169+ commits
- Merged `origin/main` into the work order branch
- Resolved conflict in `games/index.html`: changed from a single redirect to a game index page listing both "Edo Inkblade: Road Opens" and "Floating Score"
- Merge commit: `73098b9`

### Asset Path Fix
- Fixed generated asset paths in `games/inkblade/index.html`: `../assets/` → `../../public/assets/`
- This resolved 404 errors when the game loads background image and gate-open SFX
- Commit: `0961ea3`

### Smoke Test
- Wrote Playwright-based smoke test (`inkblade-smoke.mjs`)
- All 13 checks pass: canvas, HUD, state transitions, duel mechanics, asset loading, no errors
- Screenshot saved confirming game renders correctly
