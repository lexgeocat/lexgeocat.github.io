(function () {
    'use strict';

    var GC_BASE = 'https://lexgeocat.goatcounter.com';
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

    // Redondea a la hora en punto, formato exacto que requiere la API de GC
    function toHour(d) {
        var r = new Date(d);
        r.setUTCMinutes(0, 0, 0);
        return r.toISOString().replace('.000Z', 'Z');
    }

    // Construye los query params de rango temporal
    function dateRange() {
        return 'start=' + encodeURIComponent('2024-01-01T00:00:00Z') +
            '&end=' + encodeURIComponent(toHour(new Date()));
    }

    // Fetch genérico contra la API REST de GoatCounter con Bearer token
    function apiFetch(path, cb) {
        // Construye la URL evitando doble '?' cuando path ya trae query params
        var sep = path.indexOf('?') >= 0 ? '&' : '?';
        var url = GC_BASE + '/api/v0' + path + sep + dateRange();

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + GC_TOKEN,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status + ' en ' + path);
                return r.json();
            })
            .then(cb)
            .catch(function (e) { console.warn('[GC]', e.message); });
    }

    // ── Tooltip ───────────────────────────────────────────────────────────────
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

    // ── Total de vistas ───────────────────────────────────────────────────────
    // /stats/total devuelve { total: N, total_utc: N }
    function updateViews() {
        apiFetch('/stats/total', function (data) {
            var el = document.getElementById('gc-total-views');
            if (!el) return;
            var n = (data && typeof data.total === 'number') ? data.total : 0;
            el.textContent = n.toLocaleString('es-BO');
        });
    }

    // ── Banderas de países ────────────────────────────────────────────────────
    // /stats/locations devuelve { stats: [{ id: "BO", name: "Bolivia", count: N }] }
    function updateFlags() {
        apiFetch('/stats/locations?limit=8', function (data) {
            var wrap = document.getElementById('gc-flags-wrap');
            if (!wrap) return;
            var stats = (data && Array.isArray(data.stats)) ? data.stats : [];
            if (!stats.length) return;

            var html = '';
            stats.forEach(function (loc) {
                // id es el código ISO-2 del país ("BO", "AR"...)
                // Si viniera con región tipo "BO-L", slice(0,2) da "BO"
                var raw = (loc.id || '').toUpperCase();
                var code = raw.slice(0, 2);
                if (!/^[A-Z]{2}$/.test(code)) return;
                var views = (loc.count || 0).toLocaleString('es-BO');
                var label = countryName(code) + ': ' + views + ' vistas';
                html +=
                    '<span class="gc-flag-item" data-tip="' + label + '">' +
                    '<img class="gc-flag-img"' +
                    ' src="' + FLAG_CDN + code.toLowerCase() + '.png"' +
                    ' alt="' + countryName(code) + '"' +
                    ' width="16" height="12" loading="lazy">' +
                    '</span>';
            });

            if (!html) return;
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

    // ── Init ──────────────────────────────────────────────────────────────────
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