/**
 * LexGeoCat — Configuración del sitio estático (GitHub Pages)
 * Ajusta blogUrl y basePath antes de publicar.
 */
window.LGC_CONFIG = {
  siteName: 'LexGeoCat',
  tagline: 'Derecho · Catastro · Geomática · Tecnología',

  /** Ruta base si usas GitHub Pages en subcarpeta: '/nombre-repo/' — raíz: '' */
  basePath: '',

  /** Blog alojado en Blogger (enlace externo desde este sitio) */
  blogUrl: 'https://lexgeocat.blogspot.com/',
  bloggerFeed: 'https://lexgeocat.blogspot.com/feeds/posts/default',
  bloggerSearch: 'https://lexgeocat.blogspot.com/search?q=',

  email: 'lexgeocat@gmail.com',
  whatsapp: '59170000000',
  location: 'Viacha, Departamento de La Paz, Bolivia',
  rnt: '970285',

  social: {
    facebook: 'https://www.facebook.com/lexgeocat',
    youtube: 'https://www.youtube.com/@lexgeocat',
    linkedin: 'https://www.linkedin.com/in/lexgeocat',
    whatsapp: 'https://wa.me/59170000000'
  },

  nav: [
    { id: 'inicio', label: 'Inicio', href: 'index.html', icon: 'fa-house' },
    { id: 'servicios', label: 'Servicios', href: 'index.html#servicios-detalle', icon: 'fa-briefcase' },
    {
      id: 'temas',
      label: 'Temas',
      icon: 'fa-tags',
      children: [
        { id: 'derecho', label: 'Derecho', href: 'pages/derecho.html', icon: 'fa-scale-balanced' },
        { id: 'catastro', label: 'Catastro Multifinalitario', href: 'pages/catastro.html', icon: 'fa-map' },
        { id: 'gis', label: 'SIG & Geomática', href: 'pages/gis.html', icon: 'fa-layer-group' },
        { id: 'ordenamiento', label: 'Ordenamiento Territorial', href: 'pages/ordenamiento.html', icon: 'fa-compass-drafting' },
        { id: 'tecnologia', label: 'Tecnología e Innovación', href: 'pages/tecnologia.html', icon: 'fa-microchip' }
      ]
    },
    { id: 'recursos', label: 'Recursos', href: 'pages/recursos.html', icon: 'fa-folder-open' },
    { id: 'blog', label: 'Blog', href: '__BLOG__', icon: 'fa-newspaper', external: true },
    { id: 'acerca', label: 'Sobre Mí', href: 'pages/acerca-de.html', icon: 'fa-user' },
    { id: 'contacto', label: 'Contacto', href: 'pages/contacto.html', icon: 'fa-envelope' }
  ]
};
