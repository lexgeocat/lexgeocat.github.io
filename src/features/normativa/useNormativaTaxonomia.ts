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

  function nombreTipo(tipoId: string): string {
    return tipos.value.find((t) => t.id === tipoId)?.nombre ?? tipoId
  }

  function grupoDeTipo(tipoId: string): NormativaGrupo | null {
    const tipo = tipos.value.find((t) => t.id === tipoId)
    if (!tipo) return null
    return grupos.value.find((g) => g.id === tipo.grupo_id) ?? null
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

  return { grupos, tipos, tiposPorGrupo, loading, error, nombreTipo, grupoDeTipo, load }
}
