import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTES, SITE_URL } from '../src/routes.meta.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const PLACEHOLDER = /<meta name="seo-placeholder"[^>]*>/
if (!PLACEHOLDER.test(template)) {
    throw new Error('[prerender] falta <meta name="seo-placeholder"> en index.html')
}

const OG_IMAGE = `${SITE_URL}/og-image.png`
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const jsonLd = (obj) =>
    `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`

function headFor(r, { noindex = false } = {}) {
    const url = SITE_URL + r.path
    const t = esc(r.title)
    const d = esc(r.description)
    const lines = [
        `<title>${t}</title>`,
        `<meta name="description" content="${d}" />`,
        `<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}" />`,
    ]
    if (!noindex) {
        lines.push(
            `<link rel="canonical" href="${url}" />`,
            `<meta property="og:type" content="website" />`,
            `<meta property="og:site_name" content="LexGeoCat" />`,
            `<meta property="og:locale" content="es_BO" />`,
            `<meta property="og:url" content="${url}" />`,
            `<meta property="og:title" content="${t}" />`,
            `<meta property="og:description" content="${d}" />`,
            `<meta property="og:image" content="${OG_IMAGE}" />`,
            `<meta property="og:image:width" content="1200" />`,
            `<meta property="og:image:height" content="630" />`,
            `<meta property="og:image:alt" content="LexGeoCat — Derecho, Catastro y Geomática" />`,
            `<meta name="twitter:card" content="summary_large_image" />`,
            `<meta name="twitter:title" content="${t}" />`,
            `<meta name="twitter:description" content="${d}" />`,
            `<meta name="twitter:image" content="${OG_IMAGE}" />`,
        )
        if (r.path !== '/') {
            lines.push(
                jsonLd({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL + '/' },
                        { '@type': 'ListItem', position: 2, name: r.crumb, item: url },
                    ],
                }),
            )
        }
    }
    return lines.join('\n    ')
}

function write(file, html) {
    const out = join(dist, file)
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, html, 'utf8')
}

for (const r of ROUTES) {
    const file = r.path === '/' ? 'index.html' : r.path.replace(/^\//, '')
    write(file, template.replace(PLACEHOLDER, headFor(r)))
}

write(
    '404.html',
    template.replace(
        PLACEHOLDER,
        headFor(
            {
                path: '/404',
                title: 'Página no encontrada | LexGeoCat',
                description: 'La página que buscas no existe o fue movida.',
            },
            { noindex: true },
        ),
    ),
)

console.log(`[prerender] ${ROUTES.length} rutas + 404.html generadas en dist/`)