# Arquitectura del Sistema - SportZone Pro

## 1. Visión General

SportZone Pro es un sistema integral de gestión de campeonatos deportivos profesionales que permite:
- Gestión completa de torneos, equipos y jugadores
- Transmisión de resultados en tiempo real
- Generación automática de fixture sin conflictos
- Gestión disciplinaria automática (tarjetas y suspensiones)
- Aplicación PWA para planilleros en tablets
- Portal web público y administrativo

### 1.1 Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Frontend Web | Angular | 17 |
| Frontend PWA | Angular PWA | 17 |
| Backend API | .NET | 8 |
| Base de Datos | PostgreSQL (Supabase) | 15 |
| Tiempo Real | SignalR + Supabase Realtime | - |
| Autenticación | Supabase Auth | - |
| Notificaciones | Firebase Cloud Messaging | - |
| Hosting Frontend | Vercel | - |
| Hosting Backend | Azure App Service | - |

---

## 2. Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                      │
├──────────────────────────────┬──────────────────────────────────┤
│   Portal Web (Angular 17)   │   App Planillero (PWA)           │
│   - Dashboard público        │   - Registro de eventos          │
│   - Tabla de posiciones      │   - Cronómetro en vivo           │
│   - Goleadores               │   - Interfaz optimizada tablet   │
│   - Cronograma               │   - Modo offline                 │
│   - Admin (solicitudes)      │                                  │
└──────────────────────────────┴──────────────────────────────────┘
                            ↕ HTTP/REST + WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE NEGOCIO                           │
├─────────────────────────────────────────────────────────────────┤
│  .NET 8 Web API                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Controllers  │  │  Services    │  │  SignalR Hub │         │
│  │ - Liga       │  │ - Business   │  │ - PartidoHub │         │
│  │ - Partidos   │  │   Logic      │  │ - Real-time  │         │
│  │ - Goleadores │  │ - Fixture    │  │   broadcast  │         │
│  │ - Solicitudes│  │   Generator  │  │              │         │
│  │ - Resoluc.   │  │ - Suspension │  │              │         │
│  └──────────────┘  │   Manager    │  └──────────────┘         │
│                    │ - Notif.     │                            │
│                    │   Service    │                            │
│                    └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                            ↕ SQL + Realtime
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE DATOS                             │
├─────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Tablas     │  │    Vistas    │  │  Funciones   │         │
│  │ - equipos    │  │ - goleadores │  │ - actualizar │         │
│  │ - jugadores  │  │ - posiciones │  │   posiciones │         │
│  │ - partidos   │  │ - partidos   │  │ - verificar  │         │
│  │ - eventos    │  │   completos  │  │   suspens.   │         │
│  │ - posiciones │  └──────────────┘  └──────────────┘         │
│  │ - solicitudes│                                               │
│  │ - resoluc.   │  ┌──────────────┐  ┌──────────────┐         │
│  └──────────────┘  │   Triggers   │  │     RLS      │         │
│                    │ - eventos    │  │ - Políticas  │         │
│                    │ - estadíst.  │  │   seguridad  │         │
│                    └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Arquitectura de 3 Capas

### 3.1 Capa de Presentación

#### Portal Web (Angular 17)
- **Propósito**: Interfaz pública y administrativa
- **Usuarios**: Público, administradores, árbitros
- **Características**:
  - Standalone components con Signals
  - Lazy loading de módulos
  - Tema oscuro profesional tipo ESPN
  - Responsive (móvil, tablet, desktop)
  - Actualizaciones en tiempo real vía SignalR

#### App Planillero (PWA)
- **Propósito**: Registro de eventos desde la cancha
- **Usuarios**: Planilleros
- **Características**:
  - Instalable en tablets Android/iOS
  - Interfaz optimizada para pantalla táctil
  - Botones grandes (80x80px mínimo)
  - Modo offline con sincronización
  - Orientación landscape forzada

### 3.2 Capa de Negocio

#### .NET 8 Web API
- **Arquitectura**: Clean Architecture con separación de responsabilidades
- **Componentes principales**:

**Controllers**:
- `LigaController`: Tabla de posiciones, torneos, jornadas
- `PartidosController`: CRUD de partidos, eventos, fixture
- `GoleadoresController`: Rankings de goleadores, asistencias, tarjetas
- `SolicitudesController`: Gestión de solicitudes administrativas
- `ResolucionesController`: Emisión y aplicación de resoluciones

**Services**:
- `LigaService`: Lógica de negocio para tabla de posiciones
- `PartidosService`: Gestión de partidos y eventos
- `FixtureGeneratorService`: Algoritmo Round-Robin para fixture
- `SuspensionManagerService`: Gestión automática de suspensiones
- `NotificationService`: Envío de notificaciones push vía FCM

**SignalR Hub**:
- `PartidoHub`: Comunicación WebSocket en tiempo real
  - Suscripción a partidos específicos
  - Broadcast de eventos, marcadores, minutos
  - Reconexión automática

### 3.3 Capa de Datos

#### Supabase PostgreSQL
- **Tablas principales**: 13 tablas (equipos, jugadores, partidos, eventos, posiciones, etc.)
- **Vistas**: 3 vistas optimizadas (goleadores, posiciones, partidos completos)
- **Funciones**: 3 funciones PL/pgSQL (actualizar posiciones, verificar suspensiones)
- **Triggers**: 2 triggers (actualizar estadísticas, eventos)
- **RLS**: Row Level Security para seguridad multi-tenant
- **Índices**: 15+ índices para optimización de consultas



---

## 4. Flujo de Datos en Tiempo Real

### 4.1 Registro de Evento (Gol)

```
┌──────────────┐
│  Planillero  │ 1. Presiona botón "GOL"
│   (Tablet)   │
└──────┬───────┘
       │
       │ 2. POST /partidos/{id}/eventos
       │    { minuto, tipo: "gol", jugadorId, equipoId }
       ↓
┌──────────────────────────────────────────────────────┐
│              .NET API Backend                        │
│                                                      │
│  3. Validaciones:                                    │
│     - Usuario es planillero asignado                │
│     - Partido está en estado "en_curso"             │
│     - Jugador pertenece al equipo                   │
│                                                      │
│  4. Guardar en Supabase DB                          │
│     - INSERT INTO eventos_partido                   │
│     - Trigger actualiza estadisticas_jugador        │
│     - Trigger actualiza marcador en partidos        │
│                                                      │
│  5. SignalR Hub Broadcast                           │
│     - BroadcastEvento(partidoId, evento)            │
│     - BroadcastMarcador(partidoId, goles)           │
│                                                      │
│  6. FCM Push Notification                           │
│     - Consultar suscriptores                        │
│     - Filtrar por preferencias                      │
│     - Enviar notificación a dispositivos            │
└──────────────────────────────────────────────────────┘
       │
       ├─────────────────┬─────────────────┬──────────────────┐
       │                 │                 │                  │
       ↓                 ↓                 ↓                  ↓
┌─────────────┐   ┌─────────────┐   ┌──────────┐   ┌──────────────┐
│ Portal Web  │   │  Marcador   │   │  Apps    │   │  Planillero  │
│ (Usuarios)  │   │  Público    │   │  Móviles │   │  (Confirm.)  │
│             │   │  (Pantalla) │   │  (Push)  │   │              │
│ Actualiza   │   │ Actualiza   │   │ Recibe   │   │ Muestra      │
│ marcador    │   │ en tiempo   │   │ notif.   │   │ confirmación │
│ y timeline  │   │ real        │   │ "⚽ GOL!" │   │ visual       │
└─────────────┘   └─────────────┘   └──────────┘   └──────────────┘
```

### 4.2 Finalización de Partido

```
Planillero → Doble confirmación → PATCH /partidos/{id}/finalizar
                                           ↓
                                  Backend valida y actualiza
                                           ↓
                        ┌──────────────────┼──────────────────┐
                        ↓                  ↓                  ↓
              fn_actualizar_posiciones  fn_verificar_    SignalR
                                       suspensiones      Broadcast
                        ↓                  ↓                  ↓
                  Tabla posiciones    Crear suspens.    Clientes
                  actualizada         automáticas       notificados
                        ↓                  ↓                  ↓
                  Supabase Realtime   Notif. push      Portal Web
                  notifica cambios    a suscriptores   actualiza
```

---

## 5. Patrones de Diseño Implementados

### 5.1 Repository Pattern
- Abstracción de acceso a datos mediante Supabase Client
- Interfaces `ILigaService`, `IPartidosService`, etc.
- Facilita testing con mocks

### 5.2 Dependency Injection
- Configurado en `Program.cs`
- Servicios registrados como Scoped o Singleton
- Inyección de dependencias en controllers

### 5.3 Observer Pattern
- SignalR Hub implementa patrón Observer
- Clientes se suscriben a eventos de partidos
- Servidor notifica cambios a todos los observadores

### 5.4 Strategy Pattern
- `FixtureGeneratorService` usa diferentes estrategias de asignación
- Algoritmo Round-Robin configurable
- Seed para reproducibilidad

### 5.5 Command Pattern
- Eventos de partido como comandos
- `CreateEventoDto` encapsula datos del comando
- Procesamiento asíncrono de eventos

---

## 6. Seguridad

### 6.1 Autenticación

**Supabase Auth con JWT**:
- Tokens JWT firmados con secret
- Expiración configurable (default: 1 hora)
- Refresh tokens para renovación automática
- Roles almacenados en `user_metadata`

**Flujo de autenticación**:
```
1. Usuario envía credenciales a Supabase Auth
2. Supabase valida y retorna JWT + Refresh Token
3. Frontend almacena tokens en localStorage
4. Cada request incluye JWT en header Authorization
5. Backend valida JWT con middleware
6. Backend extrae rol del token para autorización
```

### 6.2 Autorización

**Políticas por rol**:
- **admin**: Acceso completo a todos los endpoints
- **planillero**: Solo puede modificar partidos asignados
- **arbitro**: Solo lectura de tarjetas y suspensiones
- **publico**: Solo lectura de datos públicos (sin auth)

**Implementación**:
```csharp
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> CreateTorneo(...)

[Authorize(Policy = "Planillero")]
public async Task<IActionResult> AddEvento(...)
```

### 6.3 Row Level Security (RLS)

**Políticas en Supabase**:
```sql
-- Solo admins pueden gestionar solicitudes
CREATE POLICY "admin_full_access_solicitudes" ON solicitudes
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Solo planillero asignado puede modificar partido
CREATE POLICY "planillero_asignado_update_partido" ON partidos
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin' OR
    planillero_id = auth.uid()
  );

-- Lectura pública para datos de partidos
CREATE POLICY "public_read_partidos" ON partidos
  FOR SELECT USING (true);
```

### 6.4 Validación de Datos

**Backend**:
- Validación de DTOs con Data Annotations
- Validación de negocio en servicios
- Sanitización de inputs

**Frontend**:
- Validación de formularios con Reactive Forms
- Validación en tiempo real con Signals
- Mensajes de error descriptivos

### 6.5 Protección CSRF

- SignalR usa tokens anti-CSRF automáticamente
- CORS configurado para dominios específicos
- SameSite cookies para protección adicional

---

## 7. Escalabilidad

### 7.1 Horizontal Scaling

**Backend API**:
- Stateless design permite múltiples instancias
- Load balancer distribuye tráfico
- SignalR con Redis backplane para múltiples servidores

**Base de Datos**:
- Supabase maneja replicación automática
- Read replicas para consultas pesadas
- Connection pooling con PgBouncer

### 7.2 Caching

**Estrategias implementadas**:
- Cache en memoria para tabla de posiciones (5 minutos)
- Cache de CDN para assets estáticos (1 año)
- Cache de navegador para imágenes de equipos
- Supabase Realtime para invalidación de cache

**Ejemplo**:
```csharp
private readonly IMemoryCache _cache;

public async Task<List<PosicionEquipo>> GetTablaPosicionesAsync(Guid torneoId)
{
    var cacheKey = $"posiciones_{torneoId}";
    
    if (_cache.TryGetValue(cacheKey, out List<PosicionEquipo> cached))
        return cached;
    
    var data = await _supabase.From<Posicion>()
        .Where(p => p.TorneoId == torneoId)
        .Get();
    
    _cache.Set(cacheKey, data, TimeSpan.FromMinutes(5));
    return data;
}
```

### 7.3 Optimización de Consultas

**Índices estratégicos**:
```sql
-- Índices en partidos
CREATE INDEX idx_partidos_fecha ON partidos(fecha_hora);
CREATE INDEX idx_partidos_torneo_jornada ON partidos(torneo_id, jornada);
CREATE INDEX idx_partidos_estado ON partidos(estado);

-- Índices en eventos
CREATE INDEX idx_eventos_partido_id ON eventos_partido(partido_id, minuto);

-- Índices en estadísticas
CREATE INDEX idx_estadisticas_goles ON estadisticas_jugador(torneo_id, goles DESC);
```

**Vistas materializadas** (futuro):
- Vista de goleadores actualizada cada 5 minutos
- Vista de tabla de posiciones con ranking

### 7.4 Límites de Rendimiento

**Capacidad actual**:
- 1000 usuarios concurrentes en SignalR
- 10 eventos por segundo
- 50 partidos en vivo simultáneos
- 10,000 notificaciones push en 10 segundos

**Monitoreo**:
- Application Insights para métricas
- Alertas automáticas si latencia > 2s
- Dashboard de métricas en tiempo real

---

## 8. Resiliencia y Manejo de Errores

### 8.1 Retry Policies

**Notificaciones Push**:
```csharp
public async Task EnviarNotificacionGolAsync(...)
{
    var retryPolicy = Policy
        .Handle<FirebaseMessagingException>()
        .WaitAndRetryAsync(3, retryAttempt => 
            TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
    
    await retryPolicy.ExecuteAsync(async () =>
    {
        await _fcm.SendMulticastAsync(message);
    });
}
```

**SignalR**:
- Reconexión automática con backoff exponencial
- Reenvío de eventos perdidos durante desconexión
- Heartbeat cada 30 segundos

### 8.2 Circuit Breaker

**Servicios externos**:
- Circuit breaker para FCM (abre después de 5 fallos)
- Fallback a cola de mensajes si FCM no disponible
- Reintentos automáticos cada 5 minutos

### 8.3 Graceful Degradation

**Modo degradado**:
- Si SignalR falla, polling cada 10 segundos
- Si FCM falla, notificaciones en app solamente
- Si Supabase Realtime falla, polling de base de datos

### 8.4 Logging y Monitoreo

**Niveles de log**:
- **Error**: Errores críticos que requieren atención inmediata
- **Warning**: Situaciones anormales pero manejables
- **Info**: Eventos importantes del sistema
- **Debug**: Información detallada para debugging

**Herramientas**:
- Application Insights para logs centralizados
- Sentry para tracking de errores
- Grafana para dashboards de métricas

---

## 9. Deployment

### 9.1 Arquitectura de Deployment

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                             │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ↓                       ↓
┌─────────────────┐    ┌─────────────────┐
│  Vercel CDN     │    │  Azure App      │
│  (Frontend)     │    │  Service        │
│                 │    │  (Backend)      │
│  - Angular App  │    │  - .NET API     │
│  - PWA          │    │  - SignalR Hub  │
│  - Static       │    │  - Auto-scale   │
│    Assets       │    │                 │
└─────────────────┘    └────────┬────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ↓                       ↓
         ┌─────────────────┐    ┌─────────────────┐
         │  Supabase       │    │  Firebase       │
         │  (Database)     │    │  (FCM)          │
         │                 │    │                 │
         │  - PostgreSQL   │    │  - Push         │
         │  - Auth         │    │    Notifications│
         │  - Realtime     │    │                 │
         └─────────────────┘    └─────────────────┘
```

### 9.2 CI/CD Pipeline

**GitHub Actions**:
```yaml
# Frontend
on: push to main
  → Build Angular (ng build --prod)
  → Run tests (ng test)
  → Deploy to Vercel
  → Invalidate CDN cache

# Backend
on: push to main
  → Build .NET (dotnet build -c Release)
  → Run tests (dotnet test)
  → Build Docker image
  → Push to Azure Container Registry
  → Deploy to Azure App Service
  → Run smoke tests
```

### 9.3 Ambientes

| Ambiente | URL | Propósito |
|----------|-----|-----------|
| Development | localhost:4200 / localhost:5000 | Desarrollo local |
| Staging | staging.sportzone.app | Testing pre-producción |
| Production | sportzone.app | Producción |

### 9.4 Rollback Strategy

- Deployment con blue-green strategy
- Rollback automático si health check falla
- Backup de base de datos antes de cada deployment
- Feature flags para desactivar funcionalidades problemáticas

---

## 10. Tecnologías y Herramientas

### 10.1 Frontend

| Herramienta | Propósito |
|-------------|-----------|
| Angular 17 | Framework principal |
| TypeScript | Lenguaje de programación |
| Signals | Gestión de estado reactivo |
| SignalR Client | Cliente WebSocket |
| Supabase JS | Cliente de base de datos |
| SCSS | Estilos |
| Bebas Neue / Barlow | Tipografías |

### 10.2 Backend

| Herramienta | Propósito |
|-------------|-----------|
| .NET 8 | Framework principal |
| C# 12 | Lenguaje de programación |
| SignalR | WebSocket server |
| Supabase Client | Cliente de base de datos |
| FirebaseAdmin | Notificaciones push |
| Polly | Retry policies |
| Serilog | Logging |

### 10.3 Base de Datos

| Herramienta | Propósito |
|-------------|-----------|
| PostgreSQL 15 | Base de datos relacional |
| Supabase | Platform as a Service |
| PgBouncer | Connection pooling |
| pg_stat_statements | Análisis de queries |

### 10.4 DevOps

| Herramienta | Propósito |
|-------------|-----------|
| Docker | Containerización |
| GitHub Actions | CI/CD |
| Azure App Service | Hosting backend |
| Vercel | Hosting frontend |
| Application Insights | Monitoreo |
| Sentry | Error tracking |

---

## 11. Consideraciones Futuras

### 11.1 Mejoras Planificadas

- **Microservicios**: Separar notificaciones en servicio independiente
- **GraphQL**: API GraphQL para consultas más flexibles
- **Machine Learning**: Predicción de resultados y estadísticas
- **Streaming de video**: Integración con streaming en vivo
- **Chatbot**: Asistente virtual para consultas

### 11.2 Escalabilidad Futura

- **Kubernetes**: Orquestación de contenedores para auto-scaling
- **Redis**: Cache distribuido y session storage
- **RabbitMQ**: Message queue para procesamiento asíncrono
- **Elasticsearch**: Búsqueda avanzada de partidos y jugadores
- **CDN Global**: Distribución global de contenido

### 11.3 Nuevas Funcionalidades

- **Apuestas deportivas**: Integración con plataformas de apuestas
- **Fantasy league**: Liga de fantasía para usuarios
- **Marketplace**: Tienda de merchandising
- **Social features**: Red social para aficionados
- **Analytics avanzado**: Dashboard de analytics para equipos

---

## 12. Conclusión

SportZone Pro implementa una arquitectura moderna, escalable y resiliente que permite:

✅ **Tiempo real**: Actualizaciones instantáneas vía SignalR  
✅ **Escalabilidad**: Diseño stateless con horizontal scaling  
✅ **Seguridad**: Autenticación JWT + RLS + validaciones  
✅ **Resiliencia**: Retry policies + circuit breakers + graceful degradation  
✅ **Mantenibilidad**: Clean architecture + dependency injection + testing  
✅ **Performance**: Caching + índices + optimización de queries  

El sistema está preparado para manejar alta carga durante eventos deportivos importantes y puede escalar horizontalmente según demanda.
