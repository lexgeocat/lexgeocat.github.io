import { getSupabase } from '../supabase/client'
import type { Servicio } from '../../types/supabase'

export async function fetchServiciosActivos(): Promise<Servicio[]> {
  const { data, error } = await getSupabase()
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('area', { ascending: true })
    .order('orden', { ascending: true })

  if (error) throw new Error(`[servicios] ${error.message}`)
  return (data ?? []) as Servicio[]
}
