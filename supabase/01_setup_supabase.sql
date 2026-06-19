-- ═══════════════════════════════════════════════════════════════
-- LEXGEOCAT — Setup inicial de Supabase
-- Ejecutar UNA SOLA VEZ en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════

-- 1. Tabla principal de servicios
create table if not exists servicios (
  id text primary key,                 -- ej: 'usucapion', 'ficha_predial'
  area text not null,                  -- ej: 'derecho', 'catastro', 'topografia'
  label text not null,                 -- nombre visible del servicio
  categoria text not null default '',  -- grupo/subcategoría dentro del área (ej: 'Derecho Civil')
  descripcion text,                    -- descripción larga (svc-item-desc)
  tags text[] default '{}',            -- ej: {'Proceso','+10 años','Rural/Urbano'}
  img_url text,                        -- URL pública de imagen (Google Drive, Supabase Storage, etc.)

  precio_min numeric not null default 0,
  precio_max numeric not null default 0,
  tiempo_min text,                     -- ej: '18 meses'
  tiempo_max text,                     -- ej: '36 meses'
  complejidad text,                    -- ej: 'Alta'
  details_type text default 'general', -- usado por el cotizador (usucapion, compraventa, topo_area, etc.)
  unit_label text,                     -- ej: 'por hectárea' (opcional)

  whatsapp_texto text,                 -- texto pre-armado para el botón de WhatsApp
  orden integer default 0,             -- para controlar el orden de aparición
  activo boolean default true,         -- desactivar sin borrar

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Trigger para actualizar updated_at automáticamente
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_servicios_updated_at on servicios;
create trigger trg_servicios_updated_at
  before update on servicios
  for each row
  execute function set_updated_at();

-- 3. Seguridad: Row Level Security (RLS)
alter table servicios enable row level security;

-- Cualquiera puede LEER servicios activos (esto es lo que ve tu sitio público)
drop policy if exists "Lectura pública de servicios activos" on servicios;
create policy "Lectura pública de servicios activos"
  on servicios for select
  using (true);

-- Solo usuarios AUTENTICADOS (logueados en el admin) pueden insertar/editar/borrar
drop policy if exists "Escritura solo autenticados" on servicios;
create policy "Escritura solo autenticados"
  on servicios for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. Índice para acelerar el filtro por área (usado por el cotizador)
create index if not exists idx_servicios_area on servicios(area);
