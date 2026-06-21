import { getSupabase } from '../supabase/client'
import type { Cotizacion } from '../../types/supabase'

export interface CotizacionInsert {
  servicio_id: string
  area: string
  detalles: Record<string, string | string[] | number>
  nota?: string
  rango_min?: number | null
  rango_max?: number | null
  multiplicador_aplicado?: number
  extra_aplicado?: number
}

export async function insertCotizacion(payload: CotizacionInsert): Promise<void> {
  const { error } = await getSupabase()
    .from('cotizaciones')
    .insert(payload as never)
  if (error) throw new Error(`[cotizaciones] ${error.message}`)
}

export async function fetchCotizacionesAdmin(): Promise<Cotizacion[]> {
  const { data, error } = await getSupabase()
    .from('cotizaciones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) throw new Error(`[cotizaciones] ${error.message}`)
  return (data ?? []) as Cotizacion[]
}

export async function setCotizacionContactado(
  id: string,
  contactado: boolean,
  notaSeguimiento?: string,
): Promise<void> {
  const payload: Record<string, unknown> = { contactado }
  if (notaSeguimiento !== undefined) payload.nota_seguimiento = notaSeguimiento
  const { error } = await getSupabase()
    .from('cotizaciones')
    .update(payload as never)
    .eq('id', id)
  if (error) throw new Error(`[cotizaciones] ${error.message}`)
}

export async function deleteCotizacion(id: string): Promise<void> {
  const { error } = await getSupabase().from('cotizaciones').delete().eq('id', id)
  if (error) throw new Error(`[cotizaciones] ${error.message}`)
}