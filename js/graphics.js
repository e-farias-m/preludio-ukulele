(function(){
  'use strict';
  function fretboard(fret, string, note){
    var nutX=31.3, fretSpacing=3.69;
    var stringY=[77.9,72.4,66.8,61.3];
    var dx = (fret===0) ? nutX : (nutX + fret*fretSpacing - fretSpacing/2);
    var dy = stringY[string] || 50;
    var label = note || '';
    var s='<div style="position:relative;display:inline-block;max-width:100%">';
    s+='<img src="images/instruments/fretboard.jpg" alt="Ukulele fretboard" style="width:100%;height:auto;display:block;border-radius:8px;">';
    s+='<span style="position:absolute;left:'+dx+'%;top:'+dy+'%;width:23px;height:23px;border-radius:50%;background:#fff;border:2px solid #000;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#000;box-shadow:0 1px 4px rgba(0,0,0,0.3);">'+label+'</span>';
    s+='</div>';
    return s;
  }
  function chordDiagram(chord){
    var nutX=31.3, fretSpacing=3.69;
    var stringY=[77.9,72.4,66.8,61.3];
    var s='<div style="position:relative;display:inline-block;max-width:100%">';
    s+='<img src="images/instruments/fretboard.jpg" alt="Ukulele fretboard" style="width:100%;height:auto;display:block;border-radius:8px;">';
    s+='<div style="position:absolute;left:4%;top:5%;font-size:16px;font-weight:700;color:#000;background:rgba(255,255,255,0.8);padding:2px 6px;border-radius:4px;">'+chord.name+'</div>';
    chord.frets.forEach(function(f,i){
      if(f>0){
        var dx = nutX + f*fretSpacing - fretSpacing/2;
        var dy = stringY[i];
        var finger = chord.fingers[i];
        var label = (finger!=null) ? String(finger) : '';
        s+='<span style="position:absolute;left:'+dx+'%;top:'+dy+'%;width:23px;height:23px;border-radius:50%;background:#fff;border:2px solid #000;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#000;box-shadow:0 1px 4px rgba(0,0,0,0.3);">'+label+'</span>';
      }
    });
    s+='</div>';
    return s;
  }
  var Graphics={ fretboard:fretboard, chordDiagram:chordDiagram };
  if(typeof window!=='undefined') window.Graphics=Graphics;
  if(typeof module!=='undefined' && module.exports) module.exports=Graphics;
})();
