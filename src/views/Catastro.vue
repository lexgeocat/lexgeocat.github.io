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
    label: 'Catastro',
    badgeCls: 'cat',
    badgeLabel: 'Catastro',
    icon: 'fa-solid fa-map',
    placeholderMsg: 'Próximamente artículos sobre Catastro.'
  })
})
onUnmounted(() => { reveal.disconnect() })
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon"><i class="fa-solid fa-map"></i></div><span class="sl">Especialidad</span>
      <h1 class="st">Catastro Multifinalitario</h1>
      <p class="sd">Registro predial, valuación fiscal, nomenclatura catastral y sistemas de información territorial.</p>
    </div>
  </section>
  <section class="page-content">
    <div class="c">
      <div class="at-body">
        <p>El catastro multifinalitario urbano articula la información predial con la planificación territorial y la recaudación municipal en Bolivia.</p>
        <h2>Servicios técnicos</h2>
        <div class="feature-grid">
          <div class="feature-item reveal"><i class="fa-solid fa-map"></i><h3>Levantamientos topográficos</h3><p>Precision y normativa técnica.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-map"></i><h3>Planos y fichas catastrales</h3><p>Documentación predial oficial.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-map"></i><h3>Geocodificación</h3><p>Integración de datos territoriales.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-map"></i><h3>Actualización catastral</h3><p>Mantenimiento de bases de datos.</p></div>
        </div>
      </div>
      <div class="sh center" style="margin-top:48px"><span class="sl">Blog</span><h2 class="st">Artículos recientes</h2></div>
      <div class="g g3" id="topic-posts-grid"></div>
      <div class="blog-cta">
        <h3>¿Quieres profundizar en Catastro?</h3>
        <a class="btn btn-gold" href="https://lexgeocat.blogspot.com/search/label/Catastro"><i class="fa-solid fa-newspaper"></i> Ver más en el blog</a>
      </div>
    </div>
  </section>
</template>
