# 🚀 Quick Start - Deployment a Vercel

## Opción Rápida: Deploy desde la Web

### 1. Preparar el código
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Ir a Vercel
1. Abre https://vercel.com/new
2. Conecta tu repositorio Git
3. Selecciona el proyecto
4. Configura:
   - **Root Directory**: `sportzone-web`
   - **Framework**: Angular
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/sportzone-web/browser`

### 3. Deploy
Haz clic en "Deploy" y espera 2-5 minutos.

## Opción CLI: Deploy desde Terminal

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy
```bash
cd sportzone-web

# Preview deployment
npm run deploy:preview

# Production deployment
npm run deploy:prod
```

## ⚙️ Configuración Post-Deployment

### Actualizar Backend CORS
Agrega tu dominio de Vercel al backend en `Program.cs`:

```csharp
builder.Services.AddCors(o => o.AddPolicy("Angular", p =>
    p.WithOrigins(
        "http://localhost:4200",
        "https://tu-proyecto.vercel.app"  // ← Agregar esto
     )
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()));
```

### Variables de Entorno en Vercel
En Settings → Environment Variables, agrega:
- `VITE_API_URL`: URL de tu backend
- `VITE_SUPABASE_URL`: URL de Supabase
- `VITE_SUPABASE_ANON_KEY`: Anon key de Supabase

## 📊 Monitoreo

- **Dashboard**: https://vercel.com/dashboard
- **Logs**: Proyecto → Deployments → [deployment] → Logs
- **Analytics**: Proyecto → Analytics

## 🔧 Troubleshooting

### Build falla
```bash
# Probar build localmente
npm run build:prod
```

### 404 al refrescar
Verifica que `vercel.json` exista con la configuración de rewrites.

### API no responde
1. Verifica variables de entorno en Vercel
2. Revisa CORS en el backend
3. Asegúrate de que el backend esté corriendo

## 📚 Documentación Completa

Ver `VERCEL_DEPLOYMENT.md` para guía detallada.
