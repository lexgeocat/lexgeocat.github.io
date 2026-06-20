<script setup lang="ts">
import TopicPage from '../shared/components/TopicPage.vue'
import { getTopic } from '../content/topics'
const topic = getTopic('geomatica')!
</script>

<template>
  <TopicPage :topic="topic">
    <template #intro>
      <p>
        La geomática integra la ciencia, la tecnología y la información para la gestión del
        territorio. En LexGeoCat desarrollo soluciones SIG con herramientas de código abierto (QGIS,
        PostGIS, GeoServer) y estándares internacionales (OGC, ISO 19100).
      </p>
    </template>
    <template #after-features>
      <h2>Stack de geomática</h2>
      <p>
        <strong>QGIS</strong>, <strong>PostgreSQL/PostGIS</strong>, <strong>GeoServer</strong>,
        <strong>MapServer</strong>, <strong>Leaflet</strong>, <strong>MapLibre</strong>,
        <strong>Python (GeoPandas, Rasterio, Fiona)</strong> y <strong>GDAL/OGR</strong>.
      </p>
    </template>
  </TopicPage>
</template>
