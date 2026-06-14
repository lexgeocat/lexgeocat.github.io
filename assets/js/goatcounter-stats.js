(function () {
    'use strict';

    var WORKER_BASE = 'https://stats.lexgeocat.workers.dev';
    var FLAG_CDN = 'https://flagcdn.com/16x12/';
    var MAX_FLAGS = 6;

    var COUNTRY_ES = {
        BO: 'Bolivia', AR: 'Argentina', CL: 'Chile',
        PE: 'Perú', CO: 'Colombia', MX: 'México',
        ES: 'España', US: 'Estados Unidos', BR: 'Brasil',
        EC: 'Ecuador', PY: 'Paraguay', UY: 'Uruguay',
        VE: 'Venezuela', PA: 'Panamá', CR: 'Costa Rica',
        GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador',
        NI: 'Nicaragua', CU: 'Cuba', DO: 'Rep. Dominicana',
        PR: 'Puerto Rico', DE: 'Alemania', FR: 'Francia',
        IT: 'Italia', GB: 'Reino Unido', PT: 'Portugal',
        NL: 'Países Bajos', RU: 'Rusia', CN: 'China',
        JP: 'Japón', KR: 'Corea del Sur', IN: 'India',
        AU: 'Australia', CA: 'Canadá', ZA: 'Sudáfrica',
        NG: 'Nigeria', EG: 'Egipto', SG: 'Singapur',
        CH: 'Suiza', SE: 'Suecia', NO: 'Noruega',
        DK: 'Dinamarca', FI: 'Finlandia', PL: 'Polonia',
        CZ: 'Rep. Checa', AT: 'Austria', BE: 'Bélgica',
        TR: 'Turquía', IL: 'Israel', UA: 'Ucrania',
        TH: 'Tailandia', ID: 'Indonesia',
    };

    function countryName(code) {
        return COUNTRY_ES[code] || code;
    }

    // ── Fetch helper con AbortController ──────────────────────────────────────
    function apiFetch(path, cb) {
        var controller = new AbortController();
        var timeout = setTimeout(function () { controller.abort(); }, 8000);

        fetch(WORKER_BASE + path, {
            cache: 'no-store',
            signal: controller.signal,
        })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(cb)
            .catch(function (e) {
                if (e.name !== 'AbortError') console.warn('[GC]', e.message);
            })
            .finally(function () { clearTimeout(timeout); });
    }

    // ── Tooltip ───────────────────────────────────────────────────────────────
    var _tip = null;

    function showTip(item) {
        hideTip();
        var t = document.createElement('div');
        t.className = 'gc-tooltip';
        t.textContent = item.dataset.tip;   // textContent: XSS-safe
        t.style.cssText = 'visibility:hidden;position:fixed';
        document.body.appendChild(t);

        var r = item.getBoundingClientRect();
        var tw = t.offsetWidth;
        var th = t.offsetHeight;
        var left = Math.max(8, Math.min(
            r.left + r.width / 2 - tw / 2,
            window.innerWidth - tw - 8
        ));
        var top = r.bottom + 7;
        if (top + th > window.innerHeight) top = r.top - th - 7;

        t.style.cssText = 'visibility:visible;position:fixed;left:' + left + 'px;top:' + top + 'px';
        _tip = t;
    }

    function hideTip() {
        if (_tip) { _tip.remove(); _tip = null; }
    }

    document.addEventListener('click', hideTip);
    document.addEventListener('scroll', hideTip, { passive: true });

    // ── Vistas totales ────────────────────────────────────────────────────────
    function updateViews(el) {
        apiFetch('/total', function (data) {
            var n = (data && typeof data.total === 'number') ? data.total : 0;
            el.textContent = n > 0 ? n.toLocaleString('es-BO') : '—';
        });
    }

    // ── Banderas ──────────────────────────────────────────────────────────────
    function updateFlags(wrap) {
        apiFetch('/locations', function (data) {
            var stats = (data && Array.isArray(data.stats)) ? data.stats : [];
            if (!stats.length) return;

            var frag = document.createDocumentFragment();
            var shown = 0;

            for (var i = 0; i < stats.length && shown < MAX_FLAGS; i++) {
                var loc = stats[i];
                var raw = (loc.id || '').toUpperCase();
                var code = raw.slice(0, 2);
                if (!/^[A-Z]{2}$/.test(code)) continue;

                var views = (loc.count || 0).toLocaleString('es-BO');
                var name = countryName(code);
                var span = document.createElement('span');
                span.className = 'gc-flag-item';
                span.dataset.tip = name + ': ' + views + ' vistas';

                var img = document.createElement('img');
                img.className = 'gc-flag-img';
                img.src = FLAG_CDN + code.toLowerCase() + '.png';
                img.alt = name;
                img.width = 16;
                img.height = 12;
                img.loading = 'lazy';
                span.appendChild(img);
                frag.appendChild(span);
                shown++;
            }

            // Enlace "ver más"
            var a = document.createElement('a');
            a.className = 'gc-flag-item gc-more-stats';
            a.href = 'https://lexgeocat.goatcounter.com/';
            a.target = '_blank';
            a.rel = 'noopener';
            a.dataset.tip = 'Ver más estadísticas';
            var icon = document.createElement('i');
            icon.className = 'fa-solid fa-chart-simple';
            a.appendChild(icon);
            frag.appendChild(a);

            wrap.appendChild(frag);

            // Eventos de tooltip
            wrap.querySelectorAll('.gc-flag-item[data-tip]').forEach(function (item) {
                item.addEventListener('mouseenter', function () { showTip(item); });
                item.addEventListener('mouseleave', hideTip);
                item.addEventListener('click', function (e) {
                    if (item.tagName === 'A') return;
                    e.stopPropagation();
                    _tip ? hideTip() : showTip(item);
                });
            });
        });
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    function buildWidget() {
        var el = document.getElementById('gc-stats-widget');
        if (!el || el.dataset.gcInit) return;   // guard anti-doble-init
        el.dataset.gcInit = '1';

        // Construir estructura con DOM (seguro, sin innerHTML)
        var viewsSpan = document.createElement('span');
        viewsSpan.className = 'gc-stat-item gc-views';
        viewsSpan.innerHTML =
            '<i class="fa-solid fa-eye"></i>' +
            '<span class="gc-val" id="gc-total-views">—</span>' +
            '<span class="gc-lbl">vistas</span>';

        var sep = document.createElement('span');
        sep.className = 'gc-sep';
        sep.textContent = '|';

        var flagsWrap = document.createElement('span');
        flagsWrap.className = 'gc-stat-item gc-locs';
        flagsWrap.id = 'gc-flags-wrap';

        el.appendChild(viewsSpan);
        el.appendChild(sep);
        el.appendChild(flagsWrap);

        var viewsEl = document.getElementById('gc-total-views');
        updateViews(viewsEl);
        updateFlags(flagsWrap);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildWidget);
    } else {
        buildWidget();
    }
})();