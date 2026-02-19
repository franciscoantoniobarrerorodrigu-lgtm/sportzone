# ⚡ ARREGLAR LOGIN AHORA - 5 MINUTOS

## El botón de login está "tico" (no responde)

### ✅ SOLUCIÓN RÁPIDA

Ve a Supabase y haz esto EXACTAMENTE:

---

## 🔧 PASO 1: Abrir Supabase

1. Abre: **https://app.supabase.com**
2. Inicia sesión
3. Haz clic en tu proyecto (el que dice `husilgpjmqqsccmvbbka`)

---

## 🔧 PASO 2: Ir a Authentication

En el menú de la izquierda, haz clic en:
```
⚙️ Authentication
```

---

## 🔧 PASO 3: Ir a URL Configuration

Dentro de Authentication, haz clic en:
```
🔗 URL Configuration
```

---

## 🔧 PASO 4: Configurar Site URL

Busca donde dice **"Site URL"** y pega esto:
```
https://sportzone-web.vercel.app
```

---

## 🔧 PASO 5: Agregar Redirect URLs

Busca donde dice **"Redirect URLs"**

Verás un botón que dice **"Add URL"** o un campo de texto.

Agrega estas 3 URLs (una por una):

**URL 1:**
```
https://sportzone-web.vercel.app/**
```
(Haz clic en "Add URL" o presiona Enter)

**URL 2:**
```
https://sportzone-web.vercel.app/auth/callback
```
(Haz clic en "Add URL" o presiona Enter)

**URL 3:**
```
http://localhost:4200/**
```
(Haz clic en "Add URL" o presiona Enter)

---

## 🔧 PASO 6: Guardar

Haz clic en el botón **"Save"** (abajo a la derecha)

---

## 🔧 PASO 7: Probar Login

1. Ve a: **https://sportzone-web.vercel.app**
2. Presiona **Ctrl + Shift + R** (refrescar forzado)
3. Haz clic en **"INICIAR SESIÓN"**
4. Ingresa tu email y contraseña
5. Haz clic en **"Iniciar Sesión"**

---

## ❓ ¿Qué pasa si todavía no funciona?

### Opción A: Ver el error en la consola

1. En la página de Vercel, presiona **F12**
2. Haz clic en la pestaña **"Console"**
3. Intenta iniciar sesión
4. Copia cualquier mensaje en ROJO que aparezca
5. Mándame ese mensaje

### Opción B: Verificar que las URLs se guardaron

1. Ve a Supabase → Authentication → URL Configuration
2. Verifica que las 3 URLs estén en la lista
3. Si no están, agrégalas de nuevo y guarda

### Opción C: Verificar que el usuario tiene rol admin

1. Ve a Supabase → SQL Editor
2. Haz clic en "New query"
3. Pega esto:
```sql
SELECT 
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users;
```
4. Haz clic en "Run"
5. Verifica que tu usuario tenga `role: admin`

Si no tiene rol, ejecuta esto (cambia el email):
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';
```

---

## 📸 Cómo se ve en Supabase

```
┌─────────────────────────────────────────────────────┐
│ Authentication                                       │
├─────────────────────────────────────────────────────┤
│ > Users                                             │
│ > Policies                                          │
│ > Providers                                         │
│ > Email Templates                                   │
│ > URL Configuration  ← HAZ CLIC AQUÍ               │
│ > Hooks                                             │
└─────────────────────────────────────────────────────┘

Luego verás:

┌─────────────────────────────────────────────────────┐
│ URL Configuration                                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Site URL                                            │
│ ┌─────────────────────────────────────────────────┐│
│ │ https://sportzone-web.vercel.app                ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│ Redirect URLs                                       │
│ ┌─────────────────────────────────────────────────┐│
│ │ https://sportzone-web.vercel.app/**             ││
│ │ https://sportzone-web.vercel.app/auth/callback  ││
│ │ http://localhost:4200/**                         ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│                              [Save] ← HAZ CLIC AQUÍ │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Resumen

El problema es que Supabase no sabe que tu dominio de Vercel está autorizado.

Una vez que agregues las URLs y guardes, el login funcionará.

**Tiempo estimado: 5 minutos**

---

## 📞 Si necesitas ayuda

Mándame:
1. Captura de pantalla de la configuración de URLs en Supabase
2. El error que aparece en la consola del navegador (F12 → Console)
3. El email que estás usando para iniciar sesión
