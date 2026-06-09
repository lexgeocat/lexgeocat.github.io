(function () {
    'use strict';

    var GC_API = 'https://lexgeocat.goatcounter.com/api/v0';
    var GC_TOKEN = 'e44zvv3oc6kcs8ak5auoqwdpmefvb285ljtm1x7zdd8dselbc';

    // ISO → bandera emoji
    function flag(code) {
        if (!code || code.length !== 2) return '🌐';
        return String.fromCodePoint(
            code.toUpperCase().charCodeAt(0) + 127397,
            code.toUpperCase().charCodeAt(1) + 127397
        );
    }

    // Nombres de países en español (subconjunto frecuente + fallback)
    var COUNTRY_ES = {
        BO: 'Bolivia', AR: 'Argentina', CL: 'Chile', PE: 'Perú', CO: 'Colombia',
        MX: 'México', ES: 'España', US: 'Estados Unidos', BR: 'Brasil', EC: 'Ecuador',
        PY: 'Paraguay', UY: 'Uruguay', VE: 'Venezuela', PA: 'Panamá', CR: 'Costa Rica',
        GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador', NI: 'Nicaragua', CU: 'Cuba',
        DO: 'República Dominicana', PR: 'Puerto Rico', DE: 'Alemania', FR: 'Francia',
        IT: 'Italia', GB: 'Reino Unido', PT: 'Portugal', NL: 'Países Bajos', RU: 'Rusia',
        CN: 'China', JP: 'Japón', KR: 'Corea del Sur', IN: 'India', AU: 'Australia',
        CA: 'Canadá', ZA: 'Sudáfrica', NG: 'Nigeria', EG: 'Egipto',
    };

    function countryName(code) {
        return COUNTRY_ES[code] || code;
    }

    function gcFetch(path, cb) {
        fetch(GC_API + path, {
            headers: {
                'Authorization': 'Bearer ' + GC_TOKEN,
                'Content-Type': 'application/json'
            }
        })
            .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
            .then(cb)
            .catch(function () { /* silencioso — no rompe el sitio */ });
    }

    function buildWidget() {
        var el = document.getElementById('gc-stats-widget');
        if (!el) return;

        // Esqueleto inicial
        el.innerHTML =
            '<span class="gc-stat-item gc-views">' +
            '<i class="fa-solid fa-eye"></i>' +
            '<span class="gc-val" id="gc-total-views">—</span>' +
            '<span class="gc-lbl">vistas</span>' +
            '</span>' +
            '<span class="gc-sep">|</span>' +
            '<span class="gc-stat-item gc-locs" id="gc-flags-wrap"></span>';

        // Total de pageviews (sin rango = todo el tiempo)
        gcFetch('/stats/total', function (data) {
            var total = data && data.total ? data.total : 0;
            var el = document.getElementById('gc-total-views');
            if (!el) return;
            // Formatea con separador de miles
            el.textContent = total.toLocaleString('es-BO');
        });

        // Top ubicaciones
        gcFetch('/stats/locations?limit=8', function (data) {
            var wrap = document.getElementById('gc-flags-wrap');
            if (!wrap) return;
            var stats = (data && data.stats) ? data.stats : [];
            if (!stats.length) return;

            var html = '';
            stats.forEach(function (loc) {
                // loc.id es el código ISO-2 del país
                var code = (loc.id || '').toUpperCase().slice(0, 2);
                var name = countryName(code);
                var views = (loc.count || 0).toLocaleString('es-BO');
                html +=
                    '<span class="gc-flag-item" data-tip="' + name + ': ' + views + ' vistas">' +
                    flag(code) +
                    '</span>';
            });
            wrap.innerHTML = html;

            // Tooltip hover (sin librerías)
            wrap.querySelectorAll('.gc-flag-item').forEach(function (item) {
                item.addEventListener('mouseenter', function (e) {
                    var tip = document.createElement('div');
                    tip.className = 'gc-tooltip';
                    tip.textContent = item.getAttribute('data-tip');
                    document.body.appendChild(tip);
                    var r = item.getBoundingClientRect();
                    tip.style.left = (r.left + r.width / 2 - tip.offsetWidth / 2) + 'px';
                    tip.style.top = (r.top + window.scrollY - tip.offsetHeight - 8) + 'px';
                    item._tip = tip;
                });
                item.addEventListener('mouseleave', function () {
                    if (item._tip) { item._tip.remove(); item._tip = null; }
                });
            });
        });
    }

    // Esperar a que layout.js haya inyectado el header
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildWidget);
    } else {
        buildWidget();
    }
})();