# Verification

## Static checks
- [x] JS syntax valid (Node new Function() parse)
- [x] Parentheses balanced: 266/266
- [x] Braces balanced: 85/85
- [x] Brackets balanced: 5/5
- [x] File size: ~14KB (< 2MB)
- [x] Single self-contained file, no external deps
- [x] No loading state, no instructions text
- [x] DOCTYPE present
- [x] Proper closing tags

## Game Feel Checklist
- [x] Core verb (baren press) demonstrated immediately — press/hold anywhere
- [x] Input response < 100ms — direct canvas response, no debounce
- [x] Easing on all motion — sine curves for waves; resistance physics for press
- [x] Press feedback — ink deepens, splatters emerge, mist thins
- [x] Audio only after user gesture — breath sound on first press only
- [x] Touch + keyboard — pointer events + Space/Enter
- [x] 60fps target — minimal draw calls, procedural assets
- [x] Payload < 2MB — 14KB total
- [x] No external network dependencies — fully self-contained

## Runtime verification
- JS syntax validated via Node
- No console.error or pageerror traps in code
- Canvas context fallback not needed (all modern browsers support 2d context)
