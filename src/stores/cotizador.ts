import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SITE } from '../config/site'
import type { FactorPrecio, FactorParam } from '../types/supabase'

export type { FactorParam }
export type Factor = FactorPrecio

export interface CotService {
  id: string
  label: string
  descripcion: string
  tags: string[]
  img_url: string
  area: string
  areaKey: string
  categoria: string
  baseMin: number
  baseMax: number
  timeMin: string
  timeMax: string
  complexity: string
  detailsType: string
  unit_label?: string
}
export interface ChipSelection {
  key: string
  label: string
  multiplicador: number
  extra: number
}

export const useCotizadorStore = defineStore('cotizador', () => {
  const open = ref(false)
  const step = ref(1)

  const catalog = ref<Record<string, CotService>>({})
  const areaServices = ref<Record<string, { v: string; l: string }[]>>({})
  const factores = ref<Record<string, Factor>>({})
  const catalogLoaded = ref(false)

  const selectedArea = ref('')
  const selectedServiceId = ref('')
  const chipSelections = ref<ChipSelection[]>([])
  const numberInputs = ref<Record<string, number>>({})
  const nota = ref('')

  const selectedService = computed<CotService | null>(() =>
    selectedServiceId.value ? catalog.value[selectedServiceId.value] ?? null : null
  )

  const currentFactor = computed<Factor | null>(() => {
    const dt = selectedService.value?.detailsType ?? 'general'
    return factores.value[dt] ?? factores.value['general'] ?? null
  })

  const requiredKeys = computed<string[]>(() =>
    (currentFactor.value?.parametros ?? [])
      .filter((p: FactorParam) => p.tipo === 'chips' && p.requerido)
      .map((p: FactorParam) => p.key)
  )

  const step2Valid = computed(() =>
    requiredKeys.value.every(k => chipSelections.value.some(s => s.key === k))
  )

  const estimate = computed(() => {
    const svc = selectedService.value
    if (!svc) return { min: 0, max: 0, multiplier: 1, extra: 0 }
    let mult = 1
    let extra = 0
    chipSelections.value.forEach(s => { mult *= s.multiplicador; extra += s.extra })
    Object.entries(numberInputs.value).forEach(([k, v]) => {
      const param = currentFactor.value?.parametros.find((p: FactorParam) => p.key === k)
      if (param?.precio_unit && v > 0) extra += v * param.precio_unit
    })
    const min = Math.round((svc.baseMin * mult + extra) / 50) * 50
    const max = Math.round((svc.baseMax * mult + extra) / 50) * 50
    return { min, max, multiplier: mult, extra }
  })

  const waLink = computed(() => {
    const svc = selectedService.value
    if (!svc) return `https://wa.me/${SITE.whatsappNumber}`
    const parts = chipSelections.value.map(s => s.label)
    let msg = `Hola, me interesa el servicio de *${svc.label}*. `
    if (parts.length) msg += `Parámetros: ${parts.join(', ')}. `
    if (nota.value) msg += `Nota: ${nota.value}. `
    msg += '¿Podría obtener una cotización formal?'
    return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`
  })

  function openModal(serviceId?: string) {
    reset()
    open.value = true
    if (serviceId && catalog.value[serviceId]) {
      const svc = catalog.value[serviceId]
      selectedArea.value = svc.areaKey
      selectedServiceId.value = serviceId
      step.value = 2
    }
  }

  function closeModal() {
    open.value = false
    document.body.style.overflow = ''
  }

  function reset() {
    step.value = 1
    selectedArea.value = ''
    selectedServiceId.value = ''
    chipSelections.value = []
    numberInputs.value = {}
    nota.value = ''
  }

  function toggleChip(key: string, label: string, multiplicador: number, extra: number, isMulti: boolean) {
    if (isMulti) {
      const idx = chipSelections.value.findIndex(s => s.key === key && s.label === label)
      if (idx >= 0) chipSelections.value.splice(idx, 1)
      else chipSelections.value.push({ key, label, multiplicador, extra })
    } else {
      const filtered = chipSelections.value.filter(s => s.key !== key)
      filtered.push({ key, label, multiplicador, extra })
      chipSelections.value = filtered
    }
  }

  function isChipSelected(key: string, label: string) {
    return chipSelections.value.some(s => s.key === key && s.label === label)
  }

  function setNumber(key: string, value: number) {
    numberInputs.value[key] = value
  }

  function goStep(n: number) { step.value = n }

  return {
    open, step, catalog, areaServices, factores, catalogLoaded,
    selectedArea, selectedServiceId, chipSelections, numberInputs, nota,
    selectedService, currentFactor, requiredKeys, step2Valid, estimate, waLink,
    openModal, closeModal, reset, toggleChip, isChipSelected, setNumber, goStep,
  }
})