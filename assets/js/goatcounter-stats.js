(function () {
    'use strict';

    var GC_BASE = 'https://lexgeocat.goatcounter.com';
    var GC_TOKEN = '12ho0qypjqrv516mxxmvjjuj9b1v35tklso1s9j1dyckggebqn1';
    var FLAG_CDN = 'https://flagcdn.com/16x12/';
    var REFRESH_MS = 15 * 60 * 1000;

    var COUNTRY_ES = {
        BO: 'Bolivia', AR: 'Argentina', CL: 'Chile', PE: 'Perú', CO: 'Colombia',
        MX: 'México', ES: 'España', US: 'Estados Unidos', BR: 'Brasil', EC: 'Ecuador',
        PY: 'Paraguay', UY: 'Uruguay', VE: 'Venezuela', PA: 'Panamá', CR: 'Costa Rica',
        GT: 'Guatemala', HN: 'Honduras', SV: 'El Salvador', NI: 'Nicaragua', CU: 'Cuba',
        DO: 'Rep. Dominicana', PR: 'Puerto Rico', DE: 'Alemania', FR: 'Francia',
        IT: 'Italia', GB: 'Reino Unido', PT: 'Portugal', NL: 'Países Bajos', RU: 'Rusia',
        CN: 'China', JP: 'Japón', KR: 'Corea del Sur', IN: 'India', AU: 'Australia',
        CA: 'Canadá', ZA: 'Sudáfrica', NG: 'Nigeria', EG: 'Egipto', SG: 'Singapur'
    };

    var CACHE_KEY = 'gc_v3';
    var CACHE_TTL = 12 * 60 * 1000;

    function cacheGet() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var obj = JSON.parse(raw);
            if (Date.now() - obj.ts > CACHE_TTL) { sessionStorage.removeItem(CACHE_KEY); return null; }
            return obj;
        } catch (e) { return null; }
    }

    function cacheSet(views, flagsHtml) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), views: views, flags: flagsHtml }));
        } catch (e) { }
    }

    // ── vistas: endpoint público sin auth, funciona en todos los navegadores ──
    function fetchViewsPublic(cb) {
        fetch(GC_BASE + '/counter//.json', { method: 'GET', mode: 'cors', credentials: 'omit' })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(function (d) { cb(d && typeof d.count === 'number' ? d.count : null); })
            .catch(function () { cb(null); });
    }

    // ── locations: solo desktop lo necesita, usa API autenticada ──
    function fetchLocationsAuth(cb) {
        var end = encodeURIComponent(new Date().toISOString());
        fetch(GC_BASE + '/api/v0/stats/locations?limit=6&start=2024-01-01T00%3A00%3A00Z&end=' + end, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + GC_TOKEN },
            credentials: 'omit'
        })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(function (d) { cb((d && Array.isArray(d.stats)) ? d.stats : []); })
            .catch(function () { cb([]); });
    }

    function setViewsText(val) {
        ['gc-total-views', 'mob-gc-views'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = val;
        });
    }

    function setFlagsHtml(html) {
        ['gc-flags-wrap', 'mob-gc-flags'].forEach(function (id) {
            var wrap = document.getElementById(id);
            if (!wrap) return;
            wrap.innerHTML = html;
            attachTips(wrap);
        });
    }

    function buildFlagsHtml(stats) {
        var html = '';
        var shown = 0;
        for (var i = 0; i < stats.length && shown < 5; i++) {
            var code = (stats[i].id || '').toUpperCase().slice(0, 2);
            if (!/^[A-Z]{2}$/.test(code)) continue;
            var label = (COUNTRY_ES[code] || code) + ': ' + (stats[i].count || 0).toLocaleString('es-BO') + ' vistas';
            html +=
                '<span class="gc-flag-item" data-tip="' + label + '">' +
                '<img class="gc-flag-img" src="' + FLAG_CDN + code.toLowerCase() + '.png"' +
                ' alt="' + (COUNTRY_ES[code] || code) + '" width="16" height="12" loading="lazy">' +
                '</span>';
            shown++;
        }
        html +=
            '<a class="gc-flag-item gc-more-stats" href="' + GC_BASE + '/"' +
            ' target="_blank" rel="noopener" data-tip="Ver estadísticas">' +
            '<i class="fa-solid fa-chart-simple"></i></a>';
        return html;
    }

    var _tip = null;

    function showTip(item) {
        hideTip();
        var t = document.createElement('div');
        t.className = 'gc-tooltip';
        t.textContent = item.getAttribute('data-tip');
        t.style.cssText = 'visibility:hidden;position:fixed;z-index:99999';
        document.body.appendChild(t);
        var r = item.getBoundingClientRect();
        var left = r.left + r.width / 2 - t.offsetWidth / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - t.offsetWidth - 8));
        var top = r.bottom + 7;
        if (top + t.offsetHeight > window.innerHeight) top = r.top - t.offsetHeight - 7;
        t.style.left = left + 'px';
        t.style.top = top + 'px';
        t.style.visibility = 'visible';
        _tip = t;
    }

    function hideTip() { if (_tip) { _tip.remove(); _tip = null; } }

    document.addEventListener('click', hideTip);
    document.addEventListener('scroll', hideTip, { passive: true });

    function attachTips(container) {
        container.querySelectorAll('.gc-flag-item[data-tip]').forEach(function (item) {
            item.addEventListener('mouseenter', function () { showTip(item); });
            item.addEventListener('mouseleave', hideTip);
            item.addEventListener('click', function (e) {
                if (item.tagName === 'A') return;
                e.stopPropagation();
                _tip ? hideTip() : showTip(item);
            });
        });
    }

    function buildDesktopSkeleton() {
        var el = document.getElementById('gc-stats-widget');
        if (!el) return;
        el.innerHTML =
            '<span class="gc-stat-item">' +
            '<i class="fa-solid fa-eye"></i>' +
            '<span class="gc-val" id="gc-total-views">—</span>' +
            '<span class="gc-lbl">vistas</span>' +
            '</span>' +
            '<span class="gc-sep">|</span>' +
            '<span class="gc-stat-item" id="gc-flags-wrap"></span>';
    }

    // móvil: solo inyecta el número, sin banderas ni separador
    function buildMobileSkeleton() {
        var mob = document.getElementById('mob-gc-strip');
        if (!mob) return;
        mob.innerHTML =
            '<span class="gc-stat-item">' +
            '<i class="fa-solid fa-eye"></i>' +
            '<span class="gc-val" id="mob-gc-views">—</span>' +
            '<span style="font-size:.66rem;color:rgba(255,255,255,.4);margin-left:2px">vistas totales</span>' +
            '</span>';
    }

    function waitForElement(id, cb, maxMs) {
        if (document.getElementById(id)) { cb(); return; }
        var elapsed = 0;
        var t = setInterval(function () {
            elapsed += 60;
            if (document.getElementById(id)) { clearInterval(t); cb(); return; }
            if (elapsed >= (maxMs || 4000)) { clearInterval(t); cb(); }
        }, 60);
    }

    function loadDesktop() {
        var cached = cacheGet();

        // vistas — usar endpoint público (no depende de auth ni CORS problemático)
        if (cached && cached.views) {
            setViewsText(cached.views);
        } else {
            fetchViewsPublic(function (n) {
                var fmt = n !== null ? Number(n).toLocaleString('es-BO') : '—';
                setViewsText(fmt);
                // guardar en cache junto con flags cuando lleguen
                var flagsHtml = (cacheGet() || {}).flags || '';
                cacheSet(fmt, flagsHtml);
            });
        }

        // banderas — solo desktop, API autenticada
        if (cached && cached.flags) {
            setFlagsHtml(cached.flags);
        } else {
            setTimeout(function () {
                fetchLocationsAuth(function (stats) {
                    if (!stats.length) return;
                    var html = buildFlagsHtml(stats);
                    setFlagsHtml(html);
                    var viewsFmt = (cacheGet() || {}).views || '—';
                    cacheSet(viewsFmt, html);
                });
            }, 400);
        }
    }

    function loadMobile() {
        // endpoint público — sin auth, sin preflight, funciona en Chrome Android
        fetchViewsPublic(function (n) {
            var el = document.getElementById('mob-gc-views');
            if (el) el.textContent = n !== null ? Number(n).toLocaleString('es-BO') : '—';
        });
    }

    function init() {
        buildDesktopSkeleton();

        waitForElement('mob-gc-strip', function () {
            buildMobileSkeleton();
            loadMobile();
        }, 4000);

        loadDesktop();

        setInterval(function () {
            sessionStorage.removeItem(CACHE_KEY);
            loadDesktop();
            loadMobile();
        }, REFRESH_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();