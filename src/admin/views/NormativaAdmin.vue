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
        v-model="filterGrupoId"
        class="admin-filter-select"
        @change="onGrupoChange"
      >
        <option value="">
          Todos los grupos
        </option>
        <option
          v-for="g in taxonomia.grupos.value"
          :key="g.id"
          :value="g.id"
        >
          {{ g.numeral }}. {{ g.nombre }}
        </option>
      </select>
      <select
        v-model="filterTipoId"
        class="admin-filter-select"
      >
        <option value="">
          Todos los tipos
        </option>
        <option
          v-for="t in filteredTipos"
          :key="t.id"
          :value="t.id"
        >
          {{ t.numero }}. {{ t.nombre }}
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
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>PDF</th>
              <th>Activo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filteredRows"
              :key="row.n.id"
            >
              <td><strong>{{ row.n.titulo }}</strong></td>
              <td>
                <span
                  v-if="row.numeral"
                  class="admin-hint"
                  style="margin-right:6px"
                >
                  {{ row.numeral }}
                </span>
                {{ row.tipoNombre }}
              </td>
              <td>
                <span :class="'admin-badge ' + estadoBadgeClass(row.n.estado)">{{ ESTADO_LABELS[row.n.estado] || row.n.estado }}</span>
              </td>
              <td>{{ formatDate(row.n.fecha_publicacion) }}</td>
              <td>
                <a
                  v-if="row.n.archivo_url"
                  :href="row.n.archivo_url"
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
                <span :class="['admin-badge', row.n.activo ? 'admin-badge--on' : 'admin-badge--off']">
                  {{ row.n.activo ? 'Sí' : 'No' }}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:6px;justify-content:flex-end">
                  <button
                    class="admin-btn admin-btn--sm admin-btn--ghost"
                    @click="openEdit(row.n)"
                  >
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-pen"
                    />
                  </button>
                  <button
                    class="admin-btn admin-btn--sm admin-btn--danger"
                    @click="askDelete(row.n)"
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

    <!-- Modal crear/editar -->
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
                Tipo de norma (clasificación jerárquica)
                <select
                  v-model="form.tipo_id"
                  required
                >
                  <option value="">
                    — Selecciona un tipo —
                  </option>
                  <optgroup
                    v-for="grupo in taxonomia.grupos.value"
                    :key="grupo.id"
                    :label="grupo.numeral + '. ' + grupo.nombre"
                  >
                    <option
                      v-for="tipo in taxonomia.tiposPorGrupo.value[grupo.id] || []"
                      :key="tipo.id"
                      :value="tipo.id"
                    >
                      {{ tipo.numero }}. {{ tipo.nombre }}
                    </option>
                  </optgroup>
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
                Fecha de promulgación
                <input
                  v-model="form.fecha_promulgacion"
                  type="date"
                >
              </label>
            </div>
            <label>
              Fecha de publicación
              <input
                v-model="form.fecha_publicacion"
                type="date"
              >
              <span
                v-if="dateError"
                class="admin-hint"
                style="color: var(--copper); margin-top: 4px"
              >
                <i
                  aria-hidden="true"
                  class="fa-solid fa-triangle-exclamation"
                /> {{ dateError }}
              </span>
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
              Imagen de portada
              <input
                id="normativa-imagen-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                @change="onImagenSelect"
              >
              <span
                v-if="imgError"
                class="admin-hint"
                style="color:#c0392b"
              >
                <i
                  aria-hidden="true"
                  class="fa-solid fa-triangle-exclamation"
                /> {{ imgError }}
              </span>
            </label>

            <!-- ── Bloque unificado de imagen: una sola fuente de verdad (imageState) ── -->
            <div
              class="admin-img-row"
              :class="{ 'admin-img-row--error': !!imgError }"
            >
              <!-- Preview local del archivo recién seleccionado -->
              <template v-if="imageState.kind === 'preview'">
                <img
                  :src="imageState.url"
                  alt="Previsualización"
                  class="admin-img-preview"
                >
                <div class="admin-img-info">
                  <span class="admin-hint">
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-image"
                    /> {{ imageState.name }}
                  </span>
                  <button
                    type="button"
                    class="admin-link-btn"
                    @click="removeImagen"
                  >
                    Quitar selección
                  </button>
                </div>
              </template>

              <!-- Subiendo al Worker -->
              <template v-else-if="imageState.kind === 'uploading'">
                <div class="admin-img-preview admin-img-preview--placeholder">
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-image"
                  />
                </div>
                <div class="admin-img-info">
                  <span class="admin-hint">
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-cloud-arrow-up"
                    /> Subiendo {{ imageState.name }}…
                  </span>
                  <div class="admin-progress-bar">
                    <div class="admin-progress-bar__fill" />
                  </div>
                </div>
              </template>

              <!-- Imagen pendiente: subida OK, aún no visible al público -->
              <template v-else-if="imageState.kind === 'pending'">
                <div class="admin-img-preview admin-img-preview--placeholder">
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-image"
                  />
                </div>
                <div class="admin-img-info">
                  <span class="admin-hint">
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-circle-check"
                      style="color: var(--color-success)"
                    />
                    Imagen recibida: <code>{{ imageState.filename }}</code>
                  </span>
                  <span
                    v-if="!resolveNormativaImageUrl(imageState.filename)"
                    class="admin-hint"
                    style="color: var(--copper)"
                  >
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-clock"
                    />
                    Procesándose — visible tras el próximo despliegue (2-5 min).
                  </span>
                  <button
                    type="button"
                    class="admin-link-btn"
                    @click="removeImagen"
                  >
                    Quitar imagen
                  </button>
                </div>
              </template>

              <!-- Imagen ya guardada en BD -->
              <template v-else-if="imageState.kind === 'current'">
                <div class="admin-img-preview admin-img-preview--placeholder">
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-image"
                  />
                </div>
                <div class="admin-img-info">
                  <span class="admin-hint">
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-circle-check"
                      style="color: var(--color-success)"
                    />
                    Imagen guardada:
                    <code>{{ imageState.url }}</code>
                  </span>
                  <span
                    v-if="!resolveNormativaImageUrl(imageState.url)"
                    class="admin-hint"
                    style="color: var(--copper)"
                  >
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-clock"
                    />
                    Aún procesándose — visible tras el próximo despliegue.
                  </span>
                  <button
                    type="button"
                    class="admin-link-btn"
                    @click="removeImagen"
                  >
                    Quitar imagen
                  </button>
                </div>
              </template>

              <!-- Marcada para eliminar al guardar -->
              <template v-else-if="imageState.kind === 'marked-removed'">
                <div class="admin-img-preview admin-img-preview--placeholder">
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-ban"
                    style="opacity: 0.5"
                  />
                </div>
                <div class="admin-img-info">
                  <span
                    class="admin-hint"
                    style="color: var(--copper)"
                  >
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-triangle-exclamation"
                    />
                    La imagen será eliminada al guardar. Puedes
                    <button
                      type="button"
                      class="admin-link-btn"
                      @click="undoRemoveImagen"
                    >
                      deshacer
                    </button>.
                  </span>
                </div>
              </template>
            </div>

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
                :disabled="saving || !!dateError"
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

    <!-- E. Modal de confirmación de borrado (reemplaza window.confirm) -->
    <div
      v-if="confirmDeleteItem"
      class="admin-modal-overlay"
      @click.self="confirmDeleteItem = null"
    >
      <div class="admin-modal admin-modal--sm">
        <div class="admin-modal-head">
          <h3>Eliminar norma</h3>
        </div>
        <div class="admin-modal-body">
          <p>¿Eliminar <strong>{{ confirmDeleteItem.titulo }}</strong>?</p>
          <p
            v-if="confirmDeleteItem.archivo_nombre"
            class="admin-hint"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-file-pdf"
            /> También se borrará el PDF asociado.
          </p>
          <div class="admin-modal-actions">
            <button
              type="button"
              class="admin-btn admin-btn--ghost"
              @click="confirmDeleteItem = null"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="admin-btn admin-btn--danger"
              :disabled="deleting"
              @click="doDelete"
            >
              <i
                v-if="deleting"
                aria-hidden="true"
                class="fa-solid fa-spinner fa-spin"
              />
              {{ deleting ? 'Eliminando…' : 'Eliminar' }}
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
import { ref, computed, onBeforeUnmount } from 'vue'
import {
  fetchNormativaAdmin,
  upsertNormativa,
  deleteNormativa,
  uploadNormativaPdf,
  removeNormativaPdf,
} from '../../lib/queries'
import {
  ESTADO_LABELS,
  formatDate,
} from '../../features/normativa/useNormativa'
import { useNormativaTaxonomia } from '../../features/normativa/useNormativaTaxonomia'
import type { Normativa, NormativaTipo } from '../../types/supabase'
import { resolveNormativaImageUrl } from '../../lib/normativaImage'
import {
  MAX_IMAGE_BYTES,
  ALLOWED_IMAGE_TYPES,
  uploadAdminImage,
} from '../shared/imageUpload'

const normas = ref<Normativa[]>([])
const loading = ref(true)
const error = ref('')
const filterGrupoId = ref('')
const filterTipoId = ref('')
const filterEstado = ref('')

const modalOpen = ref(false)
const editing = ref<Normativa | null>(null)
const saving = ref(false)
const formError = ref('')
const imgError = ref('')
const keywordsInput = ref('')
const pendingFile = ref<File | null>(null)
const toast = ref<{ msg: string; type: 'ok' | 'error' } | null>(null)

const taxonomia = useNormativaTaxonomia()

const filteredTipos = computed<NormativaTipo[]>(() => {
  if (!filterGrupoId.value) return taxonomia.tipos.value
  return taxonomia.tipos.value.filter((t) => t.grupo_id === filterGrupoId.value)
})

function onGrupoChange() {
  filterTipoId.value = ''
}

const emptyForm = (): Partial<Normativa> => ({
  titulo: '',
  tipo_id: '',
  estado: 'vigente',
  numero_norma: '',
  fecha_promulgacion: null,
  fecha_publicacion: null,
  resumen: '',
  archivo_url: null,
  archivo_path: null,
  archivo_nombre: null,
  imagen_url: null,
  activo: true,
})

const form = ref<Partial<Normativa>>(emptyForm())

// ── D. filtered con cache O(1) de taxonomía ──────────────────────────────────
const filtered = computed(() => {
  const grupoId = filterGrupoId.value
  const tipoId = filterTipoId.value
  const estado = filterEstado.value
  return normas.value.filter((n) => {
    if (grupoId) {
      const grupo = taxonomia.grupoDeTipo(n.tipo_id)
      if (!grupo || grupo.id !== grupoId) return false
    }
    if (tipoId && n.tipo_id !== tipoId) return false
    if (estado && n.estado !== estado) return false
    return true
  })
})

interface FilteredRow {
  n: Normativa
  numeral: string | null
  tipoNombre: string
}
const filteredRows = computed<FilteredRow[]>(() =>
  filtered.value.map((n) => ({
    n,
    numeral: taxonomia.grupoDeTipo(n.tipo_id)?.numeral ?? null,
    tipoNombre: taxonomia.nombreTipo(n.tipo_id),
  })),
)

// ── F. Validación de fechas en frontend ──────────────────────────────────────
const dateError = computed(() => {
  const p = form.value.fecha_promulgacion
  const pub = form.value.fecha_publicacion
  if (p && pub && pub < p) {
    return 'La fecha de publicación no puede ser anterior a la de promulgación.'
  }
  return ''
})

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

async function loadAll() {
  await Promise.all([load(), taxonomia.load()])
}

// ── C. imageState: máquina de estados explícita (un solo ref) ───────────────
// Duplicada intencionalmente con ServiciosAdmin.vue. Las transiciones escriben sobre
// `form.value.imagen_url` y leen de `editing.value`, refs locales del componente.
// Extraer un composable obligaría a inyectarlos por callback, sin reducir duplicación
// real (el bloque son ~30 líneas). Si aparece una tercera vista admin con gestión de
// imágenes, conviene refactorizar a `useAdminImageUpload(form, editing)`.
type ImageState =
  | { kind: 'empty' }
  | { kind: 'preview'; file: File; url: string; name: string }
  | { kind: 'uploading'; name: string }
  | { kind: 'pending'; filename: string }
  | { kind: 'current'; url: string }
  | { kind: 'marked-removed' }

const imageState = ref<ImageState>({ kind: 'empty' })

function transitionImage(next: ImageState) {
  const cur = imageState.value
  if (cur.kind === 'preview') {
    URL.revokeObjectURL(cur.url)
  }
  imageState.value = next
}

function resetImageState() {
  transitionImage({ kind: 'empty' })
}

function openCreate() {
  editing.value = null
  form.value = emptyForm()
  keywordsInput.value = ''
  pendingFile.value = null
  resetImageState()
  formError.value = ''
  imgError.value = ''
  modalOpen.value = true
}

function openEdit(n: Normativa) {
  editing.value = n
  form.value = { ...n }
  keywordsInput.value = (n.palabras_clave || []).join(', ')
  pendingFile.value = null
  resetImageState()
  if (n.imagen_url) {
    transitionImage({ kind: 'current', url: n.imagen_url })
  }
  formError.value = ''
  imgError.value = ''
  modalOpen.value = true
}

function closeModal() {
  // Antes de cerrar, si hay un upload en curso, lo dejamos terminar (no podemos
  // abortar el fetch desde el cliente de forma fiable). El flag pendingImage
  // uploaded ya no mutará estado visible porque el modal se cerró.
  modalOpen.value = false
  pendingFile.value = null
  resetImageState()
}

onBeforeUnmount(() => {
  resetImageState()
})

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  pendingFile.value = file ?? null
}

function onImagenSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    transitionImage({ kind: 'empty' })
    return
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    imgError.value = 'Formato no permitido. Usa PNG, JPEG o WebP.'
    input.value = ''
    return
  }
  if (file.size > MAX_IMAGE_BYTES) {
    imgError.value = `La imagen supera el límite de ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`
    input.value = ''
    return
  }
  imgError.value = ''
  transitionImage({
    kind: 'preview',
    file,
    url: URL.createObjectURL(file),
    name: file.name,
  })
  input.value = '' // permite re-seleccionar el mismo archivo
}

function removeImagen() {
  formError.value = ''
  imgError.value = ''
  const cur = imageState.value
  const input = document.getElementById('normativa-imagen-input') as HTMLInputElement | null
  if (input) input.value = ''

  if (cur.kind === 'preview' || cur.kind === 'pending' || cur.kind === 'uploading') {
    // Imagen nueva que aún no está persistida → solo descartar
    transitionImage({ kind: 'empty' })
    return
  }
  if (cur.kind === 'current') {
    // Imagen guardada → marcar para borrado al guardar
    transitionImage({ kind: 'marked-removed' })
    form.value.imagen_url = null
    return
  }
}

function undoRemoveImagen() {
  if (editing.value?.imagen_url) {
    transitionImage({ kind: 'current', url: editing.value.imagen_url })
    form.value.imagen_url = editing.value.imagen_url
  } else {
    transitionImage({ kind: 'empty' })
  }
}

// uploadNormativaImage: ver `uploadAdminImage` en src/admin/shared/imageUpload.ts

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

// ── A + C. save(): un solo upsert, con uploads primero y rollback si falla ────
async function save() {
  if (!form.value.titulo || !form.value.tipo_id || !form.value.estado) {
    formError.value = 'Completa título, tipo de norma y estado.'
    return
  }
  if (dateError.value) {
    formError.value = dateError.value
    return
  }

  saving.value = true
  formError.value = ''

  try {
    const palabras_clave = keywordsInput.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    // 1. Subimos archivos ANTES de tocar BD. Si fallan, no dejamos registros rotos.
    let uploadedPdf: Awaited<ReturnType<typeof uploadNormativaPdf>> | null = null
    if (pendingFile.value) {
      uploadedPdf = await uploadNormativaPdf(pendingFile.value, 'tmp-' + Date.now())
    }

    let uploadedImage: { filename: string } | null = null
    const curImg = imageState.value
    if (curImg.kind === 'preview') {
      transitionImage({ kind: 'uploading', name: curImg.name })
      try {
        uploadedImage = await uploadAdminImage(curImg.file, 'normativa')
      } catch (err) {
        const restoredUrl = URL.createObjectURL(curImg.file)
        transitionImage({ kind: 'preview', file: curImg.file, url: restoredUrl, name: curImg.name })
        throw err
      }
    }

    // 2. Construimos el payload unificado para un solo upsert
    const payload: Partial<Normativa> = {
      id: editing.value?.id,
      titulo: form.value.titulo!,
      tipo_id: form.value.tipo_id!,
      estado: form.value.estado!,
      numero_norma: form.value.numero_norma || null,
      fecha_promulgacion: form.value.fecha_promulgacion || null,
      fecha_publicacion: form.value.fecha_publicacion || null,
      resumen: form.value.resumen || null,
      palabras_clave,
      activo: !!form.value.activo,
      archivo_url: uploadedPdf?.url ?? form.value.archivo_url ?? null,
      archivo_path: uploadedPdf?.path ?? form.value.archivo_path ?? null,
      archivo_nombre: uploadedPdf?.nombre ?? form.value.archivo_nombre ?? null,
      // imagen: si marcada para quitar, null; si hay upload nuevo, el filename
      imagen_url: imageState.value.kind === 'marked-removed'
        ? null
        : (uploadedImage?.filename ?? form.value.imagen_url ?? null),
    }

    try {
      await upsertNormativa(payload as Normativa)
    } catch (err) {
      // Rollback del PDF (sí vive en Supabase Storage).
      if (uploadedPdf) await removeNormativaPdf(uploadedPdf.path).catch(() => {})
      // NO hay rollback de la imagen subida: el Worker ya la commiteó a
      // `raw-uploads/normativa/` en el repo de GitHub como parte de su flujo.
      // Borrarla de un eventual bucket de Supabase Storage (`normativa-images`)
      // no la eliminaría del repo ni impediría que el Action la procese en el
      // siguiente deploy. Si el upsert falla, la imagen queda en
      // `src/assets/img/normativa/` huérfana pero inocua.
      throw err
    }

    // 4. Feedback visual + cerrar
    showToast(
      uploadedImage
        ? 'Norma guardada. Imagen visible tras el próximo despliegue (2-5 min).'
        : editing.value
          ? 'Norma actualizada'
          : 'Norma creada',
    )
    modalOpen.value = false
    resetImageState()
    await load()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Error al guardar'
  } finally {
    saving.value = false
  }
}

// ── E. Modal de confirmación de borrado ──────────────────────────────────────
const confirmDeleteItem = ref<Normativa | null>(null)
const deleting = ref(false)

function askDelete(n: Normativa) {
  confirmDeleteItem.value = n
}

async function doDelete() {
  const item = confirmDeleteItem.value
  if (!item) return
  deleting.value = true
  try {
    await deleteNormativa(item.id, item.archivo_path)
    normas.value = normas.value.filter((x) => x.id !== item.id)
    showToast('Norma eliminada')
    confirmDeleteItem.value = null
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Error al eliminar', 'error')
  } finally {
    deleting.value = false
  }
}

loadAll()
</script>

<style scoped>
.admin-badge--off-red { background: rgb(192 57 43 / 12%); color: #c0392b; display: inline-flex; align-items: center; gap: 4px; font-size: 0.66rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 3px 9px; border-radius: 5px; }
</style>
