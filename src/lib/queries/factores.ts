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

export async function fetchFactoresPrecioAdmin(): Promise<FactorPrecio[]> {
  const { data, error } = await getSupabase()
    .from('factores_precio')
    .select('*')
    .order('id', { ascending: true })

  if (error) throw new Error(`[factores_precio] ${error.message}`)
  return (data ?? []) as FactorPrecio[]
}

export interface FactorUpsert {
  id: string
  etiqueta: string
  descripcion?: string | null
  parametros?: FactorPrecio['parametros']
  activo?: boolean
}

export async function upsertFactor(payload: FactorUpsert): Promise<void> {
  const { error } = await getSupabase()
    .from('factores_precio')
    .upsert(payload as never)
  if (error) throw new Error(`[factores_precio] ${error.message}`)
}

export async function deleteFactor(id: string): Promise<void> {
  const { error } = await getSupabase().from('factores_precio').delete().eq('id', id)
  if (error) throw new Error(`[factores_precio] ${error.message}`)
}

export async function toggleFactorActivo(id: string, activo: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from('factores_precio')
    .update({ activo } as never)
    .eq('id', id)
  if (error) throw new Error(`[factores_precio] ${error.message}`)
}