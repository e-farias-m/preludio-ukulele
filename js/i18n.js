// i18n.js — Multi-language layer for Preludio Ukulele (en, pt-BR, fr-CA)
(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'preludioUkuleleLang';

  var PT = {
    // UI
    "Continue where you left off": "Continue de onde parou",
    "Start here": "Comece aqui",
    "Start": "Começar",
    "All lessons complete": "Todas as lições concluídas",
    "Replay any lesson to keep your skills sharp.": "Repita qualquer lição para manter suas habilidades afiadas.",
    "Level": "Nível",
    "XP": "XP",
    "Day streak": "Sequência de dias",
    "First sounds": "Primeiros sons",
    "New here? Make your first sound": "Novo por aqui? Faça seu primeiro som",
    "A quick guide before note one.": "Um guia rápido antes da primeira nota.",
    "Unit": "Unidade",
    "of": "de",
    "Completed": "Concluído",
    "Locked": "Bloqueado",
    "Settings": "Configurações",
    "Back": "Voltar",
    "New note": "Nova nota",
    "New chord": "Novo acorde",
    "How to play it": "Como tocar",
    "Hear it": "Ouvir",
    "Continue": "Continuar",
    "Quick check": "Verificação rápida",
    "Which string is this?": "Qual é esta corda?",
    "Which note is this?": "Qual é esta nota?",
    "Which chord is this?": "Qual é este acorde?",
    "Correct!": "Correto!",
    "Not quite — try again.": "Quase — tente novamente.",
    "Your turn": "Sua vez",
    "I played it": "Eu toquei",
    "Take your time. When you are ready, mark it complete.": "Vá com calma. Quando estiver pronto, marque como concluído.",
    "Lesson complete!": "Lição concluída!",
    "Review complete!": "Revisão concluída!",
    "Practice rep": "Repetição",
    "Next lesson": "Próxima lição",
    "Back to map": "Voltar ao mapa",
    "Let's make your first sound": "Vamos fazer seu primeiro som",
    "A quick guide to holding, finding the strings, and strumming.": "Um guia rápido para segurar, encontrar as cordas e rasguear.",
    "Hold the ukulele": "Segure o ukulele",
    "Rest the body against your chest and let the neck point up and to the left. Keep your strumming hand relaxed.": "Apoie o corpo contra o peito e deixe o braço apontar para cima e para a esquerda. Mantenha a mão da batida relaxada.",
    "Find the strings": "Encontre as cordas",
    "The four strings are G, C, E, and A. In the horizontal fretboard diagram, they run from bottom to top as G, C, E, A.": "As quatro cordas são G, C, E e A. No diagrama horizontal, elas vão de baixo para cima como G, C, E, A.",
    "Strum": "Rasgue",
    "Drag your thumb or a felt pick across all four strings. Don't press any frets yet.": "Passe o polegar ou uma palheta de feltro pelas quatro cordas. Não pressione nenhuma casa ainda.",
    "Tip": "Dica",
    "Short nails on the fretting hand make chords much easier.": "Unhas curtas na mão que pressiona as cordas facilitam muito os acordes.",
    "Hear a strum": "Ouvir uma batida",
    "Start learning": "Começar a aprender",
    "Language": "Idioma",
    "Practice": "Prática",
    "Replay first sounds": "Repetir primeiros sons",
    "Reset all progress": "Redefinir todo o progresso",
    "Reset all progress?": "Redefinir todo o progresso?",
    "Progress is saved on this device.": "O progresso é salvo neste dispositivo.",

    // Unit titles
    "Open strings": "Cordas soltas",
    "First chords": "Primeiros acordes",
    "One finger at a time": "Um dedo de cada vez",
    "Two-chord songs": "Músicas de dois acordes",
    "Add F": "Adicione F",
    "Three-chord songs": "Músicas de três acordes",
    "Add G7": "Adicione G7",
    "The four-chord progression": "A progressão de quatro acordes",
    "Am and G": "Am e G",
    "More colours": "Mais cores",
    "Dm, Em, A, D, D7, A7": "Dm, Em, A, D, D7, A7",
    "C major scale": "Escala de dó maior",
    "Single notes on the C string": "Notas soltas na corda C",

    // Note names and lesson titles
    "C": "Dó",
    "D": "Ré",
    "E": "Mi",
    "F": "Fá",
    "G": "Sol",
    "A": "Lá",
    "B": "Si",
    "Open G": "Sol solto",
    "Open C": "Dó solto",
    "Open E": "Mi solto",
    "Open A": "Lá solto",
    "C (open)": "Dó (solta)",
    "High C": "Dó agudo",

    // Unit 1
    "Your first string. G is the bottom string in the diagram.": "Sua primeira corda. Sol é a corda de baixo no diagrama.",
    "Pluck the G string without pressing any fret.": "Pince a corda Sol sem pressionar nenhuma casa.",
    "The C string is the second from the bottom.": "A corda Dó é a segunda de baixo.",
    "Pluck the C string open. This is the home note of the scale.": "Pince a corda Dó solta. Esta é a nota base da escala.",
    "The E string is the second from the top.": "A corda Mi é a segunda de cima.",
    "Pluck the E string open.": "Pince a corda Mi solta.",
    "The A string is the top string in the diagram.": "A corda Lá é a corda de cima no diagrama.",
    "Pluck the A string open.": "Pince a corda Lá solta.",

    // Unit 2
    "One finger, one fret. The easiest chord on the ukulele.": "Um dedo, uma casa. O acorde mais fácil do ukulele.",
    "Place your index finger on the A string, 1st fret. Strum all four strings.": "Coloque o indicador na corda Lá, casa 1. Rasgue as quatro cordas.",
    "The C chord uses one finger on the A string, 3rd fret.": "O acorde de Dó usa um dedo na corda Lá, casa 3.",
    "Place your ring finger on the A string, 3rd fret. Strum all four strings.": "Coloque o anelar na corda Lá, casa 3. Rasgue as quatro cordas.",

    // Unit 3
    "F uses two fingers: middle on the G string, index on the E string.": "Fá usa dois dedos: médio na corda Sol, indicador na corda Mi.",
    "Middle finger on G string 2nd fret; index finger on E string 1st fret. Strum all four strings.": "Dedo médio na corda Sol, casa 2; indicador na corda Mi, casa 1. Rasgue as quatro cordas.",

    // Unit 4
    "G7 adds a bluesy pull back to C.": "Sol7 acrescenta uma tensão blues que puxa de volta para Dó.",
    "Middle on C string 2nd fret, index on E string 1st fret, ring on A string 2nd fret.": "Médio na corda Dó, casa 2; indicador na corda Mi, casa 1; anelar na corda Lá, casa 2.",

    // Unit 5
    "A minor is one finger on the G string.": "Lá menor é um dedo na corda Sol.",
    "Middle finger on G string 2nd fret. Strum all four strings.": "Dedo médio na corda Sol, casa 2. Rasgue as quatro cordas.",
    "G is the V chord in C major.": "Sol é o acorde V de Dó maior.",
    "Index on C string 2nd fret, ring on E string 3rd fret, middle on A string 2nd fret.": "Indicador na corda Dó, casa 2; anelar na corda Mi, casa 3; médio na corda Lá, casa 2.",

    // Unit 6
    "D minor is the ii chord in C major.": "Ré menor é o acorde ii de Dó maior.",
    "Index on E string 1st fret, middle on G string 2nd fret, ring on C string 2nd fret.": "Indicador na corda Mi, casa 1; médio na corda Sol, casa 2; anelar na corda Dó, casa 2.",
    "E minor is the iii chord in C major.": "Mi menor é o acorde iii de Dó maior.",
    "Index on A string 2nd fret, middle on E string 3rd fret, ring on C string 4th fret.": "Indicador na corda Lá, casa 2; médio na corda Mi, casa 3; anelar na corda Dó, casa 4.",
    "A is the V of D — a secondary dominant.": "Lá é o V de Ré — uma dominante secundária.",
    "Index on C string 1st fret, middle on G string 2nd fret.": "Indicador na corda Dó, casa 1; médio na corda Sol, casa 2.",
    "D is the V chord in G major.": "Ré é o acorde V de Sol maior.",
    "Index on G string 2nd fret, middle on C string 2nd fret, ring on E string 2nd fret.": "Indicador na corda Sol, casa 2; médio na corda Dó, casa 2; anelar na corda Mi, casa 2.",
    "D7 is the V7 of G.": "Ré7 é o V7 de Sol.",
    "Middle on G string 2nd fret, index on E string 2nd fret.": "Médio na corda Sol, casa 2; indicador na corda Mi, casa 2.",
    "A7 is the V7 of D.": "Lá7 é o V7 de Ré.",
    "Index on C string 1st fret.": "Indicador na corda Dó, casa 1.",

    // Unit 7
    "The home note. Open C string.": "A nota base. Corda Dó solta.",
    "Pluck the open C string.": "Pince a corda Dó solta.",
    "D is two frets up on the C string.": "Ré fica duas casas acima na corda Dó.",
    "Press the C string at the 2nd fret.": "Pressione a corda Dó na casa 2.",
    "E is four frets up.": "Mi fica quatro casas acima.",
    "Press the C string at the 4th fret.": "Pressione a corda Dó na casa 4.",
    "F is five frets up.": "Fá fica cinco casas acima.",
    "Press the C string at the 5th fret.": "Pressione a corda Dó na casa 5.",
    "G is seven frets up.": "Sol fica sete casas acima.",
    "Press the C string at the 7th fret.": "Pressione a corda Dó na casa 7.",
    "A is nine frets up.": "Lá fica nove casas acima.",
    "Press the C string at the 9th fret.": "Pressione a corda Dó na casa 9.",
    "B is eleven frets up.": "Si fica onze casas acima.",
    "Press the C string at the 11th fret.": "Pressione a corda Dó na casa 11.",
    "One octave above open C.": "Uma oitava acima do Dó solto.",
    "Press the C string at the 12th fret.": "Pressione a corda Dó na casa 12."
  };

  var FR = {
    // UI
    "Continue where you left off": "Continuez où vous étiez",
    "Start here": "Commencez ici",
    "Start": "Commencer",
    "All lessons complete": "Toutes les leçons terminées",
    "Replay any lesson to keep your skills sharp.": "Rejouez n'importe quelle leçon pour garder vos habiletés.",
    "Level": "Niveau",
    "XP": "XP",
    "Day streak": "Série de jours",
    "First sounds": "Premiers sons",
    "New here? Make your first sound": "Nouveau ? Faites votre premier son",
    "A quick guide before note one.": "Un guide rapide avant la première note.",
    "Unit": "Unité",
    "of": "de",
    "Completed": "Terminé",
    "Locked": "Verrouillé",
    "Settings": "Paramètres",
    "Back": "Retour",
    "New note": "Nouvelle note",
    "New chord": "Nouvel accord",
    "How to play it": "Comment le jouer",
    "Hear it": "Écouter",
    "Continue": "Continuer",
    "Quick check": "Vérification rapide",
    "Which string is this?": "Quelle corde est-ce ?",
    "Which note is this?": "Quelle note est-ce ?",
    "Which chord is this?": "Quel accord est-ce ?",
    "Correct!": "Correct !",
    "Not quite — try again.": "Pas tout à fait — réessayez.",
    "Your turn": "À vous",
    "I played it": "Je l'ai joué",
    "Take your time. When you are ready, mark it complete.": "Prenez votre temps. Quand vous êtes prêt, marquez-le comme terminé.",
    "Lesson complete!": "Leçon terminée !",
    "Review complete!": "Révision terminée !",
    "Practice rep": "Répétition",
    "Next lesson": "Leçon suivante",
    "Back to map": "Retour à la carte",
    "Let's make your first sound": "Faisons votre premier son",
    "A quick guide to holding, finding the strings, and strumming.": "Un guide rapide pour tenir, trouver les cordes et gratter.",
    "Hold the ukulele": "Tenez le ukulélé",
    "Rest the body against your chest and let the neck point up and to the left. Keep your strumming hand relaxed.": "Appuyez le corps contre votre poitrine et laissez le manche pointer vers le haut et la gauche. Gardez votre main de gratte détendue.",
    "Find the strings": "Trouvez les cordes",
    "The four strings are G, C, E, and A. In the horizontal fretboard diagram, they run from bottom to top as G, C, E, A.": "Les quatre cordes sont G, C, E et A. Dans le schéma horizontal, elles vont du bas vers le haut : G, C, E, A.",
    "Strum": "Grattez",
    "Drag your thumb or a felt pick across all four strings. Don't press any frets yet.": "Passez le pouce ou un médiator en feutre sur les quatre cordes. N'appuyez sur aucune frette pour l'instant.",
    "Tip": "Astuce",
    "Short nails on the fretting hand make chords much easier.": "Des ongles courts sur la main qui appuie facilitent beaucoup les accords.",
    "Hear a strum": "Écouter un coup de gratte",
    "Start learning": "Commencer l'apprentissage",
    "Language": "Langue",
    "Practice": "Pratique",
    "Replay first sounds": "Rejouer les premiers sons",
    "Reset all progress": "Réinitialiser tous les progrès",
    "Reset all progress?": "Réinitialiser tous les progrès ?",
    "Progress is saved on this device.": "Les progrès sont enregistrés sur cet appareil.",

    // Unit titles
    "Open strings": "Cordes à vide",
    "First chords": "Premiers accords",
    "One finger at a time": "Un doigt à la fois",
    "Two-chord songs": "Chansons à deux accords",
    "Add F": "Ajoutez F",
    "Three-chord songs": "Chansons à trois accords",
    "Add G7": "Ajoutez G7",
    "The four-chord progression": "La progression à quatre accords",
    "Am and G": "Am et G",
    "More colours": "Plus de couleurs",
    "Dm, Em, A, D, D7, A7": "Dm, Em, A, D, D7, A7",
    "C major scale": "Gamme de do majeur",
    "Single notes on the C string": "Notes simples sur la corde de do",

    // Note names and lesson titles
    "C": "Do",
    "D": "Ré",
    "E": "Mi",
    "F": "Fa",
    "G": "Sol",
    "A": "La",
    "B": "Si",
    "Open G": "Sol à vide",
    "Open C": "Do à vide",
    "Open E": "Mi à vide",
    "Open A": "La à vide",
    "C (open)": "Do (à vide)",
    "High C": "Do aigu",

    // Unit 1
    "Your first string. G is the bottom string in the diagram.": "Votre première corde. Sol est la corde du bas dans le schéma.",
    "Pluck the G string without pressing any fret.": "Pincez la corde de sol sans appuyer sur aucune frette.",
    "The C string is the second from the bottom.": "La corde de do est la deuxième à partir du bas.",
    "Pluck the C string open. This is the home note of the scale.": "Pincez la corde de do à vide. C'est la note de base de la gamme.",
    "The E string is the second from the top.": "La corde de mi est la deuxième à partir du haut.",
    "Pluck the E string open.": "Pincez la corde de mi à vide.",
    "The A string is the top string in the diagram.": "La corde de la est la corde du haut dans le schéma.",
    "Pluck the A string open.": "Pincez la corde de la à vide.",

    // Unit 2
    "One finger, one fret. The easiest chord on the ukulele.": "Un doigt, une frette. L'accord le plus facile du ukulélé.",
    "Place your index finger on the A string, 1st fret. Strum all four strings.": "Placez l'index sur la corde de la, 1re frette. Grattez les quatre cordes.",
    "The C chord uses one finger on the A string, 3rd fret.": "L'accord de do utilise un doigt sur la corde de la, 3e frette.",
    "Place your ring finger on the A string, 3rd fret. Strum all four strings.": "Placez l'annulaire sur la corde de la, 3e frette. Grattez les quatre cordes.",

    // Unit 3
    "F uses two fingers: middle on the G string, index on the E string.": "Fa utilise deux doigts : le majeur sur la corde de sol, l'index sur la corde de mi.",
    "Middle finger on G string 2nd fret; index finger on E string 1st fret. Strum all four strings.": "Majeur sur la corde de sol, 2e frette ; index sur la corde de mi, 1re frette. Grattez les quatre cordes.",

    // Unit 4
    "G7 adds a bluesy pull back to C.": "Sol7 ajoute une tension blues qui ramène vers do.",
    "Middle on C string 2nd fret, index on E string 1st fret, ring on A string 2nd fret.": "Majeur sur la corde de do, 2e frette ; index sur la corde de mi, 1re frette ; annulaire sur la corde de la, 2e frette.",

    // Unit 5
    "A minor is one finger on the G string.": "La mineur, c'est un doigt sur la corde de sol.",
    "Middle finger on G string 2nd fret. Strum all four strings.": "Majeur sur la corde de sol, 2e frette. Grattez les quatre cordes.",
    "G is the V chord in C major.": "Sol est l'accord V de do majeur.",
    "Index on C string 2nd fret, ring on E string 3rd fret, middle on A string 2nd fret.": "Index sur la corde de do, 2e frette ; annulaire sur la corde de mi, 3e frette ; majeur sur la corde de la, 2e frette.",

    // Unit 6
    "D minor is the ii chord in C major.": "Ré mineur est l'accord ii de do majeur.",
    "Index on E string 1st fret, middle on G string 2nd fret, ring on C string 2nd fret.": "Index sur la corde de mi, 1re frette ; majeur sur la corde de sol, 2e frette ; annulaire sur la corde de do, 2e frette.",
    "E minor is the iii chord in C major.": "Mi mineur est l'accord iii de do majeur.",
    "Index on A string 2nd fret, middle on E string 3rd fret, ring on C string 4th fret.": "Index sur la corde de la, 2e frette ; majeur sur la corde de mi, 3e frette ; annulaire sur la corde de do, 4e frette.",
    "A is the V of D — a secondary dominant.": "La est le V de ré — une dominante secondaire.",
    "Index on C string 1st fret, middle on G string 2nd fret.": "Index sur la corde de do, 1re frette ; majeur sur la corde de sol, 2e frette.",
    "D is the V chord in G major.": "Ré est l'accord V de sol majeur.",
    "Index on G string 2nd fret, middle on C string 2nd fret, ring on E string 2nd fret.": "Index sur la corde de sol, 2e frette ; majeur sur la corde de do, 2e frette ; annulaire sur la corde de mi, 2e frette.",
    "D7 is the V7 of G.": "Ré7 est le V7 de sol.",
    "Middle on G string 2nd fret, index on E string 2nd fret.": "Majeur sur la corde de sol, 2e frette ; index sur la corde de mi, 2e frette.",
    "A7 is the V7 of D.": "La7 est le V7 de ré.",
    "Index on C string 1st fret.": "Index sur la corde de do, 1re frette.",

    // Unit 7
    "The home note. Open C string.": "La note de base. Corde de do à vide.",
    "Pluck the open C string.": "Pincez la corde de do à vide.",
    "D is two frets up on the C string.": "Ré est deux frettes plus haut sur la corde de do.",
    "Press the C string at the 2nd fret.": "Appuyez sur la corde de do à la 2e frette.",
    "E is four frets up.": "Mi est quatre frettes plus haut.",
    "Press the C string at the 4th fret.": "Appuyez sur la corde de do à la 4e frette.",
    "F is five frets up.": "Fa est cinq frettes plus haut.",
    "Press the C string at the 5th fret.": "Appuyez sur la corde de do à la 5e frette.",
    "G is seven frets up.": "Sol est sept frettes plus haut.",
    "Press the C string at the 7th fret.": "Appuyez sur la corde de do à la 7e frette.",
    "A is nine frets up.": "La est neuf frettes plus haut.",
    "Press the C string at the 9th fret.": "Appuyez sur la corde de do à la 9e frette.",
    "B is eleven frets up.": "Si est onze frettes plus haut.",
    "Press the C string at the 11th fret.": "Appuyez sur la corde de do à la 11e frette.",
    "One octave above open C.": "Une octave au-dessus du do à vide.",
    "Press the C string at the 12th fret.": "Appuyez sur la corde de do à la 12e frette."
  };

  function detectDefaultLang() {
    try {
      var saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'pt' || saved === 'fr') return saved;
    } catch (e) { /* ignore */ }
    try {
      var nav = (navigator.language || navigator.userLanguage || 'en');
      if (/^pt/i.test(nav)) return 'pt';
      if (/^fr/i.test(nav)) return 'fr';
    } catch (e) { /* ignore */ }
    return 'en';
  }

  var LANG = detectDefaultLang();

  function applyLangAttr() {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : (LANG === 'fr' ? 'fr-CA' : 'en');
    }
  }
  applyLangAttr();

  function t(s) {
    if (LANG === 'pt' && Object.prototype.hasOwnProperty.call(PT, s)) return PT[s];
    if (LANG === 'fr' && Object.prototype.hasOwnProperty.call(FR, s)) return FR[s];
    return s;
  }

  function setLang(lang) {
    LANG = (lang === 'pt' || lang === 'fr') ? lang : 'en';
    applyLangAttr();
    try { localStorage.setItem(LANG_STORAGE_KEY, LANG); } catch (e) { /* ignore */ }
  }

  function getLang() { return LANG; }

  if (typeof window !== 'undefined') {
    window.t = t;
    window.setLang = setLang;
    window.getLang = getLang;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t: t, setLang: setLang, getLang: getLang };
  }
})();
