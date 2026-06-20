export interface RouteMeta {
  path: string
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: number
  noindex?: boolean
}

export const ROUTES: RouteMeta[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/pages/servicios.html', changefreq: 'weekly', priority: 0.9 },
  { path: '/pages/derecho.html', changefreq: 'monthly', priority: 0.8 },
  { path: '/pages/catastro.html', changefreq: 'monthly', priority: 0.8 },
  { path: '/pages/ordenamiento.html', changefreq: 'monthly', priority: 0.8 },
  { path: '/pages/geografia.html', changefreq: 'monthly', priority: 0.8 },
  { path: '/pages/topogeodesia.html', changefreq: 'monthly', priority: 0.8 },
  { path: '/pages/geomantica.html', changefreq: 'monthly', priority: 0.8 },
  { path: '/pages/desarrollo-software.html', changefreq: 'monthly', priority: 0.8 },
  { path: '/pages/acerca-de.html', changefreq: 'monthly', priority: 0.6 },
  { path: '/pages/contacto.html', changefreq: 'monthly', priority: 0.7 },
  { path: '/pages/recursos.html', changefreq: 'monthly', priority: 0.6 },
  { path: '/pages/normativa.html', changefreq: 'weekly', priority: 0.7 },
  { path: '/pages/privacidad.html', changefreq: 'yearly', priority: 0.3 },
  { path: '/pages/terminos.html', changefreq: 'yearly', priority: 0.3 },
  { path: '/admin', changefreq: 'monthly', priority: 0.1, noindex: true },
]
