import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vendor = join(root, 'public/assets/vendor')
const nm = join(root, 'node_modules')

const ensureDir = (p) => mkdirSync(p, { recursive: true })

function copyFile(src, dest) {
  ensureDir(dirname(dest))
  copyFileSync(src, dest)
}

function forceSwap(content) {
  return content.includes('font-display')
    ? content.replace(/font-display:\s*[a-z-]+;/g, 'font-display: swap;')
    : content.replace(/@font-face\s*\{/g, '@font-face{font-display:swap;')
}

// Font Awesome — solo solid + regular + brands (sin light/thin/duotone)
const faSrc = join(nm, '@fortawesome/fontawesome-free')
const faDest = join(vendor, 'fontawesome')
for (const css of ['fontawesome.min.css', 'solid.min.css', 'regular.min.css', 'brands.min.css']) {
  const content = forceSwap(readFileSync(join(faSrc, 'css', css), 'utf8'))
  ensureDir(join(faDest, 'css'))
  writeFileSync(join(faDest, 'css', css), content)
}
for (const woff of ['fa-solid-900.woff2', 'fa-regular-400.woff2', 'fa-brands-400.woff2']) {
  copyFile(join(faSrc, 'webfonts', woff), join(faDest, 'webfonts', woff))
}

// Tipografías — solo los pesos usados en el código (@fontsource)
const wanted = {
  'dm-serif-display': ['400.css', '400-italic.css'],
  syne: ['400.css', '600.css', '700.css', '800.css'],
  inter: ['400.css', '600.css', '700.css'],
  'jetbrains-mono': ['400.css', '600.css'],
}
for (const [pkg, files] of Object.entries(wanted)) {
  const pkgSrc = join(nm, '@fontsource', pkg)
  const destDir = join(vendor, 'fonts', pkg)
  for (const file of files) {
    const raw = readFileSync(join(pkgSrc, file), 'utf8')
    ensureDir(destDir)
    writeFileSync(join(destDir, file), raw)
    const woffs = [...raw.matchAll(/url\(\.\/files\/([^)]+\.woff2)\)/g)].map((m) => m[1])
    for (const w of woffs) copyFile(join(pkgSrc, 'files', w), join(destDir, 'files', w))
  }
}

console.log('[vendor] Font Awesome y tipografías copiadas a public/assets/vendor')
