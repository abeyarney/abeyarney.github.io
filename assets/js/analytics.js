(function () {
  // Paste your IDs here. Leave blank to turn a tool off.
  var GA_ID = 'G-4EDNPS900L';        // Google Analytics 4 measurement ID, e.g. 'G-ABC123XYZ9'
  var CLARITY_ID = 'z53l47wb18';   // Microsoft Clarity project ID, e.g. 'k3j9x2ab1c'

  // Don't count visits while previewing locally
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

  /* Google Analytics 4: traffic sources, location, engagement time, pages */
  if (GA_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  /* Microsoft Clarity: session recordings, heatmaps, time per visit */
  if (CLARITY_ID) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  /* Key actions, reported to Google Analytics as events */
  function track(name, params) {
    if (window.gtag) window.gtag('event', name, params || {});
    if (window.clarity) window.clarity('event', name);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    if (a.matches('[data-reserve]')) track('reserve_click', { course: 'AI + Synchro' });
    else if (a.href.indexOf('wa.me/') >= 0) track('whatsapp_click');
    else if (a.href.indexOf('tel:') === 0) track('phone_click');
    else if (a.closest('.records') && /course materials/i.test(a.textContent)) track('materials_open');
    else if (a.closest('.records') && /certificate/i.test(a.textContent)) track('certificate_download');
  });

  document.addEventListener('submit', function (e) {
    if (e.target.matches('.contact-form')) {
      var reserved = e.target.querySelector('input[name="reservation"]');
      track(reserved && reserved.value ? 'reservation_submit' : 'generate_lead');
    } else if (e.target.matches('#cert-form')) {
      track('certificate_lookup');
    }
  }, true);
})();
