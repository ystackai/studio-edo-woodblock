# Work Log - work-order-1782077444154-7-1

## Summary

Generated and preserved a complete v17 20-samurai batch: 10 Takeda/red-side variants and 10 Uesugi/blue-side variants.

## What Changed

1. Copied `generate-pilot4-samurai.py` to `generate-v17-20-samurai.py`.
2. Changed output paths to `samurai-v17/full-20`.
3. Expanded IDs to `takeda-01..takeda-10` and `uesugi-01..uesugi-10`.
4. Added per-ID render directories and unique evidence filenames.
5. Generated 20 GLBs, 20 `.blend` sources, and 160 PNG evidence renders.
6. Repaired the generator filter/list mode after the first chunk command accidentally rendered the full batch.
7. Recorded visual gate failure: complete assets, but still too primitive/doll-like for production realism.

## Learned

A Python-only list proof was not enough. The worker must prove the exact Blender command, including the same filter syntax, before any expensive chunk render. FactoryX runtime prompt hardening for that requirement was pushed separately.
