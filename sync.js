(function () {
  'use strict';

  // ---- Supabase-Konfiguration ----
  var BASE = 'https://jcfzdqdmwaokitqjrypb.supabase.co';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnpkcWRtd2Fva2l0cWpyeXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODU2ODksImV4cCI6MjA5ODA2MTY4OX0.dZE0NO2ZJ3rKpwQH-SD-HZXedokwhjNQaL0ZouyyMq4';
  var ID = 'maxime';
  var REST = BASE + '/rest/v1/maxime_state';
  var pushTimer = null;

  function canFetch() { try { return typeof window.fetch === 'function'; } catch (e) { return false; } }

  function baseHeaders() { return { 'apikey': ANON, 'Authorization': 'Bearer ' + ANON, 'Content-Type': 'application/json' }; }

  // Spielstand laden: cb(row) mit row = { data, updated_at } oder cb(null)
  function pull(cb) {
    if (!canFetch()) { cb(null); return; }
    try {
      window.fetch(REST + '?id=eq.' + ID + '&select=data,updated_at', { headers: baseHeaders() })
        .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
        .then(function (rows) { cb(rows && rows.length ? rows[0] : null); })
        .catch(function () { cb(null); });
    } catch (e) { cb(null); }
  }

  // Spielstand sofort hochladen (Upsert auf id='maxime')
  function pushNow(state) {
    if (!canFetch()) return;
    try {
      var h = baseHeaders(); h['Prefer'] = 'resolution=merge-duplicates,return=minimal';
      var body = [{ id: ID, data: state, updated_at: new Date().toISOString() }];
      window.fetch(REST, { method: 'POST', headers: h, body: JSON.stringify(body) })
        .then(function () {}).catch(function () {});
    } catch (e) {}
  }

  // Gedrosseltes Hochladen, damit nicht jeder Klick einzeln feuert
  function schedulePush(state) {
    if (pushTimer) { clearTimeout(pushTimer); }
    pushTimer = setTimeout(function () { pushNow(state); }, 1500);
  }

  window.MaximeSync = { pull: pull, pushNow: pushNow, schedulePush: schedulePush, enabled: canFetch() };
})();
