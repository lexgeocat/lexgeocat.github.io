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
    label: 'Geomática',
    badgeCls: 'gis',
    badgeLabel: 'Geomática',
    icon: 'fa-solid fa-layer-group',
    placeholderMsg: 'Próximamente artículos sobre Geomática.'
  })
})
onUnmounted(() => { reveal.disconnect() })
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon"><i class="fa-solid fa-layer-group"></i></div>
      <span class="sl">Especialidad</span>
      <h1 class="st">Geomática</h1>
      <p class="sd">
        Sistemas de información geográfica, teledetección, cartografía digital,
        PostGIS/QGIS y análisis espacial avanzado en Bolivia.
      </p>
    </div>
  </section>
  <section class="page-content">
    <div class="c">
      <div class="at-body">
        <p>
          La geomática integra la ciencia, la tecnología y la información para
          la gestión del territorio. En LexGeoCat desarrollo soluciones SIG con
          herramientas de código abierto (QGIS, PostGIS, GeoServer) y estándares
          internacionales (OGC, ISO 19100), aplicables a catastro, ordenamiento
          territorial, medio ambiente y planificación urbana.
        </p>
        <h2>Servicios de geomática</h2>
        <div class="feature-grid">
          <div class="feature-item reveal">
            <i class="fa-solid fa-layer-group"></i>
            <h3>Cartografía digital</h3>
            <p>
              Mapas técnicos, temáticos y de planificación a partir de datos
              oficiales y de campo.
            </p>
          </div>
          <div class="feature-item reveal">
            <i class="fa-solid fa-database"></i>
            <h3>Bases de datos PostGIS</h3>
            <p>
              Modelado, despliegue y administración de bases de datos espaciales
              PostgreSQL/PostGIS.
            </p>
          </div>
          <div class="feature-item reveal">
            <i class="fa-solid fa-chart-area"></i>
            <h3>Análisis espacial</h3>
            <p>
              Geoprocesamiento, modelos predictivos, análisis de proximidad,
              densidad y conectividad.
            </p>
          </div>
          <div class="feature-item reveal">
            <i class="fa-solid fa-satellite-dish"></i>
            <h3>Teledetección</h3>
            <p>
              Procesamiento de imágenes satelitales (Sentinel, Landsat, Planet)
              y análisis multiespectral.
            </p>
          </div>
          <div class="feature-item reveal">
            <i class="fa-solid fa-map"></i>
            <h3>Servidores de mapas</h3>
            <p>
              Publicación de geoservicios OGC (WMS, WFS, WCS) con GeoServer y
              MapServer.
            </p>
          </div>
          <div class="feature-item reveal">
            <i class="fa-solid fa-drone"></i>
            <h3>Fotogrametría con drone</h3>
            <p>
              Ortomosaicos, modelos digitales de superficie y nubes de puntos
              con software open source.
            </p>
          </div>
        </div>
        <h2>Stack de geomática</h2>
        <p>
          <strong>QGIS</strong>, <strong>PostgreSQL/PostGIS</strong>,
          <strong>GeoServer</strong>, <strong>MapServer</strong>,
          <strong>Leaflet</strong>, <strong>MapLibre</strong>,
          <strong>OpenLayers</strong>,
          <strong>Python (GeoPandas, Rasterio, Fiona)</strong> y
          <strong>GDAL/OGR</strong>.
        </p>
      </div>
      <div class="sh center" style="margin-top: 48px">
        <span class="sl">Blog</span>
        <h2 class="st">Artículos recientes</h2>
      </div>
      <div class="g g3" id="topic-posts-grid"></div>
      <div class="blog-cta">
        <h3>¿Necesitas una solución SIG profesional?</h3>
        <p>
          Diseño e implementación de infraestructura geoespacial con estándares
          abiertos y soporte local.
        </p>
        <router-link class="btn btn-gold" to="/contacto"
          ><i class="fa-solid fa-envelope"></i> Consultar</router-link
        >
      </div>
    </div>
  </section>
</template>
