(function () {
  'use strict';

  const D = window.AR_DATA;
  const app = document.getElementById('app');
  const KEY = 'arabski-dom-v1';
  const GOAL_DAYS = 180;
  const PASS = 0.8;
  const TEST_MAX = 15; // keeps the daily test inside a 20–30 minute session
  const SAY_PASS = 0.75; // share of words the phone must recognize; dialect makes 100% unfair

  /* ---------- Dates ---------- */
  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(a, b) {
    return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
  }

  /* ---------- Saved progress ---------- */
  function fresh() {
    return {
      v: 1, app: 'arabski', startDate: today(), lessonsDone: [], items: {}, lastLessonOn: null,
      testPassedOn: null, tests: [], listen: { r: 0, t: 0 }, speak: { r: 0, t: 0 },
      weak: null, weakOn: null, voice: null, sounds: {}, days: [], points: 0, lang: 'pl'
    };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v === 1) return Object.assign(fresh(), s);
    } catch (e) { /* storage blocked */ }
    return fresh();
  }
  let S = load();
  // Opened through the husband's follow link: show her progress and change nothing here.
  const followId = new URLSearchParams(location.search).get('f');
  function store() {
    if (followId) return;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ }
  }
  function save() {
    store();
    if (window.PLSync && !followId) window.PLSync.schedule();
  }
  function item(id) {
    if (!S.items[id]) S.items[id] = { learnedOn: null, errors: 0, seen: 0, right: 0, weak: false };
    return S.items[id];
  }
  function markDay() {
    const d = today();
    if (S.days.indexOf(d) === -1) S.days.push(d);
  }
  function streak() {
    let n = 0, at = today();
    if (S.days.indexOf(at) === -1) at = shiftDay(at, -1);
    while (S.days.indexOf(at) !== -1) { n++; at = shiftDay(at, -1); }
    return n;
  }
  function shiftDay(s, by) {
    const d = new Date(s + 'T12:00:00');
    d.setDate(d.getDate() + by);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* ---------- Language ---------- */
  function t(k) {
    let s = window.AR_UI[S.lang][k];
    for (let i = 1; i < arguments.length; i++) s = s.replace('{' + (i - 1) + '}', arguments[i]);
    return s;
  }
  function M(o) { return o[S.lang]; }
  function setLang(l) { S.lang = l; document.documentElement.lang = l; store(); }
  document.documentElement.lang = S.lang;

  /* ---------- Content index ---------- */
  const PHRASES = {};
  D.LESSONS.forEach(function (L, li) {
    L.no = li + 1;
    L.phrases.forEach(function (p, pi) {
      p.id = L.id + '.' + (pi + 1);
      p.lesson = L;
      PHRASES[p.id] = p;
    });
  });
  const ALL_IDS = Object.keys(PHRASES);

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* ---------- Small DOM helpers ---------- */
  function h(html) {
    const e = document.createElement('template');
    e.innerHTML = html.trim();
    return e.content.firstElementChild;
  }
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }
  function pct(r, n) { return n ? Math.round((r / n) * 100) : null; }

  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    slow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6V4zm-1 4v5l4 2.5.8-1.3-3.3-2V8z"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-2.1a7 7 0 0 0 6-6.9z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.4-2.9a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>'
  };

  /* ---------- Flow control (leaving a lesson stops its loop) ---------- */
  let flow = { alive: true };
  function newFlow() { flow.alive = false; flow = { alive: true }; stopAudio(); return flow; }

  /* ---------- Arabic voice (text to speech) ---------- */
  let arVoices = [];
  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    arVoices = speechSynthesis.getVoices().filter(function (v) { return /^ar/i.test(v.lang); });
  }
  if ('speechSynthesis' in window) {
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }
  function pickVoice() {
    if (!arVoices.length) return null;
    return arVoices.find(function (v) { return v.voiceURI === S.voice; }) ||
      arVoices.find(function (v) { return /JO/i.test(v.lang); }) || arVoices[0];
  }
  // Speed starts slow and rises with each finished lesson, up to natural speed.
  function baseRate() { return Math.min(1, 0.7 + 0.03 * S.lessonsDone.length); }
  function stopAudio() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function speak(text, rate) {
    return new Promise(function (res) {
      if (!('speechSynthesis' in window)) { res(); return; }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice();
      u.lang = v ? v.lang : 'ar-JO';
      if (v) u.voice = v;
      u.rate = rate || baseRate();
      let done = false;
      const end = function () { if (!done) { done = true; res(); } };
      u.onend = end; u.onerror = end;
      setTimeout(end, 12000);
      speechSynthesis.speak(u);
    });
  }
  function audioButtons(text) {
    const wrap = h('<div class="audio"><button type="button" class="btn ghost icon-btn" data-a="play">' + ICON.play + '<span>' + t('listen') + '</span></button><button type="button" class="btn ghost icon-btn" data-a="slow">' + ICON.slow + '<span>' + t('slow') + '</span></button></div>');
    wrap.querySelector('[data-a=play]').onclick = function () { speak(text); };
    wrap.querySelector('[data-a=slow]').onclick = function () { speak(text, 0.5); };
    return wrap;
  }

  /* ---------- Speech recognition (needs internet) ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function canListen() { return !!SR && navigator.onLine !== false; }
  function recognize() {
    return new Promise(function (res, rej) {
      let r;
      try { r = new SR(); } catch (e) { rej('unsupported'); return; }
      r.lang = 'ar-JO';
      r.interimResults = false;
      r.maxAlternatives = 5;
      let got = false;
      r.onresult = function (e) {
        got = true;
        const alts = [];
        for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
        res(alts);
      };
      r.onerror = function (e) { rej(e.error || 'error'); };
      r.onend = function () { if (!got) rej('no-speech'); };
      try { r.start(); } catch (e) { rej('busy'); }
    });
  }

  /* ---------- Comparing what was said ----------
     The phone writes down what it heard in Arabic letters, and spellings of spoken
     Jordanian vary, so words only need to be close, not identical. */
  function norm(s) {
    return s.replace(/[ً-ْٰـ]/g, '')
      .replace(/[.,!?;:،؟؛…"'«»()\-–—]/g, ' ')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ء/g, '')
      .replace(/ث/g, 'ت').replace(/ذ/g, 'د').replace(/ظ/g, 'ض')
      .replace(/\s+/g, ' ').trim();
  }
  function distance(a, b) {
    const row = [];
    for (let j = 0; j <= b.length; j++) row[j] = j;
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const cur = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = cur;
      }
    }
    return row[b.length];
  }
  function close(a, b) {
    if (a === b) return true;
    const n = Math.max(a.length, b.length);
    return n >= 3 && 1 - distance(a, b) / n >= 0.7;
  }
  // Marks which target words were heard, in order (longest common subsequence).
  function matchWords(a, b) {
    const n = a.length, m = b.length;
    const dp = [];
    for (let i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = close(a[i], b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const ok = new Array(n).fill(false);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (close(a[i], b[j])) { ok[i] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    return ok;
  }
  function evaluate(phrase, alts) {
    const tw = phrase.ar.split(/\s+/).map(norm);
    const joined = tw.join('');
    let best = null;
    alts.forEach(function (alt) {
      const hw = norm(alt).split(' ').filter(Boolean);
      let ok = matchWords(tw, hw);
      // The phone may split or join words differently; compare the whole sentence too.
      const whole = hw.join('');
      if (whole && 1 - distance(joined, whole) / Math.max(joined.length, whole.length) >= 0.8) ok = tw.map(function () { return true; });
      const score = ok.filter(Boolean).length / tw.length;
      if (!best || score > best.score) best = { ok: ok, score: score, heard: hw };
    });
    best.tokens = phrase.ph.split(/\s+/);
    best.words = tw;
    best.pass = best.score >= SAY_PASS;
    return best;
  }

  /* ---------- Which sounds are going wrong ---------- */
  const FAMILY = { 'ع': 'ain', 'ا': 'ain', 'ح': 'ha', 'ه': 'ha', 'خ': 'kh', 'غ': 'kh', 'ص': 'emph', 'س': 'emph', 'ط': 'emph', 'ت': 'emph', 'ض': 'emph', 'د': 'emph' };
  const PATTERN_AT = 3; // repeated mistakes before a pronunciation lesson appears
  const RECOVERED_AT = 10; // correct uses in a row that clear it
  function soundRec(f) {
    if (!S.sounds[f]) S.sounds[f] = { seen: 0, miss: 0, open: 0, run: 0 };
    return S.sounds[f];
  }
  function trackSounds(r) {
    const used = {};
    r.words.forEach(function (w) {
      const exact = r.heard.indexOf(w);
      if (exact !== -1) {
        used[exact] = true;
        Array.from(w).forEach(function (u) {
          const f = FAMILY[u];
          if (!f) return;
          const rec = soundRec(f);
          rec.seen++; rec.run++;
          if (rec.run >= RECOVERED_AT) rec.open = 0;
        });
        return;
      }
      // Find the heard word closest to this one and compare them letter by letter.
      let bestDiff = null;
      r.heard.forEach(function (hw, i) {
        if (used[i] || hw.length !== w.length) return;
        const diff = [];
        Array.from(w).forEach(function (u, x) { if (u !== hw[x]) diff.push([u, hw[x]]); });
        if (diff.length && diff.length <= 2 && (!bestDiff || diff.length < bestDiff.diff.length)) bestDiff = { diff: diff, i: i };
      });
      if (!bestDiff) return;
      used[bestDiff.i] = true;
      bestDiff.diff.forEach(function (d) {
        const ft = FAMILY[d[0]];
        if (!ft || ft !== FAMILY[d[1]]) return;
        const rec = soundRec(ft);
        rec.seen++; rec.miss++; rec.open++; rec.run = 0;
      });
    });
    store();
  }
  function soundPattern() {
    let best = null;
    window.AR_SOUNDS.forEach(function (g) {
      const rec = S.sounds[g.family];
      if (rec && rec.open >= PATTERN_AT && (!best || rec.open > S.sounds[best.family].open)) best = g;
    });
    return best;
  }
  function diffHTML(res) {
    return res.tokens.map(function (w, k) { return '<span class="' + (res.ok[k] ? 'good' : 'bad') + '">' + esc(w) + '</span>'; }).join(' ');
  }

  /* ---------- Saying a sentence until it is right ----------
     opts.recall: hide the sentence (test from memory) and offer the Answer button; using it counts as wrong.
     opts.noEcho: the sentence is already on screen, so do not repeat it here.
     opts.tries: attempts that still count as correct.
     Resolves { correct } where correct = said right within opts.tries attempts. */
  function sayTask(box, phrase, opts) {
    opts = opts || {};
    const tries = opts.tries || 1;
    return new Promise(function (resolve) {
      let attempts = 0, failed = false, peeked = false, revealed = !opts.recall;
      const el = h('<div class="say"><div class="say-target"></div><button type="button" class="mic">' + ICON.mic + '<span>' + t('tapSpeak') + '</span></button><p class="say-status" role="status"></p><div class="say-actions"></div></div>');
      box.appendChild(el);
      const micBtn = el.querySelector('.mic');
      const status = el.querySelector('.say-status');
      const actions = el.querySelector('.say-actions');
      const target = el.querySelector('.say-target');

      function showTarget() {
        if (!revealed || opts.noEcho) return;
        target.innerHTML = '<p class="ph small">' + esc(phrase.ph) + '</p>';
      }
      showTarget();

      if (opts.recall) {
        const ab = h('<button type="button" class="btn ghost answer-btn">' + t('answer') + '</button>');
        ab.onclick = function () {
          failed = true;
          peeked = true;
          revealed = true;
          ab.remove();
          showTarget();
          status.textContent = t('markedWrong');
          speak(phrase.ar, 0.55);
        };
        el.insertBefore(ab, status);
      }

      function finish() {
        const ab = el.querySelector('.answer-btn');
        if (ab) ab.remove();
        micBtn.hidden = true;
        actions.innerHTML = '';
        const next = h('<button type="button" class="btn primary">' + t('next') + '</button>');
        next.onclick = function () { el.classList.add('done'); resolve({ correct: !failed }); };
        actions.appendChild(next);
        next.focus();
      }
      // A phone that cannot follow the dialect must not cost her the test:
      // arranging the words correctly on the first try counts as a right answer.
      function offerTiles(reason) {
        actions.innerHTML = '';
        if (reason) status.textContent = reason;
        const b = h('<button type="button" class="btn ghost">' + t('useTiles') + '</button>');
        b.onclick = function () {
          micBtn.hidden = true;
          actions.innerHTML = '';
          status.textContent = '';
          tilesTask(el, phrase).then(function (r) {
            failed = peeked || !r.firstTry;
            finish();
          });
        };
        actions.appendChild(b);
      }

      if (!canListen()) {
        micBtn.hidden = true;
        offerTiles(!SR ? t('noSr') : t('needNet'));
        return;
      }

      micBtn.onclick = function () {
        stopAudio();
        micBtn.disabled = true;
        micBtn.classList.add('listening');
        status.textContent = t('listening');
        recognize().then(function (alts) {
          micBtn.disabled = false;
          micBtn.classList.remove('listening');
          const r = evaluate(phrase, alts);
          trackSounds(r);
          attempts++;
          if (r.pass) {
            if (attempts > tries) failed = true;
            revealed = true;
            target.innerHTML = '<p class="ph small ok-line">' + diffHTML(r) + '</p>';
            if (failed && opts.recall) status.textContent = t('rightButWrong');
            else status.textContent = attempts === 1 ? t('great') : t('nowRight');
            el.classList.add('pass');
            finish();
          } else if (!revealed && attempts < tries) {
            // Testing from memory: one more try before the answer is shown.
            status.textContent = t('thinkAgain');
            micBtn.querySelector('span').textContent = t('tryAgain');
          } else {
            if (attempts >= tries) failed = true;
            revealed = true;
            target.innerHTML = '<p class="ph small">' + diffHTML(r) + '</p>';
            status.textContent = t('redWords');
            micBtn.querySelector('span').textContent = t('tryAgain');
            speak(phrase.ar, 0.55);
            if (attempts >= 2) offerTiles();
          }
        }).catch(function (err) {
          micBtn.disabled = false;
          micBtn.classList.remove('listening');
          if (err === 'no-speech' || err === 'aborted') status.textContent = t('noHear');
          else if (err === 'not-allowed' || err === 'service-not-allowed') offerTiles(t('micAllow'));
          else if (err === 'network') offerTiles(t('needNet'));
          else offerTiles(t('micFail'));
        });
      };
    });
  }

  /* ---------- Word tiles (works offline) ---------- */
  function tilesTask(box, phrase) {
    return new Promise(function (resolve) {
      const words = phrase.ph.split(/\s+/);
      let order = shuffle(words.map(function (w, i) { return { w: w, i: i }; }));
      if (words.length > 1 && order.every(function (o, k) { return o.i === k; })) order = order.slice(1).concat(order[0]);
      let picked = [];
      let firstTry = true;
      const el = h('<div class="tiles"><p class="hint">' + t('tilesHint') + '</p><div class="tile-answer"></div><div class="tile-pool"></div><p class="say-status" role="status"></p><div class="say-actions"><button type="button" class="btn primary" data-a="check">' + t('check') + '</button></div></div>');
      box.appendChild(el);
      const ans = el.querySelector('.tile-answer'), pool = el.querySelector('.tile-pool');
      const status = el.querySelector('.say-status');
      function draw() {
        ans.innerHTML = ''; pool.innerHTML = '';
        picked.forEach(function (o, k) {
          const b = h('<button type="button" class="tile on"></button>');
          b.textContent = o.w;
          b.onclick = function () { picked.splice(k, 1); draw(); };
          ans.appendChild(b);
        });
        order.forEach(function (o) {
          if (picked.indexOf(o) !== -1) return;
          const b = h('<button type="button" class="tile"></button>');
          b.textContent = o.w;
          b.onclick = function () { picked.push(o); draw(); };
          pool.appendChild(b);
        });
      }
      draw();
      el.querySelector('[data-a=check]').onclick = function () {
        const said = picked.map(function (o) { return o.w; }).join(' ');
        if (said === phrase.ph) {
          status.textContent = firstTry ? t('right') : t('nowRight');
          el.classList.add('pass');
          el.querySelector('[data-a=check]').hidden = true;
          speak(phrase.ar);
          resolve({ firstTry: firstTry });
        } else {
          firstTry = false;
          status.textContent = t('wrongOrder');
          speak(phrase.ar, 0.55);
          picked = [];
          draw();
        }
      };
    });
  }

  document.addEventListener('click', function (e) {
    const f = e.target.closest('[data-say]');
    if (f) speak(f.dataset.say);
  });

  /* ---------- Shared screen frame ---------- */
  function frame(title, onClose) {
    const s = h('<section class="screen"><header class="bar"><button type="button" class="icon-only" aria-label="' + t('close') + '">' + ICON.close + '</button><div class="bar-title"></div><div class="bar-progress" aria-hidden="true"><span></span></div></header><div class="stage"></div></section>');
    s.querySelector('.bar-title').textContent = title;
    s.querySelector('.icon-only').onclick = onClose;
    app.innerHTML = '';
    app.appendChild(s);
    window.scrollTo(0, 0);
    return {
      fl: newFlow(),
      close: s.querySelector('.icon-only'),
      stage: s.querySelector('.stage'),
      progress: function (x) { s.querySelector('.bar-progress span').style.width = Math.round(x * 100) + '%'; },
      title: function (x) { s.querySelector('.bar-title').textContent = x; }
    };
  }
  function confirmLeave(F, msg) {
    return function () {
      if (F.stage.querySelector('.leave')) return;
      const box = h('<div class="leave" role="alertdialog"><p></p><div class="row"><button type="button" class="btn danger" data-a="y">' + t('leaveYes') + '</button><button type="button" class="btn ghost" data-a="n">' + t('leaveNo') + '</button></div></div>');
      box.querySelector('p').textContent = msg;
      box.querySelector('[data-a=y]').onclick = function () { newFlow(); home(); };
      box.querySelector('[data-a=n]').onclick = function () { box.remove(); };
      F.stage.prepend(box);
      window.scrollTo(0, 0);
    };
  }
  function recordSpeak(id, correct) {
    S.speak.t++;
    if (correct) S.speak.r++;
    else item(id).errors++;
    save();
  }

  /* ---------- Phrase card: see, hear, say until right ---------- */
  async function phraseCard(F, p, label) {
    F.stage.innerHTML = '';
    const card = h('<article class="card phrase"><p class="eyebrow"></p><p class="ph big"></p><p class="meaning"></p></article>');
    card.querySelector('.eyebrow').textContent = label;
    card.querySelector('.ph').textContent = p.ph;
    card.querySelector('.meaning').textContent = M(p);
    card.appendChild(audioButtons(p.ar));
    if (p.note) card.appendChild(h('<p class="note grammar"></p>')).textContent = M(p.note);
    F.stage.appendChild(card);
    const sayBox = h('<div class="card say-card"><p class="eyebrow">' + t('sayIt') + '</p></div>');
    F.stage.appendChild(sayBox);
    speak(p.ar);
    const r = await sayTask(sayBox, p, { tries: 1, noEcho: true });
    if (!F.fl.alive) return;
    recordSpeak(p.id, r.correct);
  }

  /* ---------- Conversation ---------- */
  function meaningOptions(correct, pool, n) {
    const uniq = pool.filter(function (x, i) { return x !== correct && pool.indexOf(x) === i; });
    const others = shuffle(uniq).slice(0, n - 1);
    return shuffle([correct].concat(others));
  }
  function choiceTask(box, options, correct, spelled) {
    return new Promise(function (resolve) {
      const el = h('<div class="choices"></div>');
      let first = true;
      options.forEach(function (o) {
        const b = h('<button type="button" class="choice"></button>');
        b.textContent = o;
        if (spelled) b.classList.add('choice-ph');
        b.onclick = function () {
          if (el.classList.contains('answered')) return;
          if (o === correct) {
            b.classList.add('right');
            el.classList.add('answered');
            resolve({ firstTry: first });
          } else {
            first = false;
            b.classList.add('wrong');
            b.disabled = true;
          }
        };
        el.appendChild(b);
      });
      box.appendChild(el);
    });
  }
  function matchTask(box, pairs) {
    return new Promise(function (resolve) {
      let first = true, picked = null, left = pairs.length;
      const el = h('<div class="match"><div class="match-col"></div><div class="match-col"></div></div>');
      shuffle(pairs).forEach(function (p) {
        const b = h('<button type="button" class="tile"></button>');
        b.textContent = p.ph;
        b.onclick = function () {
          if (b.classList.contains('matched')) return;
          if (picked) picked.b.classList.remove('on');
          picked = { b: b, id: p.id };
          b.classList.add('on');
          speak(p.ar);
        };
        el.children[0].appendChild(b);
      });
      shuffle(pairs).forEach(function (p) {
        const b = h('<button type="button" class="tile tile-mean"></button>');
        b.textContent = M(p);
        b.onclick = function () {
          if (!picked || b.classList.contains('matched')) return;
          if (picked.id === p.id) {
            picked.b.classList.remove('on');
            picked.b.classList.add('matched');
            b.classList.add('matched');
            picked = null;
            if (--left === 0) resolve({ firstTry: first });
          } else {
            first = false;
            b.classList.add('miss');
            setTimeout(function () { b.classList.remove('miss'); }, 600);
          }
        };
        el.children[1].appendChild(b);
      });
      box.appendChild(el);
    });
  }
  function allMeanings() { return ALL_IDS.map(function (id) { return M(PHRASES[id]); }); }
  async function runDialog(F, L) {
    F.stage.innerHTML = '';
    F.stage.appendChild(h('<div class="scene"><p class="eyebrow">' + t('convo') + '</p><p class="scene-title"></p><p class="note">' + t('convoNote') + '</p></div>')).querySelector('.scene-title').textContent = t('withWho', M(L.who));
    const chat = h('<div class="chat"></div>');
    F.stage.appendChild(chat);
    const pool = L.dialog.filter(function (x) { return x.c; }).map(M).concat(allMeanings());
    for (let i = 0; i < L.dialog.length; i++) {
      if (!F.fl.alive) return;
      F.progress(0.5 + 0.5 * (i / L.dialog.length));
      const line = L.dialog[i];
      if (line.c) {
        const b = h('<div class="bubble them"><p class="who"></p><p class="ph hidden-text"></p><p class="meaning" hidden></p></div>');
        b.querySelector('.who').textContent = M(L.who);
        b.querySelector('.ph').textContent = line.ph;
        b.querySelector('.meaning').textContent = M(line);
        b.appendChild(audioButtons(line.c));
        chat.appendChild(b);
        const q = h('<div class="ask"><p class="eyebrow"></p></div>');
        q.querySelector('.eyebrow').textContent = L.who.he ? t('whatSaidM') : t('whatSaidF');
        chat.appendChild(q);
        b.scrollIntoView({ block: 'start', behavior: 'smooth' });
        speak(line.c);
        const r = await choiceTask(q, meaningOptions(M(line), pool, 3), M(line));
        if (!F.fl.alive) return;
        S.listen.t++; if (r.firstTry) S.listen.r++; save();
        b.querySelector('.ph').classList.remove('hidden-text');
        b.querySelector('.meaning').hidden = false;
        q.remove();
      } else {
        const p = L.phrases[line.u];
        const b = h('<div class="bubble me"><p class="who">' + t('you') + '</p><p class="prompt"></p></div>');
        b.querySelector('.prompt').textContent = t('sayPrompt', M(p));
        chat.appendChild(b);
        b.scrollIntoView({ block: 'start', behavior: 'smooth' });
        const r = await sayTask(b, p, { tries: 1 });
        if (!F.fl.alive) return;
        recordSpeak(p.id, r.correct);
      }
    }
  }

  async function runLesson(L, practice) {
    const F = frame(M(L.title), null);
    const fl = F.fl;
    F.close.onclick = confirmLeave(F, practice ? t('leavePractice') : t('leaveLesson'));
    for (let i = 0; i < L.phrases.length; i++) {
      F.progress(0.5 * (i / L.phrases.length));
      await phraseCard(F, L.phrases[i], t('newPhrase', i + 1, L.phrases.length));
      if (!fl.alive) return;
    }
    await runDialog(F, L);
    if (!fl.alive) return;
    F.progress(1);
    if (!practice) {
      const d = today();
      L.phrases.forEach(function (p) { const it = item(p.id); if (!it.learnedOn) it.learnedOn = d; });
      if (S.lessonsDone.indexOf(L.id) === -1) S.lessonsDone.push(L.id);
      S.lastLessonOn = d;
      S.points += 20;
      markDay();
      save();
    }
    F.stage.innerHTML = '';
    const done = h('<div class="card result good"><p class="eyebrow">' + t('lessonDone') + '</p><h2></h2><p></p><button type="button" class="btn primary">' + t('backHome') + '</button></div>');
    done.querySelector('h2').textContent = practice ? t('practiceGood') : t('learnedN', L.phrases.length);
    done.querySelector('p').textContent = practice ? t('practiceNote') : t('tomorrowTest');
    done.querySelector('button').onclick = home;
    F.stage.appendChild(done);
  }

  /* ---------- Daily test ----------
     Everything learned before today can appear. The newest lesson always does,
     then the sentences with the most mistakes, then the ones seen least. */
  function learnedBefore() {
    const d = today();
    return ALL_IDS.filter(function (id) { const it = S.items[id]; return it && it.learnedOn && it.learnedOn < d; });
  }
  function testIds() {
    const ids = learnedBefore();
    if (ids.length <= TEST_MAX) return ids;
    const newest = ids.reduce(function (m, id) { return S.items[id].learnedOn > m ? S.items[id].learnedOn : m; }, '');
    const first = ids.filter(function (id) { return S.items[id].learnedOn === newest; });
    const rest = shuffle(ids.filter(function (id) { return first.indexOf(id) === -1; })).sort(function (a, b) {
      const x = S.items[a], y = S.items[b];
      return (y.errors - y.right) - (x.errors - x.right) || x.seen - y.seen;
    });
    return first.concat(rest).slice(0, TEST_MAX);
  }
  function needsTest() { return learnedBefore().length > 0 && S.testPassedOn !== today(); }
  /* Question types. Answers are by tapping or by voice; nothing is typed. */
  const REPLY = {};
  D.LESSONS.forEach(function (L) {
    L.dialog.forEach(function (d, i) {
      const prev = L.dialog[i - 1];
      if (d.u !== undefined && prev && prev.c) REPLY[L.phrases[d.u].id] = { line: prev, who: L.who };
    });
  });
  const LISTENING = ['listen', 'heard', 'truefalse', 'reply', 'tilesHeard'];
  const SPOKEN = ['speak', 'replysay'];
  function clean(w) { return w.replace(/[.,!?…:;]/g, ''); }
  function wordsOf(p) { return p.ph.split(/\s+/); }
  function kindsFor(p) {
    const k = ['listen', 'speak', 'heard', 'truefalse', 'tilesHeard', 'tilesMean', 'match'];
    if (wordsOf(p).length >= 3) k.push('fill');
    if (REPLY[p.id]) k.push('reply', 'replysay');
    if (wordsOf(p).length < 2) return k.filter(function (x) { return x !== 'tilesHeard' && x !== 'tilesMean'; });
    return k;
  }
  // Never the same type twice in a row, never the way this sentence was last asked,
  // and never a way it was already answered wrongly until every type has been tried.
  function pickKind(p, prev) {
    const it = item(p.id);
    const all = kindsFor(p);
    let open = all.filter(function (k) { return (it.failedKinds || []).indexOf(k) === -1; });
    if (!open.length) { it.failedKinds = []; open = all; }
    let pool = open.filter(function (k) { return k !== prev && k !== it.lastKind; });
    if (!pool.length) pool = open.filter(function (k) { return k !== prev; });
    if (!pool.length) pool = open;
    // Speaking is the goal of the app, so it comes up more often.
    pool = pool.concat(pool.filter(function (k) { return SPOKEN.indexOf(k) !== -1; }));
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function otherPhrases(p, n) {
    const learned = ALL_IDS.filter(function (id) { return id !== p.id && S.items[id] && S.items[id].learnedOn; });
    const rest = ALL_IDS.filter(function (id) { return id !== p.id && learned.indexOf(id) === -1; });
    return shuffle(learned).concat(shuffle(rest)).slice(0, n).map(function (id) { return PHRASES[id]; });
  }
  function similarPhrases(p, n) {
    const len = p.ph.length;
    return shuffle(ALL_IDS.filter(function (id) { return id !== p.id; }).map(function (id) { return PHRASES[id]; })
      .sort(function (a, b) { return Math.abs(a.ph.length - len) - Math.abs(b.ph.length - len); })
      .slice(0, n * 4)).slice(0, n);
  }
  function revealPhrase(card, p) {
    card.appendChild(h('<p class="ph big reveal"></p>')).textContent = p.ph;
    card.appendChild(h('<p class="meaning"></p>')).textContent = M(p);
  }
  async function testQuestion(F, p, kind) {
    F.stage.innerHTML = '';
    let correct = false;
    const card = h('<article class="card"></article>');
    F.stage.appendChild(card);
    function ask(x) { card.appendChild(h('<p class="eyebrow"></p>')).textContent = x; }
    function spelled(list) { return shuffle(list.map(function (x) { return x.ph; })); }

    if (kind === 'listen') {
      ask(t('qListen'));
      card.appendChild(audioButtons(p.ar));
      speak(p.ar);
      const r = await choiceTask(card, meaningOptions(M(p), allMeanings(), 4), M(p));
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      card.appendChild(h('<p class="ph big reveal"></p>')).textContent = p.ph;
    } else if (kind === 'heard') {
      ask(t('qHeard'));
      card.appendChild(audioButtons(p.ar));
      speak(p.ar);
      const r = await choiceTask(card, spelled([p].concat(similarPhrases(p, 2))), p.ph, true);
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      card.appendChild(h('<p class="meaning"></p>')).textContent = M(p);
    } else if (kind === 'truefalse') {
      const truth = Math.random() < 0.5;
      const shown = truth ? M(p) : M(otherPhrases(p, 1)[0]);
      ask(t('qTrue'));
      card.appendChild(audioButtons(p.ar));
      card.appendChild(h('<p class="meaning big-mean"></p>')).textContent = shown;
      speak(p.ar);
      const r = await choiceTask(card, [t('yes'), t('no')], truth ? t('yes') : t('no'));
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      revealPhrase(card, p);
    } else if (kind === 'reply' || kind === 'replysay') {
      const q = REPLY[p.id];
      ask(kind === 'reply' ? t('qReply') : t('qReplySay'));
      const b = h('<div class="bubble them"><p class="who"></p></div>');
      b.querySelector('.who').textContent = M(q.who);
      b.appendChild(audioButtons(q.line.c));
      card.appendChild(b);
      speak(q.line.c);
      if (kind === 'reply') {
        const same = p.lesson.phrases.filter(function (x) { return x !== p; });
        const r = await choiceTask(card, spelled([p].concat(shuffle(same).slice(0, 2))), p.ph, true);
        if (!F.fl.alive) return false;
        correct = r.firstTry;
        card.appendChild(h('<p class="meaning"></p>')).textContent = M(q.line) + ' → ' + M(p);
      } else {
        card.appendChild(h('<p class="meaning big-mean"></p>')).textContent = t('sayPrompt', M(p));
        const r = await sayTask(card, p, { recall: true, tries: 2 });
        if (!F.fl.alive) return false;
        correct = r.correct;
      }
    } else if (kind === 'tilesHeard' || kind === 'tilesMean') {
      if (kind === 'tilesHeard') {
        ask(t('qTilesHeard'));
        card.appendChild(audioButtons(p.ar));
        speak(p.ar);
      } else {
        ask(t('qTilesMean'));
        card.appendChild(h('<p class="meaning big-mean"></p>')).textContent = M(p);
      }
      const r = await tilesTask(card, p);
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      if (kind === 'tilesHeard') card.appendChild(h('<p class="meaning"></p>')).textContent = M(p);
    } else if (kind === 'fill') {
      const words = wordsOf(p);
      const cand = words.map(function (w, i) { return i; }).filter(function (i) { return clean(words[i]).length >= 3; });
      const at = cand.length ? cand[Math.floor(Math.random() * cand.length)] : 0;
      const answer = clean(words[at]);
      const seen = {};
      seen[answer] = 1;
      const pool = [];
      shuffle(ALL_IDS).forEach(function (id) {
        wordsOf(PHRASES[id]).forEach(function (w) {
          const c = clean(w);
          if (c.length >= 3 && !seen[c]) { seen[c] = 1; pool.push(c); }
        });
      });
      ask(t('qFill'));
      const line = h('<p class="ph big"></p>');
      line.innerHTML = words.map(function (w, i) { return i === at ? '<span class="blank">?</span>' + esc(w.slice(answer.length)) : esc(w); }).join(' ');
      card.appendChild(line);
      card.appendChild(h('<p class="meaning"></p>')).textContent = M(p);
      const r = await choiceTask(card, shuffle([answer].concat(pool.slice(0, 2))), answer, true);
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      line.textContent = p.ph;
      speak(p.ar);
    } else if (kind === 'match') {
      ask(t('qMatch'));
      const r = await matchTask(card, [p].concat(otherPhrases(p, 3)));
      if (!F.fl.alive) return false;
      correct = r.firstTry;
    } else {
      ask(t('qSay'));
      card.appendChild(h('<p class="meaning big-mean"></p>')).textContent = M(p);
      const r = await sayTask(card, p, { recall: true, tries: 2 });
      if (!F.fl.alive) return false;
      correct = r.correct;
    }

    if (LISTENING.indexOf(kind) !== -1) { S.listen.t++; if (correct) S.listen.r++; }
    if (SPOKEN.indexOf(kind) !== -1) { S.speak.t++; if (correct) S.speak.r++; }
    // Read after the answer: a cloud sync may have replaced S while the question was open.
    const it = item(p.id);
    it.seen++;
    it.lastKind = kind;
    if (correct) { it.right++; it.failedKinds = []; S.points += 5; }
    else {
      it.errors++;
      it.failedKinds = (it.failedKinds || []).concat(kind);
    }
    save();
    if (SPOKEN.indexOf(kind) === -1) {
      const fb = h('<div class="card say-card"><p class="eyebrow"></p></div>');
      fb.querySelector('.eyebrow').textContent = correct ? t('fbRight') : t('fbWrong');
      card.classList.add(correct ? 'was-right' : 'was-wrong');
      F.stage.appendChild(fb);
      if (correct) {
        const next = h('<div class="say-actions"><button type="button" class="btn primary">' + t('next') + '</button><button type="button" class="btn ghost">' + t('sayAloud') + '</button></div>');
        fb.appendChild(next);
        await new Promise(function (res) {
          next.children[0].onclick = res;
          next.children[1].onclick = function () { next.remove(); sayTask(fb, p, { tries: 9 }).then(res); };
        });
      } else {
        await sayTask(fb, p, { tries: 9 });
      }
    }
    return correct;
  }
  async function runTest(ids, label) {
    const F = frame(label, null);
    const fl = F.fl;
    F.close.onclick = confirmLeave(F, t('leaveTest'));
    const order = shuffle(ids);
    const right = [], wrong = [];
    let prev = null;
    for (let i = 0; i < order.length; i++) {
      F.progress(i / order.length);
      F.title(label + ' · ' + (i + 1) + ' / ' + order.length);
      const p = PHRASES[order[i]];
      const kind = pickKind(p, prev);
      prev = kind;
      const ok = await testQuestion(F, p, kind);
      if (!fl.alive) return null;
      (ok ? right : wrong).push(p.id);
    }
    F.progress(1);
    return { F: F, right: right, wrong: wrong, score: right.length / order.length };
  }
  async function dailyTest() {
    const ids = testIds();
    const res = await runTest(ids, t('todayTest'));
    if (!res) return;
    S.tests.push({ date: today(), score: Math.round(res.score * 100), total: ids.length, kind: 'full' });
    res.right.forEach(function (id) { item(id).weak = false; });
    res.wrong.forEach(function (id) { item(id).weak = true; });
    finishTest(res, ids.length);
  }
  async function retest() {
    const ids = S.weak.slice();
    const res = await runTest(ids, t('retest'));
    if (!res) return;
    S.tests.push({ date: today(), score: Math.round(res.score * 100), total: ids.length, kind: 'retest' });
    res.right.forEach(function (id) { item(id).weak = false; });
    res.wrong.forEach(function (id) { item(id).weak = true; });
    finishTest(res, ids.length);
  }
  function finishTest(res, total) {
    const passed = res.score >= PASS;
    const need = Math.round(PASS * 100);
    if (passed) { S.testPassedOn = today(); S.weak = null; S.weakOn = null; S.points += 20; markDay(); }
    else { S.weak = res.wrong.slice(); S.weakOn = today(); }
    save();
    const F = res.F;
    F.stage.innerHTML = '';
    const card = h('<div class="card result ' + (passed ? 'good' : 'bad') + '"><p class="eyebrow">' + t('result') + '</p><p class="score"></p><p class="sub"></p><h2></h2><p class="txt"></p><button type="button" class="btn primary"></button></div>');
    card.querySelector('.score').textContent = Math.round(res.score * 100) + '%';
    card.querySelector('.sub').textContent = t('scoreSub', res.right.length, total, need);
    if (passed) {
      card.querySelector('h2').textContent = t('passed');
      card.querySelector('.txt').textContent = res.wrong.length ? t('passedSome') : t('passedAll');
      card.querySelector('button').textContent = t('toLesson');
      card.querySelector('button').onclick = home;
    } else {
      card.querySelector('h2').textContent = t('notYet', need);
      card.querySelector('.txt').textContent = t('relearnTxt', res.wrong.length);
      card.querySelector('button').textContent = t('relearnBtn');
      card.querySelector('button').onclick = reteach;
    }
    F.stage.appendChild(card);
  }
  async function reteach() {
    const F = frame(t('relearn'), null);
    const fl = F.fl;
    F.close.onclick = confirmLeave(F, t('leaveRelearn'));
    const ids = S.weak.slice();
    for (let i = 0; i < ids.length; i++) {
      F.progress(i / ids.length);
      const p = PHRASES[ids[i]];
      await phraseCard(F, p, t('fromLesson', M(p.lesson.title), i + 1, ids.length));
      if (!fl.alive) return;
    }
    F.progress(1);
    F.stage.innerHTML = '';
    const c = h('<div class="card result"><p class="eyebrow">' + t('reviewDone') + '</p><h2>' + t('readyRetest') + '</h2><p>' + t('retestTxt', Math.round(PASS * 100)) + '</p><button type="button" class="btn primary">' + t('startRetest') + '</button></div>');
    c.querySelector('button').onclick = retest;
    F.stage.appendChild(c);
  }

  /* ---------- Home ---------- */
  function nextLesson() {
    return D.LESSONS.find(function (L) { return S.lessonsDone.indexOf(L.id) === -1; }) || null;
  }
  function stats() {
    const learned = ALL_IDS.filter(function (id) { return S.items[id] && S.items[id].learnedOn; });
    const mastered = learned.filter(function (id) { const it = S.items[id]; return it.right > 0 && !it.weak; });
    const lastTest = S.tests.length ? S.tests[S.tests.length - 1] : null;
    const day = daysBetween(S.startDate, today()) + 1;
    return {
      learned: learned.length, mastered: mastered.length, total: ALL_IDS.length,
      lastTest: lastTest, listen: pct(S.listen.r, S.listen.t), speak: pct(S.speak.r, S.speak.t),
      day: day, left: Math.max(0, GOAL_DAYS - day + 1)
    };
  }
  function home() {
    newFlow();
    const d = today();
    if (S.weak && S.weakOn !== d) { S.weak = null; S.weakOn = null; save(); }
    const st = stats();
    const L = nextLesson();
    const pattern = soundPattern();
    const need = Math.round(PASS * 100);
    let cta = '';
    let ctaAction = null;
    if (S.weak && S.weak.length) {
      cta = '<p class="eyebrow">' + t('needed') + '</p><h2>' + t('finishRelearn') + '</h2><p>' + t('nReview', S.weak.length) + '</p><button type="button" class="btn primary big-btn">' + t('cont') + '</button>';
      ctaAction = reteach;
    } else if (needsTest()) {
      cta = '<p class="eyebrow">' + t('startHere') + '</p><h2>' + t('todayTest') + '</h2><p>' + t('testTxt', testIds().length, need) + '</p><button type="button" class="btn primary big-btn">' + t('startTest') + '</button>';
      ctaAction = dailyTest;
    } else if (S.lastLessonOn === d) {
      cta = '<p class="eyebrow">' + t('doneToday') + '</p><h2>' + t('wellDone') + '</h2><p>' + t('comeBack') + '</p>';
    } else if (L) {
      cta = '<p class="eyebrow">' + esc(t('todayLesson', M(L.unit))) + '</p><h2>' + esc(M(L.title)) + '</h2><p>' + esc(t('lessonInfo', M(L.sub), L.phrases.length)) + '</p><button type="button" class="btn primary big-btn">' + t('startLesson') + '</button>';
      ctaAction = function () { runLesson(L, false); };
    } else {
      cta = '<p class="eyebrow">' + t('allDone') + '</p><h2>' + t('wellDone') + '</h2><p>' + t('allDoneTxt') + '</p>';
    }

    const lt = st.lastTest ? st.lastTest.score + '%' : '—';
    const html =
      '<section class="home">' +
      '<header class="home-head"><div><p class="brand">Arabski w domu</p><p class="brand-sub">' + t('appSub') + '</p><button type="button" class="cloud" data-a="cloud" hidden></button></div><div class="head-actions"><button type="button" class="btn ghost small" data-a="lang">' + t('langBtn') + '</button><button type="button" class="icon-only" data-a="settings" aria-label="' + t('settings') + '">' + ICON.gear + '</button></div></header>' +
      '<div class="voice-warn" hidden></div>' +
      (pattern ? '<p class="sound-note">' + esc(t('soundNote', pattern.letters)) + '</p>' : '') +
      '<div class="card cta">' + cta + '</div>' +
      '<div class="reward"><span>' + t('streak', streak()) + '</span><span>' + t('points', S.points) + '</span></div>' +
      '<div class="stats">' +
      stat(st.mastered + ' <small>' + t('masteredOf', st.learned) + '</small>', t('statMastered')) +
      stat(lt, t('statTest')) +
      stat(st.listen === null ? '—' : st.listen + '%', t('statListen')) +
      stat(st.speak === null ? '—' : st.speak + '%', t('statSpeak')) +
      '</div>' +
      '<div class="goal"><div class="goal-row"><span>' + t('dayOf', Math.min(st.day, GOAL_DAYS), GOAL_DAYS) + '</span><span>' + (st.left ? t('daysLeft', st.left) : t('goalReached')) + '</span></div><div class="meter"><span style="width:' + Math.min(100, Math.round((st.day / GOAL_DAYS) * 100)) + '%"></span></div><p class="note">' + t('speedNote', Math.round(baseRate() * 100)) + '</p></div>' +
      '<button type="button" class="letters-entry" data-a="sounds"><span class="le-title">' + t('soundsEntry') + '</span><span class="le-sub">' + t('soundsEntrySub') + '</span></button>' +
      '<h3 class="list-h">' + t('lessons') + '</h3><ol class="lessons"></ol>' +
      '</section>';
    app.innerHTML = html;
    window.scrollTo(0, 0);
    const ctaBtn = app.querySelector('.cta .btn');
    if (ctaBtn && ctaAction) ctaBtn.onclick = ctaAction;
    app.querySelector('[data-a=settings]').onclick = settings;
    app.querySelector('[data-a=cloud]').onclick = settings;
    app.querySelector('[data-a=sounds]').onclick = soundsScreen;
    app.querySelector('[data-a=lang]').onclick = function () { setLang(S.lang === 'pl' ? 'en' : 'pl'); home(); };
    updateCloud();

    const list = app.querySelector('.lessons');
    // Shown only once the day's required test and lesson are finished.
    const mandatoryDone = !needsTest() && !(S.weak && S.weak.length) && (S.lastLessonOn === d || !L);
    if (pattern && mandatoryDone) {
      const li = h('<li class="lesson sound"><span class="num">!</span><div class="l-txt"><p class="l-title">' + t('ownSound') + '</p><p class="l-sub"></p></div></li>');
      li.querySelector('.l-sub').textContent = pattern.letters;
      const b = h('<button type="button" class="btn primary small">' + t('start') + '</button>');
      b.onclick = function () { groupScreen(pattern); };
      li.appendChild(b);
      list.appendChild(li);
    }
    D.LESSONS.forEach(function (Ls) {
      const done = S.lessonsDone.indexOf(Ls.id) !== -1;
      const isNext = L && L.id === Ls.id;
      const li = h('<li class="lesson ' + (done ? 'done' : isNext ? 'next' : 'locked') + '"><span class="num">' + Ls.no + '</span><div class="l-txt"><p class="l-title"></p><p class="l-sub"></p></div></li>');
      li.querySelector('.l-title').textContent = M(Ls.title);
      li.querySelector('.l-sub').textContent = done ? t('done') : isNext ? t('nextL') : M(Ls.unit);
      if (done) {
        const b = h('<button type="button" class="btn ghost small">' + t('practice') + '</button>');
        b.onclick = function () { runLesson(Ls, true); };
        li.appendChild(b);
      }
      list.appendChild(li);
    });
    D.LATER.forEach(function (x) {
      const li = h('<li class="lesson later"><span class="num">·</span><div class="l-txt"><p class="l-title"></p><p class="l-sub"></p></div></li>');
      li.querySelector('.l-title').textContent = M(x.title);
      li.querySelector('.l-sub').textContent = t('soon', M(x.sub));
      list.appendChild(li);
    });
    checkVoice();
  }
  function stat(v, label) {
    return '<div class="stat"><p class="v">' + v + '</p><p class="k">' + label + '</p></div>';
  }
  function checkVoice() {
    if (!('speechSynthesis' in window)) { showVoiceWarn(t('noTts')); return; }
    setTimeout(function () {
      loadVoices();
      if (!arVoices.length) showVoiceWarn(t('noVoiceWarn'));
    }, 1200);
  }
  function showVoiceWarn(msg) {
    const w = app.querySelector('.voice-warn');
    if (!w) return;
    w.textContent = msg;
    w.hidden = false;
  }

  /* ---------- Hard sounds section ---------- */
  function soundAccuracy(g) {
    const rec = S.sounds[g.family];
    if (!rec || rec.seen < 5) return null;
    return Math.round(((rec.seen - rec.miss) / rec.seen) * 100);
  }
  function soundsScreen() {
    const F = frame(t('soundsTitle'), home);
    F.stage.appendChild(h('<p class="note">' + t('soundsNote') + '</p>'));
    const list = h('<div class="groups"></div>');
    window.AR_SOUNDS.forEach(function (g) {
      const acc = soundAccuracy(g);
      const b = h('<button type="button" class="group-row"><span class="g-letters"></span><span class="g-title"></span></button>');
      b.querySelector('.g-letters').textContent = g.letters;
      b.querySelector('.g-title').textContent = M(g.title) + (acc === null ? '' : t('accuracy', acc));
      b.onclick = function () { groupScreen(g); };
      list.appendChild(b);
    });
    F.stage.appendChild(list);
  }
  function groupScreen(g) {
    const F = frame(M(g.title), soundsScreen);
    let v = '<article class="card sound-card"><p class="ph big">' + esc(g.letters) + '</p><p>' + esc(M(g.intro)) + '</p><p>' + esc(M(g.like)) + '</p><p class="grammar note"><b>' + t('keyPoint') + '</b> ' + esc(M(g.point)) + '</p></article>';
    v += '<div class="card"><h3>' + t('wordsPractice') + '</h3><ul class="word-list">' + g.words.map(function (w) {
      return '<li><button type="button" class="form" data-say="' + esc(w.ar) + '">' + esc(w.ph) + '</button><span class="w-mean">' + esc(M(w)) + '</span></li>';
    }).join('') + '</ul><button type="button" class="btn primary" data-a="practice">' + t('practiceVoice') + '</button></div>';
    F.stage.innerHTML = v;
    F.stage.querySelector('[data-a=practice]').onclick = function () { runWords(g); };
  }
  async function runWords(g) {
    const F = frame(M(g.title), null);
    const fl = F.fl;
    F.close.onclick = confirmLeave(F, t('leavePractice'));
    for (let i = 0; i < g.words.length; i++) {
      F.progress(i / g.words.length);
      const w = g.words[i];
      F.stage.innerHTML = '';
      const card = h('<article class="card phrase"><p class="eyebrow"></p><p class="ph big"></p><p class="meaning"></p></article>');
      card.querySelector('.eyebrow').textContent = t('wordN', i + 1, g.words.length);
      card.querySelector('.ph').textContent = w.ph;
      card.querySelector('.meaning').textContent = M(w);
      card.appendChild(audioButtons(w.ar));
      F.stage.appendChild(card);
      const box = h('<div class="card say-card"><p class="eyebrow">' + t('sayIt2') + '</p></div>');
      F.stage.appendChild(box);
      speak(w.ar);
      await sayTask(box, w, { tries: 9, noEcho: true });
      if (!fl.alive) return;
    }
    F.progress(1);
    const rec = soundRec(g.family);
    rec.open = 0;
    rec.run = 0;
    save();
    F.stage.innerHTML = '';
    const c = h('<div class="card result good"><p class="eyebrow">' + t('soundDone') + '</p><h2>' + t('wellDone') + '</h2><button type="button" class="btn primary">' + t('backHome') + '</button></div>');
    c.querySelector('button').onclick = home;
    F.stage.appendChild(c);
  }

  /* ---------- Husband's panel (Arabic, for following her progress) ---------- */
  function husbandScreen() {
    const F = frame('لوحة الزوج', settings);
    if (followId) F.close.hidden = true;
    const st = stats();
    const hard = ALL_IDS.filter(function (id) { return S.items[id] && S.items[id].errors > 0; })
      .sort(function (a, b) { return S.items[b].errors - S.items[a].errors; }).slice(0, 8);
    const tests = S.tests.slice(-7).reverse();
    let v = '<div class="husband" dir="rtl" lang="ar">';
    v += '<div class="stats">' +
      stat(S.lessonsDone.length + ' <small>من ' + D.LESSONS.length + '</small>', 'دروس مكتملة') +
      stat(st.mastered + ' <small>من ' + st.learned + '</small>', 'جمل أتقنتها') +
      stat(st.listen === null ? '—' : st.listen + '%', 'فهم الاستماع') +
      stat(st.speak === null ? '—' : st.speak + '%', 'دقة النطق') + '</div>';
    v += '<div class="card"><p>سلسلة الأيام: <b>' + streak() + '</b> · النقاط: <b>' + S.points + '</b></p><p class="note">بدأت يوم <bdi dir="ltr">' + esc(S.startDate) + '</bdi>' + (needsTest() ? ' · عليها اختبار اليوم' : '') + '</p></div>';
    v += '<div class="card"><h3>آخر الاختبارات</h3>' + (tests.length ? '<ul class="word-list">' + tests.map(function (x) {
      return '<li><bdi dir="ltr">' + esc(x.date) + '</bdi><span class="w-mean">' + x.score + '% · ' + x.total + ' جملة' + (x.kind === 'retest' ? ' · إعادة' : '') + '</span></li>';
    }).join('') + '</ul>' : '<p class="note">لم تقدّم اختباراً بعد.</p>') + '</div>';
    v += '<div class="card"><h3>أصعب الجمل عليها</h3>' + (hard.length ? '<ul class="word-list">' + hard.map(function (id) {
      return '<li><button type="button" class="form ar-line" data-say="' + esc(PHRASES[id].ar) + '">' + esc(PHRASES[id].ar) + '</button><span class="w-mean">' + S.items[id].errors + ' أخطاء</span></li>';
    }).join('') + '</ul><p class="note">تدرّب معها على هذه الجمل بصوتك.</p>' : '<p class="note">لا توجد أخطاء مسجلة بعد.</p>') + '</div>';
    const id = !followId && window.PLSync && PLSync.status().id;
    const link = id ? location.origin + location.pathname + '?f=' + id : '';
    if (id) v += '<div class="card"><h3>رابط المتابعة</h3><p class="note">أرسل هذا الرابط إلى جوالك واحفظه، فتفتح منه تقدمها في أي وقت بدون تسجيل دخول.</p><p class="follow-link" dir="ltr">' + esc(link) + '</p><button type="button" class="btn primary" data-a="copy">انسخ الرابط</button></div>';
    else if (!followId) v += '<p class="note">يظهر رابط المتابعة هنا عندما يتصل الجوال بالإنترنت.</p>';
    v += '</div>';
    F.stage.innerHTML = v;
    const cp = F.stage.querySelector('[data-a=copy]');
    if (cp) cp.onclick = function () {
      navigator.clipboard.writeText(link).then(function () { cp.textContent = 'تم النسخ'; }).catch(function () { cp.textContent = 'انسخ الرابط يدوياً'; });
    };
  }

  /* ---------- Settings ---------- */
  const SAMPLE = 'صباح الخير يا حبيبي.';
  function settings() {
    const F = frame(t('settings'), home);
    loadVoices();
    let v = '<div class="card" id="sync-card"></div>';
    v += '<div class="card"><h3>' + t('langH') + '</h3><div class="row"><button type="button" class="btn ' + (S.lang === 'pl' ? 'primary' : 'ghost') + '" data-lang="pl">Polski</button><button type="button" class="btn ' + (S.lang === 'en' ? 'primary' : 'ghost') + '" data-lang="en">English</button></div></div>';
    v += '<div class="card"><h3>' + t('keyH') + '</h3><p class="note">' + esc(t('keyTxt')) + '</p></div>';
    v += '<div class="card"><h3>' + t('voiceH') + '</h3>';
    if (arVoices.length) {
      v += '<label for="voice-select" class="lbl">' + t('pickVoice') + '</label><select id="voice-select">' + arVoices.map(function (x) {
        return '<option value="' + esc(x.voiceURI) + '"' + (pickVoice() === x ? ' selected' : '') + '>' + esc(x.name) + '</option>';
      }).join('') + '</select><button type="button" class="btn ghost" data-a="test-voice">' + t('testVoice') + '</button>';
    } else {
      v += '<p class="note">' + t('noVoice') + '</p>';
    }
    v += '<p class="note">' + t('voiceNote') + '</p><details><summary>' + t('installVoice') + '</summary><p>' + t('installVoiceTxt') + '</p></details></div>';
    v += '<div class="card"><h3>' + t('micH') + '</h3><p class="note">' + (SR ? t('micOk') : t('micNo')) + '</p></div>';
    v += '<div class="card"><h3>' + t('installH') + '</h3><button type="button" class="btn primary" data-a="install" hidden>' + t('installNow') + '</button><p>' + t('installTxt') + '</p></div>';
    const cloudOn = window.PLSync && PLSync.status().id;
    v += '<div class="card"><h3>' + t('progressH') + '</h3><p class="note">' + t('savedHere', cloudOn ? t('savedCloud') : '', esc(S.startDate)) + '</p><button type="button" class="btn ghost" data-a="husband">' + t('husbandBtn') + '</button><button type="button" class="btn danger" data-a="reset">' + t('reset') + '</button><div class="reset-confirm" hidden><p>' + t('resetQ') + '</p><div class="row"><button type="button" class="btn danger" data-a="reset-yes">' + t('resetYes') + '</button><button type="button" class="btn ghost" data-a="reset-no">' + t('cancel') + '</button></div></div></div>';

    F.stage.innerHTML = v;
    renderSync();
    F.stage.querySelectorAll('[data-lang]').forEach(function (b) {
      b.onclick = function () { setLang(b.dataset.lang); settings(); };
    });
    const sel = F.stage.querySelector('#voice-select');
    if (sel) sel.onchange = function () { S.voice = sel.value; save(); speak(SAMPLE); };
    const tv = F.stage.querySelector('[data-a=test-voice]');
    if (tv) tv.onclick = function () { speak(SAMPLE); };
    const inst = F.stage.querySelector('[data-a=install]');
    if (deferredInstall) {
      inst.hidden = false;
      inst.onclick = function () { deferredInstall.prompt(); deferredInstall = null; inst.hidden = true; };
    }
    F.stage.querySelector('[data-a=husband]').onclick = husbandScreen;
    const rc = F.stage.querySelector('.reset-confirm');
    F.stage.querySelector('[data-a=reset]').onclick = function () { rc.hidden = false; };
    F.stage.querySelector('[data-a=reset-no]').onclick = function () { rc.hidden = true; };
    F.stage.querySelector('[data-a=reset-yes]').onclick = function () {
      const voice = S.voice, lang = S.lang;
      S = fresh();
      S.voice = voice;
      S.lang = lang;
      S.resetAt = Date.now(); // tells the other devices to start from zero too
      save();
      home();
    };
  }

  /* ---------- Cloud backup (Supabase) ---------- */
  const CLOUD_KEY = { synced: 'cSynced', syncing: 'cSyncing', offline: 'cOffline', error: 'cError' };
  function cloudText(state) { return CLOUD_KEY[state] ? t(CLOUD_KEY[state]) : ''; }
  function updateCloud() {
    const b = app.querySelector('[data-a=cloud]');
    if (!b) return;
    const st = window.PLSync && PLSync.enabled ? PLSync.status() : null;
    if (!st || !CLOUD_KEY[st.state]) { b.hidden = true; return; }
    b.hidden = false;
    b.className = 'cloud is-' + st.state;
    b.textContent = cloudText(st.state);
  }
  function renderSync() {
    const card = document.getElementById('sync-card');
    if (!card) return;
    const st = window.PLSync && PLSync.enabled ? PLSync.status() : null;
    card.innerHTML = '<h3>' + t('cloudH') + '</h3><p class="note">' + (st && st.id ? t('cloudAuto') : t('cloudLocal')) + '</p>' +
      (st && CLOUD_KEY[st.state] ? '<p class="cloud-line is-' + st.state + '">' + esc(cloudText(st.state)) + '</p>' : '');
  }
  if (window.PLSync && !followId) {
    PLSync.init({
      getState: function () { return S; },
      setState: function (merged) {
        const before = JSON.stringify(S);
        S = merged;
        store();
        if (JSON.stringify(S) !== before && app.querySelector('.home')) home();
      },
      onStatus: function () { updateCloud(); renderSync(); }
    });
  }

  /* ---------- Install and offline ---------- */
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* offline cache unavailable */ }); });
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopAudio(); });

  function followView() {
    document.documentElement.lang = 'ar';
    app.innerHTML = '<p class="note" dir="rtl">جارٍ تحميل تقدمها…</p>';
    PLSync.viewer(followId).then(function (data) {
      if (!data) { app.innerHTML = '<p class="note" dir="rtl">لم يُحفظ أي تقدم بعد على هذا الرابط.</p>'; return; }
      S = Object.assign(fresh(), data);
      husbandScreen();
    }).catch(function () {
      app.innerHTML = '<p class="note" dir="rtl">تعذّر تحميل التقدم. تأكد من الاتصال بالإنترنت وأعد فتح الرابط.</p>';
    });
  }
  if (followId && window.PLSync && PLSync.enabled) followView();
  else home();
})();
