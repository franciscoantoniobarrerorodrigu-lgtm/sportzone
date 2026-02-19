# Test de Integración SignalR - SportZone Pro

## Objetivo
Verificar que la comunicación en tiempo real vía SignalR funciona correctamente entre backend y múltiples clientes frontend.

## Pre-requisitos

### 1. Backend Configurado
```bash
cd SportZone.API
dotnet run
# Debe estar en http://localhost:5000
# SignalR Hub en http://localhost:5000/hubs/partido
```

### 2. Frontend Configurado
```bash
cd sportzone-web
npm start
# Debe estar en http://localhost:4200
```

### 3. Verificar Configuración SignalR

**Backend** (`Program.cs`):
```csharp
// Debe tener:
builder.Services.AddSignalR();
app.MapHub<PartidoHub>("/hubs/partido");
```

**Frontend** (`environment.ts`):
```typescript
signalRUrl: 'http://localhost:5000/hubs'
```

## Test 1: Conexión de Múltiples Clientes

### Objetivo
Verificar que múltiples clientes pueden conectarse simultáneamente al hub de SignalR.

### Pasos

1. **Abrir 3 ventanas de navegador** (o tabs en modo incógnito)
2. En cada ventana, navegar a `http://localhost:4200/partido-live/[partido-id]`
3. Abrir DevTools (F12) > Console en cada ventana

### Verificación

**En Backend (logs)**:
```
Cliente conectado: [ConnectionId-1]
Cliente conectado: [ConnectionId-2]
Cliente conectado: [ConnectionId-3]
```

**En Frontend (console de cada ventana)**:
```
SignalR connected to partido
```

### Resultado Esperado
- ✅ Cada cliente recibe un ConnectionId único
- ✅ Todos los clientes muestran `isConnected = true`
- ✅ No hay errores de conexión
- ✅ Backend registra 3 conexiones diferentes

### Comandos de Verificación

**En console del navegador**:
```javascript
// Verificar estado de conexión
console.log('Connected:', window.signalRService?.isConnected());
```

---

## Test 2: Broadcast de Eventos

### Objetivo
Verificar que cuando ocurre un evento, todos los clientes suscritos lo reciben.

### Pasos

1. **Preparar 3 clientes** conectados al mismo partido
2. **Desde App Planillero** (o Postman), registrar un gol:
   ```http
   POST http://localhost:5000/api/partidos/{partidoId}/eventos
   Content-Type: application/json
   Authorization: Bearer {token}

   {
     "tipo": "gol",
     "equipoId": "uuid-equipo",
     "jugadorId": "uuid-jugador",
     "minuto": 15
   }
   ```

### Verificación

**En los 3 clientes (console)**:
```
Nuevo evento: { partidoId: "...", tipo: "gol", ... }
Marcador actualizado: { partidoId: "...", golesLocal: 1, golesVisita: 0 }
```

**En la UI de los 3 clientes**:
- ✅ Marcador se actualiza automáticamente
- ✅ Timeline de eventos muestra el nuevo gol
- ✅ Animación de gol se reproduce
- ✅ Actualización ocurre en < 1 segundo

### Resultado Esperado
- ✅ TODOS los clientes reciben el evento simultáneamente
- ✅ Marcador se actualiza en todos los clientes
- ✅ No hay clientes que se queden sin actualizar

---

## Test 3: Reconexión Automática

### Objetivo
Verificar que cuando se pierde la conexión, SignalR intenta reconectar automáticamente.

### Pasos

1. **Cliente conectado** a un partido en vivo
2. **Detener el backend**:
   ```bash
   # En terminal del backend, presionar Ctrl+C
   ```
3. **Observar console del navegador**
4. **Reiniciar el backend**:
   ```bash
   dotnet run
   ```
5. **Observar console del navegador**

### Verificación

**Cuando se detiene el backend**:
```
SignalR reconnecting...
isConnected: false
```

**Cuando se reinicia el backend**:
```
SignalR reconnected
isConnected: true
Cliente conectado: [nuevo-ConnectionId]
```

### Resultado Esperado
- ✅ Cliente detecta desconexión inmediatamente
- ✅ Cliente intenta reconectar automáticamente
- ✅ Cliente se reconecta exitosamente al reiniciar backend
- ✅ Suscripciones se mantienen después de reconexión
- ✅ No se requiere refresh manual de la página

---

## Test 4: Suscripción a Grupos (Partidos Específicos)

### Objetivo
Verificar que los clientes solo reciben eventos de los partidos a los que están suscritos.

### Pasos

1. **Cliente A**: Suscrito al Partido 1
2. **Cliente B**: Suscrito al Partido 2
3. **Registrar gol en Partido 1**

### Verificación

**Cliente A (console)**:
```
Suscrito al partido: partido-1
Nuevo evento: { partidoId: "partido-1", tipo: "gol" }
Marcador actualizado
```

**Cliente B (console)**:
```
Suscrito al partido: partido-2
(No recibe ningún evento del Partido 1)
```

### Resultado Esperado
- ✅ Cliente A recibe evento del Partido 1
- ✅ Cliente B NO recibe evento del Partido 1
- ✅ Grupos de SignalR funcionan correctamente
- ✅ No hay "cross-talk" entre partidos

---

## Test 5: Actualización de Minuto en Tiempo Real

### Objetivo
Verificar que el cronómetro se sincroniza en todos los clientes.

### Pasos

1. **3 clientes** viendo el mismo partido
2. **Desde App Planillero**, actualizar minuto cada 30 segundos
3. **Observar cronómetro** en los 3 clientes

### Verificación

**En los 3 clientes**:
- ✅ Cronómetro muestra el mismo minuto
- ✅ Actualización es instantánea (< 500ms)
- ✅ No hay desfase entre clientes
- ✅ Formato MM:SS correcto

### Resultado Esperado
- ✅ Todos los clientes sincronizados
- ✅ Actualización suave sin parpadeos
- ✅ Minuto se actualiza en tiempo real

---

## Test 6: Rendimiento con 100+ Usuarios Concurrentes

### Objetivo
Verificar que el sistema maneja alta carga de usuarios simultáneos.

### Herramienta
Usar **Artillery** o **k6** para simular carga.

### Script de Prueba (Artillery)

```yaml
# artillery-signalr-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Ramp up to 100 users"
    - duration: 120
      arrivalRate: 20
      name: "Sustained load"
  processor: "./signalr-processor.js"

scenarios:
  - name: "Connect and subscribe"
    engine: socketio
    flow:
      - connect:
          url: "/hubs/partido"
      - emit:
          channel: "SuscribirPartido"
          data: "partido-test-id"
      - think: 60
```

### Métricas a Verificar

**Backend**:
- ✅ CPU < 70%
- ✅ Memoria < 1GB
- ✅ Tiempo de respuesta < 100ms
- ✅ Sin errores de conexión

**Frontend**:
- ✅ Eventos se entregan en < 2 segundos
- ✅ No hay pérdida de mensajes
- ✅ UI permanece responsive

### Resultado Esperado
- ✅ Sistema maneja 100+ conexiones simultáneas
- ✅ Latencia se mantiene baja
- ✅ No hay degradación de rendimiento

---

## Test 7: Manejo de Desconexión de Cliente

### Objetivo
Verificar que el backend limpia recursos cuando un cliente se desconecta.

### Pasos

1. **Cliente conectado** y suscrito a un partido
2. **Cerrar la pestaña del navegador** (no solo navegar a otra página)
3. **Observar logs del backend**

### Verificación

**Backend (logs)**:
```
Cliente desconectado: [ConnectionId]
```

### Resultado Esperado
- ✅ Backend detecta desconexión
- ✅ Recursos se limpian (grupos, suscripciones)
- ✅ No hay memory leaks
- ✅ ConnectionId se libera

---

## Test 8: Eventos en Orden Cronológico

### Objetivo
Verificar que múltiples eventos simultáneos se entregan en orden correcto.

### Pasos

1. **Registrar 5 eventos rápidamente** (< 1 segundo entre cada uno):
   - Minuto 10: Gol equipo local
   - Minuto 11: Tarjeta amarilla
   - Minuto 12: Gol equipo visita
   - Minuto 13: Sustitución
   - Minuto 14: Tarjeta roja

2. **Observar timeline** en cliente

### Verificación

**Timeline en cliente**:
```
14' - Tarjeta roja
13' - Sustitución
12' - Gol equipo visita
11' - Tarjeta amarilla
10' - Gol equipo local
```

### Resultado Esperado
- ✅ Eventos se muestran en orden cronológico correcto
- ✅ No hay eventos duplicados
- ✅ No se pierden eventos
- ✅ Timestamps son correctos

---

## Test 9: Compatibilidad Cross-Browser

### Objetivo
Verificar que SignalR funciona en diferentes navegadores.

### Navegadores a Probar
- ✅ Chrome (última versión)
- ✅ Firefox (última versión)
- ✅ Safari (última versión)
- ✅ Edge (última versión)

### Verificación en Cada Navegador
- ✅ Conexión exitosa
- ✅ Recepción de eventos
- ✅ Reconexión automática
- ✅ Sin errores en console

---

## Test 10: Fallback a Long Polling

### Objetivo
Verificar que si WebSocket falla, SignalR usa long polling como fallback.

### Pasos

1. **Bloquear WebSocket** en DevTools:
   - Chrome: DevTools > Network > WS (desactivar)
2. **Conectar cliente**
3. **Observar Network tab**

### Verificación

**Network tab**:
- ✅ Requests a `/hubs/partido/negotiate`
- ✅ Requests periódicos de polling
- ✅ Eventos se reciben correctamente

### Resultado Esperado
- ✅ SignalR detecta que WebSocket no está disponible
- ✅ Automáticamente usa long polling
- ✅ Funcionalidad se mantiene (aunque más lento)

---

## Herramientas de Debugging

### 1. SignalR Logging en Frontend

```typescript
// En signalr.service.ts, agregar:
.configureLogging(signalR.LogLevel.Debug)
```

### 2. Backend Logging

```json
// En appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.AspNetCore.SignalR": "Debug",
      "Microsoft.AspNetCore.Http.Connections": "Debug"
    }
  }
}
```

### 3. Chrome DevTools

- **Network > WS**: Ver mensajes WebSocket
- **Console**: Ver logs de SignalR
- **Application > Storage**: Ver estado de conexión

---

## Checklist de Verificación

### Conexión
- [ ] Múltiples clientes pueden conectarse simultáneamente
- [ ] Cada cliente recibe ConnectionId único
- [ ] Estado de conexión se refleja correctamente en UI

### Broadcast
- [ ] Eventos se transmiten a todos los clientes suscritos
- [ ] Marcador se actualiza en tiempo real
- [ ] Timeline de eventos se actualiza automáticamente

### Reconexión
- [ ] Cliente detecta desconexión
- [ ] Cliente intenta reconectar automáticamente
- [ ] Reconexión exitosa sin refresh manual

### Grupos
- [ ] Clientes solo reciben eventos de partidos suscritos
- [ ] No hay cross-talk entre partidos
- [ ] Suscripción/desuscripción funciona correctamente

### Rendimiento
- [ ] Sistema maneja 100+ conexiones simultáneas
- [ ] Latencia < 2 segundos
- [ ] Sin pérdida de mensajes

### Limpieza
- [ ] Recursos se limpian al desconectar
- [ ] No hay memory leaks
- [ ] Backend maneja desconexiones correctamente

---

## Problemas Comunes

### Error: "Failed to start connection"
**Solución**: 
- Verificar que backend está corriendo
- Verificar URL en `environment.ts`
- Verificar CORS en `Program.cs`

### Error: "WebSocket connection failed"
**Solución**:
- Verificar que puerto 5000 está abierto
- Verificar firewall
- SignalR debería usar long polling como fallback

### Eventos no se reciben
**Solución**:
- Verificar que cliente está suscrito al grupo correcto
- Verificar que backend está haciendo broadcast al grupo correcto
- Verificar logs del backend

### Reconexión no funciona
**Solución**:
- Verificar que `.withAutomaticReconnect()` está configurado
- Verificar que no hay errores en console
- Verificar que backend acepta reconexiones

---

## Resultado del Test

**Fecha**: _________________

**Tester**: _________________

**Estado**: ⬜ PASS | ⬜ FAIL

**Notas**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Métricas de Rendimiento**:
- Usuarios concurrentes probados: _______
- Latencia promedio: _______ ms
- Eventos perdidos: _______
- Tiempo de reconexión: _______ ms

