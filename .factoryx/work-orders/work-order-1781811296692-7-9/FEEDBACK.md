# FEEDBACK - Edo 3D Asset Repair: Kawanakajima Samurai (work-order-1781811296692-7-9)

This file records durable human/operator feedback for the Kawanakajima 3D asset repair pass.

## Discord preview reply - 2026-06-18T23:56:14.570Z

- Source: Discord message `1517317047745253377` by `gvr5105`
- Reply target: Discord message `1517255553376714902`
- Preview: https://www.ystackai.com/factoryx/edo-woodblock/previews/edo-woodblock/work-order-1781811296692-7-9/games/94-kawanakajima/
- Work order: `work-order-1781811296692-7-9`

> Feedback on this preview: https://www.ystackai.com/factoryx/edo-woodblock/previews/edo-woodblock/work-order-1781811296692-7-9/games/94-kawanakajima/
>
> The samurai still read as primitive box/capsule shapes. Do not patch with flat 2D texture cards. This needs real Blender/foundry 3D modeled assets, or it should be marked blocked if that pipeline is unavailable.

### Required follow-up

- Treat the current GLBs as insufficient central character assets, even though they are file-backed and load in the browser.
- Do not satisfy this with flat 2D texture cards draped on primitive geometry.
- Produce genuinely modeled samurai assets through Blender/foundry or another real 3D asset pipeline.
- If that pipeline is unavailable in the runtime, mark the work blocked and report the missing capability plainly instead of accepting box-like procedural stand-ins.

## Intake note

The automation runner saw this Discord reply and advanced the preview-channel watermark, but the GitHub feedback append initially failed because the preview-derived branch `factoryx/factory-edo-woodblock/work-order-1781811296692-7-9` did not exist; PR #158 is on `factoryx/factory-edo-woodblock/work-order`. This file was added on the actual PR branch so downstream follow-up work has a concrete feedback source.
