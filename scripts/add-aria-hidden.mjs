import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const targets = ['src', 'public']
const exts = new Set(['.vue', '.ts', '.html'])

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === 'vendor') continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, files)
    else if (exts.has(extname(full))) files.push(full)
  }
  return files
}

let changed = 0
for (const file of targets.flatMap((d) => walk(d))) {
  const original = readFileSync(file, 'utf8')
  const updated = original
    .replace(/<i\s+class="fa-/g, '<i aria-hidden="true" class="fa-')
    .replace(/<i\s+:class="'fa-/g, '<i aria-hidden="true" :class="\'fa-')
  if (updated !== original) {
    writeFileSync(file, updated)
    changed++
    console.log('✓', file)
  }
}
console.log(`aria-hidden añadido en ${changed} archivo(s)`)
