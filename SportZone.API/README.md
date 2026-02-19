# SportZone Pro - Backend API (.NET 8)

API REST para el sistema de gestión de campeonatos deportivos SportZone Pro.

## Stack Tecnológico

- .NET 8 Web API
- Supabase PostgreSQL
- SignalR (WebSocket)
- JWT Authentication
- Firebase Cloud Messaging (FCM)

## Requisitos Previos

- .NET 8 SDK instalado
- Proyecto Supabase configurado (Fase 1 completada)
- Visual Studio 2022 o VS Code

## Configuración Inicial

### 1. Restaurar paquetes NuGet

```bash
cd SportZone.API
dotnet restore
```

### 2. Configurar credenciales de Supabase

Edita `appsettings.Development.json` y reemplaza con tus credenciales:

```json
{
  "Supabase": {
    "Url": "https://tu-proyecto.supabase.co",
    "AnonKey": "tu-anon-key-aqui",
    "ServiceRoleKey": "tu-service-role-key-aqui",
    "JwtSecret": "tu-jwt-secret-aqui"
  }
}
```

**Obtener credenciales:**
1. Ve a tu proyecto en Supabase
2. Settings → API
3. Copia:
   - Project URL
   - anon public (AnonKey)
   - service_role (ServiceRoleKey)
   - JWT Secret

### 3. Ejecutar el proyecto

```bash
dotnet run
```

La API estará disponible en:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger: `https://localhost:5001/swagger`

## Estructura del Proyecto

```
SportZone.API/
├── Controllers/          # Endpoints REST
│   ├── LigaController.cs
│   ├── PartidosController.cs
│   └── GoleadoresController.cs
├── Hubs/                 # SignalR Hubs
│   └── PartidoHub.cs
├── Models/
│   ├── Entities/         # Modelos de base de datos
│   └── DTOs/             # Data Transfer Objects
├── Services/             # Lógica de negocio (TODO)
├── Program.cs            # Configuración de la aplicación
└── appsettings.json      # Configuración

```

## Endpoints Disponibles

### Liga
- `GET /api/liga/posiciones/{torneoId}` - Tabla de posiciones
- `GET /api/liga/torneos` - Torneos activos
- `GET /api/liga/{torneoId}/jornada/{numero}` - Resultados de jornada

### Partidos
- `GET /api/partidos/proximos` - Próximos partidos
- `GET /api/partidos/{id}` - Detalle de partido
- `GET /api/partidos/en-vivo` - Partidos en vivo
- `PATCH /api/partidos/{id}/iniciar` - Iniciar partido (Auth)
- `POST /api/partidos/{id}/eventos` - Registrar evento (Auth)
- `PATCH /api/partidos/{id}/finalizar` - Finalizar partido (Auth)

### Goleadores
- `GET /api/goleadores/{torneoId}` - Ranking de goleadores
- `GET /api/goleadores/{torneoId}/asistencias` - Ranking de asistidores
- `GET /api/goleadores/{torneoId}/tarjetas` - Ranking de tarjetas

### Fixture
- `POST /api/fixture/generar` - Generar fixture automático (Admin)
- `GET /api/fixture/validar-conflictos` - Validar conflictos de horario (Admin)

### Suspensiones
- `GET /api/suspensiones/torneo/{torneoId}` - Suspensiones activas
- `GET /api/suspensiones/validar-habilitacion` - Validar si jugador puede jugar
- `POST /api/suspensiones/verificar/{partidoId}` - Verificar suspensiones (Planillero)
- `POST /api/suspensiones/descontar` - Descontar suspensión (Planillero)

### Notificaciones
- `POST /api/notificaciones/registrar-token` - Registrar token FCM
- `DELETE /api/notificaciones/eliminar-token` - Eliminar token FCM
- `POST /api/notificaciones/test` - Enviar notificación de prueba (Admin)

### Solicitudes
- `GET /api/solicitudes` - Listar solicitudes (Admin)
- `GET /api/solicitudes/{id}` - Obtener solicitud (Admin)
- `POST /api/solicitudes` - Crear solicitud (Admin)
- `PUT /api/solicitudes/{id}` - Actualizar solicitud (Admin)
- `PATCH /api/solicitudes/{id}/estado` - Cambiar estado (Admin)
- `DELETE /api/solicitudes/{id}` - Eliminar solicitud (Admin)

### Resoluciones
- `GET /api/resoluciones` - Listar resoluciones (Admin)
- `GET /api/resoluciones/{id}` - Obtener resolución (Admin)
- `POST /api/resoluciones` - Crear resolución (Admin)
- `POST /api/resoluciones/{id}/aplicar` - Aplicar resolución (Admin)
- `POST /api/resoluciones/{id}/anular` - Anular resolución (Admin)
- `DELETE /api/resoluciones/{id}` - Eliminar resolución (Admin)

## SignalR Hub

**Endpoint:** `/hubs/partido`

**Métodos del cliente:**
- `SuscribirPartido(partidoId)` - Suscribirse a un partido
- `DesuscribirPartido(partidoId)` - Desuscribirse de un partido

**Eventos del servidor:**
- `NuevoEvento` - Nuevo evento en el partido
- `MinutoActualizado` - Minuto actual del partido
- `MarcadorActualizado` - Marcador actualizado

## Autenticación

La API usa JWT tokens de Supabase. Para endpoints protegidos, incluye el header:

```
Authorization: Bearer {token}
```

**Roles disponibles:**
- `admin` - Acceso total
- `planillero` - Registro de eventos
- `arbitro` - Solo lectura

## Próximos Pasos

1. ✅ Estructura básica creada
2. ⏳ Implementar servicios de negocio
3. ⏳ Conectar con Supabase
4. ⏳ Implementar lógica de controllers
5. ⏳ Configurar Firebase Cloud Messaging
6. ⏳ Implementar tests

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@sportzone.com | 123456 | admin |
| planillero@sportzone.com | 123456 | planillero |
| arbitro@sportzone.com | 123456 | arbitro |

## Documentación

- [Swagger UI](https://localhost:5001/swagger) - Documentación interactiva de la API
- [Guía de Supabase](../docs/SUPABASE_SETUP.md) - Configuración de base de datos
- [Fixture Generator](../docs/FIXTURE_GENERATOR.md) - Generador automático de fixture
- [Suspension Manager](../docs/SUSPENSION_MANAGER.md) - Sistema de suspensiones automáticas
- [Notification Service](../docs/NOTIFICATION_SERVICE.md) - Notificaciones push con Firebase
- [Especificación completa](../.kiro/specs/live-match-notifications/) - Requerimientos y diseño

## Soporte

Para problemas o preguntas, revisa la documentación en `/docs/` o consulta el archivo de tareas en `.kiro/specs/live-match-notifications/tasks.md`.
