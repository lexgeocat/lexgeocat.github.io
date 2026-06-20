import { computed, ref } from 'vue'
import { fetchNormativaActiva } from '../../lib/queries'
import type { Normativa } from '../../types/supabase'

export const CATEGORIA_LABELS: Record<string, string> = {
  leyes: 'Leyes',
  codigos: 'Códigos',
  decretos_reglamentarios: 'Decretos Reglamentarios',
  jurisprudencia: 'Jurisprudencia',
  doctrina: 'Doctrina',
}

export const CATEGORIA_ICONS: Record<string, string> = {
  leyes: 'fa-gavel',
  codigos: 'fa-book',
  decretos_reglamentarios: 'fa-stamp',
  jurisprudencia: 'fa-scale-balanced',
  doctrina: 'fa-feather-pointed',
}

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

export function useNormativa(pageSize = 12) {
  const allNormas = ref<Normativa[]>([])
  const loading = ref(true)
  const error = ref('')

  const searchQuery = ref('')
  const filterCategoria = ref('')
  const filterEstado = ref('')
  const currentPage = ref(1)

  const filtered = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    return allNormas.value.filter((n) => {
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

  function goPage(n: number) {
    currentPage.value = n
  }

  function onSearch() {
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
    filterCategoria,
    filterEstado,
    currentPage,
    filtered,
    totalPages,
    paged,
    goPage,
    onSearch,
    load,
  }
}
