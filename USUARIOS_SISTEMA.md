# 👥 Usuarios del Sistema SportZone Pro

## Usuarios Predeterminados

Según la documentación del proyecto, estos son los usuarios que deberías tener configurados:

### 🔴 Usuario Administrador

**Email:** `admin@sportzone.com`  
**Contraseña:** `Admin123!` (o la que configuraste)  
**Rol:** `admin`  
**Permisos:**
- Acceso completo al sistema
- Gestión de partidos
- Solicitudes y resoluciones
- Todos los módulos

---

### 🟢 Usuario Planillero

**Email:** `planillero@sportzone.com`  
**Contraseña:** `Planillero123!`  
**Rol:** `planillero`  
**Permisos:**
- Registrar eventos de partidos
- Iniciar y finalizar partidos
- Actualizar marcadores

---

### 🟡 Usuario Árbitro

**Email:** `arbitro@sportzone.com`  
**Contraseña:** `Arbitro123!`  
**Rol:** `arbitro`  
**Permisos:**
- Ver partidos asignados
- Reportar incidencias

---

## ¿Cómo Verificar Qué Usuarios Tienes?

### Opción 1: Desde Supabase Dashboard

1. Ve a: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Authentication → Users**
4. Verás la lista de todos los usuarios

### Opción 2: Desde SQL Editor

1. Ve a: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Ejecuta esta query:

```sql
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;
```

Esto te mostrará:
- Todos los emails
- El rol de cada usuario
- Cuándo se crearon
- Si están confirmados

---

## ¿Cómo Crear un Usuario Admin?

Si no tienes ningún usuario admin, sigue estos pasos:

### Paso 1: Crear el Usuario en Supabase

1. Ve a **Authentication → Users**
2. Haz clic en **"Add user"** → **"Create new user"**
3. Llena:
   - **Email**: `admin@sportzone.com` (o el que prefieras)
   - **Password**: `Admin123!` (o la que prefieras)
   - **✓ Marca**: "Auto Confirm User"
4. Haz clic en **"Create user"**

### Paso 2: Asignar Rol de Admin

1. Ve a **SQL Editor**
2. Ejecuta este código (cambia el email si usaste otro):

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@sportzone.com';
```

### Paso 3: Verificar

```sql
SELECT 
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@sportzone.com';
```

Deberías ver:
```
email: admin@sportzone.com
role: admin
```

---

## ¿Cómo Cambiar el Rol de un Usuario Existente?

Si ya tienes un usuario pero no tiene rol admin:

```sql
-- Cambiar a admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';

-- Cambiar a planillero
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"planillero"'
)
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';

-- Cambiar a árbitro
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"arbitro"'
)
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';

-- Cambiar a público
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"publico"'
)
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';
```

---

## ¿Cómo Resetear la Contraseña?

### Desde Supabase Dashboard:

1. Ve a **Authentication → Users**
2. Busca el usuario
3. Haz clic en los 3 puntos (⋮) al lado del usuario
4. Selecciona **"Send password reset email"**

O puedes cambiarla directamente:

1. Haz clic en el usuario
2. Haz clic en **"Reset password"**
3. Ingresa la nueva contraseña
4. Haz clic en **"Update user"**

---

## Resumen Rápido

**Para iniciar sesión como admin:**

1. Ve a: https://sportzone-web.vercel.app
2. Haz clic en "INICIAR SESIÓN"
3. Ingresa:
   - **Email**: El email que usaste (probablemente `admin@sportzone.com`)
   - **Password**: La contraseña que configuraste

**Si no sabes cuál es tu usuario admin:**

1. Ve a Supabase → Authentication → Users
2. Busca el usuario que tiene `role: admin` en los metadatos
3. Usa ese email para iniciar sesión

**Si no tienes ningún admin:**

1. Crea un usuario en Supabase (Authentication → Users → Add user)
2. Ejecuta el UPDATE en SQL Editor para asignar rol admin
3. Usa ese email y contraseña para iniciar sesión

---

## Archivos de Referencia

- Script SQL completo: `database/16_crear_primer_admin.sql`
- Documentación: `docs/CREAR_ADMIN.md`
- Configuración Supabase: `docs/SUPABASE_SETUP.md`
