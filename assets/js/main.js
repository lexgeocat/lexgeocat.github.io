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
    var geoUrl = cfg.geoProvider || 'https://ipapi.co/json/';

    // ── Caché corto para geo: 30 min (no 24h) para que VPN sea detectable
    var GEO_CACHE_MS = 30 * 60 * 1000;
    // ── Caché de contador: 10 min
    var COUNTER_CACHE_MS = 10 * 60 * 1000;
    // ── Clave IP anterior para detectar cambios de red/VPN
    var GEO_KEY = 'lgc_geo_v2';
    var COUNTRY_LOG_KEY = 'lgc_countries_v1'; // historial acumulado por país
    var LOCAL_CTR_KEY = 'lgc_local_v2';
    var LOCAL_SES_KEY = 'lgc_local_session_v2';

    var counterEl = document.getElementById('counter-dev-placeholder');
    var countryEl = document.getElementById('visitor-country-info');

    /* ── Helpers ─────────────────────────────────── */
    function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
    function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }

    /* ── 1. CONTADOR DE VISTAS ──────────────────── */

    function setCounterText(n) {
      if (!counterEl) return;
      var valueEl = counterEl.querySelector('.hdr-stat-value');
      if (valueEl) valueEl.textContent = n.toLocaleString('es');
      var label = cfg.counterLabel || 'Visitas';
      counterEl.setAttribute('data-tip', label + ': ' + n.toLocaleString('es'));
      counterEl.setAttribute('aria-label', label + ': ' + n.toLocaleString('es'));
    }

    // Contador local acumulativo (cross-session via localStorage, una cuenta por sesión)
    function bumpLocalCounter() {
      var n = parseInt(lsGet(LOCAL_CTR_KEY) || 0, 10) || 0;
      if (!ssGet(LOCAL_SES_KEY)) {
        n += 1;
        lsSet(LOCAL_CTR_KEY, n);
        ssSet(LOCAL_SES_KEY, '1');
      }
      return n;
    }

    // Inyecta el script de counter.dev (solo para tracking, no para leer total)
    function injectCounterDevHit() {
      if (!counterId || document.getElementById('lgc-counter-hit')) return;
      var s = document.createElement('script');
      s.id = 'lgc-counter-hit';
      s.src = 'https://cdn.counter.dev/script.js';
      s.setAttribute('data-id', counterId);
      if (cfg.counterUtcOffset !== undefined && cfg.counterUtcOffset !== null) {
        s.setAttribute('data-utcoffset', String(cfg.counterUtcOffset));
      }
      s.async = true;
      document.body.appendChild(s);
    }

    // Inyecta GoatCounter (tracking, no API — evita el error CORS)
    function injectGoatCounter() {
      if (!goatCode || document.getElementById('lgc-goat-counter')) return;
      var s = document.createElement('script');
      s.id = 'lgc-goat-counter';
      s.async = true;
      // El script oficial de GoatCounter solo necesita data-goatcounter
      s.setAttribute('data-goatcounter', 'https://' + goatCode + '.goatcounter.com/count');
      s.src = 'https://gc.zgo.at/count.js';
      document.body.appendChild(s);
    }

    function loadCounter() {
      // Intentamos leer el widget embed de GoatCounter (no la API privada)
      // El widget público expone window.goatcounter.count pero no el total global.
      // Solución correcta: usar counter.dev read-url que sí es pública.
      var readUrl = cfg.counterReadUrl;
      var cacheKey = 'lgc_ctr_cache_v1';
      var cached = lsGet(cacheKey);

      if (cached && (Date.now() - cached.ts) < COUNTER_CACHE_MS && cached.n > 0) {
        setCounterText(cached.n);
        return;
      }

      if (readUrl) {
        fetch(readUrl, { headers: { 'Accept': 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (data) {
            // counter.dev devuelve { "YYYY-MM-DD": n, ... } — sumamos todos los valores
            var total = 0;
            if (data && typeof data === 'object') {
              Object.keys(data).forEach(function (k) {
                var v = data[k];
                if (typeof v === 'number') total += v;
                else if (v && typeof v === 'object') {
                  // a veces viene { "total": n }
                  total += parseInt(v.total || v.count || 0, 10);
                }
              });
            }
            if (total > 0) {
              lsSet(cacheKey, { ts: Date.now(), n: total });
              setCounterText(total);
            } else {
              setCounterText(bumpLocalCounter());
            }
          })
          .catch(function () { setCounterText(bumpLocalCounter()); });
      } else {
        setCounterText(bumpLocalCounter());
      }
    }

    /* ── 2. GEO + BANDERAS ACUMULATIVAS ─────────── */

    /*
     * Historial de países:
     * lgc_countries_v1 = { "bo": { name:"Bolivia", code:"bo", hits:6 }, "fr": { ... }, ... }
     * Se suma 1 al país actual cada sesión nueva.
     */

    function getCountryLog() {
      return lsGet(COUNTRY_LOG_KEY) || {};
    }

    function recordCountryHit(code, name) {
      var log = getCountryLog();
      if (!log[code]) log[code] = { name: name, code: code, hits: 0 };
      // Solo contamos una vez por sesión de navegador
      if (!ssGet('lgc_geo_counted')) {
        log[code].hits += 1;
        ssSet('lgc_geo_counted', '1');
      }
      lsSet(COUNTRY_LOG_KEY, log);
      return log;
    }

    function renderCountryFlag(code, name) {
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

    function renderTop5(log) {
      // Ordena países por hits descendente, toma top 5
      var sorted = Object.values(log).sort(function (a, b) { return b.hits - a.hits; }).slice(0, 5);
      var statsEl = document.getElementById('hdr-stats');
      if (!statsEl || sorted.length < 2) return; // si solo hay 1 país, no vale la pena el widget

      // Elimina el top5 previo si existe (para re-render)
      var old = document.getElementById('lgc-top5');
      if (old) old.remove();

      var wrap = document.createElement('div');
      wrap.id = 'lgc-top5';
      wrap.setAttribute('aria-label', 'Top países visitantes');
      wrap.style.cssText = [
        'display:flex',
        'align-items:center',
        'gap:6px',
        'margin-left:8px',
        'padding-left:8px',
        'border-left:1px solid var(--border)',
        'flex-wrap:nowrap'
      ].join(';');

      sorted.forEach(function (c) {
        var item = document.createElement('span');
        item.style.cssText = 'display:flex;align-items:center;gap:3px;font-size:.72rem;color:var(--text3);white-space:nowrap;cursor:default';
        item.setAttribute('data-tip', c.name + ': ' + c.hits + (c.hits === 1 ? ' visita' : ' visitas'));
        item.setAttribute('aria-label', c.name + ': ' + c.hits + ' visitas');

        var flag = document.createElement('img');
        flag.src = 'https://flagcdn.com/w20/' + c.code + '.png';
        flag.srcset = 'https://flagcdn.com/w20/' + c.code + '.png 1x, https://flagcdn.com/w40/' + c.code + '.png 2x';
        flag.alt = c.name;
        flag.width = 18;
        flag.height = 12;
        flag.style.cssText = 'border-radius:2px;object-fit:cover;flex-shrink:0';
        flag.loading = 'lazy';

        var count = document.createElement('span');
        count.style.cssText = 'font-family:var(--font-m,monospace);font-size:.7rem;font-weight:600;color:var(--text2)';
        count.textContent = c.hits;

        item.appendChild(flag);
        item.appendChild(count);
        wrap.appendChild(item);
      });

      // Insertar el top5 después del separador existente en hdr-stats
      var sep = statsEl.querySelector('.hdr-stat-sep');
      if (sep) {
        sep.insertAdjacentElement('afterend', wrap);
      } else {
        statsEl.appendChild(wrap);
      }
    }

    function loadCountry() {
      var cached = lsGet(GEO_KEY);
      var now = Date.now();

      function applyGeo(data) {
        if (!data) return;
        var code = (data.country_code || data.country || '').toString().toLowerCase().trim();
        var name = (data.country_name || data.country || '').trim();
        if (!code || !name || code === 'undefined') return;

        // Detectar si cambió la IP (VPN) comparando con el dato anterior
        var prevIp = cached && cached.ip;
        var currentIp = data.ip || data.IPv4 || '';
        var ipChanged = prevIp && currentIp && prevIp !== currentIp;

        // Si la IP cambió, borramos la sesión de conteo para registrar el nuevo país
        if (ipChanged) {
          try { sessionStorage.removeItem('lgc_geo_counted'); } catch (e) { }
        }

        // Guardamos en caché con la IP actual
        lsSet(GEO_KEY, { ts: now, data: data, ip: currentIp });

        var log = recordCountryHit(code, name);
        renderCountryFlag(code, name);
        renderTop5(log);
      }

      // Usar caché solo si: existe, no caducó, Y la IP no cambió (no podemos saber si cambió sin preguntar)
      // Por eso reducimos el caché a 30 min y siempre verificamos si el fetch falla
      var isFresh = cached && (now - cached.ts) < GEO_CACHE_MS;
      if (isFresh) {
        applyGeo(cached.data);
        // Igual renderizamos top5 aunque no hagamos fetch
        var log = getCountryLog();
        if (Object.keys(log).length > 1) renderTop5(log);
        return;
      }

      fetch(geoUrl, { headers: { 'Accept': 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          if (data && data.error) throw new Error(data.reason || 'geo error');
          applyGeo(data);
        })
        .catch(function () {
          // Si falla la API, al menos mostramos el top5 acumulado del log
          if (cached && cached.data) applyGeo(cached.data);
          else {
            var log = getCountryLog();
            if (Object.keys(log).length > 0) renderTop5(log);
          }
        });
    }

    /* ── 3. INIT ─────────────────────────────────── */
    function init() {
      injectCounterDevHit();
      injectGoatCounter();
      loadCounter();
      loadCountry();
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