# 🔥 Forzar Redespliegue en Render

## Problema Detectado

Los logs de Render NO muestran el nuevo código:
- ❌ NO aparece: `"Initializing Supabase client with URL: ..."`
- ❌ Sigue usando código viejo
- ❌ Sigue dando "Invalid API key"

**Render NO desplegó el nuevo código.**

---

## ✅ SOLUCIÓN - Forzar Redespliegue Manual

### Opción 1: Manual Deploy (MÁS RÁPIDO - 2 minutos)

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio **sportzone-api**
3. Click en **Manual Deploy** (botón azul arriba a la derecha)
4. Selecciona **"Clear build cache & deploy"**
5. Click en **Deploy**
6. Espera 3-5 minutos

### Opción 2: Commit Vacío (ALTERNATIVA - 3 minutos)

Si la Opción 1 no funciona, haz un commit vacío para forzar el redespliegue:

```powershell
git commit --allow-empty -m "force: trigger Render redeploy"
git push origin main
```

---

## 🔍 VERIFICAR QUE EL NUEVO CÓDIGO SE DESPLEGÓ

### Paso 1: Ver los Logs de Render

Después del redespliegue, DEBES ver estas líneas en los logs:

```
==> Deploying...
Initializing Supabase client with URL: https://husilgpjmqqsccmvbbka.supabase.co
JWT authentication disabled (no secret configured)
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Si ves "Initializing Supabase client with URL: ..." → ✅ NUEVO CÓDIGO DESPLEGADO**

**Si NO ves esa línea → ❌ SIGUE CON CÓDIGO VIEJO**

### Paso 2: Probar el Endpoint

```powershell
Invoke-WebRequest -Uri "https://sportzone-api-mslj.onrender.com/api/liga/torneos"
```

**Resultado esperado:**
```
StatusCode: 200
Content: []
```

---

## 🚨 SI AÚN NO FUNCIONA DESPUÉS DEL REDESPLIEGUE

### Causa 1: Variables de Entorno Incorrectas

Verifica en Render → Environment que tengas EXACTAMENTE:

```
Supabase__Url=https://husilgpjmqqsccmvbbka.supabase.co
Supabase__AnonKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2lsZ3BqbXFxc2NjbXZiYmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Mzg5OTAsImV4cCI6MjA4NzAxNDk5MH0.hxaotT74-hFgE-nn_mFZQzGKLmqzDpzkUcApQ_XOuDU
```

**Verifica:**
- ✅ Nombres EXACTOS: `Supabase__Url` y `Supabase__AnonKey` (con doble guión bajo `__`)
- ✅ Sin espacios al inicio o al final
- ✅ Sin comillas `" "`
- ❌ NO debe haber: `ASPNETCORE_URLS`, `Supabase__ServiceRoleKey`, `Supabase__Key`, `Supabase__JwtSecret`

### Causa 2: Anon Key Incorrecta

La key que tienes en Render debe ser EXACTAMENTE la misma que en Supabase Dashboard → Settings → API → **anon public**.

Verifica en https://jwt.io que la key tenga:
```json
{
  "role": "anon",
  "ref": "husilgpjmqqsccmvbbka"
}
```

### Causa 3: RLS Aún Habilitado

Si el endpoint sigue dando error después de verificar las variables, deshabilita RLS:

```sql
ALTER TABLE torneos DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipos DISABLE ROW LEVEL SECURITY;
ALTER TABLE partidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE temporadas DISABLE ROW LEVEL SECURITY;
```

---

## 📋 CHECKLIST

- [ ] Hice "Clear build cache & deploy" en Render
- [ ] Esperé 3-5 minutos para el redespliegue
- [ ] Verifiqué los logs y veo "Initializing Supabase client with URL: ..."
- [ ] Verifiqué que las variables de entorno estén correctas
- [ ] Probé el endpoint `/api/liga/torneos`
- [ ] El endpoint devuelve 200 OK

---

**Estado:** Esperando redespliegue manual
**Tiempo estimado:** 5 minutos
**Prioridad:** CRÍTICA

