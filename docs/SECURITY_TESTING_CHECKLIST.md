# Checklist de Testing de Seguridad - SportZone Pro

## Instrucciones de Uso

Este checklist debe completarse antes de cada release a producción. Marcar cada ítem con:
- ✅ **PASS**: Test exitoso, sin vulnerabilidades
- ❌ **FAIL**: Test fallido, requiere remediación
- ⚠️ **WARN**: Test con advertencias, revisar
- ⏭️ **SKIP**: Test no aplicable en esta versión

**Responsable:** _________________  
**Fecha:** _________________  
**Versión:** _________________

---

## 1. Autenticación JWT

### 1.1 Validación de Tokens
- [ ] Request sin token retorna 401 Unauthorized
- [ ] Token malformado retorna 401 Unauthorized
- [ ] Token expirado retorna 401 Unauthorized
- [ ] Token con firma incorrecta retorna 401 Unauthorized
- [ ] Token válido es aceptado correctamente
- [ ] Token sin claim 'role' retorna 403 Forbidden
- [ ] Token con rol inválido retorna 403 Forbidden

### 1.2 Renovación de Tokens
- [ ] Refresh token válido genera nuevo access token
- [ ] Refresh token expirado retorna 401 Unauthorized
- [ ] Refresh token revocado no puede usarse

### 1.3 Logout y Revocación
- [ ] Logout invalida el token correctamente
- [ ] Token revocado no puede usarse después de logout

**Notas:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 2. Autorización por Roles

### 2.1 Endpoints Públicos (AllowAnonymous)
- [ ] GET /api/liga/posiciones/{torneoId} - accesible sin auth
- [ ] GET /api/goleadores/{torneoId} - accesible sin auth
- [ ] GET /api/partidos/en-vivo - accesible sin auth
- [ ] GET /api/partidos/{id} - accesible sin auth

### 2.2 Endpoints de Administrador (AdminOnly)
- [ ] POST /api/liga/torneos - solo admin
- [ ] POST /api/partidos/generar-fixture - solo admin
- [ ] POST /api/resoluciones - solo admin
- [ ] PATCH /api/resoluciones/{id}/aplicar - solo admin
- [ ] Planillero NO puede acceder a endpoints admin
- [ ] Árbitro NO puede acceder a endpoints admin
- [ ] Público NO puede acceder a endpoints admin

### 2.3 Endpoints de Planillero (PlanilleroOnly)
- [ ] POST /api/partidos/{id}/iniciar - planillero/admin
- [ ] POST /api/partidos/{id}/eventos - planillero/admin
- [ ] POST /api/partidos/{id}/finalizar - planillero/admin
- [ ] PUT /api/partidos/{id}/minuto - planillero/admin
- [ ] Árbitro NO puede acceder a endpoints planillero
- [ ] Público NO puede acceder a endpoints planillero

### 2.4 Endpoints de Árbitro (ArbitroOnly)
- [ ] GET /api/suspensiones - árbitro/admin (si existe)
- [ ] Árbitro NO puede modificar suspensiones
- [ ] Público NO puede acceder a endpoints árbitro

**Notas:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 3. Row Level Security (RLS)

### 3.1 Lectura Pública
- [ ] Tabla 'posiciones' - lectura pública habilitada
- [ ] Tabla 'partidos' - lectura pública habilitada
- [ ] Tabla 'equipos' - lectura pública habilitada
- [ ] Tabla 'jugadores' - lectura pública habilitada
- [ ] Tabla 'eventos_partido' - lectura pública habilitada
- [ ] Tabla 'estadisticas_jugador' - lectura pública habilitada

### 3.2 Escritura Restringida
- [ ] Usuario público NO puede insertar en 'partidos'
- [ ] Usuario público NO puede actualizar 'posiciones'
- [ ] Usuario público NO puede eliminar 'equipos'

### 3.3 Políticas de Solicitudes y Resoluciones
- [ ] Solo admin puede leer 'solicitudes'
- [ ] Solo admin puede escribir en 'solicitudes'
- [ ] Solo admin puede leer 'resoluciones'
- [ ] Solo admin puede escribir en 'resoluciones'
- [ ] Planillero NO puede acceder a 'solicitudes'
- [ ] Árbitro NO puede acceder a 'resoluciones'

### 3.4 Políticas de Suspensiones
- [ ] Árbitro puede leer 'suspensiones'
- [ ] Árbitro NO puede modificar 'suspensiones'
- [ ] Admin puede leer y modificar 'suspensiones'
- [ ] Público NO puede acceder a 'suspensiones'

### 3.5 Políticas de Campañas Marketing
- [ ] Admin puede acceder a 'campanas_marketing'
- [ ] Usuario con rol 'marketing' puede acceder
- [ ] Otros roles NO pueden acceder

**Notas:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 4. Validación de Planillero Asignado

### 4.1 Iniciar Partido
- [ ] Planillero asignado puede iniciar su partido
- [ ] Planillero NO asignado NO puede iniciar partido ajeno
- [ ] Admin puede iniciar cualquier partido
- [ ] Error 403 con mensaje claro al intentar acceso no autorizado

### 4.2 Registrar Eventos
- [ ] Planillero asignado puede registrar eventos en su partido
- [ ] Planillero NO asignado NO puede registrar eventos en partido ajeno
- [ ] Admin puede registrar eventos en cualquier partido
- [ ] RLS valida planillero_id = auth.uid() correctamente

### 4.3 Actualizar Partido
- [ ] Planillero asignado puede actualizar minuto de su partido
- [ ] Planillero NO asignado NO puede actualizar partido ajeno
- [ ] Admin puede actualizar cualquier partido

### 4.4 Finalizar Partido
- [ ] Planillero asignado puede finalizar su partido
- [ ] Planillero NO asignado NO puede finalizar partido ajeno
- [ ] Admin puede finalizar cualquier partido
- [ ] Finalización actualiza tabla de posiciones correctamente

**Notas:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 5. Protección contra Ataques

### 5.1 SQL Injection
- [ ] Parámetros de consulta no permiten inyección SQL
- [ ] Body JSON no permite inyección SQL
- [ ] Todas las consultas usan parametrización
- [ ] No hay concatenación de strings en queries

### 5.2 Cross-Site Scripting (XSS)
- [ ] Inputs con scripts no se ejecutan en frontend
- [ ] Angular sanitiza HTML dinámico correctamente
- [ ] Descripción de eventos con <script> no ejecuta código
- [ ] Nombres de equipos/jugadores con HTML no rompen UI

### 5.3 Cross-Site Request Forgery (CSRF)
- [ ] CORS configurado con orígenes específicos
- [ ] NO se usa AllowAnyOrigin en producción
- [ ] Requests desde orígenes no autorizados son bloqueados
- [ ] AllowCredentials solo si es necesario

### 5.4 Insecure Direct Object References (IDOR)
- [ ] Planillero A NO puede acceder a partido de Planillero B
- [ ] Usuario NO puede modificar datos de otro usuario
- [ ] IDs de recursos son validados contra permisos del usuario
- [ ] RLS previene acceso a recursos ajenos

### 5.5 Exposición de Información Sensible
- [ ] Contraseñas NO se exponen en responses
- [ ] JWT Secret NO está en código fuente
- [ ] Mensajes de error son genéricos (no verbosos)
- [ ] Logs NO contienen información sensible
- [ ] Variables de entorno protegidas

### 5.6 Enumeración de Recursos
- [ ] IDs no existentes retornan 404 genérico
- [ ] NO se revela existencia de recursos protegidos
- [ ] Mensajes de error no revelan estructura de datos

### 5.7 Rate Limiting
- [ ] Múltiples intentos de login son limitados
- [ ] Requests masivos al API son limitados (429)
- [ ] Supabase rate limiting está habilitado
- [ ] Middleware de rate limiting implementado (si aplica)

### 5.8 Manipulación de Tokens
- [ ] Token con payload modificado es rechazado
- [ ] Token con claim 'role' modificado es rechazado
- [ ] Firma de token es validada correctamente

**Notas:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 6. Configuración de Seguridad

### 6.1 HTTPS y Certificados
- [ ] HTTPS habilitado en producción
- [ ] Certificado SSL válido y no expirado
- [ ] Redirección HTTP → HTTPS configurada
- [ ] HSTS header configurado

### 6.2 CORS
- [ ] Orígenes permitidos son específicos
- [ ] NO se usa AllowAnyOrigin en producción
- [ ] AllowCredentials solo si es necesario
- [ ] Métodos permitidos son los mínimos necesarios

### 6.3 Variables de Entorno
- [ ] JWT Secret es fuerte (mínimo 32 caracteres)
- [ ] Supabase Service Role Key protegida
- [ ] Variables sensibles NO están en código fuente
- [ ] .env NO está en control de versiones

### 6.4 Logging y Monitoreo
- [ ] Logs NO contienen contraseñas
- [ ] Logs NO contienen tokens completos
- [ ] Intentos de acceso no autorizado son registrados
- [ ] Errores de autenticación son monitoreados

### 6.5 Dependencias
- [ ] Paquetes NuGet actualizados
- [ ] Paquetes npm actualizados
- [ ] No hay vulnerabilidades conocidas (npm audit / dotnet list package --vulnerable)

**Notas:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 7. Tests Automatizados

### 7.1 Tests Unitarios
- [ ] Tests de AuthService ejecutan correctamente
- [ ] Tests de autorización por roles pasan
- [ ] Tests de validación de planillero pasan
- [ ] Cobertura de código > 70%

### 7.2 Tests de Integración
- [ ] Tests de endpoints protegidos pasan
- [ ] Tests de RLS pasan
- [ ] Tests de flujos completos pasan

### 7.3 Tests E2E
- [ ] Flujo de login funciona correctamente
- [ ] Flujo de registro de eventos funciona
- [ ] Flujo de finalización de partido funciona

**Notas:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 8. Revisión de Código

### 8.1 Backend (.NET)
- [ ] No hay hardcoded secrets
- [ ] Todas las consultas son parametrizadas
- [ ] Todos los endpoints tienen atributos de autorización
- [ ] Manejo de errores no expone detalles internos

### 8.2 Frontend (Angular)
- [ ] Tokens NO se almacenan en localStorage (usar httpOnly cookies si es posible)
- [ ] Guards protegen rutas correctamente
- [ ] Interceptor agrega token a requests
- [ ] Sanitización de HTML dinámico

### 8.3 Base de Datos
- [ ] Todas las tablas sensibles tienen RLS habilitado
- [ ] Políticas RLS son correctas y completas
- [ ] Funciones de base de datos usan SECURITY DEFINER apropiadamente
- [ ] Índices no exponen información sensible

**Notas:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## Resumen de Resultados

**Total de Tests:** _______  
**Tests Exitosos (✅):** _______  
**Tests Fallidos (❌):** _______  
**Advertencias (⚠️):** _______  
**Tests Omitidos (⏭️):** _______

**Porcentaje de Éxito:** _______%

### Vulnerabilidades Críticas Encontradas
```
1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________
```

### Acciones Requeridas Antes de Release
```
1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________
```

### Aprobación

**Aprobado para Producción:** [ ] SÍ  [ ] NO

**Firma del Responsable de Seguridad:** _________________

**Fecha de Aprobación:** _________________

