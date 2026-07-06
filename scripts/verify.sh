#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
elif [ -f package.json ]; then
  npm install --no-audit --no-fund
fi

if [ -f package.json ] && grep -q '"playwright"' package.json; then
  npx playwright install --with-deps chromium
fi

./verify.sh "$@"
if [ -f verify.js ]; then
  node verify.js
fi

if [ -f games/kawanakajima-foundry-samurai-proof/verify.js ]; then
  node games/kawanakajima-foundry-samurai-proof/verify.js
fi

if [ -f unity/kawanakajima-samurai/verify-unity-handoff.js ]; then
  node unity/kawanakajima-samurai/verify-unity-handoff.js
fi
