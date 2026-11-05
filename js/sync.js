/* Progress backup and sync through Supabase.
   The phone keeps its own copy (so the app works offline); this file sends it to the
   `arabski_progress` table when online and merges in what other devices saved. */
(function () {
  'use strict';

  const cfg = window.PL_CONFIG || {};
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseKey && window.supabase && window.supabase.createClient);
  const LAST_KEY = 'arabski-dom-lastsync';
  let client = null;
  let session = null;
  let hooks = null;
  let timer = null;
  let busy = false;
  let state = enabled ? 'signed-out' : 'off';
  let lastError = '';
  let recovery = false;

  /* ---------- Merging two copies of progress ---------- */
  function maxStr(a, b) { return !a ? b || null : !b ? a : (a > b ? a : b); }
  function minStr(a, b) { return !a ? b || null : !b ? a : (a < b ? a : b); }
  function itemScore(x) { return (x.seen || 0) + (x.errors || 0) + (x.right || 0); }
  function merge(local, remote) {
    if (!remote) return local;
    if (!local) return remote;
    // "Start from zero" on one device wins over older progress everywhere.
    if ((local.resetAt || 0) !== (remote.resetAt || 0)) {
      return (local.resetAt || 0) > (remote.resetAt || 0) ? local : Object.assign({}, remote, { voice: local.voice, lang: local.lang });
    }
    const m = JSON.parse(JSON.stringify(local));
    m.startDate = minStr(local.startDate, remote.startDate);
    m.lessonsDone = local.lessonsDone.concat(remote.lessonsDone.filter(function (id) { return local.lessonsDone.indexOf(id) === -1; }));
    const ids = Object.keys(Object.assign({}, local.items, remote.items));
    m.items = {};
    ids.forEach(function (id) {
      const x = local.items[id], y = remote.items[id];
      if (!x || !y) { m.items[id] = JSON.parse(JSON.stringify(x || y)); return; }
      const pick = JSON.parse(JSON.stringify(itemScore(x) >= itemScore(y) ? x : y));
      pick.learnedOn = minStr(x.learnedOn, y.learnedOn);
      m.items[id] = pick;
    });
    m.lastLessonOn = maxStr(local.lastLessonOn, remote.lastLessonOn);
    m.testPassedOn = maxStr(local.testPassedOn, remote.testPassedOn);
    const seen = {};
    m.tests = local.tests.concat(remote.tests).filter(function (t) {
      const k = t.date + '|' + t.kind + '|' + t.score + '|' + t.total;
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    m.listen = (local.listen.t >= remote.listen.t ? local : remote).listen;
    m.speak = (local.speak.t >= remote.speak.t ? local : remote).speak;
    const w = (local.weakOn || '') >= (remote.weakOn || '') ? local : remote;
    m.weak = w.weak; m.weakOn = w.weakOn;
    if (m.weakOn && m.testPassedOn && m.testPassedOn >= m.weakOn) { m.weak = null; m.weakOn = null; }
    m.voice = local.voice;
    m.lang = local.lang;
    m.points = Math.max(local.points || 0, remote.points || 0);
    m.days = (local.days || []).concat((remote.days || []).filter(function (d) { return (local.days || []).indexOf(d) === -1; }));
    const ls = local.sounds || {}, rs = remote.sounds || {};
    m.sounds = {};
    Object.keys(Object.assign({}, ls, rs)).forEach(function (f) {
      const x = ls[f], y = rs[f];
      m.sounds[f] = JSON.parse(JSON.stringify(!y || (x && x.seen >= y.seen) ? x : y));
    });
    return m;
  }

  /* ---------- Talking to Supabase ---------- */
  function setState(s, err) {
    state = s;
    lastError = err || '';
    if (hooks && hooks.onStatus) hooks.onStatus();
  }
  function stamp() { try { localStorage.setItem(LAST_KEY, new Date().toISOString()); } catch (e) { /* storage blocked */ } }
  function lastSync() { try { return localStorage.getItem(LAST_KEY); } catch (e) { return null; } }

  function forCloud(s) {
    const c = JSON.parse(JSON.stringify(s));
    delete c.voice; // each device keeps its own voice choice
    delete c.lang;
    return c;
  }

  async function pull() {
    const res = await client.from('arabski_progress').select('data').eq('user_id', session.user.id).maybeSingle();
    if (res.error) throw res.error;
    return res.data ? res.data.data : null;
  }
  async function push(data) {
    const res = await client.from('arabski_progress').upsert({ user_id: session.user.id, data: forCloud(data), updated_at: new Date().toISOString() });
    if (res.error) throw res.error;
  }

  // Full sync: download, merge, keep the result here and upload it.
  async function syncNow() {
    if (!enabled || !session || busy) return;
    if (navigator.onLine === false) { setState('offline'); return; }
    busy = true;
    setState('syncing');
    try {
      const remote = await pull();
      const merged = merge(hooks.getState(), remote);
      hooks.setState(merged);
      await push(merged);
      stamp();
      setState('synced');
    } catch (e) {
      setState('error', e && e.message ? e.message : String(e));
    } finally {
      busy = false;
    }
  }
  // After each local save: upload a moment later, once activity settles.
  function schedule() {
    if (!enabled || !session) return;
    clearTimeout(timer);
    timer = setTimeout(syncNow, 2500);
  }

  /* ---------- Accounts ---------- */
  const MESSAGES = [
    [/invalid login credentials/i, 'Nieprawidłowy e-mail lub hasło.'],
    [/email not confirmed/i, 'Najpierw potwierdź e-mail: otwórz wiadomość i kliknij link.'],
    [/already registered|already exists/i, 'Ten e-mail ma już konto. Zaloguj się.'],
    [/password should be at least|weak/i, 'Hasło jest za krótkie. Użyj co najmniej 8 znaków.'],
    [/invalid.*email|unable to validate email/i, 'Nieprawidłowy e-mail.'],
    [/rate limit|too many/i, 'Zbyt wiele prób. Poczekaj minutę.'],
    [/failed to fetch|network/i, 'Brak połączenia z internetem.']
  ];
  function friendlyError(e) {
    const msg = e && e.message ? e.message : String(e);
    for (let i = 0; i < MESSAGES.length; i++) if (MESSAGES[i][0].test(msg)) return MESSAGES[i][1];
    return 'Błąd: ' + msg;
  }
  function appUrl() { return location.origin + location.pathname; }

  async function signIn(email, password) {
    const r = await client.auth.signInWithPassword({ email: email, password: password });
    if (r.error) return { error: friendlyError(r.error) };
    return { ok: true };
  }
  async function signUp(email, password) {
    const r = await client.auth.signUp({ email: email, password: password, options: { emailRedirectTo: appUrl() } });
    if (r.error) return { error: friendlyError(r.error) };
    if (!r.data.session) return { confirm: true };
    return { ok: true };
  }
  async function resetPassword(email) {
    const r = await client.auth.resetPasswordForEmail(email, { redirectTo: appUrl() });
    if (r.error) return { error: friendlyError(r.error) };
    return { ok: true };
  }
  async function setNewPassword(password) {
    const r = await client.auth.updateUser({ password: password });
    if (r.error) return { error: friendlyError(r.error) };
    recovery = false;
    return { ok: true };
  }
  async function signOut() {
    clearTimeout(timer);
    await client.auth.signOut();
  }

  function init(h) {
    hooks = h;
    if (!enabled) return;
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'polski-dom-auth' }
    });
    client.auth.onAuthStateChange(function (event, s) {
      session = s;
      if (event === 'PASSWORD_RECOVERY') { recovery = true; setState('recovery'); if (hooks.onRecovery) hooks.onRecovery(); return; }
      if (!s) { setState('signed-out'); return; }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setState('synced');
        // Supabase advises not awaiting other client calls inside this callback.
        setTimeout(syncNow, 0);
      }
    });
    window.addEventListener('online', function () { if (session) syncNow(); });
    window.addEventListener('offline', function () { if (session) setState('offline'); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && session) syncNow(); });
  }

  window.PLSync = {
    enabled: enabled,
    init: init,
    schedule: schedule,
    syncNow: syncNow,
    signIn: signIn,
    signUp: signUp,
    signOut: signOut,
    resetPassword: resetPassword,
    setNewPassword: setNewPassword,
    merge: merge,
    status: function () { return { state: state, email: session ? session.user.email : null, last: lastSync(), error: lastError, recovery: recovery }; }
  };
})();
