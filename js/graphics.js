(function(){
  'use strict';
  function fretboard(fret, string){
    // Vertical ukulele: headstock top, body bottom.
    var w=200, h=420;
    var neckLeft=70, neckRight=130, neckW=60;
    var nutY=60;
    var fretSpacing=22;
    var numFrets=12;
    var bodyY=60+numFrets*fretSpacing+20;
    var s='<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg">';
    // headstock
    s+='<rect x="75" y="0" width="50" height="50" rx="6" fill="#8b7355" stroke="#5e3a1f" stroke-width="1.5"/>';
    // tuning pegs
    for(var p=0;p<4;p++){
      var px = p<2 ? 82 : 118;
      var py = 12 + (p%2)*26;
      s+='<circle cx="'+px+'" cy="'+py+'" r="6" fill="#c4bdb3" stroke="#5e3a1f" stroke-width="1"/>';
    }
    // neck
    s+='<rect x="'+neckLeft+'" y="50" width="'+neckW+'" height="'+(numFrets*fretSpacing+10)+'" fill="#c8965a" stroke="#5e3a1f" stroke-width="1.5"/>';
    // nut
    s+='<rect x="'+neckLeft+'" y="50" width="'+neckW+'" height="4" fill="#f5f1eb" stroke="#5e3a1f" stroke-width="1"/>';
    // frets
    for(var f=1;f<=numFrets;f++){
      var fy=50+f*fretSpacing;
      s+='<line x1="'+neckLeft+'" y1="'+fy+'" x2="'+neckRight+'" y2="'+fy+'" stroke="#c4bdb3" stroke-width="1.5"/>';
    }
    // fret markers (dots) at 3,5,7,10,12
    [3,5,7,10,12].forEach(function(fr){
      var fy=50+fr*fretSpacing - fretSpacing/2;
      s+='<circle cx="100" cy="'+fy+'" r="3" fill="#5e3a1f"/>';
      if(fr===12){ s+='<circle cx="85" cy="'+fy+'" r="3" fill="#5e3a1f"/><circle cx="115" cy="'+fy+'" r="3" fill="#5e3a1f"/>'; }
    });
    // strings
    for(var st=0;st<4;st++){
      var sx=neckLeft+10+st*13.33;
      s+='<line x1="'+sx+'" y1="54" x2="'+sx+'" y2="'+(50+numFrets*fretSpacing+4)+'" stroke="#8b7355" stroke-width="1.5"/>';
    }
    // body (figure-eight approximated by two circles)
    var bodyCx=100, bodyCy=bodyY+60;
    s+='<ellipse cx="'+bodyCx+'" cy="'+(bodyY+30)+'" rx="45" ry="35" fill="#c8965a" stroke="#5e3a1f" stroke-width="1.5"/>';
    s+='<ellipse cx="'+bodyCx+'" cy="'+(bodyY+90)+'" rx="55" ry="45" fill="#c8965a" stroke="#5e3a1f" stroke-width="1.5"/>';
    // sound hole (simple circle)
    s+='<circle cx="'+bodyCx+'" cy="'+(bodyY+90)+'" r="18" fill="#2d3748" stroke="#5e3a1f" stroke-width="1.5"/>';
    // note dot
    if(typeof fret==='number' && typeof string==='number'){
      var fx=neckLeft+10+string*13.33;
      var fy = (fret===0) ? 52 : (50 + fret*fretSpacing - fretSpacing/2);
      s+='<circle cx="'+fx+'" cy="'+fy+'" r="8" fill="#c05621" stroke="#fff" stroke-width="2"/>';
    }
    s+='</svg>';
    return s;
  }
  var Graphics={ fretboard:fretboard };
  if(typeof window!=='undefined') window.Graphics=Graphics;
  if(typeof module!=='undefined' && module.exports) module.exports=Graphics;
})();
