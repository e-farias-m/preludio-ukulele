(function(){
  'use strict';
  function fretboard(fret, string){
    // Use the provided photo as the fretboard. Dot position is approximate;
    // adjust percentages if needed.
    var nutX=8, fretSpacing=7.2; // % of image width
    var stringY=[22,40,60,78]; // % of image height for 4 strings
    var dx = (fret===0) ? nutX : (nutX + fret*fretSpacing - fretSpacing/2);
    var dy = stringY[string] || 50;
    var s='<div style="position:relative;display:inline-block;max-width:100%">';
    s+='<img src="images/instruments/fretboard.jpg" alt="Ukulele fretboard" style="width:100%;height:auto;display:block;border-radius:8px;">';
    s+='<span style="position:absolute;left:'+dx+'%;top:'+dy+'%;width:14px;height:14px;border-radius:50%;background:#c05621;border:2px solid #fff;transform:translate(-50%,-50%);box-shadow:0 1px 4px rgba(0,0,0,0.3);"></span>';
    s+='</div>';
    return s;
  }
  var Graphics={ fretboard:fretboard };
  if(typeof window!=='undefined') window.Graphics=Graphics;
  if(typeof module!=='undefined' && module.exports) module.exports=Graphics;
})();
