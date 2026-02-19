# Guía de Modo Offline - App Planillero

## Descripción General

El modo offline permite a los planilleros registrar eventos de partido incluso cuando la conexión a internet es inestable o se pierde temporalmente. Los eventos se almacenan localmente y se sincronizan automáticamente cuando la conexión se restaura.

## Características Principales

### 1. Caché de Datos del Partido

- **Almacenamiento**: Los datos del partido se guardan en IndexedDB
- **TTL (Time To Live)**: 2 horas por defecto
- **Contenido cacheado**:
  - Información del partido (equipos, marcador, estado)
  - Lista de jugadores de ambos equipos
  - Eventos registrados hasta el momento
  - Minuto actual del partido

### 2. Cola de Eventos Offline

- **Almacenamiento persistente**: IndexedDB
- **Información guardada por evento**:
  - ID único del evento
  - ID del partido
  - Datos del evento (tipo, minuto, jugador, equipo)
  - Timestamp de creación
  - Contador de reintentos
  - Estado (pending, syncing, failed)

### 3. Sincronización Automática

- **Trigger**: Se activa automáticamente cuando se detecta conexión
- **Estrategia**: Exponential backoff para reintentos
- **Reintentos**: Máximo 3 intentos por evento
- **Orden**: Los eventos se sincronizan en orden cronológico

## Arquitectura

### Servicios Implementados

#### 1. IndexedDBService
```typescript
// Ubicación: src/app/core/services/indexed-db.service.ts

// Métodos principales:
- cachePartido(partidoId, data, ttlMinutes)
- getCachedPartido(partidoId)
- queueEvent(partidoId, evento)
- getQueuedEvents(partidoId)
- updateEventStatus(eventId, status)
- deleteQueuedEvent(eventId)
```

#### 2. ConnectivityService
```typescript
// Ubicación: src/app/core/services/connectivity.service.ts

// Signals:
- isOnline: boolean
- isOffline: boolean
- connectionType: string
- connectionQuality: 'offline' | 'good' | 'fair' | 'poor'

// Métodos:
- onConnectionRestored(callback)
- onConnectionLost(callback)
- checkConnection()
- getStatusText()
- getStatusIcon()
```

#### 3. OfflineSyncService
```typescript
// Ubicación: src/app/core/services/offline-sync.service.ts

// Signals:
- isSyncing: boolean
- pendingEventsCount: number
- lastSyncTime: number | null
- syncErrors: string[]

// Métodos:
- queueEvent(partidoId, evento)
- syncQueuedEvents(partidoId?)
- manualSync(partidoId?)
- getPendingEvents(partidoId?)
- retryFailedEvents(partidoId?)
```

## Flujo de Trabajo

### Escenario 1: Registro de Evento Online

```
1. Usuario registra evento (gol, tarjeta, etc.)
2. PlanilleroComponent detecta conexión online
3. Evento se envía directamente al backend
4. Backend responde con éxito
5. UI se actualiza con datos del servidor
```

### Escenario 2: Registro de Evento Offline

```
1. Usuario registra evento
2. PlanilleroComponent detecta conexión offline
3. Evento se guarda en IndexedDB (cola)
4. UI se actualiza optimísticamente (local)
5. Se muestra indicador "sin conexión"
6. Contador de eventos pendientes se incrementa
```

### Escenario 3: Recuperación de Conexión

```
1. ConnectivityService detecta evento 'online'
2. Se dispara callback de conexión restaurada
3. OfflineSyncService inicia sincronización automática
4. Eventos se envían al backend uno por uno
5. Eventos exitosos se eliminan de la cola
6. Eventos fallidos se marcan para reintento
7. UI se actualiza con datos sincronizados
8. Se muestra notificación de sincronización completa
```

## Interfaz de Usuario

### Barra de Estado de Conectividad

La barra superior muestra:

- **🟢 Online**: Conexión estable
  - Color: Verde
  - Texto: "Conexión estable"

- **🔴 Offline**: Sin conexión
  - Color: Rojo
  - Texto: "Sin conexión"
  - Animación: Pulso para llamar la atención

- **⚠️ Eventos Pendientes**: Badge amarillo
  - Muestra: "X eventos pendientes"
  - Visible cuando hay eventos en cola

- **🔄 Sincronizando**: Indicador azul
  - Muestra: Spinner + "Sincronizando..."
  - Visible durante sincronización activa

- **Botón Manual**: "🔄 Sincronizar Ahora"
  - Visible cuando: Online + Eventos pendientes + No sincronizando
  - Acción: Dispara sincronización manual

### Actualización Optimista

Cuando se registra un evento offline:

1. El evento aparece inmediatamente en la timeline
2. El marcador se actualiza localmente (si es gol)
3. Se muestra mensaje: "GOL registrado (sin conexión)"
4. El evento tiene un ID temporal hasta sincronizar

## Manejo de Conflictos

### Partido Finalizado

Si el partido se finaliza mientras hay eventos pendientes:

```typescript
// El servicio verifica el estado antes de sincronizar
const hasConflict = await offlineSync.checkSyncConflicts(partidoId);

if (hasConflict) {
  // Mostrar advertencia al usuario
  // Opción de descartar eventos pendientes
}
```

### Eventos Duplicados

- Cada evento tiene un ID único generado localmente
- El backend debe validar y prevenir duplicados
- Se recomienda usar idempotency keys

### Reintentos Fallidos

Después de 3 intentos fallidos:

1. Evento se marca como 'failed'
2. Se agrega a la lista de errores de sincronización
3. Usuario puede:
   - Ver detalles del error
   - Reintentar manualmente
   - Descartar el evento

## Configuración

### Parámetros Ajustables

```typescript
// En OfflineSyncService
private maxRetries = 3;           // Máximo de reintentos
private retryDelay = 1000;        // Delay inicial (ms)

// En IndexedDBService
const defaultTTL = 120;           // TTL de caché (minutos)

// Exponential backoff
const delay = retryDelay * Math.pow(2, retryCount);
// Intento 1: 1s
// Intento 2: 2s
// Intento 3: 4s
```

## Testing

### Tests Unitarios

```bash
# Ejecutar tests de servicios offline
ng test --include='**/*indexed-db.service.spec.ts'
ng test --include='**/*connectivity.service.spec.ts'
ng test --include='**/*offline-sync.service.spec.ts'
```

### Tests de Integración

1. **Simular pérdida de conexión**:
   ```javascript
   // En DevTools Console
   window.dispatchEvent(new Event('offline'));
   ```

2. **Simular recuperación de conexión**:
   ```javascript
   window.dispatchEvent(new Event('online'));
   ```

3. **Inspeccionar IndexedDB**:
   - DevTools > Application > Storage > IndexedDB
   - Base de datos: `SportZonePlanillero`
   - Tablas: `partidos`, `eventQueue`

### Escenarios de Prueba

#### Prueba 1: Registro Offline Básico
```
1. Abrir app planillero
2. Activar modo offline (DevTools > Network > Offline)
3. Registrar 3 eventos (2 goles, 1 tarjeta)
4. Verificar que aparecen en la UI
5. Verificar contador "3 eventos pendientes"
6. Desactivar modo offline
7. Verificar sincronización automática
8. Verificar que eventos se eliminan de la cola
```

#### Prueba 2: Caché de Partido
```
1. Cargar partido con conexión
2. Activar modo offline
3. Recargar página
4. Verificar que partido se carga desde caché
5. Verificar mensaje "📦 Loading match from cache"
```

#### Prueba 3: Sincronización Manual
```
1. Registrar eventos offline
2. Recuperar conexión (no sincronizar auto)
3. Click en botón "Sincronizar Ahora"
4. Verificar progreso de sincronización
5. Verificar mensaje de éxito
```

#### Prueba 4: Manejo de Errores
```
1. Registrar eventos offline
2. Modificar backend para retornar error 500
3. Recuperar conexión
4. Verificar reintentos con backoff
5. Verificar que eventos se marcan como 'failed'
6. Verificar lista de errores
```

## Limitaciones Conocidas

1. **Finalización de Partido**: No se puede finalizar un partido offline
2. **Inicio de Partido**: Requiere conexión para iniciar
3. **Medio Tiempo**: Requiere conexión para marcar
4. **Sincronización de Minuto**: Se pausa cuando está offline
5. **Caché Expiration**: Después de 2 horas, se requiere conexión

## Mejoras Futuras

### Prioridad Alta
- [ ] Soporte para finalizar partido offline
- [ ] Resolución automática de conflictos
- [ ] Notificaciones push cuando se completa sincronización

### Prioridad Media
- [ ] Compresión de datos en IndexedDB
- [ ] Sincronización en background con Service Worker
- [ ] Estadísticas de uso offline

### Prioridad Baja
- [ ] Exportar eventos pendientes a JSON
- [ ] Importar eventos desde archivo
- [ ] Dashboard de métricas offline

## Troubleshooting

### Problema: Eventos no se sincronizan

**Solución**:
1. Verificar conexión: DevTools > Network
2. Verificar cola: DevTools > Application > IndexedDB > eventQueue
3. Verificar errores: Console logs
4. Intentar sincronización manual

### Problema: Caché no funciona

**Solución**:
1. Verificar IndexedDB: Application > IndexedDB > partidos
2. Verificar TTL no expirado
3. Limpiar caché: `indexedDB.clearAllData()`
4. Recargar partido con conexión

### Problema: UI no actualiza después de sincronizar

**Solución**:
1. Verificar que `cargarPartido()` se llama después de sync
2. Verificar signals se actualizan correctamente
3. Forzar recarga: F5

## Soporte

Para reportar bugs o solicitar features relacionadas con el modo offline:

1. Crear issue en el repositorio
2. Incluir:
   - Pasos para reproducir
   - Logs de consola
   - Estado de IndexedDB (screenshot)
   - Versión del navegador
   - Tipo de dispositivo

## Referencias

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
