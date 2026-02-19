# Documentación de API - SportZone Pro

## Información General

**Base URL:** `https://api.sportzone.app`  
**Versión:** 1.0.0  
**Autenticación:** JWT Bearer Token

## Autenticación

Todos los endpoints protegidos requieren un token JWT en el header:

```http
Authorization: Bearer <token>
```

### Obtener Token

Los tokens se obtienen a través de Supabase Auth:

```typescript
const { data } = await supabase.auth.signInWithPassword({
  email: 'usuario@example.com',
  password: 'contraseña'
});
const token = data.session.access_token;
```

### Roles de Usuario

- **admin**: Acceso completo a todas las funcionalidades
- **planillero**: Puede registrar eventos de partidos asignados
- **arbitro**: Solo lectura de tarjetas y suspensiones
- **publico**: Solo lectura de datos públicos (sin autenticación)

---

## Endpoints

### Liga

#### GET /api/liga/posiciones/{torneoId}

Obtiene la tabla de posiciones de un torneo.

**Parámetros:**
- `torneoId` (path, required): UUID del torneo

**Respuesta 200:**
```json
[
  {
    "posicion": 1,
    "equipoId": "uuid",
    "equipoNombre": "Equipo A",
    "abreviatura": "EQA",
    "escudoUrl": "https://...",
    "pj": 10,
    "pg": 7,
    "pe": 2,
    "pp": 1,
    "gf": 25,
    "gc": 10,
    "puntos": 23,
    "diferencia": 15
  }
]
```

**Ejemplo:**
```bash
curl -X GET "https://api.sportzone.app/api/liga/posiciones/123e4567-e89b-12d3-a456-426614174000"
```

---

#### GET /api/liga/torneos

Obtiene la lista de torneos activos.

**Respuesta 200:**
```json
[
  {
    "id": "uuid",
    "nombre": "Liga Pro 2025",
    "tipo": "liga",
    "temporadaId": "uuid",
    "totalJornadas": 30,
    "activo": true
  }
]
```

---

#### GET /api/liga/{torneoId}/jornada/{numero}

Obtiene los partidos de una jornada específica.

**Parámetros:**
- `torneoId` (path, required): UUID del torneo
- `numero` (path, required): Número de jornada

**Respuesta 200:**
```json
[
  {
    "id": "uuid",
    "equipoLocal": {
      "id": "uuid",
      "nombre": "Equipo A",
      "escudo": "https://..."
    },
    "equipoVisita": {
      "id": "uuid",
      "nombre": "Equipo B",
      "escudo": "https://..."
    },
    "fechaHora": "2025-03-15T18:00:00Z",
    "estadio": "Estadio Nacional",
    "golesLocal": 2,
    "golesVisita": 1,
    "estado": "finalizado"
  }
]
```

---

#### POST /api/liga/torneos

Crea un nuevo torneo. **Requiere rol: admin**

**Body:**
```json
{
  "nombre": "Liga Pro 2025",
  "tipo": "liga",
  "temporadaId": "uuid",
  "totalJornadas": 30
}
```

**Respuesta 201:**
```json
{
  "id": "uuid",
  "nombre": "Liga Pro 2025",
  "tipo": "liga",
  "temporadaId": "uuid",
  "totalJornadas": 30,
  "activo": true,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

### Partidos

#### GET /api/partidos/proximos

Obtiene los próximos partidos.

**Query Parameters:**
- `dias` (optional, default: 14): Número de días hacia adelante
- `torneoId` (optional): Filtrar por torneo específico

**Respuesta 200:**
```json
[
  {
    "id": "uuid",
    "torneoId": "uuid",
    "jornada": 15,
    "equipoLocal": {
      "id": "uuid",
      "nombre": "Equipo A",
      "escudo": "https://..."
    },
    "equipoVisita": {
      "id": "uuid",
      "nombre": "Equipo B",
      "escudo": "https://..."
    },
    "fechaHora": "2025-03-20T16:00:00Z",
    "estadio": "Estadio Municipal",
    "estado": "programado"
  }
]
```

**Ejemplo:**
```bash
curl -X GET "https://api.sportzone.app/api/partidos/proximos?dias=7&torneoId=uuid"
```

---

#### GET /api/partidos/{id}

Obtiene los detalles de un partido específico.

**Parámetros:**
- `id` (path, required): UUID del partido

**Respuesta 200:**
```json
{
  "id": "uuid",
  "torneoId": "uuid",
  "jornada": 15,
  "equipoLocal": {
    "id": "uuid",
    "nombre": "Equipo A",
    "escudo": "https://...",
    "colorPrimario": "#FF0000"
  },
  "equipoVisita": {
    "id": "uuid",
    "nombre": "Equipo B",
    "escudo": "https://...",
    "colorPrimario": "#0000FF"
  },
  "fechaHora": "2025-03-20T16:00:00Z",
  "estadio": "Estadio Municipal",
  "golesLocal": 2,
  "golesVisita": 1,
  "estado": "en_curso",
  "minutoActual": 67,
  "eventos": [
    {
      "id": "uuid",
      "minuto": 23,
      "tipo": "gol",
      "jugador": {
        "id": "uuid",
        "nombre": "Juan Pérez",
        "numeroCamiseta": 10
      },
      "equipo": {
        "id": "uuid",
        "nombre": "Equipo A"
      },
      "descripcion": "Gol de tiro libre"
    }
  ]
}
```

---

#### GET /api/partidos/en-vivo

Obtiene los partidos actualmente en curso.

**Respuesta 200:**
```json
[
  {
    "id": "uuid",
    "equipoLocal": {
      "nombre": "Equipo A",
      "escudo": "https://..."
    },
    "equipoVisita": {
      "nombre": "Equipo B",
      "escudo": "https://..."
    },
    "golesLocal": 2,
    "golesVisita": 1,
    "minutoActual": 67,
    "estado": "en_curso"
  }
]
```

---

#### POST /api/partidos

Crea un nuevo partido. **Requiere rol: admin**

**Body:**
```json
{
  "torneoId": "uuid",
  "jornada": 15,
  "equipoLocalId": "uuid",
  "equipoVisitaId": "uuid",
  "fechaHora": "2025-03-20T16:00:00Z",
  "estadio": "Estadio Municipal",
  "planilleroId": "uuid"
}
```

**Respuesta 201:**
```json
{
  "id": "uuid",
  "torneoId": "uuid",
  "jornada": 15,
  "equipoLocalId": "uuid",
  "equipoVisitaId": "uuid",
  "fechaHora": "2025-03-20T16:00:00Z",
  "estadio": "Estadio Municipal",
  "estado": "programado",
  "planilleroId": "uuid",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

#### PATCH /api/partidos/{id}/iniciar

Inicia un partido. **Requiere rol: admin o planillero asignado**

**Parámetros:**
- `id` (path, required): UUID del partido

**Respuesta 200:**
```json
{
  "id": "uuid",
  "estado": "en_curso",
  "minutoActual": 0
}
```

**Errores:**
- `403 Forbidden`: Usuario no es el planillero asignado
- `400 Bad Request`: Partido ya está iniciado o finalizado

---

#### POST /api/partidos/{id}/eventos

Registra un evento en el partido. **Requiere rol: admin o planillero asignado**

**Parámetros:**
- `id` (path, required): UUID del partido

**Body:**
```json
{
  "minuto": 23,
  "tipo": "gol",
  "jugadorId": "uuid",
  "asistenteId": "uuid",
  "equipoId": "uuid",
  "descripcion": "Gol de tiro libre"
}
```

**Tipos de evento válidos:**
- `gol`
- `tarjeta_amarilla`
- `tarjeta_roja`
- `sustitucion`
- `penal`
- `autogol`

**Respuesta 201:**
```json
{
  "id": "uuid",
  "partidoId": "uuid",
  "minuto": 23,
  "tipo": "gol",
  "jugador": {
    "id": "uuid",
    "nombre": "Juan Pérez"
  },
  "asistente": {
    "id": "uuid",
    "nombre": "Pedro López"
  },
  "equipo": {
    "id": "uuid",
    "nombre": "Equipo A"
  },
  "descripcion": "Gol de tiro libre",
  "createdAt": "2025-03-20T16:23:00Z"
}
```

**Errores:**
- `403 Forbidden`: Usuario no es el planillero asignado
- `400 Bad Request`: Partido no está en curso
- `404 Not Found`: Jugador no encontrado o no pertenece al equipo

---

#### PATCH /api/partidos/{id}/finalizar

Finaliza un partido. **Requiere rol: admin o planillero asignado**

**Parámetros:**
- `id` (path, required): UUID del partido

**Respuesta 200:**
```json
{
  "id": "uuid",
  "estado": "finalizado",
  "golesLocal": 2,
  "golesVisita": 1,
  "finalizadoEn": "2025-03-20T18:00:00Z"
}
```

**Efectos secundarios:**
- Actualiza la tabla de posiciones automáticamente
- Verifica y crea suspensiones automáticas por tarjetas
- Envía notificaciones push a suscriptores

**Errores:**
- `403 Forbidden`: Usuario no es el planillero asignado
- `400 Bad Request`: Partido no está en curso

---

#### POST /api/partidos/generar-fixture

Genera automáticamente el fixture de un torneo. **Requiere rol: admin**

**Body:**
```json
{
  "torneoId": "uuid",
  "equipoIds": ["uuid1", "uuid2", "uuid3", "uuid4"],
  "fechaInicio": "2025-03-01",
  "horariosDisponibles": ["14:00:00", "16:00:00", "18:00:00", "20:00:00"],
  "diasMinimosEntrePartidos": 3,
  "seed": 12345
}
```

**Parámetros:**
- `torneoId`: UUID del torneo
- `equipoIds`: Array de UUIDs de equipos (debe ser número par)
- `fechaInicio`: Fecha de inicio del fixture
- `horariosDisponibles`: Array de horarios disponibles para partidos
- `diasMinimosEntrePartidos`: Días mínimos entre partidos del mismo equipo (default: 3)
- `seed`: Semilla para reproducibilidad de asignación aleatoria (optional)

**Respuesta 201:**
```json
{
  "partidosCreados": 30,
  "jornadas": 10,
  "partidos": [
    {
      "id": "uuid",
      "jornada": 1,
      "equipoLocalId": "uuid1",
      "equipoVisitaId": "uuid2",
      "fechaHora": "2025-03-01T16:00:00Z"
    }
  ]
}
```

**Algoritmo:**
- Usa Round-Robin para garantizar que todos los equipos se enfrenten
- Asigna horarios aleatoriamente entre los disponibles
- Valida que ningún equipo juegue dos veces el mismo día
- Respeta el mínimo de días entre partidos del mismo equipo

**Errores:**
- `400 Bad Request`: Número de equipos impar o conflictos de horarios

---

### Goleadores

#### GET /api/goleadores/{torneoId}

Obtiene el ranking de goleadores de un torneo.

**Parámetros:**
- `torneoId` (path, required): UUID del torneo

**Query Parameters:**
- `top` (optional, default: 20): Número de jugadores a retornar
- `equipoId` (optional): Filtrar por equipo específico

**Respuesta 200:**
```json
[
  {
    "posicion": 1,
    "jugador": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "numeroCamiseta": 10,
      "posicion": "Delantero",
      "fotoUrl": "https://..."
    },
    "equipo": {
      "id": "uuid",
      "nombre": "Equipo A",
      "escudoUrl": "https://..."
    },
    "goles": 15,
    "asistencias": 8,
    "partidosJugados": 10
  }
]
```

---

#### GET /api/goleadores/{torneoId}/asistencias

Obtiene el ranking de asistidores de un torneo.

**Parámetros:**
- `torneoId` (path, required): UUID del torneo

**Query Parameters:**
- `top` (optional, default: 20): Número de jugadores a retornar

**Respuesta 200:**
```json
[
  {
    "posicion": 1,
    "jugador": {
      "id": "uuid",
      "nombre": "Pedro López",
      "numeroCamiseta": 8
    },
    "equipo": {
      "nombre": "Equipo B"
    },
    "asistencias": 12,
    "goles": 5
  }
]
```

---

#### GET /api/goleadores/{torneoId}/tarjetas

Obtiene el ranking de tarjetas de un torneo.

**Parámetros:**
- `torneoId` (path, required): UUID del torneo

**Query Parameters:**
- `tipo` (optional, default: "amarillas"): Tipo de tarjetas ("amarillas" o "rojas")

**Respuesta 200:**
```json
[
  {
    "posicion": 1,
    "jugador": {
      "id": "uuid",
      "nombre": "Carlos Ruiz"
    },
    "equipo": {
      "nombre": "Equipo C"
    },
    "tarjetasAmarillas": 8,
    "tarjetasRojas": 1,
    "suspensionesActivas": 0
  }
]
```

---

### Solicitudes

#### GET /api/solicitudes

Obtiene la lista de solicitudes. **Requiere rol: admin**

**Query Parameters:**
- `estado` (optional): Filtrar por estado (pendiente, en_revision, aprobado, rechazado, cancelado)
- `tipo` (optional): Filtrar por tipo (marketing, traspaso, patrocinio, medios, disciplina, administrativa, tecnica)
- `page` (optional, default: 1): Número de página
- `pageSize` (optional, default: 20): Tamaños de página

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tipo": "marketing",
      "titulo": "Campaña Redes Sociales",
      "descripcion": "Campaña para aumentar seguidores",
      "solicitante": "Juan Pérez",
      "equipoId": "uuid",
      "monto": 5000.00,
      "estado": "pendiente",
      "prioridad": "alta",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

---

#### GET /api/solicitudes/{id}

Obtiene los detalles de una solicitud. **Requiere rol: admin**

**Parámetros:**
- `id` (path, required): UUID de la solicitud

**Respuesta 200:**
```json
{
  "id": "uuid",
  "tipo": "marketing",
  "titulo": "Campaña Redes Sociales",
  "descripcion": "Campaña para aumentar seguidores en Instagram y Facebook",
  "solicitante": "Juan Pérez",
  "equipo": {
    "id": "uuid",
    "nombre": "Equipo A"
  },
  "monto": 5000.00,
  "estado": "pendiente",
  "prioridad": "alta",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

---

#### POST /api/solicitudes

Crea una nueva solicitud. **Requiere autenticación**

**Body:**
```json
{
  "tipo": "marketing",
  "titulo": "Campaña Redes Sociales",
  "descripcion": "Campaña para aumentar seguidores",
  "solicitante": "Juan Pérez",
  "equipoId": "uuid",
  "monto": 5000.00,
  "prioridad": "alta"
}
```

**Respuesta 201:**
```json
{
  "id": "uuid",
  "tipo": "marketing",
  "titulo": "Campaña Redes Sociales",
  "estado": "pendiente",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

#### PATCH /api/solicitudes/{id}/estado

Actualiza el estado de una solicitud. **Requiere rol: admin**

**Parámetros:**
- `id` (path, required): UUID de la solicitud

**Body:**
```json
{
  "estado": "aprobado",
  "comentario": "Aprobado por el comité"
}
```

**Respuesta 200:**
```json
{
  "id": "uuid",
  "estado": "aprobado",
  "updatedAt": "2025-01-16T14:30:00Z"
}
```

---

### Resoluciones

#### GET /api/resoluciones

Obtiene la lista de resoluciones. **Requiere rol: admin**

**Query Parameters:**
- `tipo` (optional): Filtrar por tipo (disciplinaria, administrativa, tecnica)
- `estado` (optional): Filtrar por estado (borrador, emitida, apelada, resuelta, anulada)
- `page` (optional, default: 1): Número de página

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "numero": "RES-2025-001",
      "tipo": "disciplinaria",
      "asunto": "Suspensión por conducta antideportiva",
      "sancionTipo": "suspension",
      "sancionValor": 3,
      "estado": "emitida",
      "fechaEmision": "2025-01-15",
      "jugador": {
        "nombre": "Carlos Ruiz"
      },
      "equipo": {
        "nombre": "Equipo C"
      }
    }
  ],
  "total": 12,
  "page": 1,
  "totalPages": 1
}
```

---

#### GET /api/resoluciones/{id}

Obtiene los detalles de una resolución. **Requiere rol: admin**

**Parámetros:**
- `id` (path, required): UUID de la resolución

**Respuesta 200:**
```json
{
  "id": "uuid",
  "numero": "RES-2025-001",
  "tipo": "disciplinaria",
  "asunto": "Suspensión por conducta antideportiva",
  "motivo": "Agresión a jugador rival en el minuto 78",
  "sancionTipo": "suspension",
  "sancionValor": 3,
  "estado": "emitida",
  "fechaEmision": "2025-01-15",
  "solicitudId": "uuid",
  "jugador": {
    "id": "uuid",
    "nombre": "Carlos Ruiz"
  },
  "equipo": {
    "id": "uuid",
    "nombre": "Equipo C"
  },
  "partido": null,
  "createdAt": "2025-01-14T10:00:00Z"
}
```

---

#### POST /api/resoluciones

Crea una nueva resolución. **Requiere rol: admin**

**Body:**
```json
{
  "tipo": "disciplinaria",
  "asunto": "Suspensión por conducta antideportiva",
  "motivo": "Agresión a jugador rival",
  "sancionTipo": "suspension",
  "sancionValor": 3,
  "jugadorId": "uuid",
  "equipoId": "uuid",
  "solicitudId": "uuid"
}
```

**Tipos de sanción válidos:**
- `suspension`: Suspensión de partidos (sancionValor = número de partidos)
- `descuento_puntos`: Descuento de puntos en tabla (sancionValor = número de puntos)
- `multa`: Multa económica (sancionValor = monto en moneda local)
- `wo_tecnico`: W.O. técnico 3-0 (requiere partidoId)
- `amonestacion`: Amonestación sin efecto automático

**Respuesta 201:**
```json
{
  "id": "uuid",
  "numero": "RES-2025-002",
  "tipo": "disciplinaria",
  "estado": "borrador",
  "createdAt": "2025-01-16T10:00:00Z"
}
```

---

#### PATCH /api/resoluciones/{id}/estado

Cambia el estado de una resolución. **Requiere rol: admin**

**Parámetros:**
- `id` (path, required): UUID de la resolución

**Body:**
```json
{
  "estado": "emitida",
  "fechaEmision": "2025-01-16"
}
```

**Estados válidos:**
- `borrador`: Resolución en borrador
- `emitida`: Resolución emitida (aplica sanción automáticamente)
- `apelada`: Resolución apelada
- `resuelta`: Apelación resuelta
- `anulada`: Resolución anulada (revierte sanción)

**Respuesta 200:**
```json
{
  "id": "uuid",
  "estado": "emitida",
  "fechaEmision": "2025-01-16",
  "updatedAt": "2025-01-16T14:00:00Z"
}
```

---

#### PATCH /api/resoluciones/{id}/aplicar

Aplica manualmente una resolución. **Requiere rol: admin**

**Parámetros:**
- `id` (path, required): UUID de la resolución

**Respuesta 200:**
```json
{
  "id": "uuid",
  "estado": "emitida",
  "aplicada": true,
  "efectos": {
    "suspensionCreada": "uuid",
    "puntosDescontados": 3,
    "partidoModificado": "uuid"
  }
}
```

**Efectos según tipo de sanción:**
- **suspension**: Crea registro en tabla `suspensiones`
- **descuento_puntos**: Actualiza puntos en tabla `posiciones`
- **wo_tecnico**: Modifica resultado del partido a 3-0 y actualiza posiciones
- **multa**: Registra multa en sistema financiero
- **amonestacion**: Solo registro, sin efecto automático

---

## SignalR Hub

### Conexión

**URL:** `wss://api.sportzone.app/hubs/partidos`

**Autenticación:**
```typescript
const connection = new signalR.HubConnectionBuilder()
  .withUrl('wss://api.sportzone.app/hubs/partidos', {
    accessTokenFactory: () => localStorage.getItem('token')
  })
  .withAutomaticReconnect()
  .build();

await connection.start();
```

### Métodos del Cliente

#### SuscribirPartido

Suscribe al cliente a las actualizaciones de un partido específico.

```typescript
await connection.invoke('SuscribirPartido', partidoId);
```

#### DesuscribirPartido

Desuscribe al cliente de un partido.

```typescript
await connection.invoke('DesuscribirPartido', partidoId);
```

### Eventos del Servidor

#### EventoRegistrado

Se emite cuando se registra un nuevo evento en el partido.

```typescript
connection.on('EventoRegistrado', (evento) => {
  console.log('Nuevo evento:', evento);
  // evento = { minuto, tipo, jugador, equipo, descripcion }
});
```

#### MinutoActualizado

Se emite cuando se actualiza el minuto del partido.

```typescript
connection.on('MinutoActualizado', (minuto) => {
  console.log('Minuto actual:', minuto);
});
```

#### MarcadorActualizado

Se emite cuando cambia el marcador del partido.

```typescript
connection.on('MarcadorActualizado', (data) => {
  console.log('Marcador:', data);
  // data = { golesLocal, golesVisita }
});
```

#### SuscripcionConfirmada

Se emite cuando la suscripción a un partido es exitosa.

```typescript
connection.on('SuscripcionConfirmada', (partidoId) => {
  console.log('Suscrito al partido:', partidoId);
});
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos o falta información requerida |
| 401 | Unauthorized - Token JWT faltante o inválido |
| 403 | Forbidden - Usuario no tiene permisos para esta operación |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto con el estado actual (ej: partido ya iniciado) |
| 500 | Internal Server Error - Error interno del servidor |

### Formato de Error

```json
{
  "error": "Descripción del error",
  "code": "ERROR_CODE",
  "details": {
    "field": "Detalle específico del campo"
  }
}
```

---

## Rate Limiting

- **Límite general**: 100 requests por minuto por IP
- **Endpoints de escritura**: 30 requests por minuto por usuario
- **SignalR**: Sin límite de conexiones, pero máximo 50 suscripciones simultáneas por cliente

**Headers de respuesta:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

---

## Versionado

La API usa versionado en la URL. La versión actual es `v1`.

Futuras versiones se accederán mediante:
```
https://api.sportzone.app/v2/liga/posiciones/{torneoId}
```

---

## Webhooks (Futuro)

En futuras versiones se soportarán webhooks para eventos importantes:
- Partido iniciado
- Gol registrado
- Partido finalizado
- Resolución emitida

---

## Soporte

Para soporte técnico o reportar problemas:
- Email: api-support@sportzone.app
- Documentación: https://docs.sportzone.app
- Status: https://status.sportzone.app
