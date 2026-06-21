-- ═══════════════════════════════════════════════════════════════
-- LEXGEOCAT — 00. Extensiones y helpers compartidos
-- Ejecutar PRIMERO, una sola vez, en el SQL Editor de Supabase.
-- ═══════════════════════════════════════════════════════════════

-- gen_random_uuid() la usan normativa y cotizaciones
create extension if not exists "pgcrypto";

-- Función única de updated_at, reutilizada por todas las tablas.
-- (Antes existían dos copias casi idénticas: set_updated_at()
-- y update_normativa_updated_at(). Se deja solo esta.)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
