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
      class="admin-card servicios-filter-bar"
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
      class="admin-card servicios-table-card"
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
                <div class="servicios-row-actions">
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
              Imagen
              <input
                id="servicios-imagen-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                @change="onImagenSelect"
              >
            </label>

            <div class="admin-img-row">
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

              <template v-else-if="imageState.kind === 'uploading'">
                <div class="admin-img-preview admin-img-preview--placeholder">
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-spinner fa-spin"
                  />
                </div>
                <div class="admin-img-info">
                  <span class="admin-hint">
                    <i
                      aria-hidden="true"
                      class="fa-solid fa-cloud-arrow-up"
                    /> Subiendo {{ imageState.name }}…
                  </span>
                </div>
              </template>

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
                    v-if="!resolveServicioImageUrl(imageState.filename)"
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
                    v-if="!resolveServicioImageUrl(imageState.url)"
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
            <label class="servicios-check-label">
              <input
                v-model="form.activo"
                type="checkbox"
                class="servicios-check-input"
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

    <!-- Modal de confirmación de borrado -->
    <div
      v-if="confirmDeleteItem"
      class="admin-modal-overlay"
      @click.self="confirmDeleteItem = null"
    >
      <div class="admin-modal admin-modal--sm">
        <div class="admin-modal-head">
          <h3>Eliminar servicio</h3>
        </div>
        <div class="admin-modal-body">
          <p>¿Eliminar <strong>{{ confirmDeleteItem.label }}</strong>?</p>
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
  fetchServiciosAdmin,
  upsertServicio,
  deleteServicio,
  toggleServicioActivo,
  removeServicioImage,
} from '../../lib/queries'
import { AREA_KEYS } from '../../features/servicios/useServiciosCatalog'
import type { Servicio } from '../../types/supabase'
import { resolveServicioImageUrl } from '../../lib/servicioImage'
import { toDirectImageUrl } from '../../shared/utils/image'
import {
  MAX_IMAGE_BYTES,
  ALLOWED_IMAGE_TYPES,
  uploadAdminImage,
} from '../shared/imageUpload'

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
  orden: 0,
  activo: true,
})

const form = ref<Partial<Servicio>>(emptyForm())

// ── ImageState: máquina de estados explícita ────────────────────────────────────
// Duplicada intencionalmente con NormativaAdmin.vue. Las transiciones (`removeImagen`,
// `undoRemoveImagen`, `onImagenSelect`) escriben sobre `form.value.img_url` y leen de
// `editing.value`, ambos refs locales del componente. Extraer un composable obligaría
// a inyectar esos refs por callback, lo que añade fricción sin reducir duplicación real
// (el bloque entero son ~30 líneas). Si en el futuro aparece una tercera vista admin
// con gestión de imágenes, conviene refactorizar a `useAdminImageUpload(form, editing)`.
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
  if (cur.kind === 'preview' && cur.kind !== next.kind) {
    URL.revokeObjectURL(cur.url)
  }
  imageState.value = next
}

function resetImageState() {
  transitionImage({ kind: 'empty' })
}

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
  resetImageState()
  formError.value = ''
  modalOpen.value = true
}

function openEdit(s: Servicio) {
  editing.value = s
  form.value = { ...s }
  tagsInput.value = (s.tags || []).join(', ')
  resetImageState()
  if (s.img_url) {
    // 1) Intenta resolver como asset local (filename en src/assets/img/servicios/).
    // 2) Si no, asume URL externa legada y aplícale el resolver de Google Drive.
    // En ambos casos el estado es 'current': el admin ve la imagen tal como está
    // hoy, aunque venga de fuera del repo. Si sube un archivo nuevo, el filename
    // resultante reemplaza por completo esta URL.
    const resolved = resolveServicioImageUrl(s.img_url) ?? toDirectImageUrl(s.img_url)
    transitionImage({ kind: 'current', url: resolved })
  }
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  resetImageState()
  uploadAbortRef.value = null
}

onBeforeUnmount(() => {
  resetImageState()
})

function onImagenSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    transitionImage({ kind: 'empty' })
    return
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    formError.value = 'Formato no permitido. Usa PNG, JPEG o WebP.'
    input.value = ''
    return
  }
  if (file.size > MAX_IMAGE_BYTES) {
    formError.value = `La imagen supera el límite de ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`
    input.value = ''
    return
  }
  formError.value = ''
  transitionImage({
    kind: 'preview',
    file,
    url: URL.createObjectURL(file),
    name: file.name,
  })
  input.value = ''
}

function removeImagen() {
  const cur = imageState.value
  const input = document.getElementById('servicios-imagen-input') as HTMLInputElement | null
  if (input) input.value = ''

  if (cur.kind === 'preview' || cur.kind === 'pending' || cur.kind === 'uploading') {
    transitionImage({ kind: 'empty' })
    return
  }
  if (cur.kind === 'current') {
    transitionImage({ kind: 'marked-removed' })
    form.value.img_url = ''
    return
  }
}

function undoRemoveImagen() {
  if (editing.value?.img_url) {
    transitionImage({ kind: 'current', url: editing.value.img_url })
    form.value.img_url = editing.value.img_url
  } else {
    transitionImage({ kind: 'empty' })
  }
}

// uploadServicioImage: ver `uploadAdminImage` en src/admin/shared/imageUpload.ts

// AbortController para cancelar uploads al cerrar el modal
const uploadAbortRef = ref<AbortController | null>(null)

async function save() {
  if (!form.value.id || !form.value.area || !form.value.label || !form.value.categoria) {
    formError.value = 'Completa los campos obligatorios.'
    return
  }
  saving.value = true
  formError.value = ''

  const prevImgUrl = form.value.img_url ?? null

  try {
    const tags = tagsInput.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    // 1. Subir imagen ANTES del upsert
    let uploadedImage: { filename: string } | null = null
    const curImg = imageState.value
    if (curImg.kind === 'preview') {
      transitionImage({ kind: 'uploading', name: curImg.name })
      try {
        uploadedImage = await uploadAdminImage(curImg.file, 'servicios')
      } catch (err) {
        transitionImage({ kind: 'preview', file: curImg.file, url: curImg.url, name: curImg.name })
        throw err
      }
    }

    // 2. Upsert
    const payload: Partial<Servicio> = {
      id: form.value.id,
      area: form.value.area!,
      label: form.value.label!,
      categoria: form.value.categoria!,
      descripcion: form.value.descripcion || null,
      tags,
      precio_min: form.value.precio_min ?? 0,
      precio_max: form.value.precio_max ?? 0,
      tiempo_min: form.value.tiempo_min || null,
      tiempo_max: form.value.tiempo_max || null,
      complejidad: form.value.complejidad || null,
      details_type: form.value.details_type || 'general',
      unit_label: form.value.unit_label || null,
      orden: form.value.orden ?? 0,
      activo: !!form.value.activo,
      img_url: imageState.value.kind === 'marked-removed'
        ? null
        : (uploadedImage?.filename ?? form.value.img_url) || null,
    }

    try {
      await upsertServicio(payload as Servicio)
    } catch (err) {
      // NOTA: a diferencia de NormativaAdmin, aquí NO hay rollback del archivo
      // subido. El Worker de servicios ya commitea la imagen a `raw-uploads/`
      // en el repo de GitHub como parte de su flujo, por lo que borrarla de
      // un eventual bucket de Supabase Storage no la elimina del repo ni
      // impide que el Action la procese en el siguiente deploy. Implementar
      // un "rollback" aquí sería silenciar un problema real: si el upsert
      // falla, la imagen quedará visible en `src/assets/img/servicios/`
      // aunque el registro de BD no la referencie. El operador debe estar
      // consciente de esto.
      throw err
    }

    // 3. Limpiar imagen previa si fue reemplazada o marcada para borrar.
    //    Solo intentamos borrar de Storage si el valor previo es un filename
    //    local (no una URL http(s) externa legada, que nunca estuvo en el bucket).
    const prevIsLocal = !!prevImgUrl && !/^https?:\/\//.test(prevImgUrl)
    if (
      uploadedImage &&
      prevIsLocal &&
      prevImgUrl !== uploadedImage.filename
    ) {
      await removeServicioImage(prevImgUrl).catch(() => {})
    }
    if (
      imageState.value.kind === 'marked-removed' &&
      prevIsLocal
    ) {
      await removeServicioImage(prevImgUrl).catch(() => {})
    }

    showToast(
      uploadedImage
        ? 'Servicio guardado. Imagen visible tras el próximo despliegue (2-5 min).'
        : editing.value
          ? 'Servicio actualizado'
          : 'Servicio creado',
    )
    modalOpen.value = false
    uploadAbortRef.value = null
    resetImageState()
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

// ── Delete modal ─────────────────────────────────────────────────────────────────
const confirmDeleteItem = ref<Servicio | null>(null)
const deleting = ref(false)

function confirmDelete(s: Servicio) {
  confirmDeleteItem.value = s
}

async function doDelete() {
  const item = confirmDeleteItem.value
  if (!item) return
  deleting.value = true
  try {
    await deleteServicio(item.id)
    servicios.value = servicios.value.filter((x) => x.id !== item.id)
    showToast('Servicio eliminado')
    confirmDeleteItem.value = null
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Error al eliminar', 'error')
  } finally {
    deleting.value = false
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
.admin-link-btn { background: none; border: none; color: var(--copper); text-decoration: underline; cursor: pointer; font-size: 0.76rem; margin-left: 6px; }
.admin-hint { font-size: 0.76rem; color: var(--text3); display: flex; align-items: center; gap: 6px; }
.admin-hint i { color: var(--copper); }
.admin-img-preview {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
  flex-shrink: 0;
  display: block;
}
.admin-img-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.admin-img-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.admin-img-preview--placeholder {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--copper-lt);
  border-radius: 8px;
  border: 1px solid var(--border);
  color: var(--copper);
  font-size: 1.2rem;
  flex-shrink: 0;
}
.admin-modal--sm {
  max-width: 460px;
}
.servicios-filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.servicios-table-card {
  padding: 0;
}
.servicios-row-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}
.servicios-check-label {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.servicios-check-input {
  width: auto;
}
</style>