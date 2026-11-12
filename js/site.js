/* Afsoon Games site script, loaded on every page.
   Analytics: paste your Google Analytics ID (looks like G-XXXXXXXXXX) between the quotes.
   While it is empty, nothing is loaded and no cookies are set. */
(function () {
  var GA_ID = '';
  if (!GA_ID) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID);
})();
