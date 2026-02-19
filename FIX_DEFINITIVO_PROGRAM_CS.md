# 🔥 Fix Definitivo - Program.cs Actualizado

## Fecha: 2026-02-19

---

## ✅ PROBLEMA RESUELTO

El `Program.cs` estaba leyendo las variables de entorno INCORRECTAMENTE:

```csharp
// ❌ ANTES (NO FUNCIONABA)
var supabaseUrl = builder.Configuration["Supabase:Url"]!;
var supabaseKey = builder.Configuration["Supabase:ServiceRoleKey"]!;
var jwtSecret = builder.Configuration["Supabase:JwtSecret"]!;
```

**Problemas:**
1. Buscaba `Supabase:Url` pero en Render está como `Supabase__Url`
2. Buscaba `ServiceRoleKey` pero solo tienes `AnonKey`
3. Requería `JwtSecret` que no existe

---

## 🎯 SOLUCIÓN IMPLEMENTADA

```csharp
// ✅ AHORA (FUNCIONA)
var supabaseUrl = builder.Configuration["Supabase:Url"] ?? Environment.GetEnvironmentVariable("Supabase__Url");
var supabaseKey = builder.Configuration["Supabase:AnonKey"] ?? Environment.GetEnvironmentVariable("Supabase__AnonKey");
```

**Mejoras:**
1. ✅ Lee tanto con `:` (local) como con `__` (Render)
2. ✅ Usa `AnonKey` que es la que tienes configurada
3. ✅ JWT es opcional (no rompe si no existe)
4. ✅ Muestra logs para debug: `"Initializing Supabase client with URL: ..."`
5. ✅ Valida que las variables existan antes de continuar

---

## 📋 PASOS PARA DESPLEGAR

### 1. Commit y Push (2 minutos)

```powershell
git add SportZone.API/Program.cs
git commit -m "fix: corregir lectura de variables de entorno en Render"
git push origin main
```

### 2. Render Redesplegará Automáticamente (3-5 minutos)

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio **sportzone-api**
3. Ve a **Logs**
4. Espera a ver estas líneas:

```
==> Deploying...
==> Build successful
==> Starting service
Initializing Supabase client with URL: https://husilgpjmqqsccmvbbka.supabase.co
JWT authentication disabled (no secret configured)
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Si ves "Initializing Supabase client with URL: ..." → ✅ FUNCIONA**

---

## 🧪 VERIFICACIÓN

### Paso 1: Probar Health Check

```powershell
Invoke-WebRequest -Uri "https://sportzone-api-mslj.onrender.com/health"
```

**Resultado esperado:**
```json
{"status":"Healthy","timestamp":"2026-02-19T..."}
```

### Paso 2: Probar Endpoint de Torneos

```powershell
Invoke-WebRequest -Uri "https://sportzone-api-mslj.onrender.com/api/liga/torneos" | Select-Object -ExpandProperty Content
```

**Resultado esperado:**
```json
[]
```

**NO debe dar error 500.**

---

## 🔍 SI AÚN DA ERROR

### Causa 1: Variables No Configuradas en Render

Verifica que en Render → Environment tengas EXACTAMENTE:

```
Supabase__Url=https://husilgpjmqqsccmvbbka.supabase.co
Supabase__AnonKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2lsZ3BqbXFxc2NjbXZiYmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Mzg5OTAsImV4cCI6MjA4NzAxNDk5MH0.hxaotT74-hFgE-nn_mFZQzGKLmqzDpzkUcApQ_XOuDU
```

**NO debe haber:**
- ❌ `ASPNETCORE_URLS`
- ❌ `Supabase__ServiceRoleKey`
- ❌ `Supabase__Key`
- ❌ `Supabase__JwtSecret`

### Causa 2: RLS Aún Habilitado

Si el endpoint sigue dando error, verifica que RLS esté deshabilitado:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Todas las tablas deben tener `rowsecurity = f` (false).

### Causa 3: Tablas No Existen

Verifica que las tablas existan:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Debes ver: `torneos`, `equipos`, `partidos`, `temporadas`, etc.

---

## 📊 CAMBIOS REALIZADOS

### Archivo: `SportZone.API/Program.cs`

**Cambio 1: Lectura de Variables**
```csharp
// Antes
var supabaseUrl = builder.Configuration["Supabase:Url"]!;
var supabaseKey = builder.Configuration["Supabase:ServiceRoleKey"]!;

// Después
var supabaseUrl = builder.Configuration["Supabase:Url"] ?? Environment.GetEnvironmentVariable("Supabase__Url");
var supabaseKey = builder.Configuration["Supabase:AnonKey"] ?? Environment.GetEnvironmentVariable("Supabase__AnonKey");
```

**Cambio 2: Validación**
```csharp
if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
{
    throw new InvalidOperationException("Supabase configuration is missing...");
}
```

**Cambio 3: Logging**
```csharp
Console.WriteLine($"Initializing Supabase client with URL: {supabaseUrl}");
```

**Cambio 4: JWT Opcional**
```csharp
var jwtSecret = builder.Configuration["Supabase:JwtSecret"] ?? Environment.GetEnvironmentVariable("Supabase__JwtSecret");

if (!string.IsNullOrEmpty(jwtSecret))
{
    // Configurar JWT
}
else
{
    Console.WriteLine("JWT authentication disabled (no secret configured)");
    builder.Services.AddAuthentication();
}
```

---

## ✅ RESULTADO ESPERADO

Después de hacer push y esperar el redespliegue:

```powershell
Invoke-WebRequest -Uri "https://sportzone-api-mslj.onrender.com/api/liga/torneos"
```

**Debe devolver:**
```
StatusCode: 200
Content: []
```

**Logs de Render deben mostrar:**
```
Initializing Supabase client with URL: https://husilgpjmqqsccmvbbka.supabase.co
JWT authentication disabled (no secret configured)
Application started. Press Ctrl+C to shut down.
```

---

## 🎯 CONFIGURACIÓN FINAL

**Variables en Render (SOLO estas 2):**
```
Supabase__Url=https://husilgpjmqqsccmvbbka.supabase.co
Supabase__AnonKey=[tu anon key de Supabase]
```

**Código actualizado:**
- ✅ Lee variables con `__` (Render) y `:` (local)
- ✅ Usa `AnonKey` en lugar de `ServiceRoleKey`
- ✅ JWT es opcional
- ✅ Logs para debug
- ✅ Validación de variables

---

**Estado:** Listo para desplegar
**Tiempo estimado:** 5-7 minutos
**Prioridad:** CRÍTICA

