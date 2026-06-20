<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal, useCounters } from '../composables/useReveal'
import boliviaMap from '@/assets/img/fd-bolivia-map.svg?url'
import { SITE } from '../config/site'
import { useBloggerFeed } from '../composables/useBloggerFeed'
import BlogCard from '../components/BlogCard.vue'

const { entries: blogEntries, load: loadBlog } = useBloggerFeed({ limit: 3 })
const { entries: recursosEntries, load: loadRecursos } = useBloggerFeed({
  label: 'Recursos',
  limit: 6,
  categoryCls: 'def',
  categoryLabel: 'Recurso',
})
const reveal = useReveal()
const counters = useCounters()

let onMouseMove: ((e: MouseEvent) => void) | null = null

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
      bgMap.style.transform = `translate(${x * 30}px, ${y * 30}px)`
    }
    window.addEventListener('mousemove', onMouseMove)
  }

  // Blogger feed loader for stats and blog posts
  const CFG = {
    bloggerFeed: SITE.blog.feed,
    blogUrl: SITE.blog.url,
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
  // Load blog grid
  if (CFG.bloggerFeed) {
    loadBlog()
  }

  // Load recursos grid
  loadRecursos()
})

onUnmounted(() => {
  reveal.disconnect()
  counters.disconnect()
  if (onMouseMove) window.removeEventListener('mousemove', onMouseMove)
})

// ─── Utility functions (ported from main.js) ───
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
          <h1 class="hero-title">
            Lex <span class="accent-teal">Geo</span><span class="accent-gold">Cat</span>
            <span class="line-sub">Derecho, Catastro y Ordenamiento Territorial, Geografía y Geomática</span>
          </h1>
          <p class="hero-desc">
            Plataforma especializada en consultoría, recursos y formación técnica en materia legal,
            catastral y sistemas de información geográfica adaptados al contexto boliviano.
          </p>
          <div class="hero-btns">
            <router-link
              class="btn btn-gold"
              to="/pages/servicios.html"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-briefcase"
              /> Ver Servicios
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
                id="stat-articulos"
                class="hstat-n"
                data-count="0"
              >
                0
              </div>
              <div class="hstat-l">
                Artículos
              </div>
            </div>
            <div class="hstat">
              <div
                id="stat-especialidades"
                class="hstat-n"
                data-count="0"
              >
                0
              </div>
              <div class="hstat-l">
                Especialidades
              </div>
            </div>
            <div class="hstat">
              <div
                id="stat-servicios"
                class="hstat-n"
                data-count="0"
              >
                0
              </div>
              <div class="hstat-l">
                Servicios
              </div>
            </div>
            <div class="hstat">
              <div
                id="stat-recursos"
                class="hstat-n"
                data-count="0"
              >
                0
              </div>
              <div class="hstat-l">
                Recursos
              </div>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="floating-dashboard">
            <object
              class="fd-bg-map"
              type="image/svg+xml"
              :data="boliviaMap"
              aria-hidden="true"
            />
            <div class="fd-card fdc-1 reveal">
              <i
                aria-hidden="true"
                class="fa-solid fa-scale-balanced"
              />
              <div>
                <h4>Derecho</h4>
                <p>Civil, Constitucional, Administrativo</p>
              </div>
            </div>
            <div class="fd-card fdc-2 reveal">
              <i
                aria-hidden="true"
                class="fa-solid fa-map-location-dot"
              />
              <div>
                <h4>Catastro y Ordenamiento Territorial</h4>
                <p>Valoración catastral, SIG Areas Urbanas y Rurales</p>
              </div>
            </div>
            <div class="fd-card fdc-3 reveal">
              <i
                aria-hidden="true"
                class="fa-solid fa-mountain"
              />
              <div>
                <h4>Topografía y Geodesia</h4>
                <p>GNSS, redes y precisión</p>
              </div>
            </div>
            <div class="fd-card fdc-4 reveal">
              <i
                aria-hidden="true"
                class="fa-solid fa-layer-group"
              />
              <div>
                <h4>Geografía y Geomática</h4>
                <p>SIG, Cartografia y Geoprocesamiento</p>
              </div>
            </div>
            <div class="fd-card fdc-5 reveal">
              <i
                aria-hidden="true"
                class="fa-solid fa-code"
              />
              <div>
                <h4>Software &amp; Web</h4>
                <p>Aplicaciones a medida</p>
              </div>
            </div>
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
          /> Explorar</span>
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
          /> Explorar</span>
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
          /> Explorar</span>
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
          /> Explorar</span>
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
          /> Explorar</span>
        </router-link>
        <router-link
          class="cat-card reveal esp-geomatica"
          to="/pages/geomantica.html"
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
          /> Explorar</span>
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
          /> Explorar</span>
        </router-link>
      </div>
    </div>
  </section>

  <section
    id="blog-section"
    class="sec-stripe"
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
          Contacto Rápido
        </h2>
        <p class="sd">
          Consultas profesionales, colaboraciones o asesoramiento directo.
        </p>
      </div>
      <div class="contact-wrap">
        <div class="contact-info">
          <h3>Información de Contacto</h3>
          <p>
            Disponible para consultas en derecho, catastro, GIS y servicios relacionados con la
            gestión territorial y el ordenamiento urbano en Bolivia.
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
              <p>Viacha, Departamento de La Paz, Bolivia</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i
                aria-hidden="true"
                class="fa-solid fa-envelope"
              />
            </div>
            <div class="contact-text">
              <h4>Correo Electrónico</h4>
              <p>lexgeocat@gmail.com</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i
                aria-hidden="true"
                class="fa-solid fa-id-card"
              />
            </div>
            <div class="contact-text">
              <h4>Registros Profesionales</h4>
              <p>S.I.B. — R.N.T. Nº {{ SITE.rnt }}</p>
              <p style="margin-top: 4px">
                R.P.A. — Nº {{ SITE.rpa }}
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
            /> Escríbeme por WhatsApp</a>
          </div>
        </div>
        <div class="cf-form-cta">
          <p class="cta-lead">
            ¿Quieres contactarme directamente?
          </p>
          <p class="cta-email">
            <i
              aria-hidden="true"
              class="fa-solid fa-envelope"
            />
            <strong>lexgeocat@gmail.com</strong>
          </p>
          <router-link
            class="btn btn-gold"
            to="/pages/contacto.html"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-envelope"
            /> Ir al formulario de contacto
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>
