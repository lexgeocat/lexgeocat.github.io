-- ═══════════════════════════════════════════════════════════════
-- LEXGEOCAT — 04. Normativa: taxonomía jerárquica + tabla + storage
-- Requiere: 00_extensions_and_helpers.sql
--
-- Estructura jerárquica (8 grupos romanos × 20 tipos de norma):
--   I    Normas Fundamentales del Estado
--   II   Legislación Nacional
--   III  Normativa Reglamentaria Nacional
--   IV   Legislación Autonómica Departamental
--   V    Legislación Autonómica Municipal
--   VI   Jurisprudencia
--   VIII Fuentes Auxiliares del Derecho   (sin "VII" — así se definió)
--   IX   Documentos de Gestión y Apoyo
--
-- categoria/estado (enum plano viejo) se conservan por compatibilidad
-- con el código TS actual (CATEGORIA_LABELS, useNormativa.ts, admin).
-- tipo_id es la clasificación jerárquica real y va NOT NULL desde
-- el inicio porque esta es la versión definitiva del esquema.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────
-- 1. Grupos (numerales romanos del índice normativo)
-- ───────────────────────────────────────────────
create table if not exists normativa_grupos (
  id          text primary key,            -- slug estable, ej: 'fuentes_auxiliares'
  numeral     text not null check (btrim(numeral) <> ''),  -- 'I', 'II', ... 'VIII', 'IX'
  nombre      text not null check (btrim(nombre) <> ''),
  orden       integer not null,
  created_at  timestamptz not null default now()
);

comment on table normativa_grupos is 'Los 8 grupos romanos del índice normativo (I..VI, VIII, IX — sin VII por diseño).';

create unique index if not exists uq_normativa_grupos_numeral on normativa_grupos(numeral);
create unique index if not exists uq_normativa_grupos_orden on normativa_grupos(orden);

alter table normativa_grupos enable row level security;

drop policy if exists "normativa_grupos_select_public" on normativa_grupos;
create policy "normativa_grupos_select_public"
  on normativa_grupos for select
  using (true);

drop policy if exists "normativa_grupos_write_auth" on normativa_grupos;
create policy "normativa_grupos_write_auth"
  on normativa_grupos for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────
-- 2. Tipos de norma (los 20 puntos del índice)
-- ───────────────────────────────────────────────
create table if not exists normativa_tipos (
  id          text primary key,            -- slug estable, ej: 'leyes_nacionales'
  grupo_id    text not null references normativa_grupos(id) on delete restrict,
  numero      integer not null check (numero between 1 and 20),
  nombre      text not null check (btrim(nombre) <> ''),
  orden       integer not null,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table normativa_tipos is 'Los 20 tipos de norma del índice, cada uno asociado a su grupo romano.';

create unique index if not exists uq_normativa_tipos_numero on normativa_tipos(numero);
create unique index if not exists uq_normativa_tipos_orden on normativa_tipos(orden);
create index if not exists idx_normativa_tipos_grupo_id on normativa_tipos(grupo_id);
create index if not exists idx_normativa_tipos_activo on normativa_tipos(activo);

alter table normativa_tipos enable row level security;

drop policy if exists "normativa_tipos_select_public" on normativa_tipos;
create policy "normativa_tipos_select_public"
  on normativa_tipos for select
  using (true);

drop policy if exists "normativa_tipos_write_auth" on normativa_tipos;
create policy "normativa_tipos_write_auth"
  on normativa_tipos for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────
-- 3. Tabla normativa
-- ───────────────────────────────────────────────
create table if not exists normativa (
  id                  uuid primary key default gen_random_uuid(),
  titulo              text not null check (btrim(titulo) <> ''),

  -- Clasificación jerárquica real (8 grupos × 20 tipos)
  tipo_id             text not null references normativa_tipos(id) on delete restrict,

  -- Campo legado: enum plano de 6 valores, se mantiene por
  -- compatibilidad con CATEGORIA_LABELS / useNormativa.ts / admin.
  categoria           text not null default 'leyes'
                        check (categoria in (
                          'constitucion','leyes','codigos',
                          'decretos_reglamentarios','jurisprudencia','doctrina'
                        )),

  numero_norma        text,
  fecha_promulgacion  date,
  fecha_publicacion   date,
  estado              text not null default 'vigente'
                        check (estado in ('vigente','derogada','modificada')),
  activo              boolean not null default true,
  resumen             text,
  palabras_clave      text[] not null default '{}',

  -- Documento PDF (Supabase Storage)
  archivo_url         text,
  archivo_path        text,
  archivo_nombre      text,

  -- Imagen ilustrativa (solo URL externa, sin storage propio)
  imagen_url          text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint normativa_fechas_ck check (
    fecha_promulgacion is null
    or fecha_publicacion is null
    or fecha_publicacion >= fecha_promulgacion
  )
);

comment on column normativa.tipo_id is 'Clasificación jerárquica real (FK a normativa_tipos: grupo romano + tipo de norma).';
comment on column normativa.categoria is 'LEGADO: enum plano de 6 valores. Se mantiene por compatibilidad con el frontend actual; tipo_id es la clasificación vigente.';
comment on column normativa.imagen_url is 'URL de imagen ilustrativa (portada, infografía, etc.) para la tarjeta en el sitio público.';

drop trigger if exists trg_normativa_updated_at on normativa;
create trigger trg_normativa_updated_at
  before update on normativa
  for each row execute function set_updated_at();

-- Índices
create index if not exists idx_normativa_tipo_id on normativa (tipo_id);
create index if not exists idx_normativa_fecha_pub on normativa (fecha_publicacion desc);
create index if not exists idx_normativa_categoria on normativa (categoria);
create index if not exists idx_normativa_estado on normativa (estado);
create index if not exists idx_normativa_activo on normativa (activo);
create index if not exists idx_normativa_palabras_clave on normativa using gin (palabras_clave);

-- RLS
alter table normativa enable row level security;

drop policy if exists "normativa_select_all" on normativa;
create policy "normativa_select_all"
  on normativa for select
  using (true);

drop policy if exists "normativa_insert_auth" on normativa;
create policy "normativa_insert_auth"
  on normativa for insert
  to authenticated
  with check (true);

drop policy if exists "normativa_update_auth" on normativa;
create policy "normativa_update_auth"
  on normativa for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "normativa_delete_auth" on normativa;
create policy "normativa_delete_auth"
  on normativa for delete
  to authenticated
  using (true);

-- ═══════════════════════════════════════════════════════════════
-- Storage: bucket normativa-pdfs
-- ═══════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('normativa-pdfs', 'normativa-pdfs', true)
on conflict (id) do nothing;

drop policy if exists "normativa-pdfs_select_public" on storage.objects;
create policy "normativa-pdfs_select_public"
  on storage.objects for select
  using (bucket_id = 'normativa-pdfs');

drop policy if exists "normativa-pdfs_insert_auth" on storage.objects;
create policy "normativa-pdfs_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'normativa-pdfs');

drop policy if exists "normativa-pdfs_update_auth" on storage.objects;
create policy "normativa-pdfs_update_auth"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'normativa-pdfs')
  with check (bucket_id = 'normativa-pdfs');

drop policy if exists "normativa-pdfs_delete_auth" on storage.objects;
create policy "normativa-pdfs_delete_auth"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'normativa-pdfs');
