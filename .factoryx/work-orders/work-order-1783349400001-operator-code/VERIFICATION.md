# Verification

Local checks run before commit:

```sh
git diff --check
node -c games/ukiyo-e-printer/blocks-2d.js
perl -0ne 'print $1 if /<script type="module">(.*)<\\/script>/s' games/ukiyo-e-printer/index.html > /tmp/ukiyo-inline-check.js
node -c /tmp/ukiyo-inline-check.js
```

All checks passed.

Expected FactoryX closeout:

- Browser runtime verification loads `games/ukiyo-e-printer/`.
- Audio activity is detected during interaction.
- Post-interaction screenshot is nonblank.
- PR URL remains the canonical branch PR.
