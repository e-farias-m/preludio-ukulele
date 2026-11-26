const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const html = read('index.html');
const css = read('css/styles.css');
const manifest = JSON.parse(read('manifest.json'));
const sw = read('sw.js');

test('index.html loads modules in dependency order', () => {
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  const expected = [
    'js/i18n.js', 'js/curriculum.js', 'js/progress.js', 'js/audio.js',
    'js/graphics.js', 'js/practice.js', 'js/app.js'
  ];
  assert.deepEqual(scripts, expected);
});

test('index.html includes PWA and accessibility hooks', () => {
  assert.match(html, /rel="manifest" href="manifest\.json"/);
  assert.match(html, /name="theme-color"/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /id="practice-tools"/);
  assert.match(html, /serviceWorker\.register\('sw\.js'/);
});

test('manifest describes an installable standalone app', () => {
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.icons.length, 3);
  assert.ok(manifest.icons.some(i => i.purpose === 'maskable'));
  manifest.icons.forEach(i => assert.ok(fs.existsSync(path.join(root, i.src.replace(/^\.\//, ''))), i.src));
});

test('service worker caches every runtime asset', () => {
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  scripts.forEach(src => assert.ok(sw.includes(`'./${src}'`), `sw missing ${src}`));
  assert.ok(sw.includes("'./css/styles.css'"));
  assert.ok(sw.includes("'./manifest.json'"));
  assert.ok(sw.includes("'./images/instruments/fretboard.jpg'"));
  assert.match(sw, /request\.mode === 'navigate'/);
  assert.match(sw, /caches\.match\('\.\/index\.html'\)/);
});

test('stylesheet provides dark mode and accessibility affordances', () => {
  assert.match(css, /\[data-theme="dark"\]/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.skip-link:focus/);
});
