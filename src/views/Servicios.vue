<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal } from '../shared/composables/useReveal'
import { SITE } from '../config/site'
import { useCotizadorStore } from '../features/cotizador/store'
import { toDirectImageUrl } from '../shared/utils/image'
import {
  AREA_KEYS,
  CAT_CONFIG,
  escHtml,
  loadFactoresPrecio,
  loadServiciosCatalog,
  toggleSpec,
} from '../features/servicios/useServiciosCatalog'
import { useBloggerFeed } from '../features/blog/useBloggerFeed'
import BlogCard from '../features/blog/BlogCard.vue'
import CotizadorModal from '../features/cotizador/CotizadorModal.vue'
import type { FactorPrecio } from '../types/supabase'

const reveal = useReveal()
const cot = useCotizadorStore()
const { entries: blogEntries, loading: blogLoading, error: blogError, load: loadBlog } =
  useBloggerFeed({ limit: 3 })

function scrollToPanel(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
;(window as unknown as Record<string, unknown>).__lgcToggleSpec = toggleSpec

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reveal.observe()
    })
  })

  loadBlog()
  loadCatalog()
})

function renderServicios(catalog: Awaited<ReturnType<typeof loadServiciosCatalog>>) {
  const { cotData, areaServices, categoriaServices } = catalog

  cot.catalog = cotData
  cot.areaServices = areaServices
  cot.catalogLoaded = true

  AREA_KEYS.forEach((areaKey) => {
    const container = document.getElementById('svc-grid-' + areaKey)
    if (!container) return
    const categorias = categoriaServices[areaKey] ?? {}
    const catKeys = Object.keys(categorias)
    if (!catKeys.length) {
      container.innerHTML =
        '<p style="color:var(--text3);padding:20px;text-align:center">Próximamente servicios en esta área.</p>'
      return
    }
    let html = ''
    catKeys.forEach((cat, idx) => {
      const isFirst = idx === 0
      const cfg = CAT_CONFIG[cat] ?? { icon: 'fa-tag', color: 'var(--text2)', subtitle: '' }
      const iconStyles = `background: rgba(42,100,150,0.1); border-color: rgba(42,100,150,0.2); color: ${cfg.color};`
      const iconHtml = cfg.icon ? `<i aria-hidden="true" class="fa-solid ${cfg.icon}"></i>` : ''
      html += `<div class="specialty-group">`
      html += `<div class="specialty-header${isFirst ? ' open' : ''}" data-action="toggle-spec">`
      html += `<div class="spec-header-left"><div class="spec-icon" style="${iconStyles}">${iconHtml}</div><div>`
      html += `<div class="spec-title">${escHtml(cat)}</div>`
      if (cfg.subtitle) html += `<div class="spec-subtitle">${escHtml(cfg.subtitle)}</div>`
      html += `</div></div><i aria-hidden="true" class="fa-solid fa-chevron-down spec-chevron"></i></div>`
      html += `<div class="specialty-body${isFirst ? ' open' : ''}"><div class="specialty-body-inner"><div class="services-grid">`
      categorias[cat]!.forEach((svc) => {
        const tagsHtml = svc.tags?.length
          ? `<div class="svc-item-tags">${svc.tags.map((t: string) => `<span class="svc-item-tag">${escHtml(t)}</span>`).join('')}</div>`
          : ''
        const thumbUrl = toDirectImageUrl(svc.img_url || '')
        const thumbHtml = thumbUrl
          ? `<div class="svc-item-thumb" style="background-image:url(${thumbUrl.replace(/"/g, '%22')})"></div>`
          : ''
        html += `<div class="svc-item">${thumbHtml}<div class="svc-item-body">`
        html += `<div class="svc-item-header"><div class="svc-item-dot"></div><div class="svc-item-name">${escHtml(svc.l)}</div></div>`
        html += `<p class="svc-item-desc">${escHtml(svc.descripcion)}</p>${tagsHtml}`
        html += `<button class="svc-item-cta" data-svc="${escHtml(svc.v)}"><i aria-hidden="true" class="fa-solid fa-calculator"></i> Simular cotización</button>`
        html += `</div></div>`
      })
      html += `</div></div></div></div>`
    })
    container.innerHTML = html
  })

  document.querySelectorAll('.specialty-header[data-action="toggle-spec"]').forEach((el) => {
    el.addEventListener('click', () => toggleSpec(el as Element))
  })
  document.querySelectorAll('.svc-item-cta[data-svc]').forEach((btn) => {
    btn.addEventListener('click', () => cot.openModal((btn as HTMLElement).dataset.svc))
  })
}

async function loadCatalog() {
  try {
    const catalog = await loadServiciosCatalog()
    renderServicios(catalog)
  } catch (err) {
    console.error('[LexGeoCat] Error cargando catálogo:', err)
  }
  try {
    const rows = await loadFactoresPrecio()
    const fp: Record<string, FactorPrecio> = {}
    rows.forEach((r: FactorPrecio) => {
      fp[r.id] = r
    })
    cot.factores = fp
  } catch (err) {
    console.warn('[LexGeoCat] Error cargando factores_precio:', err)
  }
}

onUnmounted(() => {
  reveal.disconnect()
})
</script>

<template>
  <section class="svc-hero">
    <div class="c">
      <div class="svc-hero-inner">
        <div>
          <div class="svc-hero-badge">
            <i
              aria-hidden="true"
              class="fa-solid fa-briefcase"
              style="font-size: 10px"
            /> Centro de
            Servicios Profesionales
          </div>
          <h1 class="svc-hero-title">
            Consultoría <em>integral</em><br>en Territorio y Derecho
          </h1>
          <p class="svc-hero-desc">
            Siete áreas de especialización con más de 40 servicios específicos. Desde usucapión y
            catastro predial hasta visores GIS y aplicaciones web a medida — todo con respaldo
            profesional habilitado y registro oficial.
          </p>
          <div class="svc-hero-actions">
            <button
              class="btn btn-gold"
              @click="scrollToPanel('panel-derecho')"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-list"
              /> Explorar Servicios
            </button>
            <button
              class="btn btn-ghost"
              @click="cot.openModal()"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-calculator"
              /> Simular Cotización
            </button>
          </div>
        </div>
        <div class="svc-hero-stats">
          <div class="svc-hstat">
            <div class="svc-hstat-n">
              7
            </div>
            <div class="svc-hstat-l">
              Áreas
            </div>
            <i
              aria-hidden="true"
              class="fa-solid fa-layer-group svc-hstat-i"
            />
          </div>
          <div class="svc-hstat">
            <div class="svc-hstat-n">
              40+
            </div>
            <div class="svc-hstat-l">
              Servicios
            </div>
            <i
              aria-hidden="true"
              class="fa-solid fa-list-check svc-hstat-i"
            />
          </div>
          <div class="svc-hstat">
            <div class="svc-hstat-n">
              2
            </div>
            <div class="svc-hstat-l">
              Registros
            </div>
            <i
              aria-hidden="true"
              class="fa-solid fa-id-card svc-hstat-i"
            />
          </div>
          <div class="svc-hstat">
            <div class="svc-hstat-n">
              BO
            </div>
            <div class="svc-hstat-l">
              Cobertura
            </div>
            <i
              aria-hidden="true"
              class="fa-solid fa-earth-americas svc-hstat-i"
            />
          </div>
        </div>
      </div>
    </div>
  </section>

  <div
    class="c"
    style="padding-top: 32px; padding-bottom: 32px"
  >
    <div class="creds-banner reveal">
      <div class="cred-badge">
        <div class="cred-badge-icon">
          <i
            aria-hidden="true"
            class="fa-solid fa-gavel"
          />
        </div>
        <div class="cred-badge-info">
          <h4>Registro Público de Abogacía</h4>
          <p>Tribunal Supremo de Justicia — Bolivia</p>
          <code>R.P.A. Nº {{ SITE.rpa }}</code>
        </div>
      </div>
      <div class="creds-divider" />
      <div class="cred-badge">
        <div class="cred-badge-icon">
          <i
            aria-hidden="true"
            class="fa-solid fa-compass-drafting"
          />
        </div>
        <div class="cred-badge-info">
          <h4>Sociedad de Ingenieros de Bolivia</h4>
          <p>Técnico Universitario Superior — Catastro y Ord. Territorial</p>
          <code>R.N.T. Nº {{ SITE.rnt }}</code>
        </div>
      </div>
      <div class="creds-divider" />
      <div class="cred-badge">
        <div class="cred-badge-icon">
          <i
            aria-hidden="true"
            class="fa-solid fa-university"
          />
        </div>
        <div class="cred-badge-info">
          <h4>Formación Académica</h4>
          <p>UMSA · Catastro & Ord. Territorial<br>UPEA · Licenciatura en Derecho</p>
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
              <i
                aria-hidden="true"
                class="fa-solid fa-scale-balanced"
              />
            </div>
            <div>
              <h2>Asesoría Legal Territorial</h2>
              <p>
                Consultoría jurídica especializada en el sistema de derechos reales boliviano,
                normativa territorial y procesos registrales. Doble habilitación: Abogado (R.P.A.) e
                Ingeniero Catastral (R.N.T.), lo que permite una visión técnico-jurídica única en
                Bolivia.
              </p>
              <div class="area-creds">
                <span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-certificate"
                /> R.P.A. Nº
                  {{ SITE.rpa }}</span><span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-globe"
                /> Cobertura Nacional</span><span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-comments"
                /> Consulta inicial
                  gratuita</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-derecho">
            <p style="color: var(--text3); padding: 20px; text-align: center">
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
              <i
                aria-hidden="true"
                class="fa-solid fa-map-location-dot"
              />
            </div>
            <div>
              <h2>Gestión y Catastro Multifinalitario</h2>
              <p>
                Registro predial, valoración, nomenclatura y sistemas de información territorial.
                Especialización en catastro urbano y rural de municipios bolivianos, con manejo de
                plataformas SIG y normativa catastral vigente.
              </p>
              <div class="area-creds">
                <span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-certificate"
                /> R.N.T. Nº
                  {{ SITE.rnt }}</span><span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-graduation-cap"
                /> TUS — UMSA</span><span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-building"
                /> Catastro Urbano y
                  Rural</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-catastro">
            <p style="color: var(--text3); padding: 20px; text-align: center">
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
              <i
                aria-hidden="true"
                class="fa-solid fa-compass-drafting"
              />
            </div>
            <div>
              <h2>Ordenamiento Territorial</h2>
              <p>
                Planes de uso de suelo, zonificación, regulación municipal y asesoría técnica a
                Gobiernos Autónomos.
              </p>
              <div class="area-creds">
                <span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-file-contract"
                /> PLOT / PDM / POT</span><span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-building-columns"
                /> Asesoría a
                  GAMs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-ordenamiento">
            <p style="color: var(--text3); padding: 20px; text-align: center">
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
              <i
                aria-hidden="true"
                class="fa-solid fa-earth-americas"
              />
            </div>
            <div>
              <h2>Estudios y Análisis Geográficos</h2>
              <p>
                Investigación geoespacial, caracterización regional, estudios de impacto territorial
                y análisis de vulnerabilidad ante amenazas naturales.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-geografia">
            <p style="color: var(--text3); padding: 20px; text-align: center">
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
              <i
                aria-hidden="true"
                class="fa-solid fa-mountain"
              />
            </div>
            <div>
              <h2>Topografía y Geodesia Aplicada</h2>
              <p>
                Levantamientos de campo, control altimétrico, posicionamiento GNSS y
                georeferenciación en el sistema SIRGAS-BOL.
              </p>
              <div class="area-creds">
                <span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-satellite"
                /> GNSS / SIRGAS-BOL</span><span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-drafting-compass"
                /> Estación
                  Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-topografia">
            <p style="color: var(--text3); padding: 20px; text-align: center">
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
              <i
                aria-hidden="true"
                class="fa-solid fa-layer-group"
              />
            </div>
            <div>
              <h2>Geomática y Sistemas de Información Geográfica</h2>
              <p>
                Implementación de infraestructuras de datos espaciales, análisis con PostGIS,
                cartografía temática, teledetección y geoservicios OGC.
              </p>
              <div class="area-creds">
                <span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-database"
                /> PostGIS / GeoServer</span><span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-brands fa-python"
                /> Python / GeoPandas</span><span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-globe"
                /> WMS / WFS / WCS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-geomatica">
            <p style="color: var(--text3); padding: 20px; text-align: center">
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
              <i
                aria-hidden="true"
                class="fa-solid fa-code"
              />
            </div>
            <div>
              <h2>Desarrollo de Software y Aplicaciones Web</h2>
              <p>
                Aplicaciones web geográficas, sistemas de gestión territorial, APIs y portales
                institucionales.
              </p>
              <div class="area-creds">
                <span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-brands fa-js"
                /> JavaScript / Python</span><span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-solid fa-map"
                /> Leaflet / MapLibre</span><span class="area-cred"><i
                  aria-hidden="true"
                  class="fa-brands fa-github"
                /> GitHub Pages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="specialties-wrap">
        <div class="c">
          <div id="svc-grid-software">
            <p style="color: var(--text3); padding: 20px; text-align: center">
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
        <span class="sl">Metodología</span>
        <h2 class="st">
          ¿Cómo Trabajamos?
        </h2>
        <p class="sd">
          Proceso transparente, orientado a resultados y adaptado al contexto boliviano.
        </p>
      </div>
      <div class="process-grid">
        <div class="process-step reveal">
          <div class="process-num">
            01
          </div>
          <h4>Consulta Inicial</h4>
          <p>Diagnóstico gratuito por WhatsApp o correo.</p>
        </div>
        <div class="process-step reveal">
          <div class="process-num">
            02
          </div>
          <h4>Propuesta Técnica</h4>
          <p>
            Entregamos una propuesta detallada con alcance, metodología, cronograma y cotización
            formal sin compromiso.
          </p>
        </div>
        <div class="process-step reveal">
          <div class="process-num">
            03
          </div>
          <h4>Ejecución</h4>
          <p>Desarrollo del servicio con actualizaciones periódicas.</p>
        </div>
        <div class="process-step reveal">
          <div class="process-num">
            04
          </div>
          <h4>Entrega y Soporte</h4>
          <p>Entrega de productos, documentación y soporte post-servicio.</p>
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
        <span class="sl">Desde el Blog</span>
        <h2 class="st">
          Artículos Técnicos
        </h2>
        <p class="sd">
          Contenido práctico sobre derecho territorial, catastro, geomática y desarrollo de software
          aplicado a Bolivia.
        </p>
      </div>
      <div
        v-if="blogLoading"
        style="
          color: var(--text3);
          text-align: center;
          padding: 40px;
          grid-column: 1/-1;
          font-size: 0.85rem;
        "
      >
        <i
          aria-hidden="true"
          class="fa-solid fa-spinner fa-spin"
          style="margin-right: 8px"
        />
        Cargando artículos…
      </div>
      <div
        v-else-if="blogError"
        style="
          color: var(--text3);
          text-align: center;
          padding: 40px;
          grid-column: 1/-1;
          font-size: 0.85rem;
        "
      >
        No se pudieron cargar los artículos.
        <a
          :href="SITE.blog.url"
          style="color: var(--teal)"
        >Visita el blog</a>.
      </div>
      <div
        v-else-if="!blogEntries.length"
        style="
          color: var(--text3);
          text-align: center;
          padding: 40px;
          grid-column: 1/-1;
          font-size: 0.85rem;
        "
      >
        Próximamente artículos desde el blog técnico.
      </div>
      <div
        v-else
        class="blog-grid"
      >
        <BlogCard
          v-for="e in blogEntries"
          :key="e.id"
          :entry="e"
        />
      </div>
      <div style="text-align: center; margin-top: 40px">
        <a
          class="btn btn-ghost"
          :href="SITE.blog.url"
        ><i
          aria-hidden="true"
          class="fa-solid fa-newspaper"
        /> Ver todos en el Blog</a>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="c">
      <div class="contact-strip reveal">
        <h3>¿Tienes un proyecto en mente?</h3>
        <p>
          Consulta inicial gratuita. Respondo en menos de 24 horas hábiles. Sin compromiso de
          contratación.
        </p>
        <div class="contact-strip-btns">
          <a
            class="btn btn-whatsapp"
            :href="`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('Hola, quiero información sobre sus servicios')}`"
          ><i
            aria-hidden="true"
            class="fa-brands fa-whatsapp"
          /> Escribir por WhatsApp</a>
          <router-link
            class="btn btn-teal"
            to="/pages/contacto.html"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-envelope"
            /> Formulario de Contacto
          </router-link>
          <button
            class="btn btn-ghost"
            @click="cot.openModal()"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-calculator"
            /> Simular Cotización
          </button>
        </div>
      </div>
    </div>
  </section>

  <CotizadorModal />
</template>
