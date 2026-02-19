# 🔧 Solución: Login No Funciona en Vercel

## El Problema

El botón de "INICIAR SESIÓN" está "tico" (no responde) porque **Supabase no reconoce tu dominio de Vercel**.

## La Solución (3 pasos - 5 minutos)

### ✅ PASO 1: Abrir Supabase

1. Ve a: **https://app.supabase.com**
2. Inicia sesión
3. Selecciona tu proyecto: `husilgpjmqqsccmvbbka`

### ✅ PASO 2: Configurar URLs Permitidas

1. En el menú izquierdo, haz clic en: **Authentication**
2. Luego haz clic en: **URL Configuration**
3. Verás dos secciones:

#### Site URL
Cambia esto a:
```
https://sportzone-web.vercel.app
```

#### Redirect URLs
Agrega estas 3 URLs (haz clic en "Add URL" para cada una):

```
https://sportzone-web.vercel.app/**
```

```
https://sportzone-web.vercel.app/auth/callback
```

```
http://localhost:4200/**
```

4. Haz clic en **"Save"** (abajo a la derecha)

### ✅ PASO 3: Probar

1. Ve a: **https://sportzone-web.vercel.app**
2. Presiona **Ctrl + Shift + R** (para limpiar caché)
3. Haz clic en **"INICIAR SESIÓN"**
4. Ingresa tu email y contraseña
5. ¡Debería funcionar!

---

## 🔑 ¿Qué Usuario Usar?

Según tu configuración, deberías tener:

**Email:** `admin@sportzone.com`  
**Contraseña:** La que configuraste (probablemente `Admin123!`)

### ¿No sabes cuál es tu usuario admin?

1. Ve a Supabase → **Authentication** → **Users**
2. Verás la lista de usuarios
3. Busca el que tiene rol `admin`

### ¿Ningún usuario tiene rol admin?

Ejecuta esto en Supabase → **SQL Editor**:

```sql
-- Ver todos los usuarios y sus roles
SELECT 
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users;
```

Si algún usuario no tiene rol, asígnale admin así:

```sql
-- Cambiar el email por el tuyo
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'TU_EMAIL@ejemplo.com';
```

---

## 🐛 Si Todavía No Funciona

### Opción 1: Ver el error en el navegador

1. En la página de Vercel, presiona **F12**
2. Haz clic en la pestaña **"Console"**
3. Intenta iniciar sesión
4. Copia cualquier mensaje en ROJO
5. Mándame ese mensaje

### Opción 2: Verificar que las URLs se guardaron

1. Ve a Supabase → Authentication → URL Configuration
2. Verifica que las 3 URLs estén ahí
3. Si no están, agrégalas de nuevo

### Opción 3: Limpiar caché del navegador

1. Presiona **Ctrl + Shift + Delete**
2. Selecciona "Últimas 24 horas"
3. Marca "Caché" e "Imágenes"
4. Haz clic en "Borrar datos"
5. Cierra y abre el navegador
6. Intenta de nuevo

---

## 📸 Cómo Se Ve en Supabase

Cuando vayas a **Authentication → URL Configuration**, deberías ver algo así:

```
┌─────────────────────────────────────────────────────┐
│ Site URL                                            │
│ ┌─────────────────────────────────────────────────┐│
│ │ https://sportzone-web.vercel.app                ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│ Redirect URLs                                       │
│ • https://sportzone-web.vercel.app/**              │
│ • https://sportzone-web.vercel.app/auth/callback   │
│ • http://localhost:4200/**                          │
│                                                      │
│                                        [Save]       │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Resumen

**El problema:** Supabase no sabe que tu dominio de Vercel está autorizado.

**La solución:** Agregar las URLs de Vercel en la configuración de Supabase.

**Tiempo:** 5 minutos

**Resultado:** El login funcionará correctamente.

---

## 📞 Necesitas Ayuda?

Mándame:
1. Captura de pantalla de URL Configuration en Supabase
2. El error de la consola del navegador (F12 → Console)
3. El email que estás usando para iniciar sesión
