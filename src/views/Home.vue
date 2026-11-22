<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useReveal, useCounters } from '../shared/composables/useReveal'
import BoliviaMapSvg from '@/shared/components/BoliviaMapSvg.vue'
import type { HeroMapLayer } from '@/shared/components/bolivia-map'
import { SITE } from '../config/site'
import { useBloggerFeed } from '../features/blog/useBloggerFeed'
import BlogCard from '../features/blog/BlogCard.vue'
import iuriscoreLogo from '@/assets/img/iuriscore-logo.png'

const activeMapLayer = ref<HeroMapLayer>(null)
const mapParallax = ref({ x: 0, y: 0 })

function setMapLayer(layer: HeroMapLayer) {
  activeMapLayer.value = layer
}

function handleHeroVisualMove(e: MouseEvent) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const target = e.currentTarget as HTMLElement | null
  if (!target) return
  const rect = target.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  const nx = (e.clientX - rect.left) / rect.width - 0.5
  const ny = (e.clientY - rect.top) / rect.height - 0.5
  mapParallax.value = {
    x: Number((nx * 6).toFixed(2)),
    y: Number((ny * 6).toFixed(2)),
  }
}

function resetHeroVisualMove() {
  mapParallax.value = { x: 0, y: 0 }
}

const {
  entries: blogEntries,
  totalResults: blogTotal,
  load: loadBlog,
} = useBloggerFeed({ limit: 3 })
const {
  entries: recursosEntries,
  totalResults: recursosTotal,
  load: loadRecursos,
} = useBloggerFeed({
  label: 'Recursos',
  limit: 6,
  categoryCls: 'def',
  categoryLabel: 'Recurso',
})
const reveal = useReveal()
const counters = useCounters()

let onMouseMove: ((e: MouseEvent) => void) | null = null

function updateStatEl(id: string, count: number, suffix = '') {
  const el = document.getElementById(id)
  if (!el) return
  el.setAttribute('data-count', String(count))
  el.textContent = `${count}${suffix}`
}

watch(blogTotal, (val) => {
  if (val > 0) updateStatEl('stat-articulos', val, '+')
})

watch(recursosTotal, (val) => {
  if (val > 0) updateStatEl('stat-recursos', val, '+')
})

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reveal.observe()
      counters.observe()
    })
  })

  const bgMap = document.querySelector('.hero-bg-grid') as HTMLElement | null
  if (bgMap) {
    onMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      bgMap.style.transform = `translate(${x * 24}px, ${y * 24}px)`
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
  }

  const CFG = {
    bloggerFeed: SITE.blog.feed,
    blogUrl: SITE.blog.url,
    profesiones: [
      { id: 'derecho', label: 'Derecho' },
      { id: 'catastro', label: 'Catastro' },
      { id: 'ordenamiento', label: 'Ordenamiento' },
      { id: 'geografia', label: 'Geografía' },
      { id: 'topogeodesia', label: 'Topografía' },
      { id: 'geomatica', label: 'Geomática' },
      { id: 'desarrollo', label: 'Software' },
    ],
  }

  updateStatEl('stat-articulos', 24, '+')
  updateStatEl('stat-especialidades', CFG.profesiones.length)
  updateStatEl('stat-servicios', 40, '+')
  updateStatEl('stat-recursos', 15, '+')
  setTimeout(() => counters.observe(), 80)

  if (CFG.bloggerFeed) {
    loadBlog()
  }

  loadRecursos()
})

onUnmounted(() => {
  reveal.disconnect()
  counters.disconnect()
  if (onMouseMove) window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <section class="hero">
    <div class="hero-bg">
      <div
        class="hero-bg-grid"
        aria-hidden="true"
      />
      <div
        class="hero-bg-fade"
        aria-hidden="true"
      />
      <div class="hero-bg-glow1" />
      <div class="hero-bg-glow2" />
    </div>

    <div class="c">
      <div class="hero-grid">
        <div class="hero-content">
          <div class="hero-eyebrow">
            <span
              class="pulse-dot"
              aria-hidden="true"
            />
            <span>LA PAZ · BOLIVIA</span>
            <span class="eyebrow-sep">|</span>
            <span class="eyebrow-hl">INGENIERÍA TERRITORIAL &amp; DERECHO</span>
          </div>

          <h1 class="hero-title">
            Derecho, <span class="accent-gold">Catastro</span>, Ordenamiento Territorial y
            <span class="accent-teal">Geomática</span>
          </h1>

          <p class="hero-desc">
            Plataforma especializada en consultoría técnico-jurídica, recursos normativos y
            sistemas de información geográfica adaptados al marco legal y territorial de Bolivia.
          </p>

          <div class="hero-btns">
            <router-link
              class="btn btn-gold"
              to="/pages/servicios.html"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-briefcase"
              /> Catálogo y Cotizador
            </router-link>
            <router-link
              class="btn btn-teal"
              to="/pages/normativa.html"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-scale-balanced"
              /> Biblioteca Normativa
            </router-link>
            <a
              class="btn btn-ghost"
              :href="SITE.blog.url"
            ><i
              aria-hidden="true"
              class="fa-solid fa-newspaper"
            /> Explorar Blog</a>
          </div>

          <div class="hero-stats">
            <div class="hstat">
              <div
                id="stat-especialidades"
                class="hstat-n"
                data-count="7"
              >
                7
              </div>
              <div class="hstat-l">
                Especialidades
              </div>
            </div>
            <div class="hstat">
              <div
                id="stat-servicios"
                class="hstat-n"
                data-count="40"
              >
                40+
              </div>
              <div class="hstat-l">
                Servicios
              </div>
            </div>
            <div class="hstat">
              <div
                id="stat-articulos"
                class="hstat-n"
                data-count="24"
              >
                24+
              </div>
              <div class="hstat-l">
                Artículos
              </div>
            </div>
            <div class="hstat">
              <div
                id="stat-recursos"
                class="hstat-n"
                data-count="15"
              >
                15+
              </div>
              <div class="hstat-l">
                Recursos
              </div>
            </div>
          </div>
        </div>

        <div
          class="hero-visual"
          @mousemove="handleHeroVisualMove"
          @mouseleave="resetHeroVisualMove"
        >
          <div
            class="floating-dashboard"
            :style="{
              '--fd-px': `${mapParallax.x}px`,
              '--fd-py': `${mapParallax.y}px`,
            }"
          >
            <BoliviaMapSvg
              class="fd-bg-map"
              :active-layer="activeMapLayer"
            />
            <router-link
              to="/pages/derecho.html"
              class="fd-card fdc-1"
              :class="{ 'is-active': activeMapLayer === 'derecho' }"
              @mouseenter="setMapLayer('derecho')"
              @mouseleave="setMapLayer(null)"
              @focus="setMapLayer('derecho')"
              @blur="setMapLayer(null)"
            >
              <div class="fd-icon">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-scale-balanced"
                />
              </div>
              <div>
                <h4>Derecho</h4>
                <p>Civil, Agrario, Registral y Notarial</p>
              </div>
            </router-link>
            <router-link
              to="/pages/catastro.html"
              class="fd-card fdc-2"
              :class="{ 'is-active': activeMapLayer === 'catastro' }"
              @mouseenter="setMapLayer('catastro')"
              @mouseleave="setMapLayer(null)"
              @focus="setMapLayer('catastro')"
              @blur="setMapLayer(null)"
            >
              <div class="fd-icon">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-map-location-dot"
                />
              </div>
              <div>
                <h4>Catastro y Ordenamiento Territorial</h4>
                <p>Valuación predial, SIG urbano y rural</p>
              </div>
            </router-link>
            <router-link
              to="/pages/topogeodesia.html"
              class="fd-card fdc-3"
              :class="{ 'is-active': activeMapLayer === 'topogeodesia' }"
              @mouseenter="setMapLayer('topogeodesia')"
              @mouseleave="setMapLayer(null)"
              @focus="setMapLayer('topogeodesia')"
              @blur="setMapLayer(null)"
            >
              <div class="fd-icon">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-mountain"
                />
              </div>
              <div>
                <h4>Topografía y Geodesia</h4>
                <p>GNSS, redes SIRGAS-BOL y precisión</p>
              </div>
            </router-link>
            <router-link
              to="/pages/geomatica.html"
              class="fd-card fdc-4"
              :class="{ 'is-active': activeMapLayer === 'geomatica' }"
              @mouseenter="setMapLayer('geomatica')"
              @mouseleave="setMapLayer(null)"
              @focus="setMapLayer('geomatica')"
              @blur="setMapLayer(null)"
            >
              <div class="fd-icon">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-layer-group"
                />
              </div>
              <div>
                <h4>Geografía y Geomática</h4>
                <p>PostGIS, QGIS y Teledetección</p>
              </div>
            </router-link>
            <router-link
              to="/pages/desarrollo-software.html"
              class="fd-card fdc-5"
              :class="{ 'is-active': activeMapLayer === 'software' }"
              @mouseenter="setMapLayer('software')"
              @mouseleave="setMapLayer(null)"
              @focus="setMapLayer('software')"
              @blur="setMapLayer(null)"
            >
              <div class="fd-icon">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-code"
                />
              </div>
              <div>
                <h4>Software &amp; Web GIS</h4>
                <p>Geoportales y aplicaciones a medida</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section
    id="categorias-servicios"
    class="sec-stripe"
  >
    <div class="c">
      <div class="sh center">
        <span class="sl">Especialidades</span>
        <h2 class="st">
          Áreas de Especialización
        </h2>
        <p class="sd">
          Siete disciplinas en la intersección del derecho, la ingeniería territorial, la geomática
          y el desarrollo de software aplicadas al contexto boliviano.
        </p>
      </div>
      <div
        id="especialidades-grid"
        class="g g-auto"
      >
        <router-link
          class="cat-card reveal esp-derecho"
          to="/pages/derecho.html"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-scale-balanced ci"
          />
          <h3 class="ct">
            Derecho
          </h3>
          <p class="cd">
            Legislación boliviana, derecho civil, usucapión, derecho registral, notarial y normativa
            territorial aplicable a la gestión del territorio.
          </p>
          <span class="cat-tag"><i
            aria-hidden="true"
            class="fa-solid fa-arrow-right"
          /> Explorar área</span>
        </router-link>
        <router-link
          class="cat-card reveal esp-catastro"
          to="/pages/catastro.html"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-map ci"
          />
          <h3 class="ct">
            Catastro
          </h3>
          <p class="cd">
            Registro predial, valuación fiscal, nomenclatura catastral, fichas prediales,
            geocodificación y sistemas de información territorial.
          </p>
          <span class="cat-tag"><i
            aria-hidden="true"
            class="fa-solid fa-arrow-right"
          /> Explorar área</span>
        </router-link>
        <router-link
          class="cat-card reveal esp-ordenamiento"
          to="/pages/ordenamiento.html"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-compass-drafting ci"
          />
          <h3 class="ct">
            Ordenamiento Territorial
          </h3>
          <p class="cd">
            Planes de ordenamiento urbano y rural, zonificación, uso de suelo, normativa territorial
            y asesoría a gobiernos municipales.
          </p>
          <span class="cat-tag"><i
            aria-hidden="true"
            class="fa-solid fa-arrow-right"
          /> Explorar área</span>
        </router-link>
        <router-link
          class="cat-card reveal esp-geografia"
          to="/pages/geografia.html"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-earth-americas ci"
          />
          <h3 class="ct">
            Geografía
          </h3>
          <p class="cd">
            Análisis del territorio, geografía humana, física, regional, urbana, rural y de los
            riesgos naturales en Bolivia.
          </p>
          <span class="cat-tag"><i
            aria-hidden="true"
            class="fa-solid fa-arrow-right"
          /> Explorar área</span>
        </router-link>
        <router-link
          class="cat-card reveal esp-topografia"
          to="/pages/topogeodesia.html"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-mountain ci"
          />
          <h3 class="ct">
            Topografía y Geodesia
          </h3>
          <p class="cd">
            Levantamientos topográficos, planimetría, altimetría, replanteo, posicionamiento GNSS,
            redes geodésicas y modelos geoidales.
          </p>
          <span class="cat-tag"><i
            aria-hidden="true"
            class="fa-solid fa-arrow-right"
          /> Explorar área</span>
        </router-link>
        <router-link
          class="cat-card reveal esp-geomatica"
          to="/pages/geomatica.html"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-layer-group ci"
          />
          <h3 class="ct">
            Geomática
          </h3>
          <p class="cd">
            Sistemas de información geográfica, teledetección, cartografía digital, PostGIS/QGIS,
            GeoServer y análisis espacial avanzado.
          </p>
          <span class="cat-tag"><i
            aria-hidden="true"
            class="fa-solid fa-arrow-right"
          /> Explorar área</span>
        </router-link>
        <router-link
          class="cat-card reveal esp-software"
          to="/pages/desarrollo-software.html"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-code ci"
          />
          <h3 class="ct">
            Desarrollo de Software y Aplicaciones Web
          </h3>
          <p class="cd">
            Aplicaciones web geográficas, bases de datos espaciales, APIs, automatización, portales
            institucionales y servicios públicos digitales.
          </p>
          <span class="cat-tag"><i
            aria-hidden="true"
            class="fa-solid fa-arrow-right"
          /> Explorar área</span>
        </router-link>
      </div>
    </div>
  </section>

  <section
    id="blog-section"
    class="sec"
  >
    <div class="c">
      <div class="sh center">
        <span class="sl">BLOG TÉCNICO</span>
        <h2 class="st">
          Últimos Artículos
        </h2>
        <p class="sd">
          Análisis, guías y recursos desde la práctica profesional en derecho territorial, catastro,
          geomática y desarrollo de software en Bolivia.
        </p>
      </div>
      <div class="blog-grid">
        <BlogCard
          v-for="e in blogEntries"
          :key="e.id"
          :entry="e"
        />
      </div>
      <div style="text-align: center; margin-top: 44px">
        <a
          class="btn btn-gold"
          :href="SITE.blog.url"
        ><i
          aria-hidden="true"
          class="fa-solid fa-newspaper"
        /> Ver todos en el Blog</a>
      </div>
    </div>
  </section>

  <section
    id="iuriscore-destacado"
    class="sec"
  >
    <div class="c">
      <div class="ic-home-showcase reveal">
        <div class="ic-home-texto">
          <span class="sl">SOFTWARE JURÍDICO · PRODUCTO OFICIAL</span>
          <div class="ic-home-head">
            <img
              :src="iuriscoreLogo"
              alt="IurisCore Legal Hub"
              class="ic-home-logo"
            >
            <div>
              <h2 class="st">
                IurisCore · Legal Hub
              </h2>
              <p class="ic-home-sub">
                Windows 10/11 (32/64 bits) · Windows 7 Offline · Android
              </p>
            </div>
          </div>
          <p class="ic-home-desc">
            Administra expedientes, clientes, escritos, modelos automatizados en Word/Redactor
            propio con impresión 1:1, códigos en organigramas interactivos y jurisprudencia del TSJ
            y TCP <strong>sin depender de internet ni pagar servidores mensuales</strong>. Conecta tu
            cuenta de Google Drive para sincronizar de forma cifrada e incremental entre tu PC y tu
            celular.
          </p>
          <div class="ic-home-bullets">
            <span><i
              aria-hidden="true"
              class="fa-solid fa-shield-halved"
            /> Privacidad 100 % Local-First + ChaCha20</span>
            <span><i
              aria-hidden="true"
              class="fa-solid fa-file-word"
            /> IurisCore Redactor Independiente</span>
            <span><i
              aria-hidden="true"
              class="fa-solid fa-diagram-project"
            /> Organigramas y Flujogramas</span>
            <span><i
              aria-hidden="true"
              class="fa-solid fa-mobile-screen-button"
            /> Licencia unificada PC + Android</span>
          </div>
          <div class="ic-home-ctas">
            <router-link
              class="btn btn-gold"
              to="/pages/iuriscore.html"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-scale-balanced"
              /> Explorar IurisCore y Planes
            </router-link>
            <a
              class="btn btn-teal"
              :href="SITE.iuriscore.descargar"
              target="_blank"
              rel="noopener"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-download"
              /> Descargar prueba gratuita (7 días)
            </a>
            <a
              class="btn btn-ghost"
              :href="SITE.iuriscore.comprar"
              target="_blank"
              rel="noopener"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-qrcode"
              /> Adquirir licencia QR
            </a>
          </div>
        </div>
        <div class="ic-home-visual">
          <div class="ic-preview-card">
            <div class="ic-preview-top">
              <span class="ic-dot" />
              <span class="ic-dot" />
              <span class="ic-dot" />
              <span class="ic-preview-tit">Ecosistema IurisCore · PC &amp; Android</span>
            </div>
            <ul class="ic-preview-lista">
              <li>
                <i
                  aria-hidden="true"
                  class="fa-solid fa-folder-open"
                />
                <div>
                  <strong>Expedientes y Escritos</strong>
                  <span>Control completo de partes, actuaciones y archivos locales</span>
                </div>
              </li>
              <li>
                <i
                  aria-hidden="true"
                  class="fa-solid fa-pen-nib"
                />
                <div>
                  <strong>Redactor Forense 1:1</strong>
                  <span>Impresión exacta en Carta, Oficio y A4 sin márgenes desplazados</span>
                </div>
              </li>
              <li>
                <i
                  aria-hidden="true"
                  class="fa-solid fa-gavel"
                />
                <div>
                  <strong>Jurisprudencia TSJ &amp; TCP + Normativa</strong>
                  <span>Biblioteca offline y mapas jerárquicos por libro, título y artículo</span>
                </div>
              </li>
              <li>
                <i
                  aria-hidden="true"
                  class="fa-solid fa-rotate"
                />
                <div>
                  <strong>Sync Incremental Cifrada</strong>
                  <span>Transfiere solo los cambios entre ordenador y celular</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section
    id="recursos-servicios"
    class="sec-stripe"
  >
    <div class="c">
      <div class="sh center">
        <span class="sl">Recursos</span>
        <h2 class="st">
          Herramientas y Materiales
        </h2>
        <p class="sd">
          Recursos útiles para profesionales del derecho, catastro y geomática en Bolivia.
        </p>
      </div>
      <div class="g g-auto">
        <BlogCard
          v-for="e in recursosEntries"
          :key="e.id"
          :entry="e"
        />
      </div>
      <div style="text-align: center; margin-top: 40px">
        <router-link
          class="btn btn-gold"
          to="/pages/recursos.html"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-folder-open"
          /> Ver todos los recursos
        </router-link>
      </div>
    </div>
  </section>

  <section
    id="contacto-servicios"
    class="sec"
  >
    <div class="c">
      <div class="sh center">
        <span class="sl">Contacto</span>
        <h2 class="st">
          Contacto Directo
        </h2>
        <p class="sd">
          Consultas profesionales, diagnósticos técnico-legales o asesoramiento especializado.
        </p>
      </div>
      <div class="contact-wrap">
        <div class="contact-info">
          <h3>Información Institucional</h3>
          <p>
            Disponible para consultas en derecho, catastro, sistemas de información geográfica y
            proyectos de gestión territorial y ordenamiento urbano en Bolivia.
          </p>
          <div class="contact-item">
            <div class="contact-icon">
              <i
                aria-hidden="true"
                class="fa-solid fa-location-dot"
              />
            </div>
            <div class="contact-text">
              <h4>Ubicación</h4>
              <p>{{ SITE.location }}</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i
                aria-hidden="true"
                class="fa-solid fa-globe"
              />
            </div>
            <div class="contact-text">
              <h4>Cobertura y Modalidad</h4>
              <p>Atención presencial en La Paz y consultoría remota en toda Bolivia</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i
                aria-hidden="true"
                class="fa-solid fa-id-badge"
              />
            </div>
            <div class="contact-text">
              <h4>Respaldo Profesional</h4>
              <p>
                Habilitación legal, catastral y equipo técnico en
                <router-link to="/pages/acerca-de.html">
                  Sobre Nosotros
                </router-link>
              </p>
            </div>
          </div>
          <div class="contact-wa-wrap">
            <a
              class="btn btn-whatsapp"
              :href="SITE.social.whatsapp"
              target="_blank"
              rel="noopener"
            ><i
              aria-hidden="true"
              class="fa-brands fa-whatsapp"
            /> Consulta rápida por WhatsApp</a>
          </div>
        </div>
        <div class="cf-form-cta">
          <span class="cta-badge">
            <i
              aria-hidden="true"
              class="fa-solid fa-clock"
            /> Respuesta en menos de 24h hábiles
          </span>
          <h3 class="cta-lead">
            ¿Necesitas una cotización o diagnóstico?
          </h3>
          <p class="cta-sub">
            Simula el presupuesto referencial de tu trámite o proyecto en línea, o envíanos los
            detalles mediante el formulario de contacto.
          </p>
          <div class="cta-email">
            <i
              aria-hidden="true"
              class="fa-solid fa-envelope"
            />
            <strong>{{ SITE.email }}</strong>
          </div>
          <div class="cta-actions">
            <router-link
              class="btn btn-gold"
              to="/pages/contacto.html"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-paper-plane"
              /> Formulario de contacto
            </router-link>
            <router-link
              class="btn btn-ghost"
              to="/pages/servicios.html"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-calculator"
              /> Cotizador de servicios
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
