(function(){
  'use strict';
  var APP={ screen:'home', lesson:0 };
  function render(){
    var app=document.getElementById('app');
    if(!app) return;
    var L=CURRICULUM.lessons[APP.lesson];
    app.innerHTML=
      '<h1>'+t('Preludio Ukulele')+'</h1>'+
      '<p>Lesson '+(APP.lesson+1)+' of '+CURRICULUM.lessons.length+'</p>'+
      '<div class="fretboard">'+Graphics.fretboard(L.fret,L.string)+'</div>'+
      '<p>Note: '+L.note+L.octave+' (string '+(L.string+1)+', fret '+L.fret+')</p>'+
      '<div style="display:flex;gap:8px;margin-top:12px">'+
        '<button class="primary" id="playBtn">'+t('Listen')+'</button>'+
        '<button id="prevBtn">Prev</button>'+
        '<button id="nextBtn">Next</button>'+
      '</div>';
    document.getElementById('playBtn').onclick=function(){ Audio.play(L.freq); };
    document.getElementById('prevBtn').onclick=function(){ if(APP.lesson>0){ APP.lesson--; render(); } };
    document.getElementById('nextBtn').onclick=function(){ if(APP.lesson<CURRICULUM.lessons.length-1){ APP.lesson++; render(); } };
  }
  if(typeof window!=='undefined'){ window.APP=APP; window.render=render; }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',render); else render();
})();
