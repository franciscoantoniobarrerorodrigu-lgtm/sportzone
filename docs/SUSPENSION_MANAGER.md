# Sistema de Suspensiones Automáticas - SportZone Pro

## Descripción

El Suspension Manager es un servicio que gestiona automáticamente las suspensiones de jugadores según las reglas disciplinarias del torneo. Se ejecuta automáticamente al finalizar cada partido.

## Reglas de Suspensión

### Tarjeta Roja Directa
- **Sanción**: 2 partidos de suspensión
- **Activación**: Inmediata al finalizar el partido
- **Motivo**: "Tarjeta roja directa"

### Acumulación de Tarjetas Amarillas
- **Regla**: 3 tarjetas amarillas = 1 partido de suspensión
- **Activación**: Al alcanzar múltiplos de 3 (3, 6, 9, etc.)
- **Motivo**: "Acumulación de X tarjetas amarillas"
- **Reinicio**: Las amarillas se acumulan durante todo el torneo

## Funcionamiento Automático

### Flujo de Verificación

```
1. Planillero finaliza partido
   ↓
2. PartidosService.FinalizarPartidoAsync()
   ↓
3. SuspensionManager.VerificarSuspensionesAsync()
   ↓
4. Analiza eventos del partido (tarjetas)
   ↓
5. Crea suspensiones automáticas si aplica
   ↓
6. Notifica al sistema
```

### Ejemplo de Verificación

**Partido finalizado con eventos:**
- Jugador A: Tarjeta amarilla (minuto 15)
- Jugador B: Tarjeta roja (minuto 45)
- Jugador C: Tarjeta amarilla (minuto 60) - **3ra amarilla en el torneo**

**Resultado:**
- Jugador A: Sin suspensión (solo 1 amarilla)
- Jugador B: **Suspendido 2 partidos** (roja directa)
- Jugador C: **Suspendido 1 partido** (acumulación de 3 amarillas)

## Endpoints API

### GET /api/suspensiones/torneo/{torneoId}

Obtiene todas las suspensiones activas de un torneo.

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "jugadorId": "...",
      "jugadorNombre": "Juan Pérez",
      "equipoId": "...",
      "equipoNombre": "Equipo A",
      "motivo": "Tarjeta roja directa",
      "partidosSuspendidos": 2,
      "partidosCumplidos": 0,
      "activa": true,
      "fechaInicio": "2024-03-01T15:00:00Z",
      "fechaFin": null
    }
  ],
  "total": 1
}
```

### GET /api/suspensiones/validar-habilitacion

Verifica si un jugador está habilitado para jugar un partido.

**Query Parameters**:
- `jugadorId` (GUID): ID del jugador
- `partidoId` (GUID): ID del partido

**Response**:

```json
{
  "success": true,
  "jugadorId": "...",
  "partidoId": "...",
  "habilitado": false,
  "message": "Jugador suspendido"
}
```

### POST /api/suspensiones/verificar/{partidoId}

Verifica y crea suspensiones automáticas después de un partido (uso interno).

**Autorización**: Requiere rol `planillero`

**Response**:

```json
{
  "success": true,
  "message": "Suspensiones verificadas y creadas exitosamente"
}
```

### POST /api/suspensiones/descontar

Descuenta un partido de suspensión cuando el equipo juega (uso interno).

**Autorización**: Requiere rol `planillero`

**Query Parameters**:
- `jugadorId` (GUID): ID del jugador
- `partidoId` (GUID): ID del partido

**Response**:

```json
{
  "success": true,
  "message": "Suspensión descontada exitosamente"
}
```

## Ejemplos de Uso

### Ejemplo 1: Consultar suspensiones activas

```bash
curl -X GET http://localhost:5000/api/suspensiones/torneo/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Ejemplo 2: Validar si un jugador puede jugar

```bash
curl -X GET "http://localhost:5000/api/suspensiones/validar-habilitacion?jugadorId=123e4567-e89b-12d3-a456-426614174000&partidoId=987e6543-e21b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Ejemplo 3: Verificar suspensiones manualmente (uso interno)

```bash
curl -X POST http://localhost:5000/api/suspensiones/verificar/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Casos de Uso

### Caso 1: Jugador recibe tarjeta roja

**Escenario**:
1. Planillero registra tarjeta roja a Jugador A en minuto 45
2. Planillero finaliza el partido
3. Sistema verifica eventos automáticamente
4. Sistema crea suspensión de 2 partidos para Jugador A

**Resultado**:
- Jugador A no puede jugar los próximos 2 partidos de su equipo
- La suspensión se descuenta automáticamente cuando su equipo juega

### Caso 2: Jugador acumula 3ra tarjeta amarilla

**Escenario**:
1. Jugador B tiene 2 amarillas previas en el torneo
2. Recibe 3ra amarilla en el partido actual
3. Planillero finaliza el partido
4. Sistema detecta acumulación de 3 amarillas
5. Sistema crea suspensión de 1 partido

**Resultado**:
- Jugador B no puede jugar el próximo partido de su equipo
- Después de cumplir 1 partido, la suspensión se desactiva
- Las amarillas siguen acumulándose (si llega a 6, otra suspensión)

### Caso 3: Validación antes de alineación

**Escenario**:
1. Planillero va a registrar alineación para nuevo partido
2. Sistema valida cada jugador con `ValidarJugadorHabilitadoAsync()`
3. Jugador C tiene suspensión activa
4. Sistema muestra alerta: "Jugador C está suspendido"

**Resultado**:
- Planillero no puede incluir a Jugador C en la alineación
- Debe seleccionar otro jugador

## Descuento Automático de Suspensiones

El sistema descuenta automáticamente las suspensiones cuando el equipo del jugador juega:

```csharp
// Al iniciar un partido
foreach (var jugador in alineacion)
{
    if (tieneSuspensionActiva(jugador))
    {
        await DescontarSuspensionAsync(jugador.Id, partido.Id);
    }
}
```

**Ejemplo**:
- Jugador D suspendido 2 partidos
- Equipo juega Partido 1: suspensión pasa a 1/2 cumplido
- Equipo juega Partido 2: suspensión pasa a 2/2 cumplido → **Desactivada**
- Jugador D puede jugar desde Partido 3

## Prevención de Duplicados

El sistema previene la creación de suspensiones duplicadas:

```csharp
// Antes de crear suspensión
var suspensionExistente = await GetSuspensionActivaAsync(jugadorId);
if (suspensionExistente != null)
{
    return; // No crear otra suspensión
}
```

## Integración con Base de Datos

### Tabla: suspensiones

```sql
CREATE TABLE suspensiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jugador_id UUID NOT NULL REFERENCES jugadores(id),
    equipo_id UUID NOT NULL REFERENCES equipos(id),
    motivo TEXT NOT NULL,
    partidos_suspendidos INT NOT NULL,
    partidos_cumplidos INT NOT NULL DEFAULT 0,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Índices Recomendados

```sql
CREATE INDEX idx_suspensiones_jugador ON suspensiones(jugador_id);
CREATE INDEX idx_suspensiones_activa ON suspensiones(activa);
CREATE INDEX idx_suspensiones_equipo ON suspensiones(equipo_id);
```

## Consideraciones de Rendimiento

- **Tiempo de ejecución**: ~50ms por partido (con 5-10 eventos)
- **Consultas a DB**: 2-3 por jugador con tarjetas
- **Optimización**: Usa índices en `jugador_id` y `activa`

## Errores Comunes

### Error: "Partido no encontrado"

**Causa**: El ID del partido no existe en la base de datos.

**Solución**: Verificar que el partido existe antes de llamar a `VerificarSuspensionesAsync()`.

### Error: Suspensión no se descuenta

**Causa**: No se está llamando a `DescontarSuspensionAsync()` cuando el equipo juega.

**Solución**: Integrar el descuento en el flujo de inicio de partido o registro de alineación.

## Próximas Mejoras

- [ ] Soporte para suspensiones manuales (resoluciones administrativas)
- [ ] Notificaciones push cuando un jugador es suspendido
- [ ] Dashboard de suspensiones para administradores
- [ ] Historial completo de suspensiones por jugador
- [ ] Exportación de reporte de disciplina
- [ ] Configuración de reglas por torneo (ej: 5 amarillas en vez de 3)

## Referencias

- [Reglamento FIFA - Tarjetas](https://www.fifa.com/technical/football-laws)
- [Sistema Disciplinario Deportivo](https://es.wikipedia.org/wiki/Tarjeta_amarilla_y_roja)
