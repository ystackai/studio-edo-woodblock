# Verification

Local checks run before commit:

- `node -c games/ukiyo-e-printer/blocks-2d.js`
- extracted inline script from `games/ukiyo-e-printer/index.html` and ran
  `node -c /tmp/ukiyo-inline-check.js`
- `git diff --check`

FactoryX browser/runtime verification should run during closeout.
