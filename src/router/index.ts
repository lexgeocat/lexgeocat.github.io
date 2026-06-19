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
    },
    {
      path: '/pages/servicios.html',
      name: 'servicios',
      component: () => import('../views/Servicios.vue'),
    },
    {
      path: '/pages/derecho.html',
      name: 'derecho',
      component: () => import('../views/Derecho.vue'),
    },
    {
      path: '/pages/catastro.html',
      name: 'catastro',
      component: () => import('../views/Catastro.vue'),
    },
    {
      path: '/pages/ordenamiento.html',
      name: 'ordenamiento',
      component: () => import('../views/Ordenamiento.vue'),
    },
    {
      path: '/pages/geografia.html',
      name: 'geografia',
      component: () => import('../views/Geografia.vue'),
    },
    {
      path: '/pages/topogeodesia.html',
      name: 'topogeodesia',
      component: () => import('../views/TopoGeodesia.vue'),
    },
    {
      path: '/pages/geomantica.html',
      name: 'geomantica',
      component: () => import('../views/Geomatica.vue'),
    },
    {
      path: '/pages/desarrollo-software.html',
      name: 'desarrollo-software',
      component: () => import('../views/DesarrolloSoftware.vue'),
    },
    {
      path: '/pages/acerca-de.html',
      name: 'acerca-de',
      component: () => import('../views/AcercaDe.vue'),
    },
    {
      path: '/pages/contacto.html',
      name: 'contacto',
      component: () => import('../views/Contacto.vue'),
    },
    {
      path: '/pages/recursos.html',
      name: 'recursos',
      component: () => import('../views/Recursos.vue'),
    },
    {
      path: '/pages/normativa.html',
      name: 'normativa',
      component: () => import('../views/Normativa.vue'),
    },
    {
      path: '/pages/privacidad.html',
      name: 'privacidad',
      component: () => import('../views/Privacidad.vue'),
    },
    {
      path: '/pages/terminos.html',
      name: 'terminos',
      component: () => import('../views/Terminos.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
    },
  ],
})

router.afterEach((to) => {
  if (typeof (window as any).goatcounter?.count === 'function') {
    (window as any).goatcounter.count({ path: to.fullPath })
  }
})

export default router
