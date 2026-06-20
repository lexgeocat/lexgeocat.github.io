import { getSupabase } from './supabase'
import type { Cotizacion, FactorPrecio, Normativa, Servicio } from '../types/supabase'

export async function fetchServiciosActivos(): Promise<Servicio[]> {
  const { data, error } = await getSupabase()
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('area', { ascending: true })
    .order('orden', { ascending: true })

  if (error) throw new Error(`[servicios] ${error.message}`)
  return data ?? []
}

export async function fetchFactoresPrecioActivos(): Promise<FactorPrecio[]> {
  const { data, error } = await getSupabase()
    .from('factores_precio')
    .select('*')
    .eq('activo', true)

  if (error) throw new Error(`[factores_precio] ${error.message}`)
  return data ?? []
}

export async function fetchNormativaActiva(): Promise<Normativa[]> {
  const { data, error } = await getSupabase()
    .from('normativa')
    .select('*')
    .eq('activo', true)
    .order('fecha_publicacion', { ascending: false })

  if (error) throw new Error(`[normativa] ${error.message}`)
  return data ?? []
}

export type CotizacionInsert = Pick<
  Cotizacion,
  'servicio_id' | 'area' | 'detalles'
> &
  Partial<
    Pick<
      Cotizacion,
      | 'nota'
      | 'rango_min'
      | 'rango_max'
      | 'multiplicador_aplicado'
      | 'extra_aplicado'
      | 'formula'
    >
  >

export async function insertCotizacion(payload: CotizacionInsert): Promise<void> {
  const { error } = await getSupabase().from('cotizaciones').insert(payload)
  if (error) throw new Error(`[cotizaciones] ${error.message}`)
}
