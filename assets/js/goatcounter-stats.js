(function () {
    'use strict';

    var GC_BASE = 'https://lexgeocat.goatcounter.com';
    var GC_TOKEN = '6uv0hwk6ov2t1oaq51dj3jdng1uzl2hxzqmc3a1igzkcjtxt6aq';
    var REFRESH_MS = 5 * 60 * 1000;

    function fmtDate(d) {
        return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
    }

    function buildRange() {
        var end = new Date();
        end.setSeconds(0, 0);
        return 'start=2024-01-01T00%3A00%3A00Z&end=' + encodeURIComponent(fmtDate(end));
    }

    function apiFetch(path, cb) {
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
                    console.warn('[GC] HTTP ' + r.status + ' ' + path);
                    return;
                }
                return r.json().then(cb);
            })
            .catch(function (e) {
                console.warn('[GC] ' + e.message);
            });
    }

    function updateViews() {
        apiFetch('/stats/total', function (data) {
            var el = document.getElementById('gc-total-views');
            if (!el) return;
            var n = (data && typeof data.total === 'number') ? data.total : 0;
            el.textContent = n > 0 ? n.toLocaleString('es-BO') : '—';
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
            '</span>';

        updateViews();
        setInterval(updateViews, REFRESH_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildWidget);
    } else {
        buildWidget();
    }
})();