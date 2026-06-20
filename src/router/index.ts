import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: {
        title: 'LexGeoCat — Derecho, Catastro y Geomática en Bolivia',
        description: 'Servicios profesionales en Derecho, Catastro, Ordenamiento Territorial, Geografía, Topografía, Geodesia, Geomática y Desarrollo de Software en Bolivia.',
        navLabel: 'Inicio',
        navIcon: 'fa-house',
      },
    },
    {
      path: '/pages/servicios.html',
      name: 'servicios',
      component: () => import('../views/Servicios.vue'),
      meta: {
        title: 'Servicios Profesionales — Derecho, Catastro y Geomática | LexGeoCat',
        description: 'Consultoría integral en derecho territorial, catastro, ordenamiento, topografía, geomática y desarrollo de software en Bolivia. Cotización en línea.',
        navLabel: 'Servicios',
        navIcon: 'fa-briefcase',
      },
    },
    {
      path: '/pages/derecho.html',
      name: 'derecho',
      component: () => import('../views/Derecho.vue'),
      meta: {
        title: 'Derecho — Legislación Boliviana y Derecho Territorial | LexGeoCat',
        description: 'Asesoría legal en derecho civil, usucapión, derecho registral, notarial y normativa territorial boliviana.',
        navLabel: 'Derecho',
        navIcon: 'fa-scale-balanced',
        navGroup: 'Especialidades',
      },
    },
    {
      path: '/pages/catastro.html',
      name: 'catastro',
      component: () => import('../views/Catastro.vue'),
      meta: {
        title: 'Catastro Multifinalitario en Bolivia | LexGeoCat',
        description: 'Registro predial, fichas catastrales, valuación fiscal y nomenclatura catastral en Bolivia.',
        navLabel: 'Catastro',
        navIcon: 'fa-map',
        navGroup: 'Especialidades',
      },
    },
    {
      path: '/pages/ordenamiento.html',
      name: 'ordenamiento',
      component: () => import('../views/Ordenamiento.vue'),
      meta: {
        title: 'Ordenamiento Territorial en Bolivia | LexGeoCat',
        description: 'Planificación urbana, zonificación, uso de suelo y gestión territorial municipal en Bolivia.',
        navLabel: 'Ord. Territorial',
        navIcon: 'fa-compass-drafting',
        navGroup: 'Especialidades',
      },
    },
    {
      path: '/pages/geografia.html',
      name: 'geografia',
      component: () => import('../views/Geografia.vue'),
      meta: {
        title: 'Geografía — Estudios Territoriales en Bolivia | LexGeoCat',
        description: 'Análisis del territorio boliviano: geografía física, humana, regional, urbana y rural.',
        navLabel: 'Geografía',
        navIcon: 'fa-earth-americas',
        navGroup: 'Especialidades',
      },
    },
    {
      path: '/pages/topogeodesia.html',
      name: 'topogeodesia',
      component: () => import('../views/TopoGeodesia.vue'),
      meta: {
        title: 'Topografía y Geodesia en Bolivia | LexGeoCat',
        description: 'Levantamientos topográficos, posicionamiento GNSS, redes geodésicas y georeferenciación profesional en Bolivia.',
        navLabel: 'Topografía y Geodesia',
        navIcon: 'fa-mountains',
        navGroup: 'Especialidades',
      },
    },
    {
      path: '/pages/geomantica.html',
      name: 'geomantica',
      component: () => import('../views/Geomatica.vue'),
      meta: {
        title: 'Geomática y SIG en Bolivia | LexGeoCat',
        description: 'Sistemas de información geográfica, teledetección, PostGIS/QGIS y análisis espacial avanzado en Bolivia.',
        navLabel: 'Geomática',
        navIcon: 'fa-layer-group',
        navGroup: 'Especialidades',
      },
    },
    {
      path: '/pages/desarrollo-software.html',
      name: 'desarrollo-software',
      component: () => import('../views/DesarrolloSoftware.vue'),
      meta: {
        title: 'Desarrollo de Software y Aplicaciones Web GIS | LexGeoCat',
        description: 'Aplicaciones web geográficas, APIs geoespaciales y sistemas de gestión territorial a medida en Bolivia.',
        navLabel: 'Software',
        navIcon: 'fa-code',
        navGroup: 'Especialidades',
      },
    },
    {
      path: '/pages/acerca-de.html',
      name: 'acerca-de',
      component: () => import('../views/AcercaDe.vue'),
      meta: {
        title: 'Sobre Mí — Cristian Ruiz Quiroga | LexGeoCat',
        description: 'Técnico en Catastro y Ordenamiento Territorial, Licenciado en Derecho. R.N.T. 970285 y R.P.A. 13437938CBRQ.',
        navLabel: 'Sobre Mí',
        navIcon: 'fa-user',
      },
    },
    {
      path: '/pages/contacto.html',
      name: 'contacto',
      component: () => import('../views/Contacto.vue'),
      meta: {
        title: 'Contacto | LexGeoCat',
        description: 'Consultas profesionales en derecho, catastro y geomática en Bolivia. Escríbenos por WhatsApp o correo.',
        navLabel: 'Contacto',
        navIcon: 'fa-envelope',
      },
    },
    {
      path: '/pages/recursos.html',
      name: 'recursos',
      component: () => import('../views/Recursos.vue'),
      meta: {
        title: 'Recursos y Herramientas | LexGeoCat',
        description: 'Formatos legales, guías catastrales, tutoriales SIG y recursos técnicos para profesionales del territorio.',
        navLabel: 'Recursos',
        navIcon: 'fa-folder-open',
      },
    },
    {
      path: '/pages/normativa.html',
      name: 'normativa',
      component: () => import('../views/Normativa.vue'),
      meta: {
        title: 'Biblioteca Jurídica — Normativa Legal Boliviana | LexGeoCat',
        description: 'Leyes, códigos, decretos reglamentarios, jurisprudencia y doctrina del ordenamiento jurídico boliviano.',
        navLabel: 'Normativa',
        navIcon: 'fa-gavel',
      },
    },
    {
      path: '/pages/privacidad.html',
      name: 'privacidad',
      component: () => import('../views/Privacidad.vue'),
      meta: {
        title: 'Política de Privacidad | LexGeoCat',
        description: 'Política de privacidad y tratamiento de datos de LexGeoCat.',
      },
    },
    {
      path: '/pages/terminos.html',
      name: 'terminos',
      component: () => import('../views/Terminos.vue'),
      meta: {
        title: 'Términos de Uso | LexGeoCat',
        description: 'Términos y condiciones de uso del sitio LexGeoCat.',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
      meta: {
        title: 'Página no encontrada | LexGeoCat',
        description: 'La página que buscas no existe o fue movida.',
        noindex: true,
      },
    },
  ],
})

router.afterEach((to) => {
  if (typeof (window as any).goatcounter?.count === 'function') {
    (window as any).goatcounter.count({ path: to.fullPath })
  }
})

export default router