/* Afsoon Games site script, loaded on every page.
   - Google tag (Google Analytics) with Consent Mode: nothing is stored until the visitor accepts.
   - Small cookie message (required in Europe). The choice is remembered on the device. */
(function () {
  var TAG = 'GTM-WQHNLM5D';
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
