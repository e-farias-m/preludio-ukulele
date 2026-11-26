(function(){
  'use strict';
  var Audio={ctx:null,master:null,filter:null,ready:false};
  function ensureCtx(){
    if(Audio.ctx){
      if(Audio.ctx.state==='suspended' && Audio.ctx.resume) Audio.ctx.resume();
      return Audio.ctx;
    }
    var C=window.AudioContext||window.webkitAudioContext;
    if(!C) return null;
    Audio.ctx=new C();
    Audio.master=Audio.ctx.createGain();
    Audio.master.gain.value=0.8;
    Audio.filter=Audio.ctx.createBiquadFilter();
    Audio.filter.type='lowpass';
    Audio.filter.frequency.value=3600;
    Audio.filter.Q.value=0.7;
    Audio.master.connect(Audio.filter);
    Audio.filter.connect(Audio.ctx.destination);
    Audio.ready=true;
    return Audio.ctx;
  }
  function pluck(freq,when,gain){
    var ctx=ensureCtx();
    if(!ctx) return;
    var t0=ctx.currentTime+(when==null?0.02:when);
    var level=(gain==null?0.5:gain);
    var osc=ctx.createOscillator();
    var g=ctx.createGain();
    osc.type='triangle';
    osc.frequency.value=freq;
    g.gain.setValueAtTime(0.001,t0);
    g.gain.exponentialRampToValueAtTime(level,t0+0.01);
    g.gain.exponentialRampToValueAtTime(0.001,t0+1.2);
    osc.connect(g);
    g.connect(Audio.master);
    osc.start(t0);
    osc.stop(t0+1.3);
  }
  function noteFreq(stringIndex,fret){
    var base=[392.00,261.63,329.63,440.00][stringIndex];
    if(!base) return 0;
    return base*Math.pow(2,(fret||0)/12);
  }
  function strum(freqs,opts){
    opts=opts||{};
    var list=(opts.down?freqs.slice():freqs.slice().reverse());
    list.forEach(function(f,i){
      if(f) pluck(f,0.02+i*0.045,0.32);
    });
  }
  function playChord(chord){
    if(!chord || !chord.frets) return;
    var freqs=[];
    chord.frets.forEach(function(f,i){
      if(f>=0) freqs.push(noteFreq(i,f));
    });
    strum(freqs,{down:true});
  }
  var AudioAPI={
    init:ensureCtx,
    play:pluck,
    pluck:pluck,
    strum:strum,
    playChord:playChord,
    noteFreq:noteFreq
  };
  if(typeof window!=='undefined') window.Audio=AudioAPI;
  if(typeof module!=='undefined' && module.exports) module.exports=AudioAPI;
})();
