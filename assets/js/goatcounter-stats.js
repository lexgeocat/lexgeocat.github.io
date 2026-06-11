(function () {
    'use strict';

    var GC_BASE = 'https://lexgeocat.goatcounter.com';
    var GC_TOKEN = '6uv0hwk6ov2t1oaq51dj3jdng1uzl2hxzqmc3a1igzkcjtxt6aq';
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

    // Formato de fecha que acepta la API de GC: 2006-01-02T15:04:05Z (sin milisegundos)
    function fmtDate(d) {
        return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
    }

    // Rango: desde el inicio del sitio hasta ahora redondeado al minuto
    function buildRange() {
        var end = new Date();
        end.setSeconds(0, 0);
        return 'start=2024-01-01T00%3A00%3A00Z&end=' + encodeURIComponent(fmtDate(end));
    }

    // Fetch contra la API REST con Bearer token
    // NOTA: requiere que el token tenga scope de lectura y que CORS esté permitido.
    // GoatCounter permite CORS desde cualquier origen para tokens con permisos adecuados.
    function apiFetch(path, cb, errCb) {
        // Concatenar correctamente: si path ya tiene '?' usar '&', si no usar '?'
        var sep = path.indexOf('?') >= 0 ? '&' : '?';
        var url = GC_BASE + '/api/v0' + path + sep + buildRange();

        fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + GC_TOKEN,
                'Content-Type': 'application/json'
            }
        })
            .then(function (r) {
                if (!r.ok) {
                    return r.text().then(function (body) {
                        console.warn('[GC] HTTP ' + r.status + ' en ' + path + ':', body);
                        if (errCb) errCb(r.status);
                    });
                }
                return r.json().then(cb);
            })
            .catch(function (e) {
                console.warn('[GC] fetch error en ' + path + ':', e.message);
                if (errCb) errCb(e);
            });
    }

    // Tooltip
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

    // Total de vistas via API REST
    // El endpoint /stats/total devuelve { total: N, total_utc: N }
    function updateViews() {
        apiFetch('/stats/total', function (data) {
            var el = document.getElementById('gc-total-views');
            if (!el) return;
            var n = (data && typeof data.total === 'number') ? data.total : 0;
            el.textContent = n > 0 ? n.toLocaleString('es-BO') : '—';
        });
    }

    // Banderas de países
    // El endpoint /stats/locations devuelve { stats: [{ id: "BO", name: "Bolivia", count: N }] }
    // El id puede ser "BO" (país) o "BO-L" (región), slice(0,2) normaliza ambos casos.
    // Se envía limit=8 como query param del path.
    function updateFlags() {
        apiFetch('/stats/locations?limit=8', function (data) {
            var wrap = document.getElementById('gc-flags-wrap');
            if (!wrap) return;

            var stats = (data && Array.isArray(data.stats)) ? data.stats : [];

            // Filtrar entradas vacías o inválidas y agrupar por código de país
            // porque GC puede devolver tanto "BO" como "BO-L" para el mismo país
            var byCountry = {};
            stats.forEach(function (loc) {
                if (!loc.id) return;
                var code = loc.id.toUpperCase().slice(0, 2);
                if (!/^[A-Z]{2}$/.test(code)) return;
                byCountry[code] = (byCountry[code] || 0) + (loc.count || 0);
            });

            var codes = Object.keys(byCountry);
            if (!codes.length) {
                console.warn('[GC] /stats/locations devolvió 0 entradas. Respuesta raw:', data);
                return;
            }

            // Ordenar por visitas desc
            codes.sort(function (a, b) { return byCountry[b] - byCountry[a]; });

            var html = '';
            codes.slice(0, 6).forEach(function (code) {
                var views = byCountry[code].toLocaleString('es-BO');
                var label = countryName(code) + ': ' + views + ' vistas';
                html +=
                    '<span class="gc-flag-item" data-tip="' + label + '">' +
                    '<img class="gc-flag-img"' +
                    ' src="' + FLAG_CDN + code.toLowerCase() + '.png"' +
                    ' alt="' + countryName(code) + '"' +
                    ' width="16" height="12" loading="lazy"' +
                    ' onerror="this.style.display=\'none\'">' +
                    '</span>';
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
        }, function (status) {
            // Si falla con 403/401, el token no tiene permisos de lectura de stats
            // o CORS está bloqueando. En ese caso ocultar el widget de banderas.
            var wrap = document.getElementById('gc-flags-wrap');
            if (wrap) wrap.style.display = 'none';
            var sep = document.querySelector('.gc-sep');
            if (sep) sep.style.display = 'none';
        });
    }

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