(function(){
  'use strict';
  function fretboard(fret, string, note){
    var fretX=[31.5,33.8,37.5,41.7,45.8,49.5,53.5,56.9,60.4,63.7,67.1,69.9,72.7];
    var stringY=[77.9,72.4,66.8,61.3];
    var dx = (fretX[fret] != null) ? fretX[fret] : fretX[fretX.length-1];
    var dy = stringY[string] || 50;
    var label = note || '';
    var s='<div style="position:relative;display:inline-block;max-width:100%">';
    s+='<img src="images/instruments/fretboard.jpg" width="800" height="313" alt="Ukulele fretboard" style="width:100%;height:auto;display:block;border-radius:8px;">';
    s+='<span class="fret-dot" style="left:'+dx+'%;top:'+dy+'%;">'+label+'</span>';
    s+='</div>';
    return s;
  }
  function chordDiagram(chord, opts){
    opts = opts || {};
    var fretX=[31.5,33.8,37.5,41.7,45.8,49.5,53.5,56.9,60.4,63.7,67.1,69.9,72.7];
    var stringY=[77.9,72.4,66.8,61.3];
    var s='<div style="position:relative;display:inline-block;max-width:100%">';
    s+='<img src="images/instruments/fretboard.jpg" width="800" height="313" alt="Ukulele fretboard" style="width:100%;height:auto;display:block;border-radius:8px;">';
    if(opts.showName!==false){
      s+='<div style="position:absolute;left:4%;top:5%;font-size:16px;font-weight:700;color:#000;background:rgba(255,255,255,0.8);padding:2px 6px;border-radius:4px;">'+chord.name+'</div>';
    }
    chord.frets.forEach(function(f,i){
      if(f>0){
        var dx = (fretX[f] != null) ? fretX[f] : fretX[fretX.length-1];
        var dy = stringY[i];
        var finger = chord.fingers[i];
        var label = (finger!=null) ? String(finger) : '';
        s+='<span class="fret-dot" style="left:'+dx+'%;top:'+dy+'%;">'+label+'</span>';
      }
    });
    s+='</div>';
    return s;
  }
  var Graphics={ fretboard:fretboard, chordDiagram:chordDiagram };
  if(typeof window!=='undefined') window.Graphics=Graphics;
  if(typeof module!=='undefined' && module.exports) module.exports=Graphics;
})();
