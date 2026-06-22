import { getSupabase } from '../supabase/client'
import type { NormativaGrupo, NormativaTipo } from '../../types/supabase'

export async function fetchNormativaGrupos(): Promise<NormativaGrupo[]> {
  const { data, error } = await getSupabase()
    .from('normativa_grupos')
    .select('*')
    .order('orden', { ascending: true })
  if (error) throw new Error(`[normativa_grupos] ${error.message}`)
  return (data ?? []) as NormativaGrupo[]
}

export async function fetchNormativaTipos(): Promise<NormativaTipo[]> {
  const { data, error } = await getSupabase()
    .from('normativa_tipos')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })
  if (error) throw new Error(`[normativa_tipos] ${error.message}`)
  return (data ?? []) as NormativaTipo[]
}

export async function fetchNormativaTiposAdmin(): Promise<NormativaTipo[]> {
  const { data, error } = await getSupabase()
    .from('normativa_tipos')
    .select('*')
    .order('orden', { ascending: true })
  if (error) throw new Error(`[normativa_tipos] ${error.message}`)
  return (data ?? []) as NormativaTipo[]
}
