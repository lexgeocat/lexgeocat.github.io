<template>
  <div>
    <h1>Servicios</h1>
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
      <div class="toolbar-left">
        <select
          v-model="filterArea"
          class="filter-select"
          @change="loadData"
        >
          <option value="">
            Todas las áreas
          </option>
          <option value="derecho">
            Derecho
          </option>
          <option value="catastro">
            Catastro
          </option>
          <option value="ordenamiento">
            Ordenamiento
          </option>
          <option value="geografia">
            Geografía
          </option>
          <option value="topografia">
            Topografía
          </option>
          <option value="geomatica">
            Geomática
          </option>
          <option value="software">
            Software
          </option>
        </select>
      </div>
      <table class="admin-table">
        <thead><tr><th>ID</th><th>Label</th><th>Área</th><th>Categoría</th><th>Precio</th><th>Orden</th><th>Activo</th></tr></thead>
        <tbody>
          <tr
            v-for="s in servicios"
            :key="s.id"
          >
            <td>{{ s.id }}</td>
            <td>{{ s.label }}</td>
            <td><span class="badge-area">{{ s.area }}</span></td>
            <td>{{ s.categoria }}</td>
            <td class="mono">
              Bs {{ Number(s.precio_min).toLocaleString() }} – {{ Number(s.precio_max).toLocaleString() }}
            </td>
            <td>{{ s.orden }}</td>
            <td>{{ s.activo ? 'Sí' : 'No' }}</td>
          </tr>
          <tr v-if="servicios.length === 0">
            <td
              colspan="7"
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

interface ServicioItem { id: number; area: string; label: string; categoria: string; precio_min: number; precio_max: number; orden: number; activo: boolean }
const servicios = ref<ServicioItem[]>([])
const loading = ref(true)
const error = ref('')
const filterArea = ref('')

async function loadData() {
  loading.value = true
  error.value = ''
  let query = getSupabase()
    .from('servicios')
    .select('id, area, label, categoria, precio_min, precio_max, orden, activo')
    .order('area')
    .order('orden')
  if (filterArea.value) query = query.eq('area', filterArea.value)
  const { data, error: err } = await query
  if (err) error.value = err.message
  else servicios.value = (data ?? []) as ServicioItem[]
  loading.value = false
}

onMounted(loadData)
</script>

<style scoped>
.toolbar-left { margin-bottom: 1rem; }
.filter-select { padding: 0.4rem 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.85rem; }
.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
.badge-area { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; background: var(--copper-lt, rgba(184,115,51,0.1)); color: var(--copper, #b87333); }
</style>
