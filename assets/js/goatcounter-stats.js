(function () {
    'use strict';

    var GC_BASE = 'https://lexgeocat.goatcounter.com';
    var FLAG_CDN = 'https://flagcdn.com/16x12/';
    var REFRESH_MS = 15 * 60 * 1000;

    // países reales de tu audiencia — actualiza este array desde tu dashboard de GoatCounter
    var KNOWN_COUNTRIES = [
        { id: 'BO', count: null },
        { id: 'AR', count: null },
        { id: 'PE', count: null },
        { id: 'MX', count: null },
        { id: 'ES', count: null }
    ];

    var COUNTRY_ES = {
        BO: 'Bolivia', AR: 'Argentina', CL: 'Chile', PE: 'Perú', CO: 'Colombia',
        MX: 'México', ES: 'España', US: 'Estados Unidos', BR: 'Brasil', EC: 'Ecuador',
        PY: 'Paraguay', UY: 'Uruguay', VE: 'Venezuela', PA: 'Panamá', CR: 'Costa Rica',
        GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador', NI: 'Nicaragua', CU: 'Cuba',
        DO: 'Rep. Dominicana', PR: 'Puerto Rico', DE: 'Alemania', FR: 'Francia',
        IT: 'Italia', GB: 'Reino Unido', PT: 'Portugal', NL: 'Países Bajos', RU: 'Rusia',
        CN: 'China', JP: 'Japón', KR: 'Corea del Sur', IN: 'India', AU: 'Australia',
        CA: 'Canadá', ZA: 'Sudáfrica', NG: 'Nigeria', EG: 'Egipto', SG: 'Singapur'
    };

    var CACHE_KEY = 'gc_data_v2';
    var CACHE_TTL = 12 * 60 * 1000;

    function cacheGet() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var obj = JSON.parse(raw);
            if (Date.now() - obj.ts > CACHE_TTL) { sessionStorage.removeItem(CACHE_KEY); return null; }
            return obj;
        } catch (e) { return null; }
    }

    function cacheSet(views, flagsHtml) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                ts: Date.now(),
                views: views,
                flags: flagsHtml
            }));
        } catch (e) { }
    }

    function countryName(code) {
        return COUNTRY_ES[code] || code;
    }

    function setViewsText(val) {
        ['gc-total-views', 'mob-gc-views'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = val;
        });
    }

    function setFlagsHtml(html) {
        ['gc-flags-wrap', 'mob-gc-flags'].forEach(function (id) {
            var wrap = document.getElementById(id);
            if (!wrap) return;
            wrap.innerHTML = html;
            attachTips(wrap);
        });
    }

    function buildFlagsHtml(countries) {
        var html = '';
        countries.slice(0, 5).forEach(function (c) {
            var code = c.id.toUpperCase();
            var label = countryName(code) + (c.count ? ': ' + Number(c.count).toLocaleString('es-BO') + ' vistas' : '');
            html +=
                '<span class="gc-flag-item" data-tip="' + label + '">' +
                '<img class="gc-flag-img" src="' + FLAG_CDN + code.toLowerCase() + '.png"' +
                ' alt="' + countryName(code) + '" width="16" height="12" loading="lazy">' +
                '</span>';
        });
        html +=
            '<a class="gc-flag-item gc-more-stats" href="' + GC_BASE + '/"' +
            ' target="_blank" rel="noopener" data-tip="Ver estadísticas">' +
            '<i class="fa-solid fa-chart-simple"></i></a>';
        return html;
    }

    // endpoint público — sin auth, sin preflight, funciona en todos los navegadores
    function fetchPublicViews(cb) {
        fetch(GC_BASE + '/counter//.json', {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
        })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) {
                cb((data && typeof data.count === 'number') ? data.count : null);
            })
            .catch(function () { cb(null); });
    }

    // intenta fetch autenticado (funciona en desktop); si falla cae al público
    function fetchViews(cb) {
        fetch(GC_BASE + '/api/v0/stats/total?start=2024-01-01T00%3A00%3A00Z&end=' + encodeURIComponent(new Date().toISOString()), {
            method: 'GET',
            headers: { 'Authorization': 'Bearer 12ho0qypjqrv516mxxmvjjuj9b1v35tklso1s9j1dyckggebqn1' },
            credentials: 'omit'
        })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) {
                cb((data && typeof data.total === 'number') ? data.total : null);
            })
            .catch(function () {
                // desktop falló (429 / CORS) — usar público
                fetchPublicViews(cb);
            });
    }

    // intenta fetch autenticado para locations; si falla, devuelve array hardcodeado
    function fetchLocations(cb) {
        var end = encodeURIComponent(new Date().toISOString());
        fetch(GC_BASE + '/api/v0/stats/locations?limit=6&start=2024-01-01T00%3A00%3A00Z&end=' + end, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer 12ho0qypjqrv516mxxmvjjuj9b1v35tklso1s9j1dyckggebqn1' },
            credentials: 'omit'
        })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) {
                var stats = (data && Array.isArray(data.stats)) ? data.stats : [];
                cb(stats.length ? stats : KNOWN_COUNTRIES);
            })
            .catch(function () {
                // sin API — usar países hardcodeados para que las banderas aparezcan siempre
                cb(KNOWN_COUNTRIES);
            });
    }

    var _tip = null;

    function showTip(item) {
        hideTip();
        var t = document.createElement('div');
        t.className = 'gc-tooltip';
        t.textContent = item.getAttribute('data-tip');
        t.style.cssText = 'visibility:hidden;position:fixed;z-index:99999';
        document.body.appendChild(t);
        var r = item.getBoundingClientRect();
        var left = r.left + r.width / 2 - t.offsetWidth / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - t.offsetWidth - 8));
        var top = r.bottom + 7;
        if (top + t.offsetHeight > window.innerHeight) top = r.top - t.offsetHeight - 7;
        t.style.left = left + 'px';
        t.style.top = top + 'px';
        t.style.visibility = 'visible';
        _tip = t;
    }

    function hideTip() {
        if (_tip) { _tip.remove(); _tip = null; }
    }

    document.addEventListener('click', hideTip);
    document.addEventListener('scroll', hideTip, { passive: true });

    function attachTips(container) {
        container.querySelectorAll('.gc-flag-item[data-tip]').forEach(function (item) {
            item.addEventListener('mouseenter', function () { showTip(item); });
            item.addEventListener('mouseleave', hideTip);
            item.addEventListener('click', function (e) {
                if (item.tagName === 'A') return;
                e.stopPropagation();
                _tip ? hideTip() : showTip(item);
            });
        });
    }

    function buildDesktopSkeleton() {
        var el = document.getElementById('gc-stats-widget');
        if (!el) return;
        el.innerHTML =
            '<span class="gc-stat-item">' +
            '<i class="fa-solid fa-eye"></i>' +
            '<span class="gc-val" id="gc-total-views">—</span>' +
            '<span class="gc-lbl">vistas</span>' +
            '</span>' +
            '<span class="gc-sep">|</span>' +
            '<span class="gc-stat-item" id="gc-flags-wrap"></span>';
    }

    function waitForElement(id, cb, maxMs) {
        if (document.getElementById(id)) { cb(); return; }
        var elapsed = 0;
        var t = setInterval(function () {
            elapsed += 60;
            if (document.getElementById(id)) { clearInterval(t); cb(); return; }
            if (elapsed >= (maxMs || 4000)) { clearInterval(t); cb(); }
        }, 60);
    }

    function loadData() {
        var cached = cacheGet();
        if (cached) {
            setViewsText(cached.views);
            setFlagsHtml(cached.flags);
            return;
        }

        // primero banderas (hardcoded inmediato si API falla) — visible sin esperar red
        fetchLocations(function (countries) {
            var html = buildFlagsHtml(countries);
            setFlagsHtml(html);
            // vistas después — no solapar requests
            setTimeout(function () {
                fetchViews(function (n) {
                    var fmt = (n !== null) ? Number(n).toLocaleString('es-BO') : '—';
                    setViewsText(fmt);
                    cacheSet(fmt, html);
                });
            }, 400);
        });
    }

    function init() {
        buildDesktopSkeleton();
        waitForElement('mob-gc-views', loadData, 4000);
        setInterval(function () {
            sessionStorage.removeItem(CACHE_KEY);
            loadData();
        }, REFRESH_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();