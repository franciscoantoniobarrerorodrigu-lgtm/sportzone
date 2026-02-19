-- ============================================================
-- SPORTZONE PRO — Configuración de Roles de Usuario
-- ============================================================

-- ─────────────────────────────────────
-- FUNCIÓN: Asignar rol por defecto
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Por defecto, todos los usuarios son "publico"
  NEW.raw_user_meta_data = jsonb_set(
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"publico"'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user IS 'Asigna rol por defecto a nuevos usuarios';

-- ─────────────────────────────────────
-- TRIGGER: Asignar rol al crear usuario
-- ─────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────
-- FUNCIÓN: Actualizar rol de usuario
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_user_role(user_id UUID, new_role TEXT)
RETURNS void AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF (auth.jwt() ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Solo administradores pueden cambiar roles';
  END IF;

  -- Validar rol
  IF new_role NOT IN ('admin', 'planillero', 'arbitro', 'publico') THEN
    RAISE EXCEPTION 'Rol inválido. Roles válidos: admin, planillero, arbitro, publico';
  END IF;

  -- Actualizar rol en user_metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new_role)
  )
  WHERE id = user_id;

  RAISE NOTICE 'Rol actualizado a % para usuario %', new_role, user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_user_role IS 'Actualiza el rol de un usuario (solo admin)';

-- ─────────────────────────────────────
-- EJEMPLOS DE USO
-- ─────────────────────────────────────

-- Para asignar rol de admin a un usuario:
-- SELECT public.update_user_role('user-uuid-aqui', 'admin');

-- Para asignar rol de planillero:
-- SELECT public.update_user_role('user-uuid-aqui', 'planillero');

-- Para asignar rol de árbitro:
-- SELECT public.update_user_role('user-uuid-aqui', 'arbitro');

-- ─────────────────────────────────────
-- CONSULTAS ÚTILES
-- ─────────────────────────────────────

-- Ver todos los usuarios con sus roles:
-- SELECT 
--   id,
--   email,
--   raw_user_meta_data->>'role' as role,
--   created_at
-- FROM auth.users
-- ORDER BY created_at DESC;

-- Contar usuarios por rol:
-- SELECT 
--   raw_user_meta_data->>'role' as role,
--   COUNT(*) as total
-- FROM auth.users
-- GROUP BY raw_user_meta_data->>'role';
