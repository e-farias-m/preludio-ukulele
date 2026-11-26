const CURRICULUM = {
  instrument: 'ukulele',
  tuning: ['G4','C4','E4','A4'],
  lessons: [
    { id:'u1', note:'C', octave:4, string:2, fret:0, freq:261.63 },
    { id:'u2', note:'D', octave:4, string:2, fret:2, freq:293.66 },
    { id:'u3', note:'E', octave:4, string:2, fret:4, freq:329.63 },
    { id:'u4', note:'F', octave:4, string:2, fret:5, freq:349.23 },
    { id:'u5', note:'G', octave:4, string:2, fret:7, freq:392.00 },
    { id:'u6', note:'A', octave:4, string:2, fret:9, freq:440.00 },
    { id:'u7', note:'B', octave:4, string:2, fret:11, freq:493.88 },
    { id:'u8', note:'C', octave:5, string:2, fret:12, freq:523.25 },
  ]
};
if(typeof window!=='undefined') window.CURRICULUM=CURRICULUM;
if(typeof module!=='undefined' && module.exports) module.exports=CURRICULUM;
