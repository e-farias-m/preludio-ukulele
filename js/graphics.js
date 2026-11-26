(function(){
  'use strict';
  var FRET_X=[31.5,33.8,37.5,41.7,45.8,49.5,53.5,56.9,60.4,63.7,67.1,69.9,72.7];
  var STRING_Y=[77.9,72.4,66.8,61.3];
  function fretboard(fret, string, note){
    var dx = (FRET_X[fret] != null) ? FRET_X[fret] : FRET_X[FRET_X.length-1];
    var dy = STRING_Y[string] || 50;
    var label = note || '';
    var s='<div style="position:relative;display:inline-block;max-width:100%">';
    s+='<img src="images/instruments/fretboard.jpg" width="800" height="313" alt="Ukulele fretboard" style="width:100%;height:auto;display:block;border-radius:8px;">';
    s+='<span class="fret-dot" style="left:'+dx+'%;top:'+dy+'%;">'+label+'</span>';
    s+='</div>';
    return s;
  }
  function chordDiagram(chord, opts){
    opts = opts || {};
    var s='<div style="position:relative;display:inline-block;max-width:100%">';
    s+='<img src="images/instruments/fretboard.jpg" width="800" height="313" alt="Ukulele fretboard" style="width:100%;height:auto;display:block;border-radius:8px;">';
    if(opts.showName!==false){
      s+='<div style="position:absolute;left:4%;top:5%;font-size:16px;font-weight:700;color:#000;background:rgba(255,255,255,0.8);padding:2px 6px;border-radius:4px;">'+chord.name+'</div>';
    }
    chord.frets.forEach(function(f,i){
      if(f>0){
        var dx = (FRET_X[f] != null) ? FRET_X[f] : FRET_X[FRET_X.length-1];
        var dy = STRING_Y[i];
        var finger = chord.fingers[i];
        var label = (finger!=null) ? String(finger) : '';
        s+='<span class="fret-dot" style="left:'+dx+'%;top:'+dy+'%;">'+label+'</span>';
      }
    });
    s+='</div>';
    return s;
  }

  // ── Chord song chart ─────────────────────────────────────────────────
  // One chord per bar. Bars are laid out four to a row; the playback
  // engine highlights the current bar and beat by data attribute.
  function songChart(song, opts){
    opts = opts || {};
    var bars = song.bars || [];
    var beats = song.timeSig ? song.timeSig.num : 4;
    var strum = song.strum || [];
    var cols = Math.min(Math.max(bars.length, 1), 4);
    var s = '<div class="song-chart">';
    s += '<div class="strum-legend"><span class="strum-label">' + (opts.strumLabel || 'Strum') + '</span>';
    strum.forEach(function(dir){
      if(dir === '-') s += '<span class="strum-arrow rest">·</span>';
      else s += '<span class="strum-arrow' + (dir === 'U' ? ' up' : '') + '">' + (dir === 'U' ? '↑' : '↓') + '</span>';
    });
    s += '</div>';
    s += '<div class="song-bars" style="grid-template-columns:repeat(' + cols + ',1fr)">';
    bars.forEach(function(chord, i){
      s += '<div class="song-bar" data-bar="' + i + '">';
      s += '<div class="song-bar-chord">' + chord + '</div>';
      s += '<div class="song-beats">';
      for(var b = 0; b < beats; b++){
        s += '<span class="song-beat" data-beat="' + b + '"></span>';
      }
      s += '</div></div>';
    });
    s += '</div></div>';
    return s;
  }

  // ── Melody tablature ─────────────────────────────────────────────────
  // Standard ukulele tab order, top to bottom: A E C G.
  // Notes are grouped in two-bar lines; each note carries its index so
  // playback can highlight it without rebuilding the SVG.
  function tab(song, opts){
    opts = opts || {};
    var notes = song.notes || [];
    var beatsPerBar = song.timeSig ? song.timeSig.num : 4;
    var beatsPerLine = beatsPerBar * 2;
    var totalBeats = 0;
    notes.forEach(function(n){ totalBeats += n.beats; });
    var lines = Math.max(1, Math.ceil(totalBeats / beatsPerLine));
    var width = 520;
    var left = 60;
    var right = 16;
    var lineGap = 100;
    var topPad = 28;
    var stringGap = 20;
    var height = topPad + lines * lineGap + 8;
    var beatW = (width - left - right) / beatsPerLine;
    var labels = ['A', 'E', 'C', 'G'];
    var order = [3, 2, 1, 0];

    var s = '<svg class="song-tab-svg" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + (opts.ariaLabel || 'Ukulele tablature') + '">';
    s += '<title>' + (opts.title || song.title || 'Melody') + '</title>';

    for(var line = 0; line < lines; line++){
      var lineStartBeat = line * beatsPerLine;
      var top = topPad + line * lineGap;

      // String lines and labels.
      order.forEach(function(stringIndex, row){
        var y = top + row * stringGap;
        s += '<line class="tab-string-line" x1="' + left + '" y1="' + y + '" x2="' + (width - right) + '" y2="' + y + '"/>';
        s += '<text class="tab-string-label" x="18" y="' + y + '" text-anchor="middle" dominant-baseline="central">' + labels[row] + '</text>';
      });

      // Bar lines.
      for(var b = 0; b <= beatsPerLine; b += beatsPerBar){
        var x = left + b * beatW;
        s += '<line class="tab-bar-line" x1="' + x + '" y1="' + (top - 12) + '" x2="' + x + '" y2="' + (top + 3 * stringGap + 12) + '"/>';
      }

      // Time signature on the first line.
      if(line === 0){
        s += '<text class="tab-time-sig" x="12" y="' + (top - 16) + '" text-anchor="middle">' + beatsPerBar + '/4</text>';
      }

      // Notes that begin on this line.
      notes.forEach(function(n, i){
        var start = 0;
        for(var k = 0; k < i; k++) start += notes[k].beats;
        if(start < lineStartBeat || start >= lineStartBeat + beatsPerLine) return;
        var x = left + (start - lineStartBeat) * beatW;
        var row = 3 - n.string; // string 3 (A) is top row, string 0 (G) is bottom
        var y = top + row * stringGap;
        s += '<g class="tab-note" data-note-index="' + i + '">';
        s += '<rect x="' + (x - 15) + '" y="' + (y - 11) + '" width="30" height="22" rx="6"/>';
        s += '<rect class="tab-note-name-bg" x="' + (x - 10) + '" y="' + (y - 28) + '" width="20" height="13" rx="3"/>';
        s += '<text class="tab-note-name" x="' + x + '" y="' + (y - 18) + '" text-anchor="middle">' + n.note + '</text>';
        s += '<text class="tab-fret" x="' + x + '" y="' + y + '" text-anchor="middle" dominant-baseline="central">' + n.fret + '</text>';
        s += '</g>';
      });
    }

    s += '</svg>';
    return s;
  }

  var Graphics={ fretboard:fretboard, chordDiagram:chordDiagram, songChart:songChart, tab:tab };
  if(typeof window!=='undefined') window.Graphics=Graphics;
  if(typeof module!=='undefined' && module.exports) module.exports=Graphics;
})();
