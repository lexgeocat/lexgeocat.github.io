(function () {
    'use strict';

    var GC_API = 'https://lexgeocat.goatcounter.com/api/v0';
    var GC_TOKEN = 'e44zvv3oc6kcs8ak5auoqwdpmefvb285ljtm1x7zdd8dselbc';
    var REFRESH_MS = 5 * 60 * 1000; // 5 min
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
        PL: 'Polonia', CZ: 'República Checa', AT: 'Austria', BE: 'Bélgica',
        HU: 'Hungría', RO: 'Rumanía', TR: 'Turquía', IL: 'Israel', SA: 'Arabia Saudita',
        AE: 'Emiratos Árabes', TH: 'Tailandia', VN: 'Vietnam', PH: 'Filipinas',
        ID: 'Indonesia', MY: 'Malasia', PK: 'Pakistán', BD: 'Bangladés', UA: 'Ucrania',
    };

    function countryName(code) {
        return COUNTRY_ES[code] || code;
    }

    // img desde flagcdn en lugar de emoji — funciona en todos los OS/browsers
    function flagImg(code) {
        var lower = code.toLowerCase();
        var name = countryName(code);
        return '<img class="gc-flag-img" src="' + FLAG_CDN + lower + '.png"' +
            ' alt="' + name + '" width="16" height="12" loading="lazy">';
    }

    // Tooltip inteligente: no se sale del viewport
    var _activeTip = null;

    function showTip(item) {
        if (_activeTip) { _activeTip.remove(); _activeTip = null; }
        var tip = document.createElement('div');
        tip.className = 'gc-tooltip';
        tip.textContent = item.getAttribute('data-tip');
        // fixed para no depender de scrollY ni overflow hidden del header
        tip.style.position = 'fixed';
        tip.style.visibility = 'hidden';
        document.body.appendChild(tip);

        var r = item.getBoundingClientRect();
        var tw = tip.offsetWidth;
        var th = tip.offsetHeight;
        var vw = window.innerWidth;
        var GAP = 6;

        // Horizontal: centrar sobre el item, clampear al viewport
        var left = r.left + r.width / 2 - tw / 2;
        left = Math.max(8, Math.min(left, vw - tw - 8));

        // Vertical: preferir abajo (header fijo, arriba suele ser fuera)
        var topBelow = r.bottom + GAP;
        var topAbove = r.top - th - GAP;
        var top = topBelow;
        if (topBelow + th > window.innerHeight && topAbove >= 0) top = topAbove;

        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
        tip.style.visibility = 'visible';
        _activeTip = tip;
        item._tip = tip;
    }

    function hideTip(item) {
        if (item._tip) { item._tip.remove(); item._tip = null; _activeTip = null; }
    }

    function gcFetch(path, cb) {
        // cache-bust para evitar que el browser devuelva la respuesta cacheada
        var bust = '?_=' + Math.floor(Date.now() / 1000);
        var sep = path.indexOf('?') >= 0 ? '&_=' : '?_=';
        var url = GC_API + path + sep + Math.floor(Date.now() / 1000);

        fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + GC_TOKEN,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        })
            .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
            .then(cb)
            .catch(function () { });
    }

    function updateViews() {
        gcFetch('/stats/total', function (data) {
            var el = document.getElementById('gc-total-views');
            if (!el) return;
            var total = (data && data.total) ? data.total : 0;
            el.textContent = total.toLocaleString('es-BO');
        });
    }

    function updateFlags() {
        gcFetch('/stats/locations?limit=8', function (data) {
            var wrap = document.getElementById('gc-flags-wrap');
            if (!wrap) return;
            var stats = (data && data.stats) ? data.stats : [];
            if (!stats.length) return;

            var html = '';
            stats.forEach(function (loc) {
                var code = (loc.id || '').toUpperCase().slice(0, 2);
                if (code.length !== 2) return;
                var name = countryName(code);
                var views = (loc.count || 0).toLocaleString('es-BO');
                html +=
                    '<span class="gc-flag-item" data-tip="' + name + ': ' + views + ' vistas">' +
                    flagImg(code) +
                    '</span>';
            });
            wrap.innerHTML = html;

            wrap.querySelectorAll('.gc-flag-item').forEach(function (item) {
                item.addEventListener('mouseenter', function () { showTip(item); });
                item.addEventListener('mouseleave', function () { hideTip(item); });
                // touch: mostrar/ocultar con tap
                item.addEventListener('click', function (e) {
                    e.stopPropagation();
                    if (item._tip) { hideTip(item); } else { showTip(item); }
                });
            });
        });
    }

    // Cerrar tooltip al hacer click fuera
    document.addEventListener('click', function () {
        if (_activeTip) { _activeTip.remove(); _activeTip = null; }
    });

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

        // Refresco periódico
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