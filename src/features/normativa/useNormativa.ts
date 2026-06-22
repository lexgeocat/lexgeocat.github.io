import { computed, ref } from 'vue'
import { fetchNormativaActiva } from '../../lib/queries'
import type { Normativa } from '../../types/supabase'

export const ESTADO_LABELS: Record<string, string> = {
  vigente: 'Vigente',
  derogada: 'Derogada',
  modificada: 'Modificada',
}

export function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Normaliza acentos y mayúsculas para búsqueda insensible a diacríticos */
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function useNormativa(pageSize = 12) {
  const allNormas = ref<Normativa[]>([])
  const loading = ref(true)
  const error = ref('')

  const searchQuery = ref('')
  const filterGrupoId = ref('')
  const filterTipoId = ref('')
  const filterEstado = ref('')
  const currentPage = ref(1)

  const filtered = computed(() => {
    const q = normalize(searchQuery.value.trim())
    return allNormas.value.filter((n) => {
      if (filterTipoId.value && n.tipo_id !== filterTipoId.value) return false
      if (filterEstado.value && n.estado !== filterEstado.value) return false
      if (q) {
        const hay =
          normalize(n.titulo || '').includes(q) ||
          normalize(n.numero_norma || '').includes(q) ||
          normalize((n.palabras_clave || []).join(' ')).includes(q) ||
          normalize(n.resumen || '').includes(q)
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

  function goPage(n: number) {
    currentPage.value = n
  }

  function onSearch() {
    currentPage.value = 1
  }

  function onGrupoChange() {
    filterTipoId.value = ''
    currentPage.value = 1
  }

  function onTipoChange() {
    currentPage.value = 1
  }

  async function load() {
    loading.value = true
    error.value = ''
    try {
      allNormas.value = await fetchNormativaActiva()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar la normativa'
    } finally {
      loading.value = false
    }
  }

  return {
    allNormas,
    loading,
    error,
    searchQuery,
    filterGrupoId,
    filterTipoId,
    filterEstado,
    currentPage,
    filtered,
    totalPages,
    paged,
    goPage,
    onSearch,
    onGrupoChange,
    onTipoChange,
    load,
  }
}