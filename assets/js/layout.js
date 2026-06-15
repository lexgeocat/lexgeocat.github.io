(function () {
    'use strict';

    var CFG = window.LGC_CONFIG || {
        tagline: 'Derecho · Catastro · Geomática · Tecnología',
        siteName: 'LexGeoCat',
        rnt: '970285',
        blogUrl: '#',
        social: { facebook: '#', youtube: '#', linkedin: '#', whatsapp: '#' },
        nav: [],
    };

    var depth = parseInt(document.body.getAttribute('data-depth') || '0', 10);

    function root(path) {
        var prefix = depth ? '../' : '';
        return prefix + path;
    }

    function resolveHref(href) {
        if (href === '__BLOG__') return CFG.blogUrl;
        if (href.indexOf('#') === 0) return root('index.html') + href;
        if (href.indexOf('http') === 0) return href;
        return root(href);
    }

    function isActive(item) {
        var page = document.body.getAttribute('data-page') || '';
        if (item.id === page) return true;
        if (item.children) {
            return item.children.some(function (c) {
                return c.id === page;
            });
        }
        if (item.id === 'servicios' && page === 'inicio') {
            return location.hash === '#servicios-detalle';
        }
        return false;
    }

    function navLink(item, mobile) {
        var href = resolveHref(item.href);
        var ext = item.external ? ' target="_blank" rel="noopener"' : '';
        var cls = mobile ? '' : ' class="nav-link' + (isActive(item) ? ' active' : '') + '"';
        return (
            '<a' +
            cls +
            ' href="' +
            href +
            '"' +
            ext +
            '><i class="fa-solid ' +
            item.icon +
            '"></i>' +
            item.label +
            '</a>'
        );
    }

    function buildNav(desktop) {
        var html = '';
        CFG.nav.forEach(function (item) {
            if (item.children) {
                if (desktop) {
                    html +=
                        '<div class="nav-dropdown"><span class="nav-link nav-dropbtn"><i class="fa-solid ' +
                        item.icon +
                        '"></i>' +
                        item.label +
                        ' <i class="fa-solid fa-chevron-down" style="margin-left:4px;font-size:10px"></i></span><div class="nav-dropdown-content">';
                    item.children.forEach(function (c) {
                        html +=
                            '<a href="' +
                            resolveHref(c.href) +
                            '"><i class="fa-solid ' +
                            c.icon +
                            '" style="margin-right:8px;font-size:11px"></i>' +
                            c.label +
                            '</a>';
                    });
                    html += '</div></div>';
                } else {
                    html +=
                        '<li class="mob-dropdown"><button class="mob-dropbtn" type="button"><span><i class="fa-solid ' +
                        item.icon +
                        '"></i>' +
                        item.label +
                        '</span><i class="fa-solid fa-chevron-down arrow"></i></button><ul class="mob-submenu">';
                    item.children.forEach(function (c) {
                        html +=
                            '<li><a href="' +
                            resolveHref(c.href) +
                            '"><i class="fa-solid ' +
                            c.icon +
                            '"></i>' +
                            c.label +
                            '</a></li>';
                    });
                    html += '</ul></li>';
                }
            } else if (desktop) {
                html += navLink(item, false);
            } else {
                html += '<li>' + navLink(item, true) + '</li>';
            }
        });
        return html;
    }

    function headerHtml() {
        return (
            '<div id="ld"><div class="logo-loader"><svg fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" opacity=".2" r="28" stroke="#D4A843" stroke-width="1"/><circle class="ring-anim" cx="32" cy="32" r="28" stroke="#D4A843" stroke-linecap="round" stroke-width="2"/><text fill="#D4A843" font-family="serif" font-size="16" font-weight="700" text-anchor="middle" x="32" y="37">L</text></svg></div><span>LexGeoCat</span></div>' +
            '<div id="hdr"><div class="hi">' +
            '<div class="logo-wrap"><a href="' +
            root('index.html') +
            '" style="display:flex;align-items:center;gap:12px;text-decoration:none"><div class="logo-icon"><i class="fa-solid fa-map-location-dot"></i></div><div class="logo-text"><h1>Lex<span>Geo</span>Cat</h1><div class="subtitle">' +
            CFG.tagline +
            '</div></div></a></div>' +
            '<div class="hr">' +
            '<div class="hdr-socials">' +
            '<a aria-label="Facebook" class="hdr-social-btn fb" href="' +
            CFG.social.facebook +
            '" rel="noopener" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>' +
            '<a aria-label="YouTube" class="hdr-social-btn yt" href="' +
            CFG.social.youtube +
            '" rel="noopener" target="_blank"><i class="fa-brands fa-youtube"></i></a>' +
            '<a aria-label="LinkedIn" class="hdr-social-btn lk" href="' +
            CFG.social.linkedin +
            '" rel="noopener" target="_blank"><i class="fa-brands fa-linkedin-in"></i></a>' +
            '<a aria-label="WhatsApp" class="hdr-social-btn wa" href="' +
            CFG.social.whatsapp +
            '" rel="noopener" target="_blank"><i class="fa-brands fa-whatsapp"></i></a>' +
            '</div>' +
            '<div class="gc-stats-bar" id="gc-stats-widget"></div>' +
            '<button aria-label="Buscar en el blog" class="icon-btn srch-open-btn" id="srch-open-btn" type="button"><i class="fa-solid fa-magnifying-glass"></i></button>' +
            '<button aria-label="Cambiar tema" class="icon-btn th-btn" id="th-btn" type="button"><i class="fa-solid fa-moon"></i><i class="fa-solid fa-sun"></i></button>' +
            '<button aria-label="Menú" class="icon-btn ham" id="ham" type="button"><i class="fa-solid fa-bars"></i></button>' +
            '</div></div></div>' +
            '<nav aria-label="Navegación principal" class="nav-bar" id="nav-bar" role="navigation"><div class="nav-inner">' +
            buildNav(true) +
            '</div></nav>' +
            '<div class="mob-menu" id="mob-menu"><div class="mob-menu-hd"><div style="display:flex;align-items:center;gap:10px"><div class="logo-icon" style="width:34px;height:34px"><i class="fa-solid fa-map-location-dot" style="color:var(--gold2);font-size:14px"></i></div><span style="font-family:var(--font-display);font-size:1.15rem;font-weight:800;color:#fff">Lex<span style="color:var(--gold2)">Geo</span>Cat</span></div><button class="mob-close" id="mob-close" type="button"><i class="fa-solid fa-xmark"></i></button></div>' +
            '<div class="mob-search-wrap"><i class="fa-solid fa-magnifying-glass"></i><input id="mob-srch-input" type="text" autocomplete="off" placeholder="Buscar en el blog..."><button class="mob-search-btn" id="mob-srch-btn" type="button">Buscar</button></div>' +
            '<ul class="mob-nav">' +
            buildNav(false) +
            '</ul></div>'
        );
    }

    function footerHtml() {
        return (
            '<footer id="ft" role="contentinfo"><div class="ft-main"><div class="ft-grid">' +
            '<div class="ft-brand"><h3>Lex<span>Geo</span>Cat</h3><div class="ft-tagline">' +
            CFG.tagline +
            '</div>' +
            '<p>Consultoría profesional en derecho territorial, catastro, geomática y tecnología aplicada al territorio boliviano.</p>' +
            '<div class="ft-contact" style="margin-bottom:16px">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:.82rem;color:var(--text2)"><i class="fa-solid fa-envelope" style="color:var(--gold);font-size:11px;width:16px;text-align:center"></i> lexgeocat@gmail.com</div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:.82rem;color:var(--text2)"><i class="fa-brands fa-whatsapp" style="color:var(--gold);font-size:11px;width:16px;text-align:center"></i> +591 76711790</div>' +
            '<div style="display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--text2)"><i class="fa-solid fa-location-dot" style="color:var(--gold);font-size:11px;width:16px;text-align:center"></i> Viacha, La Paz — Bolivia</div>' +
            '</div>' +
            '<div class="ft-social">' +
            '<a aria-label="Facebook" href="' +
            CFG.social.facebook +
            '" rel="noopener" target="_blank"><i class="fab fa-facebook-f"></i></a>' +
            '<a aria-label="LinkedIn" href="' +
            CFG.social.linkedin +
            '" rel="noopener" target="_blank"><i class="fab fa-linkedin-in"></i></a>' +
            '<a aria-label="YouTube" href="' +
            CFG.social.youtube +
            '" rel="noopener" target="_blank"><i class="fab fa-youtube"></i></a>' +
            '<a aria-label="WhatsApp" href="' +
            CFG.social.whatsapp +
            '" rel="noopener" target="_blank"><i class="fab fa-whatsapp"></i></a>' +
            '</div></div>' +
            '<div class="ft-col"><h4>Especialidades</h4><ul>' +
            '<li><a href="' +
            root('pages/derecho.html') +
            '"><i class="fa-solid fa-chevron-right"></i>Derecho</a></li>' +
            '<li><a href="' +
            root('pages/catastro.html') +
            '"><i class="fa-solid fa-chevron-right"></i>Catastro</a></li>' +
            '<li><a href="' +
            root('pages/ordenamiento.html') +
            '"><i class="fa-solid fa-chevron-right"></i>Ord. Territorial</a></li>' +
            '<li><a href="' +
            root('pages/geografia.html') +
            '"><i class="fa-solid fa-chevron-right"></i>Geografía</a></li>' +
            '<li><a href="' +
            CFG.blogUrl +
            '"><i class="fa-solid fa-chevron-right"></i>Blog</a></li>' +
            '</ul></div>' +
            '<div class="ft-col"><h4>Plataforma</h4><ul>' +
            '<li><a href="' +
            root('pages/acerca-de.html') +
            '"><i class="fa-solid fa-chevron-right"></i>Sobre Mí</a></li>' +
            '<li><a href="' +
            root('index.html#contacto-servicios') +
            '"><i class="fa-solid fa-chevron-right"></i>Contacto</a></li>' +
            '<li><a href="' +
            root('pages/privacidad.html') +
            '"><i class="fa-solid fa-chevron-right"></i>Privacidad</a></li>' +
            '</ul></div></div></div>' +
            '<div class="ft-sep"><hr></div>' +
            '<div class="ft-btm"><span class="ft-btm-left">© ' +
            CFG.siteName +
            ' — Todos los derechos reservados</span>' +
            '<div class="ft-btm-right">' +
            '<a href="' +
            root('pages/privacidad.html') +
            '">Privacidad</a>' +
            '<a href="' +
            root('pages/terminos.html') +
            '">Términos</a>' +
            '<a href="' +
            root('pages/contacto.html') +
            '">Contacto</a>' +
            '</div></div></div>' +
            '<button aria-label="Volver arriba" id="top" type="button"><i class="fa-solid fa-arrow-up"></i></button>' +
            '<div aria-modal="true" id="srch-overlay" role="dialog"><div class="srch-modal">' +
            '<div class="srch-modal-header"><i class="fa-solid fa-magnifying-glass"></i>' +
            '<input autocomplete="off" id="srch-modal-input" placeholder="Buscar en el blog de LexGeoCat..." type="text">' +
            '<button aria-label="Cerrar búsqueda" class="srch-modal-close" id="srch-modal-close" type="button"><i class="fa-solid fa-xmark"></i></button></div>' +
            '<div class="srch-modal-body" id="srch-modal-body"><div class="srch-status"><i class="fa-solid fa-magnifying-glass"></i><span>La búsqueda se realiza en el blog alojado en Blogger. Escribe y presiona Enter.</span></div></div>' +
            '</div></div>'
        );
    }

    var headerEl = document.getElementById('site-header');
    var footerEl = document.getElementById('site-footer');
    if (headerEl) headerEl.innerHTML = headerHtml();
    if (footerEl) footerEl.innerHTML = footerHtml();

    /* ===== AUTO-OCULTAR NAV ===== */
    var hdr = document.getElementById('hdr');
    var navBar = document.getElementById('nav-bar');
    var lastY = 0;

    function onScroll() {
        var y = window.scrollY || window.pageYOffset;

        if (hdr) {
            if (y > 30) {
                hdr.classList.add('scrolled');
            } else {
                hdr.classList.remove('scrolled');
            }
        }

        if (navBar) {
            if (y > lastY && y > 200) {
                navBar.classList.add('hidden');
            } else {
                navBar.classList.remove('hidden');
            }
        }

        lastY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    document.documentElement.lang = 'es';
})();
