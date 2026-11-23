/* Afsoon Games site script, loaded on every page.
   - Google tag (Google Analytics) with Consent Mode: nothing is stored until the visitor accepts.
   - Small cookie message (required in Europe). The choice is remembered on the device.
   - Game pages: a volume slider next to the sound button, and the game name / AFSOON GAMES
     in the top bar goes back to the home page. */

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
