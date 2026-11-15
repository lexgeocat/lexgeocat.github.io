#!/usr/bin/env node
/**
 * Compila `scripts/blogger-template.xml` inyectando la configuración oficial de
 * `src/config/site.ts`, valida la integridad XML de Blogger y actualiza:
 *  - `dist/blogspot.xml` (artefacto desplegable / descargable)
 *  - `../blogspot.xml` (cuando el archivo maestro local está presente)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SITE_TS_PATH = path.join(ROOT, 'src', 'config', 'site.ts')
const TEMPLATE_PATH = path.join(__dirname, 'blogger-template.xml')
const DIST_OUT = path.join(ROOT, 'dist', 'blogspot.xml')
const PARENT_OUT = path.resolve(ROOT, '..', 'blogspot.xml')

function extractTsValue(source, key, scope) {
  const block = scope ?? source
  const re = new RegExp(`\\b${key}\\s*:\\s*'([^']*)'`)
  const m = block.match(re)
  if (!m) {
    throw new Error(`No se pudo extraer "${key}" desde src/config/site.ts`)
  }
  return m[1]
}

function extractTsBlock(source, blockName) {
  const re = new RegExp(`\\b${blockName}\\s*:\\s*\\{([\\s\\S]*?)\\}`)
  const m = source.match(re)
  if (!m) {
    throw new Error(`No se pudo extraer el bloque "${blockName}" desde src/config/site.ts`)
  }
  return m[1]
}

function readSiteConfig() {
  const src = fs.readFileSync(SITE_TS_PATH, 'utf8')
  const socialBlock = extractTsBlock(src, 'social')
  const blogBlock = extractTsBlock(src, 'blog')

  const siteUrl = extractTsValue(src, 'url').replace(/\/+$/, '')
  return {
    SITE_NAME: extractTsValue(src, 'name'),
    SITE_TAGLINE: extractTsValue(src, 'tagline'),
    SITE_URL: siteUrl,
    SITE_EMAIL: extractTsValue(src, 'email'),
    SITE_WHATSAPP: extractTsValue(src, 'whatsapp'),
    SITE_WHATSAPP_NUMBER: extractTsValue(src, 'whatsappNumber'),
    SITE_LOCATION: extractTsValue(src, 'location'),
    SITE_FOUNDER: extractTsValue(src, 'founder'),
    SOCIAL_FACEBOOK: extractTsValue(src, 'facebook', socialBlock),
    SOCIAL_LINKEDIN: extractTsValue(src, 'linkedin', socialBlock),
    SOCIAL_YOUTUBE: extractTsValue(src, 'youtube', socialBlock),
    SOCIAL_WHATSAPP: extractTsValue(src, 'whatsapp', socialBlock),
    BLOG_URL: extractTsValue(src, 'url', blogBlock).replace(/\/+$/, ''),
    GOATCOUNTER_WORKER: extractTsValue(src, 'worker').replace(/\/+$/, ''),
    GOATCOUNTER_SITE: extractTsValue(src, 'goatcounter').replace(/\/+$/, ''),
    ISOTIPO_URL: `${siteUrl}/isotipo.webp`,
  }
}

function stripCdataAndComments(xml) {
  return xml
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

function validateBloggerXml(xml) {
  const errors = []

  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    errors.push('Falta la declaración <?xml version="1.0" encoding="UTF-8"?> al inicio.')
  }

  for (const required of [
    "id='Header1'",
    "id='Blog1'",
    "id='PopularPosts1'",
    '<b:skin><![CDATA[',
  ]) {
    if (!xml.includes(required)) {
      errors.push(`Falta bloque requerido de Blogger: ${required}`)
    }
  }

  const unresolved = xml.match(/\{\{[A-Z0-9_]+\}\}/g)
  if (unresolved) {
    errors.push(`Placeholders sin resolver: ${[...new Set(unresolved)].join(', ')}`)
  }

  // Verificar ausencia de cadenas legadas o rotas
  const stripped = stripCdataAndComments(xml)
  const forbiddenOutsideCdata = [
    { label: 'Viacha', re: /\bViacha\b/i },
    { label: 'Sobre Mí', re: /Sobre\s+M[ií]/ },
    { label: 'URL rota geomantica.html', re: /\/pages\/geomantica\.html/ },
    { label: 'Logo antiguo bloggerusercontent PNG', re: /lexgeocat\.png/ },
  ]
  for (const check of forbiddenOutsideCdata) {
    if (check.re.test(stripped) || check.re.test(xml.replace(/\/p\/geomantica/g, ''))) {
      errors.push(`Contenido obsoleto detectado: ${check.label}`)
    }
  }

  // Verificar entidades & sin escapar fuera de CDATA
  const badAmp = stripped.match(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g)
  if (badAmp) {
    errors.push(`Se encontraron ${badAmp.length} símbolos "&" sin escapar fuera de CDATA.`)
  }

  // Verificar balance básico de etiquetas XML fuera de CDATA/comentarios/DOCTYPE/PI
  const markupOnly = stripped
    .replace(/<\?[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
  const stack = []
  const tagRe = /<\/?([a-zA-Z_][\w:-]*)(?:\s+(?:'[^']*'|"[^"]*"|[^<>])*?)?\s*\/?>/g
  let m
  while ((m = tagRe.exec(markupOnly)) !== null) {
    const full = m[0]
    const name = m[1]
    const isClose = full.startsWith('</')
    const isSelf = full.endsWith('/>')
    if (isSelf) continue
    if (isClose) {
      const last = stack.pop()
      if (last !== name) {
        errors.push(`Desbalance XML: se esperaba </${last ?? '(ninguno)'}> pero apareció </${name}>`)
        break
      }
    } else {
      stack.push(name)
    }
  }
  if (stack.length > 0 && !errors.some((e) => e.startsWith('Desbalance XML'))) {
    errors.push(`Etiquetas XML sin cerrar: ${stack.join(', ')}`)
  }

  if (errors.length > 0) {
    throw new Error(`Validación Blogger XML fallida:\n- ${errors.join('\n- ')}`)
  }
}

function main() {
  const args = process.argv.slice(2)
  const customOutIdx = args.indexOf('--out')
  const customOut = customOutIdx >= 0 ? args[customOutIdx + 1] : null

  const cfg = readSiteConfig()
  let xml = fs.readFileSync(TEMPLATE_PATH, 'utf8')

  for (const [key, value] of Object.entries(cfg)) {
    xml = xml.split(`{{${key}}}`).join(value)
  }

  validateBloggerXml(xml)

  const targets = [DIST_OUT]
  if (fs.existsSync(PARENT_OUT)) {
    targets.push(PARENT_OUT)
  }
  if (customOut) {
    targets.push(path.resolve(process.cwd(), customOut))
  }

  for (const dest of targets) {
    try {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, xml, 'utf8')
      console.log(`[build-blogger-theme] Generado y validado: ${dest}`)
    } catch (err) {
      if (dest === PARENT_OUT && (err.code === 'EPERM' || err.code === 'EACCES')) {
        console.warn(`[build-blogger-theme] Omitida sincronización externa (${dest}): ${err.code}`)
      } else {
        throw err
      }
    }
  }
}

main()
