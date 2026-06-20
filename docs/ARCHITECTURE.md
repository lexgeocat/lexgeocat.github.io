# LexGeoCat — Arquitectura

Stack: Vue 3 + TypeScript + SCSS + Vite + Supabase + GitHub Pages.

## Estructura

```
src/
├─ shared/          # Componentes, composables, layouts, utils transversales
├─ features/        # Lógica por dominio (cotizador, servicios, normativa, blog)
├─ lib/             # Capa de datos (Supabase client, queries tipadas)
├─ admin/           # Panel administrativo SPA (rutas protegidas)
├─ views/           # Páginas públicas (cada una lazy-loaded)
├─ router/          # Configuración de rutas + guardias
├─ config/          # Constantes del sitio
├─ content/         # Datos estáticos (topics)
├─ types/           # Interfaces compartidas (Servicio, Cotizacion, etc.)
└─ assets/          # SCSS (tokens, módulos) e imágenes
```

## Principios

1. **Feature folders** — cada dominio agrupa sus componentes + lógica + estado.
2. **Capa de datos centralizada** — todo acceso a Supabase pasa por `src/lib/queries/`.
3. **Lazy loading** — cada vista y ruta admin se carga bajo demanda.
4. **Sin SSR** — SPA puro desplegado en GitHub Pages con fallback 404.html.
5. **Anti-spam client-side** — time-trap + rate-limit + math captcha + honeypot (no hay servidor).
6. **Admin protegido** — ruta `/admin` con guardia `beforeEach` que verifica sesión Supabase.

## Flujo de datos

```
Vista/Componente → composable feature → src/lib/queries/ → supabase/client.ts → Supabase REST
```

## Despliegue

GitHub Actions (`deploy.yml`): typecheck → lint → lint:css → build → upload pages artifact.
