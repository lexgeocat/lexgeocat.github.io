<template>
  <div>
    <div class="admin-page-head">
      <div>
        <h1>Servicios</h1>
        <p>Catálogo de servicios mostrado en la página pública.</p>
      </div>
      <div class="admin-page-head__actions">
        <a
          href="/pages/servicios.html"
          target="_blank"
          rel="noopener"
          class="admin-btn admin-btn--outline admin-btn--icon"
          data-tooltip="Ver página de Servicios"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-arrow-up-right-from-square"
          />
        </a>
        <button
          class="admin-btn"
          @click="openCreate"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-plus"
          /> Nuevo servicio
        </button>
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
        v-model="filterArea"
        class="admin-filter-select"
      >
        <option value="">
          Todas las áreas
        </option>
        <option
          v-for="a in AREA_KEYS"
          :key="a"
          :value="a"
        >
          {{ a }}
        </option>
      </select>
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nombre o categoría…"
        class="admin-filter-search"
      >
      <span class="admin-count">{{ filtered.length }} de {{ servicios.length }}</span>
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
              <th>Label</th>
              <th>Área</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Orden</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in filtered"
              :key="s.id"
            >
              <td><strong>{{ s.label }}</strong></td>
              <td><span class="badge-area">{{ s.area }}</span></td>
              <td>{{ s.categoria }}</td>
              <td class="mono">
                Bs {{ Number(s.precio_min).toLocaleString() }} – {{ Number(s.precio_max).toLocaleString() }}
              </td>
              <td>{{ s.orden }}</td>
              <td>
                <span :class="['admin-badge', s.activo ? 'admin-badge--on' : 'admin-badge--off']">
                  {{ s.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px;justify-content:flex-end">
                  <button
                    class="admin-btn admin-btn--sm admin-btn--ghost"
                    @click="openEdit(s)"
                  >
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-pen"
                    />
                  </button>
                  <button
                    class="admin-btn admin-btn--sm admin-btn--outline"
                    @click="onToggleActivo(s)"
                  >
                    <i
                      aria-hidden="true"
                      :class="'fa-solid ' + (s.activo ? 'fa-eye-slash' : 'fa-eye')"
                    />
                  </button>
                  <button
                    class="admin-btn admin-btn--sm admin-btn--danger"
                    @click="confirmDelete(s)"
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
                />
                Sin servicios para este filtro
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="modalOpen"
      class="admin-modal-overlay"
      @click.self="closeModal"
    >
      <div class="admin-modal">
        <div class="admin-modal-head">
          <h3>{{ editing ? 'Editar servicio' : 'Nuevo servicio' }}</h3>
          <button
            class="admin-btn admin-btn--sm admin-btn--ghost"
            @click="closeModal"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-xmark"
            />
          </button>
        </div>
        <div class="admin-modal-body">
          <p
            v-if="formError"
            class="admin-error"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-triangle-exclamation"
            /> {{ formError }}
          </p>
          <form
            class="admin-form"
            @submit.prevent="save"
          >
            <label>
              ID
              <input
                v-model="form.id"
                :disabled="!!editing"
                required
                placeholder="ej: usucapion"
              >
            </label>
            <div class="admin-form-row">
              <label>
                Área
                <select
                  v-model="form.area"
                  required
                >
                  <option
                    v-for="a in AREA_KEYS"
                    :key="a"
                    :value="a"
                  >{{ a }}</option>
                </select>
              </label>
              <label>
                Categoría
                <input
                  v-model="form.categoria"
                  required
                  placeholder="ej: Derecho Civil"
                >
              </label>
            </div>
            <label>
              Label (nombre visible)
              <input
                v-model="form.label"
                required
              >
            </label>
            <label>
              Descripción
              <textarea v-model="form.descripcion" />
            </label>
            <label>
              Tags (separados por coma)
              <input
                v-model="tagsInput"
                placeholder="ej: usucapión, prescripción"
              >
            </label>
            <label>
              Imagen (URL)
              <input
                v-model="form.img_url"
                placeholder="https://..."
              >
            </label>
            <div class="admin-form-row">
              <label>
                Precio mínimo (Bs)
                <input
                  v-model.number="form.precio_min"
                  type="number"
                  min="0"
                  required
                >
              </label>
              <label>
                Precio máximo (Bs)
                <input
                  v-model.number="form.precio_max"
                  type="number"
                  min="0"
                  required
                >
              </label>
            </div>
            <div class="admin-form-row">
              <label>
                Tiempo mínimo
                <input
                  v-model="form.tiempo_min"
                  placeholder="ej: 2 semanas"
                >
              </label>
              <label>
                Tiempo máximo
                <input
                  v-model="form.tiempo_max"
                  placeholder="ej: 3 meses"
                >
              </label>
            </div>
            <div class="admin-form-row">
              <label>
                Complejidad
                <input
                  v-model="form.complejidad"
                  placeholder="ej: Alta"
                >
              </label>
              <label>
                Orden
                <input
                  v-model.number="form.orden"
                  type="number"
                >
              </label>
            </div>
            <label>
              Tipo de detalle (cotizador)
              <input
                v-model="form.details_type"
                placeholder="general"
              >
            </label>
            <label>
              Texto WhatsApp predefinido
              <input
                v-model="form.whatsapp_texto"
                placeholder="ej: Consulta Derecho Civil"
              >
            </label>
            <label style="flex-direction:row;align-items:center;gap:8px">
              <input
                v-model="form.activo"
                type="checkbox"
                style="width:auto"
              >
              Activo (visible públicamente)
            </label>
            <div class="admin-modal-actions">
              <button
                type="button"
                class="admin-btn admin-btn--ghost"
                @click="closeModal"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="admin-btn"
                :disabled="saving"
              >
                <i
                  v-if="saving"
                  aria-hidden="true"
                  class="fa-solid fa-spinner fa-spin"
                />
                {{ saving ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </form>
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
  fetchServiciosAdmin,
  upsertServicio,
  deleteServicio,
  toggleServicioActivo,
} from '../../lib/queries'
import { AREA_KEYS } from '../../features/servicios/useServiciosCatalog'
import type { Servicio } from '../../types/supabase'

const servicios = ref<Servicio[]>([])
const loading = ref(true)
const error = ref('')
const filterArea = ref('')
const search = ref('')

const modalOpen = ref(false)
const editing = ref<Servicio | null>(null)
const saving = ref(false)
const formError = ref('')
const tagsInput = ref('')
const toast = ref<{ msg: string; type: 'ok' | 'error' } | null>(null)

const emptyForm = (): Partial<Servicio> => ({
  id: '',
  area: 'derecho',
  label: '',
  categoria: '',
  descripcion: '',
  img_url: '',
  precio_min: 0,
  precio_max: 0,
  tiempo_min: '',
  tiempo_max: '',
  complejidad: '',
  details_type: 'general',
  unit_label: '',
  whatsapp_texto: '',
  orden: 0,
  activo: true,
})

const form = ref<Partial<Servicio>>(emptyForm())

const filtered = computed(() =>
  servicios.value.filter((s) => {
    if (filterArea.value && s.area !== filterArea.value) return false
    const q = search.value.toLowerCase().trim()
    if (q && !(s.label.toLowerCase().includes(q) || s.categoria.toLowerCase().includes(q))) {
      return false
    }
    return true
  }),
)

function showToast(msg: string, type: 'ok' | 'error' = 'ok') {
  toast.value = { msg, type }
  setTimeout(() => (toast.value = null), 3200)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    servicios.value = await fetchServiciosAdmin()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar servicios'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.value = emptyForm()
  tagsInput.value = ''
  formError.value = ''
  modalOpen.value = true
}

function openEdit(s: Servicio) {
  editing.value = s
  form.value = { ...s }
  tagsInput.value = (s.tags || []).join(', ')
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

async function save() {
  if (!form.value.id || !form.value.area || !form.value.label || !form.value.categoria) {
    formError.value = 'Completa los campos obligatorios.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    const tags = tagsInput.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    await upsertServicio({ ...form.value, tags } as Servicio)
    showToast(editing.value ? 'Servicio actualizado' : 'Servicio creado')
    modalOpen.value = false
    await load()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function onToggleActivo(s: Servicio) {
  try {
    await toggleServicioActivo(s.id, !s.activo)
    s.activo = !s.activo
    showToast(s.activo ? 'Servicio activado' : 'Servicio desactivado')
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Error', 'error')
  }
}

async function confirmDelete(s: Servicio) {
  if (!window.confirm(`¿Eliminar el servicio "${s.label}"? Esta acción no se puede deshacer.`)) return
  try {
    await deleteServicio(s.id)
    servicios.value = servicios.value.filter((x) => x.id !== s.id)
    showToast('Servicio eliminado')
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Error al eliminar', 'error')
  }
}

load()
</script>

<style scoped>
.admin-filter-select, .admin-filter-search {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
  background: var(--bg2);
  color: var(--text);
}
.admin-filter-search { flex: 1; min-width: 220px; }
.admin-count { font-size: 0.78rem; color: var(--text3); margin-left: auto; white-space: nowrap; }
.mono { font-family: var(--font-mono); font-size: 0.8rem; }
.badge-area { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; background: var(--copper-lt); color: var(--copper); text-transform: capitalize; }
</style>