import { createRouter, createWebHistory } from 'vue-router'
import { getSupabase } from '../lib/supabase/client'
import adminRoutes from '../admin/routes'
import { seo } from '../routes.meta'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    {
      path: '/admin',
      component: () => import('../admin/AdminApp.vue'),
      children: adminRoutes,
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: {
        ...seo('/pages/index.html'),
        navLabel: 'Inicio',
        navIcon: 'fa-house',
      },
    },
    {
      path: '/pages/servicios.html',
      name: 'servicios',
      component: () => import('../views/Servicios.vue'),
      meta: {
        ...seo('/pages/servicios.html'), navLabel: 'Servicios', navIcon: 'fa-briefcase'
      }
    },
    {
      path: '/pages/derecho.html',
      name: 'derecho',
      component: () => import('../views/Derecho.vue'),
      meta: {
        ...seo('/pages/derecho.html'),
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
        ...seo('/pages/catastro.html'),
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
        ...seo('/pages/ordenamiento.html'),
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
        ...seo('/pages/geografia.html'),
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
        ...seo('/pages/topogeodesia.html'),
        navLabel: 'Topografía y Geodesia',
        navIcon: 'fa-mountains',
        navGroup: 'Especialidades',
      },
    },
    {
      path: '/pages/geomatica.html',
      name: 'geomatica',
      component: () => import('../views/Geomatica.vue'),
      meta: {
        ...seo('/pages/geomatica.html'),
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
        ...seo('/pages/desarrollo-software.html'),
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
        ...seo('/pages/acerca-de.html'),
        navLabel: 'Sobre Mí',
        navIcon: 'fa-user',
      },
    },
    {
      path: '/pages/contacto.html',
      name: 'contacto',
      component: () => import('../views/Contacto.vue'),
      meta: {
        ...seo('/pages/contacto.html'),
        navLabel: 'Contacto',
        navIcon: 'fa-envelope',
      },
    },
    {
      path: '/pages/recursos.html',
      name: 'recursos',
      component: () => import('../views/Recursos.vue'),
      meta: {
        ...seo('/pages/recursos.html'),
        navLabel: 'Recursos',
        navIcon: 'fa-folder-open',
      },
    },
    {
      path: '/pages/normativa.html',
      name: 'normativa',
      component: () => import('../views/Normativa.vue'),
      meta: {
        ...seo('/pages/normativa.html'),
        navLabel: 'Normativa',
        navIcon: 'fa-gavel',
      },
    },
    {
      path: '/pages/privacidad.html',
      name: 'privacidad',
      component: () => import('../views/Privacidad.vue'),
      meta: {
        ...seo('/pages/privacidad.html'),
      },
    },
    {
      path: '/pages/terminos.html',
      name: 'terminos',
      component: () => import('../views/Terminos.vue'),
      meta: {
        ...seo('/pages/terminos.html'),
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

interface GoatCounterWindow {
  goatcounter?: {
    count?: (opts: { path: string }) => void
  }
}

// src/router/index.ts — reemplazar el bloque router.beforeEach
router.beforeEach(async (to) => {
  if (to.path.startsWith('/admin')) {
    if (to.matched.some((r) => r.meta?.public)) return true
    const { data } = await getSupabase().auth.getSession()
    if (!data.session) return { name: 'admin-login' }
  }
  return true
})

router.afterEach((to) => {
  const gc = (window as unknown as GoatCounterWindow).goatcounter
  if (typeof gc?.count === 'function') {
    gc.count({ path: to.fullPath })
  }
})

export default router
