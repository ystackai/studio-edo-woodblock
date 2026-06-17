# Feedback — Rekick: Edo Inkblade road-opening slice with generated assets (work-order-1781665294727-followup)

**Target deliverable:** rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a (attached to parent work-order-edo-inkblade-road-opens-assets-20260522)
**Feedback source:** operator (explicit rework decision deliverable-decision-1781629581487-2)
**Verbatim:** "music and art are terrible please improve"

## Interpretation per house style + asset_contract_v2
- Art: current (pre-rekick) is basic DOM/CSS water fill + list text dissolve + simple cursor trail. Does not read as ukiyo-e woodblock; no paper texture, no ink silhouettes, no mist/atmosphere, no strong single gesture composition. Violates "ink as primary", "silhouette and edge", "paper and texture", "mist, distance, and breath".
- Music: purely procedural sine chimes + heartbeat + noise wetdrop, always-on after START (autoplay-ish), not sparse, not user-gesture-tied in a carving sense, not atmospheric or "the breath between moments". No restraint.
- Interaction: passive watch-the-water linear 8s sequence; no player verb that *enacts* the theme; no reversible "moment before the gesture"; fails taste-gate (not interesting after honest play in 30-60s without explanation).

## Requirements from payload / contract
- Material redesign of visual assets, audio, and/or interaction/explanation (not just polish).
- Real file-backed generated/authored assets under `drops/indigo-stutter/assets/` (or equiv) + manifest/provenance. (Note: active artifact in tree for this studio drop is the indigo-stutter; road-opening slice concept realized here as the living print that "opens" via sustained attention.)
- ASSET_MANIFEST.md alone insufficient; must be referenced + loaded in the playable slice.
- In-code-only procedural does not satisfy for material art/music changes.
- Browser/runtime verification with real chromium (pageerror, console, net, in-game state after interaction).
- Screenshots/evidence in this WO dir.
- Update preview entrypoint.
- GitHub PR (update or create on the canonical branch), full prompt/context in body.
- Address *this* feedback before unrelated polish.
- Keep useful existing (e.g. melancholic "hateful things" list theme can inform the "stutter" of inner voice / floating world; mono no aware preserved).

## How changes will address it
- Redesign to taste-gate slice: one verb ("rub / hold to still the trembling ink"), one space (the print), strong camera (flat ukiyo-e framed print).
- Visuals: real generated ukiyo-e layers (base motif + reveal detail) painted with feathered multi-pass ink, paper fiber, drifting mist, boat/pine/horizon silhouettes. Jitter on living lines as the "stutter" (pre-gesture tremble). Contact damps jitter + pressure ring (baren press feel).
- Audio: silent until first gesture. On contact: scheduled sparse "stutter" water/friction drops (hesitant, gapped). Sustained stilling tightens gaps + brings in soft resolving held tone (two low sines, lowpass opens with attention). Release: gaps reopen, tone exhales. Mute control. Matches Tsutaya (sparse, physical, memory of block lift/breath).
- Progressive reveal: sustained attention reveals under-detail from asset (thinner mist, emergent forms, small earned vermilion seal). Caption as Sei Shonagon grace note after first resolve ("the hand that stills the ink").
- First screen already a complete quiet statement; verb legible in <10s by looking + moving pointer; point felt by 25s (my attention stills and reveals; on release the world trembles again — nothing is permanent).
- All per house style (restraint, ink primary, ma/emptiness via mist, touch as carving, one living print).

Work Order: work-order-1781665294727-followup
Parent: work-order-edo-inkblade-road-opens-assets-20260522
Decision: deliverable-decision-1781629581487-2 (rework)
