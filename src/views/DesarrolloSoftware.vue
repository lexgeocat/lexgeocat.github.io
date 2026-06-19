<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal } from '../composables/useReveal'
import { loadTopicFeed } from '../composables/useBlogFeed'
const reveal = useReveal()
onMounted(() => {
  requestAnimationFrame(() => { requestAnimationFrame(() => { reveal.observe() }) })
  loadTopicFeed({
    bloggerFeed: 'https://lexgeocat.blogspot.com/feeds/posts/default',
    blogUrl: 'https://lexgeocat.blogspot.com/',
    label: 'Desarrollo de Software',
    badgeCls: 'software',
    badgeLabel: 'Software',
    icon: 'fa-solid fa-code',
    placeholderMsg: 'Próximamente artículos sobre Desarrollo de Software.'
  })
})
onUnmounted(() => { reveal.disconnect() })
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon"><i class="fa-solid fa-code"></i></div>
      <span class="sl">Especialidad</span>
      <h1 class="st">Desarrollo de Software y Aplicaciones Web</h1>
      <p class="sd">Diseño, desarrollo e implementación de software y aplicaciones web especializadas en gestión territorial, catastro, SIG y servicios públicos digitales en Bolivia.</p>
    </div>
  </section>
  <section class="page-content">
    <div class="c">
      <div class="at-body">
        <p>La transformación digital del territorio requiere software a medida. En LexGeoCat diseño y desarrollo aplicaciones web, plataformas SIG, visores de mapas, sistemas de catastro en línea y APIs geoespaciales adaptados a la realidad institucional y normativa boliviana.</p>
        <h2>Servicios de desarrollo</h2>
        <div class="feature-grid">
          <div class="feature-item reveal"><i class="fa-solid fa-globe"></i><h3>Aplicaciones web geográficas</h3><p>Visores de mapas, portales SIG y plataformas web responsive con Leaflet, MapLibre y OpenLayers.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-database"></i><h3>Bases de datos espaciales</h3><p>Diseño e implementación de PostgreSQL/PostGIS, modelado geoespacial y optimización de consultas SQL.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-server"></i><h3>APIs y microservicios</h3><p>APIs REST geoespaciales (GeoServer, MapServer), servicios OGC (WMS, WFS, WCS) y microservicios en Node.js y Python.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-gears"></i><h3>Automatización y ETL</h3><p>Scripts Python, flujos ETL geoespaciales, GeoPackage y publicación automática de cartografía.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-mobile-screen"></i><h3>Aplicaciones móviles y PWA</h3><p>Apps móviles y Progressive Web Apps adaptadas a trabajo en campo y consultas ciudadanas.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-shield-halved"></i><h3>Despliegue y mantenimiento</h3><p>Despliegue en GitHub Pages, VPS, hosting institucional con HTTPS, CI/CD y monitoreo continuo.</p></div>
        </div>
        <h2>Stack tecnológico</h2>
        <p>Trabajo con herramientas modernas y estándares abiertos: <strong>PostgreSQL/PostGIS</strong>, <strong>GeoServer</strong>, <strong>QGIS</strong>, <strong>Python</strong>, <strong>JavaScript</strong>, <strong>HTML/CSS</strong>, <strong>Leaflet</strong>, <strong>MapLibre GL</strong>, <strong>OpenLayers</strong> y <strong>Git</strong>.</p>
      </div>
      <div class="sh center" style="margin-top:48px"><span class="sl">Blog</span><h2 class="st">Artículos recientes</h2></div>
      <div class="g g3" id="topic-posts-grid"></div>
      <div class="blog-cta">
        <h3>¿Necesitas un sistema o aplicación a medida?</h3>
        <p>Conversemos sobre tu proyecto y construyamos una solución digital adaptada al contexto boliviano.</p>
        <router-link class="btn btn-gold" to="/"><i class="fa-solid fa-envelope"></i> Solicitar cotización</router-link>
      </div>
    </div>
  </section>
</template>
