# Asset Manifest — Lantern Tide (work-order-1783022208009-7-1)

## Creative Intent

"This should feel like a quiet Edo-period night at a river shore, where releasing paper lanterns transforms darkness into a gentle luminous tide — one tap at a time."

## Foundry Jobs

### cozy_audio_pack — lantern_tide_audio

- **Recipe:** `cozy_audio_pack`
- **Job ID:** `asset-1783023302937-31f8f5b4`
- **State:** queued
- **Submitted JSON:** `{"recipe":"cozy_audio_pack","asset_name":"lantern_tide_audio","prompt":"Edo-period nightscape sounds: soft paper lantern crinkle for launch, gentle water ripple for lantern landing, a warm ambient water swell for the full-bright tide finale, minimal silence otherwise","style":"traditional Japanese ambient, minimal, warm"}`
- **Planned output copy path:** `games/lantern-tide/assets/foundry/`
- **Expected files:**
  - `foundry_music_loop.wav` → `assets/foundry/ambience_tide.wav`
  - `sfx_interaction.wav` → `assets/foundry/sfx_lantern_launch.wav` (paper crinkle)
  - `sfx_movement.wav` → `assets/foundry/sfx_lantern_land.wav` (water ripple)
  - `sfx_reveal.wav` → `assets/foundry/sfx_finale.wav` (full-bright reveal)
  - `sfx_impact.wav` → `assets/foundry/sfx_water_swell.wav`

## Game Assets (Local)

- **Visual:** Procedural woodblock nightscape rendered on canvas (lantern sprites drawn with canvas paths)
- **Audio:** Foundry cozy_audio_pack WAV files (loaded after user gesture)
- **Fallback:** Web Audio API oscillator-based SFX when Foundry audio hasn't arrived yet

## Integration Points

- `games/lantern-tide/index.html` — main game file
- `games/lantern-tide/assets/foundry/` — copied Foundry audio outputs

## Payload Size

- TODO: measure after build

## Browser Verification

- TODO: smoke test, capture active-play and ending screenshots

## First Checkpoint Contract

- Do not reread boilerplate WORKLOG.md, PREVIEW.md, or VERIFICATION.md before making progress.
- Read FEEDBACK.md only if it contains non-boilerplate reviewer feedback.
- Within the first six shell commands, create one durable checkpoint: a script patch, a planned-ID/dry-run artifact, a generated asset file, or a blocker with exact missing prerequisite.
- When Requested IDs are already listed below, use them as the startup source of truth; before searching old assets broadly, append planned source/export/render evidence paths for those IDs to this manifest or create an executable generator/list-mode patch.
- For copied asset scripts, first prove the main spec list and output paths contain every requested ID and no stale IDs, then render.

