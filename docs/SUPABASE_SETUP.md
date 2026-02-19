# Guía de Configuración de Supabase para SportZone Pro

Esta guía te llevará paso a paso por la configuración completa de Supabase para SportZone Pro.

## Requisitos Previos

- Cuenta en Supabase (https://supabase.com)
- Navegador web moderno

## Paso 1: Crear Proyecto en Supabase

1. **Accede a Supabase**
   - Ve a https://app.supabase.com
   - Inicia sesión o crea una cuenta

2. **Crear nuevo proyecto**
   - Haz clic en "New Project"
   - Nombre del proyecto: `sportzone-pro`
   - Database Password: Genera una contraseña segura (guárdala)
   - Region: Selecciona la más cercana a tus usuarios
   - Pricing Plan: Selecciona "Free" para desarrollo
   - Haz clic en "Create new project"

3. **Espera a que el proyecto se inicialice**
   - Esto puede tomar 1-2 minutos
   - Verás un indicador de progreso

## Paso 2: Ejecutar Scripts de Base de Datos

### Opción A: Instalación Completa (Recomendado)

1. **Abre el SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New query"

2. **Ejecuta el script de instalación completa**
   - Abre el archivo `database/00_install_all.sql`
   - Copia todo el contenido
   - Pégalo en el SQL Editor
   - Haz clic en "Run" (o presiona Ctrl+Enter)

3. **Verifica que no haya errores**
   - Revisa la consola de salida
   - Deberías ver mensajes de éxito para cada paso

### Opción B: Instalación Paso a Paso

Si prefieres ejecutar los scripts uno por uno:

1. Ejecuta cada script en orden:
   ```
   01_extensions.sql
   02_tables_core.sql
   03_tables_partidos.sql
   04_tables_admin.sql
   05_tables_notificaciones.sql
   06_tables_marketing.sql
   07_views.sql
   08_functions.sql
   09_triggers.sql
   10_rls.sql
   11_indexes.sql
   12_seed_data.sql (opcional)
   13_auth_roles.sql
   ```

2. Para cada script:
   - Abre el archivo
   - Copia el contenido
   - Pégalo en el SQL Editor
   - Haz clic en "Run"
   - Verifica que no haya errores antes de continuar

## Paso 3: Verificar la Instalación

1. **Verificar tablas**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver todas las tablas:
     - temporadas
     - torneos
     - equipos
     - jugadores
     - partidos
     - eventos_partido
     - posiciones
     - estadisticas_jugador
     - suspensiones
     - solicitudes
     - resoluciones
     - suscripciones_notificaciones
     - dispositivos_fcm
     - campanas_marketing
     - patrocinadores

2. **Verificar funciones**
   - Ve a "Database" → "Functions"
   - Deberías ver:
     - update_updated_at
     - fn_actualizar_posiciones
     - fn_verificar_suspensiones
     - trg_actualizar_estadisticas
     - handle_new_user
     - update_user_role

3. **Verificar triggers**
   - Ve a "Database" → "Triggers"
   - Deberías ver:
     - trg_solicitudes_updated
     - trg_dispositivos_fcm_updated
     - trg_eventos_actualizar_estadisticas
     - on_auth_user_created

4. **Verificar datos de prueba**
   - Ve a "Table Editor" → "temporadas"
   - Deberías ver 1 temporada: "2024/2025"
   - Ve a "equipos"
   - Deberías ver 4 equipos: Águilas FC, Leones United, Tigres SC, Halcones CF

## Paso 4: Configurar Autenticación

1. **Habilitar Email Authentication**
   - Ve a "Authentication" → "Providers"
   - Asegúrate de que "Email" esté habilitado
   - Configura las opciones:
     - Enable email confirmations: Deshabilitado (para desarrollo)
     - Enable email signups: Habilitado

2. **Crear usuarios de prueba**
   - Ve a "Authentication" → "Users"
   - Haz clic en "Add user" → "Create new user"
   
   **Usuario Administrador:**
   - Email: `admin@sportzone.com`
   - Password: `Admin123!` (cámbialo en producción)
   - Auto Confirm User: ✓ (marcado)
   
   **Usuario Planillero:**
   - Email: `planillero@sportzone.com`
   - Password: `Planillero123!`
   - Auto Confirm User: ✓
   
   **Usuario Árbitro:**
   - Email: `arbitro@sportzone.com`
   - Password: `Arbitro123!`
   - Auto Confirm User: ✓

3. **Asignar roles a los usuarios**
   - Ve a "SQL Editor"
   - Ejecuta estos comandos para asignar roles:

   ```sql
   -- Asignar rol de admin
   SELECT public.update_user_role(
     (SELECT id FROM auth.users WHERE email = 'admin@sportzone.com'),
     'admin'
   );

   -- Asignar rol de planillero
   SELECT public.update_user_role(
     (SELECT id FROM auth.users WHERE email = 'planillero@sportzone.com'),
     'planillero'
   );

   -- Asignar rol de árbitro
   SELECT public.update_user_role(
     (SELECT id FROM auth.users WHERE email = 'arbitro@sportzone.com'),
     'arbitro'
   );
   ```

4. **Verificar roles asignados**
   ```sql
   SELECT 
     email,
     raw_user_meta_data->>'role' as role,
     created_at
   FROM auth.users
   ORDER BY created_at DESC;
   ```

## Paso 5: Obtener Credenciales

1. **Obtener URL del Proyecto**
   - Ve a "Settings" → "API"
   - Copia "Project URL"
   - Ejemplo: `https://abcdefghijklmnop.supabase.co`

2. **Obtener Anon Key**
   - En la misma página, busca "Project API keys"
   - Copia "anon public"
   - Esta es la clave pública que usarás en el frontend

3. **Obtener Service Role Key**
   - En la misma página, copia "service_role"
   - ⚠️ IMPORTANTE: Esta clave es secreta, solo úsala en el backend

4. **Obtener JWT Secret**
   - Ve a "Settings" → "API"
   - Busca "JWT Settings"
   - Copia "JWT Secret"
   - Esta clave se usa para validar tokens JWT en el backend

5. **Guardar credenciales**
   - Crea un archivo `.env` en la raíz del proyecto:
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key-aqui
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
   SUPABASE_JWT_SECRET=tu-jwt-secret-aqui
   ```

## Paso 6: Configurar Realtime (Opcional)

1. **Habilitar Realtime para tablas**
   - Ve a "Database" → "Replication"
   - Habilita Realtime para estas tablas:
     - partidos
     - eventos_partido
     - posiciones
     - estadisticas_jugador

2. **Configurar políticas de Realtime**
   - Las políticas RLS ya están configuradas
   - Realtime respetará las mismas políticas

## Paso 7: Probar la Configuración

1. **Probar autenticación**
   - Ve a "Authentication" → "Users"
   - Haz clic en un usuario
   - Verifica que el rol esté en "User Metadata"

2. **Probar consultas**
   - Ve a "SQL Editor"
   - Ejecuta consultas de prueba:

   ```sql
   -- Ver tabla de posiciones
   SELECT * FROM v_tabla_posiciones;

   -- Ver goleadores
   SELECT * FROM v_goleadores;

   -- Ver partidos
   SELECT * FROM v_partidos_completos;
   ```

3. **Probar funciones**
   ```sql
   -- Crear un partido de prueba y finalizarlo
   UPDATE partidos 
   SET estado = 'finalizado', goles_local = 2, goles_visita = 1
   WHERE id = '55555555-5555-5555-5555-555555555551';

   -- Actualizar posiciones
   SELECT fn_actualizar_posiciones('55555555-5555-5555-5555-555555555551');

   -- Ver posiciones actualizadas
   SELECT * FROM v_tabla_posiciones;
   ```

## Troubleshooting

### Error: "permission denied for schema public"
**Solución:** Verifica que estás usando el SQL Editor con permisos de administrador.

### Error: "relation does not exist"
**Solución:** Asegúrate de ejecutar los scripts en el orden correcto. Las tablas deben crearse antes que las vistas y funciones.

### Error: "function does not exist"
**Solución:** Ejecuta primero los scripts de funciones (08_functions.sql) antes de los triggers (09_triggers.sql).

### Los roles no se asignan correctamente
**Solución:** 
1. Verifica que ejecutaste `13_auth_roles.sql`
2. Asegúrate de usar la función `update_user_role` como admin
3. Verifica con: `SELECT * FROM auth.users;`

### Realtime no funciona
**Solución:**
1. Verifica que habilitaste Realtime en "Database" → "Replication"
2. Verifica que las políticas RLS permiten lectura pública
3. Revisa la consola del navegador para errores de conexión

## Próximos Pasos

✅ Supabase configurado correctamente

Ahora puedes continuar con:
1. **Fase 2**: Configurar el Backend API (.NET 8)
2. Usar las credenciales obtenidas en `appsettings.json`
3. Implementar los servicios y controllers

## Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)
