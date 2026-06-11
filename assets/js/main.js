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

    /* Buscador móvil */
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

    /* Submenús móvil */
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

  /* STATS DESDE BLOGGER FEED */
  (function () {
    if (!CFG.bloggerFeed) return;
    var feedBase = CFG.bloggerFeed;

    function loadFeed(path, cb) {
      var id = '_lgc_' + Math.random().toString(36).substr(2, 9);
      window[id] = function (d) {
        try { cb(d); } catch (e) { }
        try { delete window[id]; } catch (e2) { }
      };
      var s = document.createElement('script');
      s.src = feedBase + path + (path.indexOf('?') >= 0 ? '&' : '?') + 'alt=json-in-script&callback=' + id;
      s.onerror = function () { try { delete window[id]; } catch (e) { } };
      document.body.appendChild(s);
    }

    function setStat(id, n) {
      var el = document.getElementById(id);
      if (!el) return;
      el.setAttribute('data-count', n);
      el.textContent = n;
      if (typeof cIO !== 'undefined' && cIO) {
        try { cIO.observe(el); } catch (e) { }
      }
    }

    loadFeed('?max-results=0', function (d) {
      var n = d.feed && d.feed.openSearch$totalResults
        ? parseInt(d.feed.openSearch$totalResults.$t, 10) : 0;
      setStat('stat-articulos', n);
    });

    loadFeed('/-/Recursos?max-results=0', function (d) {
      var n = d.feed && d.feed.openSearch$totalResults
        ? parseInt(d.feed.openSearch$totalResults.$t, 10) : 0;
      setStat('stat-recursos', n);
    });

    loadFeed('?max-results=200', function (d) {
      var entries = (d.feed && d.feed.entry) || [];
      var labels = {};
      entries.forEach(function (e) {
        if (e.category) e.category.forEach(function (c) { labels[c.term] = 1; });
      });
      setStat('stat-categorias', Object.keys(labels).length);
      var main = ['Derecho', 'Catastro', 'GIS', 'Geomática', 'Ordenamiento', 'Tecnología'];
      var active = 0;
      main.forEach(function (l) { if (labels[l]) active++; });
      setStat('stat-especialidades', Math.max(active, 1));
    });
  })();

  /* LOAD FEED GRID */
  function loadFeedGrid(label, containerId, badgeCls, limit) {
    if (!CFG.bloggerFeed) return;
    var box = document.getElementById(containerId);
    if (!box) return;
    var cb = '__cb_' + containerId.replace(/-/g, '_');
    var url = CFG.bloggerFeed + '/-/' + encodeURIComponent(label) +
      '?alt=json-in-script&max-results=' + (limit || 6) + '&callback=' + cb;
    window[cb] = function (data) {
      var entries = (data.feed && data.feed.entry) || [];
      if (!entries.length) {
        box.innerHTML = '<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">' +
          'Los recursos del blog aparecerán aquí cuando publiques entradas con la etiqueta "' + label + '".</p>';
        return;
      }
      box.innerHTML = entries.map(function (e) {
        var links = e.link || [];
        var postUrl = CFG.blogUrl;
        for (var j = 0; j < links.length; j++) {
          if (links[j].rel === 'alternate') { postUrl = links[j].href; break; }
        }
        var title = (e.title && e.title.$t) ? e.title.$t : 'Sin título';
        var html = (e.content && e.content.$t) || (e.summary && e.summary.$t) || '';
        var snip = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 130);
        var thumb = '';
        if (e.media$thumbnail && e.media$thumbnail.url) {
          thumb = e.media$thumbnail.url.replace('/s72-c/', '/s600-c/');
        }
        var imgHtml = thumb
          ? '<img alt="' + title.replace(/"/g, '&quot;') + '" src="' + thumb.replace(/&amp;/g, '&') + '" loading="lazy">'
          : '<div class="pc-noimg"><i class="fa-solid fa-book-open"></i></div>';
        var dateStr = '';
        if (e.published && e.published.$t) {
          dateStr = new Date(e.published.$t).toLocaleDateString('es', {
            year: 'numeric', month: 'short', day: 'numeric'
          });
        }
        return '<article class="pc reveal">' +
          '<div class="pc-img">' + imgHtml +
          '<span class="pc-badge ' + badgeCls + '">' + label + '</span></div>' +
          '<div class="pc-body">' +
          '<div class="pc-meta"><i class="fa-regular fa-calendar"></i> ' + dateStr + '</div>' +
          '<h3 class="pc-title"><a href="' + postUrl + '" target="_blank" rel="noopener">' + title + '</a></h3>' +
          '<p class="pc-snip">' + snip + '</p>' +
          '<div class="pc-ft"><a class="pc-read" href="' + postUrl + '" target="_blank" rel="noopener">' +
          'Leer en el blog <i class="fa-solid fa-arrow-right"></i></a></div>' +
          '</div></article>';
      }).join('');
      if (rIO) box.querySelectorAll('.reveal').forEach(function (el) { rIO.observe(el); });
    };
    var sc = document.createElement('script');
    sc.src = url;
    sc.async = true;
    document.body.appendChild(sc);
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadFeedGrid('Recursos', 'recursos-grid', 'def', 6);
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