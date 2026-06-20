<template>
  <div>
    <h1>Normativa</h1>
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
        <thead><tr><th>ID</th><th>Título</th><th>Categoría</th><th>Estado</th><th>Fecha</th></tr></thead>
        <tbody>
          <tr
            v-for="n in normativa"
            :key="n.id"
          >
            <td>{{ n.id }}</td>
            <td>{{ n.titulo }}</td>
            <td>{{ n.categoria }}</td>
            <td>{{ n.estado }}</td>
            <td>{{ n.fecha_publicacion ? new Date(n.fecha_publicacion).toLocaleDateString() : '-' }}</td>
          </tr>
          <tr v-if="normativa.length === 0">
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

interface Norma { id: number; titulo: string; categoria: string; estado: string; fecha_publicacion: string | null }
const normativa = ref<Norma[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const { data, error: err } = await getSupabase()
    .from('normativa')
    .select('id, titulo, categoria, estado, fecha_publicacion')
    .order('fecha_publicacion', { ascending: false })
  if (err) error.value = err.message
  else normativa.value = (data ?? []) as Norma[]
  loading.value = false
})
</script>
