/**
 * LexGeoCat — Configuración del sitio estático (GitHub Pages)
 * Ajusta blogUrl y basePath antes de publicar.
 */
window.LGC_CONFIG = {
  siteName: 'LexGeoCat',
  tagline: 'Derecho · Catastro · Topografía · Geomática · Software',

  /** Ruta base si usas GitHub Pages en subcarpeta: '/nombre-repo/' — raíz: '' */
  basePath: '',

  /** Blog alojado en Blogger (enlace externo desde este sitio) */
  blogUrl: 'https://lexgeocat.blogspot.com/',
  bloggerFeed: 'https://lexgeocat.blogspot.com/feeds/posts/default',
  bloggerSearch: 'https://lexgeocat.blogspot.com/search?q=',

  email: 'lexgeocat@gmail.com',
  whatsapp: '59176711790',
  location: 'Viacha, Departamento de La Paz, Bolivia',
  rnt: '970285',

  social: {
    facebook: 'https://www.facebook.com/CrisCat17',
    youtube: 'https://www.youtube.com/@lexgeocat',
    linkedin: 'https://www.linkedin.com/lexgeocat',
    whatsapp: 'https://wa.me/59176711790'
  },

  /** Especialidades (7 áreas) */
  profesiones: [
    { id: 'derecho',         label: 'Derecho',                              href: 'pages/derecho.html',     icon: 'fa-scale-balanced' },
    { id: 'catastro',        label: 'Catastro',                             href: 'pages/catastro.html',    icon: 'fa-map' },
    { id: 'ordenamiento',    label: 'Ordenamiento Territorial',             href: 'pages/ordenamiento.html',icon: 'fa-compass-drafting' },
    { id: 'geografia',       label: 'Geografía',                            href: 'pages/geografia.html',   icon: 'fa-earth-americas' },
    { id: 'topogeodesia',    label: 'Topografía y Geodesia',                href: 'pages/topogeodesia.html',icon: 'fa-mountain' },
    { id: 'geomantica',      label: 'Geomática',                            href: 'pages/geomantica.html',  icon: 'fa-layer-group' },
    { id: 'desarrollo',      label: 'Desarrollo de Software y Aplicaciones Web', href: 'pages/desarrollo-software.html', icon: 'fa-code' }
  ],

  nav: [
    { id: 'inicio', label: 'Inicio', href: 'index.html', icon: 'fa-house' },
    { id: 'servicios', label: 'Servicios', href: 'index.html#servicios-detalle', icon: 'fa-briefcase' },
    {
      id: 'temas',
      label: 'Especialidades',
      icon: 'fa-tags',
      children: [
        { id: 'derecho',         label: 'Derecho',                                  href: 'pages/derecho.html',              icon: 'fa-scale-balanced' },
        { id: 'catastro',        label: 'Catastro',                                 href: 'pages/catastro.html',             icon: 'fa-map' },
        { id: 'ordenamiento',    label: 'Ordenamiento Territorial',                 href: 'pages/ordenamiento.html',         icon: 'fa-compass-drafting' },
        { id: 'geografia',       label: 'Geografía',                                href: 'pages/geografia.html',            icon: 'fa-earth-americas' },
        { id: 'topogeodesia',    label: 'Topografía y Geodesia',                    href: 'pages/topogeodesia.html',         icon: 'fa-mountain' },
        { id: 'geomantica',      label: 'Geomática',                                href: 'pages/geomantica.html',           icon: 'fa-layer-group' },
        { id: 'desarrollo',      label: 'Software y Aplicaciones Web',              href: 'pages/desarrollo-software.html',  icon: 'fa-code' }
      ]
    },
    { id: 'recursos', label: 'Recursos', href: 'pages/recursos.html', icon: 'fa-folder-open' },
    { id: 'blog', label: 'Blog', href: '__BLOG__', icon: 'fa-newspaper' },
    { id: 'acerca', label: 'Sobre Mí', href: 'pages/acerca-de.html', icon: 'fa-user' },
    { id: 'contacto', label: 'Contacto', href: 'pages/contacto.html', icon: 'fa-envelope' }
  ]
};
