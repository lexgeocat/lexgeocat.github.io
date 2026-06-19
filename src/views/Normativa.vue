<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useReveal } from '../composables/useReveal'

const SUPABASE_URL = 'https://uhpgvwljcuovlwywlxat.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocGd2d2xqY3Vvdmx3eXdseGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjAwMDgsImV4cCI6MjA5NzI5NjAwOH0.IvjGKtd3wE2HK2VViYjvAn_6fqn_PVA6zwjMQjilvMk'

const CATEGORIA_LABELS: Record<string, string> = {
  leyes: 'Leyes',
  codigos: 'Códigos',
  decretos_reglamentarios: 'Decretos Reglamentarios',
  jurisprudencia: 'Jurisprudencia',
  doctrina: 'Doctrina',
}
const CATEGORIA_ICONS: Record<string, string> = {
  leyes: 'fa-gavel',
  codigos: 'fa-book',
  decretos_reglamentarios: 'fa-stamp',
  jurisprudencia: 'fa-scale-balanced',
  doctrina: 'fa-feather-pointed',
}
const ESTADO_LABELS: Record<string, string> = {
  vigente: 'Vigente',
  derogada: 'Derogada',
  modificada: 'Modificada',
}

interface Norma {
  id: string
  titulo: string
  categoria: string
  numero_norma: string | null
  fecha_promulgacion: string | null
  fecha_publicacion: string | null
  estado: string
  activo: boolean
  resumen: string | null
  palabras_clave: string[]
  archivo_url: string | null
  archivo_nombre: string | null
}

const allNormas = ref<Norma[]>([])
const loading = ref(true)
const error = ref('')

const searchQuery = ref('')
const filterCategoria = ref('')
const filterEstado = ref('')
const currentPage = ref(1)
const pageSize = 12

const filtered = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return allNormas.value.filter(n => {
    if (filterCategoria.value && n.categoria !== filterCategoria.value) return false
    if (filterEstado.value && n.estado !== filterEstado.value) return false
    if (q) {
      const hay =
        (n.titulo || '').toLowerCase().includes(q) ||
        (n.numero_norma || '').toLowerCase().includes(q) ||
        (n.palabras_clave || []).join(' ').toLowerCase().includes(q) ||
        (n.resumen || '').toLowerCase().includes(q)
      if (!hay) return false
    }
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const paged = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function goPage(n: number) { currentPage.value = n; window.scrollTo({ top: 400, behavior: 'smooth' }) }
function onSearch() { currentPage.value = 1 }

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const reveal = useReveal()

onMounted(async () => {
  requestAnimationFrame(() => { requestAnimationFrame(() => { reveal.observe() }) })
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/normativa?select=*&activo=eq.true&order=fecha_publicacion.desc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    allNormas.value = await res.json()
  } catch (e: any) {
    error.value = e.message || 'Error al cargar la normativa'
  } finally {
    loading.value = false
    await nextTick()
    reveal.disconnect()
    reveal.observe()
  }
})

onUnmounted(() => { reveal.disconnect() })
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon"><i class="fa-solid fa-scroll"></i></div>
      <span class="sl">Biblioteca Jurídica</span>
      <h1 class="st">Normativa legal</h1>
      <p class="sd">Leyes, códigos, decretos reglamentarios, jurisprudencia y doctrina del ordenamiento jurídico boliviano en materia territorial, catastral y de derechos reales.</p>
    </div>
  </section>

  <section class="page-content">
    <div class="c">
      <div class="norm-toolbar reveal">
        <div class="norm-toolbar-left">
          <div class="norm-search-wrap">
            <i class="fa-solid fa-search norm-search-icon"></i>
            <input v-model="searchQuery" @input="onSearch" type="text" class="norm-search" placeholder="Buscar por título, número o palabras clave..." />
          </div>
          <select v-model="filterCategoria" @change="onSearch" class="norm-select">
            <option value="">Todas las categorías</option>
            <option v-for="(lb, v) in CATEGORIA_LABELS" :key="v" :value="v">{{ lb }}</option>
          </select>
          <select v-model="filterEstado" @change="onSearch" class="norm-select">
            <option value="">Todos los estados</option>
            <option v-for="(lb, v) in ESTADO_LABELS" :key="v" :value="v">{{ lb }}</option>
          </select>
        </div>
        <div class="norm-toolbar-right">
          <span class="norm-count">{{ filtered.length }} {{ filtered.length === 1 ? 'documento' : 'documentos' }}</span>
        </div>
      </div>

      <div v-if="loading" class="norm-empty">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Cargando normativa…</p>
      </div>

      <div v-else-if="error" class="norm-empty">
        <i class="fa-solid fa-triangle-exclamation" style="color:var(--copper)"></i>
        <p>Error: {{ error }}</p>
      </div>

      <div v-else-if="!filtered.length" class="norm-empty">
        <i class="fa-solid fa-scroll"></i>
        <p>No se encontraron documentos con los filtros actuales.</p>
      </div>

      <div v-else class="norm-grid">
        <div v-for="n in paged" :key="n.id" class="norm-card reveal">
          <div class="norm-card-icon"><i :class="'fa-solid ' + (CATEGORIA_ICONS[n.categoria] || 'fa-file')"></i></div>
          <div class="norm-card-body">
            <h3 class="norm-card-title">{{ n.titulo }}</h3>
            <div class="norm-card-meta">
              <span class="norm-badge-cat">{{ CATEGORIA_LABELS[n.categoria] || n.categoria }}</span>
              <span :class="'norm-badge-estado norm-badge-estado--' + n.estado">{{ ESTADO_LABELS[n.estado] || n.estado }}</span>
              <span v-if="n.numero_norma" class="norm-card-num">{{ n.numero_norma }}</span>
              <span class="norm-card-date">{{ formatDate(n.fecha_publicacion) }}</span>
            </div>
            <p v-if="n.resumen" class="norm-card-desc">{{ n.resumen }}</p>
          </div>
          <div class="norm-card-actions">
            <a v-if="n.archivo_url" :href="n.archivo_url" target="_blank" rel="noopener" class="btn btn-sm btn-primary"><i class="fa-solid fa-file-pdf"></i> Ver PDF</a>
            <span v-else class="norm-no-pdf">Sin PDF</span>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="norm-pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @click="goPage(currentPage - 1)"><i class="fa-solid fa-chevron-left"></i></button>
        <button v-for="p in totalPages" :key="p" :class="['page-btn', { active: p === currentPage }]" @click="goPage(p)">{{ p }}</button>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="goPage(currentPage + 1)"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
    </div>
  </section>
</template>
