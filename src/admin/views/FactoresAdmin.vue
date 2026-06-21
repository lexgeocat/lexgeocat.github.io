<template>
  <div>
    <div class="admin-page-head">
      <div>
        <h1>Factores de Precio</h1>
        <p>Parámetros que alimentan el simulador de cotización.</p>
      </div>
      <div class="admin-page-head__actions">
        <a
          href="/pages/servicios.html"
          target="_blank"
          rel="noopener"
          class="admin-btn admin-btn--outline admin-btn--icon"
          data-tooltip="Ver simulador de cotización"
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
          /> Nuevo factor
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
              <th>ID</th>
              <th>Etiqueta</th>
              <th>Descripción</th>
              <th>Parámetros</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="f in factores"
              :key="f.id"
            >
              <td class="mono">
                {{ f.id }}
              </td>
              <td><strong>{{ f.etiqueta }}</strong></td>
              <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {{ f.descripcion || '—' }}
              </td>
              <td>{{ (f.parametros || []).map((p) => p.label || p.key).join(', ') || '—' }}</td>
              <td>
                <span :class="['admin-badge', f.activo ? 'admin-badge--on' : 'admin-badge--off']">
                  {{ f.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px;justify-content:flex-end">
                  <button
                    class="admin-btn admin-btn--sm admin-btn--ghost"
                    @click="openEdit(f)"
                  >
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-pen"
                    />
                  </button>
                  <button
                    class="admin-btn admin-btn--sm admin-btn--outline"
                    @click="onToggleActivo(f)"
                  >
                    <i
                      aria-hidden="true"
                      :class="'fa-solid ' + (f.activo ? 'fa-eye-slash' : 'fa-eye')"
                    />
                  </button>
                  <button
                    class="admin-btn admin-btn--sm admin-btn--danger"
                    @click="confirmDelete(f)"
                  >
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-trash"
                    />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!factores.length">
              <td
                colspan="6"
                class="admin-empty"
              >
                <i
                  aria-hidden="true"
                  class="fa-solid fa-inbox"
                /> Sin factores registrados
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
          <h3>{{ editing ? 'Editar factor' : 'Nuevo factor' }}</h3>
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
                placeholder="ej: topo_area"
              >
            </label>
            <label>
              Etiqueta
              <input
                v-model="form.etiqueta"
                required
                placeholder="ej: Topografía por Área"
              >
            </label>
            <label>
              Descripción
              <textarea v-model="form.descripcion" />
            </label>
            <label>
              Parámetros (JSON)
              <textarea
                v-model="parametrosJson"
                class="mono-textarea"
                rows="10"
                placeholder="[{&quot;key&quot;:&quot;alcance&quot;,&quot;label&quot;:&quot;Alcance&quot;,&quot;tipo&quot;:&quot;chips&quot;,&quot;requerido&quot;:true,&quot;opciones&quot;:[{&quot;label&quot;:&quot;Básico&quot;,&quot;multiplicador&quot;:0.85}]}]"
              />
            </label>
            <p class="admin-hint">
              <i
                aria-hidden="true"
                class="fa-solid fa-circle-info"
              />
              Tipos válidos: <code>chips</code>, <code>chips_multi</code>, <code>number</code>. Cada opción admite <code>multiplicador</code> y/o <code>precio_extra</code>.
            </p>
            <label style="flex-direction:row;align-items:center;gap:8px">
              <input
                v-model="form.activo"
                type="checkbox"
                style="width:auto"
              >
              Activo
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
import { ref } from 'vue'
import {
  fetchFactoresPrecioAdmin,
  upsertFactor,
  deleteFactor,
  toggleFactorActivo,
} from '../../lib/queries'
import type { FactorPrecio, FactorParam } from '../../types/supabase'

const factores = ref<FactorPrecio[]>([])
const loading = ref(true)
const error = ref('')

const modalOpen = ref(false)
const editing = ref<FactorPrecio | null>(null)
const saving = ref(false)
const formError = ref('')
const parametrosJson = ref('[]')
const toast = ref<{ msg: string; type: 'ok' | 'error' } | null>(null)

const emptyForm = (): Partial<FactorPrecio> => ({
  id: '',
  etiqueta: '',
  descripcion: '',
  activo: true,
})

const form = ref<Partial<FactorPrecio>>(emptyForm())

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseFactorParams(json: string): FactorParam[] {
  const parsed: unknown = JSON.parse(json)
  if (!Array.isArray(parsed) || !parsed.every(isPlainObject)) {
    throw new Error('Debe ser un array de objetos')
  }
  return parsed as unknown as FactorParam[]
}

function showToast(msg: string, type: 'ok' | 'error' = 'ok') {
  toast.value = { msg, type }
  setTimeout(() => (toast.value = null), 3200)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    factores.value = await fetchFactoresPrecioAdmin()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar factores'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.value = emptyForm()
  parametrosJson.value = '[]'
  formError.value = ''
  modalOpen.value = true
}

function openEdit(f: FactorPrecio) {
  editing.value = f
  form.value = { ...f }
  parametrosJson.value = JSON.stringify(f.parametros ?? [], null, 2)
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

async function save() {
  if (!form.value.id || !form.value.etiqueta) {
    formError.value = 'Completa ID y etiqueta.'
    return
  }

  let parametros: FactorParam[] = []

  try {
    parametros = parseFactorParams(parametrosJson.value)
  } catch (e) {
    formError.value = 'JSON de parámetros inválido: ' + (e instanceof Error ? e.message : '')
    return
  }

  saving.value = true
  formError.value = ''
  try {
    await upsertFactor({ ...form.value, parametros } as FactorPrecio)
    showToast(editing.value ? 'Factor actualizado' : 'Factor creado')
    modalOpen.value = false
    await load()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function onToggleActivo(f: FactorPrecio) {
  try {
    await toggleFactorActivo(f.id, !f.activo)
    f.activo = !f.activo
    showToast(f.activo ? 'Factor activado' : 'Factor desactivado')
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Error', 'error')
  }
}

async function confirmDelete(f: FactorPrecio) {
  if (!window.confirm(`¿Eliminar el factor "${f.etiqueta}"?`)) return
  try {
    await deleteFactor(f.id)
    factores.value = factores.value.filter((x) => x.id !== f.id)
    showToast('Factor eliminado')
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Error al eliminar', 'error')
  }
}

load()
</script>

<style scoped>
.mono { font-family: var(--font-mono); font-size: 0.8rem; }
.mono-textarea { font-family: var(--font-mono); font-size: 0.8rem; min-height: 220px; }
.admin-hint {
  font-size: 0.76rem;
  color: var(--text3);
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.5;
}
.admin-hint i { color: var(--copper); margin-top: 2px; }
.admin-hint code { font-family: var(--font-mono); background: var(--bg2); padding: 1px 5px; border-radius: 4px; }
</style>