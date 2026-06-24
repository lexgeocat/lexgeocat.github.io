import { getSupabase } from '../../lib/supabase/client'
import { SITE } from '../../config/site'

/** Tamaño máximo permitido para imágenes de portada (8 MB). */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024

/** Tipos MIME aceptados para imágenes de portada. */
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const

export type ImageDestino = 'normativa' | 'servicios'

export interface UploadImageResult {
  /** Nombre de archivo final (sin carpeta), tal como se almacena en BD. */
  filename: string
}

/**
 * Sube una imagen al Worker de Cloudflare pasándole solo el destino.
 * El Worker se encarga de:
 *  1. Validar el destino contra su lista blanca interna.
 *  2. Commitear el archivo a `raw-uploads/<destino>/<timestamp>-<safeName>.<ext>` en GitHub.
 *  3. Devolver el `expectedPath` (carpeta + filename) que el admin guarda en BD.
 *
 * El Action `process-images.yml` recoge el commit y produce la versión WebP final
 * en `src/assets/img/<destino>/<slug>.webp` durante el próximo deploy.
 */
export async function uploadAdminImage(
  file: File,
  destino: ImageDestino,
): Promise<UploadImageResult> {
  const { data: sessionData } = await getSupabase().auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Sesión expirada. Vuelve a iniciar sesión.')

  const fd = new FormData()
  fd.append('file', file)
  fd.append('destino', destino)

  const res = await fetch(`${SITE.worker}/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })

  let payload: { ok?: boolean; expectedPath?: string; error?: string } = {}
  try {
    payload = (await res.json()) as typeof payload
  } catch {
    // respuesta no-JSON; mantenemos el payload vacío
  }

  if (!res.ok || !payload.ok || !payload.expectedPath) {
    const msg = payload.error || `Error ${res.status} al subir la imagen.`
    throw new Error(msg)
  }

  const filename = payload.expectedPath.split('/').pop()
  if (!filename) throw new Error('Respuesta inválida del Worker (sin expectedPath).')
  return { filename }
}
