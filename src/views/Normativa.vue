<script setup lang="ts">
import { computed, onMounted, onUnmounted, nextTick, ref, watch } from 'vue'
import { useReveal } from '../shared/composables/useReveal'
import {
  ESTADO_LABELS,
  formatDate,
  useNormativa,
} from '../features/normativa/useNormativa'
import { useNormativaTaxonomia } from '../features/normativa/useNormativaTaxonomia'
import { resolveNormativaImageUrl } from '../lib/normativaImage'
import type { Normativa } from '../types/supabase'

// ── Servicios ─────────────────────────────────────────────────────────────────
const reveal = useReveal()
const taxonomia = useNormativaTaxonomia()

// Solo usamos allNormas + carga; toda la lógica de filtro vive aquí
const { allNormas, loading, error, load } = useNormativa()

// ── Estado de filtros (única fuente de verdad) ────────────────────────────────
const PAGE_SIZE = 12
const searchQuery  = ref('')
const filterGrupoId = ref('')
const filterTipoId  = ref('')
const filterEstado  = ref('')
const currentPage   = ref(1)

// ── Modal de descarga ─────────────────────────────────────────────────────────
const downloadItem = ref<Normativa | null>(null)

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Elimina acentos y pone en minúsculas para comparación */
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// ── Derivados de taxonomía ────────────────────────────────────────────────────
const tiposParaFiltro = computed(() => {
  if (!filterGrupoId.value) return taxonomia.tipos.value
  return taxonomia.tiposPorGrupo.value[filterGrupoId.value] ?? []
})

/**
 * Conjunto de tipo_ids que pertenecen al grupo seleccionado.
 * null  → no hay grupo seleccionado (no filtrar por grupo)
 * Set   → filtrar; si está vacío y la taxonomía ya cargó, el grupo no tiene tipos
 */
const grupoTipoIds = computed<Set<string> | null>(() => {
  if (!filterGrupoId.value) return null
  const list = taxonomia.tiposPorGrupo.value[filterGrupoId.value]
  return new Set((list ?? []).map((t) => t.id))
})

// ── Filtrado unificado ────────────────────────────────────────────────────────
const filteredAll = computed(() => {
  const q       = normalize(searchQuery.value.trim())
  const grupoIds = grupoTipoIds.value

  return allNormas.value.filter((n) => {
    // Filtro de grupo: excluye si el tipo de la norma no pertenece al grupo
    if (grupoIds !== null && (!n.tipo_id || !grupoIds.has(n.tipo_id))) return false
    // Filtro de tipo
    if (filterTipoId.value && n.tipo_id !== filterTipoId.value) return false
    // Filtro de estado
    if (filterEstado.value && n.estado !== filterEstado.value) return false
    // Búsqueda libre (sin acentos)
    if (q) {
      const fields = [n.titulo, n.numero_norma, n.resumen, ...(n.palabras_clave ?? [])]
      if (!fields.some((f) => f && normalize(f).includes(q))) return false
    }
    return true
  })
})

// ── Paginación ────────────────────────────────────────────────────────────────
const totalPagesView = computed(() =>
  Math.max(1, Math.ceil(filteredAll.value.length / PAGE_SIZE)),
)

const pagedView = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredAll.value.slice(start, start + PAGE_SIZE)
})

/**
 * Lista de páginas visible con ellipsis: 1 … 4 5 6 … 20
 * Siempre muestra primera, última, y ±1 alrededor de la actual.
 */
const visiblePages = computed<(number | '...')[]>(() => {
  const total = totalPagesView.value
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]
  if (cur > 3) pages.push('...')
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
    pages.push(p)
  }
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

// ── Watchers reactivos (sustituyen @change handlers) ─────────────────────────
// Resetea página al cambiar cualquier filtro
watch([searchQuery, filterGrupoId, filterTipoId, filterEstado], () => {
  currentPage.value = 1
})
// Al cambiar grupo, limpia el tipo seleccionado
watch(filterGrupoId, () => {
  filterTipoId.value = ''
})
// Re-registra el IntersectionObserver cada vez que cambian las cards visibles
// (filtrado o cambio de página). Sin esto las cards nuevas quedan con opacity:0.
watch(pagedView, async () => {
  await nextTick()
  reveal.disconnect()
  reveal.observe()
})
// Bloquea scroll del body mientras el modal está abierto
watch(downloadItem, (v) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = v ? 'hidden' : ''
})

// ── Acciones ──────────────────────────────────────────────────────────────────
const hasActiveFilters = computed(
  () => !!(searchQuery.value || filterGrupoId.value || filterTipoId.value || filterEstado.value),
)

function clearFilters() {
  searchQuery.value  = ''
  filterGrupoId.value = ''
  filterTipoId.value  = ''
  filterEstado.value  = ''
}

function goPage(n: number) {
  if (n < 1 || n > totalPagesView.value) return
  currentPage.value = n
  window.scrollTo({ top: 400, behavior: 'smooth' })
}

// ── Modal de descarga ─────────────────────────────────────────────────────────
function openDownloadModal(n: Normativa) {
  downloadItem.value = n
}

function closeDownloadModal() {
  downloadItem.value = null
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && downloadItem.value) closeDownloadModal()
}

// ── Ciclo de vida ─────────────────────────────────────────────────────────────
onMounted(async () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reveal.observe()
    })
  })
  window.addEventListener('keydown', onKeydown)
  await Promise.all([load(), taxonomia.load()])
  await nextTick()
  reveal.disconnect()
  reveal.observe()
})

onUnmounted(() => {
  reveal.disconnect()
  window.removeEventListener('keydown', onKeydown)
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
            >
            <button
              v-if="searchQuery"
              type="button"
              class="norm-search-clear"
              aria-label="Limpiar búsqueda"
              @click="searchQuery = ''"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-xmark"
              />
            </button>
          </div>
          <select
            v-model="filterGrupoId"
            class="norm-select"
          >
            <option value="">
              Todos los grupos
            </option>
            <option
              v-for="g in taxonomia.grupos.value"
              :key="g.id"
              :value="g.id"
            >
              {{ g.numeral }}. {{ g.nombre }}
            </option>
          </select>
          <select
            v-model="filterTipoId"
            class="norm-select"
          >
            <option value="">
              {{ filterGrupoId ? 'Todos los tipos del grupo' : 'Todos los tipos' }}
            </option>
            <option
              v-for="t in tiposParaFiltro"
              :key="t.id"
              :value="t.id"
            >
              {{ t.numero }}. {{ t.nombre }}
            </option>
          </select>
          <select
            v-model="filterEstado"
            class="norm-select"
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
          <button
            v-if="hasActiveFilters"
            type="button"
            class="norm-clear-btn"
            @click="clearFilters"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-filter-circle-xmark"
            />
            Limpiar
          </button>
        </div>
        <div class="norm-toolbar-right">
          <span class="norm-count">
            {{ filteredAll.length }}
            {{ filteredAll.length === 1 ? 'documento' : 'documentos' }}
          </span>
        </div>
      </div>

      <!-- Estado: cargando -->
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

      <!-- Estado: error -->
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

      <!-- Estado: sin resultados -->
      <div
        v-else-if="!filteredAll.length"
        class="norm-empty"
      >
        <i
          aria-hidden="true"
          class="fa-solid fa-scroll"
        />
        <p>No se encontraron documentos con los filtros actuales.</p>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="norm-clear-btn"
          @click="clearFilters"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-filter-circle-xmark"
          />
          Limpiar filtros
        </button>
      </div>

      <!-- Grid de resultados -->
      <div
        v-else
        class="norm-grid"
      >
        <div
          v-for="n in pagedView"
          :key="n.id"
          class="norm-card reveal"
        >
          <div
            class="norm-card-cover"
            role="button"
            tabindex="0"
            :aria-label="`Descargar ${n.titulo}`"
            @click="openDownloadModal(n)"
            @keydown.enter.prevent="openDownloadModal(n)"
            @keydown.space.prevent="openDownloadModal(n)"
          >
            <img
              v-if="resolveNormativaImageUrl(n.imagen_url)"
              :src="resolveNormativaImageUrl(n.imagen_url)!"
              :alt="`Portada de ${n.titulo}`"
              loading="lazy"
              class="norm-card-img"
            >
            <div
              v-else
              class="norm-card-cover-fallback"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-file-lines"
              />
              <span class="norm-card-cover-fallback-title">{{ n.titulo }}</span>
            </div>
            <div class="norm-card-cover-tags">
              <span
                v-if="taxonomia.grupoDeTipo(n.tipo_id)"
                class="norm-card-cover-numeral"
              >{{ taxonomia.grupoDeTipo(n.tipo_id)?.numeral }}</span>
              <span class="norm-card-cover-tag">{{ taxonomia.nombreTipo(n.tipo_id) }}</span>
            </div>
            <div class="norm-card-cover-overlay">
              <i
                aria-hidden="true"
                class="fa-solid fa-download"
              />
              <span>Descargar</span>
            </div>
          </div>
          <div class="norm-card-body">
            <h3 class="norm-card-title">
              {{ n.titulo }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Paginación con ellipsis -->
      <div
        v-if="totalPagesView > 1"
        class="norm-pagination"
      >
        <button
          class="page-btn"
          :disabled="currentPage <= 1"
          @click="goPage(currentPage - 1)"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-chevron-left"
          />
        </button>

        <template
          v-for="(p, idx) in visiblePages"
          :key="idx"
        >
          <span
            v-if="p === '...'"
            class="page-ellipsis"
          >…</span>
          <button
            v-else
            :class="['page-btn', { active: p === currentPage }]"
            @click="goPage(p as number)"
          >
            {{ p }}
          </button>
        </template>

        <button
          class="page-btn"
          :disabled="currentPage >= totalPagesView"
          @click="goPage(currentPage + 1)"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-chevron-right"
          />
        </button>
      </div>
    </div>
  </section>

  <!-- Modal de descarga -->
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="downloadItem"
        class="norm-modal-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="`Detalles de ${downloadItem.titulo}`"
        @click.self="closeDownloadModal"
      >
        <div class="norm-modal">
          <button
            type="button"
            class="norm-modal-close"
            aria-label="Cerrar"
            @click="closeDownloadModal"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-xmark"
            />
          </button>

          <div class="norm-modal-grid">
            <div class="norm-modal-cover">
              <img
                v-if="resolveNormativaImageUrl(downloadItem.imagen_url)"
                :src="resolveNormativaImageUrl(downloadItem.imagen_url)!"
                :alt="`Portada de ${downloadItem.titulo}`"
                class="norm-modal-img"
              >
              <div
                v-else
                class="norm-modal-cover-fallback"
              >
                <i
                  aria-hidden="true"
                  class="fa-solid fa-file-lines"
                />
              </div>
            </div>

            <div class="norm-modal-body">
              <div class="norm-modal-tags">
                <span
                  v-if="taxonomia.grupoDeTipo(downloadItem.tipo_id)"
                  class="norm-modal-tag-numeral"
                >{{ taxonomia.grupoDeTipo(downloadItem.tipo_id)?.numeral }}</span>
                <span class="norm-modal-tag">{{ taxonomia.nombreTipo(downloadItem.tipo_id) }}</span>
                <span :class="'norm-badge-estado norm-badge-estado--' + downloadItem.estado">
                  {{ ESTADO_LABELS[downloadItem.estado] || downloadItem.estado }}
                </span>
              </div>

              <h2 class="norm-modal-title">
                {{ downloadItem.titulo }}
              </h2>

              <dl class="norm-modal-meta">
                <div
                  v-if="downloadItem.numero_norma"
                  class="norm-modal-meta-row"
                >
                  <dt>Número</dt>
                  <dd>{{ downloadItem.numero_norma }}</dd>
                </div>
                <div
                  v-if="downloadItem.fecha_promulgacion"
                  class="norm-modal-meta-row"
                >
                  <dt>Fecha de promulgación</dt>
                  <dd>{{ formatDate(downloadItem.fecha_promulgacion) }}</dd>
                </div>
                <div
                  v-if="downloadItem.fecha_publicacion"
                  class="norm-modal-meta-row"
                >
                  <dt>Fecha de publicación</dt>
                  <dd>{{ formatDate(downloadItem.fecha_publicacion) }}</dd>
                </div>
                <div class="norm-modal-meta-row">
                  <dt>Estado</dt>
                  <dd>{{ ESTADO_LABELS[downloadItem.estado] || downloadItem.estado }}</dd>
                </div>
                <div
                  v-if="downloadItem.palabras_clave?.length"
                  class="norm-modal-meta-row"
                >
                  <dt>Palabras clave</dt>
                  <dd>{{ downloadItem.palabras_clave.join(', ') }}</dd>
                </div>
              </dl>

              <p
                v-if="downloadItem.resumen"
                class="norm-modal-desc"
              >
                {{ downloadItem.resumen }}
              </p>

              <div class="norm-modal-actions">
                <a
                  v-if="downloadItem.archivo_url"
                  :href="downloadItem.archivo_url"
                  :download="downloadItem.archivo_nombre || true"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-primary"
                >
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-download"
                  /> Descargar documento
                </a>
                <span
                  v-else
                  class="norm-no-pdf"
                >Documento no disponible para descarga</span>
                <button
                  type="button"
                  class="btn btn-ghost"
                  @click="closeDownloadModal"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
/* ── Botón ✕ dentro del input de búsqueda ──────────────────────────────────── */
.norm-search-wrap {
  position: relative; /* ancla el botón clear */
}
.norm-search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 4px 6px;
  color: var(--text3);
  font-size: 0.78rem;
  cursor: pointer;
  line-height: 1;
  transition: color 0.18s;
}
.norm-search-clear:hover {
  color: var(--text);
}

/* ── Botón "Limpiar (filtros)" ─────────────────────────────────────────────── */
.norm-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text2);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.18s, border-color 0.18s, background 0.18s;
}
.norm-clear-btn:hover {
  color: var(--copper);
  border-color: var(--copper);
  background: color-mix(in srgb, var(--copper) 8%, transparent);
}

/* ── Ellipsis de paginación ────────────────────────────────────────────────── */
.page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  color: var(--text3);
  font-size: 0.9rem;
  user-select: none;
  pointer-events: none;
}

/* ── Transición del modal ──────────────────────────────────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;

  .norm-modal {
    transition: transform 0.22s ease, opacity 0.22s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .norm-modal {
    transform: translateY(12px) scale(0.98);
    opacity: 0;
  }
}
</style>