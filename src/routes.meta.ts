export interface RouteMeta {
  path: string
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: number
  noindex?: boolean
}

export const ROUTES: RouteMeta[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/blog', changefreq: 'weekly', priority: 0.9 },
  { path: '/servicios', changefreq: 'weekly', priority: 0.9 },
  { path: '/derecho', changefreq: 'monthly', priority: 0.8 },
  { path: '/catastro', changefreq: 'monthly', priority: 0.8 },
  { path: '/ordenamiento', changefreq: 'monthly', priority: 0.8 },
  { path: '/geografia', changefreq: 'monthly', priority: 0.8 },
  { path: '/topogeodesia', changefreq: 'monthly', priority: 0.8 },
  { path: '/geomatica', changefreq: 'monthly', priority: 0.8 },
  { path: '/desarrollo-software', changefreq: 'monthly', priority: 0.8 },
  { path: '/acerca-de', changefreq: 'monthly', priority: 0.6 },
  { path: '/contacto', changefreq: 'monthly', priority: 0.7 },
  { path: '/recursos', changefreq: 'monthly', priority: 0.6 },
  { path: '/normativa', changefreq: 'weekly', priority: 0.7 },
  { path: '/privacidad', changefreq: 'yearly', priority: 0.3 },
  { path: '/terminos', changefreq: 'yearly', priority: 0.3 },
  { path: '/admin', changefreq: 'monthly', priority: 0.1, noindex: true },
]
