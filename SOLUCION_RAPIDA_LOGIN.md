# 🚀 Solución Rápida - Login en Vercel

## El Problema
El login no funciona en https://sportzone-web.vercel.app

## La Solución (10 minutos)

### 📍 PASO 1: Abrir Supabase
1. Ve a: **https://app.supabase.com**
2. Inicia sesión
3. Selecciona tu proyecto

### 📍 PASO 2: Configurar URLs (2 minutos)

```
Menú lateral → Authentication → URL Configuration
```

**Site URL** (pega esto):
```
https://sportzone-web.vercel.app
```

**Redirect URLs** (pega estas 3 líneas, una por una):
```
https://sportzone-web.vercel.app/**
https://sportzone-web.vercel.app/auth/callback
http://localhost:4200/**
```

Haz clic en **Save**

### 📍 PASO 3: Crear Usuario Admin (3 minutos)

```
Menú lateral → Authentication → Users → Add user
```

Llena el formulario:
- **Email**: `admin@sportzone.com`
- **Password**: `Admin123!`
- **✓ Marca**: "Auto Confirm User"

Haz clic en **Create user**

### 📍 PASO 4: Asignar Rol Admin (2 minutos)

```
Menú lateral → SQL Editor → New query
```

Copia y pega esto:
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@sportzone.com';
```

Haz clic en **Run** (o Ctrl+Enter)

### 📍 PASO 5: Verificar (1 minuto)

En el mismo SQL Editor, ejecuta esto:
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

### 📍 PASO 6: Probar Login (1 minuto)

1. Ve a: **https://sportzone-web.vercel.app**
2. Presiona **F5** (refrescar)
3. Haz clic en **"INICIAR SESIÓN"**
4. Ingresa:
   - Email: `admin@sportzone.com`
   - Password: `Admin123!`
5. Haz clic en **"Iniciar Sesión"**

## ✅ ¡Listo!

Deberías poder iniciar sesión y ver el dashboard.

## ❌ Si No Funciona

Abre la consola del navegador:
1. Presiona **F12**
2. Ve a la pestaña **Console**
3. Intenta iniciar sesión
4. Copia cualquier error en rojo que aparezca

## 📝 Notas

- El backend local NO es necesario para el login
- Vercel se conecta directamente a Supabase
- Solo necesitas estos 6 pasos para que funcione

## 🔗 Archivos de Referencia

- Instrucciones detalladas: `ARREGLAR_LOGIN_VERCEL.md`
- Script SQL completo: `database/16_crear_primer_admin.sql`
- Documentación Supabase: `docs/SUPABASE_SETUP.md`
