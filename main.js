/* Fill name / price / links from config.js */
(function () {
  if (typeof SITE === 'undefined') return;
  function each(sel, fn) { document.querySelectorAll(sel).forEach(fn); }
  each('[data-site="name"]', function (el) { el.textContent = SITE.name; });
  each('[data-site="price"]', function (el) { el.textContent = SITE.price; });
  each('a[data-site="buyUrl"]', function (el) { el.href = SITE.buyUrl; });
  each('a[data-site="liteUrl"]', function (el) { el.href = SITE.liteUrl; });
  document.title = SITE.name + ': a better face for that little USB screen';
  var m = document.querySelector('meta[name="description"]'); if (m) m.content = SITE.tagline;
  var og = document.querySelector('meta[property="og:title"]'); if (og) og.content = SITE.name;
  var ogd = document.querySelector('meta[property="og:description"]'); if (ogd) ogd.content = SITE.tagline;
})();

/* Theme tiles swap the hero panel */
(function () {
  var img = document.getElementById('theme-frame'), cap = document.getElementById('theme-name');
  var tiles = document.querySelectorAll('.tile');
  if (!img) return;
  tiles.forEach(function (t) {
    t.addEventListener('click', function () {
      var k = t.dataset.theme, n = t.querySelector('span').textContent;
      img.classList.add('swap');
      setTimeout(function () {
        img.src = 'assets/theme_' + k + '_landscape_3x.webp';
        img.alt = 'The ' + n + ' theme on a 3.5-inch screen';
        cap.textContent = n; img.classList.remove('swap');
      }, 180);
      tiles.forEach(function (x) { x.classList.toggle('is-on', x === t); });
      if (window.innerWidth < 800) document.getElementById('buy').scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* Contact form: posts to SITE.contactEndpoint (Web3Forms / Formspree style) */
(function () {
  var form = document.getElementById('contact-form');
  if (!form || typeof SITE === 'undefined') return;
  var status = document.getElementById('cf-status');
  var key = document.getElementById('cf-key');
  var button = form.querySelector('button[type="submit"]');
  var endpoint = (SITE.contactEndpoint || '').trim();
  var accessKey = (SITE.contactKey || '').trim();
  if (accessKey) key.value = accessKey; else key.remove();

  function say(msg, kind) { status.textContent = msg; status.className = 'status ' + (kind || ''); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    say('');
    // Honeypot: bots fill every field. Pretend it worked and send nothing.
    if (form.elements.botcheck && form.elements.botcheck.value) { form.reset(); say('Thanks, sent.', 'ok'); return; }
    if (!form.checkValidity()) { say('Please fill in name, a valid email and a message.', 'err'); return; }
    var notSetUp = !endpoint || /REPLACE|YOUR_/i.test(endpoint) || (/web3forms/i.test(endpoint) && (!accessKey || /REPLACE|YOUR_/i.test(accessKey)));
    if (notSetUp) { say("The form isn't connected yet. Please try again later.", 'err'); return; }

    var data = new FormData(form);
    data.delete('botcheck');
    button.disabled = true; say('Sending…');
    fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.success !== false) { form.reset(); say("Thanks, sent. I'll reply by email.", 'ok'); }
        else { say((res.j && res.j.message) ? 'Not sent: ' + res.j.message : 'Not sent. Please try again.', 'err'); }
      })
      .catch(function () { say('Not sent. Check your connection and try again.', 'err'); })
      .then(function () { button.disabled = false; });
  });
})();
