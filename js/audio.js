(function(){
  'use strict';
  var Audio={ctx:null,master:null,ready:false};
  function ensureCtx(){ if(Audio.ctx) return Audio.ctx; var C=window.AudioContext||window.webkitAudioContext; if(!C) return null; Audio.ctx=new C(); Audio.master=Audio.ctx.createGain(); Audio.master.gain.value=0.8; Audio.master.connect(Audio.ctx.destination); Audio.ready=true; return Audio.ctx; }
  function pluck(freq){ var ctx=ensureCtx(); if(!ctx) return; var t0=ctx.currentTime+0.02; var osc=ctx.createOscillator(); var gain=ctx.createGain(); osc.type='triangle'; osc.frequency.value=freq; gain.gain.setValueAtTime(0.001,t0); gain.gain.exponentialRampToValueAtTime(0.5,t0+0.01); gain.gain.exponentialRampToValueAtTime(0.001,t0+1.2); osc.connect(gain); gain.connect(Audio.master); osc.start(t0); osc.stop(t0+1.3); }
  var AudioAPI={ init:ensureCtx, play:pluck, pluck:pluck };
  if(typeof window!=='undefined') window.Audio=AudioAPI;
  if(typeof module!=='undefined' && module.exports) module.exports=AudioAPI;
})();
