create table if not exists public.servicios (
  id             bigint generated always as identity primary key,
  area           text not null,
  label          text not null,
  categoria      text not null default '',
  descripcion    text not null default '',
  tags           text[] not null default '{}',
  img_url        text not null default '',
  precio_min     numeric not null default 0,
  precio_max     numeric not null default 0,
  tiempo_min     text not null default '',
  tiempo_max     text not null default '',
  complejidad    text not null default '',
  details_type   text not null default 'general',
  unit_label     text not null default '',
  whatsapp_texto text not null default '',
  orden          integer not null default 0,
  activo         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.factores_precio (
  id          bigint generated always as identity primary key,
  etiqueta    text not null,
  descripcion text not null default '',
  parametros  jsonb not null default '[]',
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.cotizaciones (
  id                      bigint generated always as identity primary key,
  servicio_id             text not null,
  area                    text not null,
  detalles                jsonb not null default '{}',
  nota                    text not null default '',
  rango_min               numeric,
  rango_max               numeric,
  multiplicador_aplicado  numeric not null default 1,
  extra_aplicado          numeric not null default 0,
  formula                 text,
  contactado              boolean not null default false,
  nota_seguimiento        text,
  created_at              timestamptz not null default now()
);

create table if not exists public.normativa (
  id                  bigint generated always as identity primary key,
  titulo              text not null,
  categoria           text not null,
  numero_norma        text,
  fecha_promulgacion  date,
  fecha_publicacion   date,
  estado              text not null,
  activo              boolean not null default true,
  resumen             text,
  palabras_clave      text[] not null default '{}',
  archivo_url         text,
  archivo_path        text,
  archivo_nombre      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- indexes
create index if not exists idx_servicios_area on public.servicios(area);
create index if not exists idx_servicios_activo on public.servicios(activo);
create index if not exists idx_factores_precio_activo on public.factores_precio(activo);
create index if not exists idx_cotizaciones_created_at on public.cotizaciones(created_at desc);
create index if not exists idx_normativa_categoria on public.normativa(categoria);
create index if not exists idx_normativa_estado on public.normativa(estado);
create index if not exists idx_normativa_activo on public.normativa(activo);

-- row level security
alter table public.servicios enable row level security;
alter table public.factores_precio enable row level security;
alter table public.cotizaciones enable row level security;
alter table public.normativa enable row level security;

-- lectura pública: solo activos
create policy "Lectura pública servicios activos"
  on public.servicios for select
  to anon
  using (activo = true);

create policy "Lectura pública factores activos"
  on public.factores_precio for select
  to anon
  using (activo = true);

create policy "Lectura pública normativa activa"
  on public.normativa for select
  to anon
  using (activo = true);

-- inserción anónima cotizaciones (público puede cotizar)
create policy "Inserción anónima cotizaciones"
  on public.cotizaciones for insert
  to anon
  with check (true);

-- cotizaciones no se leen públicamente
create policy "Bloquear lectura anónima cotizaciones"
  on public.cotizaciones for select
  to anon
  using (false);

-- admin: acceso total autenticado a todas las tablas
create policy "Admin full access servicios"
  on public.servicios for all
  to authenticated
  using (true)
  with check (true);

create policy "Admin full access factores_precio"
  on public.factores_precio for all
  to authenticated
  using (true)
  with check (true);

create policy "Admin full access cotizaciones"
  on public.cotizaciones for all
  to authenticated
  using (true)
  with check (true);

create policy "Admin full access normativa"
  on public.normativa for all
  to authenticated
  using (true)
  with check (true);
