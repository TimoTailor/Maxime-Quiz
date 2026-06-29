(function () {
  'use strict';

  // ---- Konfiguration ----
  var LEVELS = [0, 50, 120, 210, 320, 450, 600, 780, 980, 1200];
  var BADGES = ['\uD83E\uDDF1','\uD83D\uDE99','\uD83D\uDE9C','\uD83D\uDEFB','\uD83D\uDE9A','\uD83C\uDFD7','\uD83D\uDEA7','\uD83D\uDE9B','\uD83C\uDFC6','\uD83D\uDC51'];
  var POINTS_PER_TASK = 10;
  var DEFAULT_PIN = '1234';
  var LAST_SCHOOLDAY = '2026-07-17';
  var FIRST_SCHOOLDAY = '2026-09-02';

  var WORDS = ['Apfel','Sonne','Blume','Wasser','Schule','Hund','Katze','Baum','Haus','Auto','Buch','Tisch','Garten','Wolke','Stern','Mond','Fisch','Vogel','Banane','Brot'];
  var TEXTS = [
    'Maxime spielt Fu\u00dfball mit seinem besten Freund Lennart. Lennart schie\u00dft den Ball. Maxime f\u00e4ngt ihn im Tor. "Gehalten!", ruft Maxime. Beide lachen laut.',
    'Maxime sitzt am Schlagzeug. Er trommelt laut: bum, bum, tschak! Papa h\u00e4lt sich die Ohren zu und lacht. Maxime spielt einen tollen Takt.',
    'Oma nimmt Maxime mit zum Pferd. Das Pferd hei\u00dft Bruno. Es ist gro\u00df und braun. Maxime gibt ihm einen Apfel. Bruno schnaubt zufrieden.',
    'Opa und Maxime gehen zur Baustelle. Ein gro\u00dfer Bagger gr\u00e4bt im Sand. Der Kran hebt schwere Steine. Maxime staunt \u00fcber die Maschinen.',
    'Maxime baut mit Lego einen gro\u00dfen Traktor. Er sucht die roten Steine. St\u00fcck f\u00fcr St\u00fcck wird der Traktor fertig. Am Ende rollt er \u00fcber den Tisch.',
    'Maxime spielt mit seiner kleinen Schwester Florence. Er baut ihr einen Turm aus Lego. Florence klatscht und freut sich. Dann baut er noch einen.',
    'Mama und Maxime backen einen Kuchen. Maxime r\u00fchrt den Teig. Es riecht nach Schokolade. Bald ist der Kuchen fertig und warm.',
    'Am Samstag spielt die ganze Familie Fu\u00dfball. Papa steht im Tor. Mama schie\u00dft den Ball. Sogar Florence l\u00e4uft mit. Es macht gro\u00dfen Spa\u00df.',
    'Lennart und Maxime bauen zusammen eine Baustelle aus Lego. Sie haben einen Bagger und einen Kran. "Achtung, schwerer Stein!", ruft Lennart. Die beiden spielen den ganzen Nachmittag.',
    'Opa war fr\u00fcher Schlagzeuger. Heute zeigt er Maxime einen Takt. Bum, tschak, bum, tschak! Maxime spielt ihn nach. Opa ist stolz auf ihn.'
  ];

  // ---- State ----
  function defaultState() { return { points: 0, completed: 0, pin: DEFAULT_PIN, pinSet: false }; }
  function load() {
    try { var raw = localStorage.getItem('maximeState'); if (!raw) return defaultState(); var s = JSON.parse(raw); if (typeof s.points !== 'number') return defaultState(); return s; }
    catch (e) { return defaultState(); }
  }
  function save(s) { try { localStorage.setItem('maximeState', JSON.stringify(s)); } catch (e) {} }
  var state = load();

  // ---- Helpers ----
  function levelFor(points) { var lvl = 1; for (var i = 0; i < LEVELS.length; i++) { if (points >= LEVELS[i]) lvl = i + 1; } return lvl; }
  function badgeFor(points) { return BADGES[levelFor(points) - 1]; }
  function nextThreshold(points) { for (var i = 0; i < LEVELS.length; i++) { if (points < LEVELS[i]) return LEVELS[i]; } return LEVELS[LEVELS.length - 1]; }
  function addPoints(n) { var before = levelFor(state.points); state.points += n; state.completed += 1; save(state); return levelFor(state.points) > before; }
  function daysUntil(dateStr) { var target = new Date(dateStr + 'T00:00:00'); var now = new Date(); var t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()); return Math.ceil((target - t0) / (1000 * 60 * 60 * 24)); }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }
  function app() { return document.getElementById('app'); }
  function clear() { app().innerHTML = ''; }
  function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function shuffle(arr) { for (var i = arr.length - 1; i > 0; i--) { var j = rnd(0, i); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function speak(txt) { try { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(txt); u.lang = 'de-DE'; u.rate = 0.85; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } } catch (e) {} }

  // ---- Countdown ----
  function countdownHtml() {
    var toFerien = daysUntil(LAST_SCHOOLDAY); var toSchule = daysUntil(FIRST_SCHOOLDAY); var num, lbl;
    if (toFerien > 0) { num = toFerien; lbl = toFerien === 1 ? 'Tag bis zu den Ferien!' : 'Tage bis zu den Ferien!'; }
    else if (toSchule > 0) { num = toSchule; lbl = toSchule === 1 ? 'Ferientag - sammle flei\u00dfig Punkte!' : 'Ferientage - sammle flei\u00dfig Punkte!'; }
    else { num = '\uD83C\uDF89'; lbl = 'Die Schule hat wieder begonnen!'; }
    return '<div class="countdown"><div class="cd-emoji">\u23F3</div><div class="num">' + num + '</div><div class="lbl">' + lbl + '</div></div>';
  }

  // ---- Home ----
  function renderHome() {
    clear();
    var lvl = levelFor(state.points); var badge = badgeFor(state.points); var next = nextThreshold(state.points);
    var prev = LEVELS[lvl - 1]; var span = next - prev; if (span <= 0) span = 1;
    var pct = Math.min(100, Math.round(((state.points - prev) / span) * 100)); var atMax = lvl >= LEVELS.length;
    var head = el(
      '<div class="header">' +
      '<div class="badge-big">' + badge + '</div>' +
      '<div class="level-label">Level ' + lvl + '</div>' +
      '<div class="points">' + state.points + ' Punkte</div>' +
      '<div class="progress-wrap"><div class="progress-bar" style="width:' + pct + '%"></div></div>' +
      '<div class="progress-text">' + (atMax ? 'H\u00f6chstes Level erreicht!' : 'Noch ' + (next - state.points) + ' Punkte bis zum n\u00e4chsten Level') + '</div>' +
      '</div>'
    );
    app().appendChild(head);
    app().appendChild(el(countdownHtml()));
    var tiles = el('<div class="tiles"></div>');
    var defs = [
      ['rechnen', '\uD83D\uDD22', 'Rechnen'],
      ['logik', '\uD83E\uDDE0', 'Logik'],
      ['schreiben', '\u270F\uFE0F', 'Schreiben'],
      ['lesen', '\uD83D\uDCD6', 'Lesen'],
      ['schule', '\uD83D\uDCC2', 'Schulunterlagen']
    ];
    for (var i = 0; i < defs.length; i++) {
      (function (d) { var b = el('<button class="tile ' + d[0] + '"><span class="emoji">' + d[1] + '</span>' + d[2] + '</button>'); b.addEventListener('click', function () { route(d[0]); }); tiles.appendChild(b); })(defs[i]);
    }
    app().appendChild(tiles);
    app().appendChild(el('<div class="note">F\u00fcr Eltern: PIN-Bereiche bei Lesen &amp; Schulunterlagen</div>'));
  }

  function backBar() { var b = el('<button class="back-btn">\u2190 Zur\u00fcck</button>'); b.addEventListener('click', renderHome); return b; }

  function celebrate(leveledUp, cb) {
    if (leveledUp) {
      clear();
      app().appendChild(el('<div class="header" style="margin-top:40px"><div class="badge-big">' + badgeFor(state.points) + '</div><div class="screen-title">Neues Level ' + levelFor(state.points) + '! \uD83C\uDF89</div><div class="points">' + state.points + ' Punkte</div></div>'));
      var btn = el('<button class="btn green">Weiter</button>'); btn.addEventListener('click', cb); app().appendChild(btn);
    } else { cb(); }
  }

  // ---- Rechnen ----
  function newMath() {
    var type = rnd(1, 3); var a, b, q, ans;
    if (type === 1) { a = rnd(1, 89); b = rnd(1, 100 - a); q = a + ' + ' + b; ans = a + b; }
    else if (type === 2) { a = rnd(10, 100); b = rnd(1, a); q = a + ' \u2212 ' + b; ans = a - b; }
    else { a = rnd(2, 5); b = rnd(2, 5); q = a + ' \u00D7 ' + b; ans = a * b; }
    return { q: q, ans: ans };
  }
  function renderRechnen() {
    clear(); app().appendChild(backBar()); app().appendChild(el('<div class="screen-title">\uD83D\uDD22 Rechnen</div>'));
    var current = newMath();
    app().appendChild(el('<div class="card"><div class="question">' + current.q + ' = ?</div><input class="bigfield" type="number" pattern="[0-9]*" id="answer"></div>'));
    var fb = el('<div class="feedback"></div>'); var btn = el('<button class="btn green">Pr\u00fcfen</button>');
    app().appendChild(btn); app().appendChild(fb);
    var input = document.getElementById('answer'); input.focus();
    btn.addEventListener('click', function () {
      var val = parseInt(input.value, 10);
      if (isNaN(val)) { fb.className = 'feedback no'; fb.textContent = 'Bitte eine Zahl eingeben'; return; }
      if (val === current.ans) { var up = addPoints(POINTS_PER_TASK); fb.className = 'feedback ok'; fb.textContent = 'Richtig! +' + POINTS_PER_TASK + ' Punkte \uD83C\uDF1F'; btn.disabled = true; setTimeout(function () { celebrate(up, renderRechnen); }, 900); }
      else { fb.className = 'feedback no'; fb.textContent = 'Fast! Versuch es nochmal.'; input.value = ''; input.focus(); }
    });
  }

  // ---- Logik ----
  function newPattern() {
    if (rnd(0, 1) === 0) {
      var start = rnd(1, 5); var step = rnd(1, 5);
      var seq = [start, start + step, start + step * 2, start + step * 3]; var answer = start + step * 4;
      var opts = shuffle([answer, answer + step, answer - step, answer + 1]);
      return { anleitung: 'Was kommt als N\u00e4chstes?', frage: seq.join('   ') + '   ?', options: opts.map(String), correct: String(answer) };
    } else {
      var pair = [['\uD83D\uDE9C','\uD83D\uDE99'], ['\uD83C\uDF4E','\uD83C\uDF4C'], ['\u2B50','\uD83C\uDF1A'], ['\uD83D\uDD34','\uD83D\uDD35']][rnd(0,3)];
      var seqE = [pair[0], pair[1], pair[0], pair[1]]; var ansE = pair[0];
      var optsE = shuffle([pair[0], pair[1], '\uD83C\uDF33', '\uD83D\uDC36']);
      return { anleitung: 'Was kommt als N\u00e4chstes?', frage: seqE.join('  ') + '  ?', options: optsE, correct: ansE };
    }
  }
  function newOddOne() {
    var groups = [
      ['\uD83C\uDF4E','\uD83C\uDF4C','\uD83C\uDF50'],
      ['\uD83D\uDC36','\uD83D\uDC31','\uD83D\uDC1F'],
      ['\uD83D\uDE9C','\uD83D\uDE99','\uD83D\uDE92']
    ];
    var odds = ['\uD83D\uDE97','\uD83C\uDF33','\uD83C\uDF4E'];
    var i = rnd(0, groups.length - 1); var odd = odds[i];
    var opts = shuffle(groups[i].concat([odd]));
    return { anleitung: 'Was passt nicht dazu?', frage: '', options: opts, correct: odd };
  }
  function newBigger() {
    var a = rnd(1, 100); var b = rnd(1, 100); while (b === a) { b = rnd(1, 100); }
    var bigger = a > b ? a : b;
    return { anleitung: 'Welche Zahl ist gr\u00f6\u00dfer?', frage: '', options: [String(a), String(b)], correct: String(bigger) };
  }
  function newTrueFalse() {
    var facts = [['Ein Hund hat vier Beine.', true], ['Die Sonne ist blau.', false], ['Ein Fisch kann schwimmen.', true], ['Ein Auto kann fliegen.', false], ['Im Winter ist es kalt.', true], ['Eine Katze sagt Muh.', false], ['Ein Baum hat Bl\u00e4tter.', true], ['Die Maus ist gr\u00f6\u00dfer als der Elefant.', false]];
    var f = facts[rnd(0, facts.length - 1)];
    return { anleitung: 'Stimmt das?', frage: f[0], options: ['Ja', 'Nein'], correct: f[1] ? 'Ja' : 'Nein' };
  }
  function newLogic() { var g = [newPattern, newOddOne, newBigger, newTrueFalse][rnd(0, 3)]; return g(); }

  function renderLogik() {
    clear(); app().appendChild(backBar()); app().appendChild(el('<div class="screen-title">\uD83E\uDDE0 Logik</div>'));
    var q = newLogic();
    var card = el('<div class="card"></div>');
    var row = el('<div class="anleitung-row"></div>');
    row.appendChild(el('<div class="anleitung">' + q.anleitung + '</div>'));
    var sp = el('<button class="speak-btn">\uD83D\uDD0A</button>');
    sp.addEventListener('click', function () { speak(q.anleitung + '. ' + (q.frage || '')); });
    row.appendChild(sp); card.appendChild(row);
    if (q.frage) { card.appendChild(el('<div class="question">' + q.frage + '</div>')); }
    app().appendChild(card);
    var grid = el('<div class="opt-grid"></div>');
    var fb = el('<div class="feedback"></div>');
    var done = false;
    for (var i = 0; i < q.options.length; i++) {
      (function (opt) {
        var b = el('<button class="opt-btn">' + opt + '</button>');
        b.addEventListener('click', function () {
          if (done) return;
          if (opt === q.correct) {
            done = true; var up = addPoints(POINTS_PER_TASK);
            b.style.background = '#c8f0e4'; b.style.borderColor = '#2a9d8f';
            fb.className = 'feedback ok'; fb.textContent = 'Richtig! +' + POINTS_PER_TASK + ' \uD83C\uDF1F';
            setTimeout(function () { celebrate(up, renderLogik); }, 900);
          } else {
            b.style.background = '#ffd6d6'; b.style.borderColor = '#e63946';
            fb.className = 'feedback no'; fb.textContent = 'Probier es nochmal!';
          }
        });
        grid.appendChild(b);
      })(q.options[i]);
    }
    app().appendChild(grid); app().appendChild(fb);
    setTimeout(function () { speak(q.anleitung); }, 300);
  }

  // ---- Schreiben ----
  function renderSchreiben() {
    clear(); app().appendChild(backBar()); app().appendChild(el('<div class="screen-title">\u270F\uFE0F Schreiben</div>'));
    var word = WORDS[rnd(0, WORDS.length - 1)];
    app().appendChild(el('<div class="card"><div class="note">H\u00f6re das Wort und schreibe es richtig auf.</div><div class="question">\uD83D\uDD0A</div><input class="bigfield" type="text" id="wordin" autocomplete="off" autocorrect="off" autocapitalize="off"></div>'));
    var listen = el('<button class="btn">\uD83D\uDD0A Wort vorlesen</button>');
    var hint = el('<button class="btn gray small">Tipp anzeigen</button>');
    var btn = el('<button class="btn green">Pr\u00fcfen</button>');
    var fb = el('<div class="feedback"></div>');
    app().appendChild(listen); app().appendChild(btn); app().appendChild(hint); app().appendChild(fb);
    setTimeout(function () { speak(word); }, 300);
    listen.addEventListener('click', function () { speak(word); });
    hint.addEventListener('click', function () { fb.className = 'feedback'; fb.textContent = word.charAt(0) + '...' + ' (' + word.length + ' Buchstaben)'; });
    var input = document.getElementById('wordin');
    btn.addEventListener('click', function () {
      var val = (input.value || '').trim().toLowerCase();
      if (val === word.toLowerCase()) { var up = addPoints(POINTS_PER_TASK); fb.className = 'feedback ok'; fb.textContent = 'Super! Das Wort war "' + word + '". +' + POINTS_PER_TASK + ' \uD83C\uDF1F'; btn.disabled = true; setTimeout(function () { celebrate(up, renderSchreiben); }, 1100); }
      else { fb.className = 'feedback no'; fb.textContent = 'Noch nicht ganz. Probier es nochmal!'; }
    });
  }

  // ---- PIN ----
  function askPin(onOk) {
    clear(); app().appendChild(backBar()); app().appendChild(el('<div class="screen-title">\uD83D\uDD12 Eltern-PIN</div>'));
    app().appendChild(el('<div class="note">Bitte von einem Elternteil eingeben.</div>'));
    var dots = el('<div class="pin-dots"></div>'); var card = el('<div class="card"></div>'); card.appendChild(dots);
    var pad = el('<div class="keypad"></div>'); var entry = '';
    function refresh() { var s = ''; for (var i = 0; i < entry.length; i++) s += '\u25CF'; dots.textContent = s; }
    var keys = ['1','2','3','4','5','6','7','8','9','C','0','OK'];
    for (var i = 0; i < keys.length; i++) {
      (function (k) { var b = el('<button class="key">' + k + '</button>'); b.addEventListener('click', function () {
        if (k === 'C') { entry = ''; } else if (k === 'OK') { if (entry === state.pin) { onOk(); } else { dots.textContent = 'Falscher PIN'; entry = ''; } return; } else if (entry.length < 4) { entry += k; } refresh();
      }); pad.appendChild(b); })(keys[i]);
    }
    card.appendChild(pad); app().appendChild(card); app().appendChild(el('<div class="note">Standard-PIN: 1234 (sp\u00e4ter \u00e4nderbar)</div>'));
  }

  // ---- Lesen ----
  function renderLesen() {
    clear(); app().appendChild(backBar()); app().appendChild(el('<div class="screen-title">\uD83D\uDCD6 Lesen</div>'));
    var text = TEXTS[rnd(0, TEXTS.length - 1)];
    app().appendChild(el('<div class="card"><div class="readtext">' + text + '</div></div>'));
    app().appendChild(el('<div class="note">Maxime liest den Text laut vor. Danach gibt ein Elternteil per PIN die Punkte frei.</div>'));
    var btn = el('<button class="btn">\u2705 Vorgelesen - Punkte freigeben</button>');
    btn.addEventListener('click', function () { askPin(function () { var up = addPoints(POINTS_PER_TASK); showAward(up, renderLesen); }); });
    app().appendChild(btn);
  }

  // ---- Schulunterlagen ----
  function renderSchule() {
    clear(); app().appendChild(backBar()); app().appendChild(el('<div class="screen-title">\uD83D\uDCC2 Schulunterlagen</div>'));
    app().appendChild(el('<div class="card"><div class="readtext">Maxime bearbeitet eine Aufgabe aus seinen eigenen Schulunterlagen (Heft oder Arbeitsblatt). Danach bewertet ein Elternteil das Ergebnis.</div></div>'));
    var btn = el('<button class="btn">\u2705 Aufgabe erledigt - bewerten</button>');
    btn.addEventListener('click', function () { askPin(function () { choosePoints(renderSchule); }); });
    app().appendChild(btn);
  }
  function choosePoints(backFn) {
    clear(); app().appendChild(el('<div class="screen-title">Punkte vergeben</div>')); app().appendChild(el('<div class="note">Wie gut hat Maxime die Aufgabe gel\u00f6st?</div>'));
    var opts = [['Gut gemacht', 5], ['Sehr gut', 10], ['Spitze!', 15]];
    for (var i = 0; i < opts.length; i++) { (function (o) { var b = el('<button class="btn green">' + o[0] + ' (+' + o[1] + ')</button>'); b.addEventListener('click', function () { var up = addPoints(o[1]); showAward(up, backFn); }); app().appendChild(b); })(opts[i]); }
  }
  function showAward(up, backFn) {
    clear(); app().appendChild(el('<div class="header" style="margin-top:30px"><div class="badge-big">\u2B50</div><div class="screen-title">Punkte gespeichert!</div><div class="points">' + state.points + ' Punkte</div></div>'));
    var b1 = el('<button class="btn green">Nochmal</button>'); b1.addEventListener('click', backFn);
    var b2 = el('<button class="btn gray">Zum Start</button>'); b2.addEventListener('click', renderHome);
    if (up) { app().insertBefore(el('<div class="feedback ok">Neues Level ' + levelFor(state.points) + '! ' + badgeFor(state.points) + '</div>'), app().firstChild); }
    app().appendChild(b1); app().appendChild(b2);
  }

  // ---- Router ----
  function route(name) {
    if (name === 'rechnen') renderRechnen();
    else if (name === 'logik') renderLogik();
    else if (name === 'schreiben') renderSchreiben();
    else if (name === 'lesen') renderLesen();
    else if (name === 'schule') renderSchule();
    else renderHome();
  }

  renderHome();
})();
