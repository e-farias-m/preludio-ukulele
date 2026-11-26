(function(){
  'use strict';
  var APP={ mode:'notes', index:0 };
  function render(){
    var app=document.getElementById('app');
    if(!app) return;
    var html='<h1>'+t('Preludio Ukulele')+'</h1>';
    html+='<div style="display:flex;gap:8px;margin-bottom:12px">';
    html+='<button id="notesBtn"'+(APP.mode==='notes'?' class="primary"':'')+'>Notes</button>';
    html+='<button id="chordsBtn"'+(APP.mode==='chords'?' class="primary"':'')+'>Chords</button>';
    html+='</div>';
    if(APP.mode==='notes'){
      var L=CURRICULUM.lessons[APP.index];
      html+='<p>Lesson '+(APP.index+1)+' of '+CURRICULUM.lessons.length+'</p>';
      html+='<div class="fretboard">'+Graphics.fretboard(L.fret,L.string,L.note)+'</div>';
      html+='<p>Note: '+L.note+L.octave+' (string '+(L.string+1)+', fret '+L.fret+')</p>';
      html+='<div style="display:flex;gap:8px;margin-top:12px">';
      html+='<button class="primary" id="playBtn">'+t('Listen')+'</button>';
      html+='<button id="prevBtn">Prev</button>';
      html+='<button id="nextBtn">Next</button>';
      html+='</div>';
    } else {
      var C=CURRICULUM.chords[APP.index];
      html+='<p>Chord '+(APP.index+1)+' of '+CURRICULUM.chords.length+'</p>';
      html+='<div class="fretboard">'+Graphics.chordDiagram(C)+'</div>';
      html+='<div style="display:flex;gap:8px;margin-top:12px">';
      html+='<button id="prevBtn">Prev</button>';
      html+='<button id="nextBtn">Next</button>';
      html+='</div>';
    }
    app.innerHTML=html;
    if(APP.mode==='notes'){
      var L=CURRICULUM.lessons[APP.index];
      document.getElementById('playBtn').onclick=function(){ Audio.play(L.freq); };
    }
    document.getElementById('notesBtn').onclick=function(){ APP.mode='notes'; APP.index=0; render(); };
    document.getElementById('chordsBtn').onclick=function(){ APP.mode='chords'; APP.index=0; render(); };
    document.getElementById('prevBtn').onclick=function(){ if(APP.index>0){ APP.index--; render(); } };
    document.getElementById('nextBtn').onclick=function(){
      var len = APP.mode==='notes' ? CURRICULUM.lessons.length : CURRICULUM.chords.length;
      if(APP.index<len-1){ APP.index++; render(); }
    };
  }
  if(typeof window!=='undefined'){ window.APP=APP; window.render=render; }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',render); else render();
})();
