export interface FactorOpcion {
  label: string
  multiplicador?: number
  precio_extra?: number
  ayuda?: string
}

export interface FactorParam {
  key: string
  label: string
  tipo: 'chips' | 'chips_multi' | 'number'
  requerido?: boolean
  min?: number
  max?: number
  placeholder?: string
  precio_unit?: number
  opciones?: FactorOpcion[]
}

export interface FactorPrecio {
  id: string
  etiqueta: string
  descripcion: string | null
  parametros: FactorParam[]
  activo: boolean
  created_at: string
}

export interface Servicio {
  id: string
  area: string
  label: string
  categoria: string
  descripcion: string | null
  tags: string[]
  img_url: string | null
  precio_min: number
  precio_max: number
  tiempo_min: string | null
  tiempo_max: string | null
  complejidad: string | null
  details_type: string
  unit_label: string | null
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Cotizacion {
  id: string
  servicio_id: string
  area: string
  detalles: Record<string, string | string[] | number>
  nota: string
  rango_min: number | null
  rango_max: number | null
  multiplicador_aplicado: number
  extra_aplicado: number
  formula: string | null
  created_at: string
  contactado: boolean
  nota_seguimiento: string | null
}

export interface NormativaGrupo {
  id: string
  numeral: string
  nombre: string
  orden: number
  created_at: string
}

export interface NormativaTipo {
  id: string
  grupo_id: string
  numero: number
  nombre: string
  orden: number
  activo: boolean
  created_at: string
}

export interface Normativa {
  id: string
  titulo: string
  tipo_id: string
  numero_norma: string | null
  fecha_promulgacion: string | null
  fecha_publicacion: string | null
  estado: string
  activo: boolean
  resumen: string | null
  palabras_clave: string[]
  archivo_url: string | null
  archivo_path: string | null
  archivo_nombre: string | null
  imagen_url: string | null
  created_at: string
  updated_at: string
}
