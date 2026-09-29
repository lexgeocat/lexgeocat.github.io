import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTES, SITE_URL } from '../src/routes.meta.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sitemapOut = join(root, 'public/sitemap-lgc.xml')

// Fecha en zona horaria de Bolivia (evita lastmod "futuro" por UTC)
const lastmod = new Date().toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' })

function buildSitemap() {
  const urls = ROUTES.map(
    (r) => `  <url>\n    <loc>${SITE_URL}${r.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function validateJsonld() {
  for (const name of ['organization.json', 'website.json']) {
    const data = JSON.parse(readFileSync(join(root, 'scripts/jsonld', name), 'utf8'))
    if (!data['@context'] || !data['@type']) throw new Error(`[jsonld] ${name} sin @context/@type`)
  }
}

mkdirSync(dirname(sitemapOut), { recursive: true })
writeFileSync(sitemapOut, buildSitemap(), 'utf8')
validateJsonld()
console.log(`[sitemap] ${ROUTES.length} URLs (lastmod ${lastmod})`)