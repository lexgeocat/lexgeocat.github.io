<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal } from '../composables/useReveal'
import { SITE } from '../config/site'
import { useCotizadorStore } from '../stores/cotizador'
import CotizadorModal from '../components/CotizadorModal.vue'
import type { Servicio, FactorPrecio } from '../types/supabase'
import type { BloggerEntry, BloggerFeed } from '../types/blogger'

const reveal = useReveal()
const cot = useCotizadorStore()

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

let blogScriptEl: HTMLScriptElement | null = null
let blogCbId: string | null = null
let blogTimer: ReturnType<typeof setTimeout> | null = null

function scrollToPanel(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function toDirectImageUrl(url: string): string {
  if (!url) return ''
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  return m ? 'https://drive.google.com/uc?id=' + m[1] : url
}

onMounted(() => {
  requestAnimationFrame(() => { requestAnimationFrame(() => { reveal.observe() }) })

  // Blog feed
  blogCbId = '_lgc_svc_blog_' + Math.random().toString(36).substr(2, 9)
  let blogTimedOut = false
  const fallbackHtml = '<p style="color:var(--text3);text-align:center;padding:40px;grid-column:1/-1;font-size:.85rem">No se pudieron cargar los artículos. <a href="${SITE.blog.url}" style="color:var(--teal)">Visita el blog</a>.</p>'
  blogTimer = setTimeout(() => {
    blogTimedOut = true
    try { delete (window as unknown as Record<string, unknown>)[blogCbId!] } catch {}
    const box = document.getElementById('svc-blog-grid')
    if (box) box.innerHTML = fallbackHtml
  }, 10000)
;(window as unknown as Record<string, unknown>)[blogCbId] = (data: BloggerFeed) => {
    if (blogTimedOut) return
    if (blogTimer) clearTimeout(blogTimer)
    const box = document.getElementById('svc-blog-grid')
    if (!box) { try { delete (window as unknown as Record<string, unknown>)[blogCbId!] } catch {}; return }
    const all = (data?.feed?.entry || []).filter((e: BloggerEntry) => Boolean(e.title?.$t?.trim()))
    if (!all.length) {
      box.innerHTML = '<p style="color:var(--text3);text-align:center;padding:40px;grid-column:1/-1;font-size:.85rem">Próximamente artículos desde el blog técnico.</p>'
    } else {
      box.innerHTML = all.slice(0, 3).map((e: BloggerEntry) => {
        const t = (e.title?.$t ?? '').trim()
        const lnk = (e.link || []).find((l: { rel?: string; href?: string }) => l.rel === 'alternate')?.href || 'https://lexgeocat.blogspot.com/'
        const html = e.content?.$t || e.summary?.$t || ''
        const snip = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
        const thumb = e['media$thumbnail']?.url?.replace('/s72-c/', '/s600-c/') || ''
        const img = thumb ? `<img src="${thumb.replace(/&/g, '&')}" alt="${t.replace(/"/g, '"')}" loading="lazy">` : ''
        const date = e.published?.$t ? new Date(e.published.$t).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
        return `<a class="blog-card reveal" href="${lnk}"><div class="blog-card-thumb">${img || '<div class="blog-card-thumb-plh" style="background:linear-gradient(135deg,#1a1a2e,#16213e)"><i class="fa-solid fa-newspaper"></i></div>'}<span class="blog-card-badge white">Blog</span></div><div class="blog-card-body"><h3 class="blog-card-title">${t}</h3><p class="blog-card-excerpt">${snip}…</p><div class="blog-card-meta"><span class="blog-card-date"><i class="fa-regular fa-calendar"></i> ${date}</span><span class="blog-card-cta">→ Leer</span></div></div></a>`
      }).join('')
    }
    setTimeout(() => reveal.observe(), 100)
    try { delete (window as unknown as Record<string, unknown>)[blogCbId!] } catch {}
  }
  blogScriptEl = document.createElement('script')
  blogScriptEl.src = `${SITE.blog.feed}?max-results=3&alt=json-in-script&callback=${blogCbId}`
  blogScriptEl.async = true
  blogScriptEl.onerror = () => {
    if (blogTimer) clearTimeout(blogTimer)
    if (!blogTimedOut) {
      blogTimedOut = true
      try { delete (window as unknown as Record<string, unknown>)[blogCbId!] } catch {}
      const box = document.getElementById('svc-blog-grid')
      if (box) box.innerHTML = fallbackHtml
    }
  }
  document.body.appendChild(blogScriptEl)

  // Load servicios + populate globals
  const AREA_KEYS = ['derecho', 'catastro', 'ordenamiento', 'geografia', 'topografia', 'geomatica', 'software']
  const CAT_CONFIG: Record<string, { icon: string; color: string; subtitle: string }> = {
    'Derecho Civil':               { icon: 'fa-handshake',         color: 'var(--copper)',    subtitle: 'Contratos, propiedad, familia y sucesiones' },
    'Derecho Agrario':             { icon: 'fa-seedling',          color: '#3a5e3a',         subtitle: 'Tierra, INRA y comunidades' },
    'Derecho Minero':              { icon: 'fa-gem',               color: '#c8660c',         subtitle: 'Concesiones, recursos y sociedades' },
    'Derecho Corporativo':         { icon: 'fa-building',          color: '#c8660c',         subtitle: 'Sociedades, registros y compliance' },
    'Catastro':                    { icon: 'fa-draw-polygon',      color: 'var(--sapphire)', subtitle: 'Campo, fichas prediales y diagnóstico' },
    'Topografía':                  { icon: 'fa-ruler-combined',   color: '#c8660c',         subtitle: 'Campo, procesamiento y cartografía' },
    'Topografía / Geodesia':       { icon: 'fa-satellite',         color: '#c8660c',         subtitle: 'GNSS, control altimétrico y SIRGAS-BOL' },
    'Geomática':                   { icon: 'fa-map',               color: '#3a5e3a',         subtitle: 'Análisis espacial y visualización' },
    'Geomática / Teledetección':   { icon: 'fa-satellite-dish',   color: '#3a5e3a',         subtitle: 'Imágenes Sentinel, Landsat y NDVI' },
    'Geomática / Software':         { icon: 'fa-code',              color: '#3a5e3a',         subtitle: 'Python, GeoPandas y automatización GIS' },
    'Software':                    { icon: 'fa-globe',              color: '#7c6fc8',         subtitle: 'Frontend, backend y geoespacial' },
    'Software / Geomática':        { icon: 'fa-map-location-dot', color: '#7c6fc8',         subtitle: 'Visores GIS y aplicaciones web' },
    'Software / GIS':              { icon: 'fa-map-location-dot', color: '#7c6fc8',         subtitle: 'Visores GIS y aplicaciones web' },
  }

  function escHtml(s: unknown): string {
    if (s == null) return ''
    return String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"')
  }

  function toggleSpec(el: Element) {
    const body = el.nextElementSibling
    if (!body) return
    if (el.classList.contains('open')) { el.classList.remove('open'); body.classList.remove('open') }
    else { el.classList.add('open'); body.classList.add('open') }
  }
  ;(window as unknown as Record<string, unknown>).__lgcToggleSpec = toggleSpec

  fetch(`${SUPABASE_URL}/rest/v1/servicios?select=*&activo=eq.true&order=area.asc,orden.asc`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
    .then((rows: Servicio[]) => {
      const cotData: Record<string, import('../stores/cotizador').CotService> = {}
      const areaServices: Record<string, { v: string; l: string }[]> = {}
      const categoriaServices: Record<string, Record<string, { v: string; l: string; descripcion: string; tags: string[]; img_url: string }[]>> = {}

      rows.forEach((r: Servicio) => {
        if (!r.activo) return
        cotData[r.id] = { id: r.id, label: r.label, descripcion: r.descripcion || '', tags: r.tags || [], img_url: r.img_url || '', area: r.area, areaKey: r.area, categoria: r.categoria || '', baseMin: Number(r.precio_min) || 0, baseMax: Number(r.precio_max) || 0, timeMin: r.tiempo_min || '', timeMax: r.tiempo_max || '', complexity: r.complejidad || '', detailsType: r.details_type || 'general' }
        if (!areaServices[r.area]) areaServices[r.area] = []
        areaServices[r.area]!.push({ v: r.id, l: r.label })
        const cat = r.categoria || 'General'
        if (!categoriaServices[r.area]) categoriaServices[r.area] = {}
        if (!categoriaServices[r.area]![cat]) categoriaServices[r.area]![cat] = []
        categoriaServices[r.area]![cat]!.push({ v: r.id, l: r.label, descripcion: r.descripcion || '', tags: r.tags || [], img_url: r.img_url || '' })
      })

        cot.catalog = cotData
      cot.areaServices = areaServices
      cot.catalogLoaded = true

      AREA_KEYS.forEach(areaKey => {
        const container = document.getElementById('svc-grid-' + areaKey)
        if (!container) return
        const categorias = categoriaServices[areaKey] ?? {}
        const catKeys = Object.keys(categorias)
        if (!catKeys.length) { container.innerHTML = '<p style="color:var(--text3);padding:20px;text-align:center">Próximamente servicios en esta área.</p>'; return }
        let html = ''
        catKeys.forEach((cat, idx) => {
          const isFirst = idx === 0
          const cfg = CAT_CONFIG[cat] ?? { icon: 'fa-tag', color: 'var(--text2)', subtitle: '' }
          const iconStyles = `background: rgba(42,100,150,0.1); border-color: rgba(42,100,150,0.2); color: ${cfg.color};`
          const iconHtml = cfg.icon ? `<i class="fa-solid ${cfg.icon}"></i>` : ''
          html += `<div class="specialty-group">`
          html += `<div class="specialty-header${isFirst ? ' open' : ''}" data-action="toggle-spec">`
          html += `<div class="spec-header-left"><div class="spec-icon" style="${iconStyles}">${iconHtml}</div><div>`
          html += `<div class="spec-title">${escHtml(cat)}</div>`
          if (cfg.subtitle) html += `<div class="spec-subtitle">${escHtml(cfg.subtitle)}</div>`
          html += `</div></div><i class="fa-solid fa-chevron-down spec-chevron"></i></div>`
          html += `<div class="specialty-body${isFirst ? ' open' : ''}"><div class="specialty-body-inner"><div class="services-grid">`
          categorias[cat]!.forEach((svc) => {
            const tagsHtml = svc.tags?.length ? `<div class="svc-item-tags">${svc.tags.map((t: string) => `<span class="svc-item-tag">${escHtml(t)}</span>`).join('')}</div>` : ''
            const thumbUrl = toDirectImageUrl(svc.img_url || '')
            const thumbHtml = thumbUrl ? `<div class="svc-item-thumb" style="background-image:url(${thumbUrl.replace(/"/g, '%22')})"></div>` : ''
            html += `<div class="svc-item">${thumbHtml}<div class="svc-item-body">`
            html += `<div class="svc-item-header"><div class="svc-item-dot"></div><div class="svc-item-name">${escHtml(svc.l)}</div></div>`
            html += `<p class="svc-item-desc">${escHtml(svc.descripcion)}</p>${tagsHtml}`
            html += `<button class="svc-item-cta" data-svc="${escHtml(svc.v)}"><i class="fa-solid fa-calculator"></i> Simular cotización</button>`
            html += `</div></div>`
          })
          html += `</div></div></div></div>`
        })
        container.innerHTML = html
      })

      document.querySelectorAll('.specialty-header[data-action="toggle-spec"]').forEach(el => { el.addEventListener('click', () => toggleSpec(el as Element)) })
      document.querySelectorAll('.svc-item-cta[data-svc]').forEach(btn => {
        btn.addEventListener('click', () => cot.openModal((btn as HTMLElement).dataset.svc))
      })
    })
    .catch((err: unknown) => console.error('[LexGeoCat] Error cargando catálogo:', err))

  fetch(`${SUPABASE_URL}/rest/v1/factores_precio?select=*&activo=eq.true`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
    .then((rows: FactorPrecio[]) => {
      const fp: Record<string, FactorPrecio> = {}
      rows.forEach((r) => { fp[r.id] = r })
      cot.factores = fp
    })
    .catch((err: unknown) => console.warn('[LexGeoCat] Error cargando factores_precio:', err))
})

onUnmounted(() => {
  reveal.disconnect()
  if (blogTimer) clearTimeout(blogTimer)
  if (blogCbId) { try { delete (window as unknown as Record<string, unknown>)[blogCbId] } catch {} }
  if (blogScriptEl?.parentNode) blogScriptEl.parentNode.removeChild(blogScriptEl)
})
</script>

<template>
  <section class="svc-hero">
    <div class="c">
      <div class="svc-hero-inner">
        <div>
          <div class="svc-hero-badge">
            <i
              class="fa-solid fa-briefcase"
              style="font-size:10px"
            /> Centro de Servicios Profesionales
          </div>
          <h1 class="svc-hero-title">
            Consultoría <em>integral</em><br>en Territorio y Derecho
          </h1>
          <p class="svc-hero-desc">
            Siete áreas de especialización con más de 40 servicios específicos. Desde usucapión y catastro predial hasta visores GIS y aplicaciones web a medida — todo con respaldo profesional habilitado y registro oficial.
          </p>
          <div class="svc-hero-actions">
            <button
              class="btn btn-gold"
              @click="scrollToPanel('panel-derecho')"
            >
              <i class="fa-solid fa-list" /> Explorar Servicios
            </button>
            <button
              class="btn btn-ghost"
              @click="cot.openModal()"
            >
              <i class="fa-solid fa-calculator" /> Simular Cotización
            </button>
          </div>
        </div>
        <div class="svc-hero-stats">
          <div class="svc-hstat">
            <div class="svc-hstat-n">
              7
            </div><div class="svc-hstat-l">
              Áreas
            </div><i class="fa-solid fa-layer-group svc-hstat-i" />
          </div>
          <div class="svc-hstat">
            <div class="svc-hstat-n">
              40+
            </div><div class="svc-hstat-l">
              Servicios
            </div><i class="fa-solid fa-list-check svc-hstat-i" />
          </div>
          <div class="svc-hstat">
            <div class="svc-hstat-n">
              2
            </div><div class="svc-hstat-l">
              Registros
            </div><i class="fa-solid fa-id-card svc-hstat-i" />
          </div>
          <div class="svc-hstat">
            <div class="svc-hstat-n">
              BO
            </div><div class="svc-hstat-l">
              Cobertura
            </div><i class="fa-solid fa-earth-americas svc-hstat-i" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <div
    class="c"
    style="padding-top:32px;padding-bottom:32px"
  >
    <div class="creds-banner reveal">
      <div class="cred-badge">
        <div class="cred-badge-icon">
          <i class="fa-solid fa-gavel" />
        </div><div class="cred-badge-info">
          <h4>Registro Público de Abogacía</h4><p>Tribunal Supremo de Justicia — Bolivia</p><code>R.P.A. Nº {{ SITE.rpa }}</code>
        </div>
      </div>
      <div class="creds-divider" />
      <div class="cred-badge">
        <div class="cred-badge-icon">
          <i class="fa-solid fa-compass-drafting" />
        </div><div class="cred-badge-info">
          <h4>Sociedad de Ingenieros de Bolivia</h4><p>Técnico Universitario Superior — Catastro y Ord. Territorial</p><code>R.N.T. Nº {{ SITE.rnt }}</code>
        </div>
      </div>
      <div class="creds-divider" />
      <div class="cred-badge">
        <div class="cred-badge-icon">
          <i class="fa-solid fa-university" />
        </div><div class="cred-badge-info">
          <h4>Formación Académica</h4><p>UMSA · Catastro & Ord. Territorial<br>UPEA · Licenciatura en Derecho</p>
        </div>
      </div>
    </div>
  </div>

  <div id="svc-panels-container">
    <div
      id="panel-derecho"
      class="svc-area-panel"
    >
      <div class="area-header">
        <div class="c">
          <div class="area-header-inner">
            <div class="area-icon-lg area-derecho">
              <i class="fa-solid fa-scale-balanced" />
            </div><div>
              <h2>Asesoría Legal Territorial</h2><p>Consultoría jurídica especializada en el sistema de derechos reales boliviano, normativa territorial y procesos registrales. Doble habilitación: Abogado (R.P.A.) e Ingeniero Catastral (R.N.T.), lo que permite una visión técnico-jurídica única en Bolivia.</p><div class="area-creds">
                <span class="area-cred"><i class="fa-solid fa-certificate" /> R.P.A. Nº {{ SITE.rpa }}</span><span class="area-cred"><i class="fa-solid fa-globe" /> Cobertura Nacional</span><span class="area-cred"><i class="fa-solid fa-comments" /> Consulta inicial gratuita</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-derecho">
            <p style="color:var(--text3);padding:20px;text-align:center">
              Cargando catálogo de servicios…
            </p>
          </div>
        </div>
      </div>
    </div>
    <div
      id="panel-catastro"
      class="svc-area-panel"
    >
      <div class="area-header">
        <div class="c">
          <div class="area-header-inner">
            <div class="area-icon-lg area-catastro">
              <i class="fa-solid fa-map-location-dot" />
            </div><div>
              <h2>Gestión y Catastro Multifinalitario</h2><p>Registro predial, valoración, nomenclatura y sistemas de información territorial. Especialización en catastro urbano y rural de municipios bolivianos, con manejo de plataformas SIG y normativa catastral vigente.</p><div class="area-creds">
                <span class="area-cred"><i class="fa-solid fa-certificate" /> R.N.T. Nº {{ SITE.rnt }}</span><span class="area-cred"><i class="fa-solid fa-graduation-cap" /> TUS — UMSA</span><span class="area-cred"><i class="fa-solid fa-building" /> Catastro Urbano y Rural</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-catastro">
            <p style="color:var(--text3);padding:20px;text-align:center">
              Cargando catálogo de servicios…
            </p>
          </div>
        </div>
      </div>
    </div>
    <div
      id="panel-ordenamiento"
      class="svc-area-panel"
    >
      <div class="area-header">
        <div class="c">
          <div class="area-header-inner">
            <div class="area-icon-lg area-ordenamiento">
              <i class="fa-solid fa-compass-drafting" />
            </div><div>
              <h2>Ordenamiento Territorial</h2><p>Planes de uso de suelo, zonificación, regulación municipal y asesoría técnica a Gobiernos Autónomos.</p><div class="area-creds">
                <span class="area-cred"><i class="fa-solid fa-file-contract" /> PLOT / PDM / POT</span><span class="area-cred"><i class="fa-solid fa-building-columns" /> Asesoría a GAMs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-ordenamiento">
            <p style="color:var(--text3);padding:20px;text-align:center">
              Cargando catálogo de servicios…
            </p>
          </div>
        </div>
      </div>
    </div>
    <div
      id="panel-geografia"
      class="svc-area-panel"
    >
      <div class="area-header">
        <div class="c">
          <div class="area-header-inner">
            <div class="area-icon-lg area-geografia">
              <i class="fa-solid fa-earth-americas" />
            </div><div><h2>Estudios y Análisis Geográficos</h2><p>Investigación geoespacial, caracterización regional, estudios de impacto territorial y análisis de vulnerabilidad ante amenazas naturales.</p></div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-geografia">
            <p style="color:var(--text3);padding:20px;text-align:center">
              Cargando catálogo de servicios…
            </p>
          </div>
        </div>
      </div>
    </div>
    <div
      id="panel-topografia"
      class="svc-area-panel"
    >
      <div class="area-header">
        <div class="c">
          <div class="area-header-inner">
            <div class="area-icon-lg area-topografia">
              <i class="fa-solid fa-mountain" />
            </div><div>
              <h2>Topografía y Geodesia Aplicada</h2><p>Levantamientos de campo, control altimétrico, posicionamiento GNSS y georeferenciación en el sistema SIRGAS-BOL.</p><div class="area-creds">
                <span class="area-cred"><i class="fa-solid fa-satellite" /> GNSS / SIRGAS-BOL</span><span class="area-cred"><i class="fa-solid fa-drafting-compass" /> Estación Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-topografia">
            <p style="color:var(--text3);padding:20px;text-align:center">
              Cargando catálogo de servicios…
            </p>
          </div>
        </div>
      </div>
    </div>
    <div
      id="panel-geomatica"
      class="svc-area-panel"
    >
      <div class="area-header">
        <div class="c">
          <div class="area-header-inner">
            <div class="area-icon-lg area-geomatica">
              <i class="fa-solid fa-layer-group" />
            </div><div>
              <h2>Geomática y Sistemas de Información Geográfica</h2><p>Implementación de infraestructuras de datos espaciales, análisis con PostGIS, cartografía temática, teledetección y geoservicios OGC.</p><div class="area-creds">
                <span class="area-cred"><i class="fa-solid fa-database" /> PostGIS / GeoServer</span><span class="area-cred"><i class="fa-brands fa-python" /> Python / GeoPandas</span><span class="area-cred"><i class="fa-solid fa-globe" /> WMS / WFS / WCS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-geomatica">
            <p style="color:var(--text3);padding:20px;text-align:center">
              Cargando catálogo de servicios…
            </p>
          </div>
        </div>
      </div>
    </div>
    <div
      id="panel-software"
      class="svc-area-panel"
    >
      <div class="area-header">
        <div class="c">
          <div class="area-header-inner">
            <div class="area-icon-lg area-software">
              <i class="fa-solid fa-code" />
            </div><div>
              <h2>Desarrollo de Software y Aplicaciones Web</h2><p>Aplicaciones web geográficas, sistemas de gestión territorial, APIs y portales institucionales.</p><div class="area-creds">
                <span class="area-cred"><i class="fa-brands fa-js" /> JavaScript / Python</span><span class="area-cred"><i class="fa-solid fa-map" /> Leaflet / MapLibre</span><span class="area-cred"><i class="fa-brands fa-github" /> GitHub Pages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-software">
            <p style="color:var(--text3);padding:20px;text-align:center">
              Cargando catálogo de servicios…
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <section class="sec-dark">
    <div class="c">
      <div class="sh center">
        <span class="sl">Metodología</span><h2 class="st">
          ¿Cómo Trabajamos?
        </h2><p class="sd">
          Proceso transparente, orientado a resultados y adaptado al contexto boliviano.
        </p>
      </div>
      <div class="process-grid">
        <div class="process-step reveal">
          <div class="process-num">
            01
          </div><h4>Consulta Inicial</h4><p>Diagnóstico gratuito por WhatsApp o correo.</p>
        </div>
        <div class="process-step reveal">
          <div class="process-num">
            02
          </div><h4>Propuesta Técnica</h4><p>Entregamos una propuesta detallada con alcance, metodología, cronograma y cotización formal sin compromiso.</p>
        </div>
        <div class="process-step reveal">
          <div class="process-num">
            03
          </div><h4>Ejecución</h4><p>Desarrollo del servicio con actualizaciones periódicas.</p>
        </div>
        <div class="process-step reveal">
          <div class="process-num">
            04
          </div><h4>Entrega y Soporte</h4><p>Entrega de productos, documentación y soporte post-servicio.</p>
        </div>
      </div>
    </div>
  </section>

  <section
    id="blog"
    class="sec-dark"
  >
    <div class="c">
      <div class="sh center">
        <span class="sl">Desde el Blog</span><h2 class="st">
          Artículos Técnicos
        </h2><p class="sd">
          Contenido práctico sobre derecho territorial, catastro, geomática y desarrollo de software aplicado a Bolivia.
        </p>
      </div>
      <div
        id="svc-blog-grid"
        class="blog-grid"
      >
        <p style="color:var(--text3);text-align:center;padding:40px;grid-column:1/-1;font-size:.85rem">
          Cargando artículos…
        </p>
      </div>
      <div style="text-align:center;margin-top:40px">
        <a
          class="btn btn-ghost"
          :href="SITE.blog.url"
        ><i class="fa-solid fa-newspaper" /> Ver todos en el Blog</a>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="c">
      <div class="contact-strip reveal">
        <h3>¿Tienes un proyecto en mente?</h3>
        <p>Consulta inicial gratuita. Respondo en menos de 24 horas hábiles. Sin compromiso de contratación.</p>
        <div class="contact-strip-btns">
          <a
            class="btn btn-whatsapp"
            :href="`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('Hola, quiero información sobre sus servicios')}`"
          ><i class="fa-brands fa-whatsapp" /> Escribir por WhatsApp</a>
          <router-link
            class="btn btn-teal"
            to="/pages/contacto.html"
          >
            <i class="fa-solid fa-envelope" /> Formulario de Contacto
          </router-link>
          <button
            class="btn btn-ghost"
            @click="cot.openModal()"
          >
            <i class="fa-solid fa-calculator" /> Simular Cotización
          </button>
        </div>
      </div>
    </div>
  </section>

  <CotizadorModal />
</template>