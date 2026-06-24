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

export async function fetchServiciosAdmin(): Promise<Servicio[]> {
  const { data, error } = await getSupabase()
    .from('servicios')
    .select('*')
    .order('area', { ascending: true })
    .order('orden', { ascending: true })

  if (error) throw new Error(`[servicios] ${error.message}`)
  return (data ?? []) as Servicio[]
}

export interface ServicioUpsert {
  id: string
  area: string
  label: string
  categoria: string
  descripcion?: string | null
  tags?: string[]
  img_url?: string | null
  precio_min?: number
  precio_max?: number
  tiempo_min?: string | null
  tiempo_max?: string | null
  complejidad?: string | null
  details_type?: string
  unit_label?: string | null
  orden?: number
  activo?: boolean
}

export async function upsertServicio(payload: ServicioUpsert): Promise<void> {
  const { error } = await getSupabase()
    .from('servicios')
    .upsert(payload as never)
  if (error) throw new Error(`[servicios] ${error.message}`)
}

export async function deleteServicio(id: string): Promise<void> {
  const { error } = await getSupabase().from('servicios').delete().eq('id', id)
  if (error) throw new Error(`[servicios] ${error.message}`)
}

export async function toggleServicioActivo(id: string, activo: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from('servicios')
    .update({ activo } as never)
    .eq('id', id)
  if (error) throw new Error(`[servicios] ${error.message}`)
}

const IMAGE_BUCKET = 'servicios-images'

/**
 * DEPRECATED — Las imágenes de portada de Servicios viven en el repo de GitHub
 * (Worker → raw-uploads/ → Action → src/assets/img/servicios/), NO en Supabase
 * Storage. Esta función quedó de una versión anterior del pipeline y ya no se
 * llama desde ningún lado. Si en el futuro se decide almacenar copias en
 * Storage, reactivar con el bucket correcto.
 *
 * Borra un archivo de imagen del bucket `servicios-images`.
 */
export async function removeServicioImage(path: string): Promise<void> {
  const { error } = await getSupabase().storage.from(IMAGE_BUCKET).remove([path])
  if (error) throw new Error(`[servicios-images] ${error.message}`)
}