(function(){
  'use strict';
  function fretboard(fret, string, note){
    var nutX=8, fretSpacing=7.2;
    var stringY=[15,35,55,75];
    var dx = (fret===0) ? nutX : (nutX + fret*fretSpacing - fretSpacing/2);
    var dy = stringY[string] || 50;
    var label = note || '';
    var s='<div style="position:relative;display:inline-block;max-width:100%">';
    s+='<img src="images/instruments/fretboard.jpg" alt="Ukulele fretboard" style="width:100%;height:auto;display:block;border-radius:8px;">';
    s+='<span style="position:absolute;left:'+dx+'%;top:'+dy+'%;width:31px;height:31px;border-radius:50%;background:#fff;border:2px solid #000;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#000;box-shadow:0 1px 4px rgba(0,0,0,0.3);">'+label+'</span>';
    s+='</div>';
    return s;
  }
  var Graphics={ fretboard:fretboard };
  if(typeof window!=='undefined') window.Graphics=Graphics;
  if(typeof module!=='undefined' && module.exports) module.exports=Graphics;
})();
