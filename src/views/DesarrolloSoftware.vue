<script setup lang="ts">
import TopicPage from '../components/TopicPage.vue'
import { getTopic } from '../content/topics'
const topic = getTopic('desarrollo-software')!
</script>

<template>
  <TopicPage :topic="topic">
    <template #intro>
      <p>
        La transformación digital del territorio requiere software a medida. En LexGeoCat diseño y
        desarrollo aplicaciones web, plataformas SIG, visores de mapas, sistemas de catastro en
        línea y APIs geoespaciales adaptados a la realidad institucional y normativa boliviana.
      </p>
    </template>
    <template #after-features>
      <h2>Stack tecnológico</h2>
      <p>
        Trabajo con herramientas modernas y estándares abiertos:
        <strong>PostgreSQL/PostGIS</strong>, <strong>GeoServer</strong>, <strong>QGIS</strong>,
        <strong>Python</strong>, <strong>JavaScript</strong>, <strong>HTML/CSS</strong>,
        <strong>Leaflet</strong>, <strong>MapLibre GL</strong>, <strong>OpenLayers</strong> y
        <strong>Git</strong>.
      </p>
    </template>
  </TopicPage>
</template>
