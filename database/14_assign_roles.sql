-- ============================================================
-- SPORTZONE PRO — Asignar Roles a Usuarios
-- ============================================================
-- 
-- Este script asigna roles a los usuarios de prueba
-- Ejecuta esto después de crear los usuarios en Authentication
--
-- ============================================================

-- Asignar rol de ADMIN
SELECT public.update_user_role(
  (SELECT id FROM auth.users WHERE email = 'admin@sportzone.com'),
  'admin'
);

-- Asignar rol de PLANILLERO
SELECT public.update_user_role(
  (SELECT id FROM auth.users WHERE email = 'planillero@sportzone.com'),
  'planillero'
);

-- Asignar rol de ÁRBITRO
SELECT public.update_user_role(
  (SELECT id FROM auth.users WHERE email = 'arbitro@sportzone.com'),
  'arbitro'
);

-- Verificar que los roles se asignaron correctamente
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
ORDER BY email;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Roles asignados exitosamente:';
  RAISE NOTICE '   - admin@sportzone.com → admin';
  RAISE NOTICE '   - planillero@sportzone.com → planillero';
  RAISE NOTICE '   - arbitro@sportzone.com → arbitro';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Verifica la tabla de arriba para confirmar los roles.';
END $$;
