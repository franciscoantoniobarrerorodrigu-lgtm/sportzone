# 🚨 ERROR: "Error al cargar partidos"

## ¿Qué Pasó?

La página de "Gestión de Partidos" muestra un error porque **el backend no está corriendo**.

El frontend (Vercel) intenta conectarse a:
```
https://tu-backend.azurewebsites.net/api
```

Pero esa URL no existe todavía. Es un placeholder.

---

## 🔧 Solución Rápida (5 minutos)

### Opción A: Usar el Backend Local con ngrok

Esta es la forma más rápida de probar la funcionalidad.

#### 1. Ejecutar el Backend

Abre una terminal y ejecuta:

```bash
cd SportZone.API
dotnet run
```

Deberías ver:
```
Now listening on: http://localhost:5000
```

#### 2. Instalar ngrok

Descarga ngrok desde: https://ngrok.com/download

Descomprime el archivo y muévelo a una carpeta (ejemplo: `C:\ngrok`)

#### 3. Exponer el Backend

Abre otra terminal y ejecuta:

```bash
cd C:\ngrok
ngrok http 5000
```

Verás algo así:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

**Copia esa URL** (ejemplo: `https://abc123.ngrok.io`)

#### 4. Actualizar el Frontend

Edita el archivo: `sportzone-web/src/environments/environment.prod.ts`

Cambia esto:
```typescript
apiUrl: 'https://tu-backend.azurewebsites.net/api',
```

Por esto (usa tu URL de ngrok):
```typescript
apiUrl: 'https://abc123.ngrok.io/api',
```

También cambia:
```typescript
signalRUrl: 'https://tu-backend.azurewebsites.net/hubs',
```

Por:
```typescript
signalRUrl: 'https://abc123.ngrok.io/hubs',
```

#### 5. Redesplegar en Vercel

```bash
cd sportzone-web
npm run build
vercel --prod
```

#### 6. Probar

Ve a: https://sportzone-web.vercel.app/admin/partidos

Ahora debería funcionar.

**NOTA:** La URL de ngrok cambia cada vez que lo reinicias. Para una solución permanente, ve a la Opción B.

---

## 🚀 Solución Permanente (30 minutos)

### Opción B: Desplegar el Backend en Azure

#### Método Automático (Recomendado)

Ejecuta el script que creé:

```powershell
.\deploy-backend-azure.ps1
```

El script hará todo automáticamente:
1. Crear recursos en Azure
2. Configurar variables de entorno
3. Publicar el backend
4. Desplegar a Azure

Al final te dará la URL del backend.

#### Método Manual

Si prefieres hacerlo paso a paso, sigue la guía completa en:
```
SOLUCION_ERROR_BACKEND.md
```

---

## 🔍 Verificar que Funciona

Una vez desplegado, prueba el backend:

1. Abre el navegador
2. Ve a: `https://tu-backend.azurewebsites.net/swagger`
3. Deberías ver la documentación de la API

O prueba con curl:
```bash
curl https://tu-backend.azurewebsites.net/api/partidos
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué no funciona sin el backend?

La página de "Gestión de Partidos" usa el backend .NET para:
- Crear partidos
- Editar partidos
- Eliminar partidos
- Listar partidos

Sin el backend, no puede hacer ninguna de estas operaciones.

### ¿Puedo usar solo Supabase?

Sí, pero tendrías que:
1. Crear funciones en Supabase (Edge Functions)
2. Reescribir la lógica del backend en TypeScript
3. Actualizar el frontend para usar Supabase directamente

Esto tomaría más tiempo.

### ¿Cuánto cuesta Azure?

Azure tiene un tier gratuito (F1) que incluye:
- 1 GB de RAM
- 1 GB de almacenamiento
- 60 minutos de CPU por día

Es suficiente para pruebas y desarrollo.

Para producción, el tier básico (B1) cuesta ~$13 USD/mes.

### ¿Hay alternativas a Azure?

Sí, puedes desplegar en:
- **Railway**: Muy fácil, tier gratuito generoso
- **Render**: Similar a Railway
- **Fly.io**: Bueno para .NET
- **AWS**: Más complejo pero más opciones

---

## 📞 Necesitas Ayuda?

Si tienes problemas:

1. Verifica que el backend corre localmente:
   ```bash
   cd SportZone.API
   dotnet run
   ```

2. Abre el navegador en: http://localhost:5000/swagger

3. Si ves errores, mándame:
   - El mensaje de error completo
   - La salida de `dotnet run`

---

## ✅ Resumen

**Problema:** Frontend no puede conectarse al backend.

**Causa:** Backend no está desplegado.

**Solución Rápida:** Usar ngrok (5 minutos).

**Solución Permanente:** Desplegar en Azure (30 minutos).

**Script Automático:** `.\deploy-backend-azure.ps1`
