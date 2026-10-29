(function () {
  // Paste your Google Apps Script web app URL here (ends in /exec). See certificates-setup/README.md.
  var LOOKUP_URL = 'https://script.google.com/macros/s/AKfycbwM3AqY5RnR5AwB5XVo7zIMzjhKYl3NHRK52ZUNUgsy-7METFuHJYCfrcB2rYGjz392/exec';

  var form = document.getElementById('cert-form');
  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');
  var results = document.getElementById('results');
  var demo = /[?&]demo=1\b/.test(location.search);

  var DEMO_DATA = {
    ok: true,
    name: 'Sample Participant',
    email: 'sample@example.com',
    records: [
      { id: 'BPR-27-A1B2C3', course: 'AI + Synchro: Intersection Analysis', date: 'January 10, 2027', hours: 8, download: '#', materials: '#' },
      { id: 'BPR-27-D4E5F6', course: 'AI + HCS: Capacity Analysis', date: 'March 6, 2027', hours: 6, download: '#', materials: '#' },
      { id: 'BPR-27-G7H8J9', course: 'AI + VISSIM: Microsimulation', date: '', hours: 0, download: '', materials: '#' }
    ]
  };

  function setStatus(text, kind) {
    status.className = 'form-status' + (kind ? ' ' + kind : '');
    status.textContent = text;
  }

  function fmtHours(n) { return (Math.round(n * 10) / 10).toFixed(1); }

  function safeUrl(u) {
    if (demo && u === '#') return '#';
    return /^https:\/\//i.test(u || '') ? u : '';
  }

  function linkButton(text, url, cls) {
    var a = cell('a', text, cls);
    a.href = url;
    if (url !== '#') { a.target = '_blank'; a.rel = 'noopener'; }
    else a.addEventListener('click', function (e) { e.preventDefault(); });
    return a;
  }

  // A course counts as completed once it has PDH hours or a certificate
  function isComplete(r) { return (Number(r.hours) || 0) > 0 || !!safeUrl(r.download); }

  function cell(tag, text, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function render(data) {
    var total = data.records.reduce(function (sum, r) { return sum + (Number(r.hours) || 0); }, 0);

    document.getElementById('results-name').textContent = data.name || 'Your records';
    document.getElementById('results-email').textContent = data.email || '';
    document.getElementById('stat-hours').textContent = fmtHours(total);
    document.getElementById('stat-courses').textContent = data.records.filter(isComplete).length;
    document.getElementById('records-total').textContent = fmtHours(total);

    var body = document.getElementById('records-body');
    var psBody = document.getElementById('ps-body');
    body.textContent = '';
    psBody.textContent = '';

    data.records.forEach(function (r) {
      var done = isComplete(r);
      var tr = document.createElement('tr');
      tr.appendChild(cell('td', r.course)).setAttribute('data-label', 'Course');
      tr.appendChild(cell('td', r.id, 'mono')).setAttribute('data-label', 'Certificate ID');
      tr.appendChild(cell('td', done ? r.date : 'In progress', done ? '' : 'pending')).setAttribute('data-label', 'Completed');
      tr.appendChild(cell('td', done ? fmtHours(r.hours) : '—', 'num')).setAttribute('data-label', 'PDH');

      var action = cell('td', undefined, 'action');
      var buttons = cell('div', undefined, 'action-buttons');
      var materials = safeUrl(r.materials);
      if (materials) buttons.appendChild(linkButton('Course materials', materials, 'btn btn-sm btn-ghost'));
      var cert = safeUrl(r.download);
      if (cert) buttons.appendChild(linkButton('Download certificate', cert, 'btn btn-sm'));
      else buttons.appendChild(cell('span', done ? 'Certificate: contact us for a copy' : 'Certificate after completion', 'muted'));
      action.appendChild(buttons);
      tr.appendChild(action);
      body.appendChild(tr);

      if (!done) return;
      var pr = document.createElement('tr');
      pr.appendChild(cell('td', r.course));
      pr.appendChild(cell('td', r.id));
      pr.appendChild(cell('td', r.date));
      pr.appendChild(cell('td', fmtHours(r.hours), 'num'));
      psBody.appendChild(pr);
    });

    document.getElementById('ps-name').textContent = data.name || '';
    document.getElementById('ps-email').textContent = data.email || '';
    document.getElementById('ps-date').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('ps-total').textContent = fmtHours(total);

    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.elements.email.value.trim();
    var id = form.elements.certid.value.trim();
    if (!email || !id) { setStatus('Please enter both your email and a certificate ID.', 'err'); return; }

    if (demo) { setStatus('Showing sample records (demo mode).', 'ok'); render(DEMO_DATA); return; }

    if (!LOOKUP_URL) {
      setStatus('Online lookup is being set up. Please contact us and we will send your records.', 'err');
      return;
    }

    setStatus('Looking up your records…');
    button.disabled = true;
    var url = LOOKUP_URL + '?email=' + encodeURIComponent(email) + '&id=' + encodeURIComponent(id);
    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.ok && data.records && data.records.length) {
          setStatus('');
          render(data);
        } else if (data && data.error === 'not_found') {
          setStatus("We couldn't find a match. Check that the email and certificate ID are exactly as on your certificate.", 'err');
        } else {
          setStatus('Something went wrong on our end. Please try again later or contact us.', 'err');
        }
      })
      .catch(function () {
        setStatus('Could not reach the records service. Please check your connection and try again.', 'err');
      })
      .finally(function () { button.disabled = false; });
  });

  document.getElementById('print-summary').addEventListener('click', function () { window.print(); });
  document.getElementById('lookup-again').addEventListener('click', function () {
    results.hidden = true;
    form.reset();
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    form.elements.email.focus({ preventScroll: true });
  });
})();
