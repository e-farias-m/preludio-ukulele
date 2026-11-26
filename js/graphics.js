(function(){
  'use strict';
  function fretboard(fret, string){
    var w=400, h=120;
    var nutX=12;
    var fretSpacing=26;
    var numFrets=12;
    var bodyX=12+numFrets*fretSpacing+16;
    var s='<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg">';
    // headstock
    s+='<rect x="0" y="30" width="12" height="60" rx="4" fill="#8b7355" stroke="#5e3a1f" stroke-width="1.5"/>';
    for(var p=0;p<4;p++){
      var py=34+p*14;
      s+='<circle cx="6" cy="'+py+'" r="4" fill="#c4bdb3" stroke="#5e3a1f" stroke-width="1"/>';
    }
    // neck
    s+='<rect x="'+nutX+'" y="20" width="'+(numFrets*fretSpacing)+'" height="80" fill="#c8965a" stroke="#5e3a1f" stroke-width="1.5"/>';
    // nut
    s+='<rect x="'+nutX+'" y="20" width="4" height="80" fill="#f5f1eb" stroke="#5e3a1f" stroke-width="1"/>';
    // frets
    for(var f=1;f<=numFrets;f++){
      var fx=nutX+f*fretSpacing;
      s+='<line x1="'+fx+'" y1="20" x2="'+fx+'" y2="100" stroke="#c4bdb3" stroke-width="1.5"/>';
    }
    // fret markers (dots) at 3,5,7,10,12
    [3,5,7,10,12].forEach(function(fr){
      var fx=nutX+fr*fretSpacing - fretSpacing/2;
      s+='<circle cx="'+fx+'" cy="60" r="3" fill="#5e3a1f"/>';
      if(fr===12){ s+='<circle cx="'+fx+'" cy="40" r="3" fill="#5e3a1f"/><circle cx="'+fx+'" cy="80" r="3" fill="#5e3a1f"/>'; }
    });
    // strings
    for(var st=0;st<4;st++){
      var sy=28+st*14.67;
      s+='<line x1="'+nutX+'" y1="'+sy+'" x2="'+(nutX+numFrets*fretSpacing)+'" y2="'+sy+'" stroke="#8b7355" stroke-width="1.5"/>';
    }
    // body (ellipse + sound hole)
    s+='<ellipse cx="'+(bodyX+40)+'" cy="60" rx="45" ry="50" fill="#c8965a" stroke="#5e3a1f" stroke-width="1.5"/>';
    s+='<circle cx="'+(bodyX+40)+'" cy="60" r="16" fill="#2d3748" stroke="#5e3a1f" stroke-width="1.5"/>';
    // note dot
    if(typeof fret==='number' && typeof string==='number'){
      var dx = (fret===0) ? (nutX+2) : (nutX + fret*fretSpacing - fretSpacing/2);
      var dy = 28 + string*14.67;
      s+='<circle cx="'+dx+'" cy="'+dy+'" r="7" fill="#c05621" stroke="#fff" stroke-width="2"/>';
    }
    s+='</svg>';
    return s;
  }
  var Graphics={ fretboard:fretboard };
  if(typeof window!=='undefined') window.Graphics=Graphics;
  if(typeof module!=='undefined' && module.exports) module.exports=Graphics;
})();
