(function () {
    'use strict';

    // El API REST de GoatCounter (/api/v0/*) requiere Authorization header,
    // lo cual el browser bloquea por CORS en requests cross-origin.
    // Solución: usar el endpoint público /counter/*.json que sí tiene CORS abierto.
    // Requiere tener activa la opción "Allow adding visitor counts on your website"
    // en Settings > Site tab de tu cuenta GoatCounter.

    var GC_BASE = 'https://lexgeocat.goatcounter.com';
    var REFRESH_MS = 5 * 60 * 1000;

    function buildWidget() {
        var el = document.getElementById('gc-stats-widget');
        if (!el) return;

        el.innerHTML =
            '<span class="gc-stat-item gc-views">' +
            '<i class="fa-solid fa-eye"></i>' +
            '<span class="gc-val" id="gc-total-views">—</span>' +
            '<span class="gc-lbl">vistas</span>' +
            '</span>';

        fetchTotal();
        setInterval(fetchTotal, REFRESH_MS);
    }

    function fetchTotal() {
        // /counter/PATH.json — path vacío (//) = total del sitio completo.
        // GoatCounter acepta // para agregar todas las rutas.
        fetch(GC_BASE + '/counter//.json', { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) {
                var el = document.getElementById('gc-total-views');
                if (!el) return;
                // La respuesta trae count como string con separadores ("1,234")
                el.textContent = data.count || '0';
            })
            .catch(function (e) {
                console.warn('[GC] Error al obtener vistas:', e.message);
                // Silencio en UI — el widget queda en "—" sin romper nada
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildWidget);
    } else {
        buildWidget();
    }
})();