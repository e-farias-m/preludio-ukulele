// curriculum.js — Ukulele curriculum for Preludio Ukulele
//
// Tuning: gCEA (reentrant).
// String indices match the fretboard diagram:
//   0 = G (bottom), 1 = C, 2 = E, 3 = A (top)
// Frets: 0 (open) through 12.

const CURRICULUM = {
  instrument: 'ukulele',
  name: 'Ukulele',
  tuning: ['G4', 'C4', 'E4', 'A4'],
  tuningFreqs: [392.00, 261.63, 329.63, 440.00],
  stringNames: ['G', 'C', 'E', 'A'],

  chords: {
    C7: { name: 'C7', frets: [0, 0, 0, 1], fingers: [null, null, null, 1] },
    C:  { name: 'C',  frets: [0, 0, 0, 3], fingers: [null, null, null, 3] },
    F:  { name: 'F',  frets: [2, 0, 1, 0], fingers: [2, null, 1, null] },
    G7: { name: 'G7', frets: [0, 2, 1, 2], fingers: [null, 2, 1, 3] },
    Am: { name: 'Am', frets: [2, 0, 0, 0], fingers: [2, null, null, null] },
    G:  { name: 'G',  frets: [0, 2, 3, 2], fingers: [null, 1, 3, 2] },
    Dm: { name: 'Dm', frets: [2, 2, 1, 0], fingers: [2, 3, 1, null] },
    Em: { name: 'Em', frets: [0, 4, 3, 2], fingers: [null, 3, 2, 1] },
    A:  { name: 'A',  frets: [2, 1, 0, 0], fingers: [2, 1, null, null] },
    D:  { name: 'D',  frets: [2, 2, 2, 0], fingers: [1, 2, 3, null] },
    D7: { name: 'D7', frets: [2, 0, 2, 0], fingers: [2, null, 1, null] },
    A7: { name: 'A7', frets: [0, 1, 0, 0], fingers: [null, 1, null, null] }
  },

  units: [
    {
      id: 'first-sounds',
      title: 'First sounds',
      subtitle: 'Open strings',
      lessons: [
        { id: 'g-open', type: 'note', title: 'Open G', note: 'G', octave: 4,
          string: 0, fret: 0, freq: 392.00, quizKind: 'string',
          description: 'Your first string. G is the bottom string in the diagram.',
          prompt: 'Pluck the G string without pressing any fret.' },
        { id: 'c-open', type: 'note', title: 'Open C', note: 'C', octave: 4,
          string: 1, fret: 0, freq: 261.63, quizKind: 'string',
          description: 'The C string is the second from the bottom.',
          prompt: 'Pluck the C string open. This is the home note of the scale.' },
        { id: 'e-open', type: 'note', title: 'Open E', note: 'E', octave: 4,
          string: 2, fret: 0, freq: 329.63, quizKind: 'string',
          description: 'The E string is the second from the top.',
          prompt: 'Pluck the E string open.' },
        { id: 'a-open', type: 'note', title: 'Open A', note: 'A', octave: 4,
          string: 3, fret: 0, freq: 440.00, quizKind: 'string',
          description: 'The A string is the top string in the diagram.',
          prompt: 'Pluck the A string open.' }
      ]
    },
    {
      id: 'first-chords',
      title: 'First chords',
      subtitle: 'One finger at a time',
      lessons: [
        { id: 'c7', type: 'chord', title: 'C7', chord: 'C7',
          description: 'One finger, one fret. The easiest chord on the ukulele.',
          prompt: 'Place your index finger on the A string, 1st fret. Strum all four strings.' },
        { id: 'c', type: 'chord', title: 'C', chord: 'C',
          description: 'The C chord uses one finger on the A string, 3rd fret.',
          prompt: 'Place your ring finger on the A string, 3rd fret. Strum all four strings.' }
      ]
    },
    {
      id: 'two-chord-songs',
      title: 'Two-chord songs',
      subtitle: 'Add F',
      lessons: [
        { id: 'f', type: 'chord', title: 'F', chord: 'F',
          description: 'F uses two fingers: middle on the G string, index on the E string.',
          prompt: 'Middle finger on G string 2nd fret; index finger on E string 1st fret. Strum all four strings.' },
        { id: 'frere-jacques', type: 'song', songKind: 'chord', title: 'Frère Jacques',
          bpm: 92, timeSig: { num: 4, den: 4 },
          bars: ['C', 'C', 'C', 'C', 'F', 'F', 'C', 'C', 'F', 'C', 'F', 'C'],
          strum: ['D', 'D', 'D', 'U'],
          description: 'A French folk round you can play with just C and F.',
          prompt: 'Strum C for the first four bars, then follow the chart. Change chords on the first beat of each bar.' },
        { id: 'first-blues', type: 'song', songKind: 'chord', title: 'First Blues',
          bpm: 76, timeSig: { num: 4, den: 4 },
          bars: ['C7', 'C7', 'C7', 'C7', 'F', 'F', 'C7', 'C7'],
          strum: ['D', 'D', 'D', 'D'],
          description: 'A slow eight-bar blues using C7 and F. The seventh gives it a bluesy colour.',
          prompt: 'Four bars of C7, two of F, then back to C7. Let each strum ring.' }
      ]
    },
    {
      id: 'three-chord-songs',
      title: 'Three-chord songs',
      subtitle: 'Add G7',
      lessons: [
        { id: 'g7', type: 'chord', title: 'G7', chord: 'G7',
          description: 'G7 adds a bluesy pull back to C.',
          prompt: 'Middle on C string 2nd fret, index on E string 1st fret, ring on A string 2nd fret.' },
        { id: 'saints', type: 'song', songKind: 'chord', title: 'When the Saints Go Marching In',
          bpm: 100, timeSig: { num: 4, den: 4 },
          bars: ['C', 'F', 'C', 'G7', 'C', 'F', 'G7', 'C', 'C', 'F', 'C', 'G7', 'C', 'F', 'G7', 'C'],
          strum: ['D', 'D', 'U', 'D'],
          description: 'A traditional spiritual. Three chords and a marching pulse.',
          prompt: 'Keep your strumming hand moving in steady quarter notes. Change chords on the first beat of the bar.' },
        { id: 'la-bamba', type: 'song', songKind: 'chord', title: 'La Bamba',
          bpm: 104, timeSig: { num: 4, den: 4 },
          bars: ['C', 'F', 'G7', 'C', 'C', 'F', 'G7', 'C', 'C', 'F', 'G7', 'C', 'C', 'F', 'G7', 'C'],
          strum: ['D', 'D', 'U', 'D'],
          description: 'A traditional son jarocho from Veracruz, Mexico. Three chords, fast and festive.',
          prompt: 'C, F, G7, C — one bar each. Keep the changes crisp and the strum relaxed.' }
      ]
    },
    {
      id: 'four-chord-progression',
      title: 'The four-chord progression',
      subtitle: 'Am and G',
      lessons: [
        { id: 'am', type: 'chord', title: 'Am', chord: 'Am',
          description: 'A minor is one finger on the G string.',
          prompt: 'Middle finger on G string 2nd fret. Strum all four strings.' },
        { id: 'g', type: 'chord', title: 'G', chord: 'G',
          description: 'G is the V chord in C major.',
          prompt: 'Index on C string 2nd fret, ring on E string 3rd fret, middle on A string 2nd fret.' },
        { id: 'water-is-wide', type: 'song', songKind: 'chord', title: 'The Water Is Wide',
          bpm: 72, timeSig: { num: 3, den: 4 },
          bars: ['C', 'F', 'C', 'Am', 'G', 'C', 'F', 'G', 'C', 'F', 'C', 'Am', 'G', 'C', 'F', 'C'],
          strum: ['D', 'D', 'U'],
          description: 'A gentle folk song in 3/4 time. Four chords, slow and steady.',
          prompt: 'One chord per bar. Let the last strum ring while you move to the next chord.' }
      ]
    },
    {
      id: 'more-colours',
      title: 'More colours',
      subtitle: 'Dm, Em, A, D, D7, A7',
      lessons: [
        { id: 'dm', type: 'chord', title: 'Dm', chord: 'Dm',
          description: 'D minor is the ii chord in C major.',
          prompt: 'Index on E string 1st fret, middle on G string 2nd fret, ring on C string 2nd fret.' },
        { id: 'em', type: 'chord', title: 'Em', chord: 'Em',
          description: 'E minor is the iii chord in C major.',
          prompt: 'Index on A string 2nd fret, middle on E string 3rd fret, ring on C string 4th fret.' },
        { id: 'a', type: 'chord', title: 'A', chord: 'A',
          description: 'A is the V of D — a secondary dominant.',
          prompt: 'Index on C string 1st fret, middle on G string 2nd fret.' },
        { id: 'd', type: 'chord', title: 'D', chord: 'D',
          description: 'D is the V chord in G major.',
          prompt: 'Index on G string 2nd fret, middle on C string 2nd fret, ring on E string 2nd fret.' },
        { id: 'd7', type: 'chord', title: 'D7', chord: 'D7',
          description: 'D7 is the V7 of G.',
          prompt: 'Middle on G string 2nd fret, index on E string 2nd fret.' },
        { id: 'a7', type: 'chord', title: 'A7', chord: 'A7',
          description: 'A7 is the V7 of D.',
          prompt: 'Index on C string 1st fret.' },
        { id: 'scarborough-fair', type: 'song', songKind: 'chord', title: 'Scarborough Fair',
          bpm: 84, timeSig: { num: 3, den: 4 },
          bars: ['Am', 'G', 'Am', 'C', 'Am', 'G', 'Am', 'D', 'Am', 'G', 'Am', 'C', 'Am', 'G', 'D', 'Am'],
          strum: ['D', 'D', 'U'],
          description: 'An old English ballad in A minor. The D chord adds a bright lift.',
          prompt: 'Keep the Am shape relaxed as you move to G. The D chord is the surprise at the end of each phrase.' }
      ]
    },
    {
      id: 'c-major-scale',
      title: 'C major scale',
      subtitle: 'Single notes on the C string',
      lessons: [
        { id: 'c4-scale', type: 'note', title: 'C (open)', note: 'C', octave: 4,
          string: 1, fret: 0, freq: 261.63, quizKind: 'note',
          description: 'The home note. Open C string.',
          prompt: 'Pluck the open C string.' },
        { id: 'd4', type: 'note', title: 'D', note: 'D', octave: 4,
          string: 1, fret: 2, freq: 293.66, quizKind: 'note',
          description: 'D is two frets up on the C string.',
          prompt: 'Press the C string at the 2nd fret.' },
        { id: 'e4', type: 'note', title: 'E', note: 'E', octave: 4,
          string: 1, fret: 4, freq: 329.63, quizKind: 'note',
          description: 'E is four frets up.',
          prompt: 'Press the C string at the 4th fret.' },
        { id: 'f4', type: 'note', title: 'F', note: 'F', octave: 4,
          string: 1, fret: 5, freq: 349.23, quizKind: 'note',
          description: 'F is five frets up.',
          prompt: 'Press the C string at the 5th fret.' },
        { id: 'g4', type: 'note', title: 'G', note: 'G', octave: 4,
          string: 1, fret: 7, freq: 392.00, quizKind: 'note',
          description: 'G is seven frets up.',
          prompt: 'Press the C string at the 7th fret.' },
        { id: 'ode-to-joy', type: 'song', songKind: 'melody', title: 'Ode to Joy',
          bpm: 100, timeSig: { num: 4, den: 4 },
          notes: [
            { note: 'E', string: 1, fret: 4, beats: 1 },
            { note: 'E', string: 1, fret: 4, beats: 1 },
            { note: 'F', string: 1, fret: 5, beats: 1 },
            { note: 'G', string: 1, fret: 7, beats: 1 },
            { note: 'G', string: 1, fret: 7, beats: 1 },
            { note: 'F', string: 1, fret: 5, beats: 1 },
            { note: 'E', string: 1, fret: 4, beats: 1 },
            { note: 'D', string: 1, fret: 2, beats: 1 },
            { note: 'C', string: 1, fret: 0, beats: 1 },
            { note: 'C', string: 1, fret: 0, beats: 1 },
            { note: 'D', string: 1, fret: 2, beats: 1 },
            { note: 'E', string: 1, fret: 4, beats: 1 },
            { note: 'E', string: 1, fret: 4, beats: 1.5 },
            { note: 'D', string: 1, fret: 2, beats: 0.5 },
            { note: 'D', string: 1, fret: 2, beats: 2 },
            { note: 'E', string: 1, fret: 4, beats: 1 },
            { note: 'E', string: 1, fret: 4, beats: 1 },
            { note: 'F', string: 1, fret: 5, beats: 1 },
            { note: 'G', string: 1, fret: 7, beats: 1 },
            { note: 'G', string: 1, fret: 7, beats: 1 },
            { note: 'F', string: 1, fret: 5, beats: 1 },
            { note: 'E', string: 1, fret: 4, beats: 1 },
            { note: 'D', string: 1, fret: 2, beats: 1 },
            { note: 'C', string: 1, fret: 0, beats: 1 },
            { note: 'C', string: 1, fret: 0, beats: 1 },
            { note: 'D', string: 1, fret: 2, beats: 1 },
            { note: 'E', string: 1, fret: 4, beats: 1 },
            { note: 'D', string: 1, fret: 2, beats: 1.5 },
            { note: 'C', string: 1, fret: 0, beats: 0.5 },
            { note: 'C', string: 1, fret: 0, beats: 2 }
          ],
          description: "Beethoven's famous melody, played on the C string with the first five notes of the scale.",
          prompt: 'Play each note with a relaxed finger. Let the phrase breathe at the end of each line.' },
        { id: 'a4', type: 'note', title: 'A', note: 'A', octave: 4,
          string: 1, fret: 9, freq: 440.00, quizKind: 'note',
          description: 'A is nine frets up.',
          prompt: 'Press the C string at the 9th fret.' },
        { id: 'b4', type: 'note', title: 'B', note: 'B', octave: 4,
          string: 1, fret: 11, freq: 493.88, quizKind: 'note',
          description: 'B is eleven frets up.',
          prompt: 'Press the C string at the 11th fret.' },
        { id: 'c5', type: 'note', title: 'High C', note: 'C', octave: 5,
          string: 1, fret: 12, freq: 523.25, quizKind: 'note',
          description: 'One octave above open C.',
          prompt: 'Press the C string at the 12th fret.' }
      ]
    },
    {
      id: 'favourites',
      title: 'Favourite tunes',
      subtitle: 'Well-known songs for the chords you know.',
      lessons: [
        { id: 'twinkle', type: 'song', songKind: 'chord', title: 'Twinkle, Twinkle, Little Star',
          bpm: 88, timeSig: { num: 4, den: 4 },
          bars: ['C', 'C', 'F', 'C', 'C', 'F', 'C', 'F'],
          strum: ['D', 'D', 'D', 'D'],
          description: 'A gentle nursery tune using just C and F.',
          prompt: 'Two bars of C, then two of F. Keep the strum slow and even.' },
        { id: 'mary-lamb', type: 'song', songKind: 'chord', title: 'Mary Had a Little Lamb',
          bpm: 92, timeSig: { num: 4, den: 4 },
          bars: ['C', 'C', 'F', 'C', 'C', 'F', 'G7', 'C'],
          strum: ['D', 'D', 'U', 'D'],
          description: 'A simple melody about a little lamb. Three familiar chords.',
          prompt: 'Change chords on the first beat of each bar. Keep the pulse steady.' },
        { id: 'jingle-bells', type: 'song', songKind: 'chord', title: 'Jingle Bells',
          bpm: 104, timeSig: { num: 4, den: 4 },
          bars: ['C', 'C', 'F', 'C', 'C', 'C', 'G7', 'C'],
          strum: ['D', 'D', 'U', 'D'],
          description: 'A cheerful winter song with a bright, bouncing pulse.',
          prompt: 'One chord per bar. Let the last strum ring before you change.' }
      ]
    }
  ]
};

// Flatten the lesson path so progress and unlocking stay simple.
CURRICULUM.flatLessons = [];
CURRICULUM.units.forEach((unit) => {
  unit.lessons.forEach((lesson) => {
    lesson.unitId = unit.id;
    lesson.unitTitle = unit.title;
    lesson.unitSubtitle = unit.subtitle;
    lesson.index = CURRICULUM.flatLessons.length;
    CURRICULUM.flatLessons.push(lesson);
  });
});

if (typeof window !== 'undefined') window.CURRICULUM = CURRICULUM;
if (typeof module !== 'undefined' && module.exports) module.exports = CURRICULUM;
