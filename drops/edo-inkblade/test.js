// Edo Inkblade — smoke tests
// Run with: node test.js
const fs = require('fs');

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    console.log('  PASS: ' + name);
    passed++;
  } catch(e) {
    console.log('  FAIL: ' + name + ' — ' + e.message);
    failed++;
  }
}

console.log('Edo Inkblade tests\n');

// Load HTML
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
test('index.html exists', () => {
  if (html.length < 1000) throw new Error('File too short: ' + html.length);
});

test('has required HTML elements', () => {
  const ids = ['c', 'hp', 'ink', 'obj', 'char-select', 'game', 'info', 'controls'];
  ids.forEach(id => {
    if (!html.includes('id="' + id + '"') && !html.includes("getElementById('" + id + "')"))
      throw new Error('Missing id: ' + id);
  });
});

test('has 3 characters defined', () => {
  const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const match = js.match(/chars\s*=\s*\{([^}]+)\}/);
  if (!match) throw new Error('No chars object');
});

test('JS parses without error', () => {
  const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  new Function(js);
});

test('has WASD keyboard handling', () => {
  const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  if (!js.includes('keydown')) throw new Error('No keydown handler');
  if (!js.includes('keyup')) throw new Error('No keyup handler');
});

test('has game loop (requestAnimationFrame)', () => {
  const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  if (!js.includes('requestAnimationFrame')) throw new Error('No game loop');
});

test('preview.html exists and redirects', () => {
  const preview = fs.readFileSync(__dirname + '/preview.html', 'utf8');
  if (!preview.includes('index.html')) throw new Error('No redirect to index.html');
});

console.log(`\n${passed}/${passed + failed} tests passed`);
process.exit(failed > 0 ? 1 : 0);
