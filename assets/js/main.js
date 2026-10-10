/* Iraklis — site behaviour: mobile menu, scroll reveal, works gallery,
   series pages (built from data.js), photo viewer and contact form. */
(function () {
  'use strict';

  var CONTACT_EMAIL = 'narikaleli1@gmail.com';
  var doc = document;
  var root = doc.documentElement;
  var SERIES = window.IRAKLIS_SERIES || [];

  root.classList.add('js-reveal');

  function $(sel, scope) { return (scope || doc).querySelector(sel); }
  function $all(sel, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(sel)); }

  /* Small element builder — text always goes in as text, never as HTML. */
  function el(tag, attrs, children) {
    var node = doc.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value === null || value === undefined || value === false) return;
        if (key === 'text') node.textContent = value;
        else if (key === 'class') node.className = value;
        else node.setAttribute(key, value === true ? '' : String(value));
      });
    }
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) return;
      node.appendChild(typeof child === 'string' ? doc.createTextNode(child) : child);
    });
    return node;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function numLabel(index) { return 'Nº ' + pad(index + 1); }
  function metaLine(s) { return [s.place, s.years].filter(Boolean).join(' · '); }
  function photosLabel(n) { return n + (n === 1 ? ' photograph' : ' photographs'); }
  function imgSrc(s, im, small) { return 'assets/img/works/' + s.slug + '/' + im.f + (small ? '-sm' : '') + '.jpg'; }
  function altFor(s, i) { return s.title + ', ' + s.place + ' — photograph ' + (i + 1) + ' of ' + s.images.length; }

  function picture(s, im, opts) {
    opts = opts || {};
    var attrs = {
      src: imgSrc(s, im),
      alt: opts.alt || '',
      loading: opts.eager ? null : 'lazy',
      decoding: 'async',
      fetchpriority: opts.eager ? 'high' : null,
      class: opts.cls || null
    };
    if (im.w && im.h) { attrs.width = im.w; attrs.height = im.h; }
    if (im.w && im.sw && im.sw < im.w) {
      attrs.srcset = imgSrc(s, im, true) + ' ' + im.sw + 'w, ' + imgSrc(s, im) + ' ' + im.w + 'w';
      attrs.sizes = opts.sizes || '100vw';
    }
    return el('img', attrs);
  }

  function ratio(im) { return im && im.w && im.h ? 'aspect-ratio: ' + im.w + ' / ' + im.h : null; }

  /* ---------- Year in footer ---------- */
  $all('[data-year]').forEach(function (node) { node.textContent = String(new Date().getFullYear()); });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('.menu-btn');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menuBtn) return;
    doc.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    var label = $('.menu-btn__label', menuBtn);
    if (label) label.textContent = open ? 'Close' : 'Menu';
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && doc.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
    });
    var wide = window.matchMedia('(min-width: 821px)');
    var onWide = function (e) { if (e.matches) setMenu(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
  }

  /* ---------- Reveal on scroll ---------- */
  var observer = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }) : null;
  function reveal(scope) {
    $all('[data-reveal]:not(.is-in)', scope).forEach(function (node) {
      if (observer) observer.observe(node); else node.classList.add('is-in');
    });
  }

  /* ---------- Works gallery ---------- */
  var REGIONS = [
    ['all', 'All'],
    ['athos', 'Mount Athos'],
    ['russia', 'Russia'],
    ['georgia', 'Georgia'],
    ['ny', 'New York'],
    ['studio', 'Reliefs & icons']
  ];

  function workCard(s, index, order) {
    var cover = s.images && s.images[0];
    var media = el('div', { class: 'work__media', style: ratio(cover) }, [
      cover ? picture(s, cover, { alt: s.title + ', ' + s.place, sizes: '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw' }) : null
    ]);
    var caption = el('figcaption', { class: 'work__caption work__caption--grid' }, [
      el('span', { class: 'work__title', text: s.title }),
      el('span', { class: 'work__num', text: numLabel(index) }),
      el('span', { class: 'work__sub', text: [metaLine(s), photosLabel((s.images || []).length)].filter(Boolean).join(' · ') })
    ]);
    return el('a', {
      class: 'work card-in',
      href: 'series.html?s=' + encodeURIComponent(s.slug),
      style: 'animation-delay: ' + Math.min(order * 70, 560) + 'ms'
    }, [el('figure', null, [media, caption])]);
  }

  function renderWorks() {
    var grid = $('#works-grid');
    var bar = $('#filters');
    var count = $('#works-count');
    if (!grid || !bar) return;

    var current = (location.hash || '').slice(1);
    if (!REGIONS.some(function (r) { return r[0] === current; })) current = 'all';

    var buttons = REGIONS.filter(function (r) {
      return r[0] === 'all' || SERIES.some(function (s) { return s.region === r[0]; });
    }).map(function (r) {
      var n = r[0] === 'all' ? SERIES.length : SERIES.filter(function (s) { return s.region === r[0]; }).length;
      var button = el('button', { type: 'button', class: 'filter', 'data-region': r[0], 'aria-pressed': 'false' }, [
        r[1], el('span', { class: 'count', text: String(n) })
      ]);
      button.addEventListener('click', function () {
        current = r[0];
        history.replaceState(null, '', current === 'all' ? location.pathname + location.search : '#' + current);
        update();
      });
      bar.appendChild(button);
      return button;
    });

    function update() {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-region') === current)); });
      grid.textContent = '';
      var list = [];
      SERIES.forEach(function (s, i) { if (current === 'all' || s.region === current) list.push({ s: s, i: i }); });
      list.forEach(function (item, order) { grid.appendChild(workCard(item.s, item.i, order)); });
      if (count) count.textContent = list.length + ' of ' + SERIES.length + ' series';
    }
    update();
  }

  /* ---------- Series page ---------- */
  function renderSeries() {
    var slug = new URLSearchParams(location.search).get('s');
    var index = -1;
    SERIES.forEach(function (s, i) { if (s.slug === slug) index = i; });
    if (index < 0) { location.replace('works.html'); return; }

    var s = SERIES[index];
    var imgs = s.images || [];
    var line = metaLine(s);

    doc.title = s.title + (s.place && s.place !== 'Studio works' ? ', ' + s.place : '') + ' — Iraklis';
    var desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', (s.description || (s.title + ' — ' + line + '. A series of works by Iraklis, sculptor in marble and stone.')).slice(0, 300));

    $('#s-crumb').textContent = s.title;
    $('#s-num').textContent = numLabel(index) + (s.category ? ' · ' + s.category : '');
    $('#s-title').textContent = s.title;
    $('#s-place').textContent = line;

    var placard = $('#s-placard');
    [['Place', s.place], ['Year', s.years], ['Materials', s.materials], ['Photographs', String(imgs.length)]]
      .filter(function (row) { return row[1]; })
      .forEach(function (row) {
        placard.appendChild(el('dt', { text: row[0] }));
        placard.appendChild(el('dd', { text: row[1] }));
      });

    if (s.description) {
      var d = $('#s-description');
      d.textContent = s.description;
      d.hidden = false;
    }

    if (imgs[0]) {
      $('#s-hero').appendChild(el('button', { type: 'button', 'data-index': 0, 'aria-label': 'Open photograph 1 of ' + imgs.length }, [
        picture(s, imgs[0], { alt: altFor(s, 0), cls: 'unveil', eager: true, sizes: '(max-width: 900px) 100vw, 56vw' })
      ]));
    }

    if (imgs[1]) {
      var feature = $('#s-feature');
      feature.appendChild(el('figure', { 'data-reveal': true }, [
        el('button', { type: 'button', class: 'plate', 'data-index': 1, 'aria-label': 'Open photograph 2 of ' + imgs.length }, [
          picture(s, imgs[1], { alt: altFor(s, 1), sizes: '(max-width: 1100px) 100vw, 1070px' })
        ]),
        el('figcaption', { class: 'plate-caption' }, [
          el('span', { class: 'serif-italic', style: 'font-size: 20px', text: s.title + (s.place ? ' — ' + s.place : '') }),
          el('span', { class: 'caps muted', text: 'Plate 02' })
        ])
      ]));
      feature.hidden = false;
    }

    if (imgs.length > 2) {
      var plates = $('#s-plates');
      imgs.slice(2).forEach(function (im, k) {
        var i = k + 2;
        plates.appendChild(el('button', { type: 'button', class: 'plate', 'data-index': i, 'data-reveal': true, 'aria-label': 'Open photograph ' + (i + 1) + ' of ' + imgs.length }, [
          el('div', { class: 'zoomable', style: ratio(im) }, [
            picture(s, im, { alt: altFor(s, i), sizes: '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw' })
          ]),
          el('span', { class: 'caps', text: 'Plate ' + pad(i + 1) })
        ]));
      });
      $('#s-plates-wrap').hidden = false;
    }

    var pager = $('#s-pager');
    if (SERIES.length > 1) {
      var prevI = (index - 1 + SERIES.length) % SERIES.length;
      var nextI = (index + 1) % SERIES.length;
      pager.appendChild(pagerLink(SERIES[prevI], prevI, 'prev'));
      pager.appendChild(pagerLink(SERIES[nextI], nextI, 'next'));
    }

    initViewer(s, imgs);
  }

  function pagerLink(t, i, kind) {
    var cover = t.images && t.images[0];
    return el('a', { class: kind, href: 'series.html?s=' + encodeURIComponent(t.slug) }, [
      el('div', { class: 'thumb zoomable' }, [cover ? picture(t, cover, { alt: '', sizes: '150px' }) : null]),
      el('span', { class: 'label' }, [
        el('span', { class: 'caps muted', text: (kind === 'prev' ? 'Previous' : 'Next') + ' · ' + numLabel(i) }),
        el('span', { class: 'title' }, [t.title + ', ', el('em', { class: 'serif-italic', text: t.place })])
      ])
    ]);
  }

  /* ---------- Photo viewer ---------- */
  function initViewer(s, imgs) {
    var dialog = $('#lightbox');
    if (!dialog || !imgs.length) return;
    var img = $('#lb-img');
    var counter = $('#lb-count');
    var stage = $('#lb-stage');
    var current = 0;
    var lastFocus = null;
    var startX = null;
    var swiped = false;

    $('#lb-title').textContent = s.title + (s.place ? ' — ' + s.place : '');

    function show(i) {
      current = (i + imgs.length) % imgs.length;
      img.src = imgSrc(s, imgs[current]);
      img.alt = altFor(s, current);
      counter.textContent = 'Plate ' + pad(current + 1) + ' / ' + pad(imgs.length);
      var next = new Image();
      next.src = imgSrc(s, imgs[(current + 1) % imgs.length]);
    }
    function open(i) {
      lastFocus = doc.activeElement;
      show(i);
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      doc.body.classList.add('no-scroll');
    }
    function close() {
      if (typeof dialog.close === 'function') dialog.close();
      else { dialog.removeAttribute('open'); onClose(); }
    }
    function onClose() {
      doc.body.classList.remove('no-scroll');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    dialog.addEventListener('close', onClose);

    doc.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-index]');
      if (trigger && !dialog.hasAttribute('open')) open(parseInt(trigger.getAttribute('data-index'), 10) || 0);
    });
    dialog.addEventListener('click', function (e) {
      if (swiped) { swiped = false; return; }
      var action = e.target.closest('[data-lb]');
      if (action) {
        var a = action.getAttribute('data-lb');
        if (a === 'close') close();
        else if (a === 'prev') show(current - 1);
        else if (a === 'next') show(current + 1);
        return;
      }
      if (e.target === dialog || e.target === stage) close();
    });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });
    stage.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) { swiped = true; show(current + (dx < 0 ? 1 : -1)); setTimeout(function () { swiped = false; }, 350); }
    });
  }

  /* ---------- Contact form: opens the visitor's email app ---------- */
  function initContact() {
    var form = $('#contact-form');
    if (!form) return;
    var status = $('#form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      var subject = 'Commission enquiry — ' + data.get('type');
      var body = 'Name: ' + data.get('name') + '\nEmail: ' + data.get('email') + '\nProject: ' + data.get('type') + '\n\n' + data.get('message');
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.textContent = '';
      status.appendChild(doc.createTextNode('Your email app should now open with the message ready to send. If it does not, write directly to '));
      status.appendChild(el('a', { href: 'mailto:' + CONTACT_EMAIL, text: CONTACT_EMAIL }));
      status.appendChild(doc.createTextNode('.'));
      status.hidden = false;
    });
  }

  /* ---------- Boot ---------- */
  var page = doc.body.getAttribute('data-page');
  if (page === 'works') renderWorks();
  if (page === 'series') renderSeries();
  if (page === 'contact') initContact();
  reveal();
})();
