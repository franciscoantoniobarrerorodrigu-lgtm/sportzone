# Guía de Deployment en Vercel - SportZone Pro Frontend

## Requisitos Previos

1. Cuenta en Vercel (https://vercel.com)
2. Vercel CLI instalado (opcional): `npm i -g vercel`
3. Repositorio Git configurado

## Opción 1: Deployment desde la Web (Recomendado)

### Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en un repositorio Git (GitHub, GitLab, o Bitbucket)
2. Haz commit de todos los cambios:
   ```bash
   git add .
   git commit -m "Preparar para deployment en Vercel"
   git push origin main
   ```

### Paso 2: Importar Proyecto en Vercel

1. Ve a https://vercel.com/new
2. Conecta tu cuenta de Git (GitHub/GitLab/Bitbucket)
3. Selecciona el repositorio `sportzone-web`
4. Configura el proyecto:
   - **Framework Preset**: Angular
   - **Root Directory**: `sportzone-web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/sportzone-web/browser`

### Paso 3: Configurar Variables de Entorno

En la sección "Environment Variables" de Vercel, agrega:

```
VITE_API_URL=https://tu-backend.azurewebsites.net/api
VITE_SIGNALR_URL=https://tu-backend.azurewebsites.net/hubs
VITE_SUPABASE_URL=https://husilgpjmqqsccmvbbka.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2lsZ3BqbXFxc2NjbXZiYmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Mzg5OTAsImV4cCI6MjA4NzAxNDk5MH0.hxaotT74-hFgE-nn_mFZQzGKLmqzDpzkUcApQ_XOuDU
```

### Paso 4: Deploy

1. Haz clic en "Deploy"
2. Espera a que termine el build (2-5 minutos)
3. Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

## Opción 2: Deployment desde CLI

### Paso 1: Instalar Vercel CLI

```bash
npm i -g vercel
```

### Paso 2: Login

```bash
vercel login
```

### Paso 3: Deploy

Desde el directorio `sportzone-web`:

```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod
```

## Configuración Post-Deployment

### 1. Actualizar CORS en el Backend

Agrega el dominio de Vercel a la configuración CORS en `Program.cs`:

```csharp
builder.Services.AddCors(o => o.AddPolicy("Angular", p =>
    p.WithOrigins(
        "http://localhost:4200",
        "https://sportzone.app",
        "https://tu-proyecto.vercel.app"  // Agregar dominio de Vercel
     )
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()));
```

### 2. Configurar Dominio Personalizado (Opcional)

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones

### 3. Actualizar Environment de Producción

Edita `sportzone-web/src/environments/environment.prod.ts` con la URL real del backend:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend-real.azurewebsites.net/api',
  signalRUrl: 'https://tu-backend-real.azurewebsites.net/hubs',
  // ... resto de configuración
};
```

## Deployments Automáticos

Vercel automáticamente:
- Crea un preview deployment para cada push a una rama
- Crea un production deployment para cada push a `main`
- Ejecuta el build y tests antes de deployar

## Monitoreo

1. **Analytics**: Ve a tu proyecto → Analytics
2. **Logs**: Ve a tu proyecto → Deployments → [deployment] → Logs
3. **Performance**: Vercel Speed Insights (opcional)

## Troubleshooting

### Error: "Build failed"
- Verifica que `npm run build` funcione localmente
- Revisa los logs en Vercel
- Asegúrate de que todas las dependencias estén en `package.json`

### Error: "404 on refresh"
- Verifica que `vercel.json` tenga la configuración de rewrites
- Asegúrate de que el routing de Angular esté configurado correctamente

### Error: "API calls failing"
- Verifica las variables de entorno en Vercel
- Asegúrate de que el backend esté corriendo
- Revisa la configuración CORS en el backend

## URLs Importantes

- **Dashboard Vercel**: https://vercel.com/dashboard
- **Documentación**: https://vercel.com/docs
- **Soporte**: https://vercel.com/support

## Comandos Útiles

```bash
# Ver deployments
vercel ls

# Ver logs
vercel logs [deployment-url]

# Rollback a deployment anterior
vercel rollback [deployment-url]

# Eliminar deployment
vercel rm [deployment-url]
```

## Notas Importantes

1. **Límites del Plan Free**:
   - 100 GB bandwidth/mes
   - Deployments ilimitados
   - 100 builds/día

2. **Optimizaciones**:
   - Vercel automáticamente optimiza imágenes
   - Compresión Brotli/Gzip habilitada
   - CDN global incluido

3. **Seguridad**:
   - HTTPS automático
   - Headers de seguridad configurados en `vercel.json`
   - Variables de entorno encriptadas
