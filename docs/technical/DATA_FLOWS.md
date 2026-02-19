# Flujos de Datos - SportZone Pro

## 1. Introducción

Este documento describe los flujos de datos críticos del sistema SportZone Pro, incluyendo:
- Registro de eventos de partido
- Finalización de partido y actualización de posiciones
- Generación automática de fixture
- Gestión de suspensiones automáticas
- Aplicación de resoluciones administrativas
- Notificaciones en tiempo real

---

## 2. Flujo de Registro de Evento (Gol)

### 2.1 Diagrama de Secuencia

```
Planillero    App PWA      Backend API    Supabase DB    SignalR Hub    FCM Service    Clientes
   │             │              │              │              │              │            │
   │ 1. Click    │              │              │              │              │            │
   │   "GOL"     │              │              │              │              │            │
   ├────────────>│              │              │              │              │            │
   │             │              │              │              │              │            │
   │             │ 2. Modal     │              │              │              │            │
   │             │  selección   │              │              │              │            │
   │             │  jugador     │              │              │              │            │
   │<────────────┤              │              │              │              │            │
   │             │              │              │              │              │            │
   │ 3. Confirma │              │              │              │              │            │
   │   jugador   │              │              │              │              │            │
   ├────────────>│              │              │              │              │            │
   │             │              │              │              │              │            │
   │             │ 4. POST      │              │              │              │            │
   │             │  /partidos/  │              │              │              │            │
   │             │  {id}/eventos│              │              │              │            │
   │             ├─────────────>│              │              │              │            │
   │             │              │              │              │              │            │
   │             │              │ 5. Validar   │              │              │            │
   │             │              │  - Planillero│              │              │            │
   │             │              │  - Estado    │              │              │            │
   │             │              │  - Jugador   │              │              │            │
   │             │              │              │              │              │            │
   │             │              │ 6. INSERT    │              │              │            │
   │             │              │  eventos_    │              │              │            │
   │             │              │  partido     │              │              │            │
   │             │              ├─────────────>│              │              │            │
   │             │              │              │              │              │            │
   │             │              │              │ 7. Trigger   │              │            │
   │             │              │              │  actualizar  │              │            │
   │             │              │              │  estadísticas│              │            │
   │             │              │              │  y marcador  │              │            │
   │             │              │              │              │              │            │
   │             │              │ 8. Broadcast │              │              │            │
   │             │              │  evento      │              │              │            │
   │             │              ├──────────────┼─────────────>│              │            │
   │             │              │              │              │              │            │
   │             │              │              │              │ 9. Transmitir│            │
   │             │              │              │              │  a clientes  │            │
   │             │              │              │              ├─────────────────────────>│
   │             │              │              │              │              │            │
   │             │              │ 10. Enviar   │              │              │            │
   │             │              │  notif. push │              │              │            │
   │             │              ├──────────────┼──────────────┼─────────────>│            │
   │             │              │              │              │              │            │
   │             │              │              │              │              │ 11. Push   │
   │             │              │              │              │              │  a móviles │
   │             │              │              │              │              ├───────────>│
   │             │              │              │              │              │            │
   │             │ 12. 201      │              │              │              │            │
   │             │  Created     │              │              │              │            │
   │             │<─────────────┤              │              │              │            │
   │             │              │              │              │              │            │
   │ 13. Confirm.│              │              │              │              │            │
   │   visual    │              │              │              │              │            │
   │<────────────┤              │              │              │              │            │
```

### 2.2 Pasos Detallados

**1. Planillero presiona botón "GOL"**
- Ubicación: App Planillero (PWA)
- Acción: Click en botón verde grande (120px altura)

**2. App muestra modal de selección de jugador**
- Lista de jugadores del equipo seleccionado
- Botones grandes (80x80px) con número y nombre
- Opción de seleccionar asistente (opcional)

**3. Planillero confirma jugador**
- Selecciona jugador que anotó
- Opcionalmente selecciona asistente
- Confirma el evento

**4. App envía POST /partidos/{id}/eventos**
```json
{
  "minuto": 23,
  "tipo": "gol",
  "jugadorId": "uuid-jugador",
  "asistenteId": "uuid-asistente",
  "equipoId": "uuid-equipo",
  "descripcion": "Gol de tiro libre"
}
```

**5. Backend valida**
- Usuario autenticado es el planillero asignado al partido
- Partido está en estado "en_curso"
- Jugador pertenece al equipo indicado
- Minuto es válido (0-90+)

**6. Backend inserta en base de datos**
```sql
INSERT INTO eventos_partido (
  partido_id, minuto, tipo, jugador_id, 
  asistente_id, equipo_id, descripcion
) VALUES (...);
```

**7. Trigger actualiza estadísticas automáticamente**
```sql
-- Incrementar goles del jugador
UPDATE estadisticas_jugador 
SET goles = goles + 1 
WHERE jugador_id = ... AND torneo_id = ...;

-- Incrementar asistencias del asistente
UPDATE estadisticas_jugador 
SET asistencias = asistencias + 1 
WHERE jugador_id = ... AND torneo_id = ...;

-- Actualizar marcador del partido
UPDATE partidos 
SET goles_local = goles_local + 1 
WHERE id = ... AND equipo_local_id = ...;
```

**8. Backend envía a SignalR Hub**
```csharp
await _hubContext.Clients
    .Group($"partido-{partidoId}")
    .SendAsync("EventoRegistrado", new {
        minuto = 23,
        tipo = "gol",
        jugador = "Juan Pérez",
        equipo = "Equipo A"
    });

await _hubContext.Clients
    .Group($"partido-{partidoId}")
    .SendAsync("MarcadorActualizado", new {
        golesLocal = 2,
        golesVisita = 1
    });
```

**9. SignalR Hub transmite a todos los clientes conectados**
- Portal Web actualiza marcador en tiempo real
- Marcador Público actualiza display
- Otros planilleros/admins ven el evento

**10. Backend envía notificación push**
```csharp
// Consultar suscriptores
var suscriptores = await ObtenerSuscriptoresAsync(partidoId);

// Filtrar por preferencias (goles habilitados)
var tokens = suscriptores
    .Where(s => s.Preferencias.Goles)
    .SelectMany(s => s.Tokens)
    .ToList();

// Enviar notificación
var message = new MulticastMessage {
    Tokens = tokens,
    Notification = new Notification {
        Title = "⚽ ¡GOL! Equipo A",
        Body = "Juan Pérez - Minuto 23'"
    }
};
await _fcm.SendMulticastAsync(message);
```

**11. FCM envía push a dispositivos móviles**
- Usuarios con app instalada reciben notificación
- Notificación muestra incluso si app está cerrada

**12. Backend retorna 201 Created**
```json
{
  "id": "uuid-evento",
  "partidoId": "uuid-partido",
  "minuto": 23,
  "tipo": "gol",
  "jugador": {
    "id": "uuid-jugador",
    "nombre": "Juan Pérez"
  },
  "createdAt": "2025-03-20T16:23:00Z"
}
```

**13. App muestra confirmación visual**
- Animación de éxito (checkmark verde)
- Sonido de confirmación
- Evento aparece en timeline

### 2.3 Manejo de Errores

| Error | Código | Acción |
|-------|--------|--------|
| Planillero no asignado | 403 | Mostrar "No tienes permisos" |
| Partido no en curso | 400 | Mostrar "Partido no está en curso" |
| Jugador no encontrado | 404 | Mostrar "Jugador no válido" |
| Timeout de red | 408 | Reintentar automáticamente (3 veces) |
| Error de servidor | 500 | Mostrar "Error del servidor, intenta de nuevo" |

---

## 3. Flujo de Finalización de Partido

### 3.1 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Planillero presiona "FINALIZAR PARTIDO"                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. App muestra primer modal de confirmación                │
│    "¿Estás seguro de finalizar el partido?"                │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │ Cancelar│ → Volver a app
                    └─────────┘
                         │
                    ┌────┴────┐
                    │Confirmar│
                    └────┬────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. App muestra segundo modal con marcador final            │
│    "Equipo A 2 - 1 Equipo B. ¿Confirmar?"                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │ Cancelar│ → Volver a app
                    └─────────┘
                         │
                    ┌────┴────┐
                    │Confirmar│
                    └────┬────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. App envía PATCH /partidos/{id}/finalizar                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend valida:                                          │
│    - Usuario es planillero asignado o admin                │
│    - Partido está en estado "en_curso"                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Backend actualiza estado del partido a "finalizado"     │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ↓               ↓               ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 7a. Ejecutar │ │ 7b. Verificar│ │ 7c. SignalR  │
│ fn_actualizar│ │ suspensiones │ │ Broadcast    │
│ _posiciones  │ │ automáticas  │ │ estado       │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ↓                ↓                ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Tabla        │ │ Crear        │ │ Clientes     │
│ posiciones   │ │ suspensiones │ │ notificados  │
│ actualizada  │ │ si aplica    │ │              │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┴────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Supabase Realtime notifica cambios en tabla posiciones  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Backend envía notificación push                         │
│    "Partido finalizado: Equipo A 2 - 1 Equipo B"           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. App muestra pantalla de resumen final                  │
│     - Marcador final                                        │
│     - Estadísticas del partido                              │
│     - Botón "Volver al inicio"                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Actualización de Tabla de Posiciones

**Función: fn_actualizar_posiciones(partidoId)**

```sql
CREATE OR REPLACE FUNCTION fn_actualizar_posiciones(p_partido_id UUID)
RETURNS void AS $$
DECLARE
  v_partido partidos%ROWTYPE;
  v_resultado_local VARCHAR(1);
  v_resultado_visita VARCHAR(1);
BEGIN
  -- Obtener datos del partido
  SELECT * INTO v_partido FROM partidos WHERE id = p_partido_id;

  -- Validar que el partido esté finalizado
  IF v_partido.estado != 'finalizado' THEN
    RAISE EXCEPTION 'El partido no está finalizado';
  END IF;

  -- Determinar resultado
  IF v_partido.goles_local > v_partido.goles_visita THEN
    v_resultado_local := 'V';  -- Victoria
    v_resultado_visita := 'D'; -- Derrota
  ELSIF v_partido.goles_local < v_partido.goles_visita THEN
    v_resultado_local := 'D';
    v_resultado_visita := 'V';
  ELSE
    v_resultado_local := 'E';  -- Empate
    v_resultado_visita := 'E';
  END IF;

  -- Actualizar equipo local
  INSERT INTO posiciones (torneo_id, equipo_id, pj, pg, pe, pp, gf, gc)
  VALUES (
    v_partido.torneo_id,
    v_partido.equipo_local_id,
    1,
    CASE WHEN v_resultado_local = 'V' THEN 1 ELSE 0 END,
    CASE WHEN v_resultado_local = 'E' THEN 1 ELSE 0 END,
    CASE WHEN v_resultado_local = 'D' THEN 1 ELSE 0 END,
    v_partido.goles_local,
    v_partido.goles_visita
  )
  ON CONFLICT (torneo_id, equipo_id) DO UPDATE SET
    pj = posiciones.pj + 1,
    pg = posiciones.pg + CASE WHEN v_resultado_local = 'V' THEN 1 ELSE 0 END,
    pe = posiciones.pe + CASE WHEN v_resultado_local = 'E' THEN 1 ELSE 0 END,
    pp = posiciones.pp + CASE WHEN v_resultado_local = 'D' THEN 1 ELSE 0 END,
    gf = posiciones.gf + v_partido.goles_local,
    gc = posiciones.gc + v_partido.goles_visita,
    ultima_actualizacion = NOW();

  -- Actualizar equipo visita (similar)
  -- ...
END;
$$ LANGUAGE plpgsql;
```

**Cálculo de puntos y diferencia**:
- Puntos = PG * 3 + PE
- Diferencia = GF - GC
- Ordenamiento: Puntos DESC, Diferencia DESC, GF DESC

### 3.3 Verificación de Suspensiones Automáticas

**Reglas**:
- 3 tarjetas amarillas → 1 partido de suspensión
- 1 tarjeta roja → 2 partidos de suspensión
- 2 amarillas en el mismo partido → Expulsión (equivalente a roja)

**Función: fn_verificar_suspensiones(jugadorId, torneoId)**

```sql
CREATE OR REPLACE FUNCTION fn_verificar_suspensiones(
  p_jugador_id UUID, 
  p_torneo_id UUID
)
RETURNS void AS $$
DECLARE
  v_amarillas INT;
  v_rojas INT;
BEGIN
  -- Contar tarjetas del jugador en el torneo
  SELECT 
    COALESCE(tarjetas_amarillas, 0),
    COALESCE(tarjetas_rojas, 0)
  INTO v_amarillas, v_rojas
  FROM estadisticas_jugador
  WHERE jugador_id = p_jugador_id AND torneo_id = p_torneo_id;

  -- Suspensión por 3 amarillas
  IF v_amarillas >= 3 AND v_amarillas % 3 = 0 THEN
    INSERT INTO suspensiones (
      jugador_id, torneo_id, tipo, 
      partidos_totales, motivo, fecha_inicio
    )
    VALUES (
      p_jugador_id,
      p_torneo_id,
      'acumulacion_amarillas',
      1,
      'Acumulación de 3 tarjetas amarillas',
      CURRENT_DATE
    );
  END IF;

  -- Suspensión por tarjeta roja
  IF v_rojas > 0 THEN
    INSERT INTO suspensiones (
      jugador_id, torneo_id, tipo, 
      partidos_totales, motivo, fecha_inicio
    )
    VALUES (
      p_jugador_id,
      p_torneo_id,
      'tarjeta_roja',
      2,  -- Configurable
      'Tarjeta roja directa',
      CURRENT_DATE
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
```



---

## 4. Flujo de Generación Automática de Fixture

### 4.1 Algoritmo Round-Robin

El algoritmo Round-Robin garantiza que todos los equipos se enfrenten entre sí exactamente una vez.

**Entrada**:
- Lista de equipos (debe ser número par)
- Fecha de inicio
- Horarios disponibles (ej: 14:00, 16:00, 18:00, 20:00)
- Días mínimos entre partidos del mismo equipo (default: 3)
- Seed para reproducibilidad (opcional)

**Salida**:
- Lista de partidos con fecha, hora, local y visita asignados

### 4.2 Pseudocódigo

```
FUNCIÓN GenerarFixture(equipos[], fechaInicio, horariosDisponibles[], diasMinimos, seed)
  n = equipos.length
  
  SI n es impar ENTONCES
    LANZAR ERROR "Número de equipos debe ser par"
  FIN SI

  partidos = []
  random = new Random(seed)
  fechaActual = fechaInicio
  jornada = 1
  totalJornadas = n - 1
  partidosPorJornada = n / 2

  PARA j = 0 HASTA totalJornadas - 1 HACER
    PARA p = 0 HASTA partidosPorJornada - 1 HACER
      local = equipos[p]
      visita = equipos[n - 1 - p]

      // Alternar local/visita aleatoriamente
      SI random.Next(2) == 0 ENTONCES
        INTERCAMBIAR(local, visita)
      FIN SI

      // Asignar horario aleatorio
      horario = horariosDisponibles[random.Next(horariosDisponibles.length)]
      fechaHora = fechaActual + horario

      // Validar conflictos (mismo equipo no juega 2 veces el mismo día)
      MIENTRAS NO ValidarConflictos(local, fechaHora) O 
              NO ValidarConflictos(visita, fechaHora) HACER
        fechaHora = fechaHora + 1 día
      FIN MIENTRAS

      partidos.AGREGAR({
        torneoId: torneoId,
        jornada: jornada,
        equipoLocalId: local,
        equipoVisitaId: visita,
        fechaHora: fechaHora
      })
    FIN PARA

    // Rotar equipos (excepto el primero que queda fijo)
    ultimo = equipos[n - 1]
    PARA i = n - 1 HASTA 2 HACER
      equipos[i] = equipos[i - 1]
    FIN PARA
    equipos[1] = ultimo

    jornada++
    fechaActual = fechaActual + diasMinimos días
  FIN PARA

  RETORNAR partidos
FIN FUNCIÓN
```

### 4.3 Ejemplo de Rotación (6 equipos)

```
Equipos: A, B, C, D, E, F

Jornada 1:  A-F  B-E  C-D
Jornada 2:  A-E  F-D  B-C
Jornada 3:  A-D  E-C  F-B
Jornada 4:  A-C  D-B  E-F
Jornada 5:  A-B  C-F  D-E
```

**Rotación**:
- El equipo A permanece fijo en la primera posición
- Los demás equipos rotan en sentido horario
- Cada jornada tiene n/2 partidos
- Total de jornadas: n-1

### 4.4 Validación de Conflictos

```csharp
public async Task<bool> ValidarConflictosAsync(Guid equipoId, DateTime fechaHora)
{
    // Verificar que el equipo no tenga otro partido el mismo día
    var partidosEquipo = await _supabase
        .From<Partido>()
        .Where(p => (p.EquipoLocalId == equipoId || p.EquipoVisitaId == equipoId) &&
                    p.FechaHora.Date == fechaHora.Date)
        .Get();

    return !partidosEquipo.Models.Any();
}
```

### 4.5 Request y Response

**Request**:
```json
POST /api/partidos/generar-fixture
{
  "torneoId": "uuid",
  "equipoIds": ["uuid1", "uuid2", "uuid3", "uuid4", "uuid5", "uuid6"],
  "fechaInicio": "2025-03-01",
  "horariosDisponibles": ["14:00:00", "16:00:00", "18:00:00", "20:00:00"],
  "diasMinimosEntrePartidos": 3,
  "seed": 12345
}
```

**Response**:
```json
{
  "partidosCreados": 15,
  "jornadas": 5,
  "partidos": [
    {
      "id": "uuid",
      "jornada": 1,
      "equipoLocalId": "uuid1",
      "equipoVisitaId": "uuid6",
      "fechaHora": "2025-03-01T16:00:00Z",
      "estadio": "Por asignar"
    },
    // ... más partidos
  ]
}
```

---

## 5. Flujo de Aplicación de Resoluciones Administrativas

### 5.1 Tipos de Resoluciones

| Tipo | Efecto Automático |
|------|-------------------|
| **suspension** | Crea registro en tabla `suspensiones` |
| **descuento_puntos** | Actualiza puntos en tabla `posiciones` |
| **wo_tecnico** | Modifica resultado del partido a 3-0 |
| **multa** | Registra multa en sistema financiero |
| **amonestacion** | Solo registro, sin efecto automático |

### 5.2 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin crea resolución en estado "borrador"              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Admin revisa y edita resolución                          │
│    - Asunto, motivo, tipo de sanción                        │
│    - Jugador/equipo afectado                                │
│    - Valor de la sanción                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Admin cambia estado a "emitida"                          │
│    PATCH /api/resoluciones/{id}/estado                      │
│    { "estado": "emitida", "fechaEmision": "2025-01-16" }    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend aplica sanción automáticamente                   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬───────────────┐
         │               │               │               │
         ↓               ↓               ↓               ↓
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐
│ Suspensión   │ │ Descuento    │ │ W.O.     │ │ Multa    │
│              │ │ Puntos       │ │ Técnico  │ │          │
└──────┬───────┘ └──────┬───────┘ └────┬─────┘ └────┬─────┘
       │                │              │            │
       ↓                ↓              ↓            ↓
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐
│ INSERT       │ │ UPDATE       │ │ UPDATE   │ │ Registro │
│ suspensiones │ │ posiciones   │ │ partidos │ │ financ.  │
└──────────────┘ └──────────────┘ └────┬─────┘ └──────────┘
                                       │
                                       ↓
                              ┌──────────────┐
                              │ fn_actualizar│
                              │ _posiciones  │
                              └──────────────┘
```

### 5.3 Implementación

**Aplicar Resolución**:
```csharp
public async Task AplicarResolucionAsync(Guid resolucionId)
{
    var resolucion = await _supabase
        .From<Resolucion>()
        .Where(r => r.Id == resolucionId)
        .Single();

    if (resolucion.Estado != "emitida")
        throw new InvalidOperationException("La resolución no está emitida");

    switch (resolucion.SancionTipo)
    {
        case "suspension":
            await CrearSuspensionAsync(new CreateSuspensionDto
            {
                JugadorId = resolucion.JugadorId.Value,
                TorneoId = resolucion.TorneoId,
                Tipo = "resolucion_administrativa",
                PartidosTotales = resolucion.SancionValor.Value,
                Motivo = resolucion.Asunto
            });
            break;

        case "descuento_puntos":
            await _supabase
                .From<Posicion>()
                .Where(p => p.EquipoId == resolucion.EquipoId && 
                           p.TorneoId == resolucion.TorneoId)
                .Update(p => new { 
                    Puntos = p.Puntos - resolucion.SancionValor.Value 
                });
            break;

        case "wo_tecnico":
            var partido = await _supabase
                .From<Partido>()
                .Where(p => p.Id == resolucion.PartidoId)
                .Single();

            partido.GolesLocal = 3;
            partido.GolesVisita = 0;
            partido.Estado = "finalizado";
            await _supabase.From<Partido>().Update(partido);

            // Actualizar posiciones
            await _supabase.Rpc("fn_actualizar_posiciones", new { 
                p_partido_id = resolucion.PartidoId 
            });
            break;

        case "multa":
            await RegistrarMultaAsync(
                resolucion.EquipoId.Value, 
                resolucion.SancionValor.Value
            );
            break;

        case "amonestacion":
            // Solo registro, sin efecto automático
            break;
    }
}
```

**Revertir Resolución**:
```csharp
public async Task RevertirResolucionAsync(Guid resolucionId)
{
    var resolucion = await _supabase
        .From<Resolucion>()
        .Where(r => r.Id == resolucionId)
        .Single();

    switch (resolucion.SancionTipo)
    {
        case "suspension":
            await _supabase
                .From<Suspension>()
                .Where(s => s.JugadorId == resolucion.JugadorId && 
                           s.Tipo == "resolucion_administrativa")
                .Update(s => new { Estado = "anulada" });
            break;

        case "descuento_puntos":
            await _supabase
                .From<Posicion>()
                .Where(p => p.EquipoId == resolucion.EquipoId && 
                           p.TorneoId == resolucion.TorneoId)
                .Update(p => new { 
                    Puntos = p.Puntos + resolucion.SancionValor.Value 
                });
            break;

        case "wo_tecnico":
            // Revertir resultado y recalcular posiciones
            var partido = await _supabase
                .From<Partido>()
                .Where(p => p.Id == resolucion.PartidoId)
                .Single();

            partido.Estado = "programado";
            await _supabase.From<Partido>().Update(partido);

            await RecalcularPosicionesAsync(resolucion.TorneoId);
            break;
    }

    resolucion.Estado = "anulada";
    await _supabase.From<Resolucion>().Update(resolucion);
}
```

---

## 6. Flujo de Notificaciones en Tiempo Real

### 6.1 Canales de Notificación

| Canal | Tecnología | Uso |
|-------|-----------|-----|
| **WebSocket** | SignalR | Actualizaciones en tiempo real en web |
| **Push Notifications** | Firebase Cloud Messaging | Notificaciones a apps móviles |
| **Database Realtime** | Supabase Realtime | Cambios en tabla de posiciones |

### 6.2 SignalR - Actualizaciones Web

**Conexión del cliente**:
```typescript
const connection = new signalR.HubConnectionBuilder()
  .withUrl('wss://api.sportzone.app/hubs/partidos', {
    accessTokenFactory: () => localStorage.getItem('token')
  })
  .withAutomaticReconnect()
  .build();

await connection.start();
```

**Suscripción a partido**:
```typescript
await connection.invoke('SuscribirPartido', partidoId);

connection.on('EventoRegistrado', (evento) => {
  // Actualizar UI con nuevo evento
  this.eventos.update(e => [...e, evento]);
});

connection.on('MarcadorActualizado', (data) => {
  // Actualizar marcador
  this.golesLocal.set(data.golesLocal);
  this.golesVisita.set(data.golesVisita);
});

connection.on('MinutoActualizado', (minuto) => {
  // Actualizar cronómetro
  this.minutoActual.set(minuto);
});
```

**Desconexión**:
```typescript
await connection.invoke('DesuscribirPartido', partidoId);
await connection.stop();
```

### 6.3 Firebase Cloud Messaging - Push Notifications

**Registro de dispositivo**:
```typescript
// En la app móvil
const token = await messaging.getToken();

// Enviar token al backend
await fetch('/api/dispositivos/registrar', {
  method: 'POST',
  body: JSON.stringify({
    fcmToken: token,
    plataforma: 'android'
  })
});
```

**Suscripción a equipo**:
```typescript
await fetch('/api/suscripciones', {
  method: 'POST',
  body: JSON.stringify({
    equipoId: 'uuid',
    preferencias: {
      goles: true,
      tarjetas: true,
      inicio_partido: true,
      fin_partido: true,
      medio_tiempo: false
    }
  })
});
```

**Envío de notificación (backend)**:
```csharp
public async Task EnviarNotificacionGolAsync(Guid partidoId, EventoPartidoDto evento)
{
    // Consultar suscriptores
    var suscriptores = await ObtenerSuscriptoresAsync(partidoId);
    
    // Filtrar por preferencias
    var tokens = suscriptores
        .Where(s => s.Preferencias.Goles)
        .SelectMany(s => s.Tokens)
        .ToList();

    if (!tokens.Any()) return;

    // Crear mensaje
    var message = new MulticastMessage
    {
        Tokens = tokens,
        Notification = new Notification
        {
            Title = $"⚽ ¡GOL! {evento.EquipoNombre}",
            Body = $"{evento.JugadorNombre} - Minuto {evento.Minuto}'"
        },
        Data = new Dictionary<string, string>
        {
            { "tipo", "gol" },
            { "partidoId", partidoId.ToString() },
            { "minuto", evento.Minuto.ToString() }
        }
    };

    // Enviar con retry
    var retryPolicy = Policy
        .Handle<FirebaseMessagingException>()
        .WaitAndRetryAsync(3, retryAttempt => 
            TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
    
    await retryPolicy.ExecuteAsync(async () =>
    {
        var response = await _fcm.SendMulticastAsync(message);
        
        // Eliminar tokens inválidos
        if (response.FailureCount > 0)
        {
            await EliminarTokensInvalidosAsync(response);
        }
    });
}
```

### 6.4 Supabase Realtime - Cambios en Base de Datos

**Suscripción a cambios en tabla posiciones**:
```typescript
const subscription = supabase
  .channel('posiciones-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'posiciones',
      filter: `torneo_id=eq.${torneoId}`
    },
    (payload) => {
      console.log('Cambio en posiciones:', payload);
      // Recargar tabla de posiciones
      this.cargarTabla(torneoId);
    }
  )
  .subscribe();

// Desuscribirse
subscription.unsubscribe();
```

---

## 7. Flujo de Sincronización Offline (PWA)

### 7.1 Estrategia de Sincronización

**Modo Online**:
- Todas las operaciones se envían inmediatamente al backend
- Confirmación en tiempo real

**Modo Offline**:
- Eventos se almacenan en IndexedDB local
- UI muestra indicador "Offline"
- Al recuperar conexión, sincroniza automáticamente

### 7.2 Implementación

**Detectar conectividad**:
```typescript
@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  readonly isOnline = signal(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }
}
```

**Almacenar evento offline**:
```typescript
async registrarEventoOffline(evento: CreateEventoDto) {
  // Guardar en IndexedDB
  await this.db.eventos.add({
    ...evento,
    timestamp: Date.now(),
    sincronizado: false
  });

  // Mostrar confirmación local
  this.mostrarConfirmacion('Evento guardado localmente');
}
```

**Sincronizar al recuperar conexión**:
```typescript
async sincronizarEventosPendientes() {
  const eventosPendientes = await this.db.eventos
    .where('sincronizado')
    .equals(false)
    .toArray();

  for (const evento of eventosPendientes) {
    try {
      await this.http.post(`/partidos/${evento.partidoId}/eventos`, evento)
        .toPromise();

      // Marcar como sincronizado
      await this.db.eventos.update(evento.id, { sincronizado: true });
    } catch (error) {
      console.error('Error sincronizando evento:', error);
      // Reintentar más tarde
    }
  }
}
```

---

## 8. Resumen de Flujos Críticos

| Flujo | Tiempo Promedio | Componentes Involucrados |
|-------|----------------|--------------------------|
| Registro de gol | < 2 segundos | App PWA → Backend → DB → SignalR → FCM → Clientes |
| Finalización de partido | < 5 segundos | App PWA → Backend → DB (triggers) → SignalR → FCM |
| Generación de fixture | < 10 segundos | Admin Web → Backend (algoritmo) → DB |
| Aplicación de resolución | < 3 segundos | Admin Web → Backend → DB (múltiples tablas) |
| Notificación push | < 2 segundos | Backend → FCM → Dispositivos móviles |
| Actualización SignalR | < 1 segundo | Backend → SignalR Hub → Clientes web |

---

## 9. Consideraciones de Rendimiento

### 9.1 Optimizaciones Implementadas

- **Índices en base de datos**: Consultas optimizadas con índices estratégicos
- **Cache en memoria**: Tabla de posiciones cacheada por 5 minutos
- **Batch processing**: Notificaciones push enviadas en lotes de 500
- **Connection pooling**: PgBouncer para gestión eficiente de conexiones
- **CDN**: Assets estáticos servidos desde CDN global

### 9.2 Límites de Escalabilidad

- **SignalR**: Hasta 1000 conexiones concurrentes por instancia
- **FCM**: Hasta 10,000 notificaciones por segundo
- **Base de datos**: Hasta 500 queries por segundo
- **API**: Hasta 100 requests por segundo por instancia

### 9.3 Monitoreo

- Application Insights para métricas en tiempo real
- Alertas automáticas si latencia > 2 segundos
- Dashboard de métricas de negocio (eventos/minuto, usuarios activos)
