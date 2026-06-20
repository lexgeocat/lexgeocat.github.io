<script setup lang="ts">
import TopicPage from '../components/TopicPage.vue'
import { getTopic } from '../content/topics'
const topic = getTopic('recursos')!
</script>

<template>
  <TopicPage :topic="topic">
    <template #before-features>
      <div
        class="g g-auto"
        style="margin-bottom: 48px"
      >
        <div class="res-card reveal">
          <div
            class="res-icon"
            style="background: var(--copper-lt); color: var(--copper)"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-file-pdf"
            />
          </div>
          <div class="res-body">
            <h4>Formatos legales</h4>
            <p>
              Modelos de escritos, solicitudes y documentos de apoyo para trámites territoriales.
            </p>
            <span
              class="res-tag"
              style="
                background: var(--copper-lt);
                color: var(--copper);
                border-color: var(--color-esp-derecho-2);
              "
            >Derecho</span>
          </div>
        </div>
        <div class="res-card reveal">
          <div
            class="res-icon"
            style="background: var(--sapphire-lt); color: var(--sapphire)"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-map"
            />
          </div>
          <div class="res-body">
            <h4>Guías catastrales</h4>
            <p>Manuales técnicos para levantamientos, fichas prediales y nomenclatura catastral.</p>
            <span
              class="res-tag"
              style="
                background: var(--sapphire-lt);
                color: var(--sapphire);
                border-color: var(--color-esp-catastro-2);
              "
            >Catastro</span>
          </div>
        </div>
        <div class="res-card reveal">
          <div
            class="res-icon"
            style="background: var(--sapphire-lt); color: var(--color-esp-geomatica)"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-layer-group"
            />
          </div>
          <div class="res-body">
            <h4>Tutoriales SIG</h4>
            <p>Material de QGIS, PostGIS y cartografía digital orientado al contexto boliviano.</p>
            <span
              class="res-tag"
              style="
                background: var(--sapphire-lt);
                color: var(--color-esp-geomatica);
                border-color: var(--color-esp-geomatica-2);
              "
            >GIS</span>
          </div>
        </div>
        <div class="res-card reveal">
          <div
            class="res-icon"
            style="background: var(--sapphire-lt); color: var(--color-esp-software)"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-code"
            />
          </div>
          <div class="res-body">
            <h4>Scripts y automatización</h4>
            <p>Herramientas Python, AutoLISP y plantillas para agilizar flujos de trabajo GIS.</p>
            <span
              class="res-tag"
              style="
                background: var(--sapphire-lt);
                color: var(--color-esp-software);
                border-color: var(--color-esp-software);
              "
            >Tecnología</span>
          </div>
        </div>
      </div>
    </template>
  </TopicPage>
</template>
