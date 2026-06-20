<template>
  <div>
    <h1>Cotizaciones</h1>
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
        <thead><tr><th>Fecha</th><th>Servicio</th><th>Área</th><th>Rango</th><th>Multiplicador</th><th>Extra</th><th>Nota</th><th>Contactado</th></tr></thead>
        <tbody>
          <tr
            v-for="c in cotizaciones"
            :key="c.id"
          >
            <td style="white-space:nowrap">
              {{ c.created_at ? new Date(c.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-' }}
            </td>
            <td><strong>{{ c.servicio_id }}</strong></td>
            <td><span class="badge-area">{{ c.area }}</span></td>
            <td class="mono">
              Bs {{ Number(c.rango_min || 0).toLocaleString() }} – {{ Number(c.rango_max || 0).toLocaleString() }}
            </td>
            <td class="mono">
              ×{{ Number(c.multiplicador_aplicado || 1).toFixed(2) }}
            </td>
            <td class="mono">
              Bs {{ Number(c.extra_aplicado || 0).toLocaleString() }}
            </td>
            <td
              style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
              :title="c.nota || ''"
            >
              {{ c.nota || '-' }}
            </td>
            <td>{{ c.contactado ? 'Sí' : 'No' }}</td>
          </tr>
          <tr v-if="cotizaciones.length === 0">
            <td
              colspan="8"
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

interface Cotizacion { id: number; servicio_id: string; area: string; rango_min: number | null; rango_max: number | null; multiplicador_aplicado: number; extra_aplicado: number; nota: string | null; contactado: boolean; created_at: string | null }
const cotizaciones = ref<Cotizacion[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const { data, error: err } = await getSupabase()
    .from('cotizaciones')
    .select('id, servicio_id, area, rango_min, rango_max, multiplicador_aplicado, extra_aplicado, nota, contactado, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (err) error.value = err.message
  else cotizaciones.value = (data ?? []) as Cotizacion[]
  loading.value = false
})
</script>
