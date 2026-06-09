(function () {
  'use strict';

  var CFG = window.LGC_CONFIG || {};

  /* --- HERO PARALLAX EFFECT --- */
  document.addEventListener('DOMContentLoaded', function () {
    var bgMap = document.querySelector('.hero-bg-map');
    if (!bgMap) return;
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth) - 0.5;
      var y = (e.clientY / window.innerHeight) - 0.5;
      var moveX = x * 30;
      var moveY = y * 30;
      bgMap.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
    });
  });

  /* --- PRELOADER --- */

  function hideLoader() {
    var l = document.getElementById('ld');
    if (l) l.classList.add('hide');
  }
  window.addEventListener('load', function () { setTimeout(hideLoader, 350); });
  setTimeout(hideLoader, 4500);

  /* --- THEME --- */
  var KEY = 'lgc-theme';
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  }
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) applyTheme(saved);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
    else applyTheme('light');
  } catch (e) { }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('th-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        var d = document.documentElement.getAttribute('data-theme') === 'dark';
        var n = d ? 'light' : 'dark';
        applyTheme(n);
        try { localStorage.setItem(KEY, n); } catch (e) { }
      });
    }
  });

  /* --- HEADER SCROLL --- */
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    var hdr = document.getElementById('hdr');
    var navBar = document.getElementById('nav-bar');
    if (hdr) {
      if (y > 30) hdr.classList.add('scrolled');
      else hdr.classList.remove('scrolled');
    }
    if (navBar) {
      if (y > lastY && y > 200) navBar.classList.add('hidden');
      else navBar.classList.remove('hidden');
    }
    lastY = y;
    var top = document.getElementById('top');
    if (top) {
      if (y > 600) top.classList.add('show');
      else top.classList.remove('show');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  document.addEventListener('DOMContentLoaded', function () {
    var topBtn = document.getElementById('top');
    if (topBtn) {
      topBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  });

  /* --- MOBILE MENU --- */
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
    var mobDropbtn = menu.querySelector('.mob-dropbtn');
    var mobDropdown = menu.querySelector('.mob-dropdown');
    if (mobDropbtn && mobDropdown) {
      mobDropbtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        mobDropdown.classList.toggle('active');
      });
    }
  });

  /* --- COUNTER AND VISITOR INFO --- */
  (function () {
    if (window.__lgcCounterInit) return;
    window.__lgcCounterInit = true;

    var cfg = CFG || {};
    var counterId = cfg.counterWebsiteId;
    var goatCode = cfg.goatCounterCode;
    // Token de solo lectura de GoatCounter: Settings > API en tu panel goatcounter.com
    // Agregalo en config.js como: goatToken: 'TU_TOKEN_AQUI'
    var goatToken = cfg.goatToken || '1n3711akdpy4fe46phz98kj71j747lj0gtdhhzycbqckd3lun';
    var geoUrl = cfg.geoProvider || 'https://ipapi.co/json/';

    var GEO_CACHE_MS = 30 * 60 * 1000;  // 30 min
    var COUNTER_CACHE_MS = 10 * 60 * 1000;  // 10 min
    var COUNTRY_CACHE_MS = 15 * 60 * 1000;  // 15 min

    var GEO_KEY = 'lgc_geo_v3';
    var LOCAL_CTR_KEY = 'lgc_local_v3';
    var LOCAL_SES_KEY = 'lgc_local_ses_v3';

    var counterEl = document.getElementById('counter-dev-placeholder');
    var countryEl = document.getElementById('visitor-country-info');

    /* ── Helpers ────────────────────────────────────── */
    function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
    function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }

    function goatHeaders() {
      var h = { 'Accept': 'application/json' };
      if (goatToken) h['Authorization'] = 'Bearer ' + goatToken;
      return h;
    }

    /* ── 1. CONTADOR — fuente real cross-device ───── */

    function setCounterText(n) {
      if (!counterEl) return;
      var valueEl = counterEl.querySelector('.hdr-stat-value');
      if (valueEl) valueEl.textContent = n.toLocaleString('es');
      var label = cfg.counterLabel || 'Visitas';
      counterEl.setAttribute('data-tip', label + ': ' + n.toLocaleString('es'));
      counterEl.setAttribute('aria-label', label + ': ' + n.toLocaleString('es'));
    }

    function bumpLocalCounter() {
      // Fallback local: solo se usa si GoatCounter y counter.dev fallan
      var n = parseInt(lsGet(LOCAL_CTR_KEY) || 0, 10) || 0;
      if (!ssGet(LOCAL_SES_KEY)) { n += 1; lsSet(LOCAL_CTR_KEY, n); ssSet(LOCAL_SES_KEY, '1'); }
      return n;
    }

    function injectCounterDevHit() {
      if (!counterId || document.getElementById('lgc-counter-hit')) return;
      var s = document.createElement('script');
      s.id = 'lgc-counter-hit';
      s.src = 'https://cdn.counter.dev/script.js';
      s.setAttribute('data-id', counterId);
      if (cfg.counterUtcOffset !== undefined) s.setAttribute('data-utcoffset', String(cfg.counterUtcOffset));
      s.async = true;
      document.body.appendChild(s);
    }

    function injectGoatCounter() {
      if (!goatCode || document.getElementById('lgc-goat-counter')) return;
      var s = document.createElement('script');
      s.id = 'lgc-goat-counter';
      s.async = true;
      s.setAttribute('data-goatcounter', 'https://' + goatCode + '.goatcounter.com/count');
      s.src = 'https://gc.zgo.at/count.js';
      document.body.appendChild(s);
    }

    function loadCounter() {
      var cacheKey = 'lgc_ctr_v3';
      var cached = lsGet(cacheKey);
      if (cached && (Date.now() - cached.ts) < COUNTER_CACHE_MS && cached.n > 0) {
        setCounterText(cached.n); return;
      }

      // Fuente 1: GoatCounter API /stats/total (requiere token, datos reales de todos los dispositivos)
      function tryGoat() {
        if (!goatCode || !goatToken) return tryCounterDev();
        var url = 'https://' + goatCode + '.goatcounter.com/api/v0/stats/total?start=2000-01-01&end=2099-12-31';
        fetch(url, { headers: goatHeaders() })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (data) {
            var n = parseInt(data.total || data.count || data.visits || data.hits || 0, 10) || 0;
            if (n > 0) { lsSet(cacheKey, { ts: Date.now(), n: n }); setCounterText(n); }
            else tryCounterDev();
          })
          .catch(tryCounterDev);
      }

      // Fuente 2: counter.dev read URL (pública, sin token, datos reales cross-device)
      function tryCounterDev() {
        var readUrl = cfg.counterReadUrl;
        if (!readUrl) { setCounterText(bumpLocalCounter()); return; }
        fetch(readUrl, { headers: { 'Accept': 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (data) {
            var total = 0;
            if (data && typeof data === 'object') {
              Object.keys(data).forEach(function (k) {
                var v = data[k];
                if (typeof v === 'number') total += v;
                else if (v && typeof v === 'object') total += parseInt(v.total || v.count || 0, 10);
              });
            }
            if (total > 0) { lsSet(cacheKey, { ts: Date.now(), n: total }); setCounterText(total); }
            else setCounterText(bumpLocalCounter());
          })
          .catch(function () { setCounterText(bumpLocalCounter()); });
      }

      tryGoat();
    }

    /* ── 2. PAÍS ACTUAL (bandera del visitante) ───── */

    function renderCurrentFlag(code, name) {
      if (!countryEl) return;
      var img = countryEl.querySelector('.hdr-stat-flag');
      if (img) {
        img.src = 'https://flagcdn.com/w40/' + code + '.png';
        img.srcset = 'https://flagcdn.com/w40/' + code + '.png 1x, https://flagcdn.com/w80/' + code + '.png 2x';
        img.alt = name;
      }
      countryEl.setAttribute('data-tip', 'Visitando desde ' + name);
      countryEl.setAttribute('aria-label', 'Visitando desde ' + name);
      countryEl.hidden = false;
    }

    function loadCurrentCountry() {
      var cached = lsGet(GEO_KEY);
      var now = Date.now();

      function applyGeo(data) {
        if (!data) return;
        var code = (data.country_code || data.country || '').toString().toLowerCase().trim();
        var name = (data.country_name || data.country || '').trim();
        if (!code || !name || code === 'undefined') return;
        var prevIp = cached && cached.ip;
        var currentIp = data.ip || data.IPv4 || '';
        // Si la IP cambió (VPN activada/desactivada), forzar un nuevo fetch al recargar
        if (prevIp && currentIp && prevIp !== currentIp) {
          lsSet(GEO_KEY, { ts: 0, data: data, ip: currentIp }); // ts=0 fuerza refresco siguiente vez
        } else {
          lsSet(GEO_KEY, { ts: now, data: data, ip: currentIp });
        }
        renderCurrentFlag(code, name);
      }

      var isFresh = cached && (now - cached.ts) < GEO_CACHE_MS;
      if (isFresh) {
        renderCurrentFlag(
          (cached.data.country_code || '').toLowerCase(),
          cached.data.country_name || cached.data.country || ''
        ); return;
      }

      fetch(geoUrl, { headers: { 'Accept': 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) { if (data && data.error) throw new Error('geo error'); applyGeo(data); })
        .catch(function () {
          if (cached && cached.data) renderCurrentFlag(
            (cached.data.country_code || '').toLowerCase(),
            cached.data.country_name || ''
          );
        });
    }

    /* ── 3. TOP 5 PAÍSES — fuente real: GoatCounter ─
     *
     * GoatCounter /api/v0/stats/browsers?stat=country devuelve los países
     * reales de TODOS los visitantes, acumulados en su servidor.
     * Requiere token de solo lectura (goatToken en config.js).
     *
     * Sin token: se usa ipapi.co solo para mostrar la bandera del visitante actual,
     * no hay top 5 (no es posible sin backend).
     */

    function renderTop5(countries) {
      // countries = [{ country: "Bolivia", count: 6, id: "BO" }, ...]
      if (!countries || countries.length < 2) return;
      var statsEl = document.getElementById('hdr-stats');
      if (!statsEl) return;

      var old = document.getElementById('lgc-top5');
      if (old) old.remove();

      var wrap = document.createElement('div');
      wrap.id = 'lgc-top5';
      wrap.setAttribute('aria-label', 'Top países visitantes');
      wrap.style.cssText = 'display:flex;align-items:center;gap:6px;margin-left:8px;padding-left:8px;border-left:1px solid var(--border);flex-wrap:nowrap';

      countries.slice(0, 5).forEach(function (c) {
        // GoatCounter devuelve id como código ISO de 2 letras en mayúsculas, ej: "BO", "US"
        var code = (c.id || c.country_code || '').toLowerCase();
        var name = c.country || c.name || code;
        var hits = c.count || c.hits || 0;
        if (!code) return;

        var item = document.createElement('span');
        item.style.cssText = 'display:flex;align-items:center;gap:3px;font-size:.72rem;color:var(--text3);white-space:nowrap;cursor:default';
        item.setAttribute('data-tip', name + ': ' + hits + (hits === 1 ? ' visita' : ' visitas'));
        item.setAttribute('aria-label', name + ': ' + hits + ' visitas');

        var flag = document.createElement('img');
        flag.src = 'https://flagcdn.com/w20/' + code + '.png';
        flag.srcset = 'https://flagcdn.com/w20/' + code + '.png 1x, https://flagcdn.com/w40/' + code + '.png 2x';
        flag.alt = name;
        flag.width = 18;
        flag.height = 12;
        flag.style.cssText = 'border-radius:2px;object-fit:cover;flex-shrink:0';
        flag.loading = 'lazy';

        var count = document.createElement('span');
        count.style.cssText = 'font-family:var(--font-m,monospace);font-size:.7rem;font-weight:600;color:var(--text2)';
        count.textContent = hits;

        item.appendChild(flag);
        item.appendChild(count);
        wrap.appendChild(item);
      });

      var sep = statsEl.querySelector('.hdr-stat-sep');
      if (sep) sep.insertAdjacentElement('afterend', wrap);
      else statsEl.appendChild(wrap);
    }

    function loadCountryTop5() {
      if (!goatCode || !goatToken) return; // sin token no hay datos reales

      var cacheKey = 'lgc_ctop_v3';
      var cached = lsGet(cacheKey);
      if (cached && (Date.now() - cached.ts) < COUNTRY_CACHE_MS) {
        renderTop5(cached.data); return;
      }

      // Endpoint: /api/v0/stats/browsers?stat=country&limit=5
      var url = 'https://' + goatCode + '.goatcounter.com/api/v0/stats/browsers?stat=country&limit=5&start=2000-01-01&end=2099-12-31';
      fetch(url, { headers: goatHeaders() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          // GoatCounter devuelve { more: bool, stats: [{ id, name/country, count }, ...] }
          var stats = (data && data.stats) ? data.stats : [];
          if (stats.length) {
            lsSet(cacheKey, { ts: Date.now(), data: stats });
            renderTop5(stats);
          }
        })
        .catch(function () { /* silencioso: si falla no mostramos nada */ });
    }

    /* ── 4. INIT ─────────────────────────────────── */
    function init() {
      injectCounterDevHit();
      injectGoatCounter();
      loadCounter();
      loadCurrentCountry();
      loadCountryTop5();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }
  })(); // Fin: contador y banderas

  /* --- SCROLL REVEAL --- */
  var rIO;
  if (typeof IntersectionObserver !== 'undefined') {
    rIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = (i % 4 * 0.1) + 's';
          e.target.classList.add('visible');
          rIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) { rIO.observe(el); });
  }

  /* --- COUNTER ANIMATION --- */
  if (typeof IntersectionObserver !== 'undefined') {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var raw = el.getAttribute('data-count');
        if (!raw) return;
        var target = parseInt(raw, 10);
        if (isNaN(target)) { cIO.unobserve(el); return; }
        var suffix = el.textContent.replace(/[0-9]/g, '');
        var dur = 1600, start = performance.now();
        function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        cIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.hstat-n[data-count]').forEach(function (el) { cIO.observe(el); });
  }

  /* --- STATS FROM BLOGGER FEED (JSONP) --- */
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
      var n = (d.feed && d.feed.openSearch$totalResults) ? parseInt(d.feed.openSearch$totalResults.$t, 10) : 0;
      setStat('stat-articulos', n);
    });
    loadFeed('/-/Recursos?max-results=0', function (d) {
      var n = (d.feed && d.feed.openSearch$totalResults) ? parseInt(d.feed.openSearch$totalResults.$t, 10) : 0;
      setStat('stat-recursos', n);
    });
    loadFeed('?max-results=200', function (d) {
      var entries = (d.feed && d.feed.entry) || [];
      var labels = {};
      entries.forEach(function (e) {
        if (e.category) e.category.forEach(function (c) { labels[c.term] = 1; });
      });
      setStat('stat-categorias', Object.keys(labels).length);
      var mainLabels = ['Derecho', 'Catastro', 'GIS', 'Geomática', 'Ordenamiento', 'Tecnología'];
      var active = 0;
      mainLabels.forEach(function (l) { if (labels[l]) active++; });
      setStat('stat-especialidades', Math.max(active, 1));
    });
  })();

  /* --- LOAD FEED GRID --- */
  function loadFeedGrid(label, containerId, badgeCls, limit) {
    if (!CFG.bloggerFeed) return;
    var box = document.getElementById(containerId);
    if (!box) return;
    var cb = '__cb_' + containerId.replace(/-/g, '_');
    var url = CFG.bloggerFeed + '/-/' + encodeURIComponent(label) + '?alt=json-in-script&max-results=' + (limit || 6) + '&callback=' + cb;
    window[cb] = function (data) {
      var entries = (data.feed && data.feed.entry) || [];
      if (!entries.length) {
        box.innerHTML = '<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">Los recursos del blog aparecerán aquí cuando publiques entradas con la etiqueta "' + label + '".</p>';
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
          dateStr = new Date(e.published.$t).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' });
        }
        return '<article class="pc reveal"><div class="pc-img">' + imgHtml +
          '<span class="pc-badge ' + badgeCls + '">' + label + '</span></div><div class="pc-body">' +
          '<div class="pc-meta"><i class="fa-regular fa-calendar"></i> ' + dateStr + '</div>' +
          '<h3 class="pc-title"><a href="' + postUrl + '" target="_blank" rel="noopener">' + title + '</a></h3>' +
          '<p class="pc-snip">' + snip + '</p><div class="pc-ft">' +
          '<a class="pc-read" href="' + postUrl + '" target="_blank" rel="noopener">Leer en el blog <i class="fa-solid fa-arrow-right"></i></a>' +
          '</div></div></article>';
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
    var pageGrid = document.body.getAttribute('data-feed-label');
    if (pageGrid) loadFeedGrid(pageGrid, 'topic-posts-grid', 'def', 6);
  });

  /* --- SEARCH → BLOGGER --- */
  document.addEventListener('DOMContentLoaded', function () {
    var overlay = document.getElementById('srch-overlay');
    var input = document.getElementById('srch-modal-input');
    var openBtn = document.getElementById('srch-open-btn');
    var closeBtn = document.getElementById('srch-modal-close');
    if (!overlay || !input) return;

    function openSearch() {
      overlay.classList.add('open');
      input.focus();
    }
    function closeSearch() {
      overlay.classList.remove('open');
    }
    function doSearch() {
      var q = input.value.trim();
      if (!q) return;
      window.open(CFG.bloggerSearch + encodeURIComponent(q), '_blank', 'noopener');
      closeSearch();
    }

    if (openBtn) openBtn.addEventListener('click', openSearch);
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch();
      if (e.key === 'Escape') closeSearch();
    });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    });
  });

  /* --- CONTACT FORM --- */
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var subject = encodeURIComponent('[LexGeoCat] ' + (fd.get('asunto') || 'Consulta'));
      var body = encodeURIComponent(
        'Nombre: ' + fd.get('nombre') + '\nEmail: ' + fd.get('email') + '\n\n' + fd.get('mensaje')
      );
      window.location.href = 'mailto:' + CFG.email + '?subject=' + subject + '&body=' + body;
    });
  });
})();