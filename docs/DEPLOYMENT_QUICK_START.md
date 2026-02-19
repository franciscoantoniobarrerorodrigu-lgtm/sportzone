# Guía Rápida de Deployment - SportZone Pro

Esta guía proporciona los pasos esenciales para deployar SportZone Pro en producción.

## Pre-requisitos

- [ ] Cuenta de Azure activa
- [ ] Cuenta de Vercel o Netlify
- [ ] Proyecto de Supabase configurado
- [ ] Proyecto de Firebase configurado
- [ ] Azure CLI instalado
- [ ] Node.js 20+ instalado
- [ ] .NET 8 SDK instalado
- [ ] Git configurado

---

## Paso 1: Configurar Base de Datos (15 min)

```bash
# 1. Crear proyecto en Supabase
# Ir a https://supabase.com/dashboard

# 2. Ejecutar migraciones
cd database
chmod +x migrate.sh
export SUPABASE_PROJECT_REF="your-project-ref"
export SUPABASE_DB_PASSWORD="your-password"
./migrate.sh

# 3. Crear usuarios de prueba
# Ejecutar en SQL Editor de Supabase:
# SELECT update_user_role('admin@sportzone.app', 'admin');
```

---

## Paso 2: Deployar Backend en Azure (20 min)

```bash
# 1. Ejecutar script de deployment
cd scripts
chmod +x deploy-azure.sh
./deploy-azure.sh

# 2. Configurar variables de entorno en Azure Portal
# Settings → Configuration → Application settings
# Agregar todas las variables de appsettings.Production.json

# 3. Configurar GitHub Actions
# Ir a Azure Portal → App Service → Deployment Center
# Descargar Publish Profile
# Agregar a GitHub Secrets como AZURE_WEBAPP_PUBLISH_PROFILE

# 4. Push a main para deployar
git push origin main
```

---

## Paso 3: Deployar Frontend en Vercel (10 min)

```bash
# Opción A: Desde Vercel Dashboard
# 1. Ir a https://vercel.com/new
# 2. Importar repositorio de GitHub
# 3. Configurar:
#    - Framework: Angular
#    - Root Directory: sportzone-web
#    - Build Command: npm run build
#    - Output Directory: dist/sportzone-web/browser

# Opción B: Con Vercel CLI
cd sportzone-web
npm install -g vercel
vercel login
vercel --prod

# 4. Configurar variables de entorno en Vercel Dashboard
# Settings → Environment Variables
# Agregar todas las variables de environment.prod.ts
```

---

## Paso 4: Configurar Monitoreo (10 min)

```bash
# 1. Verificar Application Insights
# Ir a Azure Portal → Application Insights → sportzone-insights

# 2. Configurar alertas básicas
az monitor metrics alert create \
  --name "High-5xx-Errors" \
  --resource-group sportzone-rg \
  --scopes /subscriptions/{id}/resourceGroups/sportzone-rg/providers/Microsoft.Web/sites/sportzone-api \
  --condition "count requests/failed > 10" \
  --window-size 5m \
  --action email admin@sportzone.app

# 3. Verificar health checks
curl https://api.sportzone.app/health
```

---

## Paso 5: Verificación Post-Deployment (5 min)

### Backend
```bash
# Health check
curl https://api.sportzone.app/health

# API endpoint
curl https://api.sportzone.app/api/liga/torneos
```

### Frontend
```bash
# Verificar que carga
curl https://sportzone.app

# Verificar en navegador
open https://sportzone.app
```

### SignalR
```javascript
// Abrir console del navegador en https://sportzone.app
const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://api.sportzone.app/hubs/partidos")
    .build();
connection.start().then(() => console.log("Connected!"));
```

---

## Configuración de Backups Automáticos

```bash
# 1. Configurar cron job para backups diarios
crontab -e

# 2. Agregar línea (backup diario a las 2 AM)
0 2 * * * /path/to/database/backup.sh

# 3. Verificar que funciona
cd database
chmod +x backup.sh
./backup.sh
```

---

## Troubleshooting Rápido

### Backend no responde
```bash
# Ver logs
az webapp log tail --name sportzone-api --resource-group sportzone-rg

# Reiniciar app
az webapp restart --name sportzone-api --resource-group sportzone-rg
```

### Frontend no carga
```bash
# Ver logs de Vercel
vercel logs

# Redeployar
vercel --prod --force
```

### SignalR no conecta
```bash
# Verificar WebSockets habilitado
az webapp config show --name sportzone-api --resource-group sportzone-rg --query webSocketsEnabled

# Habilitar si está deshabilitado
az webapp config set --name sportzone-api --resource-group sportzone-rg --web-sockets-enabled true
```

---

## URLs Importantes

- **Frontend**: https://sportzone.app
- **Backend API**: https://api.sportzone.app
- **Health Check**: https://api.sportzone.app/health
- **Swagger**: https://api.sportzone.app/swagger
- **Azure Portal**: https://portal.azure.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## Próximos Pasos

1. Configurar dominio personalizado
2. Configurar SSL/TLS
3. Configurar CDN para assets
4. Configurar alertas adicionales
5. Documentar procedimientos operativos
6. Capacitar al equipo

---

## Soporte

Para más detalles, consultar:
- [Guía Completa de Deployment](./DEPLOYMENT_GUIDE.md)
- [Configuración de Monitoreo](./MONITORING_SETUP.md)
- [Documentación de Backend](../SportZone.API/README.md)
