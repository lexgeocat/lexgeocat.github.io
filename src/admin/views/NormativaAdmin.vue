<template>
  <div>
    <div class="admin-page-head">
      <div>
        <h1>Normativa</h1>
        <p>Biblioteca jurídica visible en el sitio público.</p>
      </div>
      <div class="admin-page-head__actions">
        <a
          href="/pages/normativa.html"
          target="_blank"
          rel="noopener"
          class="admin-btn admin-btn--outline admin-btn--icon"
          data-tooltip="Ver página de Normativa"
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
          /> Nueva norma
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
        v-model="filterCategoria"
        class="admin-filter-select"
      >
        <option value="">
          Todas las categorías
        </option>
        <option
          v-for="(lb, v) in CATEGORIA_LABELS"
          :key="v"
          :value="v"
        >
          {{ lb }}
        </option>
      </select>
      <select
        v-model="filterEstado"
        class="admin-filter-select"
      >
        <option value="">
          Todos los estados
        </option>
        <option
          v-for="(lb, v) in ESTADO_LABELS"
          :key="v"
          :value="v"
        >
          {{ lb }}
        </option>
      </select>
      <span class="admin-count">{{ filtered.length }} de {{ normas.length }}</span>
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
              <th>Título</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>PDF</th>
              <th>Activo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="n in filtered"
              :key="n.id"
            >
              <td><strong>{{ n.titulo }}</strong></td>
              <td>{{ CATEGORIA_LABELS[n.categoria] || n.categoria }}</td>
              <td>
                <span :class="'admin-badge ' + estadoBadgeClass(n.estado)">{{ ESTADO_LABELS[n.estado] || n.estado }}</span>
              </td>
              <td>{{ formatDate(n.fecha_publicacion) }}</td>
              <td>
                <a
                  v-if="n.archivo_url"
                  :href="n.archivo_url"
                  target="_blank"
                  rel="noopener"
                  class="admin-link"
                >
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-file-pdf"
                  /> Ver
                </a>
                <span
                  v-else
                  style="color:var(--text3);font-size:0.78rem"
                >Sin PDF</span>
              </td>
              <td>
                <span :class="['admin-badge', n.activo ? 'admin-badge--on' : 'admin-badge--off']">
                  {{ n.activo ? 'Sí' : 'No' }}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px;justify-content:flex-end">
                  <button
                    class="admin-btn admin-btn--sm admin-btn--ghost"
                    @click="openEdit(n)"
                  >
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-pen"
                    />
                  </button>
                  <button
                    class="admin-btn admin-btn--sm admin-btn--danger"
                    @click="confirmDelete(n)"
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
                /> Sin registros para este filtro
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
          <h3>{{ editing ? 'Editar norma' : 'Nueva norma' }}</h3>
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
              Título
              <input
                v-model="form.titulo"
                required
              >
            </label>
            <div class="admin-form-row">
              <label>
                Categoría
                <select
                  v-model="form.categoria"
                  required
                >
                  <option
                    v-for="(lb, v) in CATEGORIA_LABELS"
                    :key="v"
                    :value="v"
                  >{{ lb }}</option>
                </select>
              </label>
              <label>
                Estado
                <select
                  v-model="form.estado"
                  required
                >
                  <option
                    v-for="(lb, v) in ESTADO_LABELS"
                    :key="v"
                    :value="v"
                  >{{ lb }}</option>
                </select>
              </label>
            </div>
            <div class="admin-form-row">
              <label>
                Número de norma
                <input
                  v-model="form.numero_norma"
                  placeholder="ej: Ley 482"
                >
              </label>
              <label>
                Fecha de publicación
                <input
                  v-model="form.fecha_publicacion"
                  type="date"
                >
              </label>
            </div>
            <label>
              Fecha de promulgación
              <input
                v-model="form.fecha_promulgacion"
                type="date"
              >
            </label>
            <label>
              Resumen
              <textarea v-model="form.resumen" />
            </label>
            <label>
              Palabras clave (separadas por coma)
              <input
                v-model="keywordsInput"
                placeholder="ej: catastro, registro predial"
              >
            </label>
            <label>
              Archivo PDF
              <input
                type="file"
                accept="application/pdf"
                @change="onFileSelect"
              >
            </label>
            <p
              v-if="form.archivo_nombre"
              class="admin-hint"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-file-pdf"
              /> Actual: {{ form.archivo_nombre }}
              <button
                type="button"
                class="admin-link-btn"
                @click="removeCurrentFile"
              >
                Quitar
              </button>
            </p>
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
  fetchNormativaAdmin,
  upsertNormativa,
  deleteNormativa,
  uploadNormativaPdf,
  removeNormativaPdf,
} from '../../lib/queries'
import {
  CATEGORIA_LABELS,
  ESTADO_LABELS,
  formatDate,
} from '../../features/normativa/useNormativa'
import type { Normativa } from '../../types/supabase'

const normas = ref<Normativa[]>([])
const loading = ref(true)
const error = ref('')
const filterCategoria = ref('')
const filterEstado = ref('')

const modalOpen = ref(false)
const editing = ref<Normativa | null>(null)
const saving = ref(false)
const formError = ref('')
const keywordsInput = ref('')
const pendingFile = ref<File | null>(null)
const toast = ref<{ msg: string; type: 'ok' | 'error' } | null>(null)

const emptyForm = (): Partial<Normativa> => ({
  titulo: '',
  categoria: 'leyes',
  estado: 'vigente',
  numero_norma: '',
  fecha_promulgacion: null,
  fecha_publicacion: null,
  resumen: '',
  archivo_url: null,
  archivo_path: null,
  archivo_nombre: null,
  activo: true,
})

const form = ref<Partial<Normativa>>(emptyForm())

const filtered = computed(() =>
  normas.value.filter((n) => {
    if (filterCategoria.value && n.categoria !== filterCategoria.value) return false
    if (filterEstado.value && n.estado !== filterEstado.value) return false
    return true
  }),
)

function estadoBadgeClass(estado: string) {
  if (estado === 'vigente') return 'admin-badge--on'
  if (estado === 'derogada') return 'admin-badge--off-red'
  return 'admin-badge--off'
}

function showToast(msg: string, type: 'ok' | 'error' = 'ok') {
  toast.value = { msg, type }
  setTimeout(() => (toast.value = null), 3200)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    normas.value = await fetchNormativaAdmin()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar normativa'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.value = emptyForm()
  keywordsInput.value = ''
  pendingFile.value = null
  formError.value = ''
  modalOpen.value = true
}

function openEdit(n: Normativa) {
  editing.value = n
  form.value = { ...n }
  keywordsInput.value = (n.palabras_clave || []).join(', ')
  pendingFile.value = null
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  pendingFile.value = file ?? null
}

async function removeCurrentFile() {
  if (!form.value.archivo_path) return
  try {
    await removeNormativaPdf(form.value.archivo_path)
    form.value.archivo_url = null
    form.value.archivo_path = null
    form.value.archivo_nombre = null
    showToast('PDF eliminado')
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Error al eliminar PDF', 'error')
  }
}

async function save() {
  if (!form.value.titulo || !form.value.categoria || !form.value.estado) {
    formError.value = 'Completa título, categoría y estado.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    const palabras_clave = keywordsInput.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const id = await upsertNormativa({ ...form.value, palabras_clave } as Normativa)

    if (pendingFile.value) {
      const uploaded = await uploadNormativaPdf(pendingFile.value, id)
      await upsertNormativa({
        id,
        titulo: form.value.titulo!,
        categoria: form.value.categoria!,
        estado: form.value.estado!,
        archivo_url: uploaded.url,
        archivo_path: uploaded.path,
        archivo_nombre: uploaded.nombre,
      } as Normativa)
    }

    showToast(editing.value ? 'Norma actualizada' : 'Norma creada')
    modalOpen.value = false
    await load()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(n: Normativa) {
  if (!window.confirm(`¿Eliminar la norma "${n.titulo}"? Se borrará también el PDF asociado.`)) return
  try {
    await deleteNormativa(n.id, n.archivo_path)
    normas.value = normas.value.filter((x) => x.id !== n.id)
    showToast('Norma eliminada')
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Error al eliminar', 'error')
  }
}

load()
</script>

<style scoped>
.admin-filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
  background: var(--bg2);
  color: var(--text);
}
.admin-count { font-size: 0.78rem; color: var(--text3); margin-left: auto; }
.admin-link { display: inline-flex; align-items: center; gap: 5px; font-size: 0.78rem; color: var(--copper); font-weight: 600; }
.admin-link-btn { background: none; border: none; color: var(--copper); text-decoration: underline; cursor: pointer; font-size: 0.76rem; margin-left: 6px; }
.admin-badge--off-red { background: rgb(192 57 43 / 12%); color: #c0392b; display: inline-flex; align-items: center; gap: 4px; font-size: 0.66rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 3px 9px; border-radius: 5px; }
.admin-hint { font-size: 0.76rem; color: var(--text3); display: flex; align-items: center; gap: 6px; }
.admin-hint i { color: var(--copper); }
</style>