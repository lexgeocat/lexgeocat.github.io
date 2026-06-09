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

    // Redondea a hora en punto, formato requerido por la API
    function toHour(d) {
        var r = new Date(d);
        r.setUTCMinutes(0, 0, 0);
        // GoatCounter requiere exactamente este formato sin milisegundos
        return r.toISOString().replace('.000Z', 'Z');
    }

    function dateRange() {
        return 'start=' + encodeURIComponent('2024-01-01T00:00:00Z') +
            '&end=' + encodeURIComponent(toHour(new Date()));
    }

    // ── Tooltip ──────────────────────────────────────────────────────────────
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
    // Usa el endpoint PÚBLICO /counter//.json (no requiere auth, CORS abierto).
    // Requiere "Allow adding visitor counts on your website" activo en Settings.
    function updateViews() {
        fetch(GC_BASE + '/counter//.json', { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.json();
            })
            .then(function (data) {
                var el = document.getElementById('gc-total-views');
                if (!el) return;
                // data.count es string formateado "1,234" — lo mostramos directo
                el.textContent = data.count || '0';
            })
            .catch(function (e) {
                console.warn('[GC] vistas:', e.message,
                    '— activa "Allow visitor counts" en GoatCounter Settings');
            });
    }

    // ── Banderas de países ────────────────────────────────────────────────────
    // Usa la API REST con Bearer token.
    // El campo `id` en /stats/locations es el código ISO-2 ("BO", "AR"...).
    // El campo `name` es el nombre display ("Bolivia").
    function updateFlags() {
        var url = GC_BASE + '/api/v0/stats/locations?limit=8&' + dateRange();
        fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + GC_TOKEN,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        })
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.json();
            })
            .then(function (data) {
                var wrap = document.getElementById('gc-flags-wrap');
                if (!wrap) return;
                var stats = (data && Array.isArray(data.stats)) ? data.stats : [];
                if (!stats.length) return;

                var html = '';
                stats.forEach(function (loc) {
                    // id viene como "BO", "AR", etc. — tomar primeros 2 chars por si lleva región
                    var raw = (loc.id || '').toUpperCase();
                    var code = raw.slice(0, 2);
                    if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return;
                    var views = (loc.count || 0).toLocaleString('es-BO');
                    var label = countryName(code) + ': ' + views + ' vistas';
                    html += '<span class="gc-flag-item" data-tip="' + label + '">' +
                        '<img class="gc-flag-img" src="' + FLAG_CDN + code.toLowerCase() + '.png"' +
                        ' alt="' + countryName(code) + '" width="16" height="12" loading="lazy">' +
                        '</span>';
                });
                if (html) {
                    wrap.innerHTML = html;
                    wrap.querySelectorAll('.gc-flag-item').forEach(function (item) {
                        item.addEventListener('mouseenter', function () { showTip(item); });
                        item.addEventListener('mouseleave', hideTip);
                        item.addEventListener('click', function (e) {
                            e.stopPropagation();
                            item._tip ? hideTip() : showTip(item);
                        });
                    });
                }
            })
            .catch(function (e) {
                // Silencio — si CORS falla las banderas simplemente no aparecen
                console.warn('[GC] banderas:', e.message);
            });
    }

    // ── Widget ────────────────────────────────────────────────────────────────
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