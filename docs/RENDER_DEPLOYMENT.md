# 🚀 Guía de Deployment en Render - SportZone Backend

## ✅ Configuración Completa para Render

### Paso 1: Información Básica del Servicio

```
Name: sportzone-api
Region: Oregon (US West) o el más cercano
Branch: main
Root Directory: SportZone.API
```

---

### Paso 2: Build & Start Commands

**Build Command:**
```bash
dotnet publish -c Release -o out
```

**Start Command:**
```bash
dotnet out/SportZone.API.dll
```

---

### Paso 3: Variables de Entorno (CRÍTICO)

Agrega estas variables en la sección "Environment Variables":

```bash
# Configuración de ASP.NET Core
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:$PORT

# Supabase (REEMPLAZA CON TUS VALORES)
Supabase__Url=https://tu-proyecto.supabase.co
Supabase__Key=tu-anon-key-aqui
Supabase__ServiceRoleKey=tu-service-role-key-aqui

# JWT (REEMPLAZA CON TU SECRET)
Jwt__Secret=tu-jwt-secret-de-minimo-32-caracteres-aqui
Jwt__Issuer=SportZone
Jwt__Audience=SportZone

# CORS (REEMPLAZA CON TU URL DE VERCEL)
AllowedOrigins=https://tu-app.vercel.app,http://localhost:4200
```

---

### Paso 4: Obtener tus Credenciales de Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Click en "Settings" → "API"
3. Copia:
   - **Project URL** → `Supabase__Url`
   - **anon public** → `Supabase__Key`
   - **service_role** → `Supabase__ServiceRoleKey`

---

### Paso 5: Generar JWT Secret

Ejecuta este comando en PowerShell para generar un secret seguro:

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

O usa este online: https://generate-secret.vercel.app/32

---

### Paso 6: Seleccionar Plan

- **Free**: $0/mes (se duerme después de 15 min de inactividad)
- **Starter**: $7/mes (recomendado, siempre activo)

Para desarrollo, empieza con Free.

---

### Paso 7: Deploy

1. Click en **"Create Web Service"**
2. Render automáticamente:
   - Clona tu repo
   - Ejecuta `dotnet restore`
   - Ejecuta `dotnet publish -c Release -o out`
   - Inicia tu aplicación con `dotnet out/SportZone.API.dll`
   - Te da una URL pública

**Tiempo estimado:** 5-7 minutos

---

### Paso 8: Verificar el Deploy

Una vez que termine, verás:

```
✅ Build successful
✅ Deploy live
```

Tu URL será algo como:
```
https://sportzone-api.onrender.com
```

---

### Paso 9: Probar el Backend

Abre en tu navegador:

```
https://sportzone-api.onrender.com/health
```

Deberías ver:
```json
{
  "status": "Healthy"
}
```

---

### Paso 10: Actualizar Frontend en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Edita o agrega:
   ```
   API_URL=https://sportzone-api.onrender.com
   ```
4. Redeploy el frontend

---

## 🔧 Troubleshooting

### ❌ Error: "Build failed"

**Causa:** Root Directory incorrecto

**Solución:**
1. Ve a Settings en Render
2. Verifica que "Root Directory" sea exactamente: `SportZone.API`
3. Redeploy

---

### ❌ Error: "Application failed to start"

**Causa:** Falta la variable `ASPNETCORE_URLS`

**Solución:**
1. Ve a Environment en Render
2. Agrega:
   ```
   ASPNETCORE_URLS=http://0.0.0.0:$PORT
   ```
3. Redeploy

---

### ❌ Error: "Cannot connect to Supabase"

**Causa:** Variables de Supabase incorrectas

**Solución:**
1. Verifica que las variables tengan el formato correcto:
   ```
   Supabase__Url (con doble guion bajo)
   Supabase__Key
   Supabase__ServiceRoleKey
   ```
2. Verifica que los valores sean correctos desde Supabase Dashboard

---

### ❌ Error de CORS en el frontend

**Causa:** AllowedOrigins no incluye tu URL de Vercel

**Solución:**
1. Agrega la variable en Render:
   ```
   AllowedOrigins=https://tu-app.vercel.app
   ```
2. Redeploy

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

1. Ve a tu servicio en Render Dashboard
2. Click en "Logs"
3. Verás todos los logs de tu aplicación

### Métricas

Render te muestra automáticamente:
- CPU usage
- Memory usage
- Request count
- Response times

---

## 💰 Costos

### Plan Free
- **Costo:** $0/mes
- **Limitaciones:**
  - Se duerme después de 15 minutos de inactividad
  - Tarda ~30 segundos en despertar
  - 750 horas/mes de uso

### Plan Starter
- **Costo:** $7/mes
- **Beneficios:**
  - Siempre activo
  - Sin tiempo de despertar
  - Mejor rendimiento

---

## 🔄 Redeploy

Para hacer redeploy después de cambios en el código:

1. **Automático:** Render detecta cambios en GitHub y redeploy automáticamente
2. **Manual:** Click en "Manual Deploy" → "Deploy latest commit"

---

## 🎯 Checklist Final

- [ ] Root Directory: `SportZone.API`
- [ ] Build Command: `dotnet publish -c Release -o out`
- [ ] Start Command: `dotnet out/SportZone.API.dll`
- [ ] Variable: `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Variable: `ASPNETCORE_URLS=http://0.0.0.0:$PORT`
- [ ] Variables de Supabase configuradas
- [ ] JWT Secret configurado
- [ ] AllowedOrigins configurado
- [ ] Deploy exitoso
- [ ] `/health` responde correctamente
- [ ] Frontend actualizado con nueva API_URL

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs** en Render Dashboard
2. **Verifica las variables de entorno**
3. **Compara con esta guía**

---

**Última actualización:** 2025-01-XX  
**Versión:** 1.0
