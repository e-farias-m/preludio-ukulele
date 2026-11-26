const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/curriculum.js');

test('curriculum has a complete, unique lesson path', () => {
  assert.equal(C.flatLessons.length, 31);
  const ids = C.flatLessons.map(l => l.id);
  assert.equal(new Set(ids).size, ids.length);
  C.flatLessons.forEach((l, i) => assert.equal(l.index, i));
});

test('curriculum contains seven interleaved songs', () => {
  const songs = C.flatLessons.filter(l => l.type === 'song');
  assert.equal(songs.length, 7);
  assert.deepEqual(songs.map(l => l.songKind),
    ['chord', 'chord', 'chord', 'chord', 'chord', 'chord', 'melody']);
});

test('chord songs reference known chords and valid strum patterns', () => {
  C.flatLessons.filter(l => l.type === 'song' && l.songKind === 'chord').forEach(song => {
    assert.ok(song.bpm > 0, song.id);
    song.bars.forEach(name => assert.ok(C.chords[name], `${song.id}: ${name}`));
    assert.equal(song.strum.length, song.timeSig.num, song.id);
    song.strum.forEach(dir => assert.ok(['D', 'U', '-'].includes(dir), `${song.id}: ${dir}`));
  });
});

test('melody songs use valid ukulele positions and complete bars', () => {
  C.flatLessons.filter(l => l.type === 'song' && l.songKind === 'melody').forEach(song => {
    let total = 0;
    song.notes.forEach(n => {
      assert.ok(n.string >= 0 && n.string <= 3, song.id);
      assert.ok(n.fret >= 0 && n.fret <= 12, song.id);
      assert.ok(n.beats > 0, song.id);
      total += n.beats;
    });
    assert.equal(total % song.timeSig.num, 0, song.id);
  });
});

test('all chord shapes have four strings and finger assignments', () => {
  Object.keys(C.chords).forEach(name => {
    const chord = C.chords[name];
    assert.equal(chord.frets.length, 4, name);
    assert.equal(chord.fingers.length, 4, name);
  });
});
