# Work Log

## work-order-1785157243525-7-1: Pictures of the Floating World

### Session Notes

#### 1. Asset Foundry Audio Integration
- Submitted `cozy_audio_pack` recipe with prompt for ukiyo-e ambient soundscape
- Job completed quickly; received ambient loop, soft impact, and seal confirm WAV files
- Downloaded all 3 audio files to `games/ukiyo-e-printer/assets/audio/`
- Integrated foundry audio alongside oscillator foundation:
  - `ambient_loop.wav` blended at 95% playback rate under oscillator drone
  - `soft_impact.wav` used for baren friction sound, pitch-shifted based on hold progress
  - `seal_confirm.wav` used for finish seal thud, with added deep bass oscillator underneath
- Fallback oscillator sounds retained if foundry audio fails to load

#### 2. Baren Press Visual Enhancement
- Expanded baren press from single radial gradient to layered system:
  - Deep ink core (center)
  - 3 expanding ink spread rings with organic wobble (simulating paper absorption)
  - Vermilion glow at 60%+ hold (peak saturation visual)
  - Vermilion bleed ring at 75%+ hold
  - Fiber displacement lines (18 fibers with wavy variation)
  - Breath vapor (7 wispy bezier curves, double-layered for thickness variation)
- Hold ring enhanced: now shows ink-spread ring with 80-step wobble + secondary inner ring

#### 3. Brush Stroke Enhancement
- Added brush bristle effect: small ink dots appear along stroke path during drawing
- Resistance is now speed-dependent: faster movement = more drag
- Pointer cursor replaced with SVG brush-tip circle
- Stroke rendering already had multi-pass (main stroke + bleed + edge darkening)

#### 4. Paper Texture & Atmosphere
- Enhanced washi paper texture with:
  - Darker fiber highlights (0.1% chance per pixel)
  - Horizontal fiber lines with occasional crossing fibers
  - Vertical fiber lines (cross-hatch pattern)
- Deckle edge overlay now has breathing pulse animation (8s cycle)
- Vignette deepened for more atmospheric feel
- Title text shadow enhanced with subtle glow

#### 5. Seal Stamp Enhancement
- Finished stamp now has irregular rounded edges (hand-carved hanko feel)
- Added ink bleed blur effect around stamp
- Character position varies slightly for authenticity

#### 6. Audio Enhancement
- Restructured audio graph: added `droneGain` as sub-mix for deeper foundation
- Wind LFO modulation added to bandpass filter
- Wet ink sound enhanced with brush sweep + wet noise + fiber scratch
- Seal thud enhanced with added 80Hz bass oscillator
- Overall mix depth increased for more immersive feel

### Design Decisions
- **Preserved working code**: All original procedural scene, block system, and interaction model retained
- **Enhanced, didn't replace**: All changes are layered on top of existing systems
- **Foundry audio blended, not swapped**: Foundry audio enhances but doesn't replace oscillator foundation
- **Speed-dependent resistance**: Faster cursor movement = more drag, creating physical resistance
- **Saturation decay**: Paper slowly recovers, rewarding patient return rather than rapid clicking
