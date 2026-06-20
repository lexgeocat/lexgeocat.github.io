<template>
  <div>
    <h1>Factores de Precio</h1>
    <p
      v-if="error"
      class="admin-error"
    >
      {{ error }}
    </p>
    <p
      v-if="loading"
      class="admin-loading"
    >
      Cargando…
    </p>
    <div
      v-else
      class="admin-card"
    >
      <table class="admin-table">
        <thead><tr><th>ID</th><th>Etiqueta</th><th>Descripción</th><th>Parámetros</th><th>Activo</th></tr></thead>
        <tbody>
          <tr
            v-for="f in factores"
            :key="f.id"
          >
            <td>{{ f.id }}</td>
            <td>{{ f.etiqueta }}</td>
            <td>{{ f.descripcion || '-' }}</td>
            <td>{{ Array.isArray(f.parametros) ? f.parametros.map((p: any) => p.label || p.key).join(', ') : '-' }}</td>
            <td>{{ f.activo ? 'Sí' : 'No' }}</td>
          </tr>
          <tr v-if="factores.length === 0">
            <td
              colspan="5"
              class="admin-empty"
            >
              Sin registros
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSupabase } from '../../lib/supabase/client'
import type { FactorParam } from '../../types/supabase'

interface FactorItem { id: number; etiqueta: string; descripcion: string | null; parametros: FactorParam[]; activo: boolean }
const factores = ref<FactorItem[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const { data, error: err } = await getSupabase()
    .from('factores_precio')
    .select('id, etiqueta, descripcion, parametros, activo')
    .order('id')
  if (err) error.value = err.message
  else factores.value = (data ?? []) as FactorItem[]
  loading.value = false
})
</script>
