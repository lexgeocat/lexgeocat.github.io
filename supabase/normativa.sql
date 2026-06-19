-- ============================================================
-- Tabla: normativa (Gaceta Normativa)
-- Uso:   admin.html — CRUD completo con subida de PDF
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists normativa (
  id                uuid primary key default gen_random_uuid(),
  titulo            text not null,
  categoria         text not null default 'leyes'
                    check (categoria in ('leyes','codigos','decretos_reglamentarios','jurisprudencia','doctrina')),
  numero_norma      text,
  fecha_promulgacion date,
  fecha_publicacion  date,
  estado            text not null default 'vigente'
                    check (estado in ('vigente','derogada','modificada')),
  activo            boolean not null default true,
  resumen           text,
  palabras_clave    text[] default '{}',
  archivo_url       text,
  archivo_path      text,
  archivo_nombre    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- índice para búsqueda y orden
create index if not exists idx_normativa_fecha_pub on normativa (fecha_publicacion desc);
create index if not exists idx_normativa_categoria on normativa (categoria);
create index if not exists idx_normativa_estado on normativa (estado);
create index if not exists idx_normativa_activo on normativa (activo);

-- trigger para updated_at
create or replace function update_normativa_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_normativa_updated_at on normativa;
create trigger trg_normativa_updated_at
  before update on normativa
  for each row execute function update_normativa_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- Bucket de storage: normativa-pdfs
-- ═══════════════════════════════════════════════════════════════
-- Ejecutar desde SQL Editor de Supabase (igual que arriba)

-- RLS: permitir lectura anónima, escritura solo autenticados
insert into storage.buckets (id, name, public)
values ('normativa-pdfs', 'normativa-pdfs', true)
on conflict (id) do nothing;

-- policy: lectura pública (el sitio necesita ver los PDFs)
create policy "normativa-pdfs_select_public"
on storage.objects for select
using ( bucket_id = 'normativa-pdfs' );

-- policy: solo usuarios autenticados pueden subir/borrar
create policy "normativa-pdfs_insert_auth"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'normativa-pdfs' );

create policy "normativa-pdfs_delete_auth"
on storage.objects for delete
to authenticated
using ( bucket_id = 'normativa-pdfs' );

-- ═══════════════════════════════════════════════════════════════
-- RLS para la tabla normativa
-- ═══════════════════════════════════════════════════════════════
alter table normativa enable row level security;

-- lectura para todos (sitio público + admin autenticado)
create policy "normativa_select_all"
on normativa for select
using ( true );

-- escritura solo autenticados (admin)
create policy "normativa_insert_auth"
on normativa for insert
to authenticated
with check ( true );

create policy "normativa_update_auth"
on normativa for update
to authenticated
using ( true );

create policy "normativa_delete_auth"
on normativa for delete
to authenticated
using ( true );
