import { getSupabase } from '../supabase/client'
import type { Cotizacion } from '../../types/supabase'

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