-- ============================================================
-- SPORTZONE PRO — Eliminar Todas las Tablas (VERSIÓN MEJORADA)
-- ============================================================
-- 
-- ADVERTENCIA: Este script ELIMINA todas las tablas y datos
-- Solo ejecuta esto si quieres empezar desde cero
--
-- ============================================================

-- Deshabilitar Row Level Security temporalmente
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- Eliminar vistas
DROP VIEW IF EXISTS v_partidos_completos CASCADE;
DROP VIEW IF EXISTS v_tabla_posiciones CASCADE;
DROP VIEW IF EXISTS v_goleadores CASCADE;

-- Eliminar triggers de auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.update_user_role(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS trg_actualizar_estadisticas() CASCADE;
DROP FUNCTION IF EXISTS fn_verificar_suspensiones(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS fn_actualizar_posiciones(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Eliminar tablas con CASCADE para eliminar todas las dependencias
DROP TABLE IF EXISTS dispositivos_fcm CASCADE;
DROP TABLE IF EXISTS suscripciones_notificaciones CASCADE;
DROP TABLE IF EXISTS patrocinadores CASCADE;
DROP TABLE IF EXISTS campanas_marketing CASCADE;
DROP TABLE IF EXISTS resoluciones CASCADE;
DROP TABLE IF EXISTS solicitudes CASCADE;
DROP TABLE IF EXISTS suspensiones CASCADE;
DROP TABLE IF EXISTS estadisticas_jugador CASCADE;
DROP TABLE IF EXISTS eventos_partido CASCADE;
DROP TABLE IF EXISTS posiciones CASCADE;
DROP TABLE IF EXISTS partidos CASCADE;
DROP TABLE IF EXISTS jugadores CASCADE;
DROP TABLE IF EXISTS equipos CASCADE;
DROP TABLE IF EXISTS torneos CASCADE;
DROP TABLE IF EXISTS temporadas CASCADE;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Todas las tablas han sido eliminadas exitosamente.';
  RAISE NOTICE '📋 Ahora puedes ejecutar los scripts de instalación (01_extensions.sql, 02_tables_core.sql, etc.)';
END $$;
