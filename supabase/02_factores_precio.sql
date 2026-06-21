-- ═══════════════════════════════════════════════════════════════
-- LEXGEOCAT — 02. Tabla factores_precio
-- Requiere: 00_extensions_and_helpers.sql
-- ═══════════════════════════════════════════════════════════════

create table if not exists factores_precio (
  id            text primary key,                 -- mismo valor que servicios.details_type
  etiqueta      text not null check (btrim(etiqueta) <> ''),
  descripcion   text,
  parametros    jsonb not null default '[]'::jsonb check (jsonb_typeof(parametros) = 'array'),
  activo        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table factores_precio is 'Parámetros que alimentan el cotizador. id debe coincidir con servicios.details_type.';

drop trigger if exists trg_factores_precio_updated_at on factores_precio;
create trigger trg_factores_precio_updated_at
  before update on factores_precio
  for each row
  execute function set_updated_at();

-- RLS
alter table factores_precio enable row level security;

drop policy if exists "Lectura pública factores_precio" on factores_precio;
drop policy if exists "factores_precio_select_public" on factores_precio;
create policy "factores_precio_select_public"
  on factores_precio for select
  using (true);

drop policy if exists "factores_precio_write_auth" on factores_precio;
create policy "factores_precio_write_auth"
  on factores_precio for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create index if not exists idx_factores_precio_activo on factores_precio(activo);
