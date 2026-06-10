(function () {
    'use strict';

    var GC_BASE = 'https://lexgeocat.goatcounter.com';
    var GC_TOKEN = '12ho0qypjqrv516mxxmvjjuj9b1v35tklso1s9j1dyckggebqn1';
    var REFRESH_MS = 5 * 60 * 1000;
    var FLAG_CDN = 'https://flagcdn.com/16x12/';
    var FETCH_TIMEOUT_MS = 8000;

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

    function buildUrl(path) {
        var sep = path.indexOf('?') >= 0 ? '&' : '?';
        return GC_BASE + '/api/v0' + path + sep +
            'access_token=' + GC_TOKEN +
            '&start=' + encodeURIComponent('2024-01-01T00:00:00Z') +
            '&end=' + encodeURIComponent(toHour(new Date()));
    }

    // fetch con timeout explícito via AbortController o fallback por race
    function fetchWithTimeout(url, ms) {
        if (typeof AbortController !== 'undefined') {
            var ctrl = new AbortController();
            var tid = setTimeout(function () { ctrl.abort(); }, ms);
            return fetch(url, { method: 'GET', cache: 'no-store', signal: ctrl.signal })
                .then(function (r) { clearTimeout(tid); return r; })
                .catch(function (e) { clearTimeout(tid); throw e; });
        }
        // fallback sin AbortController (Android < 66)
        var timeout = new Promise(function (_, rej) {
            setTimeout(function () { rej(new Error('timeout')); }, ms);
        });
        return Promise.race([
            fetch(url, { method: 'GET', cache: 'no-store' }),
            timeout
        ]);
    }

    function apiFetchJSON(path, cb) {
        var url = buildUrl(path);
        fetchWithTimeout(url, FETCH_TIMEOUT_MS)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) { cb(null, data); })
            .catch(function (e) { cb(e, null); });
    }

    function apiFetchJSONP(path, cb) {
        var cbName = '_gc_' + Math.random().toString(36).substr(2, 9);
        var url = buildUrl(path) + '&jsonp=' + cbName;
        var done = false;

        // timeout para el JSONP — crítico en móvil
        var tid = setTimeout(function () {
            if (done) return;
            done = true;
            cleanup();
            cb(new Error('jsonp timeout'), null);
        }, FETCH_TIMEOUT_MS);

        function cleanup() {
            clearTimeout(tid);
            try { delete window[cbName]; } catch (e) { }
            var s = document.getElementById(cbName);
            if (s && s.parentNode) s.parentNode.removeChild(s);
        }

        window[cbName] = function (data) {
            if (done) return;
            done = true;
            cleanup();
            cb(null, data);
        };

        var s = document.createElement('script');
        s.id = cbName;
        s.src = url;
        s.onerror = function () {
            if (done) return;
            done = true;
            cleanup();
            cb(new Error('jsonp script error'), null);
        };
        // usar head si body no está listo todavía (caso móvil con DOMContentLoaded tardío)
        (document.body || document.head || document.documentElement).appendChild(s);
    }

    // intenta fetch primero, si falla va a JSONP, si falla también llama cb con null
    function apiFetch(path, cb) {
        apiFetchJSON(path, function (err, data) {
            if (!err && data) { cb(data); return; }
            apiFetchJSONP(path, function (err2, data2) {
                if (!err2 && data2) { cb(data2); return; }
                // ambos métodos fallaron — cb con objeto vacío para no romper renders
                console.warn('[GC] ambos métodos fallaron:', path, err && err.message, err2 && err2.message);
                cb(null);
            });
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

    // escribe en un elemento esperando a que exista en el DOM (retry por polling)
    function setWhenReady(id, setter, retries) {
        var el = document.getElementById(id);
        if (el) { setter(el); return; }
        if ((retries || 0) >= 20) return; // máx ~2s de espera
        setTimeout(function () { setWhenReady(id, setter, (retries || 0) + 1); }, 100);
    }

    function renderViews(fmt) {
        setWhenReady('gc-total-views', function (el) { el.textContent = fmt; });
        setWhenReady('mob-gc-views', function (el) { el.textContent = fmt; });
    }

    function renderFlags(html) {
        function inject(id) {
            setWhenReady(id, function (el) {
                el.innerHTML = html;
                attachTips(el);
            });
        }
        inject('gc-flags-wrap');
        inject('mob-gc-flags');
    }

    function updateViews() {
        apiFetch('/stats/total', function (data) {
            var n = (data && typeof data.total === 'number') ? data.total : 0;
            renderViews(n.toLocaleString('es-BO'));
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
                ' href="https://lexgeocat.goatcounter.com/"' +
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