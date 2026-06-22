# Pipeline de imágenes — Normativa (y Servicios)

Flujo end-to-end para portadas de normas (extensible a `servicios`). Sin servidor propio:
el admin sube a un Worker de Cloudflare, que escribe a `raw-uploads/`, y un GitHub
Action procesa, optimiza y mueve los archivos al árbol de assets de Vite.

---

## 1. Diagrama del flujo

```
┌──────────────────┐    POST /upload-image      ┌────────────────────┐
│  Admin (Vue)     │ ─────────────────────────► │  Cloudflare Worker │
│  NormativaAdmin  │   FormData(file, destino)  │  stats.lexgeocat   │
│                  │   Bearer <jwt Supabase>    │  .workers.dev      │
└────────┬─────────┘                            └─────────┬──────────┘
         │                                                 │ Contents API
         │                                                 │ (PUT file)
         │                                                 ▼
         │                                  ┌──────────────────────────┐
         │                                  │  GitHub: lexgeocat/...   │
         │                                  │  raw-uploads/<destino>/  │
         │                                  │  <timestamp>-<slug>.<ext>│
         │                                  └──────────┬───────────────┘
         │ upsertNormativa({ imagen_url: <filename> }) │
         │ ◄──────────────────────────────────────────┤
         ▼                                             │
   Supabase: normativa.imagen_url = "<slug>.webp"      │ push a main
   (filename, no ruta completa)                        │ trigger
         │                                             ▼
         │                              ┌──────────────────────────┐
         │                              │  GitHub Action           │
         │                              │  process-images.yml      │
         │                              │  · Pillow 800px WebP q85 │
         │                              │  · mueve a src/assets/   │
         │                              │  · borra raw-uploads/    │
         │                              │  · auto-commit           │
         │                              └──────────┬───────────────┘
         │                                         │ push
         │                                         ▼
         │                              ┌──────────────────────────┐
         │                              │  deploy.yml              │
         │                              │  build + GitHub Pages    │
         │                              └──────────┬───────────────┘
         │                                         │
         ▼                                         ▼
   ┌────────────────────────────────────────────────────────┐
   │  Sitio público: import.meta.glob resuelve el filename  │
   │  → URL hasheada por Vite → <img> en Normativa.vue      │
   └────────────────────────────────────────────────────────┘
```

---

## 2. Detalle por etapa

### 2.1. Admin → Worker

- **UI**: `src/admin/views/NormativaAdmin.vue` — `<input type="file" accept="image/png,image/jpeg,image/webp">`.
- **Validación cliente** (mismo límite que el Worker, pero prevalidamos para mejor UX):
  - Tipos permitidos: `image/png`, `image/jpeg`, `image/webp`.
  - Tamaño máx.: 8 MB.
- **Preview local**: `URL.createObjectURL(file)` antes de enviar. Se libera en `onBeforeUnmount` y al cerrar el modal.
- **JWT**: `await getSupabase().auth.getSession()` → `data.session?.access_token`. Sin token la llamada se rechaza con "Sesión expirada".
- **Request**:
  ```
  POST https://stats.lexgeocat.workers.dev/upload-image
  Authorization: Bearer <jwt>
  Content-Type: multipart/form-data
  [file, destino=normativa]
  ```
- **Respuesta esperada**: `{ ok: true, rawPath, expectedPath }`. Solo conservamos el `filename` (parte final de `expectedPath`) y lo guardamos en `normativa.imagen_url`.

> El token del repo de GitHub **nunca** toca el cliente — vive como secret del Worker.

### 2.2. Worker → raw-uploads/

El Worker (no en este repo, en `stats.lexgeocat.workers.dev`):
1. Valida el JWT contra `GET {SUPABASE_URL}/auth/v1/user`.
2. Revalida tipo + tamaño (server-side, no se confía en el cliente).
3. Sube el archivo crudo vía Contents API a `raw-uploads/normativa/<timestamp>-<safeName>.<ext>`.
4. Calcula `expectedPath` como `src/assets/img/normativa/<safeName-sin-ext>.webp`.

### 2.3. Push → GitHub Action

- **Trigger**: push a `main` con cambios bajo `raw-uploads/**` (definido en `.github/workflows/process-images.yml`).
- **Permisos**: `contents: write` (necesario para que el commit automático funcione).
- **Pasos**:
  1. `actions/checkout@v4` con `fetch-depth: 0`.
  2. `actions/setup-python@v5` (3.x).
  3. `pip install pillow`.
  4. `python scripts/process_images.py`:
     - Recorre `raw-uploads/normativa/` y `raw-uploads/servicios/` (si la carpeta no existe o está vacía, no falla).
     - Para cada archivo con formato `<timestamp>-<slug>.<ext>`: redimensiona a 800px máx. (LANCZOS), convierte a WebP calidad 85, escribe en `src/assets/img/<destino>/<slug>.webp`, y borra el original de `raw-uploads/`.
  5. `stefanzweifel/git-auto-commit-action@v5` con mensaje `chore: process uploaded images [skip ci]`.

> El `[skip ci]` **no** bloquea `deploy.yml`: deploy dispara con cualquier push a `main`, no filtra por mensaje de commit.

### 2.4. Build → resolución en el sitio público

- Vite, en build-time, ejecuta `import.meta.glob('../assets/img/normativa/*.{webp,png,jpg,jpeg}', { eager: true, query: '?url' })` en `src/lib/normativaImage.ts` e indexa las URLs hasheadas por filename.
- En runtime, `resolveNormativaImageUrl(n.imagen_url)`:
  - Si la URL ya es `https?://` → se devuelve tal cual (compatibilidad con URLs externas previas).
  - Si es solo un filename → se busca en el mapa y se devuelve la URL hasheada.
  - Si el archivo no está todavía en el árbol (estado "en proceso") → devuelve `null` y `Normativa.vue` cae al icono fallback (`fa-solid fa-file-lines`).

---

## 3. Tiempos esperados

| Etapa                                  | Tiempo aprox. |
|----------------------------------------|---------------|
| Upload admin → respuesta del Worker    | 1-5 s         |
| Commit del Worker a `raw-uploads/`     | instantáneo   |
| Trigger del Action + Pillow + commit   | 20-60 s       |
| Build + deploy a GitHub Pages          | 1-3 min       |
| **Total**                              | **~2-5 min**  |

**Implicación para el admin**: tras subir una imagen debe esperar este intervalo antes de verla en el sitio público. La UI del admin muestra el aviso "Imagen en proceso, estará disponible en el próximo despliegue (2-5 min)" y un toast confirma la subida al Worker.

---

## 4. Caso límite: el filename guardado no resuelve

Síntoma: la columna `normativa.imagen_url` tiene un valor pero `<img>` no carga (cae al icono fallback). El log de Vite en build no muestra el archivo como asset.

Causas posibles y cómo verificar manualmente:

1. **El slug esperado no coincide con el archivo real en `src/assets/img/normativa/`**.
   - En Supabase Studio, `select id, titulo, imagen_url from normativa where imagen_url is not null;`.
   - En GitHub, abrir `src/assets/img/normativa/` y comparar filenames.
   - Si el archivo es `p.webp` en el repo pero `imagen_url = 'portada.webp'` en BD, hay drift: el slug se construyó distinto en alguna subida. Solución: actualizar `imagen_url` al filename real (`update normativa set imagen_url = 'p.webp' where id = '...'`).

2. **El Action aún no corrió** (subida muy reciente, < 2 min).
   - En GitHub → Actions, verificar que el run `Process uploaded images` del push más reciente a `main` está en verde y commiteó el `.webp`. Si está corriendo, esperar.

3. **El archivo en `raw-uploads/` no fue procesado** (script falló para ese archivo).
   - Revisar logs del Action. El script deja los archivos con error en `raw-uploads/` y registra `[error] <archivo>: <motivo>`. Corregir el nombre o la imagen manualmente y re-ejecutar el Action, o mover el archivo a `src/assets/img/normativa/<slug>.webp` a mano y commitear.

4. **El push del Worker llegó a una rama distinta de `main`**.
   - El trigger filtra por `branches: [main]`. Confirmar en el log del Worker a qué rama se hizo el push (por defecto debe ser `main`).

5. **Imagen externa (URL completa) que ya no resuelve**.
   - `resolveNormativaImageUrl` devuelve la URL tal cual si empieza con `http(s)://`. Si la fuente externa está caída, no hay fallback automático. Mejor migrar a un asset propio.

---

## 5. Secrets y dónde están configurados

| Secret                  | Dónde                                       | Propósito                                                                |
|-------------------------|---------------------------------------------|--------------------------------------------------------------------------|
| `GITHUB_TOKEN`          | Cloudflare Worker → dashboard → Settings    | Contents API: subir el archivo crudo a `raw-uploads/<destino>/`.         |
| `SUPABASE_URL`          | Cloudflare Worker → dashboard → Settings    | Validar el JWT del admin contra `auth/v1/user`.                          |
| `SUPABASE_ANON_KEY`     | Cloudflare Worker → dashboard → Settings    | Construir el cliente que valida el JWT.                                  |
| `VITE_SUPABASE_URL`     | GitHub repo → Settings → Secrets & variables | Build del front (cliente Supabase público).                             |
| `VITE_SUPABASE_ANON_KEY`| GitHub repo → Settings → Secrets & variables | Build del front (cliente Supabase público).                             |

> El `GITHUB_TOKEN` del Worker **no** es el `GITHUB_TOKEN` por defecto de los Actions — es un PAT dedicado con permiso `contents: write` sobre `lexgeocat/lexgeocat.github.io`, configurado manualmente en el dashboard del Worker.

---

## 6. Archivos clave de este pipeline

- `src/admin/views/NormativaAdmin.vue` — UI de subida, preview, llamada al Worker.
- `src/lib/normativaImage.ts` — resolver filename → URL hasheada via `import.meta.glob`.
- `src/views/Normativa.vue` — consumidor: muestra la imagen o el icono fallback.
- `scripts/process_images.py` — script que ejecuta el Action.
- `.github/workflows/process-images.yml` — definición del Action.
- `src/types/supabase.ts` — interfaz `Normativa` con `imagen_url: string | null`.
- `supabase/04_normativa.sql` — columna `imagen_url text` en la tabla `normativa`.
