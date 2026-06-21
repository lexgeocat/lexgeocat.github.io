-- ═══════════════════════════════════════════════════════════════
-- LEXGEOCAT — 01. Tabla servicios
-- Requiere: 00_extensions_and_helpers.sql
-- ═══════════════════════════════════════════════════════════════

create table if not exists servicios (
  id              text primary key,                -- ej: 'usucapion', 'ficha_predial'
  area            text not null
                    check (area in (
                      'derecho','catastro','ordenamiento',
                      'geografia','topografia','geomatica','software'
                    )),
  label           text not null check (btrim(label) <> ''),
  categoria       text not null default '' check (categoria = btrim(categoria)),
  descripcion     text,
  tags            text[] not null default '{}',
  img_url         text,

  precio_min      numeric not null default 0 check (precio_min >= 0),
  precio_max      numeric not null default 0 check (precio_max >= 0),
  tiempo_min      text,
  tiempo_max      text,
  complejidad     text,
  details_type    text not null default 'general' check (btrim(details_type) <> ''),
  unit_label      text,

  orden           integer not null default 0,
  activo          boolean not null default true,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint servicios_precio_rango_ck check (precio_max >= precio_min)
);

comment on table servicios is 'Catálogo de servicios mostrado en el sitio público y usado por el cotizador.';
comment on column servicios.details_type is 'FK lógica a factores_precio.id (sin FK real porque factores_precio puede crearse después o compartirse).';

-- Trigger updated_at (usa la función central de 00_extensions_and_helpers.sql)
drop trigger if exists trg_servicios_updated_at on servicios;
create trigger trg_servicios_updated_at
  before update on servicios
  for each row
  execute function set_updated_at();

-- RLS
alter table servicios enable row level security;

drop policy if exists "Lectura pública de servicios activos" on servicios;
drop policy if exists "servicios_select_public" on servicios;
create policy "servicios_select_public"
  on servicios for select
  using (true);

drop policy if exists "Escritura solo autenticados" on servicios;
drop policy if exists "servicios_write_auth" on servicios;
create policy "servicios_write_auth"
  on servicios for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Índices
create index if not exists idx_servicios_area on servicios(area);
create index if not exists idx_servicios_activo on servicios(activo);
create index if not exists idx_servicios_details_type on servicios(details_type);
create unique index if not exists uq_servicios_area_orden on servicios(area, orden);
