import { getSupabase } from '../supabase/client'
import type { Normativa } from '../../types/supabase'

const BUCKET = 'normativa-pdfs'
const IMAGE_BUCKET = 'normativa-images'

export async function fetchNormativaActiva(): Promise<Normativa[]> {
  const { data, error } = await getSupabase()
    .from('normativa')
    .select('*')
    .eq('activo', true)
    .order('fecha_publicacion', { ascending: false })

  if (error) throw new Error(`[normativa] ${error.message}`)
  return (data ?? []) as Normativa[]
}

export async function fetchNormativaAdmin(): Promise<Normativa[]> {
  const { data, error } = await getSupabase()
    .from('normativa')
    .select('*')
    .order('fecha_publicacion', { ascending: false })

  if (error) throw new Error(`[normativa] ${error.message}`)
  return (data ?? []) as Normativa[]
}

export interface NormativaUpsert {
  id?: string
  titulo: string
  tipo_id: string
  estado: string
  numero_norma?: string | null
  fecha_promulgacion?: string | null
  fecha_publicacion?: string | null
  resumen?: string | null
  palabras_clave?: string[]
  archivo_url?: string | null
  archivo_path?: string | null
  archivo_nombre?: string | null
  imagen_url?: string | null
  activo?: boolean
}

export async function upsertNormativa(payload: NormativaUpsert): Promise<string> {
  const { data, error } = await getSupabase()
    .from('normativa')
    .upsert(payload as never)
    .select('id')
    .single()
  if (error) throw new Error(`[normativa] ${error.message}`)
  return (data as { id: string }).id
}

export async function deleteNormativa(id: string, archivoPath: string | null): Promise<void> {
  if (archivoPath) {
    await getSupabase().storage.from(BUCKET).remove([archivoPath])
  }
  const { error } = await getSupabase().from('normativa').delete().eq('id', id)
  if (error) throw new Error(`[normativa] ${error.message}`)
}

export async function uploadNormativaPdf(
  file: File,
  normativaId: string,
): Promise<{ url: string; path: string; nombre: string }> {
  const ext = file.name.split('.').pop() || 'pdf'
  const path = `${normativaId}/${Date.now()}.${ext}`
  const { error } = await getSupabase()
    .storage.from(BUCKET)
    .upload(path, file, { upsert: true, contentType: 'application/pdf' })
  if (error) throw new Error(`[normativa-pdfs] ${error.message}`)
  const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path, nombre: file.name }
}

export async function removeNormativaPdf(path: string): Promise<void> {
  const { error } = await getSupabase().storage.from(BUCKET).remove([path])
  if (error) throw new Error(`[normativa-pdfs] ${error.message}`)
}

/**
 * DEPRECATED — Las imágenes de portada de Normativa viven en el repo de GitHub
 * (Worker → raw-uploads/ → Action → src/assets/img/normativa/), NO en Supabase
 * Storage. Esta función quedó de una versión anterior del pipeline y ya no se
 * llama desde ningún lado. Si en el futuro se decide almacenar copias en
 * Storage, reactivar con el bucket correcto.
 *
 * Borra un archivo de imagen de portada del bucket `normativa-images`.
 */
export async function removeNormativaImage(path: string): Promise<void> {
  const { error } = await getSupabase().storage.from(IMAGE_BUCKET).remove([path])
  if (error) throw new Error(`[normativa-images] ${error.message}`)
}