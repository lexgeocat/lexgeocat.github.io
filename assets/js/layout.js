(function () {
  'use strict';

  var CFG = window.LGC_CONFIG;
  if (!CFG) return;

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
      return item.children.some(function (c) { return c.id === page; });
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
    var tag = mobile ? 'a' : 'a';
    return '<' + tag + cls + ' href="' + href + '"' + ext + '><i class="fa-solid ' + item.icon + '"></i>' + item.label + '</' + tag + '>';
  }

  function buildNav(desktop) {
    var html = '';
    CFG.nav.forEach(function (item) {
      if (item.children) {
        if (desktop) {
          html += '<div class="nav-dropdown"><span class="nav-link nav-dropbtn"><i class="fa-solid ' + item.icon + '"></i>' + item.label + ' <i class="fa-solid fa-chevron-down" style="margin-left:4px;font-size:10px"></i></span><div class="nav-dropdown-content">';
          item.children.forEach(function (c) {
            html += '<a href="' + resolveHref(c.href) + '"><i class="fa-solid ' + c.icon + '" style="margin-right:8px;font-size:11px"></i>' + c.label + '</a>';
          });
          html += '</div></div>';
        } else {
          html += '<li class="mob-dropdown"><button class="mob-dropbtn" type="button"><span><i class="fa-solid ' + item.icon + '"></i>' + item.label + '</span><i class="fa-solid fa-chevron-down arrow"></i></button><ul class="mob-submenu">';
          item.children.forEach(function (c) {
            html += '<li><a href="' + resolveHref(c.href) + '"><i class="fa-solid ' + c.icon + '"></i>' + c.label + '</a></li>';
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
      '<div id="ld"><div class="logo-loader"><svg fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" opacity=".25" r="28" stroke="#E8D5A0" stroke-width="1"/><circle class="ring-anim" cx="32" cy="32" r="28" stroke="#C8960C" stroke-linecap="round" stroke-width="2.5"/><text fill="#C8960C" font-family="serif" font-size="16" font-weight="700" text-anchor="middle" x="32" y="37">L</text></svg></div><span>LexGeoCat</span></div>' +
      '<div id="hdr"><div class="hi">' +
      '<div class="logo-wrap"><a href="' + root('index.html') + '" style="display:flex;align-items:center;gap:12px;text-decoration:none"><div class="logo-icon"><i class="fa-solid fa-map-location-dot"></i></div><div class="logo-text"><h1>Lex<span>Geo</span>Cat</h1><div class="subtitle">' + CFG.tagline + '</div></div></a></div>' +
      '<div class="hr">' +
      '<div class="hdr-socials">' +
      '<a aria-label="Facebook" class="hdr-social-btn fb" href="' + CFG.social.facebook + '" rel="noopener" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>' +
      '<a aria-label="YouTube" class="hdr-social-btn yt" href="' + CFG.social.youtube + '" rel="noopener" target="_blank"><i class="fa-brands fa-youtube"></i></a>' +
      '<a aria-label="LinkedIn" class="hdr-social-btn lk" href="' + CFG.social.linkedin + '" rel="noopener" target="_blank"><i class="fa-brands fa-linkedin-in"></i></a>' +
      '<a aria-label="WhatsApp" class="hdr-social-btn wa" href="' + CFG.social.whatsapp + '" rel="noopener" target="_blank"><i class="fa-brands fa-whatsapp"></i></a>' +
      '</div>' +
      '<div class="hdr-stats" id="hdr-stats" aria-label="Estadísticas de visitas">' +
      '<span class="hdr-stat" id="counter-dev-placeholder" role="status" aria-live="polite" data-tip="' + (CFG.counterLabel || 'Visitas') + '">' +
      '<i class="fa-solid fa-eye"></i>' +
      '<span class="hdr-stat-value">0</span>' +
      '</span>' +
      '<span class="hdr-stat-sep" aria-hidden="true"></span>' +
      '<span class="hdr-stat hdr-stat-country" id="visitor-country-info" hidden data-tip="">' +
      '<img alt="" class="hdr-stat-flag" loading="lazy">' +
      '</span>' +
      '</div>' +
      '<button aria-label="Buscar en el blog" class="srch-wrap srch-open-btn" id="srch-open-btn" type="button"><i class="fa-solid fa-magnifying-glass" style="color:var(--text3);font-size:12px"></i><span style="font-family:var(--font-b);font-size:.83rem;color:var(--text3);background:transparent;border:none;outline:none;width:160px;text-align:left;cursor:pointer">Buscar artículos...</span><kbd style="font-size:.65rem;color:var(--text3);background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:2px 6px;font-family:var(--font-m)">⌘K</kbd></button>' +
      '<button aria-label="Cambiar tema" class="icon-btn th-btn" id="th-btn" type="button"><i class="fa-solid fa-moon"></i><i class="fa-solid fa-sun"></i></button>' +
      '<button aria-label="Menú" class="icon-btn ham" id="ham" type="button"><i class="fa-solid fa-bars"></i></button>' +
      '</div></div></div>' +
      '<nav aria-label="Navegación principal" class="nav-bar" id="nav-bar" role="navigation"><div class="nav-inner">' + buildNav(true) + '</div></nav>' +
      '<div class="mob-menu" id="mob-menu"><div class="mob-menu-hd"><div style="display:flex;align-items:center;gap:10px"><div class="logo-icon" style="width:34px;height:34px"><i class="fa-solid fa-map-location-dot" style="color:var(--gold2);font-size:14px"></i></div><span style="font-family:var(--font-h);font-size:1.15rem;font-weight:700;color:#fff">Lex<span style="color:var(--gold2)">Geo</span>Cat</span></div><button class="mob-close" id="mob-close" type="button"><i class="fa-solid fa-xmark"></i></button></div><ul class="mob-nav">' + buildNav(false) + '</ul></div>'
    );
  }

  function footerHtml() {
    return (
      '<footer id="ft" role="contentinfo"><div class="ft-main"><div class="ft-grid">' +
      '<div class="ft-brand"><h3>Lex<span>Geo</span>Cat</h3><div class="ft-tagline">' + CFG.tagline + '</div>' +
      '<p>Plataforma especializada en la intersección entre el derecho, el catastro multifinalitario, los sistemas de información geográfica y la tecnología aplicada al territorio.</p>' +
      '<div class="ft-brand-tags"><span class="ft-brand-tag">Viacha, La Paz</span><span class="ft-brand-tag">Bolivia</span><span class="ft-brand-tag">SIB R.N.T. ' + CFG.rnt + '</span></div>' +
      '<div class="ft-social">' +
      '<a aria-label="Facebook" href="' + CFG.social.facebook + '" rel="noopener" target="_blank"><i class="fab fa-facebook-f"></i></a>' +
      '<a aria-label="LinkedIn" href="' + CFG.social.linkedin + '" rel="noopener" target="_blank"><i class="fab fa-linkedin-in"></i></a>' +
      '<a aria-label="YouTube" href="' + CFG.social.youtube + '" rel="noopener" target="_blank"><i class="fab fa-youtube"></i></a>' +
      '<a aria-label="WhatsApp" href="' + CFG.social.whatsapp + '" rel="noopener" target="_blank"><i class="fab fa-whatsapp"></i></a>' +
      '</div></div>' +
      '<div class="ft-col"><h4>Temáticas</h4><ul>' +
      '<li><a href="' + root('pages/derecho.html') + '"><i class="fa-solid fa-chevron-right"></i>Derecho</a></li>' +
      '<li><a href="' + root('pages/catastro.html') + '"><i class="fa-solid fa-chevron-right"></i>Catastro</a></li>' +
      '<li><a href="' + root('pages/gis.html') + '"><i class="fa-solid fa-chevron-right"></i>SIG / GIS</a></li>' +
      '<li><a href="' + root('pages/ordenamiento.html') + '"><i class="fa-solid fa-chevron-right"></i>Ord. Territorial</a></li>' +
      '<li><a href="' + root('pages/tecnologia.html') + '"><i class="fa-solid fa-chevron-right"></i>Tecnología</a></li>' +
      '</ul></div>' +
      '<div class="ft-col"><h4>Contenido</h4><ul>' +
      '<li><a href="' + root('pages/recursos.html') + '"><i class="fa-solid fa-chevron-right"></i>Recursos</a></li>' +
      '<li><a href="' + CFG.blogUrl + '"><i class="fa-solid fa-chevron-right"></i>Blog</a></li>' +
      '</ul></div>' +
      '<div class="ft-col"><h4>Plataforma</h4><ul>' +
      '<li><a href="' + root('pages/acerca-de.html') + '"><i class="fa-solid fa-chevron-right"></i>Sobre Mí</a></li>' +
      '<li><a href="' + root('index.html#servicios-detalle') + '"><i class="fa-solid fa-chevron-right"></i>Servicios</a></li>' +
      '<li><a href="' + root('pages/contacto.html') + '"><i class="fa-solid fa-chevron-right"></i>Contacto</a></li>' +
      '<li><a href="' + root('pages/privacidad.html') + '"><i class="fa-solid fa-chevron-right"></i>Privacidad</a></li>' +
      '<li><a href="' + root('pages/terminos.html') + '"><i class="fa-solid fa-chevron-right"></i>Términos</a></li>' +
      '</ul></div></div></div>' +
      '<div class="ft-sep"><hr></div>' +
      '<div class="ft-btm"><span class="ft-btm-left">© ' + CFG.siteName + ' — Todos los derechos reservados</span>' +
      '<div class="ft-btm-right">' +
      '<a href="' + root('pages/privacidad.html') + '">Privacidad</a>' +
      '<a href="' + root('pages/terminos.html') + '">Términos</a>' +
      '<a href="' + root('pages/contacto.html') + '">Contacto</a>' +
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

  document.documentElement.lang = 'es';
})();