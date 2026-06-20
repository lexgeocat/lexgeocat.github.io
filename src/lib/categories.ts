import type { BloggerEntry } from '../types/blogger'

export interface CategoryMeta {
  cls: string
  label: string
}

export const CAT_MAP: Record<string, CategoryMeta> = {
  derecho: { cls: 'gold', label: 'Derecho' },
  legal: { cls: 'gold', label: 'Derecho' },
  gis: { cls: 'teal', label: 'GIS' },
  geomática: { cls: 'teal', label: 'GIS' },
  sig: { cls: 'teal', label: 'GIS' },
  geoinformacion: { cls: 'teal', label: 'GIS' },
  catastro: { cls: 'white', label: 'Catastro' },
}

export const CATEGORY_ICON_MAP: Record<string, string> = {
  Derecho: 'fa-scale-balanced',
  GIS: 'fa-map-location-dot',
  Catastro: 'fa-draw-polygon',
}

export const CATEGORY_GRAD_MAP: Record<string, string> = {
  Derecho:
    'linear-gradient(135deg,var(--color-esp-derecho-bg-from),var(--color-esp-derecho-bg-to))',
  GIS: 'linear-gradient(135deg,var(--color-esp-geomatica-bg-from),var(--color-esp-geomatica-bg-to))',
  Catastro:
    'linear-gradient(135deg,var(--color-esp-catastro-bg-from),var(--color-esp-catastro-bg-to))',
}

export function detectCategory(labels: BloggerEntry['category']): CategoryMeta {
  if (!labels?.length) return { cls: 'white', label: 'Catastro' }
  for (const c of labels) {
    const key = (c.$t || '').toLowerCase()
    for (const k of Object.keys(CAT_MAP)) {
      if (key.includes(k)) return CAT_MAP[k]!
    }
  }
  const first = (labels[0]!.$t || '').trim()
  return { cls: 'white', label: first || 'Blog' }
}

export function getCategoryIcon(label: string): string {
  return CATEGORY_ICON_MAP[label] || 'fa-newspaper'
}

export function getCategoryGrad(label: string): string {
  return CATEGORY_GRAD_MAP[label] || 'linear-gradient(135deg,var(--bg3),var(--bg2))'
}
