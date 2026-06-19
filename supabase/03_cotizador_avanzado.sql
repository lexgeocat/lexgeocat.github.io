-- ═══════════════════════════════════════════════════════════════
-- LEXGEOCAT — Cotizador Avanzado & Imágenes
-- ═══════════════════════════════════════════════════════════════

-- 1. Agregar columna de imagen a servicios (URL pública: Google Drive, etc.)
alter table servicios add column if not exists img_url text;

-- 2. Tabla de factores de precio por tipo de detalle
-- Cada fila define los parámetros que se preguntan en el paso 2 del cotizador
-- y cómo se calcula el precio estimado.
create table if not exists factores_precio (
  id text primary key,                    -- mismo valor que servicios.details_type
  etiqueta text not null,                 -- nombre legible
  descripcion text,                       -- ayuda / contexto
  parametros jsonb not null default '[]', -- array de objetos { key, label, tipo, opciones, ... }
  activo boolean default true,
  created_at timestamptz default now()
);

-- 3. Tabla de cotizaciones solicitadas (leads)
create table if not exists cotizaciones (
  id uuid primary key default gen_random_uuid(),
  servicio_id text not null references servicios(id) on delete restrict,
  area text not null,
  detalles jsonb not null default '{}',     -- parámetros seleccionados { "key": "valor" }
  nota text default '',
  rango_min numeric,                        -- estimación calculada
  rango_max numeric,
  multiplicador_aplicado numeric default 1,
  extra_aplicado numeric default 0,
  formula text,                             -- 'multiplicador', 'unitario', 'modular', 'mixto'

  -- datos de contacto (opcional — el lead principal va por WhatsApp)
  created_at timestamptz default now(),
  contactado boolean default false,
  nota_seguimiento text
);

-- 4. Seguridad RLS
alter table factores_precio enable row level security;
alter table cotizaciones enable row level security;

-- Público puede leer factores_precio (el cotizador los necesita)
drop policy if exists "Lectura pública factores_precio" on factores_precio;
create policy "Lectura pública factores_precio"
  on factores_precio for select
  using (true);

-- Público puede INSERTAR cotizaciones (cualquier visitante puede cotizar)
drop policy if exists "Inserción pública cotizaciones" on cotizaciones;
create policy "Inserción pública cotizaciones"
  on cotizaciones for insert
  with check (true);

-- Solo autenticados pueden LEER/BORRAR cotizaciones
drop policy if exists "Lectura solo autenticados cotizaciones" on cotizaciones;
create policy "Lectura solo autenticados cotizaciones"
  on cotizaciones for select
  using (auth.role() = 'authenticated');

drop policy if exists "Escritura solo autenticados cotizaciones" on cotizaciones;
create policy "Escritura solo autenticados cotizaciones"
  on cotizaciones for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 5. Seed: factores de precio para cada tipo de detalle existente
insert into factores_precio (id, etiqueta, descripcion, parametros) values

('general', 'Alcance general',
 'Parámetros genéricos para servicios sin configuración especial.',
 '[
   {"key": "alcance", "label": "Alcance del proyecto", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Básico", "multiplicador": 0.85},
      {"label": "Estándar", "multiplicador": 1.0},
      {"label": "Complejo", "multiplicador": 1.8}
    ]}
 ]'),

('usucapion', 'Prescripción Adquisitiva',
 'Usucapión urbana/rural con diferentes niveles de documentación.',
 '[
   {"key": "tipo", "label": "¿El predio es urbano o rural?", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Urbano", "multiplicador": 1.0},
      {"label": "Rural", "multiplicador": 1.3}
    ]},
   {"key": "docs", "label": "¿Tiene documentos que respalden la posesión?", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Sí, varios", "multiplicador": 0.85},
      {"label": "Algunos", "multiplicador": 1.0},
      {"label": "Ninguno", "multiplicador": 1.5}
    ]}
 ]'),

('compraventa', 'Compraventa de Inmuebles',
 'Compraventa con verificación de títulos y saneamiento.',
 '[
   {"key": "titulo", "label": "¿El título está saneado y sin observaciones?", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Sí, limpio", "multiplicador": 0.85},
      {"label": "Con observaciones", "multiplicador": 1.3},
      {"label": "No lo sé", "multiplicador": 1.0}
    ]},
   {"key": "urgencia", "label": "¿Requiere el trámite con urgencia?", "tipo": "chips",
    "opciones": [
      {"label": "Normal", "multiplicador": 1.0},
      {"label": "Urgente", "multiplicador": 1.4}
    ]}
 ]'),

('saneamiento', 'Saneamiento de Títulos',
 'Regularización de situación jurídica predial.',
 '[
   {"key": "complejidad", "label": "Complejidad del saneamiento", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Simple (1-2 observaciones)", "multiplicador": 0.85},
      {"label": "Moderado", "multiplicador": 1.0},
      {"label": "Complejo (+3 cargas/gravámenes)", "multiplicador": 1.5}
    ]}
 ]'),

('sucesiones', 'Sucesiones y Herencias',
 'Declaratoria de herederos y partición de bienes.',
 '[
   {"key": "tipo", "label": "Tipo de sucesión", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Testamentaria", "multiplicador": 1.2},
      {"label": "Intestada", "multiplicador": 1.0}
    ]},
   {"key": "bienes", "label": "Cantidad de bienes inmuebles", "tipo": "chips",
    "opciones": [
      {"label": "1 inmueble", "multiplicador": 0.85},
      {"label": "2-3 inmuebles", "multiplicador": 1.0},
      {"label": "+3 inmuebles", "multiplicador": 1.3}
    ]}
 ]'),

('contratos', 'Contratos Civiles y Comerciales',
 'Redacción y revisión de contratos.',
 '[
   {"key": "tipo", "label": "Tipo de contrato", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Arrendamiento / Anticrético", "multiplicador": 1.0},
      {"label": "Compraventa / Promesa", "multiplicador": 1.2},
      {"label": "Asociativo / Empresarial", "multiplicador": 1.5}
    ]},
   {"key": "alcance", "label": "Alcance", "tipo": "chips",
    "opciones": [
      {"label": "Revisión solamente", "multiplicador": 0.6},
      {"label": "Redacción completa", "multiplicador": 1.0},
      {"label": "Redacción + negociación", "multiplicador": 1.4}
    ]}
 ]'),

('inra', 'Saneamiento INRA',
 'Acompañamiento en procesos de saneamiento agrario ante el INRA.',
 '[
   {"key": "superficie", "label": "Superficie del predio", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Pequeña (< 50 ha)", "multiplicador": 0.85},
      {"label": "Mediana (50-500 ha)", "multiplicador": 1.0},
      {"label": "Grande (> 500 ha)", "multiplicador": 1.5}
    ]},
   {"key": "etapa", "label": "Etapa del proceso", "tipo": "chips",
    "opciones": [
      {"label": "Inicio", "multiplicador": 1.0, "ayuda": "Desde cero"},
      {"label": "En curso", "multiplicador": 0.75, "ayuda": "Ya iniciado"},
      {"label": "Solo impugnación", "multiplicador": 0.6}
    ]}
 ]'),

('topo_area', 'Topografía por Área',
 'Levantamientos topográficos cotizados por superficie y terreno.',
 '[
   {"key": "superficie", "label": "Superficie aproximada", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Menos de 1 ha", "multiplicador": 0.8},
      {"label": "1 – 5 ha", "multiplicador": 1.0},
      {"label": "5 – 20 ha", "multiplicador": 1.3},
      {"label": "Más de 20 ha", "multiplicador": 1.8}
    ]},
   {"key": "terreno", "label": "Tipo de terreno", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Plano", "multiplicador": 1.0},
      {"label": "Ondulado", "multiplicador": 1.3},
      {"label": "Quebrado / Montañoso", "multiplicador": 1.8}
    ]},
   {"key": "entrega", "label": "Producto esperado", "tipo": "chips",
    "opciones": [
      {"label": "Solo datos campo", "multiplicador": 0.7},
      {"label": "Planos + informe", "multiplicador": 1.0},
      {"label": "Entrega completa (planos, MDT, informe)", "multiplicador": 1.3}
    ]}
 ]'),

('topo_puntos', 'Topografía por Puntos',
 'Georreferenciación GNSS por cantidad de puntos de control.',
 '[
   {"key": "puntos", "label": "Número de puntos de control", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "1 – 5 puntos", "multiplicador": 0.7},
      {"label": "6 – 15 puntos", "multiplicador": 1.0},
      {"label": "16 – 50 puntos", "multiplicador": 1.5},
      {"label": "+50 puntos", "multiplicador": 2.0}
    ]},
   {"key": "precision", "label": "Precisión requerida", "tipo": "chips",
    "opciones": [
      {"label": "Estándar (< 1 m)", "multiplicador": 1.0},
      {"label": "Alta (< 10 cm)", "multiplicador": 1.5},
      {"label": "Geodésica (< 5 cm)", "multiplicador": 2.0}
    ]}
 ]'),

('catastro_predio', 'Catastro por Predio',
 'Fichas prediales e inspección de campo por cantidad de predios.',
 '[
   {"key": "predios", "label": "Número aproximado de predios", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "1 – 10", "multiplicador": 0.7},
      {"label": "11 – 50", "multiplicador": 1.0},
      {"label": "51 – 200", "multiplicador": 1.5},
      {"label": "Más de 200", "multiplicador": 2.0}
    ]},
   {"key": "incluye_sig", "label": "Incluir integración SIG", "tipo": "chips",
    "opciones": [
      {"label": "Solo ficha", "multiplicador": 0.8},
      {"label": "Ficha + base SIG", "multiplicador": 1.2}
    ]}
 ]'),

('catastro_area', 'Catastro por Área',
 'Geocodificación y nomenclatura por área geográfica.',
 '[
   {"key": "area_trabajo", "label": "Área de cobertura", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "1 zona / barrio", "multiplicador": 0.7},
      {"label": "Distrito completo", "multiplicador": 1.0},
      {"label": "Municipio completo", "multiplicador": 1.5}
    ]},
   {"key": "estado", "label": "Estado actual", "tipo": "chips",
    "opciones": [
      {"label": "Desde cero", "multiplicador": 1.2},
      {"label": "Actualización", "multiplicador": 1.0},
      {"label": "Digitalización existente", "multiplicador": 0.7}
    ]}
 ]'),

('catastro_municipal', 'Catastro Municipal Integral',
 'Proyecto completo de actualización catastral municipal.',
 '[
   {"key": "poblacion", "label": "Tamaño del municipio", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Menos de 5.000 hab", "multiplicador": 0.6},
      {"label": "5.000 – 20.000 hab", "multiplicador": 1.0},
      {"label": "20.000 – 100.000 hab", "multiplicador": 1.5},
      {"label": "Más de 100.000 hab", "multiplicador": 2.0}
    ]},
   {"key": "alcance", "label": "Alcance del proyecto", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Diagnóstico", "multiplicador": 0.3},
      {"label": "Actualización parcial", "multiplicador": 0.7},
      {"label": "Actualización completa", "multiplicador": 1.0},
      {"label": "Creación desde cero", "multiplicador": 1.4}
    ]}
 ]'),

('sig_mun', 'SIG Municipal',
 'Implementación de sistema de información geográfica municipal.',
 '[
   {"key": "alcance", "label": "Alcance del SIG", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Diagnóstico + diseño", "multiplicador": 0.3},
      {"label": "Implementación básica", "multiplicador": 0.7},
      {"label": "Implementación completa", "multiplicador": 1.0},
      {"label": "Completa + capacitación", "multiplicador": 1.2}
    ]},
   {"key": "modulos_sig", "label": "Módulos a implementar", "tipo": "chips_multi",
    "opciones": [
      {"label": "Base de datos PostGIS", "precio_extra": 500},
      {"label": "Servidor GeoServer", "precio_extra": 400},
      {"label": "Visor web mapas", "precio_extra": 800},
      {"label": "Módulo de consultas", "precio_extra": 350},
      {"label": "Panel de reportes", "precio_extra": 300},
      {"label": "Integración catastral", "precio_extra": 600}
    ]}
 ]'),

('cartografia_mapas', 'Cartografía Temática',
 'Elaboración de mapas temáticos por cantidad.',
 '[
   {"key": "mapas", "label": "Número de mapas temáticos", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "1 – 3", "multiplicador": 0.8},
      {"label": "4 – 10", "multiplicador": 1.0},
      {"label": "Más de 10", "multiplicador": 1.5}
    ]},
   {"key": "tamano", "label": "Formato de impresión", "tipo": "chips",
    "opciones": [
      {"label": "Digital (web)", "multiplicador": 0.8},
      {"label": "Carta / A4", "multiplicador": 1.0},
      {"label": "Pliego (A0/A1)", "multiplicador": 1.4}
    ]}
 ]'),

('software_modulos', 'Software por Módulos',
 'Desarrollo de software web con selección de módulos.',
 '[
   {"key": "modulos", "label": "¿Qué módulos necesitas? (selecciona todos los que apliquen)", "tipo": "chips_multi",
    "opciones": [
      {"label": "Diseño UI/UX", "precio_extra": 300},
      {"label": "Backend / API", "precio_extra": 500},
      {"label": "Base de datos", "precio_extra": 400},
      {"label": "Mapa interactivo", "precio_extra": 800},
      {"label": "Panel de admin", "precio_extra": 600},
      {"label": "Módulo de reportes", "precio_extra": 350},
      {"label": "Autenticación de usuarios", "precio_extra": 300},
      {"label": "Despliegue / Hosting", "precio_extra": 200}
    ]},
   {"key": "complejidad", "label": "Complejidad del desarrollo", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "Sencillo", "multiplicador": 0.85},
      {"label": "Moderado", "multiplicador": 1.0},
      {"label": "Complejo", "multiplicador": 1.5}
    ]}
 ]'),

('software_tiempo', 'Software por Horas',
 'Desarrollo de software cotizado por horas estimadas.',
 '[
   {"key": "horas", "label": "Horas estimadas de desarrollo", "tipo": "chips", "requerido": true,
    "opciones": [
      {"label": "5 – 15 h", "multiplicador": 0.7},
      {"label": "16 – 40 h", "multiplicador": 1.0},
      {"label": "41 – 80 h", "multiplicador": 1.5},
      {"label": "+80 h", "multiplicador": 2.0}
    ]},
   {"key": "tipo_trabajo", "label": "Tipo de trabajo", "tipo": "chips",
    "opciones": [
      {"label": "Desarrollo nuevo", "multiplicador": 1.0},
      {"label": "Mantenimiento / mejora", "multiplicador": 0.7}
    ]}
 ]')

on conflict (id) do update set
  etiqueta = excluded.etiqueta,
  parametros = excluded.parametros;
