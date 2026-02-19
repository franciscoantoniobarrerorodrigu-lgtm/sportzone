# ⚠️ Error: "Error al cargar partidos"

## 🔴 El Problema

```
Frontend (Vercel)  ──X──>  Backend (No existe)
     ✓                          ✗
```

El frontend está en Vercel, pero el backend NO está desplegado.

---

## ✅ Solución en 3 Pasos

### PASO 1: Ejecutar el Backend

```bash
cd SportZone.API
dotnet run
```

### PASO 2: Exponer con ngrok

```bash
# Descargar: https://ngrok.com/download
ngrok http 5000
```

Copia la URL que te da (ejemplo: `https://abc123.ngrok.io`)

### PASO 3: Actualizar Frontend

Edita: `sportzone-web/src/environments/environment.prod.ts`

```typescript
apiUrl: 'https://abc123.ngrok.io/api',  // ← Pega tu URL aquí
signalRUrl: 'https://abc123.ngrok.io/hubs',
```

Redesplegar:
```bash
cd sportzone-web
vercel --prod
```

---

## 🎯 Resultado

```
Frontend (Vercel)  ──✓──>  Backend (ngrok)  ──✓──>  Localhost
     ✓                          ✓                        ✓
```

¡Ahora funciona!

---

## 📚 Guías Completas

- **Solución rápida:** `ARREGLAR_ERROR_PARTIDOS.md`
- **Solución permanente:** `SOLUCION_ERROR_BACKEND.md`
- **Script automático:** `deploy-backend-azure.ps1`

---

## ⏱️ Tiempo Estimado

- Solución rápida (ngrok): **5 minutos**
- Solución permanente (Azure): **30 minutos**
