import { getSupabase } from '../supabase/client'
import type { Normativa } from '../../types/supabase'

export async function fetchNormativaActiva(): Promise<Normativa[]> {
  const { data, error } = await getSupabase()
    .from('normativa')
    .select('*')
    .eq('activo', true)
    .order('fecha_publicacion', { ascending: false })

  if (error) throw new Error(`[normativa] ${error.message}`)
  return data ?? []
}
