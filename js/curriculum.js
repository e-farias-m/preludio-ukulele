const CURRICULUM = {
  instrument: 'ukulele',
  tuning: ['G4','C4','E4','A4'],
  lessons: [
    { id:'u1', note:'C', octave:4, string:1, fret:0, freq:261.63 },
    { id:'u2', note:'D', octave:4, string:1, fret:2, freq:293.66 },
    { id:'u3', note:'E', octave:4, string:1, fret:4, freq:329.63 },
    { id:'u4', note:'F', octave:4, string:1, fret:5, freq:349.23 },
    { id:'u5', note:'G', octave:4, string:1, fret:7, freq:392.00 },
    { id:'u6', note:'A', octave:4, string:1, fret:9, freq:440.00 },
    { id:'u7', note:'B', octave:4, string:1, fret:11, freq:493.88 },
    { id:'u8', note:'C', octave:5, string:1, fret:12, freq:523.25 },
  ],
  chords: [
    { name:'C7', frets:[0,0,0,1], fingers:[null,null,null,1] },
    { name:'C', frets:[0,0,0,3], fingers:[null,null,null,3] },
    { name:'F', frets:[2,0,1,0], fingers:[2,null,1,null] },
    { name:'G7', frets:[0,2,1,2], fingers:[null,2,1,3] },
    { name:'Am', frets:[2,0,0,0], fingers:[2,null,null,null] },
    { name:'G', frets:[0,2,3,2], fingers:[null,1,3,2] },
    { name:'Dm', frets:[2,2,1,0], fingers:[1,3,2,null] },
    { name:'Em', frets:[0,4,3,2], fingers:[null,3,2,1] },
    { name:'A', frets:[2,1,0,0], fingers:[2,1,null,null] },
    { name:'D', frets:[2,2,2,0], fingers:[1,2,3,null] },
    { name:'D7', frets:[2,0,2,0], fingers:[2,null,1,null] },
    { name:'A7', frets:[0,1,0,0], fingers:[null,1,null,null] },
  ]
};
if(typeof window!=='undefined') window.CURRICULUM=CURRICULUM;
if(typeof module!=='undefined' && module.exports) module.exports=CURRICULUM;
