(function(){
  'use strict';
  var Audio={ctx:null,master:null,filter:null,ready:false};
  function setAudioSession(type){
    try{
      if(typeof navigator!=='undefined' && navigator.audioSession && typeof navigator.audioSession.type!=='undefined'){
        navigator.audioSession.type=type||'playback';
      }
    }catch(e){ /* unsupported */ }
  }
  function prepareForCapture(){ setAudioSession('play-and-record'); }
  function restorePlayback(){ setAudioSession('playback'); }
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
    setAudioSession('playback');
    return Audio.ctx;
  }
  function pluck(freq,when,gain,dest){
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
    g.connect(dest||Audio.master);
    osc.start(t0);
    osc.stop(t0+1.3);
  }
  function noteFreq(stringIndex,fret){
    var base=[392.00,261.63,329.63,440.00][stringIndex];
    if(!base) return 0;
    return base*Math.pow(2,(fret||0)/12);
  }
  function chordFreqs(chord){
    if(!chord || !chord.frets) return [];
    var freqs=[];
    chord.frets.forEach(function(f,i){
      if(f>=0) freqs.push(noteFreq(i,f));
    });
    return freqs;
  }
  function strum(freqs,opts){
    opts=opts||{};
    var list=(opts.down===false?freqs.slice().reverse():freqs.slice());
    var base=(opts.when==null?0.02:opts.when);
    var gain=(opts.gain==null?0.32:opts.gain);
    list.forEach(function(f,i){
      if(f) pluck(f,base+i*0.045,gain,opts.dest);
    });
  }
  function playChord(chord,opts){
    var o=opts||{};
    strum(chordFreqs(chord),{down:true,when:o.when,gain:o.gain,dest:o.dest});
  }
  function click(accent,when,dest){
    var ctx=ensureCtx();
    if(!ctx) return;
    var t0=ctx.currentTime+(when==null?0.02:when);
    var osc=ctx.createOscillator();
    var g=ctx.createGain();
    osc.type='triangle';
    osc.frequency.value=accent?1568:1046;
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(accent?0.2:0.13,t0+0.005);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+0.07);
    osc.connect(g);
    g.connect(dest||Audio.master);
    osc.start(t0);
    osc.stop(t0+0.09);
  }
  function createBus(){
    var ctx=ensureCtx();
    if(!ctx) return null;
    var g=ctx.createGain();
    g.gain.value=1;
    g.connect(Audio.master);
    return g;
  }
  function stopBus(bus){
    if(!bus) return;
    var ctx=ensureCtx();
    if(!ctx) return;
    try{
      var now=ctx.currentTime;
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(bus.gain.value,now);
      bus.gain.exponentialRampToValueAtTime(0.0001,now+0.08);
      setTimeout(function(){ try{ bus.disconnect(); }catch(e){} },160);
    }catch(e){
      try{ bus.disconnect(); }catch(e2){}
    }
  }
  var AudioAPI={
    init:ensureCtx,
    getContext:function(){ return ensureCtx(); },
    play:pluck,
    pluck:pluck,
    strum:strum,
    click:click,
    playChord:playChord,
    noteFreq:noteFreq,
    chordFreqs:chordFreqs,
    createBus:createBus,
    stopBus:stopBus,
    prepareForCapture:prepareForCapture,
    restorePlayback:restorePlayback
  };
  if(typeof window!=='undefined') window.Audio=AudioAPI;
  if(typeof module!=='undefined' && module.exports) module.exports=AudioAPI;
})();
