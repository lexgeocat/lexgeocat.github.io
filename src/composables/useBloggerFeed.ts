import { ref } from 'vue'
import { SITE } from '../config/site'
import type { BloggerEntry, BloggerFeed } from '../types/blogger'

export interface BlogEntry {
  id: string
  title: string
  url: string
  thumb: string
  excerpt: string
  date: string
  categoryLabel: string
  categoryCls: string
}

const CAT_MAP: Record<string, { cls: string; label: string }> = {
  derecho: { cls: 'gold', label: 'Derecho' },
  legal: { cls: 'gold', label: 'Derecho' },
  gis: { cls: 'teal', label: 'GIS' },
  geomática: { cls: 'teal', label: 'GIS' },
  sig: { cls: 'teal', label: 'GIS' },
  geoinformacion: { cls: 'teal', label: 'GIS' },
  catastro: { cls: 'white', label: 'Catastro' },
}

function detectCat(labels: BloggerEntry['category']): { cls: string; label: string } {
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

function parseEntry(
  e: BloggerEntry,
  overrideCls?: string,
  overrideLabel?: string,
): BlogEntry {
  const title =
    e.title?.$t?.trim() ||
    (() => {
      const links = e.link || []
      for (const l of links) {
        if (l.rel === 'alternate') {
          const slug = l.href.replace(/\/+$/, '').split('/').pop() || ''
          const s = slug.replace(/-/g, ' ').trim()
          if (s.length > 5) return s.charAt(0).toUpperCase() + s.slice(1)
        }
      }
      return 'Sin título'
    })()

  const url =
    (e.link || []).find((l) => l.rel === 'alternate')?.href || SITE.blog.url
  const rawThumb = e['media$thumbnail']?.url || ''
  const thumb = rawThumb
    ? rawThumb.replace('/s72-c/', '/s600-c/').replace(/&amp;/g, '&')
    : ''
  const html = e.content?.$t || e.summary?.$t || ''
  const excerpt = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 130)
  const date = e.published?.$t
    ? new Date(e.published.$t).toLocaleDateString('es', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''
  const cat =
    overrideCls && overrideLabel
      ? { cls: overrideCls, label: overrideLabel }
      : detectCat(e.category || [])

  return {
    id: url,
    title,
    url,
    thumb,
    excerpt,
    date,
    categoryLabel: cat.label,
    categoryCls: cat.cls,
  }
}

function jsonpFetch(url: string): Promise<BloggerEntry[]> {
  return new Promise((resolve, reject) => {
    const cbId = '_lgc_' + Math.random().toString(36).slice(2, 11)
    let done = false
    const timer = setTimeout(() => {
      if (done) return
      done = true
      try {
        delete (window as unknown as Record<string, unknown>)[cbId]
      } catch {}
      reject(new Error('timeout'))
    }, 10000)
    ;(window as unknown as Record<string, unknown>)[cbId] = (data: BloggerFeed) => {
      if (done) return
      done = true
      clearTimeout(timer)
      try {
        delete (window as unknown as Record<string, unknown>)[cbId]
      } catch {}
      resolve(data?.feed?.entry || [])
    }

    const s = document.createElement('script')
    s.src = `${url}&alt=json-in-script&callback=${cbId}`
    s.async = true
    s.onerror = () => {
      if (done) return
      done = true
      clearTimeout(timer)
      try {
        delete (window as unknown as Record<string, unknown>)[cbId]
      } catch {}
      if (s.parentNode) s.parentNode.removeChild(s)
      reject(new Error('network'))
    }
    document.body.appendChild(s)
  })
}

export function useBloggerFeed(options: {
  label?: string
  limit?: number
  categoryCls?: string
  categoryLabel?: string
}) {
  const entries = ref<BlogEntry[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const labelPart = options.label
        ? `/-/${encodeURIComponent(options.label)}`
        : ''
      const url = `${SITE.blog.feed}${labelPart}?max-results=${options.limit ?? 3}`
      const raw = await jsonpFetch(url)
      entries.value = raw
        .filter((e) => e.title?.$t?.trim())
        .slice(0, options.limit ?? 3)
        .map((e) => parseEntry(e, options.categoryCls, options.categoryLabel))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error cargando artículos'
    } finally {
      loading.value = false
    }
  }

  return { entries, loading, error, load }
}