# Goal Execution Strategy — Edo Inkblade 12h Polish

## Product Vision
A single-file browser game at `games/inkblade/index.html` where:
1. Player sees the objective & controls immediately (<10 sec)
2. Walks toward a torii gate blocked by a guard
3. Duel: counter-strike timing mini-game (SPACE when cursor in blue zone)
4. Guard defeated → gate opens with unmistakable visual/audio cue
5. Player walks through opened gate → win screen with clear payoff

## Execution Phases
1. **Playable core**: No assets, pure procedural canvas — focus on game loop, states, controls
2. **Browser verify**: Puppeteer smoke test — no errors, non-blank canvas, post-start state
3. **Asset generation**: Request Flux (background), MMAudio (SFX) via FACTORYX_GAME_ASSET_SERVICE_URL
4. **Asset integration**: Load generated assets in-game with graceful fallbacks
5. **Polish passes**: Clarity, readability, feedback, audio, visual impact
6. **Final verification**: Full browser smoke + asset verification

## Key Constraints
- Single HTML file, no build step
- Graceful asset fallbacks (procedural if generated assets fail)
- Audio only triggered from user gesture
- 960×540 canvas (16:9)
- Ukiyo-e woodblock / sumi-e aesthetic
