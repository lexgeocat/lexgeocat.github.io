export function getEntryTitle(e: any): string {
  const feedTitle = e.title?.$t?.trim()
  if (feedTitle) return feedTitle
  const links = e.link || []
  for (const l of links) {
    if (l.rel === 'alternate') {
      const slug = l.href.replace(/\/+$/, '').split('/').pop() || ''
      const s = slug.replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
      if (s.length > 5) return s.charAt(0).toUpperCase() + s.slice(1)
    }
  }
  return 'Sin título'
}

export function getPostUrl(e: any, fallback = 'https://lexgeocat.blogspot.com/'): string {
  const alt = (e.link || []).find((l: any) => l.rel === 'alternate')
  return alt?.href || fallback
}

export function getThumbUrl(e: any): string {
  const raw = e.media$thumbnail?.url
  if (!raw) return ''
  return raw.replace('/s72-c/', '/s600-c/').replace(/&/g, '&')
}

export function formatPostDate(e: any): string {
  const v = e.published?.$t
  if (!v) return ''
  return new Date(v).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function htmlToSnippet(html: string, len = 120): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, len)
}

export interface FeedCfg {
  bloggerFeed: string
  blogUrl: string
  label: string
  badgeCls: string
  badgeLabel: string
  icon: string
  placeholderMsg: string
  limit?: number
}

export function loadTopicFeed(cfg: FeedCfg) {
  const box = document.getElementById('topic-posts-grid')
  if (!box) return
  const limit = cfg.limit || 3
  const url = `${cfg.bloggerFeed}/-/${encodeURIComponent(cfg.label)}?max-results=${limit}`
  const cbId = '_lgc_' + Math.random().toString(36).substr(2, 9)
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    try { delete (window as any)[cbId] } catch {}
    box.innerHTML = `<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">No se pudieron cargar los artículos. <a href="${cfg.blogUrl}" style="color:var(--teal)">Visita el blog</a>.</p>`
  }, 10000)
  ;(window as any)[cbId] = (data: any) => {
    if (timedOut) return
    clearTimeout(timer)
    try {
      const allEntries = (data?.feed?.entry || []).filter((e: any) => getEntryTitle(e) !== 'Sin título' || true)
      const entries = allEntries.slice(0, limit)
      if (!entries.length) {
        box.innerHTML = `<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">${cfg.placeholderMsg}</p>`
      } else {
        box.innerHTML = entries.map((e: any) => {
          const t = getEntryTitle(e)
          const lnk = getPostUrl(e, cfg.blogUrl)
          const snip = htmlToSnippet(e.content?.$t || e.summary?.$t || '')
          const thumbUrl = getThumbUrl(e)
          const img = thumbUrl
            ? `<img src="${thumbUrl}" alt="${t.replace(/"/g, '"')}" loading="lazy">`
            : `<div class="pc-noimg"><i class="${cfg.icon}"></i></div>`
          const date = formatPostDate(e)
          return `<a class="pc reveal" href="${lnk}"><div class="pc-img">${img}<span class="pc-badge ${cfg.badgeCls}">${cfg.badgeLabel}</span></div><div class="pc-body"><div class="pc-meta">${date ? `<span><i class="fa-regular fa-calendar"></i> ${date}</span>` : ''}</div><h3 class="pc-title">${t}</h3><p class="pc-snip">${snip}…</p><div class="pc-ft"><span class="pc-read">→ Leer <i class="fa-solid fa-arrow-right"></i></span></div></div></a>`
        }).join('')
      }
      setTimeout(() => {
        const rIO = (window as any).__lgcReveal
        if (rIO) document.querySelectorAll('#topic-posts-grid .reveal').forEach((el: Element) => rIO.observe(el))
      }, 100)
    } catch { /* noop */ }
    try { delete (window as any)[cbId] } catch {}
  }
  const s = document.createElement('script')
  s.src = `${url}&alt=json-in-script&callback=${cbId}`
  s.async = true
  s.onerror = () => {
    clearTimeout(timer)
    if (!timedOut) {
      timedOut = true
      try { delete (window as any)[cbId] } catch {}
      box.innerHTML = `<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">No se pudieron cargar los artículos. <a href="${cfg.blogUrl}" style="color:var(--teal)">Visita el blog</a>.</p>`
    }
  }
  document.body.appendChild(s)
}
