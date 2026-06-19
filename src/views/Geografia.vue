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
    label: 'Geografía',
    badgeCls: 'geo',
    badgeLabel: 'Geografía',
    icon: 'fa-solid fa-earth-americas',
    placeholderMsg: 'Próximamente artículos sobre Geografía.'
  })
})
onUnmounted(() => { reveal.disconnect() })
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon"><i class="fa-solid fa-earth-americas"></i></div><span class="sl">Especialidad</span>
      <h1 class="st">Geografía</h1>
      <p class="sd">Análisis del territorio, geografía humana, física, regional y planificación geoespacial aplicada al contexto boliviano.</p>
    </div>
  </section>
  <section class="page-content">
    <div class="c">
      <div class="at-body">
        <p>La geografía es la ciencia del territorio. En LexGeoCat estudio el espacio geográfico boliviano desde múltiples perspectivas: análisis de paisaje, dinámicas de población, riesgos naturales, geografía urbana y rural, y ordenamiento del territorio con visión integral.</p>
        <h2>Líneas de trabajo</h2>
        <div class="feature-grid">
          <div class="feature-item reveal"><i class="fa-solid fa-mountain-city"></i><h3>Geografía física</h3><p>Relieve, clima, hidrografía, geomorfología y ecosistemas de Bolivia.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-people-group"></i><h3>Geografía humana</h3><p>Población, cultura, migraciones, actividades económicas y dinámicas sociales en el territorio.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-map-location-dot"></i><h3>Geografía regional</h3><p>Caracterización de regiones, cuencas, valles, altiplano y llanos de Bolivia.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-triangle-exclamation"></i><h3>Riesgos y vulnerabilidad</h3><p>Análisis de amenazas naturales, susceptibilidad y vulnerabilidad territorial.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-city"></i><h3>Geografía urbana</h3><p>Estructura urbana, crecimiento de ciudades, periurbano y dinámicas metropolitanas.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-seedling"></i><h3>Geografía rural</h3><p>Uso del suelo agrícola, comunidades rurales, tenencia de la tierra y desarrollo local.</p></div>
        </div>
      </div>
      <div class="sh center" style="margin-top:48px"><span class="sl">Blog</span><h2 class="st">Artículos recientes</h2></div>
      <div class="g g3" id="topic-posts-grid"></div>
      <div class="blog-cta">
        <h3>¿Necesitas un estudio geográfico?</h3>
        <p>Análisis territorial, estudios de localización y caracterización regional para tu proyecto.</p>
        <router-link class="btn btn-gold" to="/"><i class="fa-solid fa-envelope"></i> Consultar</router-link>
      </div>
    </div>
  </section>
</template>
