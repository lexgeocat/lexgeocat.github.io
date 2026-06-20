import { ref } from 'vue'

const WORKER_BASE = 'https://stats.lexgeocat.workers.dev'
export const FLAG_CDN = 'https://flagcdn.com/16x12/'
const MAX_FLAGS = 6

const COUNTRY_ES: Record<string, string> = {
  BO: 'Bolivia',
  AR: 'Argentina',
  CL: 'Chile',
  PE: 'Perú',
  CO: 'Colombia',
  MX: 'México',
  ES: 'España',
  US: 'Estados Unidos',
  BR: 'Brasil',
  EC: 'Ecuador',
  PY: 'Paraguay',
  UY: 'Uruguay',
  VE: 'Venezuela',
  PA: 'Panamá',
  CR: 'Costa Rica',
  GT: 'Guatemala',
  HN: 'Honduras',
  SV: 'El Salvador',
  NI: 'Nicaragua',
  CU: 'Cuba',
  DO: 'Rep. Dominicana',
  PR: 'Puerto Rico',
  DE: 'Alemania',
  FR: 'Francia',
  IT: 'Italia',
  GB: 'Reino Unido',
  PT: 'Portugal',
  NL: 'Países Bajos',
  RU: 'Rusia',
  CN: 'China',
  JP: 'Japón',
  KR: 'Corea del Sur',
  IN: 'India',
  AU: 'Australia',
  CA: 'Canadá',
  ZA: 'Sudáfrica',
  NG: 'Nigeria',
  EG: 'Egipto',
  SG: 'Singapur',
  CH: 'Suiza',
  SE: 'Suecia',
  NO: 'Noruega',
  DK: 'Dinamarca',
  FI: 'Finlandia',
  PL: 'Polonia',
  CZ: 'Rep. Checa',
  AT: 'Austria',
  BE: 'Bélgica',
  TR: 'Turquía',
  IL: 'Israel',
  UA: 'Ucrania',
  TH: 'Tailandia',
  ID: 'Indonesia',
}

interface LocationStat {
  code: string
  count: number
  name: string
}

const totalViews = ref(0)
const locations = ref<LocationStat[]>([])
const loaded = ref(false)

async function apiFetch<T>(path: string): Promise<T | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(WORKER_BASE + path, { cache: 'no-store', signal: controller.signal })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return await res.json()
  } catch (e: unknown) {
    const isAbort = e instanceof Error && e.name === 'AbortError'
    if (!isAbort) {
      const message = e instanceof Error ? e.message : String(e)
      console.warn('[GC]', message)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export function useGoatCounter() {
  async function load() {
    if (loaded.value) return
    loaded.value = true

    const totalData = await apiFetch<{ total: number }>('/total')
    if (totalData && typeof totalData.total === 'number') {
      totalViews.value = totalData.total
    }

    const locData = await apiFetch<{ stats: { id: string; count: number }[] }>('/locations')
    if (locData?.stats?.length) {
      const shown: LocationStat[] = []
      for (const loc of locData.stats) {
        if (shown.length >= MAX_FLAGS) break
        const raw = (loc.id || '').toUpperCase()
        const code = raw.slice(0, 2)
        if (!/^[A-Z]{2}$/.test(code)) continue
        shown.push({
          code: code.toLowerCase(),
          count: loc.count || 0,
          name: COUNTRY_ES[code] || code,
        })
      }
      locations.value = shown
    }
  }

  return { totalViews, locations, load }
}
