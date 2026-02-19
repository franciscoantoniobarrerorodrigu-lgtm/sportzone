# 🔧 Solución: Error al Cargar Partidos

## El Problema

La página muestra: **"Error al cargar partidos. Intente nuevamente."**

Esto ocurre porque el frontend en Vercel intenta conectarse al backend, pero:
- El backend NO está desplegado en Azure todavía
- La URL configurada es un placeholder: `https://tu-backend.azurewebsites.net/api`

## Soluciones

### ✅ OPCIÓN 1: Usar Backend Local (Para Pruebas Rápidas)

Esta opción te permite probar la funcionalidad localmente mientras despliegas el backend.

#### Paso 1: Ejecutar el Backend Localmente

```bash
cd SportZone.API
dotnet run
```

El backend correrá en: `http://localhost:5000`

#### Paso 2: Exponer el Backend con ngrok

Como Vercel (HTTPS) no puede conectarse a localhost (HTTP), necesitas exponer tu backend:

1. Descarga ngrok: https://ngrok.com/download
2. Ejecuta:
```bash
ngrok http 5000
```

3. Copia la URL que te da (ejemplo: `https://abc123.ngrok.io`)

#### Paso 3: Actualizar la Configuración del Frontend

Edita: `sportzone-web/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://abc123.ngrok.io/api',  // ← Cambia esto por tu URL de ngrok
  signalRUrl: 'https://abc123.ngrok.io/hubs',
  supabase: {
    url: 'https://husilgpjmqqsccmvbbka.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2lsZ3BqbXFxc2NjbXZiYmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Mzg5OTAsImV4cCI6MjA4NzAxNDk5MH0.hxaotT74-hFgE-nn_mFZQzGKLmqzDpzkUcApQ_XOuDU'
  }
};
```

#### Paso 4: Redesplegar en Vercel

```bash
cd sportzone-web
npm run build
vercel --prod
```

**NOTA:** La URL de ngrok cambia cada vez que lo reinicias (en la versión gratuita). Para una solución permanente, usa la Opción 2.

---

### ✅ OPCIÓN 2: Desplegar Backend en Azure (Solución Permanente)

Esta es la solución correcta para producción.

#### Requisitos Previos

1. Cuenta de Azure (puedes usar la prueba gratuita)
2. Azure CLI instalado

#### Paso 1: Instalar Azure CLI

**Windows:**
```bash
winget install Microsoft.AzureCLI
```

O descarga desde: https://aka.ms/installazurecliwindows

#### Paso 2: Iniciar Sesión en Azure

```bash
az login
```

#### Paso 3: Crear Recursos en Azure

```bash
# Variables
$resourceGroup = "sportzone-rg"
$location = "eastus"
$appServicePlan = "sportzone-plan"
$webAppName = "sportzone-api-$(Get-Random)"

# Crear grupo de recursos
az group create --name $resourceGroup --location $location

# Crear App Service Plan (Free tier)
az appservice plan create `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --sku F1 `
  --is-linux

# Crear Web App
az webapp create `
  --name $webAppName `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --runtime "DOTNETCORE:8.0"
```

#### Paso 4: Configurar Variables de Entorno

```bash
az webapp config appsettings set `
  --name $webAppName `
  --resource-group $resourceGroup `
  --settings `
    SUPABASE_URL="https://husilgpjmqqsccmvbbka.supabase.co" `
    SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2lsZ3BqbXFxc2NjbXZiYmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Mzg5OTAsImV4cCI6MjA4NzAxNDk5MH0.hxaotT74-hFgE-nn_mFZQzGKLmqzDpzkUcApQ_XOuDU"
```

#### Paso 5: Desplegar el Backend

```bash
cd SportZone.API

# Publicar la aplicación
dotnet publish -c Release -o ./publish

# Crear archivo ZIP
Compress-Archive -Path ./publish/* -DestinationPath ./deploy.zip -Force

# Desplegar a Azure
az webapp deployment source config-zip `
  --name $webAppName `
  --resource-group $resourceGroup `
  --src ./deploy.zip
```

#### Paso 6: Obtener la URL del Backend

```bash
az webapp show `
  --name $webAppName `
  --resource-group $resourceGroup `
  --query "defaultHostName" `
  --output tsv
```

Esto te dará algo como: `sportzone-api-12345.azurewebsites.net`

#### Paso 7: Actualizar Frontend

Edita: `sportzone-web/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://sportzone-api-12345.azurewebsites.net/api',  // ← Tu URL de Azure
  signalRUrl: 'https://sportzone-api-12345.azurewebsites.net/hubs',
  supabase: {
    url: 'https://husilgpjmqqsccmvbbka.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2lsZ3BqbXFxc2NjbXZiYmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Mzg5OTAsImV4cCI6MjA4NzAxNDk5MH0.hxaotT74-hFgE-nn_mFZQzGKLmqzDpzkUcApQ_XOuDU'
  }
};
```

#### Paso 8: Redesplegar Frontend

```bash
cd sportzone-web
npm run build
vercel --prod
```

---

### ✅ OPCIÓN 3: Usar Solo Supabase (Sin Backend .NET)

Si no quieres mantener un backend en .NET, puedes migrar toda la lógica a Supabase Edge Functions.

**Ventajas:**
- Sin servidor que mantener
- Más barato (Supabase tiene tier gratuito generoso)
- Más simple de desplegar

**Desventajas:**
- Requiere reescribir el backend en TypeScript/Deno
- Pierdes las ventajas de .NET (tipado fuerte, performance)

---

## Recomendación

Para tu caso, te recomiendo:

1. **Ahora (pruebas):** Usa Opción 1 (ngrok) para probar rápidamente
2. **Producción:** Usa Opción 2 (Azure) para tener una solución estable

---

## Verificar que el Backend Funciona

Una vez desplegado, prueba:

```bash
# Reemplaza con tu URL
curl https://tu-backend.azurewebsites.net/api/partidos
```

Deberías ver una respuesta JSON con los partidos.

---

## Problemas Comunes

### Error: CORS

Si ves errores de CORS en la consola del navegador, necesitas configurar CORS en el backend.

Edita: `SportZone.API/Program.cs`

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVercel", policy =>
    {
        policy.WithOrigins("https://sportzone-web.vercel.app")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Después de app.UseRouting()
app.UseCors("AllowVercel");
```

### Error: 502 Bad Gateway

El backend no está corriendo o tiene un error. Revisa los logs:

```bash
az webapp log tail --name $webAppName --resource-group $resourceGroup
```

### Error: 401 Unauthorized

El token de Supabase no está configurado correctamente. Verifica las variables de entorno.

---

## Resumen

**Problema:** Frontend no puede conectarse al backend porque no está desplegado.

**Solución Rápida:** Usar ngrok para exponer el backend local.

**Solución Permanente:** Desplegar el backend en Azure.

**Tiempo Estimado:**
- Opción 1 (ngrok): 10 minutos
- Opción 2 (Azure): 30 minutos
