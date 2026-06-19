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
    label: 'Recursos',
    badgeCls: 'white',
    badgeLabel: 'Recurso',
    icon: 'fa-solid fa-folder-open',
    placeholderMsg: 'Próximamente más recursos.',
    limit: 10
  })
})
onUnmounted(() => { reveal.disconnect() })
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon"><i class="fa-solid fa-folder-open"></i></div>
      <span class="sl">Biblioteca</span>
      <h1 class="st">Recursos y Herramientas</h1>
      <p class="sd">Plantillas, formatos legales, guías técnicas y materiales de apoyo para profesionales del territorio.</p>
    </div>
  </section>
  <section class="page-content">
    <div class="c">
      <div class="g g-auto" style="margin-bottom:48px">
        <div class="res-card reveal">
          <div class="res-icon" style="background:var(--gold-lt);color:var(--gold)"><i class="fa-solid fa-file-pdf"></i></div>
          <div class="res-body">
            <h4>Formatos legales</h4>
            <p>Modelos de escritos, solicitudes y documentos de apoyo para trámites territoriales.</p>
            <span class="res-tag" style="background:var(--gold-lt);color:var(--gold);border-color:var(--color-esp-derecho-2)">Derecho</span>
          </div>
        </div>
        <div class="res-card reveal">
          <div class="res-icon" style="background:var(--teal-lt);color:var(--teal)"><i class="fa-solid fa-map"></i></div>
          <div class="res-body">
            <h4>Guías catastrales</h4>
            <p>Manuales técnicos para levantamientos, fichas prediales y nomenclatura catastral.</p>
            <span class="res-tag" style="background:var(--teal-lt);color:var(--teal);border-color:var(--color-esp-catastro-2)">Catastro</span>
          </div>
        </div>
        <div class="res-card reveal">
          <div class="res-icon" style="background:var(--sapphire-lt);color:var(--color-esp-geomatica)"><i class="fa-solid fa-layer-group"></i></div>
          <div class="res-body">
            <h4>Tutoriales SIG</h4>
            <p>Material de QGIS, PostGIS y cartografía digital orientado al contexto boliviano.</p>
            <span class="res-tag" style="background:var(--sapphire-lt);color:var(--color-esp-geomatica);border-color:var(--color-esp-geomatica-2)">GIS</span>
          </div>
        </div>
        <div class="res-card reveal">
          <div class="res-icon" style="background:var(--sapphire-lt);color:var(--color-esp-software)"><i class="fa-solid fa-code"></i></div>
          <div class="res-body">
            <h4>Scripts y automatización</h4>
            <p>Herramientas Python, AutoLISP y plantillas para agilizar flujos de trabajo GIS.</p>
            <span class="res-tag" style="background:var(--sapphire-lt);color:var(--color-esp-software);border-color:var(--color-esp-software)">Tecnología</span>
          </div>
        </div>
      </div>
      <div class="sh center"><span class="sl">Blog</span><h2 class="st">Recursos publicados</h2><p class="sd">Entradas del blog con etiqueta Recursos (alojadas en Blogger).</p></div>
      <div class="g g-auto" id="recursos-grid"></div>
      <div class="blog-cta">
        <h3>¿Buscas más material?</h3>
        <p>Explora la biblioteca completa de recursos en el blog de LexGeoCat.</p>
        <a class="btn btn-gold" href="https://lexgeocat.blogspot.com/search/label/Recursos"><i class="fa-solid fa-folder-open"></i> Ver todos en el blog</a>
      </div>
    </div>
  </section>
</template>
