#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"
PORT="${PORT:-8765}"
DEBUG_PORT="${DEBUG_PORT:-9223}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
USER_DATA_DIR="${USER_DATA_DIR:-/tmp/chrome-kawanakajima-pack-smoke}"

if [[ ! -x "$CHROME" ]]; then
  echo "Chrome executable not found: $CHROME" >&2
  exit 2
fi

server_pid=""
chrome_pid=""
cleanup() {
  if [[ -n "$chrome_pid" ]]; then kill "$chrome_pid" 2>/dev/null || true; fi
  if [[ -n "$server_pid" ]]; then kill "$server_pid" 2>/dev/null || true; fi
}
trap cleanup EXIT

cd "$REPO_ROOT"
python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/kawanakajima-pack-http.log 2>&1 &
server_pid=$!

rm -rf "$USER_DATA_DIR"
"$CHROME" \
  --headless=new \
  --enable-unsafe-swiftshader \
  --use-angle=swiftshader \
  --remote-debugging-port="$DEBUG_PORT" \
  --user-data-dir="$USER_DATA_DIR" \
  --no-first-run \
  --no-default-browser-check \
  about:blank >/tmp/kawanakajima-pack-chrome.log 2>&1 &
chrome_pid=$!

PAGE_URL="http://127.0.0.1:${PORT}/games/kawanakajima-foundry-samurai-proof/index.html" \
DEBUG_URL="http://127.0.0.1:${DEBUG_PORT}" \
node <<'NODE'
const endpoint = process.env.DEBUG_URL;
const pageUrl = process.env.PAGE_URL;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url, timeoutMs = 15000) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      lastError = new Error(`${url} -> ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw lastError || new Error(`Timed out fetching ${url}`);
}

async function connect(wsUrl) {
  if (typeof WebSocket !== 'function') {
    throw new Error('This smoke requires Node with a built-in WebSocket implementation');
  }
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (!msg.id || !pending.has(msg.id)) return;
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  });
  return {
    send(method, params = {}) {
      const msgId = ++id;
      ws.send(JSON.stringify({ id: msgId, method, params }));
      return new Promise((resolve, reject) => pending.set(msgId, { resolve, reject }));
    },
    close() {
      ws.close();
    }
  };
}

async function waitFor(cdp, expression, timeoutMs, label) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const result = await cdp.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (result.result && result.result.value) return;
    await sleep(250);
  }
  const state = await cdp.send('Runtime.evaluate', {
    expression: `({
      title: document.title,
      status: document.getElementById('status') && document.getElementById('status').textContent,
      error: document.body && document.body.dataset.error,
      hasFoundry: !!window.KAWANAKAJIMA_FOUNDRY
    })`,
    returnByValue: true
  });
  throw new Error(`Timed out waiting for ${label}; state=${JSON.stringify(state.result.value)}`);
}

const targets = await getJson(`${endpoint}/json/list`);
const target = targets.find((item) => item.type === 'page') || targets[0];
if (!target) throw new Error('No Chrome DevTools page target found');

const cdp = await connect(target.webSocketDebuggerUrl);
await cdp.send('Runtime.enable');
await cdp.send('Page.enable');
await cdp.send('Page.navigate', { url: pageUrl });

await waitFor(
  cdp,
  `window.KAWANAKAJIMA_FOUNDRY && window.KAWANAKAJIMA_FOUNDRY.getActorCount() === 20`,
  45000,
  '20-actor browser proof load'
);
await cdp.send('Runtime.evaluate', {
  expression: `window.KAWANAKAJIMA_FOUNDRY.loadFoundryBattlefieldPack()`
});
await waitFor(
  cdp,
  `window.KAWANAKAJIMA_FOUNDRY && window.KAWANAKAJIMA_FOUNDRY.isFoundryPackLoaded() && window.KAWANAKAJIMA_FOUNDRY.isFoundryPackVisible()`,
  45000,
  'Foundry battlefield pack toggle'
);

const state = await cdp.send('Runtime.evaluate', {
  expression: `({
    actorCount: window.KAWANAKAJIMA_FOUNDRY.getActorCount(),
    packUrl: window.KAWANAKAJIMA_FOUNDRY.packUrl,
    packLoaded: window.KAWANAKAJIMA_FOUNDRY.isFoundryPackLoaded(),
    packVisible: window.KAWANAKAJIMA_FOUNDRY.isFoundryPackVisible(),
    bodyPackVisible: document.body.dataset.foundryPackVisible,
    title: document.title
  })`,
  returnByValue: true
});
cdp.close();
console.log('Browser battlefield pack smoke: PASS');
console.log(JSON.stringify(state.result.value, null, 2));
NODE
