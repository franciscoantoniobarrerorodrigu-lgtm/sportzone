# 🔧 Problemas en Vercel - Resumen

## 📋 Tienes 2 Problemas

### 1️⃣ Login "Tico" (No Responde)
**Causa:** Supabase no reconoce el dominio de Vercel

### 2️⃣ "Error al cargar partidos"
**Causa:** El backend no está desplegado

---

## ✅ Soluciones

### Problema 1: Login

#### Paso 1: Ir a Supabase
https://app.supabase.com → Tu proyecto → Authentication → URL Configuration

#### Paso 2: Configurar URLs

**Site URL:**
```
https://sportzone-web.vercel.app
```

**Redirect URLs:**
```
https://sportzone-web.vercel.app/**
https://sportzone-web.vercel.app/auth/callback
http://localhost:4200/**
```

#### Paso 3: Guardar y Probar

Haz clic en "Save" y prueba el login.

**Guía completa:** `SOLUCION_LOGIN_VERCEL_SIMPLE.md`

---

### Problema 2: Backend

#### Opción A: Solución Rápida (5 minutos)

1. **Ejecutar backend:**
```bash
cd SportZone.API
dotnet run
```

2. **Exponer con ngrok:**
```bash
# Descargar: https://ngrok.com/download
ngrok http 5000
```

3. **Actualizar frontend:**

Edita: `sportzone-web/src/environments/environment.prod.ts`

```typescript
apiUrl: 'https://TU-URL-NGROK.ngrok.io/api',
signalRUrl: 'https://TU-URL-NGROK.ngrok.io/hubs',
```

4. **Redesplegar:**
```bash
cd sportzone-web
vercel --prod
```

**Guía completa:** `ARREGLAR_ERROR_PARTIDOS.md`

#### Opción B: Solución Permanente (30 minutos)

Ejecuta el script automático:

```powershell
.\deploy-backend-azure.ps1
```

Esto desplegará el backend en Azure automáticamente.

**Guía completa:** `SOLUCION_ERROR_BACKEND.md`

---

## 🎯 Orden Recomendado

1. **Primero:** Arregla el login (5 minutos)
2. **Segundo:** Arregla el backend (5-30 minutos)

---

## 📊 Estado Actual vs Estado Deseado

### Estado Actual ❌

```
┌─────────────────────────────────────────────────┐
│ Frontend (Vercel)                               │
│ ✓ Desplegado                                    │
│ ✗ Login no funciona (Supabase no configurado)  │
│ ✗ Backend no conecta (no existe)               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Backend (.NET)                                  │
│ ✗ No desplegado                                 │
│ ✓ Funciona en localhost                         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Supabase                                        │
│ ✓ Base de datos funcionando                     │
│ ✗ URLs de Vercel no autorizadas                │
└─────────────────────────────────────────────────┘
```

### Estado Deseado ✅

```
┌─────────────────────────────────────────────────┐
│ Frontend (Vercel)                               │
│ ✓ Desplegado                                    │
│ ✓ Login funciona                                │
│ ✓ Backend conectado                             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Backend (Azure o ngrok)                         │
│ ✓ Desplegado y accesible                        │
│ ✓ Conectado a Supabase                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Supabase                                        │
│ ✓ Base de datos funcionando                     │
│ ✓ URLs de Vercel autorizadas                    │
└─────────────────────────────────────────────────┘
```

---

## 📞 Necesitas Ayuda?

Mándame:
1. Captura de pantalla del error
2. La consola del navegador (F12 → Console)
3. Qué paso estás intentando

---

## 📚 Todas las Guías

| Archivo | Descripción |
|---------|-------------|
| `SOLUCION_LOGIN_VERCEL_SIMPLE.md` | Arreglar login (5 min) |
| `ARREGLAR_ERROR_PARTIDOS.md` | Arreglar backend (5-30 min) |
| `SOLUCION_ERROR_BACKEND.md` | Guía completa backend |
| `ERROR_BACKEND_RESUMEN.md` | Resumen visual backend |
| `deploy-backend-azure.ps1` | Script automático Azure |

---

## ⏱️ Tiempo Total

- **Mínimo:** 10 minutos (login + ngrok)
- **Recomendado:** 35 minutos (login + Azure)
