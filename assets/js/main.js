(function () {
  'use strict';

  var CFG = window.LGC_CONFIG || {};

  /* ─── HERO PARALLAX ─── */
  document.addEventListener('DOMContentLoaded', function () {
    var bgMap = document.querySelector('.hero-bg-map');
    if (!bgMap) return;
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth) - 0.5;
      var y = (e.clientY / window.innerHeight) - 0.5;
      bgMap.style.transform = 'translate(' + (x * 30) + 'px, ' + (y * 30) + 'px)';
    });
  });

  /* ─── PRELOADER ─── */
  function hideLoader() {
    var l = document.getElementById('ld');
    if (l) l.classList.add('hide');
  }
  window.addEventListener('load', function () { setTimeout(hideLoader, 350); });
  setTimeout(hideLoader, 4500);

  /* ─── THEME ─── */
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

  /* ─── HEADER SCROLL ─── */
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    var hdr = document.getElementById('hdr');
    var nav = document.getElementById('nav-bar');
    var top = document.getElementById('top');
    if (hdr) { if (y > 30) hdr.classList.add('scrolled'); else hdr.classList.remove('scrolled'); }
    if (nav) { if (y > lastY && y > 200) nav.classList.add('hidden'); else nav.classList.remove('hidden'); }
    if (top) { if (y > 600) top.classList.add('show'); else top.classList.remove('show'); }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('DOMContentLoaded', function () {
    var t = document.getElementById('top');
    if (t) t.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });

  /* ─── MOBILE MENU ─── */
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

    /* dropdown móvil — manejar múltiples si existen */
    menu.querySelectorAll('.mob-dropdown').forEach(function (drop) {
      var btn = drop.querySelector('.mob-dropbtn');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        /* Cerrar otros abiertos */
        menu.querySelectorAll('.mob-dropdown.active').forEach(function (d) {
          if (d !== drop) d.classList.remove('active');
        });
        drop.classList.toggle('active');
      });
    });
  });

  /* ═══════════════════════════════════════════════════════════════
     CONTADOR + BANDERAS — reescrito completamente
     ─────────────────────────────────────────────────────────────
     ARQUITECTURA (cliente-only, sin API GoatCounter):
       • stats.json  → único origen de datos (generado cada hora por
                        GitHub Action con el token en Secrets)
       • Cloudflare Trace → país del visitante actual (sin CORS, sin auth)
       • ipapi.co         → fallback geo
       • Auto-refresh     → cada LGC_STATS_INTERVAL ms (default 10 min)
     
     FIXES aplicados:
       1. refs DOM obtenidas DENTRO de init() — no en scope exterior
       2. Eliminado el fallback a /counter/TOTAL.json (bloqueaba por CORS)
       3. Auto-refresh periódico de stats.json
       4. showFlag() re-obtiene el elemento en cada llamada (sin stale refs)
       5. renderTop5() verifica que statsEl exista antes de manipular DOM
       6. Todas las operaciones de DOM envueltas en try/catch
  ═══════════════════════════════════════════════════════════════ */
  (function () {
    if (window.__lgcStatsInit) return;
    window.__lgcStatsInit = true;

    var cfg = CFG || {};
    var goatCode = cfg.goatCounterCode; /* 'cris99' — solo para inyectar el script de conteo */

    /* ── ruta a stats.json según profundidad de página ── */
    var depth = parseInt(document.body.getAttribute('data-depth') || '0', 10);
    var pre = '';
    for (var i = 0; i < depth; i++) pre += '../';
    var STATS_URL = pre + 'assets/data/stats.json';

    /* ── TTL caché localStorage ── */
    var TTL_STATS = 10 * 60 * 1000;  /* 10 min — igual al intervalo de refresh */
    var TTL_GEO = 30 * 60 * 1000;  /* 30 min */

    /* ── keys versionadas (bump V para limpiar caché vieja) ── */
    var V = 7;
    var K_STATS = 'lgc_stats_v' + V;
    var K_GEO = 'lgc_geo_v' + V;

    /* ── limpiar versiones anteriores ── */
    [1, 2, 3, 4, 5, 6].forEach(function (v) {
      ['lgc_ctr_v', 'lgc_ctop_v', 'lgc_geo_v', 'lgc_stats_v',
        'lgc_local_v', 'lgc_local_ses_v'].forEach(function (k) {
          try { localStorage.removeItem(k + v); } catch (e) { }
        });
    });

    /* ── helpers localStorage ── */
    function lsGet(k) {
      try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
    }
    function lsSet(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { }
    }
    function isFresh(cached, ttl) {
      return cached && cached.ts && (Date.now() - cached.ts) < ttl;
    }

    /* ─────────────────────────────────────────────────────────
       DOM refs — función que siempre obtiene el elemento actual
       Evita stale references si layout.js re-inserta el header
    ───────────────────────────────────────────────────────── */
    function el(id) { return document.getElementById(id); }

    /* ─────────────────────────────────────────────────────────
       MAPA iso2 → nombre en español
    ───────────────────────────────────────────────────────── */
    var NAMES_ES = {
      bo: 'Bolivia', ar: 'Argentina', br: 'Brasil', cl: 'Chile',
      pe: 'Perú', co: 'Colombia', uy: 'Uruguay', py: 'Paraguay',
      ve: 'Venezuela', ec: 'Ecuador', us: 'EE.UU.', gb: 'Reino Unido',
      fr: 'Francia', de: 'Alemania', es: 'España', it: 'Italia',
      nl: 'Países Bajos', ru: 'Rusia', cn: 'China', jp: 'Japón',
      mx: 'México', sg: 'Singapur', au: 'Australia', ca: 'Canadá',
      in: 'India', kr: 'Corea del Sur', tr: 'Turquía', pl: 'Polonia',
      pt: 'Portugal', se: 'Suecia', no: 'Noruega', fi: 'Finlandia',
      dk: 'Dinamarca', be: 'Bélgica', ch: 'Suiza', at: 'Austria',
      cz: 'Rep. Checa', ua: 'Ucrania', ro: 'Rumanía', hu: 'Hungría',
      gr: 'Grecia', za: 'Sudáfrica', ng: 'Nigeria', eg: 'Egipto',
      ma: 'Marruecos', ke: 'Kenia', sa: 'Arabia Saudita', ae: 'Emiratos Árabes',
      il: 'Israel', id: 'Indonesia', th: 'Tailandia', vn: 'Vietnam',
      ph: 'Filipinas', my: 'Malasia', nz: 'Nueva Zelanda', cr: 'Costa Rica',
      pa: 'Panamá', gt: 'Guatemala', cu: 'Cuba', do: 'Rep. Dominicana',
      hn: 'Honduras'
    };

    function nameES(code) {
      var c = (code || '').toLowerCase().trim();
      if (NAMES_ES[c]) return NAMES_ES[c];
      try {
        return new Intl.DisplayNames(['es'], { type: 'region' }).of(c.toUpperCase()) || c.toUpperCase();
      } catch (e) { return c.toUpperCase(); }
    }

    /* ─────────────────────────────────────────────────────────
       1. ACTUALIZAR CONTADOR en el DOM
    ───────────────────────────────────────────────────────── */
    function setCounter(n) {
      if (!n || n < 1) return;
      try {
        var counterEl = el('counter-dev-placeholder');
        if (!counterEl) return;
        var valueEl = counterEl.querySelector('.hdr-stat-value');
        if (valueEl) valueEl.textContent = n.toLocaleString('es');
        var lbl = (cfg.counterLabel || 'Visitas') + ': ' + n.toLocaleString('es');
        counterEl.setAttribute('data-tip', lbl);
        counterEl.setAttribute('aria-label', lbl);
      } catch (e) { }
    }

    /* ─────────────────────────────────────────────────────────
       2. MOSTRAR BANDERA del visitante actual
    ───────────────────────────────────────────────────────── */
    function showFlag(code) {
      if (!code) return;
      var c = code.toLowerCase().trim();
      if (!c || c.length !== 2) return;
      try {
        var countryEl = el('visitor-country-info');
        if (!countryEl) return;
        var name = nameES(c);
        var img = countryEl.querySelector('.hdr-stat-flag');
        if (img) {
          img.src = 'https://flagcdn.com/w40/' + c + '.png';
          img.srcset = 'https://flagcdn.com/w40/' + c + '.png 1x, https://flagcdn.com/w80/' + c + '.png 2x';
          img.alt = name;
          img.loading = 'eager';
        }
        var tip = 'Visitando desde ' + name;
        countryEl.setAttribute('data-tip', tip);
        countryEl.setAttribute('aria-label', tip);
        countryEl.hidden = false;
      } catch (e) { }
    }

    /* ─────────────────────────────────────────────────────────
       3. RENDERIZAR TOP 5 PAÍSES en el header
    ───────────────────────────────────────────────────────── */
    function renderTop5(list) {
      if (!list || !list.length) return;
      try {
        var statsEl = el('hdr-stats');
        if (!statsEl) return;

        /* Limpiar render anterior */
        var old = document.getElementById('lgc-top5');
        if (old) old.remove();

        var wrap = document.createElement('span');
        wrap.id = 'lgc-top5';
        wrap.style.cssText = [
          'display:inline-flex',
          'align-items:center',
          'gap:5px',
          'margin-left:6px',
          'padding-left:8px',
          'border-left:1px solid var(--border)'
        ].join(';');

        var shown = 0;
        list.forEach(function (country) {
          if (shown >= 5) return;
          /* GoatCounter devuelve id en MAYÚSCULAS ("BO"), convertimos */
          var code = (country.id || country.country_code || '').toLowerCase().trim();
          if (!code || code.length !== 2) return;

          var name = nameES(code);
          var hits = parseInt(country.count || 0, 10);
          if (!hits) return; /* omitir países con 0 visitas */

          var item = document.createElement('span');
          item.style.cssText = [
            'display:inline-flex',
            'align-items:center',
            'gap:3px',
            'cursor:default',
            'white-space:nowrap'
          ].join(';');
          var tip = name + ': ' + hits + (hits === 1 ? ' visita' : ' visitas');
          item.setAttribute('data-tip', tip);
          item.setAttribute('aria-label', tip);
          item.setAttribute('title', tip); /* tooltip nativo como fallback */

          var flag = document.createElement('img');
          flag.src = 'https://flagcdn.com/w20/' + code + '.png';
          flag.srcset = 'https://flagcdn.com/w20/' + code + '.png 1x, https://flagcdn.com/w40/' + code + '.png 2x';
          flag.alt = name;
          flag.width = 18;
          flag.height = 12;
          flag.loading = 'eager';
          flag.style.cssText = 'border-radius:2px;object-fit:cover;flex-shrink:0;border:1px solid var(--border)';

          /* Fallback si la bandera no carga */
          flag.onerror = function () { this.style.display = 'none'; };

          var num = document.createElement('span');
          num.style.cssText = [
            'font-family:var(--font-m,monospace)',
            'font-size:.68rem',
            'font-weight:600',
            'color:var(--text2)'
          ].join(';');
          num.textContent = hits.toLocaleString('es');

          item.appendChild(flag);
          item.appendChild(num);
          wrap.appendChild(item);
          shown++;
        });

        if (!shown) return;

        /* Insertar después del separador, o al final del bloque */
        var sep = statsEl.querySelector('.hdr-stat-sep');
        if (sep) {
          sep.insertAdjacentElement('afterend', wrap);
        } else {
          statsEl.appendChild(wrap);
        }
      } catch (e) { }
    }

    /* ─────────────────────────────────────────────────────────
       4. CARGAR stats.json
       - Muestra caché de localStorage inmediatamente (sin esperar red)
       - Siempre hace fetch en background para datos frescos
       - Llama setCounter() + renderTop5() con los datos
    ───────────────────────────────────────────────────────── */
    function applyStats(data) {
      if (!data) return;
      var n = parseInt(data.total, 10) || 0;
      if (n > 0) setCounter(n);

      var countries = data.countries;
      if (Array.isArray(countries) && countries.length) {
        /* Ordenar por count descendente (el Action ya los ordena, pero por seguridad) */
        var sorted = countries.slice().sort(function (a, b) {
          return (parseInt(b.count, 10) || 0) - (parseInt(a.count, 10) || 0);
        });
        renderTop5(sorted);
      }
    }

    function fetchStats(force) {
      fetch(STATS_URL + '?_=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          if (!data || !data.total) throw new Error('empty');
          lsSet(K_STATS, { ts: Date.now(), data: data });
          applyStats(data);
        })
        .catch(function (err) {
          /* Si falla el fetch, intenta usar caché (aunque esté vencida) */
          var stale = lsGet(K_STATS);
          if (stale && stale.data) applyStats(stale.data);
        });
    }

    function loadStats() {
      var cached = lsGet(K_STATS);
      /* Render inmediato desde caché */
      if (cached && cached.data) applyStats(cached.data);
      /* Fetch en background siempre para tener datos frescos */
      fetchStats();
    }

    /* ─────────────────────────────────────────────────────────
       5. PAÍS DEL VISITANTE ACTUAL
       Fuente A: Cloudflare Trace (sin CORS, sin auth, sin rate-limit)
       Fuente B: ipapi.co (1000 req/día free)
    ───────────────────────────────────────────────────────── */
    function loadVisitorCountry() {
      var cached = lsGet(K_GEO);
      if (cached && cached.code) showFlag(cached.code);
      if (isFresh(cached, TTL_GEO) && cached && cached.code) return;

      /* Fuente A: Cloudflare Trace */
      fetch('https://1.1.1.1/cdn-cgi/trace', { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('cf ' + r.status);
          return r.text();
        })
        .then(function (txt) {
          var map = {};
          txt.split('\n').forEach(function (line) {
            var i = line.indexOf('=');
            if (i > 0) map[line.slice(0, i).trim()] = line.slice(i + 1).trim();
          });
          var code = (map.loc || '').toLowerCase().trim();
          if (!code || code.length !== 2) throw new Error('no loc');
          lsSet(K_GEO, { ts: Date.now(), code: code });
          showFlag(code);
        })
        .catch(function () {
          /* Fuente B: ipapi.co */
          var url = cfg.geoProvider || 'https://ipapi.co/json/';
          fetch(url, {
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
          })
            .then(function (r) {
              if (!r.ok) throw new Error('ipapi ' + r.status);
              return r.json();
            })
            .then(function (d) {
              if (!d || d.error) throw new Error('geo err');
              var code = (d.country_code || d.country || '').toLowerCase().trim();
              if (!code || code.length !== 2) throw new Error('no code');
              lsSet(K_GEO, { ts: Date.now(), code: code });
              showFlag(code);
            })
            .catch(function () {
              /* Fallo silencioso — el widget de bandera simplemente no aparece */
            });
        });
    }

    /* ─────────────────────────────────────────────────────────
       6. INYECTAR SCRIPT DE CONTEO DE GoatCounter
       Usa el token "vista de paginas" (Record pageviews) vía el
       script público gc.zgo.at — NO usa el token de estadísticas.
    ───────────────────────────────────────────────────────── */
    function injectGoatCounter() {
      if (!goatCode || document.getElementById('lgc-goat-script')) return;
      var s = document.createElement('script');
      s.id = 'lgc-goat-script';
      s.async = true;
      s.setAttribute('data-goatcounter', 'https://' + goatCode + '.goatcounter.com/count');
      s.src = 'https://gc.zgo.at/count.js';
      document.body.appendChild(s);
    }

    /* ─────────────────────────────────────────────────────────
       7. AUTO-REFRESH — re-lee stats.json cada 10 minutos
       Útil para visitas largas o dashboards siempre abiertos.
       No hace ninguna llamada a la API de GoatCounter.
    ───────────────────────────────────────────────────────── */
    var REFRESH_INTERVAL = 10 * 60 * 1000; /* 10 min */
    var refreshTimer = null;

    function startAutoRefresh() {
      if (refreshTimer) clearInterval(refreshTimer);
      refreshTimer = setInterval(function () {
        fetchStats(true);
      }, REFRESH_INTERVAL);
    }

    /* Cancelar refresh cuando la pestaña está oculta, reanudar al volver */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
      } else {
        fetchStats(true);   /* fetch inmediato al volver */
        startAutoRefresh();
      }
    });

    /* ─────────────────────────────────────────────────────────
       8. INIT
    ───────────────────────────────────────────────────────── */
    function init() {
      injectGoatCounter();
      loadStats();
      loadVisitorCountry();
      startAutoRefresh();
    }

    /*
     * layout.js inyecta el HTML del header SÍNCRONAMENTE en su IIFE,
     * antes de que main.js corra (ambos están al final del <body>).
     * Por tanto el DOM ya existe cuando llegamos aquí.
     * Aún así, usamos DOMContentLoaded como red de seguridad.
     */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }

  })(); /* fin bloque stats */

  /* ─── SCROLL REVEAL ─── */
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
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) { rIO.observe(el); });
  }

  /* ─── COUNTER ANIMATION (hero stats) ─── */
  if (typeof IntersectionObserver !== 'undefined') {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var raw = el.getAttribute('data-count');
        if (!raw) return;
        var target = parseInt(raw, 10);
        if (isNaN(target)) { cIO.unobserve(el); return; }
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
    document.querySelectorAll('.hstat-n[data-count]').forEach(function (el) { cIO.observe(el); });
  }

  /* ─── STATS DESDE BLOGGER FEED ─── */
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

  /* ─── LOAD FEED GRID ─── */
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

  /* ─── SEARCH MODAL ─── */
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

  /* ─── CONTACT FORM ─── */
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