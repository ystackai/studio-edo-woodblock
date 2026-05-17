#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
elif [ -f package.json ]; then
  npm install --no-audit --no-fund
fi

./verify.sh "$@"
if [ -f verify.js ]; then
  node verify.js
fi
