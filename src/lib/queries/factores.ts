import { getSupabase } from '../supabase/client'
import type { FactorPrecio } from '../../types/supabase'

export async function fetchFactoresPrecioActivos(): Promise<FactorPrecio[]> {
  const { data, error } = await getSupabase()
    .from('factores_precio')
    .select('*')
    .eq('activo', true)

  if (error) throw new Error(`[factores_precio] ${error.message}`)
  return (data ?? []) as FactorPrecio[]
}
