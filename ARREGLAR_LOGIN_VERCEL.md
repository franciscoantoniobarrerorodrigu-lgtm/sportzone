# 🔧 Arreglar Login en Vercel - Pasos Simples

## Problema Actual

El login en https://sportzone-web.vercel.app no funciona porque:
1. Supabase no tiene configuradas las URLs de Vercel
2. No hay un usuario admin creado en Supabase

## Solución en 3 Pasos

### Paso 1: Configurar URLs en Supabase (5 minutos)

1. **Abre Supabase**:
   - Ve a: https://app.supabase.com
   - Inicia sesión
   - Selecciona tu proyecto (el que tiene la URL: `husilgpjmqqsccmvbbka.supabase.co`)

2. **Configura las URLs**:
   - En el menú lateral, haz clic en **"Authentication"**
   - Haz clic en **"URL Configuration"**
   - En **"Site URL"**, pega esto:
     ```
     https://sportzone-web.vercel.app
     ```
   - En **"Redirect URLs"**, agrega estas 3 líneas (una por una):
     ```
     https://sportzone-web.vercel.app/**
     https://sportzone-web.vercel.app/auth/callback
     http://localhost:4200/**
     ```
   - Haz clic en **"Save"**

### Paso 2: Crear Usuario Admin (3 minutos)

1. **Ir a Users**:
   - En el menú lateral de Supabase, haz clic en **"Authentication"**
   - Haz clic en **"Users"**

2. **Crear nuevo usuario**:
   - Haz clic en **"Add user"** (botón verde arriba a la derecha)
   - Selecciona **"Create new user"**
   - Llena el formulario:
     - **Email**: `admin@sportzone.com`
     - **Password**: `Admin123!` (o la que prefieras)
     - **✓ Marca la casilla**: "Auto Confirm User"
   - Haz clic en **"Create user"**

3. **Asignar rol de admin**:
   - En el menú lateral, haz clic en **"SQL Editor"**
   - Haz clic en **"New query"**
   - Copia y pega este código (IMPORTANTE: usa este, no el otro):
     ```sql
     UPDATE auth.users
     SET raw_user_meta_data = jsonb_set(
       COALESCE(raw_user_meta_data, '{}'::jsonb),
       '{role}',
       '"admin"'
     )
     WHERE email = 'admin@sportzone.com';
     ```
   - Haz clic en **"Run"** (o presiona Ctrl+Enter)
   - Deberías ver: "Success. No rows returned"

4. **Verificar que funcionó**:
   - En el SQL Editor, ejecuta esto:
     ```sql
     SELECT 
       email,
       raw_user_meta_data->>'role' as role
     FROM auth.users
     WHERE email = 'admin@sportzone.com';
     ```
   - Deberías ver:
     ```
     email: admin@sportzone.com
     role: admin
     ```

### Paso 3: Probar el Login (1 minuto)

1. **Abre la aplicación**:
   - Ve a: https://sportzone-web.vercel.app
   - Presiona F5 para refrescar la página (importante)

2. **Inicia sesión**:
   - Haz clic en **"INICIAR SESIÓN"**
   - Ingresa:
     - **Email**: `admin@sportzone.com`
     - **Password**: `Admin123!` (o la que usaste)
   - Haz clic en **"Iniciar Sesión"**

3. **¡Debería funcionar!**
   - Deberías ver el dashboard
   - Si no funciona, abre la consola del navegador (F12) y mándame el error

## Si Todavía No Funciona

### Opción A: Revisar la Consola del Navegador

1. Abre https://sportzone-web.vercel.app
2. Presiona **F12** para abrir las herramientas de desarrollador
3. Ve a la pestaña **"Console"**
4. Intenta iniciar sesión
5. Copia cualquier error que aparezca en rojo

### Opción B: Verificar que Supabase esté configurado

Ejecuta esto en el SQL Editor de Supabase:

```sql
-- Verificar que la función existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'update_user_role';

-- Verificar que el usuario existe
SELECT email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@sportzone.com';
```

Si la función no existe, ejecuta el archivo `database/13_auth_roles.sql` en Supabase.

## Capturas de Pantalla de Referencia

### Configuración de URLs en Supabase:
```
Authentication → URL Configuration

Site URL:
┌─────────────────────────────────────────┐
│ https://sportzone-web.vercel.app        │
└─────────────────────────────────────────┘

Redirect URLs:
┌─────────────────────────────────────────┐
│ https://sportzone-web.vercel.app/**     │
│ https://sportzone-web.vercel.app/auth/  │
│   callback                               │
│ http://localhost:4200/**                 │
└─────────────────────────────────────────┘
```

### Crear Usuario:
```
Authentication → Users → Add user

Email:
┌─────────────────────────────────────────┐
│ admin@sportzone.com                      │
└─────────────────────────────────────────┘

Password:
┌─────────────────────────────────────────┐
│ Admin123!                                │
└─────────────────────────────────────────┘

☑ Auto Confirm User
```

## Notas Importantes

- **El backend local NO afecta Vercel**: El frontend en Vercel se conecta directamente a Supabase, no al backend local
- **El backend es opcional**: Para que funcione el login, solo necesitas Supabase configurado
- **Las funcionalidades del backend**: Solo funcionarán cuando despliegues el backend en Azure o similar

## Resumen

1. ✅ Configurar URLs en Supabase (Authentication → URL Configuration)
2. ✅ Crear usuario admin (Authentication → Users → Add user)
3. ✅ Asignar rol admin (SQL Editor → ejecutar update_user_role)
4. ✅ Probar login en Vercel

Después de estos 3 pasos, el login debería funcionar perfectamente.
