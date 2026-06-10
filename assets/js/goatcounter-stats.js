(function () {
    'use strict';

    var GC_SITE = 'lexgeocat';
    // TOKEN: regeneralo en https://lexgeocat.goatcounter.com/user/api  
    // Settings → API tokens → crear nuevo con permisos de lectura
    var GC_TOKEN = 'REEMPLAZA_CON_TOKEN_NUEVO';
    var REFRESH_MS = 5 * 60 * 1000;
    var FLAG_CDN = 'https://flagcdn.com/16x12/';
    var TIMEOUT_MS = 10000;

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

    function toHour(d) {
        var r = new Date(d);
        r.setUTCMinutes(0, 0, 0);
        return r.toISOString().replace('.000Z', 'Z');
    }

    // TOKEN en Authorization header (no en query param) — fix CORS en móvil
    // GoatCounter con token en query param NO envía headers CORS correctamente
    function apiFetch(path, cb) {
        var base = 'https://' + GC_SITE + '.goatcounter.com/api/v0';
        var sep = path.indexOf('?') >= 0 ? '&' : '?';
        var url = base + path + sep +
            'start=' + encodeURIComponent('2024-01-01T00:00:00Z') +
            '&end=' + encodeURIComponent(toHour(new Date()));

        var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var tid = setTimeout(function () {
            if (ctrl) ctrl.abort();
            cb(null);
        }, TIMEOUT_MS);

        var opts = {
            method: 'GET',
            // Authorization header en vez de query param = CORS funciona en móvil
            headers: { 'Authorization': 'Bearer ' + GC_TOKEN },
            cache: 'no-store'
        };
        if (ctrl) opts.signal = ctrl.signal;

        fetch(url, opts)
            .then(function (r) {
                clearTimeout(tid);
                if (!r.ok) {
                    console.warn('[GC] HTTP ' + r.status + ' en ' + path);
                    cb(null);
                    return null;
                }
                return r.json();
            })
            .then(function (data) {
                if (data) cb(data);
            })
            .catch(function (e) {
                clearTimeout(tid);
                // solo loguear si no es abort intencional
                if (!ctrl || e.name !== 'AbortError') {
                    console.warn('[GC] fetch falló:', e.message);
                }
                cb(null);
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
            item.addEventListener('touchend', function (e) {
                e.preventDefault();
                item._tip ? hideTip() : showTip(item);
            });
            item.addEventListener('click', function (e) {
                if (item.tagName === 'A') return;
                e.stopPropagation();
                item._tip ? hideTip() : showTip(item);
            });
        });
    }

    // retry con polling hasta que el elemento exista en el DOM
    function setWhenReady(id, setter, retries) {
        var el = document.getElementById(id);
        if (el) { setter(el); return; }
        if ((retries || 0) >= 30) return;
        setTimeout(function () { setWhenReady(id, setter, (retries || 0) + 1); }, 100);
    }

    function renderViews(fmt) {
        setWhenReady('gc-total-views', function (el) { el.textContent = fmt; });
        setWhenReady('mob-gc-views', function (el) { el.textContent = fmt; });
    }

    function renderFlags(html) {
        setWhenReady('gc-flags-wrap', function (el) { el.innerHTML = html; attachTips(el); });
        setWhenReady('mob-gc-flags', function (el) { el.innerHTML = html; attachTips(el); });
    }

    function updateViews() {
        apiFetch('/stats/total', function (data) {
            var n = (data && typeof data.total === 'number') ? data.total : 0;
            renderViews(n > 0 ? n.toLocaleString('es-BO') : '—');
        });
    }

    function updateFlags() {
        apiFetch('/stats/locations?limit=6', function (data) {
            var stats = (data && Array.isArray(data.stats)) ? data.stats : [];
            if (!stats.length) return;

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
                ' href="https://' + GC_SITE + '.goatcounter.com/"' +
                ' target="_blank" rel="noopener"' +
                ' data-tip="Ver más estadísticas">' +
                '<i class="fa-solid fa-chart-simple"></i>' +
                '</a>';

            renderFlags(html);
        });
    }

    function buildWidget() {
        var el = document.getElementById('gc-stats-widget');
        if (el) {
            el.innerHTML =
                '<span class="gc-stat-item gc-views">' +
                '<i class="fa-solid fa-eye"></i>' +
                '<span class="gc-val" id="gc-total-views">—</span>' +
                '<span class="gc-lbl">vistas</span>' +
                '</span>' +
                '<span class="gc-sep">|</span>' +
                '<span class="gc-stat-item gc-locs" id="gc-flags-wrap"></span>';
        }

        updateViews();
        updateFlags();

        setInterval(function () {
            updateViews();
            updateFlags();
        }, REFRESH_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildWidget);
    } else {
        buildWidget();
    }
})();