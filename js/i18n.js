(function(){
  'use strict';
  var LANG='en';
  var PT={ 'Preludio Ukulele':'Preludio Ukulele','Start':'Começar','Listen':'Ouvir','Stop':'Parar' };
  var FR={ 'Preludio Ukulele':'Preludio Ukulele','Start':'Commencer','Listen':'Écouter','Stop':'Arrêter' };
  function t(s){ if(LANG==='pt' && PT[s]) return PT[s]; if(LANG==='fr' && FR[s]) return FR[s]; return s; }
  function setLang(l){ LANG=(l==='pt'||l==='fr')?l:'en'; if(typeof render==='function') render(); }
  function getLang(){ return LANG; }
  if(typeof window!=='undefined'){ window.t=t; window.setLang=setLang; window.getLang=getLang; }
})();
