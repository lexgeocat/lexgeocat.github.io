(function () {
    'use strict';

    var GC_API = 'https://lexgeocat.goatcounter.com/api/v0';
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
        HU: 'Hungría', RO: 'Rumanía', TR: 'Turquía', IL: 'Israel', SA: 'Arabia Saudita',
        AE: 'Emiratos Árabes', TH: 'Tailandia', VN: 'Vietnam', PH: 'Filipinas',
        ID: 'Indonesia', MY: 'Malasia', PK: 'Pakistán', BD: 'Bangladés', UA: 'Ucrania',
    };

    function countryName(code) {
        return COUNTRY_ES[code] || code;
    }

    function flagImg(code) {
        var lower = code.toLowerCase();
        return '<img class="gc-flag-img" src="' + FLAG_CDN + lower + '.png"' +
            ' alt="' + countryName(code) + '" width="16" height="12" loading="lazy">';
    }

    // Redondea Date a la hora en punto y devuelve string ISO UTC requerido por la API
    function toHour(d) {
        var r = new Date(d);
        r.setUTCMinutes(0, 0, 0);
        return r.toISOString().replace(/\.\d{3}Z$/, 'Z');
    }

    // Rango: desde el primer día del sitio (2024-01-01 suficiente) hasta ahora
    function dateRange() {
        var end = toHour(new Date());
        var start = '2024-01-01T00:00:00Z';
        return 'start=' + encodeURIComponent(start) + '&end=' + encodeURIComponent(end);
    }

    function gcFetch(path, cb) {
        var sep = path.indexOf('?') >= 0 ? '&' : '?';
        var url = GC_API + path + sep + dateRange();
        fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + GC_TOKEN,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        })
            .then(function (r) { return r.ok ? r.json() : r.json().then(function (e) { throw e; }); })
            .then(cb)
            .catch(function (e) { console.warn('[GC]', e); });
    }

    // ── Tooltip ──────────────────────────────────────────────
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
        var vw = window.innerWidth;
        var GAP = 7;

        var left = r.left + r.width / 2 - tw / 2;
        left = Math.max(8, Math.min(left, vw - tw - 8));

        // Preferir abajo (el widget está en el header fijo en el tope)
        var top = r.bottom + GAP;
        if (top + th > window.innerHeight) top = r.top - th - GAP;

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

    // ── Actualización de datos ────────────────────────────────
    function updateViews() {
        gcFetch('/stats/total', function (data) {
            var el = document.getElementById('gc-total-views');
            if (!el) return;
            var total = (data && typeof data.total === 'number') ? data.total : 0;
            el.textContent = total.toLocaleString('es-BO');
        });
    }

    function updateFlags() {
        gcFetch('/stats/locations?limit=8', function (data) {
            var wrap = document.getElementById('gc-flags-wrap');
            if (!wrap) return;
            var stats = (data && Array.isArray(data.stats)) ? data.stats : [];
            if (!stats.length) return;

            var html = '';
            stats.forEach(function (loc) {
                var code = (loc.id || '').toUpperCase().slice(0, 2);
                if (code.length !== 2) return;
                var views = (loc.count || 0).toLocaleString('es-BO');
                html += '<span class="gc-flag-item" data-tip="' +
                    countryName(code) + ': ' + views + ' vistas">' +
                    flagImg(code) + '</span>';
            });
            wrap.innerHTML = html;

            wrap.querySelectorAll('.gc-flag-item').forEach(function (item) {
                item.addEventListener('mouseenter', function () { showTip(item); });
                item.addEventListener('mouseleave', hideTip);
                item.addEventListener('click', function (e) {
                    e.stopPropagation();
                    item._tip ? hideTip() : showTip(item);
                });
            });
        });
    }

    // ── Init ─────────────────────────────────────────────────
    function buildWidget() {
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