# VERIFICATION.md — Edo Inkblade: Road to Ganryu

## Static Checks
```
$ node drops/edo-inkblade-ots/test.js
```
Result: **All Edo Inkblade smoke checks passed** (330+ checks including):
- Canvas renderer with 2D context
- Over-the-shoulder perspective with projection function
- 3 character select cards (Musashi, Koeda, Yoshino) with sprite assets
- 7 enemy types with patrol AI
- Paint mark system with ink management
- Duel loop with slash, block, and telegraph readability
- Zone atmosphere (meadow, forest, mountain, coastal)
- Storm/lightning system with thunder audio
- Red-crowned crane birds
- Wandering musician road events
- Koi fish ponds, meditation spots, campfire embers
- Journey milestones with haiku vignettes
- Boss fight (Ganryu) with multi-phase combat
- Ending ceremony with credits sequence

## Browser Runtime Check
```
$ node browser-check.js
```
Result:
- **Console errors: 0**
- **Page errors: 0**
- **Sprites loaded: 11/11 complete** (musashi, koeda, yoshino, chaser, prowler, duelist, vagrant, monk, mountain-ascetic, ganryu-sentinel, ganryu)
- **Canvas: 1280×720, center pixel has content (non-black)**
- **Screenshot captured**: game renders atmospheric road scene with bamboo, lanterns, mountains

## Character Art Assets
| File | Size | Frames |
|------|------|--------|
| musashi.png | 32KB | 4 (idle/slash/block/damage) |
| koeda.png | 31KB | 4 |
| yoshino.png | 27KB | 4 |
| chaser.png | 22KB | 4 |
| prowler.png | 22KB | 4 |
| duelist.png | 22KB | 4 |
| vagrant.png | 22KB | 4 |
| monk.png | 22KB | 4 |
| mountain-ascetic.png | 23KB | 4 |
| ganryu-sentinel.png | 22KB | 4 |
| ganryu.png | 31KB | 4 (boss) |
| _contact_sheet.png | 45KB | all characters |

## Audio Assets
30 WAV files in `assets/audio/` including:
- Zone ambiences (coastal, forest, meadow, mountain)
- Instrument motifs (shakuhachi, koto, taiko)
- SFX (slash, block, hit, death, paint, mark, victory)
- Ambient drones (bass, tension, ganryu)

## Known Limitations
- Audio requires user gesture to initialize (Web Audio autoplay policy)
- Mobile touch controls are basic (swipe to move, tap to slash)
- No save state persistence between sessions
