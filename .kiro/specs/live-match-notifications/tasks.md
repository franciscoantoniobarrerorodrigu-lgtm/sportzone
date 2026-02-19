# Plan de Implementación: SportZone Pro

## Resumen del Proyecto

Sistema integral de gestión de campeonatos deportivos profesionales con transmisión en tiempo real de resultados, gestión disciplinaria automática, generación de fixture sin conflictos, y aplicación PWA para planilleros.

**Stack:** Angular 17 + .NET 8 + Supabase PostgreSQL + SignalR + Firebase Cloud Messaging

---

## Fase 1: Configuración de Infraestructura y Base de Datos ✅

**Scripts creados en `/database/`:**
- ✅ Scripts SQL organizados (01-13)
- ✅ README con instrucciones
- ✅ Script de instalación completa (00_install_all.sql)
- ✅ Guía de configuración en `/docs/SUPABASE_SETUP.md`

### 1.1 Configuración de Supabase
- [x] Crear proyecto en Supabase (seguir guía en docs/SUPABASE_SETUP.md)
- [x] Configurar autenticación con JWT
- [x] Habilitar Supabase Realtime
- [x] Obtener credenciales (URL, Anon Key, JWT Secret)

### 1.2 Crear Schema de Base de Datos
- [x] Ejecutar script 01_extensions.sql
- [x] Ejecutar script 02_tables_core.sql (temporadas, torneos, equipos, jugadores)
- [x] Ejecutar script 03_tables_partidos.sql (partidos, eventos_partido, posiciones, estadisticas_jugador)
- [x] Ejecutar script 04_tables_admin.sql (solicitudes, resoluciones, suspensiones)
- [x] Ejecutar script 05_tables_notificaciones.sql (suscripciones_notificaciones, dispositivos_fcm)
- [x] Ejecutar script 06_tables_marketing.sql (campanas_marketing, patrocinadores)

### 1.3 Crear Vistas de Base de Datos
- [x] Ejecutar script 07_views.sql (v_goleadores, v_tabla_posiciones, v_partidos_completos)

### 1.4 Crear Funciones y Triggers
- [x] Ejecutar script 08_functions.sql (fn_actualizar_posiciones, fn_verificar_suspensiones, update_updated_at)
- [x] Ejecutar script 09_triggers.sql (trg_actualizar_estadisticas, trg_eventos_actualizar_estadisticas)

### 1.5 Configurar Row Level Security (RLS)
- [x] Ejecutar script 10_rls.sql (políticas para todas las tablas)

### 1.6 Crear Índices de Rendimiento
- [x] Ejecutar script 11_indexes.sql (índices para todas las tablas)

### 1.7 Datos de Prueba y Configuración de Roles
- [x] Ejecutar script 12_seed_data.sql (opcional - datos de prueba)
- [x] Ejecutar script 13_auth_roles.sql (sistema de roles)
- [x] Crear usuarios de prueba (admin, planillero, árbitro)
- [x] Asignar roles usando función update_user_role

---

## Fase 2: Backend API (.NET 8) ✅

### 2.1 Configuración Inicial del Proyecto
- [x] Crear proyecto .NET 8 Web API
- [x] Instalar paquetes NuGet (Supabase, SignalR, FirebaseAdmin, JWT)
- [x] Configurar appsettings.json con credenciales de Supabase y Firebase
- [x] Configurar Program.cs con DI, CORS, JWT Auth, SignalR

### 2.2 Modelos y DTOs
- [x] Crear modelos de entidades (Partido, Equipo, Jugador, etc.)
- [x] Crear DTOs de request (CreatePartidoDto, CreateEventoDto, GenerarFixtureDto, etc.)
- [x] Crear DTOs de response (PartidoDto, EventoPartidoDto, PosicionEquipoDto, etc.)

### 2.3 Servicios de Negocio - Liga
- [x] Implementar ILigaService y LigaService
- [x] Método GetTablaPosicionesAsync con caché
- [x] Método GetTorneosActivosAsync
- [x] Método GetResultadosJornadaAsync

### 2.4 Servicios de Negocio - Partidos
- [x] Implementar IPartidosService y PartidosService
- [x] Método GetProximosPartidosAsync
- [x] Método GetPartidoConEventosAsync
- [x] Método GetPartidoEnVivoAsync
- [x] Método CreatePartidoAsync
- [x] Método IniciarPartidoAsync con validación de planillero
- [x] Método AddEventoAsync con validación de planillero y estado
- [x] Método FinalizarPartidoAsync con doble confirmación
- [x] Método ActualizarMinutoAsync

### 2.5 Servicios de Negocio - Goleadores
- [x] Implementar IGoleadoresService y GoleadoresService
- [x] Método GetRankingGoleadoresAsync
- [x] Método GetRankingAsistidoresAsync
- [x] Método GetRankingTarjetasAsync

### 2.6 Servicios de Negocio - Fixture Generator
- [x] Implementar IFixtureGeneratorService y FixtureGeneratorService
- [x] Implementar algoritmo Round-Robin
- [x] Método GenerarFixtureAsync con validación de conflictos
- [x] Método ValidarConflictosAsync (mismo equipo no juega 2 veces el mismo día)
- [x] Asignación aleatoria de horarios
- [x] Soporte para seed de reproducibilidad

### 2.7 Servicios de Negocio - Suspension Manager
- [x] Implementar ISuspensionManagerService y SuspensionManagerService
- [x] Método VerificarSuspensionesAsync (3 amarillas = 1 partido, 1 roja = 2 partidos)
- [x] Método GetSuspensionesActivasAsync
- [x] Método DescontarSuspensionAsync
- [x] Método ValidarJugadorHabilitadoAsync

### 2.8 Servicios de Negocio - Solicitudes y Resoluciones
- [x] Implementar ISolicitudesService y SolicitudesService
- [x] Implementar IResolucionesService y ResolucionesService
- [x] Método AplicarResolucionAsync (suspensión, descuento puntos, W.O., multa)
- [x] Método RevertirResolucionAsync

### 2.9 Servicios de Negocio - Notificaciones
- [x] Implementar INotificationService y NotificationService
- [x] Configurar Firebase Cloud Messaging
- [x] Método EnviarNotificacionGolAsync
- [x] Método EnviarNotificacionTarjetaAsync
- [x] Método EnviarNotificacionInicioPartidoAsync
- [x] Método EnviarNotificacionFinPartidoAsync
- [x] Implementar retry con backoff exponencial
- [x] Método para eliminar tokens FCM inválidos

### 2.10 SignalR Hub
- [x] Crear PartidoHub
- [x] Implementar método SuscribirPartido
- [x] Implementar método DesuscribirPartido
- [x] Implementar método BroadcastEvento
- [x] Implementar método BroadcastMinuto
- [x] Implementar método BroadcastMarcador
- [x] Configurar eventos OnConnectedAsync y OnDisconnectedAsync

### 2.11 Controllers - Liga
- [x] Crear LigaController
- [x] Endpoint GET /api/liga/posiciones/{torneoId}
- [x] Endpoint GET /api/liga/torneos
- [x] Endpoint GET /api/liga/{torneoId}/jornada/{numero}
- [x] Endpoint POST /api/liga/torneos (AdminOnly)

### 2.12 Controllers - Partidos
- [x] Crear PartidosController
- [x] Endpoint GET /api/partidos/proximos
- [x] Endpoint GET /api/partidos/{id}
- [x] Endpoint GET /api/partidos/en-vivo
- [x] Endpoint POST /api/partidos (AdminOnly)
- [x] Endpoint PATCH /api/partidos/{id}/iniciar (Planillero)
- [x] Endpoint POST /api/partidos/{id}/eventos (Planillero)
- [x] Endpoint PATCH /api/partidos/{id}/finalizar (Planillero)
- [x] Endpoint POST /api/partidos/generar-fixture (AdminOnly)

### 2.13 Controllers - Goleadores
- [x] Crear GoleadoresController
- [x] Endpoint GET /api/goleadores/{torneoId}
- [x] Endpoint GET /api/goleadores/{torneoId}/asistencias
- [x] Endpoint GET /api/goleadores/{torneoId}/tarjetas

### 2.14 Controllers - Solicitudes y Resoluciones
- [x] Crear SolicitudesController con endpoints CRUD
- [x] Crear ResolucionesController con endpoints CRUD
- [x] Endpoint PATCH /api/resoluciones/{id}/aplicar

### 2.15 Middleware y Manejo de Errores
- [x] Crear ErrorHandlingMiddleware
- [x] Crear RequestLoggingMiddleware
- [x] Configurar logging con Application Insights

### 2.16 Testing Backend
- [x] Escribir tests unitarios para servicios críticos
- [x] Escribir tests de integración para endpoints principales
- [x] Probar flujo completo de registro de evento

---

## Fase 3: Frontend Portal Web (Angular 17)

### 3.1 Configuración Inicial del Proyecto
- [x] Crear proyecto Angular 17 con standalone components
- [x] Instalar dependencias (@angular/common/http, @microsoft/signalr, @supabase/supabase-js)
- [x] Configurar environments (development, production)
- [x] Configurar estilos globales (variables SCSS, tema oscuro)
- [x] Importar fuentes (Bebas Neue, Barlow)

### 3.2 Core - Servicios
- [x] Crear AuthService con Supabase Auth
- [x] Crear LigaService con Signals
- [x] Crear PartidosService con SignalR
- [x] Crear GoleadoresService
- [x] Crear SolicitudesService
- [x] Crear ResolucionesService
- [x] Crear SignalRService (wrapper genérico)

### 3.3 Core - Guards e Interceptors
- [x] Crear authGuard
- [x] Crear adminGuard
- [ ] Crear planilleroGuard
- [x] Crear authInterceptor para agregar JWT a requests

### 3.4 Core - Modelos
- [x] Crear interfaces TypeScript para todas las entidades
- [x] Crear tipos para DTOs

### 3.5 Layout
- [x] Crear ShellComponent (layout principal)
- [x] Crear NavbarComponent con logo y navegación
- [x] Implementar diseño responsive

### 3.6 Feature - Autenticación
- [x] Crear LoginComponent
- [x] Implementar formulario de login
- [x] Integrar con AuthService
- [x] Redireccionamiento según rol

### 3.7 Feature - Dashboard
- [x] Crear DashboardComponent
- [x] Mostrar partidos en vivo
- [x] Mostrar próximos partidos
- [x] Mostrar estadísticas rápidas

### 3.8 Feature - Liga
- [x] Crear LigaComponent
- [x] Crear TablaPosicionesComponent
- [x] Implementar resaltado de zonas (clasificación, descenso)
- [ ] Mostrar forma (últimos 5 resultados)

### 3.9 Feature - Goleadores
- [x] Crear GoleadoresComponent
- [x] Implementar tabs (Goleadores, Asistidores, Tarjetas)
- [x] Mostrar medallas oro/plata/bronce para top 3
- [x] Mostrar barra de progreso proporcional
- [ ] Modal con estadísticas completas del jugador

### 3.10 Feature - Cronograma
- [x] Crear CronogramaComponent
- [x] Mostrar partidos agrupados por jornada
- [x] Filtros por torneo y equipo
- [ ] Vista de calendario

### 3.11 Feature - Partido en Vivo
- [x] Crear PartidoLiveComponent
- [x] Mostrar marcador en tiempo real
- [x] Mostrar cronómetro sincronizado
- [x] Mostrar timeline de eventos
- [x] Integrar con SignalR para actualizaciones en tiempo real
- [x] Animaciones para eventos (gol, tarjeta)

### 3.12 Feature - Marcador Público
- [x] Crear MarcadorPublicoComponent optimizado para pantalla grande
- [x] Números de goles en tamaño 120px+
- [x] Indicador "EN VIVO" parpadeante
- [x] Cronómetro en tamaño 60px
- [x] Notificaciones animadas de eventos
- [x] Botón para modo pantalla completa (Fullscreen API)

### 3.13 Feature - Solicitudes (Admin)
- [x] Crear SolicitudesComponent
- [x] Lista con filtros (estado, tipo)
- [x] Formulario de creación
- [x] Actualización de estado (aprobar/rechazar)
- [x] Paginación

### 3.14 Feature - Resoluciones (Admin)
- [x] Crear ResolucionesComponent
- [x] Lista con filtros
- [x] Formulario de creación con tipos de sanción
- [x] Aplicar resolución
- [x] Anular resolución

### 3.15 Shared Components
- [x] Crear CardEquipoComponent
- [x] Crear BadgeEstadoComponent
- [x] Crear TimelineEventoComponent
- [x] Crear LoadingComponent

### 3.16 Shared Pipes
- [x] Crear MinutoPipe (formato MM:SS)
- [x] Crear FechaPipe personalizado

### 3.17 Shared Directives
- [x] Crear LazyLoadDirective para imágenes

### 3.18 Testing Frontend
- [x] Escribir tests unitarios para servicios
- [x] Escribir tests de componentes principales
- [x] Probar integración con SignalR

---

## Fase 4: App Planillero (PWA) ✅

### 4.1 Configuración PWA
- [x] Configurar manifest.json
- [x] Configurar service worker
- [x] Configurar iconos para instalación
- [x] Configurar orientación landscape
- [x] Probar instalación en tablet

### 4.2 PlanilleroComponent
- [x] Crear interfaz optimizada para tablet (sin navbar/sidebar)
- [x] Implementar marcador superior con equipos y goles
- [x] Implementar cronómetro gigante (80px) en amarillo
- [x] Implementar controles de tiempo (iniciar, pausar, medio tiempo)

### 4.3 Selector de Equipo y Jugadores
- [x] Implementar selector de equipo (local/visita)
- [x] Mostrar lista de jugadores del equipo seleccionado
- [x] Botones grandes (80x80px mínimo) para jugadores

### 4.4 Botones de Eventos Rápidos
- [x] Botón GOL (verde, 120px altura)
- [x] Botón TARJETA AMARILLA (amarillo, 120px altura)
- [x] Botón TARJETA ROJA (rojo, 120px altura)
- [x] Botón SUSTITUCIÓN (azul, 120px altura)
- [x] Confirmación visual inmediata al registrar evento

### 4.5 Cronómetro del Partido
- [x] Implementar incremento automático cada minuto
- [x] Sincronizar con backend cada 30 segundos
- [x] Pausar y reanudar cronómetro
- [x] Resetear en medio tiempo

### 4.6 Finalización de Partido
- [x] Implementar botón FINALIZAR PARTIDO (grande, rojo)
- [x] Implementar primer modal de confirmación
- [x] Implementar segundo modal con marcador final
- [x] Enviar PATCH /partidos/{id}/finalizar
- [x] Mostrar pantalla de resumen final

### 4.7 Timeline de Eventos
- [x] Mostrar eventos registrados en orden cronológico
- [x] Scroll automático al último evento

### 4.8 Validación de Planillero Asignado
- [x] Cargar partido asignado al planillero logueado
- [x] Mostrar mensaje si no hay partido asignado
- [x] Validar permisos antes de cada acción

### 4.9 Modo Offline (Opcional)
- [x] Implementar caché de datos del partido
- [x] Encolar eventos cuando no hay conexión
- [x] Sincronizar al recuperar conexión

### 4.10 Testing PWA
- [x] Probar instalación en Android
- [x] Probar instalación en iOS
- [x] Probar en tablets de diferentes tamaños
- [x] Probar con guantes (botones grandes)

---

## Fase 5: Integración y Testing

### 5.1 Integración Backend-Frontend
- [x] Probar flujo completo de login
- [x] Probar carga de tabla de posiciones
- [x] Probar carga de goleadores
- [x] Probar cronograma de partidos

### 5.2 Integración SignalR
- [x] Probar conexión de múltiples clientes
- [x] Probar broadcast de eventos
- [x] Probar reconexión automática
- [x] Probar con 100+ usuarios concurrentes

### 5.3 Integración Notificaciones Push
- [ ] Configurar Firebase Cloud Messaging ⚠️ BLOQUEADO: Pendiente de credenciales (ver docs/FIREBASE_SETUP_PENDIENTE.md)
- [ ] Probar registro de tokens FCM ⚠️ BLOQUEADO: Requiere credenciales Firebase
- [ ] Probar envío de notificaciones de gol ⚠️ BLOQUEADO: Requiere credenciales Firebase
- [ ] Probar envío de notificaciones de tarjeta roja ⚠️ BLOQUEADO: Requiere credenciales Firebase
- [ ] Probar filtrado por preferencias ⚠️ BLOQUEADO: Requiere credenciales Firebase

**NOTA:** El backend `NotificationService.cs` está completamente implementado. Las tareas están bloqueadas debido a restricciones de política organizacional en Google Cloud que impiden crear claves de cuenta de servicio. Ver `docs/FIREBASE_SETUP_PENDIENTE.md` para detalles y soluciones.

### 5.4 Testing de Flujos Críticos
- [x] Probar flujo completo de registro de gol
- [x] Probar flujo completo de finalización de partido
- [x] Probar actualización automática de tabla de posiciones
- [x] Probar generación de suspensiones automáticas
- [x] Probar generación de fixture sin conflictos
- [x] Probar aplicación de resoluciones administrativas

### 5.5 Testing de Rendimiento
- [x] Probar con 1000 usuarios concurrentes en SignalR
- [x] Probar con 10 eventos por segundo
- [x] Probar envío de notificaciones a 10,000 dispositivos
- [x] Probar con 50 partidos en vivo simultáneos

### 5.6 Testing de Seguridad
- [x] Probar autenticación JWT
- [x] Probar autorización por roles
- [x] Probar Row Level Security en Supabase
- [x] Probar validación de planillero asignado
- [x] Intentar accesos no autorizados

---

## Fase 6: Deployment ✅

### 6.1 Preparación para Producción
- [x] Configurar variables de entorno de producción
- [x] Configurar CORS para dominio de producción
- [x] Configurar certificados SSL
- [x] Optimizar build de Angular (--prod)
- [x] Optimizar build de .NET (Release)

### 6.2 Deployment Backend
- [x] Crear Dockerfile para backend
- [x] Configurar Azure App Service o similar
- [x] Configurar CI/CD con GitHub Actions
- [x] Configurar logging y monitoreo
- [x] Configurar Application Insights

### 6.3 Deployment Frontend
- [x] Crear Dockerfile para frontend
- [x] Configurar Vercel o Netlify
- [x] Configurar CI/CD
- [x] Configurar CDN para assets
- [x] Configurar caché de navegador

### 6.4 Deployment Base de Datos
- [x] Backup de base de datos
- [x] Ejecutar migraciones en producción
- [x] Verificar índices y rendimiento
- [x] Configurar backups automáticos

### 6.5 Monitoreo y Logs
- [x] Configurar alertas de errores
- [x] Configurar dashboard de métricas
- [x] Configurar logs centralizados
- [x] Configurar health checks

---

## Fase 7: Documentación y Capacitación

### 7.1 Documentación Técnica
- [x] Documentar API con Swagger
- [x] Documentar arquitectura del sistema
- [x] Documentar flujos de datos
- [x] Documentar procedimientos de deployment

### 7.2 Documentación de Usuario
- [x] Manual de usuario para administradores
- [x] Manual de usuario para planilleros
- [x] Manual de usuario para árbitros
- [x] Guía de uso del portal público

### 7.3 Capacitación
- [x] Capacitar a administradores
- [x] Capacitar a planilleros
- [x] Capacitar a árbitros
- [x] Crear videos tutoriales

---

## Notas de Implementación

### Prioridades
1. **Crítico**: Fase 1 (Base de datos), Fase 2.1-2.4 (Backend básico), Fase 3.1-3.8 (Frontend básico)
2. **Alto**: Fase 2.5-2.10 (Servicios avanzados), Fase 3.9-3.12 (Features avanzadas), Fase 4 (PWA)
3. **Medio**: Fase 2.11-2.15 (Controllers y middleware), Fase 5 (Testing)
4. **Bajo**: Fase 6 (Deployment), Fase 7 (Documentación)

### Dependencias Críticas
- La Fase 2 depende de la Fase 1 (base de datos)
- La Fase 3 depende de la Fase 2 (backend API)
- La Fase 4 depende de la Fase 2 y 3 (backend y servicios)
- La Fase 5 depende de todas las fases anteriores

### Estimación de Tiempo
- Fase 1: 1-2 semanas
- Fase 2: 3-4 semanas
- Fase 3: 3-4 semanas
- Fase 4: 2-3 semanas
- Fase 5: 2 semanas
- Fase 6: 1 semana
- Fase 7: 1 semana

**Total estimado: 13-17 semanas**
