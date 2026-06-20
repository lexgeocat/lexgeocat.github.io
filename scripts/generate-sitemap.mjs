import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE_URL = 'https://lexgeocat.github.io'
const routesFile = join(root, 'src/routes.meta.ts')
const sitemapOut = join(root, 'public/sitemap.xml')

function readRoutes() {
  const src = readFileSync(routesFile, 'utf8')
  const re =
    /path:\s*'([^']+)',\s*changefreq:\s*'([^']+)',\s*priority:\s*([\d.]+)/g
  const routes = []
  let m
  while ((m = re.exec(src)) !== null) {
    routes.push({ path: m[1], changefreq: m[2], priority: Number.parseFloat(m[3]) })
  }
  if (!routes.length) {
    throw new Error('[sitemap] No se pudieron extraer rutas de src/routes.meta.ts')
  }
  return routes
}

function buildSitemap(routes) {
  const lastmod = new Date().toISOString().slice(0, 10)
  const urls = routes
    .map(
      (r) =>
        `  <url>\n    <loc>${SITE_URL}${r.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function validateJsonld() {
  for (const name of ['organization.json', 'website.json']) {
    const file = join(root, 'scripts/jsonld', name)
    try {
      const data = JSON.parse(readFileSync(file, 'utf8'))
      if (!data['@context'] || !data['@type']) {
        throw new Error(`[jsonld] ${name} falta @context o @type`)
      }
    } catch (err) {
      throw new Error(`[jsonld] ${name} inválido: ${err.message}`)
    }
  }
}

function main() {
  const routes = readRoutes()
  const sitemap = buildSitemap(routes)
  mkdirSync(dirname(sitemapOut), { recursive: true })
  writeFileSync(sitemapOut, sitemap, 'utf8')
  validateJsonld()
  console.log(
    `[sitemap] ${routes.length} URLs escritas en public/sitemap.xml (lastmod ${new Date().toISOString().slice(0, 10)})`,
  )
  console.log('[jsonld] organization.json + website.json validados')
}

main()
