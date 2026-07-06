# Verification

Local checks to run before commit:

- `git diff --check`
- extract inline script from `games/ukiyo-e-printer/index.html` and run
  `node -c /tmp/ukiyo-inline-check.js`
- `node -c games/ukiyo-e-printer/blocks-2d.js`

FactoryX browser/runtime verification should run during closeout.

