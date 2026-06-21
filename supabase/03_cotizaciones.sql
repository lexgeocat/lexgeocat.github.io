-- ═══════════════════════════════════════════════════════════════
-- LEXGEOCAT — 03. Tabla cotizaciones (leads del simulador)
-- Requiere: 00_extensions_and_helpers.sql, 01_servicios.sql
-- ═══════════════════════════════════════════════════════════════

create table if not exists cotizaciones (
  id                      uuid primary key default gen_random_uuid(),
  servicio_id             text not null references servicios(id) on delete restrict,
  area                    text not null
                            check (area in (
                              'derecho','catastro','ordenamiento',
                              'geografia','topografia','geomatica','software'
                            )),
  detalles                jsonb not null default '{}'::jsonb check (jsonb_typeof(detalles) = 'object'),
  nota                    text not null default '',
  rango_min               numeric check (rango_min is null or rango_min >= 0),
  rango_max               numeric check (rango_max is null or rango_max >= 0),
  multiplicador_aplicado  numeric not null default 1 check (multiplicador_aplicado > 0),
  extra_aplicado          numeric not null default 0 check (extra_aplicado >= 0),
  formula                 text,

  created_at              timestamptz not null default now(),
  contactado              boolean not null default false,
  nota_seguimiento        text,

  constraint cotizaciones_rango_ck check (rango_min is null or rango_max is null or rango_max >= rango_min)
);

comment on table cotizaciones is 'Leads generados por el simulador de cotización del sitio público.';

-- RLS
alter table cotizaciones enable row level security;

drop policy if exists "Inserción pública cotizaciones" on cotizaciones;
drop policy if exists "cotizaciones_insert_public" on cotizaciones;
create policy "cotizaciones_insert_public"
  on cotizaciones for insert
  with check (true);

drop policy if exists "Lectura solo autenticados cotizaciones" on cotizaciones;
drop policy if exists "cotizaciones_select_auth" on cotizaciones;
create policy "cotizaciones_select_auth"
  on cotizaciones for select
  to authenticated
  using (auth.role() = 'authenticated');

drop policy if exists "Escritura solo autenticados cotizaciones" on cotizaciones;
drop policy if exists "cotizaciones_update_auth" on cotizaciones;
create policy "cotizaciones_update_auth"
  on cotizaciones for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "cotizaciones_delete_auth" on cotizaciones;
create policy "cotizaciones_delete_auth"
  on cotizaciones for delete
  to authenticated
  using (auth.role() = 'authenticated');

create index if not exists idx_cotizaciones_servicio_id on cotizaciones(servicio_id);
create index if not exists idx_cotizaciones_created_at on cotizaciones(created_at desc);
create index if not exists idx_cotizaciones_contactado on cotizaciones(contactado);
