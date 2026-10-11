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

/* Theme switcher under the big frame */
(function () {
  var T = {
    signature: { name: 'Signature', l: 'theme_signature_landscape_3x', p: 'theme_signature_portrait_3x' },
    nature: { name: 'Nature Flow', l: 'theme_nature_landscape_3x', p: 'theme_nature_portrait_3x' },
    noir: { name: 'Noir Editorial', l: 'theme_noir_landscape_3x', p: 'theme_noir_portrait_3x' },
    gallery: { name: 'Gallery', l: 'theme_gallery_landscape_3x', p: 'theme_gallery_portrait_3x' },
    chronograph: { name: 'Chronograph', l: 'theme_chronograph_landscape_3x', p: 'theme_chronograph_portrait_3x' },
    classic: { name: 'Classic', l: 'theme_classic_landscape_3x', p: null }
  };
  var img = document.getElementById('theme-frame');
  var orientLink = document.getElementById('orient-link');
  var links = document.querySelectorAll('.theme-link');
  if (!img) return;
  var state = { theme: 'signature', portrait: false };

  Object.keys(T).forEach(function (k) {
    [T[k].l, T[k].p].forEach(function (f) { if (f) { var i = new Image(); i.src = 'assets/' + f + '.webp'; } });
  });

  function render() {
    var t = T[state.theme] || T.signature;
    var portrait = state.portrait && !!t.p;
    img.src = 'assets/' + (portrait ? t.p : t.l) + '.webp';
    img.width = portrait ? 960 : 1440;
    img.height = portrait ? 1440 : 960;
    img.alt = 'The ' + t.name + ' theme, ' + (portrait ? 'portrait 320×480' : 'landscape 480×320');
    img.classList.toggle('portrait', portrait);
    img.parentElement.classList.toggle('is-portrait', portrait);
    links.forEach(function (a) { a.classList.toggle('is-on', a.dataset.theme === state.theme); });
    orientLink.textContent = portrait ? 'landscape' : 'portrait';
    orientLink.style.display = t.p ? '' : 'none';
  }
  links.forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); state.theme = a.dataset.theme; render(); });
  });
  orientLink.addEventListener('click', function (e) { e.preventDefault(); state.portrait = !state.portrait; render(); });
  render();
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
