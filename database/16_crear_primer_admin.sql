-- ============================================================
-- SPORTZONE PRO — Crear Primer Usuario Admin
-- ============================================================
-- Este script crea el primer usuario admin sin necesidad de
-- tener permisos de admin previos.
-- ============================================================

-- ─────────────────────────────────────
-- OPCIÓN 1: Función temporal para crear primer admin
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_first_admin(user_email TEXT, new_role TEXT DEFAULT 'admin')
RETURNS void AS $$
BEGIN
  -- Actualizar rol en user_metadata (sin verificar permisos)
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new_role)
  )
  WHERE email = user_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario con email % no encontrado', user_email;
  END IF;

  RAISE NOTICE 'Rol % asignado a usuario %', new_role, user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_first_admin IS 'Crea el primer admin sin verificar permisos (usar solo una vez)';

-- ─────────────────────────────────────
-- INSTRUCCIONES DE USO
-- ─────────────────────────────────────

-- 1. Primero, crea el usuario en Supabase:
--    Authentication → Users → Add user
--    Email: admin@sportzone.com
--    Password: Admin123!
--    ✓ Auto Confirm User

-- 2. Luego, ejecuta esta función:
SELECT public.create_first_admin('admin@sportzone.com', 'admin');

-- 3. Verifica que funcionó:
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'admin@sportzone.com';

-- 4. (Opcional) Elimina la función temporal por seguridad:
-- DROP FUNCTION IF EXISTS public.create_first_admin(TEXT, TEXT);

-- ─────────────────────────────────────
-- OPCIÓN 2: Actualización directa (más simple)
-- ─────────────────────────────────────

-- Si prefieres no usar la función, puedes actualizar directamente:
-- (Reemplaza 'admin@sportzone.com' con el email que usaste)

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@sportzone.com';

-- Verifica:
SELECT 
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@sportzone.com';

-- ─────────────────────────────────────
-- CREAR USUARIOS ADICIONALES
-- ─────────────────────────────────────

-- Una vez que tengas un admin, puedes crear más usuarios con roles:

-- Planillero:
-- SELECT public.create_first_admin('planillero@sportzone.com', 'planillero');

-- Árbitro:
-- SELECT public.create_first_admin('arbitro@sportzone.com', 'arbitro');

-- Usuario público:
-- SELECT public.create_first_admin('usuario@sportzone.com', 'publico');

