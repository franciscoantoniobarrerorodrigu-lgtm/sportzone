# Documentación de Deployment - SportZone Pro

Esta carpeta contiene toda la documentación necesaria para deployar SportZone Pro en producción.

## 📚 Documentos Disponibles

### Guías Principales

1. **[DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** - Guía completa y detallada
   - Configuración de variables de entorno
   - Deployment de backend en Azure
   - Deployment de frontend en Vercel/Netlify
   - Configuración de base de datos
   - Monitoreo y logs
   - Troubleshooting

2. **[DEPLOYMENT_QUICK_START.md](../DEPLOYMENT_QUICK_START.md)** - Guía rápida (60 min)
   - Pasos esenciales
   - Comandos rápidos
   - Verificación post-deployment

3. **[DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md)** - Checklist exhaustivo
   - Pre-deployment
   - Deployment
   - Post-deployment
   - Verificación

4. **[DEPLOYMENT_SUMMARY.md](../DEPLOYMENT_SUMMARY.md)** - Resumen ejecutivo
   - Archivos creados
   - Arquitectura
   - Costos estimados
   - Métricas de éxito

### Guías Especializadas

5. **[MONITORING_SETUP.md](../MONITORING_SETUP.md)** - Configuración de monitoreo
   - Application Insights
   - Health checks
   - Alertas
   - Dashboards
   - Logs

## 🚀 Inicio Rápido

### Para deployment completo (primera vez)
```bash
# 1. Leer la guía completa
cat docs/DEPLOYMENT_GUIDE.md

# 2. Seguir el checklist
cat docs/DEPLOYMENT_CHECKLIST.md
```

### Para deployment rápido (ya configurado)
```bash
# 1. Leer la guía rápida
cat docs/DEPLOYMENT_QUICK_START.md

# 2. Ejecutar scripts
./scripts/deploy-azure.sh
cd sportzone-web && vercel --prod
```

## 📁 Estructura de Archivos

```
docs/
├── DEPLOYMENT_GUIDE.md           # Guía completa
├── DEPLOYMENT_QUICK_START.md     # Guía rápida
├── DEPLOYMENT_CHECKLIST.md       # Checklist
├── DEPLOYMENT_SUMMARY.md         # Resumen
├── MONITORING_SETUP.md           # Monitoreo
└── deployment/
    └── README.md                 # Este archivo

SportZone.API/
├── Dockerfile                    # Docker backend
├── .dockerignore
├── appsettings.Production.json   # Config producción
└── HealthChecks/
    └── SignalRHealthCheck.cs     # Health check

sportzone-web/
├── Dockerfile                    # Docker frontend
├── .dockerignore
├── nginx.conf                    # Config nginx
├── vercel.json                   # Config Vercel
├── netlify.toml                  # Config Netlify
├── ngsw-config.json             # Service Worker
└── src/environments/
    └── environment.prod.ts       # Variables producción

.github/workflows/
├── deploy-backend.yml            # CI/CD backend
└── deploy-frontend.yml           # CI/CD frontend

database/
├── backup.sh                     # Script backup
├── restore.sh                    # Script restore
└── migrate.sh                    # Script migración

scripts/
└── deploy-azure.sh               # Deploy Azure

.env.example                      # Template variables
```

## 🎯 Flujo de Trabajo Recomendado

### Primera vez (Setup completo)

1. **Preparación** (30 min)
   - Leer DEPLOYMENT_GUIDE.md
   - Configurar cuentas (Azure, Vercel, Supabase, Firebase)
   - Preparar variables de entorno

2. **Base de Datos** (15 min)
   - Crear proyecto Supabase
   - Ejecutar migraciones
   - Configurar backups

3. **Backend** (20 min)
   - Ejecutar deploy-azure.sh
   - Configurar variables en Azure
   - Configurar CI/CD

4. **Frontend** (10 min)
   - Deployar en Vercel
   - Configurar variables
   - Configurar CI/CD

5. **Monitoreo** (10 min)
   - Configurar Application Insights
   - Configurar alertas
   - Verificar health checks

6. **Verificación** (5 min)
   - Ejecutar smoke tests
   - Verificar métricas
   - Completar checklist

### Deployments subsecuentes

1. **Pre-deployment**
   - Backup de base de datos
   - Revisar cambios
   - Ejecutar tests

2. **Deployment**
   - Push a main (CI/CD automático)
   - O ejecutar scripts manualmente

3. **Post-deployment**
   - Verificar health checks
   - Monitorear logs
   - Ejecutar smoke tests

## 🔧 Comandos Útiles

### Backend

```bash
# Build local
cd SportZone.API
dotnet build -c Release

# Publish local
dotnet publish -c Release -o ./publish

# Build Docker
docker build -t sportzone-api .

# Run Docker local
docker run -p 8080:80 sportzone-api

# Ver logs Azure
az webapp log tail --name sportzone-api --resource-group sportzone-rg

# Restart Azure
az webapp restart --name sportzone-api --resource-group sportzone-rg
```

### Frontend

```bash
# Build local
cd sportzone-web
npm run build -- --configuration production

# Build Docker
docker build -t sportzone-web .

# Run Docker local
docker run -p 8080:80 sportzone-web

# Deploy Vercel
vercel --prod

# Ver logs Vercel
vercel logs
```

### Base de Datos

```bash
# Backup
cd database
./backup.sh

# Restore
./restore.sh backups/sportzone_backup_20240115.sql.gz

# Migrar
./migrate.sh
```

## 📊 Métricas y Monitoreo

### URLs de Monitoreo

- **Health Check**: https://api.sportzone.app/health
- **Application Insights**: [Azure Portal](https://portal.azure.com)
- **Vercel Analytics**: [Vercel Dashboard](https://vercel.com/dashboard)

### Métricas Clave

- ✅ Uptime > 99.9%
- ✅ Response time < 500ms
- ✅ Error rate < 0.1%
- ✅ Lighthouse score > 90

## 🆘 Troubleshooting

### Backend no responde

```bash
# Ver logs
az webapp log tail --name sportzone-api --resource-group sportzone-rg

# Verificar health check
curl https://api.sportzone.app/health

# Restart
az webapp restart --name sportzone-api --resource-group sportzone-rg
```

### Frontend no carga

```bash
# Ver logs
vercel logs

# Redeploy
vercel --prod --force
```

### SignalR no conecta

```bash
# Verificar WebSockets
az webapp config show --name sportzone-api --resource-group sportzone-rg --query webSocketsEnabled

# Habilitar WebSockets
az webapp config set --name sportzone-api --resource-group sportzone-rg --web-sockets-enabled true
```

## 📞 Soporte

- **Documentación**: Ver archivos en esta carpeta
- **Issues**: Crear issue en GitHub
- **Email**: devops@sportzone.app

## 📝 Notas Importantes

- ⚠️ Siempre hacer backup antes de deployment
- ⚠️ Verificar health checks después de deployment
- ⚠️ Monitorear logs durante las primeras 24 horas
- ⚠️ Tener plan de rollback preparado

## 🔄 Actualizaciones

Este documento se actualiza con cada release. Última actualización: 2024-01-15

---

**¿Necesitas ayuda?** Consulta la [Guía Completa](../DEPLOYMENT_GUIDE.md) o contacta al equipo de DevOps.
