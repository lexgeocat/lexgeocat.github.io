(function () {
  'use strict';

  var CFG = window.LGC_CONFIG || {};

  /* ─────────────────────────────────────────────
     HERO PARALLAX
  ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var bgMap = document.querySelector('.hero-bg-map');
    if (!bgMap) return;
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth) - 0.5;
      var y = (e.clientY / window.innerHeight) - 0.5;
      bgMap.style.transform = 'translate(' + (x * 30) + 'px, ' + (y * 30) + 'px)';
    });
  });

  /* ─────────────────────────────────────────────
     PRELOADER
  ───────────────────────────────────────────── */
  function hideLoader() {
    var l = document.getElementById('ld');
    if (l) l.classList.add('hide');
  }
  window.addEventListener('load', function () { setTimeout(hideLoader, 350); });
  setTimeout(hideLoader, 4500);

  /* ─────────────────────────────────────────────
     THEME
  ───────────────────────────────────────────── */
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
    if (btn) {
      btn.addEventListener('click', function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        var next = isDark ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) { }
      });
    }
  });

  /* ─────────────────────────────────────────────
     HEADER SCROLL + NAV HIDE
  ───────────────────────────────────────────── */
  var lastScrollY = 0;
  function onScroll() {
    var y = window.scrollY;
    var hdr = document.getElementById('hdr');
    var navBar = document.getElementById('nav-bar');
    var topBtn = document.getElementById('top');
    if (hdr) {
      if (y > 30) hdr.classList.add('scrolled');
      else hdr.classList.remove('scrolled');
    }
    if (navBar) {
      if (y > lastScrollY && y > 200) navBar.classList.add('hidden');
      else navBar.classList.remove('hidden');
    }
    if (topBtn) {
      if (y > 600) topBtn.classList.add('show');
      else topBtn.classList.remove('show');
    }
    lastScrollY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  document.addEventListener('DOMContentLoaded', function () {
    var topBtn = document.getElementById('top');
    if (topBtn) topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────────
     MOBILE MENU
  ───────────────────────────────────────────── */
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

  /* ═══════════════════════════════════════════════════════
     CONTADOR + BANDERAS — lógica central reescrita
  ═══════════════════════════════════════════════════════ */
  (function () {
    if (window.__lgcCounterInit) return;
    window.__lgcCounterInit = true;

    var cfg = CFG || {};
    var goatCode = cfg.goatCounterCode;   // 'cris99'
    var goatToken = cfg.goatToken;        // token para llamadas desde cliente (solo lectura pública)
    var geoUrl = cfg.geoProvider || 'https://ipapi.co/json/';

    /* ── Resolver ruta a stats.json desde cualquier profundidad ── */
    var depth = parseInt(document.body.getAttribute('data-depth') || '0', 10);
    var prefix = '';
    for (var i = 0; i < depth; i++) prefix += '../';
    var STATS_URL = prefix + 'assets/data/stats.json';

    /* ── TTL de caché ── */
    var TTL_COUNTER = 10 * 60 * 1000;  // 10 min  — counter
    var TTL_COUNTRIES = 15 * 60 * 1000;  // 15 min  — top países
    var TTL_GEO = 30 * 60 * 1000;  // 30 min  — país del visitante

    /* ── Claves localStorage versionadas (al cambiar VER se invalida todo) ── */
    var VER = 5;
    var KEY_CTR = 'lgc_ctr_v' + VER;
    var KEY_CTOP = 'lgc_ctop_v' + VER;
    var KEY_GEO = 'lgc_geo_v' + VER;

    /* ── Limpiar versiones anteriores ── */
    [1, 2, 3, 4].forEach(function (v) {
      try {
        ['lgc_ctr_v', 'lgc_ctop_v', 'lgc_geo_v', 'lgc_local_v', 'lgc_local_ses_v'].forEach(function (k) {
          localStorage.removeItem(k + v);
        });
      } catch (e) { }
    });

    /* ── Helpers localStorage ── */
    function lsGet(k) {
      try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
    }
    function lsSet(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { }
    }
    function isFresh(cached, ttl) {
      return cached && cached.ts && (Date.now() - cached.ts) < ttl;
    }

    /* ── Elementos del DOM ── */
    var counterEl = document.getElementById('counter-dev-placeholder');
    var countryEl = document.getElementById('visitor-country-info');
    var statsEl = document.getElementById('hdr-stats');

    /* ─────────────────────────────────────────────────────────────
       1. CONTADOR DE VISITAS
       Fuentes en orden de prioridad:
         A) GoatCounter endpoint público /counter/TOTAL.json  (sin auth)
         B) stats.json  (generado por GitHub Action cada hora)
    ───────────────────────────────────────────────────────────── */
    function setCounterUI(n) {
      if (!counterEl || !n) return;
      var valueEl = counterEl.querySelector('.hdr-stat-value');
      if (valueEl) valueEl.textContent = n.toLocaleString('es');
      var label = cfg.counterLabel || 'Visitas';
      counterEl.setAttribute('data-tip', label + ': ' + n.toLocaleString('es'));
      counterEl.setAttribute('aria-label', label + ': ' + n.toLocaleString('es'));
    }

    function injectGoatScript() {
      if (!goatCode || document.getElementById('lgc-goat-script')) return;
      var s = document.createElement('script');
      s.id = 'lgc-goat-script';
      s.async = true;
      s.setAttribute('data-goatcounter', 'https://' + goatCode + '.goatcounter.com/count');
      s.src = 'https://gc.zgo.at/count.js';
      document.body.appendChild(s);
    }

    function loadCounter() {
      /* Usa caché si está fresco */
      var cached = lsGet(KEY_CTR);
      if (isFresh(cached, TTL_COUNTER) && cached.n > 0) {
        setCounterUI(cached.n);
        /* Refresca en background sin bloquear */
        fetchCounterBackground();
        return;
      }
      fetchCounterBackground();
    }

    function fetchCounterBackground() {
      /* Fuente A: endpoint público de GoatCounter (no requiere token,
         pero el sitio debe tener "Public access to your stats" habilitado
         en Settings → API token → Allow to view public stats)            */
      var publicUrl = 'https://' + goatCode + '.goatcounter.com/counter/TOTAL.json';

      fetch(publicUrl, { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('public-counter-' + r.status);
          return r.json();
        })
        .then(function (data) {
          /*  GoatCounter devuelve { "count": "37", "count_unique": "14" }
              o { "count": "1,234" } con separador de miles                */
          var raw = String(data.count || data.total || '0');
          var n = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
          if (n > 0) {
            lsSet(KEY_CTR, { ts: Date.now(), n: n });
            setCounterUI(n);
          } else {
            throw new Error('public-counter-zero');
          }
        })
        .catch(function () {
          /* Fuente B: stats.json generado por GitHub Action */
          fetchCounterFromStats();
        });
    }

    function fetchCounterFromStats() {
      fetch(STATS_URL + '?_=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('stats-' + r.status); return r.json(); })
        .then(function (data) {
          var n = parseInt(data.total, 10) || 0;
          if (n > 0) {
            lsSet(KEY_CTR, { ts: Date.now(), n: n });
            setCounterUI(n);
          }
        })
        .catch(function () {
          /* Si hay caché aunque sea viejo, úsalo */
          var stale = lsGet(KEY_CTR);
          if (stale && stale.n > 0) setCounterUI(stale.n);
        });
    }

    /* ─────────────────────────────────────────────────────────────
       2. PAÍS DEL VISITANTE ACTUAL (bandera dinámica)
       Fuentes:
         A) Cloudflare Trace  — gratuita, sin rate-limit, sin CORS
         B) ipapi.co          — fallback (1000 req/día free)
    ───────────────────────────────────────────────────────────── */

    /* Mapeo de nombres en español para países que Intl puede devolver
       en inglés o con nombres poco usados en BO                     */
    var COUNTRY_NAMES_ES = {
      'bo': 'Bolivia', 'ar': 'Argentina', 'br': 'Brasil', 'cl': 'Chile',
      'pe': 'Perú', 'co': 'Colombia', 'uy': 'Uruguay', 'py': 'Paraguay',
      've': 've', 'ec': 'Ecuador', 'us': 'EE.UU.', 'gb': 'Reino Unido',
      'fr': 'Francia', 'de': 'Alemania', 'es': 'España', 'it': 'Italia',
      'nl': 'Países Bajos', 'ru': 'Rusia', 'cn': 'China', 'jp': 'Japón',
      'mx': 'México', 'sg': 'Singapur', 'au': 'Australia', 'ca': 'Canadá',
      'in': 'India', 'kr': 'Corea del Sur', 'tr': 'Turquía', 'pl': 'Polonia',
      'pt': 'Portugal', 'se': 'Suecia', 'no': 'Noruega', 'fi': 'Finlandia',
      'dk': 'Dinamarca', 'be': 'Bélgica', 'ch': 'Suiza', 'at': 'Austria',
      'cz': 'República Checa', 'ua': 'Ucrania', 'ro': 'Rumanía',
      'hu': 'Hungría', 'gr': 'Grecia', 'za': 'Sudáfrica', 'ng': 'Nigeria',
      'eg': 'Egipto', 'ma': 'Marruecos', 'ke': 'Kenia', 'gh': 'Ghana',
      'sa': 'Arabia Saudita', 'ae': 'Emiratos Árabes', 'il': 'Israel',
      'id': 'Indonesia', 'th': 'Tailandia', 'vn': 'Vietnam', 'ph': 'Filipinas',
      'my': 'Malasia', 'pk': 'Pakistán', 'bd': 'Bangladés', 'lk': 'Sri Lanka',
      'nz': 'Nueva Zelanda', 'mx': 'México', 'cr': 'Costa Rica',
      'gt': 'Guatemala', 'cu': 'Cuba', 'do': 'Rep. Dominicana',
      'pa': 'Panamá', 'hn': 'Honduras', 'sv': 'El Salvador', 'ni': 'Nicaragua'
    };

    function countryDisplayName(code) {
      var lower = (code || '').toLowerCase();
      if (COUNTRY_NAMES_ES[lower]) return COUNTRY_NAMES_ES[lower];
      /* Fallback a Intl.DisplayNames */
      try {
        var n = new Intl.DisplayNames(['es'], { type: 'region' }).of(lower.toUpperCase());
        return n || lower.toUpperCase();
      } catch (e) { return lower.toUpperCase(); }
    }

    function renderVisitorFlag(codeRaw) {
      if (!countryEl || !codeRaw) return;
      var code = codeRaw.toLowerCase().trim();
      if (!code || code === 'undefined' || code === 'null' || code.length !== 2) return;
      var name = countryDisplayName(code);
      var img = countryEl.querySelector('.hdr-stat-flag');
      if (img) {
        img.src = 'https://flagcdn.com/w40/' + code + '.png';
        img.srcset = 'https://flagcdn.com/w40/' + code + '.png 1x, https://flagcdn.com/w80/' + code + '.png 2x';
        img.alt = name;
        img.loading = 'eager';
      }
      countryEl.setAttribute('data-tip', 'Visitando desde ' + name);
      countryEl.setAttribute('aria-label', 'Visitando desde ' + name);
      countryEl.hidden = false;
    }

    function loadVisitorCountry() {
      var cached = lsGet(KEY_GEO);
      /* Muestra inmediatamente el caché mientras refresca en background */
      if (cached && cached.code) {
        renderVisitorFlag(cached.code);
      }
      /* Si caché es fresco, no hace fetch pero igual muestra */
      if (isFresh(cached, TTL_GEO) && cached.code) return;

      /* Fuente A: Cloudflare Trace — responde en texto plano key=value,
         sin CORS, sin auth, sin rate-limit, devuelve campo "loc" en mayúsculas */
      fetch('https://1.1.1.1/cdn-cgi/trace', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('cf-' + r.status); return r.text(); })
        .then(function (text) {
          var map = {};
          text.split('\n').forEach(function (line) {
            var idx = line.indexOf('=');
            if (idx > 0) map[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
          });
          var code = (map.loc || '').toLowerCase();
          if (!code || code.length !== 2) throw new Error('cf-no-loc');
          lsSet(KEY_GEO, { ts: Date.now(), code: code, ip: map.ip || '' });
          renderVisitorFlag(code);
        })
        .catch(function () {
          /* Fuente B: ipapi.co */
          fetch(geoUrl, { cache: 'no-store', headers: { 'Accept': 'application/json' } })
            .then(function (r) { if (!r.ok) throw new Error('ipapi-' + r.status); return r.json(); })
            .then(function (data) {
              if (data && data.error) throw new Error('ipapi-error');
              var code = (data.country_code || data.country || '').toLowerCase();
              if (!code || code.length !== 2) throw new Error('ipapi-no-code');
              lsSet(KEY_GEO, { ts: Date.now(), code: code, ip: data.ip || '' });
              renderVisitorFlag(code);
            })
            .catch(function () {
              /* Nada que hacer — la bandera simplemente no se muestra */
            });
        });
    }

    /* ─────────────────────────────────────────────────────────────
       3. TOP PAÍSES (banderas en el header)
       Fuente única: stats.json (generado por GitHub Action desde
       la API privada de GoatCounter con el token del servidor)
    ───────────────────────────────────────────────────────────── */
    function renderTop5Countries(countries) {
      if (!countries || countries.length < 1) return;
      if (!statsEl) return;

      var old = document.getElementById('lgc-top5');
      if (old) old.remove();

      var wrap = document.createElement('span');
      wrap.id = 'lgc-top5';
      wrap.setAttribute('aria-label', 'Top países visitantes');
      wrap.style.cssText = [
        'display:inline-flex',
        'align-items:center',
        'gap:5px',
        'margin-left:6px',
        'padding-left:8px',
        'border-left:1px solid var(--border)',
        'flex-wrap:nowrap'
      ].join(';');

      var shown = 0;
      countries.forEach(function (c) {
        if (shown >= 5) return;
        var code = (c.id || c.country_code || '').toLowerCase().trim();
        if (!code || code.length !== 2) return;

        var name = c.name || countryDisplayName(code);
        /* Normaliza nombres en inglés que vienen de GoatCounter */
        var nameEs = countryDisplayName(code);
        var hits = parseInt(c.count || c.hits || 0, 10);

        var item = document.createElement('span');
        item.style.cssText = [
          'display:inline-flex',
          'align-items:center',
          'gap:3px',
          'font-size:.7rem',
          'color:var(--text3)',
          'white-space:nowrap',
          'cursor:default'
        ].join(';');
        item.setAttribute('data-tip', nameEs + ': ' + hits + (hits === 1 ? ' visita' : ' visitas'));
        item.setAttribute('aria-label', nameEs + ': ' + hits + ' visitas');

        var flag = document.createElement('img');
        flag.src = 'https://flagcdn.com/w20/' + code + '.png';
        flag.srcset = 'https://flagcdn.com/w20/' + code + '.png 1x, https://flagcdn.com/w40/' + code + '.png 2x';
        flag.alt = nameEs;
        flag.width = 18;
        flag.height = 12;
        flag.style.cssText = 'border-radius:2px;object-fit:cover;flex-shrink:0;vertical-align:middle';
        flag.loading = 'eager';

        var count = document.createElement('span');
        count.style.cssText = [
          'font-family:var(--font-m,monospace)',
          'font-size:.68rem',
          'font-weight:600',
          'color:var(--text2)'
        ].join(';');
        count.textContent = hits;

        item.appendChild(flag);
        item.appendChild(count);
        wrap.appendChild(item);
        shown++;
      });

      if (shown === 0) return;

      /* Inserta después del separador o al final del contenedor */
      var sep = statsEl.querySelector('.hdr-stat-sep');
      if (sep) sep.insertAdjacentElement('afterend', wrap);
      else statsEl.appendChild(wrap);
    }

    function loadTop5Countries() {
      var cached = lsGet(KEY_CTOP);
      /* Renderiza caché inmediatamente */
      if (cached && cached.data && cached.data.length > 0) {
        renderTop5Countries(cached.data);
      }
      /* Si es fresco, no refresca */
      if (isFresh(cached, TTL_COUNTRIES) && cached.data && cached.data.length > 0) return;

      fetch(STATS_URL + '?_=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('stats-' + r.status); return r.json(); })
        .then(function (data) {
          var countries = (data && Array.isArray(data.countries) && data.countries.length > 0)
            ? data.countries
            : null;
          if (!countries) throw new Error('no-countries');
          /* Ordena por count descendente (el Action ya los ordena, pero por si acaso) */
          countries = countries.slice().sort(function (a, b) {
            return (parseInt(b.count, 10) || 0) - (parseInt(a.count, 10) || 0);
          });
          lsSet(KEY_CTOP, { ts: Date.now(), data: countries });
          renderTop5Countries(countries);
        })
        .catch(function () {
          /* Usa caché aunque esté vencido */
          var stale = lsGet(KEY_CTOP);
          if (stale && stale.data && stale.data.length > 0) {
            renderTop5Countries(stale.data);
          }
        });
    }

    /* ─────────────────────────────────────────────────────────────
       4. INIT — dispara todo en paralelo
    ───────────────────────────────────────────────────────────── */
    function init() {
      injectGoatScript();
      loadCounter();
      loadVisitorCountry();
      loadTop5Countries();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }

  })(); /* fin bloque contador + banderas */

  /* ─────────────────────────────────────────────
     SCROLL REVEAL
  ───────────────────────────────────────────── */
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

  /* ─────────────────────────────────────────────
     COUNTER ANIMATION (hero stats)
  ───────────────────────────────────────────── */
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

  /* ─────────────────────────────────────────────
     STATS DESDE BLOGGER FEED (JSONP)
     — artículos, categorías, recursos
  ───────────────────────────────────────────── */
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
      var n = (d.feed && d.feed.openSearch$totalResults)
        ? parseInt(d.feed.openSearch$totalResults.$t, 10) : 0;
      setStat('stat-articulos', n);
    });

    loadFeed('/-/Recursos?max-results=0', function (d) {
      var n = (d.feed && d.feed.openSearch$totalResults)
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
      var mainLabels = ['Derecho', 'Catastro', 'GIS', 'Geomática', 'Ordenamiento', 'Tecnología'];
      var active = 0;
      mainLabels.forEach(function (l) { if (labels[l]) active++; });
      setStat('stat-especialidades', Math.max(active, 1));
    });
  })();

  /* ─────────────────────────────────────────────
     LOAD FEED GRID (páginas de temáticas)
  ───────────────────────────────────────────── */
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
          '<div class="pc-ft">' +
          '<a class="pc-read" href="' + postUrl + '" target="_blank" rel="noopener">' +
          'Leer en el blog <i class="fa-solid fa-arrow-right"></i></a>' +
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
    var pageLabel = document.body.getAttribute('data-feed-label');
    if (pageLabel) loadFeedGrid(pageLabel, 'topic-posts-grid', 'def', 6);
  });

  /* ─────────────────────────────────────────────
     SEARCH MODAL → redirige a Blogger
  ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var overlay = document.getElementById('srch-overlay');
    var input = document.getElementById('srch-modal-input');
    var openBtn = document.getElementById('srch-open-btn');
    var closeBtn = document.getElementById('srch-modal-close');
    if (!overlay || !input) return;

    function openSearch() { overlay.classList.add('open'); input.focus(); }
    function closeSearch() { overlay.classList.remove('open'); }
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    });
  });

  /* ─────────────────────────────────────────────
     CONTACT FORM → abre cliente de mail
  ───────────────────────────────────────────── */
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