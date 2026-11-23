/* Afsoon Games site script, loaded on every page.
   - Google tag (Google Analytics) with Consent Mode: nothing is stored until the visitor accepts.
   - Small cookie message (required in Europe). The choice is remembered on the device.
   - Game pages: a volume slider next to the sound button, and the game name / AFSOON GAMES
     in the top bar goes back to the home page.
   - Casino games (Roulette, Blackjack, Poker): relaxing lounge music with an on/off button. */

/* ---------- Volume ----------
   Every game makes its sounds with Web Audio. We slip one master volume knob between each game's
   sounds and the speakers, so one slider works in every game without changing the games. */
(function () {
  var KEY = 'afsoon-volume', vol = 1, masters = [];
  try { var v = parseFloat(localStorage.getItem(KEY)); if (v >= 0 && v <= 1) vol = v; } catch (e) {}
  var gainFor = function (v) { return v * v; };          // feels even to the ear
  var Orig = window.AudioContext || window.webkitAudioContext;
  if (Orig && !Orig.__afs) {
    var Wrapped = function (opts) {
      var ctx = opts === undefined ? new Orig() : new Orig(opts);
      try {
        var out = ctx.destination, g = ctx.createGain();
        g.gain.value = gainFor(vol); g.connect(out);
        Object.defineProperty(ctx, 'destination', { value: g, configurable: true });
        masters.push(g);
      } catch (e) {}
      return ctx;
    };
    Wrapped.prototype = Orig.prototype; Wrapped.__afs = true;
    window.AudioContext = Wrapped;
    if (window.webkitAudioContext) window.webkitAudioContext = Wrapped;
  }
  // dealer voice in Roulette uses the speech engine
  try {
    var ss = window.speechSynthesis, speak = ss && ss.speak.bind(ss);
    if (speak) ss.speak = function (u) { try { u.volume = Math.max(0, Math.min(1, (u.volume == null ? 1 : u.volume) * vol)); } catch (e) {} return speak(u); };
  } catch (e) {}

  function setVol(v) {
    vol = v;
    masters.forEach(function (g) { try { g.gain.setTargetAtTime(gainFor(v), g.context.currentTime, 0.03); } catch (e) { g.gain.value = gainFor(v); } });
    try { localStorage.setItem(KEY, String(v)); } catch (e) {}
  }
  window.afsoonVolume = { get: function () { return vol; }, set: setVol };

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    // tap the game name / AFSOON GAMES in a game's top bar to go home
    var brand = document.querySelector('header .brand') || document.querySelector('header h1');
    if (brand && location.pathname !== '/' && !brand.closest('a')) {
      brand.style.cursor = 'pointer';
      brand.setAttribute('role', 'link'); brand.tabIndex = 0;
      brand.title = 'Afsoon Games home';
      brand.addEventListener('click', function () { location.href = '/'; });
      brand.addEventListener('keydown', function (e) { if (e.key === 'Enter') location.href = '/'; });
    }

    var btn = document.querySelector('#snd, #mute');
    if (!btn) return;
    function isMuted() {
      var w = btn.querySelector('#wave');
      if (w && w.style.display === 'none') return true;
      return /sound off|turn sound on/i.test(btn.getAttribute('aria-label') || '');
    }
    var pass = false;
    function toggleGameSound() { pass = true; try { btn.click(); } finally { pass = false; } }

    var pop = document.createElement('div');
    pop.id = 'afs-vol'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Volume');
    pop.innerHTML =
      '<style>#afs-vol{position:fixed;z-index:2147482000;display:flex;align-items:center;gap:10px;padding:10px 14px 10px 10px;' +
      'background:#181628;color:#ece8f6;border:1px solid rgba(230,184,92,.5);border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.55);' +
      'font:800 13px/1 Nunito,system-ui,-apple-system,"Segoe UI",sans-serif}#afs-vol[hidden]{display:none}' +
      '#afs-vol .m{width:38px;height:38px;flex:none;border-radius:10px;border:1px solid rgba(230,184,92,.45);background:transparent;color:#f6d999;display:grid;place-items:center;cursor:pointer;padding:0}' +
      '#afs-vol .m svg{width:20px;height:20px}#afs-vol .m.off{color:#9a94b3}' +
      '#afs-vol input{width:150px;accent-color:#e6b85c;cursor:pointer;height:28px;margin:0}' +
      '#afs-vol b{width:38px;text-align:right;color:#f6d999;font-variant-numeric:tabular-nums}</style>' +
      '<button type="button" class="m" aria-label="Sound on or off"></button>' +
      '<input type="range" min="0" max="100" step="1" aria-label="Volume"><b></b>';
    document.body.appendChild(pop);
    var mBtn = pop.querySelector('.m'), range = pop.querySelector('input'), pct = pop.querySelector('b');
    var ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
    var OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="m16 10 5 5M21 10l-5 5"/></svg>';
    function paint() {
      var m = isMuted();
      mBtn.innerHTML = m ? OFF : ON; mBtn.classList.toggle('off', m);
      mBtn.title = m ? 'Sound is off: tap to turn on' : 'Sound is on: tap to mute';
      range.value = Math.round(vol * 100); pct.textContent = Math.round(vol * 100) + '%';
    }
    function place() {
      var r = btn.getBoundingClientRect(), w = pop.offsetWidth || 260;
      var left = Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8);
      pop.style.left = left + 'px'; pop.style.top = (r.bottom + 8) + 'px';
    }
    function open() { paint(); pop.hidden = false; place(); }
    function close() { pop.hidden = true; }

    // the sound button now opens the volume box; mute lives inside it
    document.addEventListener('click', function (e) {
      if (pass) return;
      if (e.target.closest && e.target.closest('#snd, #mute') === btn) {
        e.stopImmediatePropagation(); e.preventDefault();
        if (pop.hidden) open(); else close();
      } else if (!pop.hidden && !pop.contains(e.target)) close();
    }, true);
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.title = 'Sound and volume';
    mBtn.addEventListener('click', function () { toggleGameSound(); paint(); });
    range.addEventListener('input', function () {
      var v = range.value / 100; setVol(v); pct.textContent = range.value + '%';
      if (v > 0 && isMuted()) { toggleGameSound(); paint(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (!pop.hidden) place(); });
    window.addEventListener('scroll', function () { if (!pop.hidden) place(); }, true);
  });
})();

(function () {
  var TAG = 'GTM-WQHNLM5D';      // Google tag container
  var GA = 'G-JN6MGSM3G0';       // Google Analytics stream: Afsoon website
  var KEY = 'afsoon-consent';
  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: choice === 'yes' ? 'granted' : 'denied'
  });
  gtag('js', new Date());
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtm.js?id=' + TAG;
  document.head.appendChild(s);
  var a = document.createElement('script');
  a.async = true;
  a.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
  document.head.appendChild(a);
  gtag('config', GA);

  if (choice === 'yes' || choice === 'no') return;

  var fa = (document.documentElement.lang || '').indexOf('fa') === 0;
  var T = fa
    ? { msg: 'ما با کوکی‌ها تعداد بازیکنان را می‌شماریم تا بازی‌ها را بهتر کنیم.', yes: 'قبول', no: 'نه، ممنون' }
    : { msg: 'We use cookies to count players and improve our games.', yes: 'Accept', no: 'No thanks' };

  function show() {
    var bar = document.createElement('div');
    bar.id = 'afs-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookies');
    if (fa) bar.dir = 'rtl';
    bar.innerHTML =
      '<style>#afs-consent{position:fixed;z-index:2147483000;left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom,0px));' +
      'max-width:420px;margin:0 auto;background:#181628;color:#ece8f6;border:1px solid rgba(230,184,92,.45);border-radius:14px;' +
      'padding:12px 14px;box-shadow:0 8px 28px rgba(0,0,0,.5);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;' +
      'display:flex;flex-wrap:wrap;align-items:center;gap:10px}' +
      '#afs-consent p{margin:0;flex:1 1 200px}' +
      '#afs-consent button{font:700 14px system-ui,Tahoma,sans-serif;border-radius:18px;padding:7px 14px;cursor:pointer;border:1px solid rgba(230,184,92,.55)}' +
      '#afs-consent .y{background:#e6b85c;color:#241a08;border-color:#e6b85c}#afs-consent .n{background:transparent;color:#e6b85c}</style>' +
      '<p>' + T.msg + '</p><button type="button" class="n">' + T.no + '</button><button type="button" class="y">' + T.yes + '</button>';
    function done(v) {
      try { localStorage.setItem(KEY, v); } catch (e) {}
      if (v === 'yes') gtag('consent', 'update', { analytics_storage: 'granted' });
      bar.remove();
    }
    bar.querySelector('.y').onclick = function () { done('yes'); };
    bar.querySelector('.n').onclick = function () { done('no'); };
    document.body.appendChild(bar);
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();

/* ---------- Relaxing music for the casino games ----------
   Soft lounge jazz played live in the browser (no music files): electric-piano chords, a warm bass,
   brushes and a few vibraphone notes. It goes through the same volume slider as the game sounds.
   A music-note button in the top bar turns it on or off; the choice is remembered. */
(function () {
  var PAGES = ['/roulette/', '/blackjack/', '/poker/'];
  if (PAGES.indexOf(location.pathname.replace(/index\.html$/, '')) < 0) return;
  var KEY = 'afsoon-music', on = true;
  try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) {}
  var ctx = null, out = null, wet = null, NB = null, timer = null, nextT = 0, step = 0, started = false;
  var E = 60 / 74 / 2;                                   // one eighth note at 74 beats a minute
  var PROG = [                                           // [bass note, chord] as MIDI numbers
    [38, [53, 57, 60, 64]], [43, [53, 57, 59, 64]], [36, [52, 55, 59, 62]], [45, [55, 60, 64, 67]],
    [41, [52, 57, 60, 64]], [40, [50, 55, 59, 62]], [38, [53, 57, 60, 64]], [43, [53, 56, 59, 64]]
  ];
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function env(g, t, peak, a, d, sus, end) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * sus), t + a + d);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
  }
  function send(node, amount) { node.connect(out); var s = ctx.createGain(); s.gain.value = amount; node.connect(s); s.connect(wet); }
  function ep(t, m, v, dur) {                            // electric piano: soft FM bell
    var f = hz(m), c = ctx.createOscillator(), mo = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    c.frequency.value = f; mo.frequency.value = f; mg.gain.setValueAtTime(f * 0.9, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + 0.5);
    mo.connect(mg); mg.connect(c.frequency); c.connect(g); env(g, t, v, 0.012, 0.9, 0.35, t + dur + 0.6); send(g, 0.35);
    c.start(t); mo.start(t); c.stop(t + dur + 0.7); mo.stop(t + dur + 0.7);
  }
  function bass(t, m, dur) {
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = hz(m); o2.frequency.value = hz(m) * 2; g2.gain.value = 0.35;
    lp.type = 'lowpass'; lp.frequency.value = 700; o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g);
    env(g, t, 0.16, 0.02, 0.35, 0.5, t + dur); send(g, 0.08); o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function vibe(t, m) {
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(), trem = ctx.createOscillator(), tg = ctx.createGain(), amp = ctx.createGain();
    o.frequency.value = hz(m); o2.frequency.value = hz(m) * 4; g2.gain.value = 0.08; o.connect(g); o2.connect(g2); g2.connect(g);
    trem.frequency.value = 5.2; tg.gain.value = 0.3; trem.connect(tg); amp.gain.value = 0.7; tg.connect(amp.gain); g.connect(amp);
    env(g, t, 0.045, 0.004, 1.6, 0.2, t + 2.2); send(amp, 0.5);
    [o, o2, trem].forEach(function (x) { x.start(t); x.stop(t + 2.3); });
  }
  function noise(t, type, freq, q, peak, dur) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NB; f.type = type; f.frequency.value = freq; f.Q.value = q; s.connect(f); f.connect(g);
    env(g, t, peak, dur * 0.25, dur * 0.75, 0.3, t + dur); send(g, 0.15); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }
  function tick(t, i) {
    var bar = Math.floor(step / 8) % PROG.length, ch = PROG[bar];
    if (i === 0) ch[1].forEach(function (m, k) { ep(t + k * 0.014, m, 0.05, E * 7); });
    if (i === 5 && Math.random() < 0.5) ch[1].forEach(function (m, k) { ep(t + k * 0.01, m, 0.03, E * 1.5); });
    if (i === 0) bass(t, ch[0], E * 3.6);
    if (i === 4) bass(t, ch[0] + 7, E * 1.8);
    if (i === 6) bass(t, PROG[(bar + 1) % PROG.length][0] + (Math.random() < 0.5 ? -1 : 2), E * 1.6);
    if (i === 2 || i === 6) noise(t, 'bandpass', 3200, 0.6, 0.05, 0.22);
    noise(t, 'highpass', 7500, 0.7, i % 2 ? 0.012 : 0.02, 0.05);
    if (Math.random() < (i % 2 ? 0.14 : 0.24)) { var n = ch[1][Math.random() * 4 | 0] + 12; vibe(t, n); }
  }
  function schedule() {
    while (nextT < ctx.currentTime + 0.3) {
      var i = step % 8; tick(nextT + (i % 2 ? E * 0.3 : 0), i);   // a gentle swing on the off-beats
      nextT += E; step++;
    }
  }
  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    out = ctx.createGain(); out.gain.value = 0.0001; out.connect(ctx.destination);
    var len = ctx.sampleRate * 2.4, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = ir.getChannelData(c); for (var k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / len, 3); }
    var cv = ctx.createConvolver(); cv.buffer = ir; wet = ctx.createGain(); wet.gain.value = 1; wet.connect(cv); cv.connect(out);
    var n = ctx.sampleRate * 2; NB = ctx.createBuffer(1, n, ctx.sampleRate); var nd = NB.getChannelData(0); for (var j = 0; j < n; j++) nd[j] = Math.random() * 2 - 1;
  }
  function start() {
    try {
      if (!ctx) build();
      if (ctx.state === 'suspended') ctx.resume();
      started = true; nextT = Math.max(nextT, ctx.currentTime + 0.1);
      out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(0.85, ctx.currentTime, 0.6);
      if (!timer) timer = setInterval(schedule, 60);
    } catch (e) {}
  }
  function stop() {
    if (!ctx) return;
    out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
    clearInterval(timer); timer = null;
  }
  window.afsoonMusic = { get on() { return on; }, get playing() { return !!timer; }, get ctx() { return ctx; } };

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var snd = document.querySelector('#snd, #mute');
    var btn = document.createElement('button');
    btn.type = 'button'; btn.id = 'afs-music'; btn.className = snd ? snd.className : 'ib';
    var NOTE = '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>';
    function paint() {
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + NOTE +
        (on ? '' : '<path d="M3 3l18 18" stroke-width="2.2"/>') + '</svg>';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Music on' : 'Music off');
      btn.title = on ? 'Relaxing music is on: tap to turn off' : 'Relaxing music is off: tap to turn on';
      btn.style.opacity = on ? '' : '.6';
    }
    paint();
    if (snd && snd.parentNode) snd.parentNode.insertBefore(btn, snd);
    else { var h = document.querySelector('header'); if (h) h.appendChild(btn); }
    btn.addEventListener('click', function () {
      on = !on; try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
      paint(); if (on) start(); else stop();
    });
    // browsers only allow sound after a tap, so the music starts with the first tap or key
    function first() { if (on && !started) start(); }
    document.addEventListener('pointerdown', first, true);
    document.addEventListener('keydown', first, true);
    document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else if (on && timer) { ctx.resume(); nextT = Math.max(nextT, ctx.currentTime + 0.1); }
    });
  });
})();
