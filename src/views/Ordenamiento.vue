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
    label: 'Ordenamiento Territorial',
    badgeCls: 'orden',
    badgeLabel: 'Ordenamiento',
    icon: 'fa-solid fa-compass-drafting',
    placeholderMsg: 'Próximamente artículos sobre Ordenamiento Territorial.'
  })
})
onUnmounted(() => { reveal.disconnect() })
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon"><i class="fa-solid fa-compass-drafting"></i></div><span class="sl">Especialidad</span>
      <h1 class="st">Ordenamiento Territorial</h1>
      <p class="sd">Planificación urbana, zonificación, uso de suelo y gestión territorial a nivel municipal.</p>
    </div>
  </section>
  <section class="page-content">
    <div class="c">
      <div class="at-body">
        <p>El ordenamiento territorial orienta el uso del suelo y la expansión urbana conforme a la normativa boliviana y los instrumentos de planificación municipal.</p>
        <h2>Temas clave</h2>
        <div class="feature-grid">
          <div class="feature-item reveal"><i class="fa-solid fa-compass-drafting"></i><h3>Planificación urbana</h3><p>Instrumentos y metodología.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-compass-drafting"></i><h3>Zonificación</h3><p>Usos de suelo y normativa.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-compass-drafting"></i><h3>Gestión municipal</h3><p>Políticas territoriales locales.</p></div>
          <div class="feature-item reveal"><i class="fa-solid fa-compass-drafting"></i><h3>Instrumentos de planificación</h3><p>Planes y programas territoriales.</p></div>
        </div>
      </div>
      <div class="sh center" style="margin-top:48px"><span class="sl">Blog</span><h2 class="st">Artículos recientes</h2></div>
      <div class="g g3" id="topic-posts-grid"></div>
      <div class="blog-cta">
        <h3>¿Quieres profundizar en Ordenamiento?</h3>
        <a class="btn btn-gold" href="https://lexgeocat.blogspot.com/search/label/Ordenamiento%20Territorial"><i class="fa-solid fa-newspaper"></i> Ver más en el blog</a>
      </div>
    </div>
  </section>
</template>
