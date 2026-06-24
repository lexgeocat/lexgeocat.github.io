/**
 * Cloudflare Worker — GoatCounter stats proxy + Upload de imágenes (Normativa, Servicios)
 * Optimizado: caché por KV/Cache API, manejo de errores robusto, CORS preflight
 * Multi-sitio: usa ?site= para seleccionar el subdominio de GoatCounter
 *
 * ── Secrets requeridos (wrangler secret put <NOMBRE>) ──────────────────────
 *   GC_TOKEN            → token de API de GoatCounter (ya existía)
 *   GITHUB_TOKEN         → fine-grained PAT, solo repo lexgeocat.github.io,
 *                          permiso "Contents: Read and write"
 *   SUPABASE_URL         → URL del proyecto Supabase (texto plano, es pública)
 *   SUPABASE_ANON_KEY     → anon key de Supabase (texto plano, es pública)
 * ────────────────────────────────────────────────────────────────────────────
 */

const CACHE_TTL = 300; // segundos (5 min)

// Sitios permitidos → subdominio de GoatCounter
const ALLOWED_SITES = {
  'main': 'lexgeocat',
  'blog': 'lexgeocatblog',
};

const ROUTES = {
  '/total':     '/stats/total',
  '/locations': '/stats/locations',
  '/popular':   '/stats/hits',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GITHUB_OWNER = 'lexgeocat';
const GITHUB_REPO = 'lexgeocat.github.io';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_DESTINOS = new Set(['normativa', 'servicios']);

function jsonResponse(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extra,
    },
  });
}

async function fetchFromGoatCounter(subdomain, endpoint, token) {
  const base     = `https://${subdomain}.goatcounter.com/api/v0`;
  const upstream = await fetch(`${base}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    // Cloudflare respeta cf.cacheTtl para subrequests
    cf: { cacheTtl: CACHE_TTL, cacheEverything: true },
  });

  if (!upstream.ok) {
    throw new Error(`GoatCounter respondió ${upstream.status}`);
  }

  return upstream.json();
}

// ── Helpers de subida de imágenes ─────────────────────────────────────────

/**
 * Valida magic bytes del contenido real para evitar archivos falseados.
 * Retorna el tipo MIME detectado, o null si no coincide con PNG/JPEG/WebP.
 */
function detectImageType(buffer) {
  const bytes = new Uint8Array(buffer.slice(0, 12));

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 &&
    bytes[2] === 0x4E && bytes[3] === 0x47 &&
    bytes[4] === 0x0D && bytes[5] === 0x0A &&
    bytes[6] === 0x1A && bytes[7] === 0x0A
  ) {
    return 'image/png';
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }

  // WebP: RIFF (4 bytes) + file size (4 bytes) + WEBP (4 bytes)
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 &&
    bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 &&
    bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

function sanitizeFilename(name) {
  const lastDot = name.lastIndexOf('.');
  const base = lastDot > 0 ? name.slice(0, lastDot) : name;
  const ext = lastDot > 0 ? name.slice(lastDot) : '';
  const cleanBase = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  const cleanExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, '');
  return `${cleanBase}${cleanExt}`;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function validateSupabaseSession(authHeader, env) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const jwt = authHeader.slice('Bearer '.length).trim();
  if (!jwt) return null;

  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        apikey: env.SUPABASE_ANON_KEY,
      },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user?.id ? user : null;
  } catch (err) {
    console.error('[upload-image] Error validando sesión Supabase', err.message);
    return null;
  }
}

async function handleImageUpload(request, env) {
  if (!env.GITHUB_TOKEN || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.error('[upload-image] Faltan secrets requeridos');
    return jsonResponse({ error: 'Configuración incompleta' }, 500);
  }

  const authHeader = request.headers.get('Authorization');
  const user = await validateSupabaseSession(authHeader, env);
  if (!user) {
    return jsonResponse({ error: 'No autorizado' }, 401);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: 'Cuerpo de solicitud inválido (se esperaba FormData)' }, 400);
  }

  const file = formData.get('file');
  const destinoRaw = formData.get('destino');
  const destino = ALLOWED_DESTINOS.has(destinoRaw) ? destinoRaw : 'normativa';

  if (!file || typeof file === 'string') {
    return jsonResponse({ error: 'No se recibió ningún archivo' }, 400);
  }

  // ── Validación por tamaño (antes de leer el buffer) ──────────────
  if (file.size > MAX_UPLOAD_BYTES) {
    return jsonResponse(
      { error: `Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo 8 MB.` },
      400,
    );
  }

  // ── Leer buffer una sola vez y validar por magic bytes ───────────
  let buffer;
  try {
    buffer = await file.arrayBuffer();
  } catch (err) {
    console.error('[upload-image] Error leyendo archivo', err.message);
    return jsonResponse({ error: 'No se pudo leer el archivo' }, 500);
  }

  const detectedType = detectImageType(buffer);
  if (!detectedType) {
    console.error('[upload-image] Magic bytes no coinciden con PNG/JPEG/WebP');
    return jsonResponse(
      { error: 'El archivo no es una imagen válida (PNG, JPEG o WebP).' },
      400,
    );
  }

  const safeName = sanitizeFilename(file.name || 'imagen');
  const timestamp = Date.now();
  const githubPath = `raw-uploads/${destino}/${timestamp}-${safeName}`;

  let base64Content;
  try {
    base64Content = arrayBufferToBase64(buffer);
    // buffer ya no se necesita más, GC la recolectará
  } catch (err) {
    console.error('[upload-image] Error codificando archivo', err.message);
    return jsonResponse({ error: 'No se pudo procesar el archivo' }, 500);
  }

  const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${githubPath}`;

  try {
    const ghResponse = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'lexgeocat-image-upload-worker',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `chore: upload raw image for ${destino}`,
        content: base64Content,
      }),
    });

    if (!ghResponse.ok) {
      const errBody = await ghResponse.text();
      console.error('[upload-image] GitHub respondió', ghResponse.status, errBody);
      return jsonResponse(
        { error: `No se pudo subir el archivo a GitHub (status ${ghResponse.status})` },
        502,
      );
    }

    // Slug esperado tras el procesamiento del GitHub Action (sin timestamp, .webp)
    const expectedSlug = safeName.replace(/\.[^.]+$/, '');
    const expectedPath = `src/assets/img/${destino}/${expectedSlug}.webp`;

    return jsonResponse({
      ok: true,
      message: 'Imagen recibida. Estará disponible en el sitio tras el próximo despliegue (2-5 min).',
      rawPath: githubPath,
      expectedPath,
    });
  } catch (err) {
    console.error('[upload-image] Error subiendo a GitHub', err.message);
    return jsonResponse({ error: 'Error de red al subir a GitHub' }, 502);
  }
}

// ── Handler principal ──────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── CORS preflight ──────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ── Ruta nueva: subida de imágenes (POST) ───────────────────────────────
    if (url.pathname === '/upload-image') {
      if (request.method !== 'POST') {
        return jsonResponse({ error: 'Método no permitido, usa POST' }, 405);
      }
      return handleImageUpload(request, env);
    }

    // Solo GET de aquí en adelante (rutas de GoatCounter)
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Método no permitido' }, 405);
    }

    // ── Ruta no válida → índice de endpoints ────────────────────────────────
    const gcEndpoint = ROUTES[url.pathname];
    if (!gcEndpoint) {
      return jsonResponse({
        ok:       true,
        endpoints: [...Object.keys(ROUTES), '/upload-image (POST)'],
        sites:    Object.keys(ALLOWED_SITES),
        usage:    '?site=main  |  ?site=blog',
      });
    }

    // ── Resolución del sitio ─────────────────────────────────────────────────
    const siteKey   = url.searchParams.get('site') || 'main';
    const subdomain = ALLOWED_SITES[siteKey];
    if (!subdomain) {
      return jsonResponse({
        error: `Sitio desconocido: "${siteKey}". Usa: ${Object.keys(ALLOWED_SITES).join(', ')}`,
      }, 400);
    }

    // ── Token requerido ──────────────────────────────────────────────────────
    if (!env.GC_TOKEN) {
      console.error('[GC Worker] GC_TOKEN no configurado');
      return jsonResponse({ error: 'Configuración incompleta' }, 500);
    }

    // ── Cache API (nivel worker, clave incluye site) ─────────────────────────
    const cache    = caches.default;
    const cacheKey = new Request(request.url, { method: 'GET' }); // la URL ya tiene ?site=
    const cached   = await cache.match(cacheKey);

    if (cached) {
      return new Response(cached.body, {
        headers: {
          ...Object.fromEntries(cached.headers),
          'X-Cache': 'HIT',
        },
      });
    }

    // ── Fetch upstream ───────────────────────────────────────────────────────
    try {
      let data = await fetchFromGoatCounter(subdomain, gcEndpoint, env.GC_TOKEN);

      // Normalizar /popular para que el sidebar pueda consumirlo
      if (url.pathname === '/popular') {
        const limit = parseInt(url.searchParams.get('limit') || '100', 10);
        const hits  = (data.hits || []).slice(0, limit).map(h => ({
          id:    h.path,
          count: h.count,
        }));
        data = { stats: hits };
      }

      const response = jsonResponse(data, 200, {
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
        'X-Cache':       'MISS',
      });

      // Guardar en caché (no bloqueante)
      env.ctx?.waitUntil?.(cache.put(cacheKey, response.clone()));

      return response;
    } catch (err) {
      console.error('[GC Worker]', err.message);
      return jsonResponse({ error: 'Error al obtener estadísticas' }, 502);
    }
  },
};
