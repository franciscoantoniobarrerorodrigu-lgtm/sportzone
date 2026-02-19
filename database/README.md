# SportZone Pro - Scripts de Base de Datos

Este directorio contiene todos los scripts SQL necesarios para configurar la base de datos de SportZone Pro en Supabase.

## Orden de Ejecución

Ejecuta los scripts en el siguiente orden en el SQL Editor de Supabase:

### 1. Extensiones
```bash
01_extensions.sql
```
Instala las extensiones necesarias de PostgreSQL (uuid-ossp, pgcrypto).

### 2. Tablas Principales
```bash
02_tables_core.sql
```
Crea las tablas: temporadas, torneos, equipos, jugadores.

### 3. Tablas de Partidos
```bash
03_tables_partidos.sql
```
Crea las tablas: partidos, eventos_partido, posiciones, estadisticas_jugador.

### 4. Tablas Administrativas
```bash
04_tables_admin.sql
```
Crea las tablas: suspensiones, solicitudes, resoluciones.

### 5. Tablas de Notificaciones
```bash
05_tables_notificaciones.sql
```
Crea las tablas: suscripciones_notificaciones, dispositivos_fcm.

### 6. Tablas de Marketing
```bash
06_tables_marketing.sql
```
Crea las tablas: campanas_marketing, patrocinadores.

### 7. Vistas
```bash
07_views.sql
```
Crea las vistas: v_goleadores, v_tabla_posiciones, v_partidos_completos.

### 8. Funciones
```bash
08_functions.sql
```
Crea las funciones: update_updated_at, fn_actualizar_posiciones, fn_verificar_suspensiones.

### 9. Triggers
```bash
09_triggers.sql
```
Crea el trigger: trg_actualizar_estadisticas (actualiza estadísticas automáticamente al registrar eventos).

### 10. Row Level Security (RLS)
```bash
10_rls.sql
```
Configura las políticas de seguridad para todas las tablas.

### 11. Índices
```bash
11_indexes.sql
```
Crea todos los índices para optimizar el rendimiento de consultas.

### 12. Datos de Prueba (Opcional)
```bash
12_seed_data.sql
```
Inserta datos de prueba: 1 temporada, 1 torneo, 4 equipos, jugadores, y 1 partido.

## Instrucciones de Ejecución en Supabase

1. **Accede a tu proyecto en Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New query"

3. **Ejecuta cada script**
   - Copia el contenido de cada archivo SQL
   - Pégalo en el editor
   - Haz clic en "Run" o presiona Ctrl+Enter
   - Verifica que no haya errores antes de continuar con el siguiente

4. **Verifica la instalación**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver todas las tablas creadas
   - Ve a "Database" → "Functions" para ver las funciones
   - Ve a "Database" → "Triggers" para ver los triggers

## Configuración de Autenticación

Después de ejecutar los scripts, configura la autenticación:

1. **Habilitar Email Auth**
   - Ve a "Authentication" → "Providers"
   - Habilita "Email"

2. **Crear usuarios de prueba**
   - Ve a "Authentication" → "Users"
   - Haz clic en "Add user"
   - Crea usuarios con diferentes roles:
     - Admin: `admin@sportzone.com`
     - Planillero: `planillero@sportzone.com`
     - Árbitro: `arbitro@sportzone.com`

3. **Asignar roles**
   - Ejecuta este SQL para asignar roles:
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{role}',
     '"admin"'
   )
   WHERE email = 'admin@sportzone.com';
   ```

## Obtener Credenciales

Después de configurar la base de datos, obtén las credenciales:

1. **URL del Proyecto**
   - Ve a "Settings" → "API"
   - Copia "Project URL"

2. **Anon Key**
   - En la misma página, copia "anon public"

3. **JWT Secret**
   - Ve a "Settings" → "API"
   - Copia "JWT Secret"

Estas credenciales las necesitarás para configurar el backend .NET 8.

## Verificación

Para verificar que todo está correcto, ejecuta estas consultas:

```sql
-- Verificar tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verificar datos de prueba
SELECT * FROM temporadas;
SELECT * FROM torneos;
SELECT * FROM equipos;
SELECT * FROM jugadores LIMIT 10;
```

## Troubleshooting

### Error: "extension uuid-ossp does not exist"
- Asegúrate de ejecutar primero `01_extensions.sql`

### Error: "relation does not exist"
- Verifica que ejecutaste los scripts en el orden correcto
- Las tablas deben crearse antes que las vistas y funciones que las referencian

### Error: "permission denied"
- Verifica que tienes permisos de administrador en el proyecto de Supabase

### Error en RLS
- Si tienes problemas con Row Level Security, puedes deshabilitarlo temporalmente:
  ```sql
  ALTER TABLE nombre_tabla DISABLE ROW LEVEL SECURITY;
  ```

## Próximos Pasos

Una vez completada la configuración de la base de datos:

1. ✅ Fase 1 completada
2. → Continuar con Fase 2: Backend API (.NET 8)
3. → Configurar el proyecto .NET 8
4. → Implementar servicios y controllers

## Notas Importantes

- **Backup**: Siempre haz backup antes de ejecutar scripts en producción
- **Entorno**: Estos scripts están diseñados para desarrollo. Para producción, revisa las configuraciones de seguridad
- **Datos de prueba**: El script `12_seed_data.sql` es opcional y solo para desarrollo
