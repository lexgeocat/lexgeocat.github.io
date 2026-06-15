(function () {
  'use strict';

  var CFG = window.LGC_CONFIG || {};

  /* PRELOADER */
  function hideLoader() {
    var l = document.getElementById('ld');
    if (l && !l.classList.contains('hide')) l.classList.add('hide');
  }
  function showLoader() {
    var l = document.getElementById('ld');
    if (l) l.classList.remove('hide');
  }
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { hideLoader(); });
  });
  setTimeout(hideLoader, 1200);
  window.__lgcLoader = { show: showLoader, hide: hideLoader };

  /* HERO PARALLAX */
  document.addEventListener('DOMContentLoaded', function () {
    var bgMap = document.querySelector('.hero-bg-map');
    if (!bgMap) return;
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth) - 0.5;
      var y = (e.clientY / window.innerHeight) - 0.5;
      bgMap.style.transform = 'translate(' + (x * 30) + 'px, ' + (y * 30) + 'px)';
    });
  });

  /* THEME */
  var THEME_KEY = 'lgc-theme';
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  }
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
    else applyTheme('light');
  } catch (e) { }
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('th-btn');
    if (btn) btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { }
    });
  });

  /* HEADER SCROLL */
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    var hdr = document.getElementById('hdr');
    var top = document.getElementById('top');
    if (hdr) { if (y > 30) hdr.classList.add('scrolled'); else hdr.classList.remove('scrolled'); }
    if (top) { if (y > 600) top.classList.add('show'); else top.classList.remove('show'); }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('DOMContentLoaded', function () {
    var t = document.getElementById('top');
    if (t) t.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });

  /* MOBILE MENU */
  document.addEventListener('DOMContentLoaded', function () {
    var ham = document.getElementById('ham');
    var menu = document.getElementById('mob-menu');
    var close = document.getElementById('mob-close');
    if (!ham || !menu) return;

    function openMenu() { menu.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeMenu() { menu.classList.remove('open'); document.body.style.overflow = ''; }

    ham.addEventListener('click', openMenu);
    if (close) close.addEventListener('click', closeMenu);
    menu.addEventListener('click', function (e) { if (e.target === menu) closeMenu(); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

    var mobInput = document.getElementById('mob-srch-input');
    var mobBtn = document.getElementById('mob-srch-btn');
    if (mobInput && mobBtn) {
      function doMobSearch() {
        var q = mobInput.value.trim();
        if (!q) return;
        window.open(CFG.bloggerSearch + encodeURIComponent(q), '_blank', 'noopener');
        closeMenu();
      }
      mobBtn.addEventListener('click', doMobSearch);
      mobInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doMobSearch();
      });
    }

    menu.querySelectorAll('.mob-dropdown').forEach(function (drop) {
      var btn = drop.querySelector('.mob-dropbtn');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        menu.querySelectorAll('.mob-dropdown.active').forEach(function (d) {
          if (d !== drop) d.classList.remove('active');
        });
        drop.classList.toggle('active');
      });
    });
  });

  /* SCROLL REVEAL */
  var rIO;
  if (typeof IntersectionObserver !== 'undefined') {
    rIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (i % 4 * 0.1) + 's';
          entry.target.classList.add('visible');
          rIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    var observeReveals = function () {
      document.querySelectorAll('.reveal').forEach(function (el) { rIO.observe(el); });
    };
    if (window.requestIdleCallback) requestIdleCallback(observeReveals, { timeout: 1000 });
    else setTimeout(observeReveals, 100);
  }

  /* COUNTER ANIMATION */
  if (typeof IntersectionObserver !== 'undefined') {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var raw = el.getAttribute('data-count');
        if (!raw) return;
        var target = parseInt(raw, 10);
        if (isNaN(target) || target <= 0) { cIO.unobserve(el); return; }
        var suffix = el.textContent.replace(/[0-9]/g, '');
        var dur = 1600;
        var t0 = performance.now();
        function step(now) {
          var p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        cIO.unobserve(el);
      });
    }, { threshold: 0.5 });

    var observeCounters = function () {
      document.querySelectorAll('.hstat-n[data-count]').forEach(function (el) { cIO.observe(el); });
    };
    if (window.requestIdleCallback) requestIdleCallback(observeCounters, { timeout: 1000 });
    else setTimeout(observeCounters, 100);
  }

  /* ─── UTILIDADES DE FEED ─── */

  function htmlToText(html, maxLen) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLen || 120);
  }

  function getThumbUrl(e) {
    if (e.media$thumbnail && e.media$thumbnail.url) {
      return e.media$thumbnail.url.replace('/s72-c/', '/s600-c/');
    }
    return '';
  }

  function getCategoryInfo(labels) {
    if (!labels || !labels.length) return { cls: 'white', label: 'Catastro' };
    var cats = [];
    for (var i = 0; i < labels.length; i++) {
      var c = labels[i].$t || '';
      if (c.trim()) cats.push(c.toLowerCase());
    }
    if (!cats.length) return { cls: 'white', label: 'Catastro' };
    if (cats.some(function(c){ return c.indexOf('derecho')>=0 || c.indexOf('legal')>=0; }))
      return { cls: 'gold', label: 'Derecho' };
    if (cats.some(function(c){ return c.indexOf('gis')>=0 || c.indexOf('geomática')>=0 || c.indexOf('sig')>=0 || c.indexOf('geoinformacion')>=0; }))
      return { cls: 'teal', label: 'GIS' };
    if (cats.some(function(c){ return c.indexOf('catastro')>=0; }))
      return { cls: 'white', label: 'Catastro' };
    var first = cats[0];
    return { cls: 'white', label: first.charAt(0).toUpperCase() + first.slice(1) };
  }

  function getPlaceholderHtml(catLabel) {
    var gradients = {
      'Derecho': 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)',
      'GIS': 'linear-gradient(135deg, #006d6d 0%, #20b2aa 100%)',
      'Catastro': 'linear-gradient(135deg, #1a3a5c 0%, #2c7be5 100%)'
    };
    var icons = {
      'Derecho': 'fa-scale-balanced',
      'GIS': 'fa-map-location-dot',
      'Catastro': 'fa-draw-polygon'
    };
    var grad = gradients[catLabel] || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
    var icon = icons[catLabel] || 'fa-newspaper';
    return '<div class="blog-card-thumb-plh" style="background:' + grad + '"><i class="fa-solid ' + icon + '"></i></div>';
  }

  function getPostUrl(e) {
    var links = e.link || [];
    for (var j = 0; j < links.length; j++) {
      if (links[j].rel === 'alternate') return links[j].href;
    }
    return CFG.blogUrl;
  }

  function formatDate(published) {
    if (!published || !published.$t) return '';
    return new Date(published.$t).toLocaleDateString('es', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  function extractTitleFromSlug(e) {
    var links = e.link || [];
    for (var j = 0; j < links.length; j++) {
      if (links[j].rel === 'alternate') {
        var slug = links[j].href.replace(/\/+$/, '').split('/').pop() || '';
        slug = slug.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
        if (slug.length > 5) return slug.charAt(0).toUpperCase() + slug.slice(1);
      }
    }
    return '';
  }

  function renderBlogCards(entries, box, badgeCls, badgeLabel, excerptLen, emptyMsg, isHome) {
    if (!entries.length) {
      box.innerHTML = '<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">' + (emptyMsg || '') + '</p>';
      return;
    }
    box.innerHTML = entries.map(function (e) {
      var title = (e.title && e.title.$t && e.title.$t.trim()) ? e.title.$t : extractTitleFromSlug(e) || 'Sin título';
      var html = (e.content && e.content.$t) || (e.summary && e.summary.$t) || '';
      var snip = htmlToText(html, excerptLen || 120);
      var thumbUrl = getThumbUrl(e);
      var catInfo = isHome ? getCategoryInfo(e.category || []) : { cls: badgeCls, label: badgeLabel || '' };
      var finalCls = catInfo.cls;
      var finalLabel = catInfo.label;
      var imgHtml = thumbUrl
        ? '<img alt="' + title.replace(/"/g, '&quot;') + '" src="' + thumbUrl.replace(/&amp;/g, '&') + '" loading="lazy">'
        : getPlaceholderHtml(finalLabel);
      var dateStr = formatDate(e.published);
      var readTime = Math.max(1, Math.ceil(snip.length / 500)) + ' min lectura';
      var postUrl = getPostUrl(e);
      return '<a class="blog-card reveal" href="' + postUrl + '" target="_blank" rel="noopener">' +
        '<div class="blog-card-thumb">' + imgHtml +
        '<span class="blog-card-badge ' + finalCls + '">' + finalLabel + '</span></div>' +
        '<div class="blog-card-body">' +
        '<h3 class="blog-card-title">' + title + '</h3>' +
        '<p class="blog-card-excerpt">' + snip + '…</p>' +
        '<div class="blog-card-meta">' +
        '<span class="blog-card-date"><i class="fa-regular fa-calendar"></i> ' + dateStr + ' · ' + readTime + '</span>' +
        '<span class="blog-card-cta">→ Leer en Blog</span>' +
        '</div></div></a>';
    }).join('');
    if (rIO) box.querySelectorAll('.reveal').forEach(function (el) { rIO.observe(el); });
  }

  /* ─── LOADER DE FEED VÍA JSON-IN-SCRIPT (con timeout 10s) ─── */
  function loadFeedJSON(url, callback, onError) {
    var id = '_lgc_' + Math.random().toString(36).substr(2, 9);
    var timedOut = false;
    var timer = setTimeout(function () {
      timedOut = true;
      console.warn('[LexGeoCat] Timeout feed:', url);
      try { delete window[id]; } catch (e) {}
      if (onError) onError('timeout');
    }, 10000);

    window[id] = function (d) {
      if (timedOut) return;
      clearTimeout(timer);
      try {
        callback(d);
      } catch (e) {
        console.warn('[LexGeoCat] Error en callback feed:', e);
        if (onError) onError('callback');
      }
      try { delete window[id]; } catch (e2) { }
    };

    var s = document.createElement('script');
    s.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'alt=json-in-script&callback=' + id;
    s.async = true;
    s.onerror = function () {
      clearTimeout(timer);
      if (!timedOut) {
        timedOut = true;
        console.warn('[LexGeoCat] Error de red feed:', url);
        try { delete window[id]; } catch (e) {}
        if (onError) onError('network');
      }
    };
    document.body.appendChild(s);
  }

  /* ─── ESTADÍSTICAS DESDE BLOGGER ─── */
  (function () {
    try {
      var prof = (CFG && CFG.profesiones) ? CFG.profesiones.length : 0;
      setStat('stat-especialidades', prof);
    } catch (e) { setStat('stat-especialidades', 7); }

    if (!CFG.bloggerFeed) return;

    function setStat(id, n) {
      var el = document.getElementById(id);
      if (!el) return;
      el.setAttribute('data-count', n);
      el.textContent = n;
      if (typeof cIO !== 'undefined' && cIO) {
        try { cIO.observe(el); } catch (e) { }
      }
    }

    loadFeedJSON(CFG.bloggerFeed + '?max-results=0', function (d) {
      var n = d.feed && d.feed.openSearch$totalResults
        ? parseInt(d.feed.openSearch$totalResults.$t, 10) : 0;
      setStat('stat-articulos', n);
    });

    loadFeedJSON(CFG.bloggerFeed + '/-/Recursos?max-results=0', function (d) {
      var n = d.feed && d.feed.openSearch$totalResults
        ? parseInt(d.feed.openSearch$totalResults.$t, 10) : 0;
      setStat('stat-recursos', n);
    });
  })();

  /* ─── CARGA GRID DE POSTS (por label) ─── */
  function loadFeedGrid(label, containerId, badgeCls, limit) {
    if (!CFG.bloggerFeed) return;
    var box = document.getElementById(containerId);
    if (!box) return;
    var url = CFG.bloggerFeed + '/-/' + encodeURIComponent(label) + '?max-results=' + (limit || 6);
    loadFeedJSON(url, function (data) {
      var allEntries = (data.feed && data.feed.entry) || [];
      var entries = [];
      for (var i = 0; i < allEntries.length && entries.length < (limit || 6); i++) {
        var e = allEntries[i];
        var t = e.title && e.title.$t ? e.title.$t.trim() : '';
        if (t.length > 0) entries.push(e);
      }
      if (!entries.length) {
        entries = allEntries.slice(0, limit || 6);
      }
      var emptyMsg = 'Los recursos del blog aparecerán aquí cuando publiques entradas con la etiqueta "' + label + '".';
      renderBlogCards(entries, box, badgeCls, label, 130, emptyMsg, false);
    }, function () {
      box.innerHTML = '<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">' +
        'No se pudieron cargar los recursos en este momento. Visita nuestro <a href="' + CFG.blogUrl + '" style="color:var(--teal)">blog</a>.</p>';
    });
  }

  /* ─── CARGA BLOG PRINCIPAL (últimos 3 artículos) ─── */
  function loadBlogFeed() {
    if (!CFG.bloggerFeed) return;
    var box = document.getElementById('blog-grid');
    if (!box) return;
    var url = CFG.bloggerFeed + '?max-results=10';
    loadFeedJSON(url, function (data) {
      var allEntries = (data.feed && data.feed.entry) || [];
      var validEntries = [];
      for (var i = 0; i < allEntries.length && validEntries.length < 3; i++) {
        var e = allEntries[i];
        var t = e.title && e.title.$t ? e.title.$t.trim() : '';
        if (t.length > 0) {
          validEntries.push(e);
        }
      }
      var entries = validEntries.length > 0 ? validEntries : allEntries.slice(0, 3);
      renderBlogCards(entries, box, 'def', '', 120,
        'Próximamente artículos desde la trinchera catastral.', true);
    }, function () {
      box.innerHTML = '<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">' +
        'No se pudieron cargar los artículos del blog en este momento. ' +
        '<a href="' + CFG.blogUrl + '" style="color:var(--teal)">Visita el blog directamente</a>.</p>';
    });
  }

  /* ─── INICIALIZACIÓN PRINCIPAL ─── */
  document.addEventListener('DOMContentLoaded', function () {
    loadFeedGrid('Recursos', 'recursos-grid', 'def', 6);
    loadBlogFeed();
    var lbl = document.body.getAttribute('data-feed-label');
    if (lbl) loadFeedGrid(lbl, 'topic-posts-grid', 'def', 6);
  });

  /* SEARCH MODAL */
  document.addEventListener('DOMContentLoaded', function () {
    var overlay = document.getElementById('srch-overlay');
    var input = document.getElementById('srch-modal-input');
    var openBtn = document.getElementById('srch-open-btn');
    var closeBtn = document.getElementById('srch-modal-close');
    if (!overlay || !input) return;

    function open() { overlay.classList.add('open'); input.focus(); }
    function close() { overlay.classList.remove('open'); }
    function go() {
      var q = input.value.trim();
      if (!q) return;
      window.open(CFG.bloggerSearch + encodeURIComponent(q), '_blank', 'noopener');
      close();
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') go();
      if (e.key === 'Escape') close();
    });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open(); }
    });
  });

  /* CONTACT FORM */
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var sub = encodeURIComponent('[LexGeoCat] ' + (fd.get('asunto') || 'Consulta'));
      var body = encodeURIComponent(
        'Nombre: ' + fd.get('nombre') + '\nEmail: ' + fd.get('email') + '\n\n' + fd.get('mensaje')
      );
      window.location.href = 'mailto:' + CFG.email + '?subject=' + sub + '&body=' + body;
    });
  });

})();
