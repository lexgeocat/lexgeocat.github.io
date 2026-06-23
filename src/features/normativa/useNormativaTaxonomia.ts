import { computed, ref } from 'vue'
import { fetchNormativaGrupos, fetchNormativaTipos } from '../../lib/queries'
import type { NormativaGrupo, NormativaTipo } from '../../types/supabase'

export function useNormativaTaxonomia() {
  const grupos = ref<NormativaGrupo[]>([])
  const tipos = ref<NormativaTipo[]>([])
  const loading = ref(true)
  const error = ref('')

  // tipos agrupados por grupo_id, en el orden de normativa_grupos.orden
  const tiposPorGrupo = computed(() => {
    const map: Record<string, NormativaTipo[]> = {}
    for (const t of tipos.value) {
      if (!map[t.grupo_id]) map[t.grupo_id] = []
      map[t.grupo_id]!.push(t)
    }
    return map
  })

  // ── Índices O(1) en lugar de Array.find en cada card ──────────────────────
  const tiposById = computed<Map<string, NormativaTipo>>(() => {
    const m = new Map<string, NormativaTipo>()
    for (const t of tipos.value) m.set(t.id, t)
    return m
  })

  const gruposById = computed<Map<string, NormativaGrupo>>(() => {
    const m = new Map<string, NormativaGrupo>()
    for (const g of grupos.value) m.set(g.id, g)
    return m
  })

  /** Resuelve el grupo al que pertenece un tipo en O(1). */
  function grupoDeTipo(tipoId: string): NormativaGrupo | null {
    const tipo = tiposById.value.get(tipoId)
    if (!tipo) return null
    return gruposById.value.get(tipo.grupo_id) ?? null
  }

  /** Nombre del tipo en O(1); cae al id si no existe. */
  function nombreTipo(tipoId: string): string {
    return tiposById.value.get(tipoId)?.nombre ?? tipoId
  }

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [g, t] = await Promise.all([fetchNormativaGrupos(), fetchNormativaTipos()])
      grupos.value = g
      tipos.value = t
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar la taxonomía'
    } finally {
      loading.value = false
    }
  }

  return {
    grupos,
    tipos,
    tiposPorGrupo,
    tiposById,
    gruposById,
    loading,
    error,
    nombreTipo,
    grupoDeTipo,
    load,
  }
}
