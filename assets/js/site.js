(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  // Header border once the page scrolls
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Highlight the nav link for the section in view
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]:not(.btn)'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) spy.observe(s);
    });

    // Fade sections in as they scroll into view
    var revealEls = document.querySelectorAll('.spotlight-copy, .section-head, .audience, .course, .outcomes, .workflow li, .callout, .option, .creds li, .reasons article, .contact-form');
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); reveal.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { el.classList.add('reveal'); reveal.observe(el); });
  }

  // Submit the form without leaving the page (falls back to a normal POST without JS)
  var form = document.querySelector('.contact-form');
  if (form) initContactForm(form);

  function initContactForm(form) {
  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');

  // "Reserve your spot" links: pre-select AI + Synchro and flag the enquiry as a reservation
  var reservation = form.querySelector('input[name="reservation"]');
  var subject = form.querySelector('input[name="_subject"]');
  var reserveNote = form.querySelector('.reserve-note');
  var synchroBox = form.querySelector('input[name="courses"][value="AI + Synchro"]');
  var defaultSubject = subject.value;
  function clearReservation() {
    reservation.value = '';
    subject.value = defaultSubject;
    reserveNote.hidden = true;
  }
  document.querySelectorAll('[data-reserve="synchro"]').forEach(function (link) {
    link.addEventListener('click', function () {
      synchroBox.checked = true;
      reservation.value = 'AI + Synchro (starts Jan 8, 2027)';
      subject.value = 'Reservation: AI + Synchro course';
      reserveNote.hidden = false;
      setTimeout(function () { document.getElementById('name').focus({ preventScroll: true }); }, 500);
    });
  });
  synchroBox.addEventListener('change', function () { if (!synchroBox.checked) clearReservation(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = 'Sending…';
    button.disabled = true;
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error();
        var reserved = !!reservation.value;
        form.reset();
        clearReservation();
        status.className = 'form-status ok';
        status.textContent = reserved
          ? "You're on the list for AI + Synchro (January 8, 2027)! We'll be in touch to confirm your seat."
          : "Thanks! We'll be in touch shortly.";
      })
      .catch(function () {
        status.className = 'form-status err';
        status.textContent = 'Something went wrong. Please try again, or call or text +1 (512) 686-8093.';
      })
      .finally(function () { button.disabled = false; });
  });
  }

  // Launch countdown ("63 days to go"); hidden once the date has passed
  document.querySelectorAll('[data-countdown]').forEach(function (el) {
    var parts = el.getAttribute('data-countdown').split('-');
    var launch = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var days = Math.round((launch - today) / 86400000);
    if (days > 1) el.textContent = days + ' days to go.';
    else if (days === 1) el.textContent = 'Starts tomorrow!';
    else if (days === 0) el.textContent = 'Starts today!';
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
