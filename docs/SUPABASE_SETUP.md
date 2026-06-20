# Supabase Setup

## Requisitos

- Cuenta en [supabase.com](https://supabase.com)
- Proyecto creado (plan Free)
- Supabase CLI (`npm install -g supabase` o `brew install supabase/tap/supabase`)

## Configuración local

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db pull     # descarga esquema existente
```

Para aplicar migraciones:

```bash
supabase db push
```

Para iniciar entorno local:

```bash
supabase start
supabase db reset   # aplica migraciones + seed
```

## Variables de entorno

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Tablas

Ver `supabase/migrations/0001_init.sql` para DDL completo.

### `servicios`
Catálogo de servicios profesionales. Columnas: area, label, categoria, descripcion, tags, precio_min/max, tiempo_min/max, complejidad, details_type, unit_label, whatsapp_texto, orden, activo.

### `factores_precio`
Parámetros dinámicos del cotizador. Columna `parametros` es JSONB con la configuración de chips/inputs.

### `cotizaciones`
Cotizaciones enviadas desde el formulario público. Columnas: servicio_id, area, detalles (JSONB), rango_min/max, multiplicador_aplicado, extra_aplicado, nota, contactado.

### `normativa`
Biblioteca jurídica. Columnas: titulo, categoria, numero_norma, fechas, estado, resumen, palabras_clave, archivo_url/path/nombre.

## RLS

- **Anon**: SELECT solo activos en servicios/factores/normativa. INSERT en cotizaciones.
- **Authenticated**: CRUD total en todas las tablas (acceso admin).
