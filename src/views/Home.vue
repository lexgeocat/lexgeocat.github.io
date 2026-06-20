<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal, useCounters } from '../composables/useReveal'
import boliviaMap from '@/assets/img/fd-bolivia-map.svg?url'
import { SITE } from '../config/site'
import { useBloggerFeed } from '../composables/useBloggerFeed'
import BlogCard from '../components/BlogCard.vue'

const { entries: blogEntries, load: loadBlog } = useBloggerFeed({ limit: 3 })
const { entries: recursosEntries, load: loadRecursos } = useBloggerFeed({ label: 'Recursos', limit: 6, categoryCls: 'def', categoryLabel: 'Recurso' })
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
            <a class="btn btn-ghost" href="${SITE.blog.url}"><i class="fa-solid fa-newspaper"></i> Explorar Blog</a>
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
      <div class="blog-grid">
       <BlogCard v-for="e in blogEntries" :key="e.id" :entry="e" />
      </div>
      <div style="text-align:center;margin-top:44px">
        <a class="btn btn-gold" href="${SITE.blog.url}"><i class="fa-solid fa-newspaper"></i> Ver todos en el Blog</a>
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
      <div class="g g-auto">
       <BlogCard v-for="e in recursosEntries" :key="e.id" :entry="e" />
    </div>
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
              <p>S.I.B. — R.N.T. Nº {{ SITE.rnt }}</p>
             <p style="margin-top:4px">R.P.A. — Nº {{ SITE.rpa }}</p>
            </div>
          </div>
          <div style="margin-top:32px">
            <a class="btn btn-whatsapp" :href="SITE.social.whatsapp" target="_blank" rel="noopener" style="display:inline-flex;width:100%;justify-content:center"><i class="fa-brands fa-whatsapp"></i> Escríbeme por WhatsApp</a>
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
