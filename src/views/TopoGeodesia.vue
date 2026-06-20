<script setup lang="ts">
import TopicPage from '../shared/components/TopicPage.vue'
import { getTopic } from '../content/topics'
const topic = getTopic('topogeodesia')!
</script>

<template>
  <TopicPage :topic="topic">
    <template #intro>
      <p>
        La topografía y la geodesia son la base técnica de toda obra civil, catastral y de
        ordenamiento territorial. En LexGeoCat integro ambas disciplinas para entregar mediciones
        confiables, planos precisos y georeferenciación alineada con los estándares del IGM Bolivia
        y SIRGAS.
      </p>
    </template>
    <template #features-heading>
      <h2>Topografía</h2>
    </template>
    <template #after-features>
      <h2>Geodesia</h2>
      <div class="feature-grid">
        <div class="feature-item reveal">
          <i
            aria-hidden="true"
            class="fa-solid fa-satellite"
          />
          <h3>Posicionamiento GNSS</h3>
          <p>GPS, GLONASS, Galileo y BeiDou con precisión centimétrica (estático, RTK, PPK).</p>
        </div>
        <div class="feature-item reveal">
          <i
            aria-hidden="true"
            class="fa-solid fa-globe"
          />
          <h3>Sistemas de referencia</h3>
          <p>WGS84, SIRGAS, PSAD56 y datum oficiales del Estado Plurinacional de Bolivia.</p>
        </div>
        <div class="feature-item reveal">
          <i
            aria-hidden="true"
            class="fa-solid fa-diagram-project"
          />
          <h3>Redes geodésicas</h3>
          <p>Diseño, monumentación, observación y ajuste de puntos de control.</p>
        </div>
        <div class="feature-item reveal">
          <i
            aria-hidden="true"
            class="fa-solid fa-mountain"
          />
          <h3>Modelos geoidales</h3>
          <p>Altitudes ortométricas con EGM96, EGM2008 y modelos locales.</p>
        </div>
      </div>
      <h2>Equipos y software</h2>
      <p>
        Estación total, GNSS de doble frecuencia, drone y software
        <strong>AutoCAD Civil 3D</strong>, <strong>CivilCAD</strong>, <strong>QGIS</strong> y
        <strong>PostGIS</strong>.
      </p>
    </template>
  </TopicPage>
</template>
