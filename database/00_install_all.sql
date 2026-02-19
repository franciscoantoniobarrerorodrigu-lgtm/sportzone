-- ============================================================
-- SPORTZONE PRO — Instalación Completa
-- Script todo-en-uno para instalar toda la base de datos
-- ============================================================
-- 
-- ADVERTENCIA: Este script ejecuta TODOS los scripts de instalación
-- en el orden correcto. Solo ejecuta este script si quieres
-- instalar todo de una vez.
--
-- Para instalación paso a paso, ejecuta los scripts individuales
-- en el orden indicado en README.md
--
-- ============================================================

\echo '============================================================'
\echo 'SPORTZONE PRO - Instalación Completa'
\echo '============================================================'
\echo ''

-- ─────────────────────────────────────
-- 1. EXTENSIONES
-- ─────────────────────────────────────
\echo '1/13 Instalando extensiones...'
\i 01_extensions.sql

-- ─────────────────────────────────────
-- 2. TABLAS PRINCIPALES
-- ─────────────────────────────────────
\echo '2/13 Creando tablas principales...'
\i 02_tables_core.sql

-- ─────────────────────────────────────
-- 3. TABLAS DE PARTIDOS
-- ─────────────────────────────────────
\echo '3/13 Creando tablas de partidos...'
\i 03_tables_partidos.sql

-- ─────────────────────────────────────
-- 4. TABLAS ADMINISTRATIVAS
-- ─────────────────────────────────────
\echo '4/13 Creando tablas administrativas...'
\i 04_tables_admin.sql

-- ─────────────────────────────────────
-- 5. TABLAS DE NOTIFICACIONES
-- ─────────────────────────────────────
\echo '5/13 Creando tablas de notificaciones...'
\i 05_tables_notificaciones.sql

-- ─────────────────────────────────────
-- 6. TABLAS DE MARKETING
-- ─────────────────────────────────────
\echo '6/13 Creando tablas de marketing...'
\i 06_tables_marketing.sql

-- ─────────────────────────────────────
-- 7. VISTAS
-- ─────────────────────────────────────
\echo '7/13 Creando vistas...'
\i 07_views.sql

-- ─────────────────────────────────────
-- 8. FUNCIONES
-- ─────────────────────────────────────
\echo '8/13 Creando funciones...'
\i 08_functions.sql

-- ─────────────────────────────────────
-- 9. TRIGGERS
-- ─────────────────────────────────────
\echo '9/13 Creando triggers...'
\i 09_triggers.sql

-- ─────────────────────────────────────
-- 10. ROW LEVEL SECURITY
-- ─────────────────────────────────────
\echo '10/13 Configurando Row Level Security...'
\i 10_rls.sql

-- ─────────────────────────────────────
-- 11. ÍNDICES
-- ─────────────────────────────────────
\echo '11/13 Creando índices...'
\i 11_indexes.sql

-- ─────────────────────────────────────
-- 12. DATOS DE PRUEBA (OPCIONAL)
-- ─────────────────────────────────────
\echo '12/13 Insertando datos de prueba...'
\i 12_seed_data.sql

-- ─────────────────────────────────────
-- 13. CONFIGURACIÓN DE ROLES
-- ─────────────────────────────────────
\echo '13/13 Configurando sistema de roles...'
\i 13_auth_roles.sql

\echo ''
\echo '============================================================'
\echo 'Instalación completada exitosamente!'
\echo '============================================================'
\echo ''
\echo 'Próximos pasos:'
\echo '1. Verifica las tablas en Table Editor'
\echo '2. Crea usuarios de prueba en Authentication'
\echo '3. Asigna roles usando: SELECT public.update_user_role(user_id, role)'
\echo '4. Obtén las credenciales en Settings > API'
\echo '5. Continúa con la Fase 2: Backend API (.NET 8)'
\echo ''
