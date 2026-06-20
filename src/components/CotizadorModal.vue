<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useCotizadorStore } from '../stores/cotizador'
import { insertCotizacion } from '../lib/queries'
import { toDirectImageUrl } from '../lib/image'
import {
  checkSubmission,
  generateCaptcha,
  recordSubmission,
  type CaptchaChallenge,
} from '../lib/anti-spam'
import { useFocusTrap } from '../composables/useFocusTrap'

const cot = useCotizadorStore()

const modalRef = ref<HTMLElement | null>(null)
const trap = useFocusTrap(modalRef)

const openedAt = ref(0)
const challenge = ref<CaptchaChallenge>({ question: '', answer: 0 })
const captchaInput = ref('')
const honeypot = ref('')
const submitError = ref('')
const submitting = ref(false)

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) cot.closeModal()
}

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') cot.closeModal()
}

watch(
  () => cot.open,
  (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
    if (val) {
      openedAt.value = Date.now()
      challenge.value = generateCaptcha()
      captchaInput.value = ''
      honeypot.value = ''
      submitError.value = ''
      submitting.value = false
      trap.activate()
    } else {
      trap.deactivate()
    }
  },
)

onMounted(() => document.addEventListener('keydown', onEsc))
onUnmounted(() => document.removeEventListener('keydown', onEsc))

async function saveAndNext() {
  if (!cot.step2Valid || submitting.value) return
  const svc = cot.selectedService
  if (!svc) return

  const verdict = checkSubmission({
    openedAt: openedAt.value,
    challenge: challenge.value,
    userAnswer: captchaInput.value,
    honeypot: honeypot.value,
  })
  if (!verdict.ok) {
    if (verdict.message) submitError.value = verdict.message
    challenge.value = generateCaptcha()
    captchaInput.value = ''
    return
  }

  submitting.value = true
  submitError.value = ''
  cot.goStep(3)
  const { min, max, multiplier, extra } = cot.estimate
  const detalles: Record<string, string | string[] | number> = {}
  cot.chipSelections.forEach((s) => {
    if (!detalles[s.key]) detalles[s.key] = []
    ;(detalles[s.key] as string[]).push(s.label)
  })
  Object.entries(cot.numberInputs).forEach(([k, v]) => {
    if (v > 0) detalles[k] = v
  })

  try {
    await insertCotizacion({
      servicio_id: svc.id,
      area: svc.areaKey,
      detalles,
      nota: cot.nota,
      rango_min: min,
      rango_max: max,
      multiplicador_aplicado: Math.round(multiplier * 100) / 100,
      extra_aplicado: Math.round(extra),
    })
    recordSubmission()
  } catch (e) {
    submitError.value = e instanceof Error ? e.message : 'Error al enviar la cotización.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="cot.open"
      id="cot-overlay"
      class="open"
      role="dialog"
      aria-modal="true"
      aria-label="Simulador de cotización"
      @click="onOverlayClick"
    >
      <div
        ref="modalRef"
        class="cot-modal"
      >
        <div class="cot-header">
          <div class="cot-header-left">
            <h3>
              <i
                aria-hidden="true"
                class="fa-solid fa-calculator"
                style="color: var(--copper); margin-right: 8px; font-size: 1rem"
              />
              Simulador de Cotización
            </h3>
            <p>Estimación referencial · No vinculante · Gratis</p>
          </div>
          <button
            class="cot-close"
            aria-label="Cerrar"
            @click="cot.closeModal"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-xmark"
            />
          </button>
        </div>

        <div class="cot-body">
          <div class="cot-steps">
            <div
              v-for="n in [1, 2, 3]"
              :key="n"
              :class="['cot-step', { active: cot.step === n, done: cot.step > n }]"
              :data-step="n"
            >
              <span class="cot-step-n">{{ n }}</span><br>{{ ['Servicio', 'Detalles', 'Resultado'][n - 1] }}
            </div>
          </div>

          <!-- PASO 1 -->
          <div
            v-if="cot.step === 1"
            class="cot-panel active"
          >
            <label class="cot-label">Área de servicio</label>
            <select
              v-model="cot.selectedArea"
              class="cot-select"
            >
              <option value="">
                — Selecciona un área —
              </option>
              <option value="derecho">
                Asesoría Legal / Derecho
              </option>
              <option value="catastro">
                Catastro y Registro Predial
              </option>
              <option value="ordenamiento">
                Ordenamiento Territorial
              </option>
              <option value="geografia">
                Estudios Geográficos
              </option>
              <option value="topografia">
                Topografía y Geodesia
              </option>
              <option value="geomatica">
                Geomática y SIG
              </option>
              <option value="software">
                Desarrollo de Software
              </option>
            </select>

            <template v-if="cot.selectedArea && cot.areaServices[cot.selectedArea]?.length">
              <label class="cot-label">Servicio específico</label>
              <select
                v-model="cot.selectedServiceId"
                class="cot-select"
              >
                <option value="">
                  — Selecciona un servicio —
                </option>
                <option
                  v-for="s in cot.areaServices[cot.selectedArea]"
                  :key="s.v"
                  :value="s.v"
                >
                  {{ s.l }}
                </option>
              </select>
            </template>

            <div class="cot-nav">
              <span />
              <button
                class="btn btn-gold"
                :disabled="!cot.selectedServiceId"
                @click="cot.goStep(2)"
              >
                Siguiente <i
                  aria-hidden="true"
                  class="fa-solid fa-arrow-right"
                />
              </button>
            </div>
          </div>

          <!-- PASO 2 -->
          <div
            v-if="cot.step === 2"
            class="cot-panel active"
          >
            <p style="font-size: 0.82rem; color: var(--text2); margin-bottom: 18px">
              Servicio: <strong style="color: var(--text)">{{ cot.selectedService?.label }}</strong>
            </p>

            <div
              v-if="cot.selectedService?.img_url"
              class="cot-svc-img"
              :style="{ backgroundImage: `url(${toDirectImageUrl(cot.selectedService.img_url)})` }"
            />

            <template v-if="cot.currentFactor">
              <template
                v-for="param in cot.currentFactor.parametros"
                :key="param.key"
              >
                <label class="cot-label">
                  {{ param.label }}
                  <span
                    v-if="param.requerido"
                    style="color: var(--copper)"
                  > *</span>
                </label>

                <div
                  v-if="param.tipo === 'chips' || param.tipo === 'chips_multi'"
                  class="cot-chips"
                >
                  <span
                    v-for="opt in param.opciones"
                    :key="opt.label"
                    :class="[
                      'cot-chip',
                      {
                        selected: cot.isChipSelected(param.key, opt.label),
                        'sapphire-chip': param.tipo === 'chips_multi',
                      },
                    ]"
                    @click="
                      cot.toggleChip(
                        param.key,
                        opt.label,
                        opt.multiplicador ?? 1,
                        opt.precio_extra ?? 0,
                        param.tipo === 'chips_multi',
                      )
                    "
                  >
                    {{ opt.label }}
                    <span
                      v-if="opt.multiplicador && opt.multiplicador !== 1"
                      class="cot-chip-mult"
                    >
                      {{ opt.multiplicador < 1 ? '↓' : '↑' }} ×{{ opt.multiplicador.toFixed(2) }}
                    </span>
                    <span
                      v-if="opt.precio_extra"
                      class="cot-chip-mult"
                    >+Bs {{ opt.precio_extra }}</span>
                  </span>
                </div>

                <input
                  v-if="param.tipo === 'number'"
                  type="number"
                  class="cot-input"
                  :min="param.min ?? 0"
                  :max="param.max"
                  :placeholder="param.placeholder ?? ''"
                  :value="cot.numberInputs[param.key] ?? 0"
                  @input="cot.setNumber(param.key, +($event.target as HTMLInputElement).value)"
                >
              </template>
            </template>

            <label
              class="cot-label"
              style="margin-top: 6px"
            >Detalles adicionales (opcional)</label>
            <textarea
              v-model="cot.nota"
              class="cot-input cot-textarea"
              placeholder="Describe brevemente tu caso..."
            />

            <input
              v-model="honeypot"
              type="text"
              name="website"
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
              style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0"
            >

            <label class="cot-label">Verificación anti-spam</label>
            <div
              style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"
            >
              <span style="font-family:var(--font-mono);font-size:.9rem;color:var(--text2)">
                ¿Cuánto es {{ challenge.question }}?
              </span>
              <input
                v-model="captchaInput"
                type="number"
                class="cot-input"
                style="max-width:90px"
                inputmode="numeric"
                autocomplete="off"
                required
              >
            </div>

            <div
              v-if="submitError"
              class="cot-validation-msg"
              style="color:var(--copper)"
              role="alert"
            >
              {{ submitError }}
            </div>
            <div
              v-else-if="!cot.step2Valid"
              class="cot-validation-msg"
            >
              Selecciona una opción en cada campo requerido (*)
            </div>

            <div class="cot-nav">
              <button
                class="btn btn-ghost"
                @click="cot.goStep(1)"
              >
                <i
                  aria-hidden="true"
                  class="fa-solid fa-arrow-left"
                /> Atrás
              </button>
              <button
                class="btn btn-gold"
                :disabled="!cot.step2Valid"
                @click="saveAndNext"
              >
                Ver Estimación <i
                  aria-hidden="true"
                  class="fa-solid fa-calculator"
                />
              </button>
            </div>
          </div>

          <!-- PASO 3 -->
          <div
            v-if="cot.step === 3"
            class="cot-panel active"
          >
            <div class="cot-result">
              <div class="cot-result-title">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-file-invoice"
                /> Estimación para:
                {{ cot.selectedService?.label }}
              </div>
              <div class="cot-result-row">
                <span class="cot-result-row-label">Área</span>
                <span class="cot-result-row-val">{{ cot.selectedService?.area }}</span>
              </div>
              <div class="cot-result-row">
                <span class="cot-result-row-label">Complejidad</span>
                <span class="cot-result-row-val">{{ cot.selectedService?.complexity || '—' }}</span>
              </div>
              <div class="cot-result-row">
                <span class="cot-result-row-label">Plazo estimado</span>
                <span class="cot-result-row-val">{{ cot.selectedService?.timeMin }} – {{ cot.selectedService?.timeMax }}</span>
              </div>
              <div
                v-if="cot.chipSelections.length"
                class="cot-result-row"
              >
                <span class="cot-result-row-label">Parámetros</span>
                <span
                  class="cot-result-row-val"
                  style="font-size: 0.75rem"
                >{{
                  cot.chipSelections.map((s) => s.label).join(' · ')
                }}</span>
              </div>
              <div class="cot-result-row">
                <span class="cot-result-row-label">Factor aplicado</span>
                <span
                  class="cot-result-row-val"
                  style="font-family: var(--font-mono)"
                >
                  ×{{ cot.estimate.multiplier.toFixed(2)
                  }}{{
                    cot.estimate.extra > 0 ? ` + Bs ${cot.estimate.extra.toLocaleString()}` : ''
                  }}
                </span>
              </div>
            </div>

            <div class="cot-total">
              <div>
                <div class="cot-total-label">
                  Inversión estimada
                </div>
                <div class="cot-total-note">
                  Bs bolivianos · Sujeto a consulta formal
                </div>
              </div>
              <div style="text-align: right">
                <div class="cot-total-amount">
                  Bs {{ cot.estimate.min.toLocaleString() }} –
                  {{ cot.estimate.max.toLocaleString() }}
                </div>
              </div>
            </div>

            <div class="cot-disclaimer">
              <i
                aria-hidden="true"
                class="fa-solid fa-circle-info"
              />
              <span>Estimación referencial generada automáticamente. Los valores reales pueden variar
                según la complejidad y condiciones del caso.</span>
            </div>

            <div class="cot-footer">
              <button
                class="btn btn-ghost"
                @click="cot.goStep(2)"
              >
                <i
                  aria-hidden="true"
                  class="fa-solid fa-arrow-left"
                /> Ajustar
              </button>
              <a
                class="btn btn-whatsapp"
                :href="cot.waLink"
              ><i
                aria-hidden="true"
                class="fa-brands fa-whatsapp"
              /> Solicitar cotización
                formal</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
