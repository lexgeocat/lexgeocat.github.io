import type { RouteRecordRaw } from 'vue-router'

const adminRoutes: RouteRecordRaw[] = [
  { path: '', redirect: { name: 'admin-servicios' } },
  { path: 'login', name: 'admin-login', component: () => import('./views/Login.vue'), meta: { public: true } },
  { path: 'servicios', name: 'admin-servicios', component: () => import('./views/ServiciosAdmin.vue') },
  { path: 'cotizaciones', name: 'admin-cotizaciones', component: () => import('./views/CotizacionesAdmin.vue') },
  { path: 'factores', name: 'admin-factores', component: () => import('./views/FactoresAdmin.vue') },
  { path: 'normativa', name: 'admin-normativa', component: () => import('./views/NormativaAdmin.vue') },
]

export default adminRoutes