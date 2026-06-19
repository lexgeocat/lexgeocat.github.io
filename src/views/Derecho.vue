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
    label: 'Derecho',
    badgeCls: 'law',
    badgeLabel: 'Derecho',
    icon: 'fa-solid fa-scale-balanced',
    placeholderMsg: 'Próximamente artículos sobre Derecho.'
  })
})
onUnmounted(() => { reveal.disconnect() })
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon"><i class="fa-solid fa-scale-balanced"></i></div>
      <span class="sl">Especialidad</span>
      <h1 class="st">Derecho</h1>
      <p class="sd">Legislación boliviana, derecho civil, usucapión y normativa territorial.</p>
    </div>
  </section>
  <section class="page-content">
    <div class="c">
      <div class="at-body">
        <p>El derecho constituye la base normativa de toda gestión territorial. En LexGeoCat abordamos la legislación boliviana aplicada al territorio: derecho civil, registral, notarial y procedimientos vinculados al saneamiento predial.</p>
        <h2>Áreas de enfoque</h2>
        <div class="feature-grid">
          <div class="feature-item reveal"><i class="fa-solid fa-scale-balanced"></i><h3>Derecho civil y procesal</h3><p>Consultoría y recursos en el contexto boliviano.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-scale-balanced"></i><h3>Usucapión y derecho registral</h3><p>Trámites y normativa aplicable.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-scale-balanced"></i><h3>Normativa catastral</h3><p>Marco legal del catastro en Bolivia.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-scale-balanced"></i><h3>Trámites notariales</h3><p>Asesoría en documentación predial.</p></div>
        </div>
      </div>
      <div class="sh center" style="margin-top:48px"><span class="sl">Blog</span><h2 class="st">Artículos recientes</h2></div>
      <div class="g g3" id="topic-posts-grid"></div>
      <div class="blog-cta">
        <h3>¿Quieres profundizar en Derecho?</h3>
        <p>Visita el blog para tutoriales y análisis normativos.</p>
        <a class="btn btn-gold" href="https://lexgeocat.blogspot.com/search/label/Derecho"><i class="fa-solid fa-newspaper"></i> Ver más en el blog</a>
      </div>
    </div>
  </section>
</template>
