<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useCotizadorStore } from '../stores/cotizador'
import { useSupabase } from '../lib/supabase'

const cot = useCotizadorStore()
const { supabase } = useSupabase()

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) cot.closeModal()
}

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') cot.closeModal()
}

watch(() => cot.open, val => {
  document.body.style.overflow = val ? 'hidden' : ''
})

onMounted(() => document.addEventListener('keydown', onEsc))
onUnmounted(() => document.removeEventListener('keydown', onEsc))

function toDirectImageUrl(url: string) {
  if (!url) return ''
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  return m ? 'https://drive.google.com/uc?id=' + m[1] : url
}

async function saveAndNext() {
  if (!cot.step2Valid) return
  const svc = cot.selectedService
  if (!svc) return
  cot.goStep(3)
  const { min, max, multiplier, extra } = cot.estimate
  const detalles: Record<string, string | string[] | number> = {}
  cot.chipSelections.forEach(s => {
    if (!detalles[s.key]) detalles[s.key] = []
    ;(detalles[s.key] as string[]).push(s.label)
  })
  Object.entries(cot.numberInputs).forEach(([k, v]) => { if (v > 0) detalles[k] = v })

  try {
    await supabase.from('cotizaciones').insert({
      servicio_id: svc.id,
      area: svc.areaKey,
      detalles,
      nota: cot.nota,
      rango_min: min,
      rango_max: max,
      multiplicador_aplicado: Math.round(multiplier * 100) / 100,
      extra_aplicado: Math.round(extra),
    })
  } catch {}
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
      <div class="cot-modal">
        <div class="cot-header">
          <div class="cot-header-left">
            <h3>
              <i
                class="fa-solid fa-calculator"
                style="color:var(--copper);margin-right:8px;font-size:1rem"
              /> Simulador de Cotización
            </h3>
            <p>Estimación referencial · No vinculante · Gratis</p>
          </div>
          <button
            class="cot-close"
            aria-label="Cerrar"
            @click="cot.closeModal"
          >
            <i class="fa-solid fa-xmark" />
          </button>
        </div>

        <div class="cot-body">
          <div class="cot-steps">
            <div
              v-for="n in [1,2,3]"
              :key="n"
              :class="['cot-step', { active: cot.step === n, done: cot.step > n }]"
              :data-step="n"
            >
              <span class="cot-step-n">{{ n }}</span><br>{{ ['Servicio','Detalles','Resultado'][n-1] }}
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
                Siguiente <i class="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>

          <!-- PASO 2 -->
          <div
            v-if="cot.step === 2"
            class="cot-panel active"
          >
            <p style="font-size:.82rem;color:var(--text2);margin-bottom:18px">
              Servicio: <strong style="color:var(--text)">{{ cot.selectedService?.label }}</strong>
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
                    style="color:var(--copper)"
                  > *</span>
                </label>

                <div
                  v-if="param.tipo === 'chips' || param.tipo === 'chips_multi'"
                  class="cot-chips"
                >
                  <span
                    v-for="opt in param.opciones"
                    :key="opt.label"
                    :class="['cot-chip', { selected: cot.isChipSelected(param.key, opt.label), 'sapphire-chip': param.tipo === 'chips_multi' }]"
                    @click="cot.toggleChip(param.key, opt.label, opt.multiplicador ?? 1, opt.precio_extra ?? 0, param.tipo === 'chips_multi')"
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
              style="margin-top:6px"
            >Detalles adicionales (opcional)</label>
            <textarea
              v-model="cot.nota"
              class="cot-input cot-textarea"
              placeholder="Describe brevemente tu caso..."
            />

            <div
              v-if="!cot.step2Valid"
              class="cot-validation-msg"
            >
              Selecciona una opción en cada campo requerido (*)
            </div>

            <div class="cot-nav">
              <button
                class="btn btn-ghost"
                @click="cot.goStep(1)"
              >
                <i class="fa-solid fa-arrow-left" /> Atrás
              </button>
              <button
                class="btn btn-gold"
                :disabled="!cot.step2Valid"
                @click="saveAndNext"
              >
                Ver Estimación <i class="fa-solid fa-calculator" />
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
                <i class="fa-solid fa-file-invoice" /> Estimación para: {{ cot.selectedService?.label }}
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
                  style="font-size:.75rem"
                >{{ cot.chipSelections.map(s => s.label).join(' · ') }}</span>
              </div>
              <div class="cot-result-row">
                <span class="cot-result-row-label">Factor aplicado</span>
                <span
                  class="cot-result-row-val"
                  style="font-family:var(--font-mono)"
                >
                  ×{{ cot.estimate.multiplier.toFixed(2) }}{{ cot.estimate.extra > 0 ? ` + Bs ${cot.estimate.extra.toLocaleString()}` : '' }}
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
              <div style="text-align:right">
                <div class="cot-total-amount">
                  Bs {{ cot.estimate.min.toLocaleString() }} – {{ cot.estimate.max.toLocaleString() }}
                </div>
              </div>
            </div>

            <div class="cot-disclaimer">
              <i class="fa-solid fa-circle-info" />
              <span>Estimación referencial generada automáticamente. Los valores reales pueden variar según la complejidad y condiciones del caso.</span>
            </div>

            <div class="cot-footer">
              <button
                class="btn btn-ghost"
                @click="cot.goStep(2)"
              >
                <i class="fa-solid fa-arrow-left" /> Ajustar
              </button>
              <a
                class="btn btn-whatsapp"
                :href="cot.waLink"
              ><i class="fa-brands fa-whatsapp" /> Solicitar cotización formal</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>