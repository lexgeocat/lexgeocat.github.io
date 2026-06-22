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
              v-for="n in filtered"
              :key="n.id"
            >
              <td><strong>{{ n.titulo }}</strong></td>
              <td>
                <span
                  v-if="taxonomia.grupoDeTipo(n.tipo_id)"
                  class="admin-hint"
                  style="margin-right:6px"
                >
                  {{ taxonomia.grupoDeTipo(n.tipo_id)?.numeral }}
                </span>
                {{ taxonomia.nombreTipo(n.tipo_id) }}
              </td>
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
              Imagen de portada
              <input
                id="normativa-imagen-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                @change="onImagenSelect"
              >
            </label>
            <p
              v-if="imagenPreview"
              class="admin-hint"
              style="align-items:flex-start"
            >
              <img
                :src="imagenPreview"
                alt="Previsualización"
                class="admin-img-preview"
              >
              <span style="flex:1;min-width:0;word-break:break-all">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-image"
                /> {{ imagenNombre }}
                <span
                  v-if="imagenSubiendo"
                  class="admin-hint"
                  style="display:block;margin-top:4px"
                >
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-spinner fa-spin"
                  /> Subiendo al Worker…
                </span>
                <span
                  v-else-if="imagenPendiente"
                  class="admin-hint"
                  style="display:block;margin-top:4px;color:var(--copper)"
                >
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-clock"
                  /> Imagen en proceso, estará disponible en el próximo despliegue (2-5 min).
                </span>
                <button
                  v-if="!imagenSubiendo"
                  type="button"
                  class="admin-link-btn"
                  @click="removeImagen"
                >
                  Quitar
                </button>
              </span>
            </p>
            <p
              v-else-if="form.imagen_url"
              class="admin-hint"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-image"
              /> Imagen guardada:
              <code>{{ form.imagen_url }}</code>
              <span
                v-if="!resolveNormativaImageUrl(form.imagen_url)"
                class="admin-hint"
                style="display:block;margin-top:4px;color:var(--copper)"
              >
                <i
                  aria-hidden="true"
                  class="fa-solid fa-clock"
                /> Aún no procesada (en raw-uploads). Estará disponible tras el próximo despliegue.
              </span>
              <button
                type="button"
                class="admin-link-btn"
                @click="removeImagen"
              >
                Quitar
              </button>
            </p>
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
import { getSupabase } from '../../lib/supabase/client'
import { SITE } from '../../config/site'
import { resolveNormativaImageUrl } from '../../lib/normativaImage'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const

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
const keywordsInput = ref('')
const pendingFile = ref<File | null>(null)
const toast = ref<{ msg: string; type: 'ok' | 'error' } | null>(null)

const pendingImage = ref<File | null>(null)
const imagenPreview = ref<string | null>(null)
const imagenNombre = ref('')
const imagenSubiendo = ref(false)
const imagenPendiente = ref(false)

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

const filtered = computed(() =>
  normas.value.filter((n) => {
    if (filterGrupoId.value) {
      const grupo = taxonomia.grupoDeTipo(n.tipo_id)
      if (!grupo || grupo.id !== filterGrupoId.value) return false
    }
    if (filterTipoId.value && n.tipo_id !== filterTipoId.value) return false
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

async function loadAll() {
  await Promise.all([load(), taxonomia.load()])
}

function openCreate() {
  editing.value = null
  form.value = emptyForm()
  keywordsInput.value = ''
  pendingFile.value = null
  pendingImage.value = null
  clearImagePreview()
  formError.value = ''
  modalOpen.value = true
}

function openEdit(n: Normativa) {
  editing.value = n
  form.value = { ...n }
  keywordsInput.value = (n.palabras_clave || []).join(', ')
  pendingFile.value = null
  pendingImage.value = null
  clearImagePreview()
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  pendingImage.value = null
  clearImagePreview()
}

onBeforeUnmount(() => {
  clearImagePreview()
})

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  pendingFile.value = file ?? null
}

function clearImagePreview() {
  if (imagenPreview.value) URL.revokeObjectURL(imagenPreview.value)
  imagenPreview.value = null
  imagenNombre.value = ''
  imagenPendiente.value = false
}

function onImagenSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    pendingImage.value = null
    clearImagePreview()
    input.value = ''
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
  clearImagePreview()
  pendingImage.value = file
  imagenPreview.value = URL.createObjectURL(file)
  imagenNombre.value = file.name
  imagenPendiente.value = false
}

function removeImagen() {
  pendingImage.value = null
  clearImagePreview()
  form.value.imagen_url = null
  const input = document.getElementById('normativa-imagen-input') as HTMLInputElement | null
  if (input) input.value = ''
}

async function uploadNormativaImage(file: File): Promise<{ filename: string }> {
  const { data: sessionData } = await getSupabase().auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Sesión expirada. Vuelve a iniciar sesión.')

  const fd = new FormData()
  fd.append('file', file)
  fd.append('destino', 'normativa')

  const res = await fetch(`${SITE.worker}/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })

  let payload: { ok?: boolean; expectedPath?: string; rawPath?: string; error?: string } = {}
  try {
    payload = (await res.json()) as typeof payload
  } catch {
    // respuesta no-JSON
  }

  if (!res.ok || !payload.ok || !payload.expectedPath) {
    const msg = payload.error || `Error ${res.status} al subir la imagen.`
    throw new Error(msg)
  }

  const filename = payload.expectedPath.split('/').pop()
  if (!filename) throw new Error('Respuesta inválida del Worker (sin expectedPath).')
  return { filename }
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
  if (!form.value.titulo || !form.value.tipo_id || !form.value.estado) {
    formError.value = 'Completa título, tipo de norma y estado.'
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
        tipo_id: form.value.tipo_id!,
        estado: form.value.estado!,
        archivo_url: uploaded.url,
        archivo_path: uploaded.path,
        archivo_nombre: uploaded.nombre,
      } as Normativa)
    }

    if (pendingImage.value) {
      imagenSubiendo.value = true
      try {
        const { filename } = await uploadNormativaImage(pendingImage.value)
        await upsertNormativa({
          id,
          titulo: form.value.titulo!,
          tipo_id: form.value.tipo_id!,
          estado: form.value.estado!,
          imagen_url: filename,
        } as Normativa)
        form.value.imagen_url = filename
        imagenPendiente.value = true
        clearImagePreview()
        pendingImage.value = null
        showToast('Imagen recibida. Estará visible tras el próximo despliegue (2-5 min).')
      } finally {
        imagenSubiendo.value = false
      }
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

loadAll()
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
.admin-img-preview {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
  flex-shrink: 0;
  display: block;
}
</style>