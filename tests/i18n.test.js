const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/curriculum.js');
const I = require('../js/i18n.js');

const root = path.join(__dirname, '..');
const sources = ['js/app.js', 'js/practice.js']
  .map(f => fs.readFileSync(path.join(root, f), 'utf8'))
  .join('\n');

function uiKeys() {
  const keys = new Set();
  for (const match of sources.matchAll(/\bt\((['"])(.*?)\1\)/g)) keys.add(match[2]);
  C.units.forEach(unit => {
    keys.add(unit.title);
    keys.add(unit.subtitle);
    unit.lessons.forEach(l => {
      keys.add(l.description);
      keys.add(l.prompt);
      if (l.type !== 'chord') keys.add(l.title);
    });
  });
  keys.delete('');
  return keys;
}

// Strings that are legitimately the same in every language.
const identity = new Set([
  'XP', 'BPM', '—', 'Frère Jacques', 'La Bamba',
  'Dm, Em, A, D, D7, A7', 'Tablature', 'Notes', 'Badges', 'Minutes',
  'Largo', 'Andante', 'Moderato', 'Allegro', 'Presto'
]);

test('both translations cover every UI string used by the app', () => {
  const keys = uiKeys();
  assert.ok(keys.size > 150, `only ${keys.size} keys found`);
  for (const lang of ['pt', 'fr']) {
    I.setLang(lang);
    const missing = [...keys].filter(k => I.t(k) === k && !identity.has(k));
    assert.deepEqual(missing, [], `${lang} missing: ${missing.join(', ')}`);
  }
});

test('language codes map to Canadian locales', () => {
  I.setLang('pt');
  assert.equal(I.getLang(), 'pt');
  I.setLang('fr');
  assert.equal(I.getLang(), 'fr');
  I.setLang('en');
  assert.equal(I.getLang(), 'en');
});

test('note names are translated in both languages', () => {
  I.setLang('pt');
  assert.notEqual(I.t('C'), 'C');
  I.setLang('fr');
  assert.notEqual(I.t('C'), 'C');
});
