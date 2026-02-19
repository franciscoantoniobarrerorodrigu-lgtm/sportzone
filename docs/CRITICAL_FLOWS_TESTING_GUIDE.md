# Guía de Testing de Flujos Críticos - SportZone Pro

## Introducción

Este documento proporciona planes de testing end-to-end completos para los flujos críticos de negocio del sistema SportZone Pro. Estos flujos integran múltiples componentes del sistema (Backend API, Frontend, Base de Datos, SignalR, PWA) y son esenciales para el funcionamiento correcto del sistema.

## Tabla de Contenidos

1. [Flujo de Registro de Gol](#1-flujo-de-registro-de-gol)
2. [Flujo de Finalización de Partido](#2-flujo-de-finalización-de-partido)
3. [Flujo de Actualización Automática de Tabla de Posiciones](#3-flujo-de-actualización-automática-de-tabla-de-posiciones)
4. [Flujo de Generación de Suspensiones Automáticas](#4-flujo-de-generación-de-suspensiones-automáticas)
5. [Flujo de Generación de Fixture sin Conflictos](#5-flujo-de-generación-de-fixture-sin-conflictos)
6. [Flujo de Aplicación de Resoluciones Administrativas](#6-flujo-de-aplicación-de-resoluciones-administrativas)
7. [Matriz de Validación de Componentes](#7-matriz-de-validación-de-componentes)
8. [Checklist de Testing Completo](#8-checklist-de-testing-completo)

---

## Pre-requisitos Generales

### Sistema Completo Funcionando

**Backend API (.NET 8)**:
```bash
cd SportZone.API
dotnet run
# Debe estar en http://localhost:5000
```

**Frontend Angular 17**:
```bash
cd sportzone-web
npm start
# Debe estar en http://localhost:4200
```

**Base de Datos Supabase**:
- ✅ Todos los scripts SQL ejecutados (01-14)
- ✅ Datos de prueba insertados
- ✅ Triggers y funciones activos

### Usuarios de Prueba Configurados

- **Admin**: `admin@sportzone.com` / `Admin123!`
- **Planillero**: `planillero@sportzone.com` / `Planillero123!`
- **Árbitro**: `arbitro@sportzone.com` / `Arbitro123!`


---

## 1. Flujo de Registro de Gol

### 1.1 Descripción del Flujo

**Componentes Involucrados**:
- App Planillero (PWA)
- Backend API (PartidosController, PartidosService)
- Base de Datos (eventos_partido, estadisticas_jugador, partidos)
- SignalR Hub (PartidoHub)
- Frontend Portal Web (PartidoLiveComponent, MarcadorPublicoComponent)
- Triggers de Base de Datos (trg_actualizar_estadisticas)

**Flujo de Datos**:
```
Planillero (Tablet)
    │
    │ 1. POST /api/partidos/{id}/eventos
    │    { tipo: "gol", jugadorId, equipoId, minuto, asistenteId }
    ↓
Backend API
    │
    ├─→ 2. Validar planillero asignado
    ├─→ 3. Validar estado partido = "en_curso"
    ├─→ 4. Insertar en eventos_partido
    │
    ↓
Trigger DB (trg_actualizar_estadisticas)
    │
    ├─→ 5. Incrementar goles del jugador en estadisticas_jugador
    ├─→ 6. Incrementar asistencias del asistente (si existe)
    ├─→ 7. Actualizar marcador en tabla partidos (goles_local/goles_visita)
    │
    ↓
SignalR Hub
    │
    ├─→ 8. Broadcast "EventoRegistrado" a grupo partido-{id}
    ├─→ 9. Broadcast "MarcadorActualizado" a grupo partido-{id}
    │
    ↓
Clientes Frontend
    │
    ├─→ 10. PartidoLiveComponent actualiza marcador y timeline
    ├─→ 11. MarcadorPublicoComponent muestra animación de gol
    └─→ 12. App Planillero muestra confirmación visual
```

### 1.2 Pre-requisitos del Test

**Datos de Prueba Necesarios**:
```sql
-- Crear partido de prueba en estado "en_curso"
INSERT INTO partidos (id, torneo_id, jornada, equipo_local_id, equipo_visita_id, 
                      fecha_hora, estado, goles_local, goles_visita, planillero_id)
VALUES (
  'uuid-partido-test',
  'uuid-torneo',
  1,
  'uuid-equipo-local',
  'uuid-equipo-visita',
  NOW(),
  'en_curso',
  0,
  0,
  'uuid-planillero'
);

-- Crear jugadores de prueba
INSERT INTO jugadores (id, equipo_id, nombre, apellido, numero_camiseta, posicion)
VALUES 
  ('uuid-jugador-goleador', 'uuid-equipo-local', 'Lionel', 'Messi', 10, 'Delantero'),
  ('uuid-jugador-asistente', 'uuid-equipo-local', 'Andrés', 'Iniesta', 8, 'Mediocampista');

-- Crear estadísticas iniciales
INSERT INTO estadisticas_jugador (jugador_id, torneo_id, goles, asistencias)
VALUES 
  ('uuid-jugador-goleador', 'uuid-torneo', 0, 0),
  ('uuid-jugador-asistente', 'uuid-torneo', 0, 0);
```


### 1.3 Escenarios de Prueba

#### Escenario 1.1: Registro de Gol Exitoso con Asistencia

**Pasos de Ejecución**:

1. **Preparación**:
   - Abrir 3 navegadores/tabs:
     - Tab 1: App Planillero (`http://localhost:4200/planillero`)
     - Tab 2: Partido Live (`http://localhost:4200/partidos/{id}/live`)
     - Tab 3: Marcador Público (`http://localhost:4200/partidos/{id}/marcador`)
   - Login como planillero en Tab 1
   - Verificar que el partido está en estado "en_curso"

2. **Ejecución**:
   - En App Planillero:
     - Seleccionar equipo local
     - Seleccionar jugador goleador (Messi #10)
     - Click en botón "GOL" (verde, 120px)
     - En modal, seleccionar asistente (Iniesta #8)
     - Ingresar minuto: 15
     - Confirmar

3. **Validación Inmediata (< 1 segundo)**:

   **En App Planillero**:
   - ✅ Confirmación visual (toast verde "¡Gol registrado!")
   - ✅ Marcador superior actualizado: Local 1 - 0 Visita
   - ✅ Timeline muestra nuevo evento: "15' - GOL - Messi (Iniesta)"
   - ✅ Botón GOL vuelve a estado normal

   **En Partido Live (Tab 2)**:
   - ✅ Marcador actualizado automáticamente: 1 - 0
   - ✅ Timeline muestra: "15' ⚽ GOL - Messi (Asist: Iniesta)"
   - ✅ Animación de gol se reproduce (fade-in con efecto)
   - ✅ Notificación temporal: "¡GOL! Equipo Local - Messi"

   **En Marcador Público (Tab 3)**:
   - ✅ Números de goles actualizados (120px, color cian)
   - ✅ Animación de gol (escala + brillo)
   - ✅ Notificación flotante: "⚽ GOL - Messi 15'"
   - ✅ Notificación desaparece después de 8 segundos

4. **Validación en Base de Datos**:
   ```sql
   -- Verificar evento registrado
   SELECT * FROM eventos_partido 
   WHERE partido_id = 'uuid-partido-test' 
   AND tipo = 'gol' 
   AND minuto = 15;
   -- Debe retornar 1 fila con jugador_id y asistente_id correctos

   -- Verificar marcador actualizado
   SELECT goles_local, goles_visita FROM partidos 
   WHERE id = 'uuid-partido-test';
   -- Debe retornar: goles_local = 1, goles_visita = 0

   -- Verificar estadísticas del goleador
   SELECT goles FROM estadisticas_jugador 
   WHERE jugador_id = 'uuid-jugador-goleador';
   -- Debe retornar: goles = 1

   -- Verificar estadísticas del asistente
   SELECT asistencias FROM estadisticas_jugador 
   WHERE jugador_id = 'uuid-jugador-asistente';
   -- Debe retornar: asistencias = 1
   ```

5. **Validación en Backend (Logs)**:
   ```
   [INFO] POST /api/partidos/{id}/eventos - 200 OK
   [INFO] Evento registrado: tipo=gol, jugador=Messi, minuto=15
   [INFO] SignalR broadcast: EventoRegistrado a grupo partido-{id}
   [INFO] SignalR broadcast: MarcadorActualizado a grupo partido-{id}
   ```

6. **Validación en DevTools (Network)**:
   - ✅ Request POST a `/api/partidos/{id}/eventos` - Status 200
   - ✅ Response time < 500ms
   - ✅ WebSocket messages en tab WS:
     - `EventoRegistrado` con datos del gol
     - `MarcadorActualizado` con nuevo marcador

**Resultado Esperado**: ✅ PASS si todas las validaciones son exitosas

**Criterios de Fallo**:
- ❌ Marcador no se actualiza en algún cliente
- ❌ Estadísticas no se incrementan
- ❌ Evento no se registra en base de datos
- ❌ Latencia > 2 segundos
- ❌ Errores en consola del navegador o backend


#### Escenario 1.2: Registro de Gol sin Asistencia

**Pasos**: Igual que 1.1 pero sin seleccionar asistente

**Validación Adicional**:
- ✅ Campo `asistente_id` en eventos_partido es NULL
- ✅ No se incrementan asistencias de ningún jugador

#### Escenario 1.3: Gol del Equipo Visitante

**Pasos**: 
- Seleccionar equipo visita en App Planillero
- Registrar gol

**Validación Adicional**:
- ✅ `goles_visita` se incrementa (no `goles_local`)
- ✅ Marcador muestra: Local 1 - 1 Visita

#### Escenario 1.4: Múltiples Goles Consecutivos

**Pasos**: Registrar 3 goles en menos de 1 minuto

**Validación**:
- ✅ Todos los goles se registran correctamente
- ✅ Eventos aparecen en orden cronológico
- ✅ No hay eventos duplicados
- ✅ Marcador final correcto

#### Escenario 1.5: Error - Partido No en Curso

**Pasos**: 
- Cambiar estado del partido a "finalizado" en DB
- Intentar registrar gol

**Validación**:
- ✅ Backend retorna 400 Bad Request
- ✅ Mensaje de error: "El partido no está en curso"
- ✅ Evento NO se registra en base de datos
- ✅ App Planillero muestra error al usuario

#### Escenario 1.6: Error - Planillero No Asignado

**Pasos**:
- Login con otro planillero (no asignado al partido)
- Intentar registrar gol

**Validación**:
- ✅ Backend retorna 403 Forbidden
- ✅ Mensaje de error: "No tienes permisos para este partido"
- ✅ Evento NO se registra

### 1.4 Casos Edge

**Edge Case 1: Gol en minuto 90+**
- Registrar gol en minuto 93
- ✅ Se registra correctamente
- ✅ Timeline muestra "93'"

**Edge Case 2: Autogol**
- Registrar gol con tipo "autogol"
- ✅ Se suma al equipo contrario
- ✅ Timeline indica "(Autogol)"

**Edge Case 3: Conexión Perdida Durante Registro**
- Desconectar internet antes de confirmar gol
- ✅ App Planillero encola evento (si modo offline implementado)
- ✅ O muestra error de conexión

### 1.5 Rollback/Cleanup

**Después del Test**:
```sql
-- Limpiar eventos de prueba
DELETE FROM eventos_partido WHERE partido_id = 'uuid-partido-test';

-- Resetear marcador
UPDATE partidos SET goles_local = 0, goles_visita = 0 
WHERE id = 'uuid-partido-test';

-- Resetear estadísticas
UPDATE estadisticas_jugador SET goles = 0, asistencias = 0 
WHERE jugador_id IN ('uuid-jugador-goleador', 'uuid-jugador-asistente');
```


---

## 2. Flujo de Finalización de Partido

### 2.1 Descripción del Flujo

**Componentes Involucrados**:
- App Planillero (PWA)
- Backend API (PartidosController, PartidosService, LigaService)
- Base de Datos (partidos, posiciones)
- Función DB (fn_actualizar_posiciones)
- SignalR Hub
- Frontend Portal Web

**Flujo de Datos**:
```
Planillero (Tablet)
    │
    │ 1. Click "FINALIZAR PARTIDO"
    │ 2. Primer modal de confirmación → Confirmar
    │ 3. Segundo modal con marcador final → Confirmar
    │ 4. PATCH /api/partidos/{id}/finalizar
    ↓
Backend API
    │
    ├─→ 5. Validar planillero asignado
    ├─→ 6. Validar estado = "en_curso"
    ├─→ 7. Cambiar estado a "finalizado"
    ├─→ 8. Ejecutar fn_actualizar_posiciones(partido_id)
    │
    ↓
Función DB (fn_actualizar_posiciones)
    │
    ├─→ 9. Determinar resultado (V/E/D)
    ├─→ 10. Actualizar posiciones equipo local (PJ, PG/PE/PP, GF, GC)
    ├─→ 11. Actualizar posiciones equipo visita (PJ, PG/PE/PP, GF, GC)
    ├─→ 12. Recalcular puntos y diferencia (columnas generadas)
    │
    ↓
SignalR Hub
    │
    ├─→ 13. Broadcast "PartidoFinalizado" a todos los clientes
    ├─→ 14. Broadcast "TablaPosicionesActualizada" a clientes de tabla
    │
    ↓
Clientes Frontend
    │
    ├─→ 15. App Planillero muestra pantalla de resumen
    ├─→ 16. PartidoLive muestra estado "FINALIZADO"
    ├─→ 17. TablaPosiciones se actualiza automáticamente
    └─→ 18. Dashboard actualiza resultados
```

### 2.2 Pre-requisitos del Test

**Datos de Prueba**:
```sql
-- Partido con eventos registrados
INSERT INTO partidos (id, torneo_id, jornada, equipo_local_id, equipo_visita_id,
                      fecha_hora, estado, goles_local, goles_visita, planillero_id)
VALUES (
  'uuid-partido-finalizar',
  'uuid-torneo',
  1,
  'uuid-equipo-local',
  'uuid-equipo-visita',
  NOW(),
  'en_curso',
  2,
  1,
  'uuid-planillero'
);

-- Posiciones iniciales de los equipos
INSERT INTO posiciones (torneo_id, equipo_id, pj, pg, pe, pp, gf, gc)
VALUES 
  ('uuid-torneo', 'uuid-equipo-local', 0, 0, 0, 0, 0, 0),
  ('uuid-torneo', 'uuid-equipo-visita', 0, 0, 0, 0, 0, 0);
```

### 2.3 Escenarios de Prueba

#### Escenario 2.1: Finalización Exitosa con Victoria Local

**Pasos de Ejecución**:

1. **Preparación**:
   - Partido en curso con marcador: Local 2 - 1 Visita
   - Abrir App Planillero como planillero asignado
   - Abrir Tabla de Posiciones en otro tab

2. **Ejecución**:
   - En App Planillero:
     - Scroll hasta el final
     - Click en botón "FINALIZAR PARTIDO" (rojo, grande)
     - **Primer Modal**: "¿Estás seguro de finalizar el partido?"
       - Texto: "Esta acción no se puede deshacer"
       - Botones: "Cancelar" | "Continuar"
       - Click "Continuar"
     - **Segundo Modal**: "Confirma el marcador final"
       - Muestra: "Equipo Local 2 - 1 Equipo Visita"
       - Texto: "¿Es correcto el marcador?"
       - Botones: "Cancelar" | "Finalizar"
       - Click "Finalizar"

3. **Validación Inmediata**:

   **En App Planillero**:
   - ✅ Loading spinner durante procesamiento
   - ✅ Pantalla de resumen final aparece
   - ✅ Muestra marcador final: 2 - 1
   - ✅ Muestra estadísticas del partido:
     - Total de goles: 3
     - Tarjetas amarillas: X
     - Tarjetas rojas: Y
   - ✅ Botón "Volver al inicio"
   - ✅ Todos los botones de eventos están deshabilitados

   **En Tabla de Posiciones (Tab 2)**:
   - ✅ Tabla se actualiza automáticamente (sin refresh)
   - ✅ Equipo Local:
     - PJ: 1
     - PG: 1
     - PE: 0
     - PP: 0
     - GF: 2
     - GC: 1
     - Diferencia: +1
     - Puntos: 3
   - ✅ Equipo Visita:
     - PJ: 1
     - PG: 0
     - PE: 0
     - PP: 1
     - GF: 1
     - GC: 2
     - Diferencia: -1
     - Puntos: 0

4. **Validación en Base de Datos**:
   ```sql
   -- Verificar estado del partido
   SELECT estado, goles_local, goles_visita FROM partidos 
   WHERE id = 'uuid-partido-finalizar';
   -- Debe retornar: estado = 'finalizado', goles_local = 2, goles_visita = 1

   -- Verificar posiciones equipo local
   SELECT pj, pg, pe, pp, gf, gc, puntos, diferencia FROM posiciones
   WHERE torneo_id = 'uuid-torneo' AND equipo_id = 'uuid-equipo-local';
   -- Debe retornar: pj=1, pg=1, pe=0, pp=0, gf=2, gc=1, puntos=3, diferencia=1

   -- Verificar posiciones equipo visita
   SELECT pj, pg, pe, pp, gf, gc, puntos, diferencia FROM posiciones
   WHERE torneo_id = 'uuid-torneo' AND equipo_id = 'uuid-equipo-visita';
   -- Debe retornar: pj=1, pg=0, pe=0, pp=1, gf=1, gc=2, puntos=0, diferencia=-1
   ```

5. **Validación en Backend (Logs)**:
   ```
   [INFO] PATCH /api/partidos/{id}/finalizar - 200 OK
   [INFO] Partido finalizado: Local 2 - 1 Visita
   [INFO] Ejecutando fn_actualizar_posiciones(partido_id)
   [INFO] Posiciones actualizadas: Equipo Local +3 puntos
   [INFO] SignalR broadcast: PartidoFinalizado
   [INFO] SignalR broadcast: TablaPosicionesActualizada
   ```

**Resultado Esperado**: ✅ PASS


#### Escenario 2.2: Finalización con Empate

**Marcador**: Local 1 - 1 Visita

**Validación Específica**:
- ✅ Ambos equipos: PE = 1, Puntos = 1
- ✅ Ningún equipo tiene PG o PP

#### Escenario 2.3: Finalización con Victoria Visitante

**Marcador**: Local 0 - 2 Visita

**Validación Específica**:
- ✅ Equipo Local: PP = 1, Puntos = 0
- ✅ Equipo Visita: PG = 1, Puntos = 3

#### Escenario 2.4: Cancelación en Primer Modal

**Pasos**:
- Click "FINALIZAR PARTIDO"
- En primer modal, click "Cancelar"

**Validación**:
- ✅ Modal se cierra
- ✅ Partido sigue en estado "en_curso"
- ✅ No se hace request al backend
- ✅ Planillero puede seguir registrando eventos

#### Escenario 2.5: Cancelación en Segundo Modal

**Pasos**:
- Click "FINALIZAR PARTIDO"
- Confirmar primer modal
- En segundo modal, click "Cancelar"

**Validación**:
- ✅ Modal se cierra
- ✅ Partido sigue en estado "en_curso"
- ✅ No se hace request al backend

#### Escenario 2.6: Error - Planillero No Asignado

**Pasos**:
- Login con planillero diferente
- Intentar finalizar partido

**Validación**:
- ✅ Backend retorna 403 Forbidden
- ✅ Partido NO se finaliza
- ✅ App muestra error: "No tienes permisos"

#### Escenario 2.7: Error - Partido Ya Finalizado

**Pasos**:
- Finalizar partido
- Intentar finalizarlo nuevamente

**Validación**:
- ✅ Backend retorna 400 Bad Request
- ✅ Mensaje: "El partido ya está finalizado"
- ✅ Posiciones NO se actualizan nuevamente

### 2.4 Casos Edge

**Edge Case 1: Partido con Marcador 0-0**
- ✅ Ambos equipos: PE = 1, Puntos = 1
- ✅ GF = 0, GC = 0, Diferencia = 0

**Edge Case 2: Goleada (5-0)**
- ✅ Diferencia de goles correcta: +5 / -5
- ✅ Puntos correctos: 3 / 0

**Edge Case 3: Múltiples Partidos del Mismo Equipo**
- Finalizar 3 partidos del mismo equipo
- ✅ PJ se acumula correctamente (3)
- ✅ Puntos se suman correctamente

### 2.5 Validación de Integridad de Datos

**Después de Finalizar Múltiples Partidos**:
```sql
-- Verificar que la suma de PJ = partidos finalizados
SELECT e.nombre, p.pj, 
       (SELECT COUNT(*) FROM partidos 
        WHERE (equipo_local_id = e.id OR equipo_visita_id = e.id) 
        AND estado = 'finalizado') as partidos_reales
FROM posiciones p
JOIN equipos e ON e.id = p.equipo_id
WHERE p.torneo_id = 'uuid-torneo';
-- pj debe ser igual a partidos_reales

-- Verificar que PJ = PG + PE + PP
SELECT e.nombre, p.pj, p.pg, p.pe, p.pp, (p.pg + p.pe + p.pp) as suma
FROM posiciones p
JOIN equipos e ON e.id = p.equipo_id
WHERE p.torneo_id = 'uuid-torneo';
-- pj debe ser igual a suma

-- Verificar que Puntos = PG*3 + PE
SELECT e.nombre, p.puntos, (p.pg * 3 + p.pe) as puntos_calculados
FROM posiciones p
JOIN equipos e ON e.id = p.equipo_id
WHERE p.torneo_id = 'uuid-torneo';
-- puntos debe ser igual a puntos_calculados
```

### 2.6 Rollback/Cleanup

```sql
-- Revertir finalización
UPDATE partidos SET estado = 'en_curso' 
WHERE id = 'uuid-partido-finalizar';

-- Resetear posiciones
UPDATE posiciones SET pj = 0, pg = 0, pe = 0, pp = 0, gf = 0, gc = 0
WHERE torneo_id = 'uuid-torneo';
```


---

## 3. Flujo de Actualización Automática de Tabla de Posiciones

### 3.1 Descripción del Flujo

Este flujo verifica que la tabla de posiciones se actualiza automáticamente en tiempo real cuando finaliza un partido, sin necesidad de refrescar la página.

**Componentes Involucrados**:
- Función DB (fn_actualizar_posiciones)
- SignalR Hub
- Frontend (TablaPosicionesComponent)
- Supabase Realtime (opcional)

**Flujo**:
```
Partido Finalizado
    ↓
fn_actualizar_posiciones() ejecutada
    ↓
Posiciones actualizadas en DB
    ↓
SignalR broadcast "TablaPosicionesActualizada"
    ↓
TablaPosicionesComponent recibe evento
    ↓
Componente recarga datos automáticamente
    ↓
UI se actualiza sin refresh
```

### 3.2 Escenarios de Prueba

#### Escenario 3.1: Actualización en Tiempo Real

**Pasos**:
1. Abrir Tabla de Posiciones en navegador 1
2. Abrir App Planillero en navegador 2
3. Finalizar partido desde App Planillero
4. Observar Tabla de Posiciones (sin refrescar)

**Validación**:
- ✅ Tabla se actualiza automáticamente en < 2 segundos
- ✅ Nuevas posiciones reflejan resultado del partido
- ✅ Orden de equipos se recalcula correctamente
- ✅ Animación suave de actualización
- ✅ No hay parpadeo o saltos bruscos

#### Escenario 3.2: Cambio de Posiciones en Tabla

**Setup**: 
- Equipo A: 6 puntos (posición 1)
- Equipo B: 5 puntos (posición 2)
- Partido: Equipo B gana

**Validación**:
- ✅ Equipo B sube a posición 1 (8 puntos)
- ✅ Equipo A baja a posición 2 (6 puntos)
- ✅ Números de posición se actualizan

#### Escenario 3.3: Criterios de Desempate

**Setup**: Dos equipos con mismos puntos

**Validación**:
- ✅ Se ordena por diferencia de goles
- ✅ Si diferencia igual, se ordena por GF
- ✅ Orden correcto en tabla


---

## 4. Flujo de Generación de Suspensiones Automáticas

### 4.1 Descripción del Flujo

**Reglas de Suspensión**:
- 3 tarjetas amarillas = 1 partido de suspensión
- 1 tarjeta roja = 2 partidos de suspensión
- 2 amarillas en mismo partido = expulsión (equivalente a roja)

**Componentes Involucrados**:
- Trigger DB (trg_actualizar_estadisticas)
- Función DB (fn_verificar_suspensiones)
- Backend (SuspensionManagerService)
- Tabla suspensiones

**Flujo**:
```
Tarjeta Registrada
    ↓
Trigger actualiza estadisticas_jugador
    ↓
fn_verificar_suspensiones(jugador_id, torneo_id)
    ↓
Si tarjetas_amarillas % 3 == 0 → Crear suspensión (1 partido)
Si tarjetas_rojas > 0 → Crear suspensión (2 partidos)
    ↓
Insertar en tabla suspensiones (estado='activa')
    ↓
Notificar a frontend
```

### 4.2 Escenarios de Prueba

#### Escenario 4.1: Suspensión por 3 Amarillas

**Pasos**:
1. Jugador tiene 0 tarjetas amarillas
2. Registrar tarjeta amarilla en partido 1 → Total: 1
3. Registrar tarjeta amarilla en partido 2 → Total: 2
4. Registrar tarjeta amarilla en partido 3 → Total: 3
5. Finalizar partido 3

**Validación**:
```sql
-- Verificar estadísticas
SELECT tarjetas_amarillas FROM estadisticas_jugador 
WHERE jugador_id = 'uuid-jugador';
-- Debe retornar: 3

-- Verificar suspensión creada
SELECT * FROM suspensiones 
WHERE jugador_id = 'uuid-jugador' 
AND tipo = 'acumulacion_amarillas'
AND estado = 'activa';
-- Debe retornar 1 fila con:
-- partidos_totales = 1
-- partidos_cumplidos = 0
```

**Validación en Frontend**:
- ✅ Dashboard de admin muestra suspensión activa
- ✅ Al intentar incluir jugador en planilla del siguiente partido, muestra advertencia
- ✅ Icono de suspensión junto al nombre del jugador

#### Escenario 4.2: Suspensión por Tarjeta Roja

**Pasos**:
1. Registrar tarjeta roja a jugador
2. Finalizar partido

**Validación**:
```sql
SELECT * FROM suspensiones 
WHERE jugador_id = 'uuid-jugador' 
AND tipo = 'tarjeta_roja'
AND estado = 'activa';
-- Debe retornar 1 fila con:
-- partidos_totales = 2
-- partidos_cumplidos = 0
```

#### Escenario 4.3: Descuento Automático de Suspensión

**Pasos**:
1. Jugador tiene suspensión activa (2 partidos)
2. Equipo juega partido 1 (jugador no participa)
3. Finalizar partido 1

**Validación**:
```sql
SELECT partidos_cumplidos, estado FROM suspensiones 
WHERE jugador_id = 'uuid-jugador';
-- Debe retornar:
-- partidos_cumplidos = 1
-- estado = 'activa'
```

4. Equipo juega partido 2
5. Finalizar partido 2

**Validación**:
```sql
SELECT partidos_cumplidos, estado FROM suspensiones 
WHERE jugador_id = 'uuid-jugador';
-- Debe retornar:
-- partidos_cumplidos = 2
-- estado = 'cumplida'
```

#### Escenario 4.4: Doble Amarilla en Mismo Partido

**Pasos**:
1. Registrar tarjeta amarilla a jugador en minuto 20
2. Registrar segunda tarjeta amarilla al mismo jugador en minuto 65

**Validación**:
- ✅ estadisticas_jugador: tarjetas_amarillas = 2
- ✅ Se crea suspensión equivalente a roja (2 partidos)
- ✅ Jugador es expulsado del partido

### 4.3 Casos Edge

**Edge Case 1: 6 Amarillas (2 Suspensiones)**
- ✅ Primera suspensión en tarjeta 3
- ✅ Segunda suspensión en tarjeta 6
- ✅ Ambas suspensiones registradas

**Edge Case 2: Suspensión en Último Partido del Torneo**
- ✅ Suspensión se crea
- ✅ Se arrastra al siguiente torneo (si aplica)


---

## 5. Flujo de Generación de Fixture sin Conflictos

### 5.1 Descripción del Flujo

**Algoritmo**: Round-Robin con asignación aleatoria de horarios

**Reglas**:
- Ningún equipo juega 2 veces el mismo día
- Mínimo 3 días entre partidos del mismo equipo (configurable)
- Todos los equipos se enfrentan entre sí
- Horarios asignados aleatoriamente de slots disponibles

**Componentes Involucrados**:
- Backend (FixtureGeneratorService)
- Endpoint POST /api/partidos/generar-fixture

### 5.2 Escenarios de Prueba

#### Escenario 5.1: Generación Exitosa con 6 Equipos

**Request**:
```json
POST /api/partidos/generar-fixture
{
  "torneoId": "uuid-torneo",
  "equipoIds": [
    "uuid-equipo-1",
    "uuid-equipo-2",
    "uuid-equipo-3",
    "uuid-equipo-4",
    "uuid-equipo-5",
    "uuid-equipo-6"
  ],
  "fechaInicio": "2026-03-01",
  "horariosDisponibles": ["15:00", "17:00", "19:00"],
  "diasMinimosEntrePartidos": 3,
  "seed": 12345
}
```

**Validación**:
```sql
-- Verificar total de partidos generados
-- Fórmula: n * (n-1) / 2 donde n = número de equipos
-- Para 6 equipos: 6 * 5 / 2 = 15 partidos
SELECT COUNT(*) FROM partidos WHERE torneo_id = 'uuid-torneo';
-- Debe retornar: 15

-- Verificar que cada equipo juega contra todos los demás
SELECT equipo_id, COUNT(*) as partidos
FROM (
  SELECT equipo_local_id as equipo_id FROM partidos WHERE torneo_id = 'uuid-torneo'
  UNION ALL
  SELECT equipo_visita_id FROM partidos WHERE torneo_id = 'uuid-torneo'
) t
GROUP BY equipo_id;
-- Cada equipo debe tener 5 partidos

-- Verificar que no hay equipos jugando 2 veces el mismo día
SELECT fecha_hora::date as fecha, equipo_id, COUNT(*) as partidos_mismo_dia
FROM (
  SELECT fecha_hora, equipo_local_id as equipo_id FROM partidos WHERE torneo_id = 'uuid-torneo'
  UNION ALL
  SELECT fecha_hora, equipo_visita_id FROM partidos WHERE torneo_id = 'uuid-torneo'
) t
GROUP BY fecha, equipo_id
HAVING COUNT(*) > 1;
-- Debe retornar 0 filas (ningún conflicto)

-- Verificar separación mínima entre partidos del mismo equipo
WITH partidos_equipo AS (
  SELECT 
    equipo_local_id as equipo_id,
    fecha_hora,
    LEAD(fecha_hora) OVER (PARTITION BY equipo_local_id ORDER BY fecha_hora) as siguiente_fecha
  FROM partidos WHERE torneo_id = 'uuid-torneo'
  UNION ALL
  SELECT 
    equipo_visita_id,
    fecha_hora,
    LEAD(fecha_hora) OVER (PARTITION BY equipo_visita_id ORDER BY fecha_hora)
  FROM partidos WHERE torneo_id = 'uuid-torneo'
)
SELECT equipo_id, fecha_hora, siguiente_fecha,
       (siguiente_fecha::date - fecha_hora::date) as dias_diferencia
FROM partidos_equipo
WHERE siguiente_fecha IS NOT NULL
AND (siguiente_fecha::date - fecha_hora::date) < 3;
-- Debe retornar 0 filas (todos los partidos tienen >= 3 días de separación)
```

**Validación en Response**:
- ✅ Status 200 OK
- ✅ Array con 15 partidos
- ✅ Cada partido tiene: torneoId, jornada, equipoLocalId, equipoVisitaId, fechaHora

#### Escenario 5.2: Reproducibilidad con Seed

**Pasos**:
1. Generar fixture con seed = 12345
2. Guardar resultado
3. Eliminar partidos generados
4. Generar fixture nuevamente con mismo seed = 12345

**Validación**:
- ✅ Ambos fixtures son idénticos
- ✅ Mismos enfrentamientos
- ✅ Mismas fechas y horarios
- ✅ Mismo orden

#### Escenario 5.3: Aleatorización sin Seed

**Pasos**:
1. Generar fixture sin seed
2. Eliminar partidos
3. Generar fixture nuevamente sin seed

**Validación**:
- ✅ Fixtures son diferentes
- ✅ Horarios varían
- ✅ Orden de local/visita puede variar
- ✅ Reglas de conflicto se respetan en ambos

#### Escenario 5.4: Error - Número Impar de Equipos

**Request**: 5 equipos (impar)

**Validación**:
- ✅ Backend retorna 400 Bad Request
- ✅ Mensaje: "El número de equipos debe ser par"
- ✅ No se crean partidos

#### Escenario 5.5: Error - Slots Insuficientes

**Request**: 
- 10 equipos (45 partidos)
- Solo 1 horario disponible
- Fecha inicio muy cercana

**Validación**:
- ✅ Backend retorna 400 Bad Request
- ✅ Mensaje indica conflicto de horarios
- ✅ Detalle del conflicto (qué equipo, qué fecha)

### 5.3 Validación de Integridad

**Después de Generar Fixture**:
```sql
-- Verificar que no hay partidos duplicados
SELECT equipo_local_id, equipo_visita_id, COUNT(*)
FROM partidos
WHERE torneo_id = 'uuid-torneo'
GROUP BY equipo_local_id, equipo_visita_id
HAVING COUNT(*) > 1;
-- Debe retornar 0 filas

-- Verificar que todos los horarios están en la lista permitida
SELECT DISTINCT fecha_hora::time
FROM partidos
WHERE torneo_id = 'uuid-torneo';
-- Debe retornar solo: 15:00, 17:00, 19:00
```


---

## 6. Flujo de Aplicación de Resoluciones Administrativas

### 6.1 Descripción del Flujo

**Tipos de Resoluciones**:
- **Descuento de Puntos**: Resta puntos en tabla de posiciones
- **Suspensión**: Suspende jugador por N partidos
- **W.O. Técnico**: Modifica resultado a 3-0
- **Multa**: Registra multa económica
- **Amonestación**: Advertencia oficial

**Estados**: borrador → emitida → apelada → resuelta → anulada

**Componentes Involucrados**:
- Backend (ResolucionesController, ResolucionesService)
- Base de Datos (resoluciones, posiciones, suspensiones, partidos)

### 6.2 Escenarios de Prueba

#### Escenario 6.1: Descuento de Puntos

**Pasos**:
1. Equipo tiene 15 puntos en tabla
2. Admin crea resolución:
```json
POST /api/resoluciones
{
  "tipo": "disciplinaria",
  "asunto": "Incumplimiento reglamentario",
  "motivo": "Alineación indebida de jugador suspendido",
  "sancionTipo": "descuento_puntos",
  "sancionValor": 3,
  "equipoId": "uuid-equipo",
  "estado": "emitida"
}
```

**Validación Inmediata**:
```sql
-- Verificar resolución creada
SELECT * FROM resoluciones WHERE equipo_id = 'uuid-equipo';
-- Debe tener: numero único (ej: RES-2025-001), estado='emitida'

-- Verificar puntos descontados
SELECT puntos FROM posiciones WHERE equipo_id = 'uuid-equipo';
-- Debe retornar: 12 (15 - 3)
```

**Validación en Frontend**:
- ✅ Tabla de posiciones muestra puntos actualizados
- ✅ Indicador visual de descuento (ej: asterisco *)
- ✅ Tooltip explica el descuento

#### Escenario 6.2: W.O. Técnico

**Setup**: Partido finalizado con resultado Real 2 - 1 Falso

**Pasos**:
1. Admin crea resolución de W.O. técnico:
```json
POST /api/resoluciones
{
  "tipo": "tecnica",
  "asunto": "W.O. por alineación indebida",
  "sancionTipo": "wo_tecnico",
  "equipoId": "uuid-equipo-perdedor",
  "partidoId": "uuid-partido",
  "estado": "emitida"
}
```

**Validación**:
```sql
-- Verificar resultado modificado
SELECT goles_local, goles_visita FROM partidos WHERE id = 'uuid-partido';
-- Debe retornar: 3 - 0 (a favor del equipo no sancionado)

-- Verificar posiciones recalculadas
-- El equipo sancionado pierde los puntos que había ganado
-- El equipo beneficiado gana 3 puntos
```

#### Escenario 6.3: Suspensión Administrativa

**Pasos**:
1. Admin crea resolución de suspensión:
```json
POST /api/resoluciones
{
  "tipo": "disciplinaria",
  "asunto": "Conducta violenta fuera del campo",
  "sancionTipo": "suspension",
  "sancionValor": 5,
  "jugadorId": "uuid-jugador",
  "estado": "emitida"
}
```

**Validación**:
```sql
-- Verificar suspensión creada
SELECT * FROM suspensiones 
WHERE jugador_id = 'uuid-jugador' 
AND tipo = 'resolucion_administrativa';
-- Debe retornar 1 fila con:
-- partidos_totales = 5
-- estado = 'activa'
```

#### Escenario 6.4: Anulación de Resolución

**Pasos**:
1. Resolución de descuento de puntos emitida (equipo tiene 12 puntos)
2. Admin anula la resolución:
```json
PATCH /api/resoluciones/{id}/estado
{
  "estado": "anulada"
}
```

**Validación**:
```sql
-- Verificar estado de resolución
SELECT estado FROM resoluciones WHERE id = 'uuid-resolucion';
-- Debe retornar: 'anulada'

-- Verificar puntos restaurados
SELECT puntos FROM posiciones WHERE equipo_id = 'uuid-equipo';
-- Debe retornar: 15 (puntos originales restaurados)
```

#### Escenario 6.5: Apelación de Resolución

**Pasos**:
1. Resolución emitida
2. Equipo apela:
```json
PATCH /api/resoluciones/{id}/estado
{
  "estado": "apelada"
}
```

**Validación**:
- ✅ Estado cambia a "apelada"
- ✅ Sanción se mantiene activa durante apelación
- ✅ Admin puede cambiar a "resuelta" después de revisar

### 6.3 Casos Edge

**Edge Case 1: Descuento Mayor a Puntos Actuales**
- Equipo tiene 2 puntos
- Descuento de 5 puntos
- ✅ Puntos quedan en 0 (no negativos)

**Edge Case 2: Múltiples Resoluciones al Mismo Equipo**
- ✅ Todas se aplican acumulativamente
- ✅ Historial completo visible

**Edge Case 3: Resolución sobre Partido No Finalizado**
- ✅ Backend retorna error
- ✅ Solo se pueden aplicar W.O. a partidos finalizados

### 6.4 Validación de Auditoría

```sql
-- Verificar que todas las resoluciones tienen número único
SELECT numero, COUNT(*) FROM resoluciones GROUP BY numero HAVING COUNT(*) > 1;
-- Debe retornar 0 filas

-- Verificar trazabilidad
SELECT r.numero, r.estado, r.fecha_emision, r.asunto, e.nombre as equipo_afectado
FROM resoluciones r
LEFT JOIN equipos e ON e.id = r.equipo_id
ORDER BY r.created_at DESC;
-- Debe mostrar historial completo
```


---

## 7. Matriz de Validación de Componentes

Esta matriz ayuda a verificar que todos los componentes del sistema interactúan correctamente en cada flujo crítico.

| Componente | Registro Gol | Finalización | Tabla Posiciones | Suspensiones | Fixture | Resoluciones |
|------------|--------------|--------------|------------------|--------------|---------|--------------|
| **App Planillero (PWA)** | ✅ Registra | ✅ Finaliza | - | - | - | - |
| **Backend API** | ✅ Valida y procesa | ✅ Valida y ejecuta | ✅ Sirve datos | ✅ Crea suspensiones | ✅ Genera | ✅ Aplica |
| **Base de Datos** | ✅ Almacena evento | ✅ Actualiza estado | ✅ Calcula posiciones | ✅ Registra | ✅ Inserta partidos | ✅ Modifica datos |
| **Triggers DB** | ✅ Actualiza stats | ✅ Ejecuta fn_actualizar | - | ✅ Verifica tarjetas | - | - |
| **SignalR Hub** | ✅ Broadcast evento | ✅ Notifica fin | ✅ Notifica cambio | - | - | - |
| **Frontend Portal** | ✅ Muestra en vivo | ✅ Actualiza estado | ✅ Recarga tabla | ✅ Muestra suspendidos | - | ✅ Muestra resoluciones |
| **Marcador Público** | ✅ Animación gol | ✅ Muestra final | - | - | - | - |

---

## 8. Checklist de Testing Completo

### 8.1 Flujo de Registro de Gol

- [ ] Gol con asistencia se registra correctamente
- [ ] Gol sin asistencia se registra correctamente
- [ ] Marcador se actualiza en base de datos
- [ ] Estadísticas de jugador se incrementan
- [ ] SignalR broadcast funciona
- [ ] Todos los clientes reciben actualización en < 2 segundos
- [ ] Animaciones se reproducen correctamente
- [ ] Validación de planillero asignado funciona
- [ ] Validación de estado partido funciona
- [ ] Múltiples goles consecutivos se registran sin duplicados

### 8.2 Flujo de Finalización de Partido

- [ ] Doble confirmación funciona correctamente
- [ ] Cancelación en primer modal no finaliza partido
- [ ] Cancelación en segundo modal no finaliza partido
- [ ] Estado cambia a "finalizado" en base de datos
- [ ] fn_actualizar_posiciones se ejecuta correctamente
- [ ] Posiciones de ambos equipos se actualizan
- [ ] Puntos se calculan correctamente (PG*3 + PE)
- [ ] Diferencia de goles se calcula correctamente
- [ ] Tabla de posiciones se actualiza en tiempo real
- [ ] Pantalla de resumen se muestra en App Planillero
- [ ] No se puede finalizar partido ya finalizado
- [ ] No se puede finalizar partido sin permisos

### 8.3 Flujo de Tabla de Posiciones

- [ ] Tabla se actualiza automáticamente sin refresh
- [ ] Orden de equipos se recalcula correctamente
- [ ] Criterios de desempate funcionan (Puntos → Diferencia → GF)
- [ ] Zona de clasificación se resalta correctamente
- [ ] Zona de descenso se resalta correctamente
- [ ] Animación de actualización es suave
- [ ] Datos coinciden con base de datos
- [ ] PJ = PG + PE + PP
- [ ] Puntos = PG*3 + PE
- [ ] Diferencia = GF - GC

### 8.4 Flujo de Suspensiones Automáticas

- [ ] 3 amarillas generan suspensión de 1 partido
- [ ] 1 roja genera suspensión de 2 partidos
- [ ] 2 amarillas en mismo partido = expulsión
- [ ] Suspensión se crea con estado "activa"
- [ ] Descuento automático funciona al finalizar partido
- [ ] Suspensión cambia a "cumplida" cuando se completa
- [ ] Jugador suspendido muestra advertencia en planilla
- [ ] Múltiples suspensiones se acumulan correctamente
- [ ] Historial de tarjetas es correcto

### 8.5 Flujo de Generación de Fixture

- [ ] Algoritmo Round-Robin funciona correctamente
- [ ] Número correcto de partidos generados (n*(n-1)/2)
- [ ] Cada equipo juega contra todos los demás
- [ ] No hay equipos jugando 2 veces el mismo día
- [ ] Separación mínima entre partidos se respeta
- [ ] Horarios se asignan de slots disponibles
- [ ] Reproducibilidad con seed funciona
- [ ] Aleatorización sin seed funciona
- [ ] Error con número impar de equipos
- [ ] Error con slots insuficientes

### 8.6 Flujo de Resoluciones Administrativas

- [ ] Descuento de puntos se aplica correctamente
- [ ] Tabla de posiciones refleja descuento
- [ ] W.O. técnico modifica resultado a 3-0
- [ ] Posiciones se recalculan después de W.O.
- [ ] Suspensión administrativa se crea
- [ ] Anulación de resolución revierte efectos
- [ ] Apelación cambia estado correctamente
- [ ] Número único de resolución se genera
- [ ] Historial de resoluciones es completo
- [ ] Auditoría de cambios funciona

---

## 9. Herramientas de Testing

### 9.1 Postman Collection

Crear colección con requests para:
- Registro de eventos
- Finalización de partidos
- Generación de fixture
- Creación de resoluciones

### 9.2 Scripts SQL de Validación

Guardar en `/database/testing/`:
- `validate_goal_flow.sql`
- `validate_match_finalization.sql`
- `validate_standings.sql`
- `validate_suspensions.sql`
- `validate_fixture.sql`
- `validate_resolutions.sql`

### 9.3 Cliente HTML de Prueba

Usar `docs/signalr-test-client.html` para testing manual de SignalR

### 9.4 Logs y Monitoreo

**Backend Logs**:
```bash
# Ver logs en tiempo real
cd SportZone.API
dotnet run | tee logs/test-$(date +%Y%m%d-%H%M%S).log
```

**Frontend Console**:
- Abrir DevTools > Console
- Filtrar por "SignalR" o "API"

**Base de Datos**:
- Supabase Dashboard > Logs
- Filtrar por tabla o función

---

## 10. Reporte de Resultados

### Plantilla de Reporte

```markdown
# Reporte de Testing de Flujos Críticos

**Fecha**: _______________
**Tester**: _______________
**Versión del Sistema**: _______________

## Resumen Ejecutivo

- Total de flujos probados: 6
- Flujos exitosos: ___
- Flujos con fallos: ___
- Severidad de fallos: ⬜ Crítica | ⬜ Alta | ⬜ Media | ⬜ Baja

## Resultados por Flujo

### 1. Registro de Gol
- Estado: ⬜ PASS | ⬜ FAIL
- Escenarios probados: ___/6
- Tiempo promedio de actualización: ___ ms
- Notas: _______________

### 2. Finalización de Partido
- Estado: ⬜ PASS | ⬜ FAIL
- Escenarios probados: ___/7
- Notas: _______________

### 3. Tabla de Posiciones
- Estado: ⬜ PASS | ⬜ FAIL
- Escenarios probados: ___/3
- Notas: _______________

### 4. Suspensiones Automáticas
- Estado: ⬜ PASS | ⬜ FAIL
- Escenarios probados: ___/4
- Notas: _______________

### 5. Generación de Fixture
- Estado: ⬜ PASS | ⬜ FAIL
- Escenarios probados: ___/5
- Notas: _______________

### 6. Resoluciones Administrativas
- Estado: ⬜ PASS | ⬜ FAIL
- Escenarios probados: ___/5
- Notas: _______________

## Problemas Encontrados

| # | Flujo | Descripción | Severidad | Estado |
|---|-------|-------------|-----------|--------|
| 1 | | | | |
| 2 | | | | |

## Recomendaciones

1. _______________
2. _______________
3. _______________

## Conclusión

⬜ Sistema listo para producción
⬜ Requiere correcciones menores
⬜ Requiere correcciones mayores

**Firma**: _______________
```

---

## 11. Próximos Pasos

Después de completar estos tests:

1. **Testing de Rendimiento**:
   - 1000+ usuarios concurrentes en SignalR
   - 10 eventos por segundo
   - 50 partidos en vivo simultáneos

2. **Testing de Seguridad**:
   - Intentos de acceso no autorizado
   - Inyección SQL
   - XSS en inputs

3. **Testing de Compatibilidad**:
   - Diferentes navegadores
   - Diferentes dispositivos
   - Diferentes resoluciones

4. **Testing de Recuperación**:
   - Caída de backend
   - Caída de base de datos
   - Pérdida de conexión

---

**Documento creado**: Febrero 2026  
**Última actualización**: Febrero 2026  
**Versión**: 1.0  
**Autor**: Equipo de QA SportZone Pro
