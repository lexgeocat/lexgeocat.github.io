<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal, useCounters } from '../composables/useReveal'
import boliviaMap from '@/assets/img/fd-bolivia-map.svg?url'

const reveal = useReveal()
const counters = useCounters()

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reveal.observe()
      counters.observe()
    })
  })

  const bgMap = document.querySelector('.hero-bg-grid') as HTMLElement | null
  if (bgMap) {
    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      bgMap.style.transform = `translate(${x * 30}px, ${y * 30}px)`
    }
    window.addEventListener('mousemove', onMouseMove)
  }

  // Blogger feed loader for stats and blog posts
  const CFG = {
    bloggerFeed: 'https://lexgeocat.blogspot.com/feeds/posts/default',
    blogUrl: 'https://lexgeocat.blogspot.com/',
    profesiones: [
      { id: 'derecho', label: 'Derecho' },
      { id: 'catastro', label: 'Catastro' },
      { id: 'ordenamiento', label: 'Ordenamiento' },
      { id: 'geografia', label: 'Geografía' },
      { id: 'topogeodesia', label: 'Topografía' },
      { id: 'geomantica', label: 'Geomática' },
      { id: 'desarrollo', label: 'Software' },
    ],
  }

  // Set especialidades stat
  const statEsp = document.getElementById('stat-especialidades')
  if (statEsp) {
    const prof = CFG.profesiones.length
    statEsp.setAttribute('data-count', String(prof))
    statEsp.textContent = String(prof)
    setTimeout(() => counters.observe(), 100)
  }

  // Load stats from Blogger
  if (CFG.bloggerFeed) {
    loadFeedJSON(`${CFG.bloggerFeed}?max-results=0`, (d: any) => {
      const n = d?.feed?.openSearch$totalResults?.$t
      const el = document.getElementById('stat-articulos')
      if (el && n) {
        el.setAttribute('data-count', n)
        el.textContent = n
        setTimeout(() => counters.observe(), 100)
      }
    })
    loadFeedJSON(`${CFG.bloggerFeed}/-/Recursos?max-results=0`, (d: any) => {
      const n = d?.feed?.openSearch$totalResults?.$t
      const el = document.getElementById('stat-recursos')
      if (el && n) {
        el.setAttribute('data-count', n)
        el.textContent = n
        setTimeout(() => counters.observe(), 100)
      }
    })
  }

  // Load blog grid
  if (CFG.bloggerFeed) {
    loadFeedJSON(`${CFG.bloggerFeed}?max-results=10`, (data: any) => {
      const box = document.getElementById('blog-grid')
      if (!box) return
      const allEntries = (data?.feed?.entry || []).filter((e: any) => getEntryTitle(e))
      const entries = allEntries.slice(0, 3)
      renderBlogCards(entries, box, 'def', '', 120, 'Próximamente artículos desde la trinchera catastral.', true)
    }, () => {
      const box = document.getElementById('blog-grid')
      if (box) box.innerHTML = `<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">No se pudieron cargar los artículos. <a href="${CFG.blogUrl}" style="color:var(--teal)">Visita el blog directamente</a>.</p>`
    })
  }

  // Load recursos grid
  loadFeedGrid('Recursos', 'recursos-grid', 'def', 6, CFG.bloggerFeed, CFG.blogUrl)
})

onUnmounted(() => {
  reveal.disconnect()
  counters.disconnect()
})

// ─── Utility functions (ported from main.js) ───

function htmlToText(html: string, maxLen: number) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLen || 120)
}

function getThumbUrl(e: any) {
  if (e.media$thumbnail?.url) return e.media$thumbnail.url.replace('/s72-c/', '/s600-c/')
  return ''
}

function getCategoryInfo(labels: any[]) {
  if (!labels?.length) return { cls: 'white', label: 'Catastro' }
  const cats = labels.map((c: any) => (c.$t || '').toLowerCase()).filter(Boolean)
  if (!cats.length) return { cls: 'white', label: 'Catastro' }
  if (cats.some((c: string) => c.includes('derecho') || c.includes('legal'))) return { cls: 'gold', label: 'Derecho' }
  if (cats.some((c: string) => c.includes('gis') || c.includes('geomática') || c.includes('sig') || c.includes('geoinformacion'))) return { cls: 'teal', label: 'GIS' }
  if (cats.some((c: string) => c.includes('catastro'))) return { cls: 'white', label: 'Catastro' }
  return { cls: 'white', label: cats[0].charAt(0).toUpperCase() + cats[0].slice(1) }
}

function getPostUrl(e: any) {
  const links = e.link || []
  for (const l of links) { if (l.rel === 'alternate') return l.href }
  return 'https://lexgeocat.blogspot.com/'
}

function formatDate(published: any) {
  if (!published?.$t) return ''
  return new Date(published.$t).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })
}

function getEntryTitle(e: any) {
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
  return ''
}

function getPlaceholderHtml(catLabel: string) {
  const gradMap: Record<string, string> = {
    Derecho: 'linear-gradient(135deg, var(--color-esp-derecho-bg-from), var(--color-esp-derecho-bg-to))',
    GIS: 'linear-gradient(135deg, var(--color-esp-geomatica-bg-from), var(--color-esp-geomatica-bg-to))',
    Catastro: 'linear-gradient(135deg, var(--color-esp-catastro-bg-from), var(--color-esp-catastro-bg-to))',
  }
  const iconMap: Record<string, string> = {
    Derecho: 'fa-scale-balanced',
    GIS: 'fa-map-location-dot',
    Catastro: 'fa-draw-polygon',
  }
  const grad = gradMap[catLabel] || 'linear-gradient(135deg, var(--bg3), var(--bg2))'
  const icon = iconMap[catLabel] || 'fa-newspaper'
  return `<div class="blog-card-thumb-plh" style="background:${grad}"><i class="fa-solid ${icon}"></i></div>`
}

function renderBlogCards(entries: any[], box: HTMLElement, badgeCls: string, badgeLabel: string, excerptLen: number, emptyMsg: string, isHome: boolean) {
  if (!entries.length) {
    box.innerHTML = `<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">${emptyMsg || ''}</p>`
    return
  }
  box.innerHTML = entries.map((e) => {
    const title = getEntryTitle(e) || 'Sin título'
    const html = e.content?.$t || e.summary?.$t || ''
    const snip = htmlToText(html, excerptLen || 120)
    const thumbUrl = getThumbUrl(e)
    const catInfo = isHome ? getCategoryInfo(e.category || []) : { cls: badgeCls, label: badgeLabel || '' }
    const imgHtml = thumbUrl
      ? `<img alt="${title.replace(/"/g, '&quot;')}" src="${thumbUrl.replace(/&amp;/g, '&')}" loading="lazy">`
      : getPlaceholderHtml(catInfo.label)
    const dateStr = formatDate(e.published)
    const readTime = `${Math.max(1, Math.ceil(snip.length / 500))} min lectura`
    const postUrl = getPostUrl(e)
    return `<a class="blog-card reveal" href="${postUrl}"><div class="blog-card-thumb">${imgHtml}<span class="blog-card-badge ${catInfo.cls}">${catInfo.label}</span></div><div class="blog-card-body"><h3 class="blog-card-title">${title}</h3><p class="blog-card-excerpt">${snip}…</p><div class="blog-card-meta"><span class="blog-card-date"><i class="fa-regular fa-calendar"></i> ${dateStr} · ${readTime}</span><span class="blog-card-cta">→ Leer en Blog</span></div></div></a>`
  }).join('')
  document.querySelectorAll('#blog-grid .reveal, #recursos-grid .reveal').forEach((el) => {
    const rIO = (window as any).__lgcReveal
    if (rIO) rIO.observe(el)
  })
}

function loadFeedJSON(url: string, callback: (d: any) => void, onError?: (e: string) => void) {
  const id = '_lgc_' + Math.random().toString(36).substr(2, 9)
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    try { delete (window as any)[id] } catch {}
    if (onError) onError('timeout')
  }, 10000)
  ;(window as any)[id] = (d: any) => {
    if (timedOut) return
    clearTimeout(timer)
    try { callback(d) } catch { if (onError) onError('callback') }
    try { delete (window as any)[id] } catch {}
  }
  const s = document.createElement('script')
  s.src = `${url}${url.includes('?') ? '&' : '?'}alt=json-in-script&callback=${id}`
  s.async = true
  s.onerror = () => {
    clearTimeout(timer)
    if (!timedOut) {
      timedOut = true
      try { delete (window as any)[id] } catch {}
      if (onError) onError('network')
    }
  }
  document.body.appendChild(s)
}

function loadFeedGrid(label: string, containerId: string, badgeCls: string, limit: number, bloggerFeed: string, blogUrl: string) {
  if (!bloggerFeed) return
  const box = document.getElementById(containerId)
  if (!box) return
  const url = `${bloggerFeed}/-/${encodeURIComponent(label)}?max-results=${limit || 6}`
  loadFeedJSON(url, (data) => {
    const allEntries = (data?.feed?.entry || []).filter((e: any) => getEntryTitle(e))
    const entries = allEntries.slice(0, limit || 6)
    renderBlogCards(entries, box, badgeCls, label, 130, `Los recursos del blog aparecerán aquí cuando publiques entradas con la etiqueta "${label}".`, false)
  }, () => {
    box.innerHTML = `<p style="color:var(--text3);text-align:center;padding:20px;grid-column:1/-1;font-size:.85rem">No se pudieron cargar los recursos. Visita nuestro <a href="${blogUrl}" style="color:var(--teal)">blog</a>.</p>`
  })
}
</script>

<template>
  <section class="hero">
    <div class="hero-bg">
      <div class="hero-bg-grid" aria-hidden="true"></div>
      <div class="hero-bg-fade" aria-hidden="true"></div>
      <div class="hero-bg-glow1"></div>
      <div class="hero-bg-glow2"></div>
    </div>

    <div class="c">
      <div class="hero-grid">
        <div class="hero-content">
          <h1 class="hero-title">
            Lex <span class="accent-teal">Geo</span><span class="accent-gold">Cat</span>
            <span class="line-sub">Derecho, Catastro y Ordenamiento Territorial, Geografía y Geomática</span>
          </h1>
          <p class="hero-desc">Plataforma especializada en consultoría, recursos y formación técnica en materia legal, catastral y sistemas de información geográfica adaptados al contexto boliviano.</p>
          <div class="hero-btns">
            <router-link class="btn btn-gold" to="/pages/servicios.html"><i class="fa-solid fa-briefcase"></i> Ver Servicios</router-link>
            <a class="btn btn-ghost" href="https://lexgeocat.blogspot.com/"><i class="fa-solid fa-newspaper"></i> Explorar Blog</a>
          </div>
          <div class="hero-stats">
            <div class="hstat">
              <div class="hstat-n" id="stat-articulos" data-count="0">0</div>
              <div class="hstat-l">Artículos</div>
            </div>
            <div class="hstat">
              <div class="hstat-n" id="stat-especialidades" data-count="0">0</div>
              <div class="hstat-l">Especialidades</div>
            </div>
            <div class="hstat">
              <div class="hstat-n" id="stat-servicios" data-count="0">0</div>
              <div class="hstat-l">Servicios</div>
            </div>
            <div class="hstat">
              <div class="hstat-n" id="stat-recursos" data-count="0">0</div>
              <div class="hstat-l">Recursos</div>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="floating-dashboard">
            <object class="fd-bg-map" type="image/svg+xml" :data="boliviaMap" aria-hidden="true"></object>
            <div class="fd-card fdc-1 reveal">
              <i class="fa-solid fa-scale-balanced"></i>
              <div><h4>Derecho</h4><p>Civil, Constitucional, Administrativo</p></div>
            </div>
            <div class="fd-card fdc-2 reveal">
              <i class="fa-solid fa-map-location-dot"></i>
              <div><h4>Catastro y Ordenamiento Territorial</h4><p>Valoración catastral, SIG Areas Urbanas y Rurales</p></div>
            </div>
            <div class="fd-card fdc-3 reveal">
              <i class="fa-solid fa-mountain"></i>
              <div><h4>Topografía y Geodesia</h4><p>GNSS, redes y precisión</p></div>
            </div>
            <div class="fd-card fdc-4 reveal">
              <i class="fa-solid fa-layer-group"></i>
              <div><h4>Geografía y Geomática</h4><p>SIG, Cartografia y Geoprocesamiento</p></div>
            </div>
            <div class="fd-card fdc-5 reveal">
              <i class="fa-solid fa-code"></i>
              <div><h4>Software &amp; Web</h4><p>Aplicaciones a medida</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="sec-stripe" id="categorias-servicios">
    <div class="c">
      <div class="sh center">
        <span class="sl">Especialidades</span>
        <h2 class="st">Áreas de Especialización</h2>
        <p class="sd">Siete disciplinas en la intersección del derecho, la ingeniería territorial, la geomática y el desarrollo de software aplicadas al contexto boliviano.</p>
      </div>
      <div class="g g-auto" id="especialidades-grid">
        <router-link class="cat-card reveal esp-derecho" to="/pages/derecho.html">
          <i class="fa-solid fa-scale-balanced ci"></i>
          <h3 class="ct">Derecho</h3>
          <p class="cd">Legislación boliviana, derecho civil, usucapión, derecho registral, notarial y normativa territorial aplicable a la gestión del territorio.</p>
          <span class="cat-tag"><i class="fa-solid fa-arrow-right"></i> Explorar</span>
        </router-link>
        <router-link class="cat-card reveal esp-catastro" to="/pages/catastro.html">
          <i class="fa-solid fa-map ci"></i>
          <h3 class="ct">Catastro</h3>
          <p class="cd">Registro predial, valuación fiscal, nomenclatura catastral, fichas prediales, geocodificación y sistemas de información territorial.</p>
          <span class="cat-tag"><i class="fa-solid fa-arrow-right"></i> Explorar</span>
        </router-link>
        <router-link class="cat-card reveal esp-ordenamiento" to="/pages/ordenamiento.html">
          <i class="fa-solid fa-compass-drafting ci"></i>
          <h3 class="ct">Ordenamiento Territorial</h3>
          <p class="cd">Planes de ordenamiento urbano y rural, zonificación, uso de suelo, normativa territorial y asesoría a gobiernos municipales.</p>
          <span class="cat-tag"><i class="fa-solid fa-arrow-right"></i> Explorar</span>
        </router-link>
        <router-link class="cat-card reveal esp-geografia" to="/pages/geografia.html">
          <i class="fa-solid fa-earth-americas ci"></i>
          <h3 class="ct">Geografía</h3>
          <p class="cd">Análisis del territorio, geografía humana, física, regional, urbana, rural y de los riesgos naturales en Bolivia.</p>
          <span class="cat-tag"><i class="fa-solid fa-arrow-right"></i> Explorar</span>
        </router-link>
        <router-link class="cat-card reveal esp-topografia" to="/pages/topogeodesia.html">
          <i class="fa-solid fa-mountain ci"></i>
          <h3 class="ct">Topografía y Geodesia</h3>
          <p class="cd">Levantamientos topográficos, planimetría, altimetría, replanteo, posicionamiento GNSS, redes geodésicas y modelos geoidales.</p>
          <span class="cat-tag"><i class="fa-solid fa-arrow-right"></i> Explorar</span>
        </router-link>
        <router-link class="cat-card reveal esp-geomatica" to="/pages/geomantica.html">
          <i class="fa-solid fa-layer-group ci"></i>
          <h3 class="ct">Geomática</h3>
          <p class="cd">Sistemas de información geográfica, teledetección, cartografía digital, PostGIS/QGIS, GeoServer y análisis espacial avanzado.</p>
          <span class="cat-tag"><i class="fa-solid fa-arrow-right"></i> Explorar</span>
        </router-link>
        <router-link class="cat-card reveal esp-software" to="/pages/desarrollo-software.html">
          <i class="fa-solid fa-code ci"></i>
          <h3 class="ct">Desarrollo de Software y Aplicaciones Web</h3>
          <p class="cd">Aplicaciones web geográficas, bases de datos espaciales, APIs, automatización, portales institucionales y servicios públicos digitales.</p>
          <span class="cat-tag"><i class="fa-solid fa-arrow-right"></i> Explorar</span>
        </router-link>
      </div>
    </div>
  </section>

  <section class="sec-stripe" id="blog-section">
    <div class="c">
      <div class="sh center">
        <span class="sl">BLOG TÉCNICO</span>
        <h2 class="st">Últimos Artículos</h2>
        <p class="sd">Análisis, guías y recursos desde la práctica profesional en derecho territorial, catastro, geomática y desarrollo de software en Bolivia.</p>
      </div>
      <div class="blog-grid" id="blog-grid"></div>
      <div style="text-align:center;margin-top:44px">
        <a class="btn btn-gold" href="https://lexgeocat.blogspot.com/"><i class="fa-solid fa-newspaper"></i> Ver todos en el Blog</a>
      </div>
    </div>
  </section>

  <section class="sec-stripe" id="recursos-servicios">
    <div class="c">
      <div class="sh center">
        <span class="sl">Recursos</span>
        <h2 class="st">Herramientas y Materiales</h2>
        <p class="sd">Recursos útiles para profesionales del derecho, catastro y geomática en Bolivia.</p>
      </div>
      <div class="g g-auto" id="recursos-grid"></div>
      <div style="text-align:center;margin-top:40px">
        <router-link class="btn btn-gold" to="/pages/recursos.html"><i class="fa-solid fa-folder-open"></i> Ver todos los recursos</router-link>
      </div>
    </div>
  </section>

  <section class="sec" id="contacto-servicios">
    <div class="c">
      <div class="sh center">
        <span class="sl">Contacto</span>
        <h2 class="st">Contacto Rápido</h2>
        <p class="sd">Consultas profesionales, colaboraciones o asesoramiento directo.</p>
      </div>
      <div class="contact-wrap">
        <div class="contact-info">
          <h3>Información de Contacto</h3>
          <p>Disponible para consultas en derecho, catastro, GIS y servicios relacionados con la gestión territorial y el ordenamiento urbano en Bolivia.</p>
          <div class="contact-item">
            <div class="contact-icon"><i class="fa-solid fa-location-dot"></i></div>
            <div class="contact-text"><h4>Ubicación</h4><p>Viacha, Departamento de La Paz, Bolivia</p></div>
          </div>
          <div class="contact-item">
            <div class="contact-icon"><i class="fa-solid fa-envelope"></i></div>
            <div class="contact-text"><h4>Correo Electrónico</h4><p>lexgeocat@gmail.com</p></div>
          </div>
          <div class="contact-item">
            <div class="contact-icon"><i class="fa-solid fa-id-card"></i></div>
            <div class="contact-text">
              <h4>Registros Profesionales</h4>
              <p>S.I.B. — R.N.T. Nº 970285</p>
              <p style="margin-top:4px">R.P.A. — Nº 13437938CBRQ</p>
            </div>
          </div>
          <div style="margin-top:32px">
            <a class="btn btn-whatsapp" href="https://wa.me/59176711790" target="_blank" rel="noopener" style="display:inline-flex;width:100%;justify-content:center"><i class="fa-brands fa-whatsapp"></i> Escríbeme por WhatsApp</a>
          </div>
        </div>
        <div class="cf-form" style="padding:32px;text-align:center;background:var(--card);border:1px solid var(--border);border-radius:var(--r)">
          <p style="font-size:1.05rem;font-weight:600;color:var(--text);margin-bottom:12px">¿Quieres contactarme directamente?</p>
          <p style="font-size:.85rem;color:var(--text2);margin-bottom:20px"><i class="fa-solid fa-envelope" style="color:var(--gold)"></i> <strong>lexgeocat@gmail.com</strong></p>
          <router-link class="btn btn-gold" to="/pages/contacto.html"><i class="fa-solid fa-envelope"></i> Ir al formulario de contacto</router-link>
        </div>
      </div>
    </div>
  </section>
</template>
