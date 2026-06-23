import { ref } from 'vue'
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
export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Solo carga el dataset completo de normativa activa.
 * El filtrado, búsqueda y paginación los gestiona la vista (Normativa.vue)
 * para evitar dos sistemas paralelos.
 */
export function useNormativa() {
  const allNormas = ref<Normativa[]>([])
  const loading = ref(true)
  const error = ref('')

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

  return { allNormas, loading, error, load }
}