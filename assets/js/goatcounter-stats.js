(function () {
    'use strict';

    var GC_SITE = 'lexgeocat';
    var GC_BASE = 'https://' + GC_SITE + '.goatcounter.com';
    var GC_TOKEN = '12ho0qypjqrv516mxxmvjjuj9b1v35tklso1s9j1dyckggebqn1';
    var REFRESH_MS = 5 * 60 * 1000;
    var FLAG_CDN = 'https://flagcdn.com/16x12/';

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

    function countryName(code) {
        return COUNTRY_ES[code] || code;
    }

    function isoNow() {
        return new Date().toISOString().replace('.000Z', 'Z').replace(/\.\d{3}Z$/, 'Z');
    }

    function dateRange() {
        return 'start=' + encodeURIComponent('2024-01-01T00:00:00Z') +
            '&end=' + encodeURIComponent(isoNow());
    }

    // fetch con token — usado solo donde CORS no es problema (browsers desktop normales).
    // En móvil Safari/Chrome el preflight OPTIONS puede fallar; por eso tenemos fallback.
    function apiFetch(path, cb, errCb) {
        var sep = path.indexOf('?') >= 0 ? '&' : '?';
        var url = GC_BASE + '/api/v0' + path + sep + dateRange();
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + GC_TOKEN,
                'Content-Type': 'application/json'
            }
        })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(cb)
            .catch(function (e) {
                console.warn('[GC] apiFetch falló (' + e.message + '), intentando fallback');
                if (typeof errCb === 'function') errCb(e);
            });
    }

    // Fallback: endpoint público /counter/<path>.json — sin auth, sin CORS preflight.
    // Devuelve { count, count_unique } para la ruta raíz del sitio.
    function fetchPublicCounter(cb) {
        var url = GC_BASE + '/counter//.json';
        fetch(url, { method: 'GET' })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(cb)
            .catch(function (e) {
                console.warn('[GC] fetchPublicCounter falló:', e.message);
                // último recurso: mostrar guión
                setViewsText('—');
            });
    }

    // JSONP fallback para entornos que bloquean fetch cross-origin con credenciales.
    function jsonpFetch(path, cb) {
        var cbName = '__gc_' + Math.random().toString(36).slice(2, 10);
        var sep = path.indexOf('?') >= 0 ? '&' : '?';
        var url = GC_BASE + '/api/v0' + path + sep + dateRange() + '&callback=' + cbName;
        var timeout;

        window[cbName] = function (data) {
            clearTimeout(timeout);
            try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
            var s = document.getElementById('_gc_jsonp_' + cbName);
            if (s) s.parentNode.removeChild(s);
            cb(data);
        };

        timeout = setTimeout(function () {
            try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        }, 8000);

        var s = document.createElement('script');
        s.id = '_gc_jsonp_' + cbName;
        s.src = url;
        s.onerror = function () {
            clearTimeout(timeout);
            try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        };
        document.head.appendChild(s);
    }

    function setViewsText(val) {
        var els = [
            document.getElementById('gc-total-views'),
            document.getElementById('mob-gc-views')
        ];
        els.forEach(function (el) { if (el) el.textContent = val; });
    }

    function renderFlags(stats) {
        var html = '';
        var shown = 0;

        for (var i = 0; i < stats.length && shown < 5; i++) {
            var loc = stats[i];
            var raw = (loc.id || '').toUpperCase();
            var code = raw.slice(0, 2);
            if (!/^[A-Z]{2}$/.test(code)) continue;
            var views = (loc.count || 0).toLocaleString('es-BO');
            var label = countryName(code) + ': ' + views + ' vistas';
            html +=
                '<span class="gc-flag-item" data-tip="' + label + '">' +
                '<img class="gc-flag-img"' +
                ' src="' + FLAG_CDN + code.toLowerCase() + '.png"' +
                ' alt="' + countryName(code) + '"' +
                ' width="16" height="12" loading="lazy">' +
                '</span>';
            shown++;
        }

        html +=
            '<a class="gc-flag-item gc-more-stats"' +
            ' href="' + GC_BASE + '/"' +
            ' target="_blank" rel="noopener"' +
            ' data-tip="Ver más estadísticas">' +
            '<i class="fa-solid fa-chart-simple"></i>' +
            '</a>';

        var targets = [
            document.getElementById('gc-flags-wrap'),
            document.getElementById('mob-gc-flags')
        ];
        targets.forEach(function (wrap) {
            if (!wrap) return;
            wrap.innerHTML = html;
            attachTips(wrap);
        });
    }

    var _tip = null;

    function showTip(item) {
        hideTip();
        var t = document.createElement('div');
        t.className = 'gc-tooltip';
        t.textContent = item.getAttribute('data-tip');
        t.style.visibility = 'hidden';
        t.style.position = 'fixed';
        document.body.appendChild(t);
        var r = item.getBoundingClientRect();
        var tw = t.offsetWidth;
        var th = t.offsetHeight;
        var left = r.left + r.width / 2 - tw / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
        var top = r.bottom + 7;
        if (top + th > window.innerHeight) top = r.top - th - 7;
        t.style.left = left + 'px';
        t.style.top = top + 'px';
        t.style.visibility = 'visible';
        _tip = t;
        item._tip = t;
    }

    function hideTip() {
        if (_tip) { _tip.remove(); _tip = null; }
    }

    document.addEventListener('click', hideTip);
    document.addEventListener('scroll', hideTip, { passive: true });

    function attachTips(container) {
        if (!container) return;
        container.querySelectorAll('.gc-flag-item[data-tip]').forEach(function (item) {
            item.addEventListener('mouseenter', function () { showTip(item); });
            item.addEventListener('mouseleave', hideTip);
            item.addEventListener('click', function (e) {
                if (item.tagName === 'A') return;
                e.stopPropagation();
                item._tip ? hideTip() : showTip(item);
            });
        });
    }

    function updateViews() {
        apiFetch('/stats/total', function (data) {
            var n = (data && typeof data.total === 'number') ? data.total : 0;
            setViewsText(n.toLocaleString('es-BO'));
        }, function () {
            // CORS falló — intentar endpoint público
            fetchPublicCounter(function (data) {
                var n = (data && typeof data.count === 'number') ? data.count : 0;
                setViewsText(n.toLocaleString('es-BO'));
            });
        });
    }

    function updateFlags() {
        apiFetch('/stats/locations?limit=6', function (data) {
            var stats = (data && Array.isArray(data.stats)) ? data.stats : [];
            if (stats.length) renderFlags(stats);
        }, function () {
            // apiFetch falló (CORS móvil) — no hay endpoint público para locations,
            // mostrar al menos la bandera de Bolivia como placeholder
            renderFlags([{ id: 'BO', count: 0 }]);
        });
    }

    function waitForElement(id, cb, maxWait) {
        var el = document.getElementById(id);
        if (el) { cb(el); return; }
        var elapsed = 0;
        var interval = 50;
        var timer = setInterval(function () {
            elapsed += interval;
            el = document.getElementById(id);
            if (el) { clearInterval(timer); cb(el); return; }
            if (elapsed >= (maxWait || 3000)) {
                clearInterval(timer);
                console.warn('[GC] elemento #' + id + ' no encontrado en DOM');
            }
        }, interval);
    }

    function buildDesktopWidget() {
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

    function init() {
        buildDesktopWidget();

        // esperar a que layout.js haya inyectado mob-gc-views y mob-gc-flags
        waitForElement('mob-gc-views', function () {
            updateViews();
            updateFlags();
        }, 4000);

        // también disparar sin esperar — si desktop widget ya existe, no pierde nada
        updateViews();
        updateFlags();

        setInterval(function () {
            updateViews();
            updateFlags();
        }, REFRESH_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();