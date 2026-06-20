<script setup lang="ts">
import { onMounted, onUnmounted, nextTick } from 'vue'
import { useReveal } from '../shared/composables/useReveal'
import {
  CATEGORIA_ICONS,
  CATEGORIA_LABELS,
  ESTADO_LABELS,
  formatDate,
  useNormativa,
} from '../features/normativa/useNormativa'

const reveal = useReveal()
const {
  loading,
  error,
  searchQuery,
  filterCategoria,
  filterEstado,
  currentPage,
  filtered,
  totalPages,
  paged,
  goPage,
  onSearch,
  load,
} = useNormativa(12)

function goPageAndScroll(n: number) {
  goPage(n)
  window.scrollTo({ top: 400, behavior: 'smooth' })
}

onMounted(async () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reveal.observe()
    })
  })
  await load()
  await nextTick()
  reveal.disconnect()
  reveal.observe()
})

onUnmounted(() => {
  reveal.disconnect()
})
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon">
        <i
          aria-hidden="true"
          class="fa-solid fa-scroll"
        />
      </div>
      <span class="sl">Biblioteca Jurídica</span>
      <h1 class="st">
        Normativa legal
      </h1>
      <p class="sd">
        Leyes, códigos, decretos reglamentarios, jurisprudencia y doctrina del ordenamiento jurídico
        boliviano en materia territorial, catastral y de derechos reales.
      </p>
    </div>
  </section>

  <section class="page-content">
    <div class="c">
      <div class="norm-toolbar reveal">
        <div class="norm-toolbar-left">
          <div class="norm-search-wrap">
            <i
              aria-hidden="true"
              class="fa-solid fa-search norm-search-icon"
            />
            <input
              v-model="searchQuery"
              type="text"
              class="norm-search"
              placeholder="Buscar por título, número o palabras clave..."
              @input="onSearch"
            >
          </div>
          <select
            v-model="filterCategoria"
            class="norm-select"
            @change="onSearch"
          >
            <option value="">
              Todas las categorías
            </option>
            <option
              v-for="(lb, v) in CATEGORIA_LABELS"
              :key="v"
              :value="v"
            >
              {{ lb }}
            </option>
          </select>
          <select
            v-model="filterEstado"
            class="norm-select"
            @change="onSearch"
          >
            <option value="">
              Todos los estados
            </option>
            <option
              v-for="(lb, v) in ESTADO_LABELS"
              :key="v"
              :value="v"
            >
              {{ lb }}
            </option>
          </select>
        </div>
        <div class="norm-toolbar-right">
          <span class="norm-count">{{ filtered.length }} {{ filtered.length === 1 ? 'documento' : 'documentos' }}</span>
        </div>
      </div>

      <div
        v-if="loading"
        class="norm-empty"
      >
        <i
          aria-hidden="true"
          class="fa-solid fa-spinner fa-spin"
        />
        <p>Cargando normativa…</p>
      </div>

      <div
        v-else-if="error"
        class="norm-empty"
      >
        <i
          aria-hidden="true"
          class="fa-solid fa-triangle-exclamation"
          style="color: var(--copper)"
        />
        <p>Error: {{ error }}</p>
      </div>

      <div
        v-else-if="!filtered.length"
        class="norm-empty"
      >
        <i
          aria-hidden="true"
          class="fa-solid fa-scroll"
        />
        <p>No se encontraron documentos con los filtros actuales.</p>
      </div>

      <div
        v-else
        class="norm-grid"
      >
        <div
          v-for="n in paged"
          :key="n.id"
          class="norm-card reveal"
        >
          <div class="norm-card-icon">
            <i
              aria-hidden="true"
              :class="'fa-solid ' + (CATEGORIA_ICONS[n.categoria] || 'fa-file')"
            />
          </div>
          <div class="norm-card-body">
            <h3 class="norm-card-title">
              {{ n.titulo }}
            </h3>
            <div class="norm-card-meta">
              <span class="norm-badge-cat">{{ CATEGORIA_LABELS[n.categoria] || n.categoria }}</span>
              <span :class="'norm-badge-estado norm-badge-estado--' + n.estado">{{
                ESTADO_LABELS[n.estado] || n.estado
              }}</span>
              <span
                v-if="n.numero_norma"
                class="norm-card-num"
              >{{ n.numero_norma }}</span>
              <span class="norm-card-date">{{ formatDate(n.fecha_publicacion) }}</span>
            </div>
            <p
              v-if="n.resumen"
              class="norm-card-desc"
            >
              {{ n.resumen }}
            </p>
          </div>
          <div class="norm-card-actions">
            <a
              v-if="n.archivo_url"
              :href="n.archivo_url"
              target="_blank"
              rel="noopener"
              class="btn btn-sm btn-primary"
            ><i
              aria-hidden="true"
              class="fa-solid fa-file-pdf"
            /> Ver PDF</a>
            <span
              v-else
              class="norm-no-pdf"
            >Sin PDF</span>
          </div>
        </div>
      </div>

      <div
        v-if="totalPages > 1"
        class="norm-pagination"
      >
        <button
          class="page-btn"
          :disabled="currentPage <= 1"
          @click="goPageAndScroll(currentPage - 1)"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-chevron-left"
          />
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          :class="['page-btn', { active: p === currentPage }]"
          @click="goPageAndScroll(p)"
        >
          {{ p }}
        </button>
        <button
          class="page-btn"
          :disabled="currentPage >= totalPages"
          @click="goPageAndScroll(currentPage + 1)"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-chevron-right"
          />
        </button>
      </div>
    </div>
  </section>
</template>
