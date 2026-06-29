(function () {
  'use strict';

  // ---- Konfiguration ----
  var KIND_NAME = 'Maxime';
  var LEVELS = [0, 50, 120, 210, 320, 450, 600, 780, 980, 1200];
  var BADGES = ['\uD83E\uDDF1','\uD83D\uDE99','\uD83D\uDE9C','\uD83D\uDEFB','\uD83D\uDE9A','\uD83C\uDFD7','\uD83D\uDEA7','\uD83D\uDE9B','\uD83C\uDFC6','\uD83D\uDC51'];
  var BADGE_NAMES = ['Bau-Starter','Flitzer','Trecker-Fahrer','Pickup-Profi','Laster-Lenker','Kran-Kapit\u00e4n','Baustellen-Boss','Truck-Held','Pokal-Held','Lego-K\u00f6nig'];
  var DEFAULT_PIN = '1234';
  var LAST_SCHOOLDAY = '2026-07-17';
  var FIRST_SCHOOLDAY = '2026-09-02';
  var BIRTHDAY_MONTH = 7; var BIRTHDAY_DAY = 24; var BIRTHDAY_BONUS = 50;
  var THEMES = [['orange','#ff9f1c'],['blau','#3a86ff'],['gruen','#2a9d8f'],['pink','#ef476f'],['lila','#8338ec']];
  var POINTS_BY_DIFF = { leicht: 5, mittel: 10, schwer: 20 };
  var DIFFS = [['leicht','Leicht',5],['mittel','Mittel',10],['schwer','Schwer',20]];

  var WORDS_LEICHT = ['Hund','Katze','Baum','Haus','Auto','Ball','Buch','Fisch','Mond','Hand','Tor','Ente'];
  var WORDS_MITTEL = ['Apfel','Sonne','Blume','Schule','Tisch','Wolke','Stern','Vogel','Brot','Banane','Garten','Wasser'];
  var WORDS_SCHWER = ['Schlagzeug','Traktor','Baustelle','Bagger','Familie','Geschichte','Kuchen','Freund','Schwester','Pferd','Sommer','Ferien'];
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
  function defaultState() { return { points: 0, completed: 0, pin: DEFAULT_PIN, pinSet: false, streak: 0, lastActive: null, theme: 'orange', bdayBonusYear: null, startHour: 7, endHour: 20, difficulty: 'mittel' }; }
  function load() {
    try { var raw = localStorage.getItem('maximeState'); if (!raw) return defaultState(); var s = JSON.parse(raw); if (typeof s.points !== 'number') return defaultState();
      if (typeof s.streak !== 'number') s.streak = 0; if (!s.lastActive) s.lastActive = null; if (!s.theme) s.theme = 'orange'; if (typeof s.bdayBonusYear === 'undefined') s.bdayBonusYear = null; if (!s.pin) s.pin = DEFAULT_PIN; if (typeof s.startHour !== 'number') s.startHour = 7; if (typeof s.endHour !== 'number') s.endHour = 20; if (!s.difficulty) s.difficulty = 'mittel'; return s; }
    catch (e) { return defaultState(); }
  }
  function save(s) { try { localStorage.setItem('maximeState', JSON.stringify(s)); } catch (e) {} }
  var state = load();

  function pointsPerTask() { return POINTS_BY_DIFF[state.difficulty] || 10; }

  // ---- Datum / Streak ----
  function dStr(d) { var m = d.getMonth() + 1; var day = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day); }
  function todayStr() { return dStr(new Date()); }
  function yesterdayStr() { var d = new Date(); d.setDate(d.getDate() - 1); return dStr(d); }
  function updateStreak() {
    var t = todayStr(); if (state.lastActive === t) return;
    if (state.lastActive === yesterdayStr()) { state.streak = (state.streak || 0) + 1; } else { state.streak = 1; }
    state.lastActive = t; save(state);
  }
  function displayStreak() { if (state.lastActive === todayStr() || state.lastActive === yesterdayStr()) return state.streak || 0; return 0; }

  // ---- Lernzeit ----
  function fmtHour(h) { return (h < 10 ? '0' + h : h) + ':00'; }
  function withinHours() { var h = new Date().getHours(); return h >= state.startHour && h < state.endHour; }

  // ---- Helpers ----
  function levelFor(points) { var lvl = 1; for (var i = 0; i < LEVELS.length; i++) { if (points >= LEVELS[i]) lvl = i + 1; } return lvl; }
  function badgeFor(points) { return BADGES[levelFor(points) - 1]; }
  function badgeNameFor(points) { return BADGE_NAMES[levelFor(points) - 1]; }
  function nextThreshold(points) { for (var i = 0; i < LEVELS.length; i++) { if (points < LEVELS[i]) return LEVELS[i]; } return LEVELS[LEVELS.length - 1]; }
  function addPoints(n) { var before = levelFor(state.points); state.points += n; state.completed += 1; updateStreak(); save(state); return levelFor(state.points) > before; }
  function daysUntil(dateStr) { var target = new Date(dateStr + 'T00:00:00'); var now = new Date(); var t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()); return Math.ceil((target - t0) / (1000 * 60 * 60 * 24)); }
  function daysUntilBirthday() { var now = new Date(); var t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()); var b = new Date(now.getFullYear(), BIRTHDAY_MONTH - 1, BIRTHDAY_DAY); if (b < t0) b = new Date(now.getFullYear() + 1, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY); return Math.round((b - t0) / (1000 * 60 * 60 * 24)); }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }
  function app() { return document.getElementById('app'); }
  function clear() { app().innerHTML = ''; }
  function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function shuffle(arr) { for (var i = arr.length - 1; i > 0; i--) { var j = rnd(0, i); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function numOptions(answer, cands) { var out = [answer]; for (var i = 0; i < cands.length; i++) { var c = cands[i]; if (c > 0 && out.indexOf(c) < 0) out.push(c); } var k = 1; while (out.length < 4) { var a = answer + k; if (a > 0 && out.indexOf(a) < 0) out.push(a); var b = answer - k; if (out.length < 4 && b > 0 && out.indexOf(b) < 0) out.push(b); k++; } return shuffle(out).slice(0, 4).map(String); }
  function speak(txt) { try { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(txt); u.lang = 'de-DE'; u.rate = 0.85; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } } catch (e) {} }
  function greeting() { var h = new Date().getHours(); if (h < 11) return 'Guten Morgen'; if (h < 18) return 'Hallo'; return 'Guten Abend'; }
  function motto() {
    if (state.points === 0) return 'Lass uns starten! \uD83D\uDE80';
    var msgs = ['Weiter so!', 'Du schaffst das!', 'Toll gemacht!', 'Super dabei!', 'Du wirst immer besser!'];
    return msgs[rnd(0, msgs.length - 1)] + ' \uD83D\uDCAA';
  }
  function applyTheme(name) { try { document.body.className = 'theme-' + name; } catch (e) {} }

  // ---- Geburtstag ----
  function isBirthday() { var d = new Date(); return (d.getMonth() + 1) === BIRTHDAY_MONTH && d.getDate() === BIRTHDAY_DAY; }
  function maybeBirthdayBonus() {
    if (!isBirthday()) return;
    var yr = new Date().getFullYear();
    if (state.bdayBonusYear !== yr) { state.points += BIRTHDAY_BONUS; state.bdayBonusYear = yr; save(state); }
  }

  // ---- Countdown ----
  function countdownHtml() {
    var toFerien = daysUntil(LAST_SCHOOLDAY); var toSchule = daysUntil(FIRST_SCHOOLDAY); var num, lbl;
    if (toFerien > 0) { num = toFerien; lbl = toFerien === 1 ? 'Tag bis zu den Ferien!' : 'Tage bis zu den Ferien!'; }
    else if (toSchule > 0) { num = toSchule; lbl = toSchule === 1 ? 'Ferientag - sammle flei\u00dfig Punkte!' : 'Ferientage - sammle flei\u00dfig Punkte!'; }
    else { num = '\uD83C\uDF89'; lbl = 'Die Schule hat wieder begonnen!'; }
    return '<div class="countdown"><div class="cd-emoji">\u23F3</div><div class="num">' + num + '</div><div class="lbl">' + lbl + '</div></div>';
  }
  function birthdayCountdownHtml() {
    if (isBirthday()) return '';
    var d = daysUntilBirthday();
    return '<div class="bday-countdown">\uD83C\uDF82 Noch ' + d + (d === 1 ? ' Tag' : ' Tage') + ' bis zu deinem Geburtstag!</div>';
  }

  // ---- Lernpause-Bildschirm ----
  function renderPause() {
    clear();
    app().appendChild(el('<div class="header"><div class="greeting">' + greeting() + ', ' + KIND_NAME + '! \uD83D\uDC4B</div></div>'));
    app().appendChild(el('<div class="card" style="text-align:center"><div class="badge-big">\uD83C\uDF19</div><div class="screen-title">Jetzt ist Lernpause</div><div class="readtext">Du kannst von <b>' + fmtHour(state.startHour) + '</b> bis <b>' + fmtHour(state.endHour) + '</b> Uhr \u00fcben.<br>Bis bald! \uD83D\uDC4B</div></div>'));
    var pBtn = el('<button class="btn gray small">\u2699\uFE0F Eltern-Bereich</button>');
    pBtn.addEventListener('click', function () { askPin(renderParentArea); });
    app().appendChild(pBtn);
  }

  // ---- Home ----
  function renderHome() {
    if (!withinHours()) { renderPause(); return; }
    clear();
    maybeBirthdayBonus();
    if (isBirthday()) {
      app().appendChild(el('<div class="birthday"><span class="big">\uD83C\uDF82</span>Herzlichen Gl\u00fcckwunsch zum Geburtstag, ' + KIND_NAME + '!<br>+' + BIRTHDAY_BONUS + ' Geschenk-Punkte \uD83C\uDF81</div>'));
    }
    var lvl = levelFor(state.points); var badge = badgeFor(state.points); var next = nextThreshold(state.points);
    var prev = LEVELS[lvl - 1]; var span = next - prev; if (span <= 0) span = 1;
    var pct = Math.min(100, Math.round(((state.points - prev) / span) * 100)); var atMax = lvl >= LEVELS.length;
    var streak = displayStreak();
    var streakHtml = streak > 0
      ? '<div class="streak">\uD83D\uDD25 ' + streak + (streak === 1 ? ' Tag' : ' Tage') + ' in Folge ge\u00fcbt!</div>'
      : '<div class="streak">\uD83D\uDD25 \u00dcbe heute und starte deine Serie!</div>';
    var head = el(
      '<div class="header">' +
      '<div class="greeting">' + greeting() + ', ' + KIND_NAME + '! \uD83D\uDC4B</div>' +
      '<div class="submotto">' + motto() + '</div>' +
      streakHtml +
      '<div class="badge-big">' + badge + '</div>' +
      '<div class="level-label">Level ' + lvl + '</div>' +
      '<div class="badge-name">' + badgeNameFor(state.points) + '</div>' +
      '<div class="points">' + state.points + ' Punkte</div>' +
      '<div class="progress-wrap"><div class="progress-bar" style="width:' + pct + '%"></div></div>' +
      '<div class="progress-text">' + (atMax ? 'H\u00f6chstes Level erreicht!' : 'Noch ' + (next - state.points) + ' Punkte bis zum n\u00e4chsten Level') + '</div>' +
      '</div>'
    );
    app().appendChild(head);
    app().appendChild(el(countdownHtml()));
    var bc = birthdayCountdownHtml(); if (bc) app().appendChild(el(bc));
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
    // Schwierigkeit
    app().appendChild(el('<div class="theme-title">\u2B50 Schwierigkeit w\u00e4hlen</div>'));
    var dRow = el('<div class="diff-row"></div>');
    for (var k = 0; k < DIFFS.length; k++) {
      (function (df) {
        var active = state.difficulty === df[0] ? ' active' : '';
        var b = el('<button class="diff-btn diff-' + df[0] + active + '">' + df[1] + '<small>' + df[2] + ' Punkte</small></button>');
        b.addEventListener('click', function () { state.difficulty = df[0]; save(state); renderHome(); });
        dRow.appendChild(b);
      })(DIFFS[k]);
    }
    app().appendChild(dRow);
    // Farbe
    app().appendChild(el('<div class="theme-title">\uD83C\uDF08 W\u00e4hle deine Farbe</div>'));
    var row = el('<div class="theme-row"></div>');
    for (var j = 0; j < THEMES.length; j++) {
      (function (th) {
        var active = state.theme === th[0] ? ' active' : '';
        var b = el('<button class="color-dot' + active + '" style="background:' + th[1] + '"></button>');
        b.addEventListener('click', function () { state.theme = th[0]; save(state); applyTheme(th[0]); renderHome(); });
        row.appendChild(b);
      })(THEMES[j]);
    }
    app().appendChild(row);
    app().appendChild(el('<div class="note">F\u00fcr Eltern: PIN-Bereiche bei Lesen &amp; Schulunterlagen</div>'));
    var pBtn = el('<button class="btn gray small">\u2699\uFE0F Eltern-Bereich</button>');
    pBtn.addEventListener('click', function () { askPin(renderParentArea); });
    app().appendChild(pBtn);
  }

  function backBar() { var b = el('<button class="back-btn">\u2190 Zur\u00fcck</button>'); b.addEventListener('click', renderHome); return b; }

  // ---- Eltern-Bereich ----
  function renderParentArea() {
    clear(); app().appendChild(backBar()); app().appendChild(el('<div class="screen-title">\u2699\uFE0F Eltern-Bereich</div>'));
    app().appendChild(el('<div class="card"><div class="readtext">Aktueller Stand:<br><b>' + state.points + ' Punkte</b> \u00b7 Level ' + levelFor(state.points) + ' (' + badgeNameFor(state.points) + ')</div></div>'));
    var tCard = el('<div class="card"></div>');
    tCard.appendChild(el('<div class="readtext" style="text-align:center">\u23F0 Lernzeit</div>'));
    tCard.appendChild(el('<div class="readtext" style="text-align:center;margin:6px 0"><b>' + fmtHour(state.startHour) + ' - ' + fmtHour(state.endHour) + ' Uhr</b></div>'));
    function stepRow(label, valStr, onDec, onInc) {
      var r = el('<div style="display:-webkit-box;display:flex;-webkit-box-align:center;align-items:center;-webkit-box-pack:center;justify-content:center;margin:8px 0"></div>');
      r.appendChild(el('<span style="font-size:20px;width:70px">' + label + '</span>'));
      var minus = el('<button class="key" style="width:60px;margin:0 6px">\u2212</button>');
      var lab = el('<span style="font-size:22px;font-weight:bold;width:80px;text-align:center;display:inline-block">' + valStr + '</span>');
      var plus = el('<button class="key" style="width:60px;margin:0 6px">+</button>');
      minus.addEventListener('click', onDec); plus.addEventListener('click', onInc);
      r.appendChild(minus); r.appendChild(lab); r.appendChild(plus); return r;
    }
    tCard.appendChild(stepRow('Start', fmtHour(state.startHour),
      function () { if (state.startHour > 0) { state.startHour--; if (state.startHour >= state.endHour) state.endHour = state.startHour + 1; save(state); renderParentArea(); } },
      function () { if (state.startHour < state.endHour - 1) { state.startHour++; save(state); renderParentArea(); } }));
    tCard.appendChild(stepRow('Ende', fmtHour(state.endHour),
      function () { if (state.endHour > state.startHour + 1) { state.endHour--; save(state); renderParentArea(); } },
      function () { if (state.endHour < 24) { state.endHour++; save(state); renderParentArea(); } }));
    app().appendChild(tCard);
    app().appendChild(el('<div class="note">Au\u00dferhalb dieser Zeit zeigt die App eine Lernpause an.</div>'));
    var resetBtn = el('<button class="btn" style="background:#e63946">\uD83D\uDDD1\uFE0F Fortschritt zur\u00fccksetzen</button>');
    resetBtn.addEventListener('click', confirmReset);
    app().appendChild(resetBtn);
    app().appendChild(el('<div class="note">Setzt Punkte, Level und die Tages-Serie auf null zur\u00fcck. Farbe, Zeiten und Schwierigkeit bleiben erhalten.</div>'));
  }
  function confirmReset() {
    clear(); app().appendChild(el('<div class="screen-title">Wirklich zur\u00fccksetzen?</div>'));
    app().appendChild(el('<div class="card"><div class="readtext">Alle Punkte und Level von ' + KIND_NAME + ' werden gel\u00f6scht. Das kann nicht r\u00fcckg\u00e4ngig gemacht werden.</div></div>'));
    var yes = el('<button class="btn" style="background:#e63946">Ja, alles zur\u00fccksetzen</button>');
    yes.addEventListener('click', function () { resetProgress(); renderResetDone(); });
    var no = el('<button class="btn gray">Abbrechen</button>');
    no.addEventListener('click', renderHome);
    app().appendChild(yes); app().appendChild(no);
  }
  function resetProgress() { state.points = 0; state.completed = 0; state.streak = 0; state.lastActive = null; save(state); }
  function renderResetDone() {
    clear(); app().appendChild(el('<div class="header" style="margin-top:40px"><div class="badge-big">\u2705</div><div class="screen-title">Zur\u00fcckgesetzt!</div><div class="readtext">' + KIND_NAME + ' startet wieder bei 0 Punkten.</div></div>'));
    var b = el('<button class="btn green">Zum Start</button>'); b.addEventListener('click', renderHome); app().appendChild(b);
  }

  function celebrate(leveledUp, cb) {
    if (leveledUp) {
      clear();
      app().appendChild(el('<div class="header" style="margin-top:40px"><div class="badge-big">' + badgeFor(state.points) + '</div><div class="screen-title">Neues Level ' + levelFor(state.points) + ', ' + KIND_NAME + '! \uD83C\uDF89</div><div class="badge-name">' + badgeNameFor(state.points) + '</div><div class="points">' + state.points + ' Punkte</div></div>'));
      var btn = el('<button class="btn green">Weiter</button>'); btn.addEventListener('click', cb); app().appendChild(btn);
    } else { cb(); }
  }

  // ---- Rechnen ----
  function newMath() {
    var d = state.difficulty; var a, b, q, ans, type;
    if (d === 'leicht') {
      type = rnd(1, 2);
      if (type === 1) { a = rnd(1, 10); b = rnd(1, 10); q = a + ' + ' + b; ans = a + b; }
      else { a = rnd(2, 20); b = rnd(1, a); q = a + ' \u2212 ' + b; ans = a - b; }
    } else if (d === 'schwer') {
      type = rnd(1, 3);
      if (type === 1) { a = rnd(10, 90); b = rnd(10, 99); q = a + ' + ' + b; ans = a + b; }
      else if (type === 2) { a = rnd(30, 100); b = rnd(1, a); q = a + ' \u2212 ' + b; ans = a - b; }
      else { a = rnd(2, 10); b = rnd(2, 10); q = a + ' \u00D7 ' + b; ans = a * b; }
    } else {
      type = rnd(1, 3);
      if (type === 1) { a = rnd(1, 89); b = rnd(1, 100 - a); q = a + ' + ' + b; ans = a + b; }
      else if (type === 2) { a = rnd(10, 100); b = rnd(1, a); q = a + ' \u2212 ' + b; ans = a - b; }
      else { a = rnd(2, 5); b = rnd(2, 5); q = a + ' \u00D7 ' + b; ans = a * b; }
    }
    return { q: q, ans: ans };
  }
  function renderRechnen() {
    clear(); app().appendChild(backBar()); app().appendChild(el('<div class="screen-title">\uD83D\uDD22 Rechnen</div>'));
    var current = newMath(); var pts = pointsPerTask();
    app().appendChild(el('<div class="card"><div class="question">' + current.q + ' = ?</div><input class="bigfield" type="number" pattern="[0-9]*" id="answer"></div>'));
    var fb = el('<div class="feedback"></div>'); var btn = el('<button class="btn green">Pr\u00fcfen</button>');
    app().appendChild(btn); app().appendChild(fb);
    var input = document.getElementById('answer'); input.focus();
    btn.addEventListener('click', function () {
      var val = parseInt(input.value, 10);
      if (isNaN(val)) { fb.className = 'feedback no'; fb.textContent = 'Bitte eine Zahl eingeben'; return; }
      if (val === current.ans) { var up = addPoints(pts); fb.className = 'feedback ok'; fb.textContent = 'Richtig! +' + pts + ' Punkte \uD83C\uDF1F'; btn.disabled = true; setTimeout(function () { celebrate(up, renderRechnen); }, 900); }
      else { fb.className = 'feedback no'; fb.textContent = 'Fast! Versuch es nochmal.'; input.value = ''; input.focus(); }
    });
  }

  // ---- Logik: klar abgestufte Schwierigkeit ----
  // Leicht  = nur einfache, AUFSTEIGENDE Reihen / kleine Zahlen / kein Lesen
  // Mittel  = auf- und absteigend, Zahlen bis ~50
  // Schwer  = gro\u00dfe Schritte, Verdopplungsreihen, Zahlen bis ~200
  function newPattern() {
    var d = state.difficulty; var seq, answer, step;
    if (d === 'leicht') {
      var steps = [1, 2, 2, 5];
      step = steps[rnd(0, steps.length - 1)];
      var st = rnd(1, 5);
      seq = [st, st + step, st + step * 2, st + step * 3];
      answer = st + step * 4;
    } else if (d === 'schwer') {
      var mode = rnd(1, 3);
      if (mode === 1) { var st2 = rnd(3, 9); step = rnd(5, 9); seq = [st2, st2 + step, st2 + step * 2, st2 + step * 3]; answer = st2 + step * 4; }
      else if (mode === 2) { step = rnd(5, 9); var s2 = rnd(55, 95); seq = [s2, s2 - step, s2 - step * 2, s2 - step * 3]; answer = s2 - step * 4; }
      else { var bb = rnd(2, 4); seq = [bb, bb * 2, bb * 4, bb * 8]; answer = bb * 16; step = bb * 8; }
    } else {
      var mode2 = rnd(1, 2);
      if (mode2 === 1) { var st3 = rnd(2, 10); step = rnd(2, 5); seq = [st3, st3 + step, st3 + step * 2, st3 + step * 3]; answer = st3 + step * 4; }
      else { step = rnd(2, 5); var s3 = rnd(28, 48); seq = [s3, s3 - step, s3 - step * 2, s3 - step * 3]; answer = s3 - step * 4; }
    }
    return { anleitung: 'Welche Zahl kommt als N\u00e4chstes?', frage: seq.join('   ') + '   ?', options: numOptions(answer, [answer + step, answer - step, answer + 1]), correct: String(answer) };
  }
  function newDoubleHalf() {
    var d = state.difficulty;
    if (d === 'leicht') {
      var n = rnd(1, 5); var ans = n * 2;
      return { anleitung: 'Rechne im Kopf!', frage: 'Das Doppelte von ' + n + ' ist?', options: numOptions(ans, [ans + 1, ans - 1, n]), correct: String(ans) };
    }
    var maxN = d === 'schwer' ? 25 : 10;
    if (rnd(0, 1) === 0) { var n2 = rnd(2, maxN); var a2 = n2 * 2; return { anleitung: 'Rechne im Kopf!', frage: 'Das Doppelte von ' + n2 + ' ist?', options: numOptions(a2, [a2 + 2, a2 - 2, n2]), correct: String(a2) }; }
    else { var m = rnd(2, maxN) * 2; var h = m / 2; return { anleitung: 'Rechne im Kopf!', frage: 'Die H\u00e4lfte von ' + m + ' ist?', options: numOptions(h, [h + 1, h - 1, m]), correct: String(h) }; }
  }
  function newCount() {
    var d = state.difficulty; var lo = d === 'leicht' ? 3 : (d === 'schwer' ? 12 : 6); var hi = d === 'leicht' ? 7 : (d === 'schwer' ? 20 : 12);
    var icons = ['\uD83D\uDE9C','\uD83D\uDE99','\uD83D\uDE9A','\uD83E\uDDF1','\u26BD','\uD83C\uDFC7']; var ic = icons[rnd(0, icons.length - 1)];
    var n = rnd(lo, hi); var line = ''; for (var i = 0; i < n; i++) line += ic + ' ';
    return { anleitung: 'Wie viele siehst du? Z\u00e4hle genau!', frage: line, options: numOptions(n, [n + 1, n - 1, n + 2]), correct: String(n) };
  }
  function newOddOne() {
    var sets = [
      [['\uD83D\uDC36','\uD83D\uDC31','\uD83D\uDC34','\uD83D\uDC2E'], '\uD83D\uDE9C'],
      [['\uD83C\uDF4E','\uD83C\uDF4C','\uD83C\uDF50','\uD83C\uDF53'], '\uD83D\uDC36'],
      [['\uD83D\uDE9C','\uD83D\uDE99','\uD83D\uDE9A','\uD83D\uDE9B'], '\uD83C\uDF4E']
    ];
    var pick = sets[rnd(0, sets.length - 1)]; var odd = pick[1];
    var opts = shuffle(pick[0].concat([odd]));
    return { anleitung: 'Was passt nicht zu den anderen?', frage: '', options: opts, correct: odd };
  }
  function newBiggest() {
    var d = state.difficulty; var lo = 1; var hi = d === 'leicht' ? 10 : (d === 'schwer' ? 200 : 50);
    var nums = []; while (nums.length < 3) { var x = rnd(lo, hi); if (nums.indexOf(x) < 0) nums.push(x); }
    var big = Math.max(nums[0], nums[1], nums[2]);
    return { anleitung: 'Welche Zahl ist am gr\u00f6\u00dften?', frage: '', options: shuffle(nums.slice()).map(String), correct: String(big) };
  }
  function newTrueFalse() {
    var facts = [['Ein Spinne hat acht Beine.', true], ['Ein Dreieck hat vier Ecken.', false], ['Eine Woche hat sieben Tage.', true], ['Der Januar hat 40 Tage.', false], ['Eine Hand hat f\u00fcnf Finger.', true], ['Ein Fu\u00dfballteam hat zwei Spieler.', false], ['Ein Jahr hat zw\u00f6lf Monate.', true], ['Ein Quadrat hat drei Seiten.', false]];
    var f = facts[rnd(0, facts.length - 1)];
    return { anleitung: 'Stimmt das? Lies genau!', frage: f[0], options: ['Ja', 'Nein'], correct: f[1] ? 'Ja' : 'Nein' };
  }
  function newLogic() {
    var d = state.difficulty; var pool;
    if (d === 'leicht') pool = [newPattern, newDoubleHalf, newCount, newOddOne, newBiggest];
    else pool = [newPattern, newDoubleHalf, newCount, newOddOne, newBiggest, newTrueFalse];
    return pool[rnd(0, pool.length - 1)]();
  }

  function renderLogik() {
    clear(); app().appendChild(backBar()); app().appendChild(el('<div class="screen-title">\uD83E\uDDE0 Logik</div>'));
    var q = newLogic(); var pts = pointsPerTask();
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
            done = true; var up = addPoints(pts);
            b.style.background = '#c8f0e4'; b.style.borderColor = '#2a9d8f';
            fb.className = 'feedback ok'; fb.textContent = 'Richtig! +' + pts + ' \uD83C\uDF1F';
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
    var list = state.difficulty === 'leicht' ? WORDS_LEICHT : (state.difficulty === 'schwer' ? WORDS_SCHWER : WORDS_MITTEL);
    var word = list[rnd(0, list.length - 1)]; var pts = pointsPerTask();
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
      if (val === word.toLowerCase()) { var up = addPoints(pts); fb.className = 'feedback ok'; fb.textContent = 'Super! Das Wort war "' + word + '". +' + pts + ' \uD83C\uDF1F'; btn.disabled = true; setTimeout(function () { celebrate(up, renderSchreiben); }, 1100); }
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
    var text = TEXTS[rnd(0, TEXTS.length - 1)]; var pts = pointsPerTask();
    app().appendChild(el('<div class="card"><div class="readtext">' + text + '</div></div>'));
    app().appendChild(el('<div class="note">Maxime liest den Text laut vor. Danach gibt ein Elternteil per PIN die Punkte frei.</div>'));
    var btn = el('<button class="btn">\u2705 Vorgelesen - ' + pts + ' Punkte freigeben</button>');
    btn.addEventListener('click', function () { askPin(function () { var up = addPoints(pts); showAward(up, renderLesen); }); });
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
    if (up) { app().insertBefore(el('<div class="feedback ok">Neues Level ' + levelFor(state.points) + '! ' + badgeFor(state.points) + ' ' + badgeNameFor(state.points) + '</div>'), app().firstChild); }
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

  applyTheme(state.theme || 'orange');
  renderHome();
})();
