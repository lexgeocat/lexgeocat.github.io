import { fetchFactoresPrecioActivos, fetchServiciosActivos } from '../../lib/queries'
import type { CotService } from '../cotizador/store'
import type { FactorPrecio, Servicio } from '../../types/supabase'

export interface CategorySpec {
  icon: string
  color: string
  subtitle: string
}

export const CAT_CONFIG: Record<string, CategorySpec> = {
  'Derecho Civil': {
    icon: 'fa-handshake',
    color: 'var(--copper)',
    subtitle: 'Contratos, propiedad, familia y sucesiones',
  },
  'Derecho Agrario': {
    icon: 'fa-seedling',
    color: '#3a5e3a',
    subtitle: 'Tierra, INRA y comunidades',
  },
  'Derecho Minero': {
    icon: 'fa-gem',
    color: '#c8660c',
    subtitle: 'Concesiones, recursos y sociedades',
  },
  'Derecho Corporativo': {
    icon: 'fa-building',
    color: '#c8660c',
    subtitle: 'Sociedades, registros y compliance',
  },
  Catastro: {
    icon: 'fa-draw-polygon',
    color: 'var(--sapphire)',
    subtitle: 'Campo, fichas prediales y diagnóstico',
  },
  Topografía: {
    icon: 'fa-ruler-combined',
    color: '#c8660c',
    subtitle: 'Campo, procesamiento y cartografía',
  },
  'Topografía / Geodesia': {
    icon: 'fa-satellite',
    color: '#c8660c',
    subtitle: 'GNSS, control altimétrico y SIRGAS-BOL',
  },
  Geomática: {
    icon: 'fa-map',
    color: '#3a5e3a',
    subtitle: 'Análisis espacial y visualización',
  },
  'Geomática / Teledetección': {
    icon: 'fa-satellite-dish',
    color: '#3a5e3a',
    subtitle: 'Imágenes Sentinel, Landsat y NDVI',
  },
  'Geomática / Software': {
    icon: 'fa-code',
    color: '#3a5e3a',
    subtitle: 'Python, GeoPandas y automatización GIS',
  },
  Software: {
    icon: 'fa-globe',
    color: '#7c6fc8',
    subtitle: 'Frontend, backend y geoespacial',
  },
  'Software / Geomática': {
    icon: 'fa-map-location-dot',
    color: '#7c6fc8',
    subtitle: 'Visores GIS y aplicaciones web',
  },
  'Software / GIS': {
    icon: 'fa-map-location-dot',
    color: '#7c6fc8',
    subtitle: 'Visores GIS y aplicaciones web',
  },
}

export const AREA_KEYS = [
  'derecho',
  'catastro',
  'ordenamiento',
  'geografia',
  'topografia',
  'geomatica',
  'software',
] as const

export interface ServiceItem {
  v: string
  l: string
  descripcion: string
  tags: string[]
  img_url: string
}

export interface CatalogShape {
  cotData: Record<string, CotService>
  areaServices: Record<string, { v: string; l: string }[]>
  categoriaServices: Record<string, Record<string, ServiceItem[]>>
}

export function escHtml(s: unknown): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
}

export function toggleSpec(el: Element) {
  const body = el.nextElementSibling
  if (!body) return
  if (el.classList.contains('open')) {
    el.classList.remove('open')
    body.classList.remove('open')
  } else {
    el.classList.add('open')
    body.classList.add('open')
  }
}

function buildCatalog(rows: Servicio[]): CatalogShape {
  const cotData: Record<string, CotService> = {}
  const areaServices: Record<string, { v: string; l: string }[]> = {}
  const categoriaServices: Record<string, Record<string, ServiceItem[]>> = {}

  rows.forEach((r) => {
    if (!r.activo) return
    cotData[r.id] = {
      id: r.id,
      label: r.label,
      descripcion: r.descripcion || '',
      tags: r.tags || [],
      img_url: r.img_url || '',
      area: r.area,
      areaKey: r.area,
      categoria: r.categoria || '',
      baseMin: Number(r.precio_min) || 0,
      baseMax: Number(r.precio_max) || 0,
      timeMin: r.tiempo_min || '',
      timeMax: r.tiempo_max || '',
      complexity: r.complejidad || '',
      detailsType: r.details_type || 'general',
    }
    if (!areaServices[r.area]) areaServices[r.area] = []
    areaServices[r.area]!.push({ v: r.id, l: r.label })
    const cat = r.categoria || 'General'
    if (!categoriaServices[r.area]) categoriaServices[r.area] = {}
    if (!categoriaServices[r.area]![cat]) categoriaServices[r.area]![cat] = []
    categoriaServices[r.area]![cat]!.push({
      v: r.id,
      l: r.label,
      descripcion: r.descripcion || '',
      tags: r.tags || [],
      img_url: r.img_url || '',
    })
  })

  return { cotData, areaServices, categoriaServices }
}

export async function loadServiciosCatalog(): Promise<CatalogShape> {
  const rows = await fetchServiciosActivos()
  return buildCatalog(rows)
}

export async function loadFactoresPrecio(): Promise<FactorPrecio[]> {
  return fetchFactoresPrecioActivos() as Promise<FactorPrecio[]>
}
