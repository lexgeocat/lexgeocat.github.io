(function () {
    'use strict';

    var GC_BASE = 'https://lexgeocat.goatcounter.com';
    var GC_TOKEN = '12ho0qypjqrv516mxxmvjjuj9b1v35tklso1s9j1dyckggebqn1';
    var FLAG_CDN = 'https://flagcdn.com/16x12/';
    var REFRESH_MS = 10 * 60 * 1000; // 10 min — evita 429

    var COUNTRY_ES = {
        BO: 'Bolivia', AR: 'Argentina', CL: 'Chile', PE: 'Perú', CO: 'Colombia',
        MX: 'México', ES: 'España', US: 'Estados Unidos', BR: 'Brasil', EC: 'Ecuador',
        PY: 'Paraguay', UY: 'Uruguay', VE: 'Venezuela', PA: 'Panamá', CR: 'Costa Rica',
        GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador', NI: 'Nicaragua', CU: 'Cuba',
        DO: 'Rep. Dominicana', PR: 'Puerto Rico', DE: 'Alemania', FR: 'Francia',
        IT: 'Italia', GB: 'Reino Unido', PT: 'Portugal', NL: 'Países Bajos', RU: 'Rusia',
        CN: 'China', JP: 'Japón', KR: 'Corea del Sur', IN: 'India', AU: 'Australia',
        CA: 'Canadá', ZA: 'Sudáfrica', NG: 'Nigeria', EG: 'Egipto', SG: 'Singapur',
        CH: 'Suiza', SE: 'Suecia', NO: 'Noruega', DK: 'Dinamarca', FI: 'Finlandia',
        PL: 'Polonia', CZ: 'Rep. Checa', AT: 'Austria', BE: 'Bélgica',
        TR: 'Turquía', IL: 'Israel', UA: 'Ucrania', TH: 'Tailandia', ID: 'Indonesia'
    };

    // cache en sessionStorage — una sola request por sesión de navegación
    var CACHE_KEY_VIEWS = 'gc_views';
    var CACHE_KEY_FLAGS = 'gc_flags';
    var CACHE_TTL = 8 * 60 * 1000; // 8 min

    function cacheGet(key) {
        try {
            var raw = sessionStorage.getItem(key);
            if (!raw) return null;
            var obj = JSON.parse(raw);
            if (Date.now() - obj.ts > CACHE_TTL) { sessionStorage.removeItem(key); return null; }
            return obj.val;
        } catch (e) { return null; }
    }

    function cacheSet(key, val) {
        try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), val: val })); } catch (e) { }
    }

    function countryName(code) {
        return COUNTRY_ES[code] || code;
    }

    function isoNow() {
        return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    }

    function dateRange() {
        return 'start=' + encodeURIComponent('2024-01-01T00:00:00Z') +
            '&end=' + encodeURIComponent(isoNow());
    }

    function apiFetch(path, cb, errCb) {
        var sep = path.indexOf('?') >= 0 ? '&' : '?';
        var url = GC_BASE + '/api/v0' + path + sep + dateRange();
        fetch(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + GC_TOKEN }
        })
            .then(function (r) {
                if (r.status === 429) throw new Error('429');
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(cb)
            .catch(function (e) {
                if (typeof errCb === 'function') errCb(e);
            });
    }

    function fetchPublicCounter(cb, errCb) {
        fetch(GC_BASE + '/counter//.json', { method: 'GET' })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(cb)
            .catch(function (e) {
                if (typeof errCb === 'function') errCb(e);
            });
    }

    function setViewsText(val) {
        [
            document.getElementById('gc-total-views'),
            document.getElementById('mob-gc-views')
        ].forEach(function (el) { if (el) el.textContent = val; });
    }

    function setFlagsHtml(html) {
        [
            document.getElementById('gc-flags-wrap'),
            document.getElementById('mob-gc-flags')
        ].forEach(function (wrap) {
            if (!wrap) return;
            wrap.innerHTML = html;
            attachTips(wrap);
        });
    }

    function buildFlagsHtml(stats) {
        var html = '';
        var shown = 0;
        for (var i = 0; i < stats.length && shown < 5; i++) {
            var loc = stats[i];
            var code = (loc.id || '').toUpperCase().slice(0, 2);
            if (!/^[A-Z]{2}$/.test(code)) continue;
            var label = countryName(code) + ': ' + (loc.count || 0).toLocaleString('es-BO') + ' vistas';
            html +=
                '<span class="gc-flag-item" data-tip="' + label + '">' +
                '<img class="gc-flag-img" src="' + FLAG_CDN + code.toLowerCase() + '.png"' +
                ' alt="' + countryName(code) + '" width="16" height="12" loading="lazy">' +
                '</span>';
            shown++;
        }
        html +=
            '<a class="gc-flag-item gc-more-stats" href="' + GC_BASE + '/"' +
            ' target="_blank" rel="noopener" data-tip="Ver más estadísticas">' +
            '<i class="fa-solid fa-chart-simple"></i></a>';
        return html;
    }

    var _tip = null;

    function showTip(item) {
        hideTip();
        var t = document.createElement('div');
        t.className = 'gc-tooltip';
        t.textContent = item.getAttribute('data-tip');
        t.style.visibility = 'hidden';
        document.body.appendChild(t);
        var r = item.getBoundingClientRect();
        var left = r.left + r.width / 2 - t.offsetWidth / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - t.offsetWidth - 8));
        var top = r.bottom + 7;
        if (top + t.offsetHeight > window.innerHeight) top = r.top - t.offsetHeight - 7;
        t.style.left = left + 'px';
        t.style.top = top + 'px';
        t.style.visibility = 'visible';
        t.style.position = 'fixed';
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

    // una sola llamada, sin duplicados
    function fetchViews() {
        var cached = cacheGet(CACHE_KEY_VIEWS);
        if (cached !== null) { setViewsText(cached); return; }

        apiFetch('/stats/total', function (data) {
            var n = (data && typeof data.total === 'number') ? data.total : 0;
            var fmt = n.toLocaleString('es-BO');
            cacheSet(CACHE_KEY_VIEWS, fmt);
            setViewsText(fmt);
        }, function (e) {
            // 429 o CORS — fallback al endpoint público sin auth
            fetchPublicCounter(function (data) {
                var n = (data && typeof data.count === 'number') ? data.count : 0;
                var fmt = n.toLocaleString('es-BO');
                cacheSet(CACHE_KEY_VIEWS, fmt);
                setViewsText(fmt);
            }, function () {
                setViewsText('—');
            });
        });
    }

    function fetchFlags() {
        var cached = cacheGet(CACHE_KEY_FLAGS);
        if (cached !== null) { setFlagsHtml(cached); return; }

        apiFetch('/stats/locations?limit=6', function (data) {
            var stats = (data && Array.isArray(data.stats)) ? data.stats : [];
            if (!stats.length) return;
            var html = buildFlagsHtml(stats);
            cacheSet(CACHE_KEY_FLAGS, html);
            setFlagsHtml(html);
        }, function () {
            // sin fallback público para locations — silencioso
        });
    }

    function buildDesktopSkeleton() {
        var el = document.getElementById('gc-stats-widget');
        if (!el) return;
        el.innerHTML =
            '<span class="gc-stat-item gc-views">' +
            '<i class="fa-solid fa-eye"></i>' +
            '<span class="gc-val" id="gc-total-views">—</span>' +
            '<span class="gc-lbl">vistas</span>' +
            '</span>' +
            '<span class="gc-sep">|</span>' +
            '<span class="gc-stat-item gc-locs" id="gc-flags-wrap"></span>';
    }

    // espera a que layout.js haya inyectado los nodos móviles, luego dispara una sola vez
    function waitForMobile(cb, maxMs) {
        if (document.getElementById('mob-gc-views')) { cb(); return; }
        var elapsed = 0;
        var t = setInterval(function () {
            elapsed += 60;
            if (document.getElementById('mob-gc-views')) { clearInterval(t); cb(); return; }
            if (elapsed >= (maxMs || 3000)) { clearInterval(t); cb(); }
        }, 60);
    }

    function init() {
        buildDesktopSkeleton();
        // esperar móvil y luego disparar UNA sola vez ambas requests
        waitForMobile(function () {
            fetchViews();
            // flags 300ms después para no solapar requests al mismo servidor
            setTimeout(fetchFlags, 300);
        });

        setInterval(function () {
            fetchViews();
            setTimeout(fetchFlags, 300);
        }, REFRESH_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();