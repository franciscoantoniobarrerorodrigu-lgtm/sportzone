# Checklist de Deployment - SportZone Pro

Use este checklist para asegurar que todos los pasos de deployment se completen correctamente.

---

## Pre-Deployment

### Preparación de Código

- [ ] Todos los tests pasando (backend y frontend)
- [ ] Código revisado y aprobado (code review)
- [ ] Sin errores de linting
- [ ] Sin warnings críticos de compilación
- [ ] Documentación actualizada
- [ ] CHANGELOG.md actualizado con nueva versión

### Preparación de Infraestructura

- [ ] Backup completo de base de datos realizado
- [ ] Variables de entorno de producción configuradas
- [ ] Certificados SSL verificados
- [ ] Dominios DNS configurados
- [ ] Secrets de GitHub Actions configurados
- [ ] Credenciales de Firebase disponibles

### Preparación de Base de Datos

- [ ] Scripts de migración probados en staging
- [ ] Índices verificados
- [ ] Queries optimizadas
- [ ] Backups automáticos configurados
- [ ] Plan de rollback preparado

---

## Deployment Backend

### Azure App Service

- [ ] Resource Group creado
- [ ] App Service Plan creado (SKU apropiado)
- [ ] Web App creada
- [ ] HTTPS only habilitado
- [ ] WebSockets habilitado (para SignalR)
- [ ] Variables de entorno configuradas
- [ ] Connection strings configuradas
- [ ] Application Insights conectado

### Configuración de API

- [ ] CORS configurado para dominio de producción
- [ ] JWT authentication configurado
- [ ] Rate limiting configurado
- [ ] Logging configurado
- [ ] Health checks implementados
- [ ] Swagger UI accesible (solo en desarrollo)

### CI/CD Backend

- [ ] GitHub Actions workflow configurado
- [ ] Publish profile descargado de Azure
- [ ] Secret AZURE_WEBAPP_PUBLISH_PROFILE agregado a GitHub
- [ ] Pipeline ejecutado exitosamente
- [ ] Deployment verificado

---

## Deployment Frontend

### Vercel/Netlify

- [ ] Proyecto conectado a repositorio GitHub
- [ ] Framework preset configurado (Angular)
- [ ] Build command configurado
- [ ] Output directory configurado
- [ ] Variables de entorno configuradas
- [ ] Dominio personalizado configurado
- [ ] SSL/TLS habilitado automáticamente

### Configuración de Frontend

- [ ] environment.prod.ts configurado
- [ ] API URLs apuntando a producción
- [ ] Firebase configurado
- [ ] Supabase configurado
- [ ] Service Worker habilitado (PWA)
- [ ] Manifest.json configurado

### CI/CD Frontend

- [ ] GitHub Actions workflow configurado
- [ ] Secrets de Vercel configurados (TOKEN, ORG_ID, PROJECT_ID)
- [ ] Pipeline ejecutado exitosamente
- [ ] Deployment verificado

---

## Deployment Base de Datos

### Migraciones

- [ ] Backup pre-migración realizado
- [ ] Scripts de migración ejecutados en orden
- [ ] Extensiones habilitadas (uuid-ossp, pgcrypto)
- [ ] Tablas creadas correctamente
- [ ] Vistas creadas correctamente
- [ ] Funciones creadas correctamente
- [ ] Triggers creados correctamente
- [ ] RLS (Row Level Security) habilitado
- [ ] Índices creados correctamente

### Datos Iniciales

- [ ] Datos de seed ejecutados (si aplica)
- [ ] Usuarios de prueba creados
- [ ] Roles asignados correctamente
- [ ] Temporada activa creada
- [ ] Torneo activo creado

### Verificación

- [ ] Queries de prueba ejecutadas
- [ ] Rendimiento de queries verificado
- [ ] Backups automáticos configurados
- [ ] Retención de backups configurada

---

## Monitoreo y Logs

### Application Insights

- [ ] Application Insights creado
- [ ] Connection string configurado en backend
- [ ] Telemetría funcionando
- [ ] Métricas personalizadas implementadas
- [ ] Dashboard creado

### Alertas

- [ ] Alerta de errores 5xx configurada
- [ ] Alerta de tiempo de respuesta configurada
- [ ] Alerta de disponibilidad configurada
- [ ] Alerta de CPU alta configurada
- [ ] Alerta de memoria alta configurada
- [ ] Notificaciones por email configuradas

### Health Checks

- [ ] Endpoint /health respondiendo
- [ ] Endpoint /health/ready respondiendo
- [ ] Endpoint /health/live respondiendo
- [ ] Health checks de Supabase funcionando
- [ ] Health checks de SignalR funcionando

### Logs

- [ ] Serilog configurado
- [ ] Logs estructurados implementados
- [ ] Logs enviándose a Application Insights
- [ ] Retención de logs configurada
- [ ] Queries de logs guardadas

---

## Verificación Post-Deployment

### Backend

- [ ] API responde en https://api.sportzone.app
- [ ] Health check retorna status 200
- [ ] Swagger UI accesible (si está habilitado)
- [ ] Endpoints principales funcionando:
  - [ ] GET /api/liga/torneos
  - [ ] GET /api/liga/posiciones/{torneoId}
  - [ ] GET /api/partidos/proximos
  - [ ] GET /api/goleadores/{torneoId}
- [ ] SignalR hub conectando correctamente
- [ ] Autenticación JWT funcionando
- [ ] CORS funcionando desde frontend

### Frontend

- [ ] Sitio carga en https://sportzone.app
- [ ] Todas las páginas accesibles
- [ ] Navegación funcionando
- [ ] Imágenes cargando correctamente
- [ ] Estilos aplicados correctamente
- [ ] Service Worker instalado (PWA)
- [ ] Manifest.json accesible

### Integración

- [ ] Frontend conecta con backend API
- [ ] SignalR conecta desde frontend
- [ ] Autenticación funciona end-to-end
- [ ] Datos se muestran correctamente
- [ ] Actualizaciones en tiempo real funcionan
- [ ] Notificaciones push funcionan (si aplica)

### Rendimiento

- [ ] Tiempo de carga < 3 segundos
- [ ] Time to Interactive < 5 segundos
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals en verde
- [ ] API response time < 500ms
- [ ] SignalR latency < 100ms

---

## Seguridad

### Backend

- [ ] HTTPS only habilitado
- [ ] CORS configurado correctamente
- [ ] JWT tokens validándose
- [ ] Rate limiting activo
- [ ] SQL injection protegido (parametrized queries)
- [ ] XSS protegido
- [ ] CSRF protegido

### Frontend

- [ ] HTTPS habilitado
- [ ] Security headers configurados:
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Secrets no expuestos en código
- [ ] Environment variables usadas correctamente

### Base de Datos

- [ ] RLS habilitado en tablas sensibles
- [ ] Políticas de RLS configuradas
- [ ] Passwords encriptados
- [ ] Conexiones SSL habilitadas
- [ ] Backups encriptados

---

## Documentación

- [ ] README.md actualizado
- [ ] Guía de deployment actualizada
- [ ] Documentación de API actualizada
- [ ] Diagramas de arquitectura actualizados
- [ ] Procedimientos operativos documentados
- [ ] Contactos de soporte documentados

---

## Comunicación

- [ ] Stakeholders notificados del deployment
- [ ] Equipo de soporte informado
- [ ] Usuarios notificados (si aplica)
- [ ] Ventana de mantenimiento comunicada
- [ ] Plan de rollback comunicado

---

## Post-Deployment

### Monitoreo Inmediato (primeras 24 horas)

- [ ] Monitorear logs de errores
- [ ] Monitorear métricas de rendimiento
- [ ] Monitorear uso de recursos (CPU, memoria)
- [ ] Monitorear tráfico de usuarios
- [ ] Verificar alertas funcionando

### Smoke Tests

- [ ] Login de usuario
- [ ] Visualización de tabla de posiciones
- [ ] Visualización de goleadores
- [ ] Visualización de cronograma
- [ ] Inicio de partido (si aplica)
- [ ] Registro de evento (si aplica)
- [ ] Actualización en tiempo real

### Rollback Plan

- [ ] Procedimiento de rollback documentado
- [ ] Backup pre-deployment disponible
- [ ] Versión anterior identificada
- [ ] Comandos de rollback preparados
- [ ] Equipo capacitado en rollback

---

## Firma de Aprobación

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Tech Lead | | | |
| DevOps | | | |
| QA Lead | | | |
| Product Owner | | | |

---

## Notas Adicionales

Usar este espacio para notas específicas del deployment:

```
[Agregar notas aquí]
```

---

**Versión**: 1.0  
**Última actualización**: 2024-01-15  
**Próxima revisión**: 2024-02-15
