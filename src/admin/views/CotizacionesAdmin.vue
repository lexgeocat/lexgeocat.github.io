<template>
  <div>
    <div class="admin-page-head">
      <div>
        <h1>Cotizaciones</h1>
        <p>Solicitudes generadas por el simulador del sitio público.</p>
      </div>
    </div>

    <p
      v-if="error"
      class="admin-error"
    >
      <i
        aria-hidden="true"
        class="fa-solid fa-triangle-exclamation"
      /> {{ error }}
    </p>

    <div
      class="admin-card"
      style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"
    >
      <select
        v-model="filterContactado"
        class="admin-filter-select"
      >
        <option value="">
          Todas
        </option>
        <option value="no">
          Pendientes
        </option>
        <option value="si">
          Contactadas
        </option>
      </select>
      <span class="admin-count">{{ filtered.length }} de {{ cotizaciones.length }}</span>
    </div>

    <div
      v-if="loading"
      class="admin-loading"
    >
      <i
        aria-hidden="true"
        class="fa-solid fa-spinner fa-spin"
      />
    </div>

    <div
      v-else
      class="admin-card"
      style="padding:0"
    >
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Servicio</th>
              <th>Área</th>
              <th>Rango</th>
              <th>Nota</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in filtered"
              :key="c.id"
            >
              <td style="white-space:nowrap">
                {{ formatDateTime(c.created_at) }}
              </td>
              <td><strong>{{ c.servicio_id }}</strong></td>
              <td><span class="badge-area">{{ c.area }}</span></td>
              <td class="mono">
                Bs {{ Number(c.rango_min || 0).toLocaleString() }} – {{ Number(c.rango_max || 0).toLocaleString() }}
              </td>
              <td
                style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                :title="c.nota || ''"
              >
                {{ c.nota || '—' }}
              </td>
              <td>
                <span :class="['admin-badge', c.contactado ? 'admin-badge--on' : 'admin-badge--off']">
                  {{ c.contactado ? 'Contactado' : 'Pendiente' }}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px;justify-content:flex-end">
                  <button
                    class="admin-btn admin-btn--sm admin-btn--ghost"
                    @click="openDetail(c)"
                  >
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-eye"
                    />
                  </button>
                  <button
                    class="admin-btn admin-btn--sm admin-btn--danger"
                    @click="confirmDelete(c)"
                  >
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-trash"
                    />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td
                colspan="7"
                class="admin-empty"
              >
                <i
                  aria-hidden="true"
                  class="fa-solid fa-inbox"
                /> Sin cotizaciones para este filtro
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="detail"
      class="admin-modal-overlay"
      @click.self="detail = null"
    >
      <div class="admin-modal">
        <div class="admin-modal-head">
          <h3>Cotización · {{ detail.servicio_id }}</h3>
          <button
            class="admin-btn admin-btn--sm admin-btn--ghost"
            @click="detail = null"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-xmark"
            />
          </button>
        </div>
        <div class="admin-modal-body">
          <dl class="detail-list">
            <dt>Área</dt><dd>{{ detail.area }}</dd>
            <dt>Fecha</dt><dd>{{ formatDateTime(detail.created_at) }}</dd>
            <dt>Rango estimado</dt>
            <dd>Bs {{ Number(detail.rango_min || 0).toLocaleString() }} – {{ Number(detail.rango_max || 0).toLocaleString() }}</dd>
            <dt>Multiplicador</dt><dd>×{{ Number(detail.multiplicador_aplicado || 1).toFixed(2) }}</dd>
            <dt>Extra aplicado</dt><dd>Bs {{ Number(detail.extra_aplicado || 0).toLocaleString() }}</dd>
            <dt>Nota del cliente</dt><dd>{{ detail.nota || '—' }}</dd>
            <dt>Detalles</dt>
            <dd>
              <pre class="detail-json">{{ JSON.stringify(detail.detalles, null, 2) }}</pre>
            </dd>
          </dl>

          <label
            class="admin-form"
            style="margin-top:14px"
          >
            Nota de seguimiento interna
            <textarea
              v-model="seguimientoDraft"
              placeholder="Anotaciones internas sobre el contacto…"
            />
          </label>

          <div
            class="admin-modal-actions"
            style="justify-content:space-between"
          >
            <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text2)">
              <input
                v-model="contactadoDraft"
                type="checkbox"
                style="width:auto"
              >
              Marcado como contactado
            </label>
            <button
              class="admin-btn"
              :disabled="savingDetail"
              @click="saveDetail"
            >
              <i
                v-if="savingDetail"
                aria-hidden="true"
                class="fa-solid fa-spinner fa-spin"
              />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="toast"
      :class="['admin-toast', { error: toast.type === 'error' }]"
    >
      <i
        aria-hidden="true"
        :class="'fa-solid ' + (toast.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check')"
      />
      {{ toast.msg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  fetchCotizacionesAdmin,
  setCotizacionContactado,
  deleteCotizacion,
} from '../../lib/queries'
import type { Cotizacion } from '../../types/supabase'

const cotizaciones = ref<Cotizacion[]>([])
const loading = ref(true)
const error = ref('')
const filterContactado = ref('')

const detail = ref<Cotizacion | null>(null)
const contactadoDraft = ref(false)
const seguimientoDraft = ref('')
const savingDetail = ref(false)
const toast = ref<{ msg: string; type: 'ok' | 'error' } | null>(null)

const filtered = computed(() =>
  cotizaciones.value.filter((c) => {
    if (filterContactado.value === 'si') return c.contactado
    if (filterContactado.value === 'no') return !c.contactado
    return true
  }),
)

function formatDateTime(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function showToast(msg: string, type: 'ok' | 'error' = 'ok') {
  toast.value = { msg, type }
  setTimeout(() => (toast.value = null), 3200)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    cotizaciones.value = await fetchCotizacionesAdmin()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar cotizaciones'
  } finally {
    loading.value = false
  }
}

function openDetail(c: Cotizacion) {
  detail.value = c
  contactadoDraft.value = c.contactado
  seguimientoDraft.value = c.nota_seguimiento || ''
}

async function saveDetail() {
  if (!detail.value) return
  savingDetail.value = true
  try {
    await setCotizacionContactado(detail.value.id, contactadoDraft.value, seguimientoDraft.value)
    const idx = cotizaciones.value.findIndex((c) => c.id === detail.value!.id)
    if (idx >= 0) {
      cotizaciones.value[idx]!.contactado = contactadoDraft.value
      cotizaciones.value[idx]!.nota_seguimiento = seguimientoDraft.value
    }
    showToast('Cotización actualizada')
    detail.value = null
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Error al guardar', 'error')
  } finally {
    savingDetail.value = false
  }
}

async function confirmDelete(c: Cotizacion) {
  if (!window.confirm('¿Eliminar esta cotización? Esta acción no se puede deshacer.')) return
  try {
    await deleteCotizacion(c.id)
    cotizaciones.value = cotizaciones.value.filter((x) => x.id !== c.id)
    showToast('Cotización eliminada')
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Error al eliminar', 'error')
  }
}

load()
</script>

<style scoped>
.admin-filter-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.85rem; background: var(--bg2); color: var(--text); }
.admin-count { font-size: 0.78rem; color: var(--text3); margin-left: auto; }
.mono { font-family: var(--font-mono); font-size: 0.8rem; }
.badge-area { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; background: var(--copper-lt); color: var(--copper); text-transform: capitalize; }
.detail-list { display: grid; grid-template-columns: 140px 1fr; gap: 8px 14px; font-size: 0.85rem; }
.detail-list dt { color: var(--text3); font-weight: 600; }
.detail-list dd { color: var(--text); }
.detail-json { background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 10px; font-family: var(--font-mono); font-size: 0.76rem; overflow-x: auto; }
</style>