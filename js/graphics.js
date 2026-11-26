(function(){
  'use strict';
  function fretboard(fret, string){
    var strings=4, frets=13, w=300, h=120;
    var sx=w/(frets+1), sy=h/(strings+1);
    var s='<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg">';
    // nut
    s+='<rect x="0" y="0" width="4" height="'+h+'" fill="#8b7355"/>';
    for(var f=1;f<=frets;f++){
      s+='<line x1="'+(f*sx)+'" y1="0" x2="'+(f*sx)+'" y2="'+h+'" stroke="#c4bdb3" stroke-width="1"/>';
    }
    for(var st=0;st<strings;st++){
      var y=(st+1)*sy;
      s+='<line x1="0" y1="'+y+'" x2="'+w+'" y2="'+y+'" stroke="#8b7355" stroke-width="2"/>';
    }
    // dot
    if(typeof fret==='number' && typeof string==='number'){
      var x=(fret===0?2:(fret*sx - sx/2));
      var y=(string+1)*sy;
      s+='<circle cx="'+x+'" cy="'+y+'" r="8" fill="#c05621"/>';
    }
    s+='</svg>';
    return s;
  }
  var Graphics={ fretboard:fretboard };
  if(typeof window!=='undefined') window.Graphics=Graphics;
  if(typeof module!=='undefined' && module.exports) module.exports=Graphics;
})();
