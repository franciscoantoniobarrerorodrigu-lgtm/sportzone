# Guía de Testing del Sistema SportZone Pro

## Estado General del Sistema

✅ **Backend API (.NET 8):** Funcionando en `http://localhost:5000`  
✅ **Frontend Angular 17:** Listo para desarrollo  
✅ **SignalR:** Implementado y probado  
✅ **Supabase:** Configurado con credenciales  
⚠️ **Firebase FCM:** Pendiente de credenciales (notificaciones push deshabilitadas)

---

## Funcionalidades Disponibles para Probar

### 1. Autenticación y Roles ✅

**Endpoint:** `POST /api/auth/login`

```bash
# Login como admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@sportzone.com\",\"password\":\"Admin123!\"}"
```

**Frontend:** `http://localhost:4200/login`

**Roles disponibles:**
- `admin`: Acceso total
- `planillero`: Acceso a app planillero
- `arbitro`: Solo lectura de tarjetas/suspensiones
- `publico`: Solo visualización

---

### 2. Tabla de Posiciones en Tiempo Real ✅

**Endpoint:** `GET /api/liga/posiciones/{torneoId}`

```bash
curl http://localhost:5000/api/liga/posiciones/{torneoId}
```

**Frontend:** `http://localhost:4200/liga`

**Características:**
- Actualización automática al finalizar partidos
- Cálculo de: PJ, PG, PE, PP, GF, GC, Puntos, Diferencia
- Resaltado de zonas (clasificación en verde, descenso en rojo)
- Ordenamiento: Puntos → Diferencia → GF

---

### 3. Ranking de Goleadores ✅

**Endpoint:** `GET /api/goleadores/{torneoId}`

```bash
curl http://localhost:5000/api/goleadores/{torneoId}
```

**Frontend:** `http://localhost:4200/goleadores`

**Características:**
- Tabs: Goleadores, Asistidores, Tarjetas
- Medallas oro/plata/bronce para top 3
- Barra de progreso proporcional
- Actualización en tiempo real

---

### 4. Cronograma de Partidos ✅

**Endpoint:** `GET /api/partidos/proximos`

```bash
curl http://localhost:5000/api/partidos/proximos
```

**Frontend:** `http://localhost:4200/cronograma`

**Características:**
- Partidos agrupados por jornada
- Filtros por torneo y equipo
- Estados: programado, en_curso, finalizado

---

### 5. Partido en Vivo con SignalR ✅

**Endpoint SignalR:** `/partidoHub`

**Frontend:** `http://localhost:4200/partidos/{id}/live`

**Características:**
- Marcador en tiempo real
- Cronómetro sincronizado
- Timeline de eventos
- Animaciones para goles y tarjetas
- Indicador "EN VIVO" parpadeante

**Eventos SignalR:**
- `SuscribirPartido(partidoId)`
- `DesuscribirPartido(partidoId)`
- `EventoPartido` (recibir)
- `ActualizarMarcador` (recibir)
- `ActualizarMinuto` (recibir)

---

### 6. Marcador Público (Pantalla Grande) ✅

**Frontend:** `http://localhost:4200/partidos/{id}/marcador-publico`

**Características:**
- Optimizado para proyección
- Números de goles en 120px+
- Cronómetro en 60px
- Notificaciones animadas de eventos
- Botón de pantalla completa (Fullscreen API)

---

### 7. App Planillero (PWA) ✅

**Frontend:** `http://localhost:4200/planillero`

**Características:**
- Interfaz optimizada para tablet
- Botones grandes (80x80px mínimo)
- Cronómetro gigante (80px) en amarillo
- Registro de eventos: GOL, TARJETA AMARILLA, TARJETA ROJA, SUSTITUCIÓN
- Doble confirmación para finalizar partido
- Validación de planillero asignado

**Flujo de uso:**
1. Login como planillero
2. Se carga automáticamente el partido asignado
3. Iniciar partido
4. Registrar eventos
5. Finalizar partido (doble confirmación)

---

### 8. Generación Automática de Fixture ✅

**Endpoint:** `POST /api/partidos/generar-fixture`

```bash
curl -X POST http://localhost:5000/api/partidos/generar-fixture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d "{
    \"torneoId\": \"{guid}\",
    \"fechaInicio\": \"2026-03-01\",
    \"diasEntreFechas\": 7,
    \"horariosDisponibles\": [\"15:00\", \"17:00\", \"19:00\"],
    \"seed\": 12345
  }"
```

**Características:**
- Algoritmo Round-Robin
- Sin conflictos (mismo equipo no juega 2 veces el mismo día)
- Mínimo 3 días entre partidos del mismo equipo
- Asignación aleatoria de horarios
- Reproducible con seed

---

### 9. Sistema de Suspensiones Automáticas ✅

**Reglas:**
- 3 tarjetas amarillas = 1 partido de suspensión
- 1 tarjeta roja = 2 partidos de suspensión
- 2 amarillas en el mismo partido = expulsión (equivalente a roja)

**Endpoint:** `GET /api/suspensiones/activas/{equipoId}`

```bash
curl http://localhost:5000/api/suspensiones/activas/{equipoId}
```

**Características:**
- Verificación automática al finalizar partido
- Descuento automático en siguientes partidos
- Historial completo de tarjetas

---

### 10. Sistema de Resoluciones Administrativas ✅

**Endpoint:** `POST /api/resoluciones`

```bash
curl -X POST http://localhost:5000/api/resoluciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d "{
    \"tipo\": \"descuento_puntos\",
    \"equipoId\": \"{guid}\",
    \"puntos\": 3,
    \"motivo\": \"Incumplimiento reglamentario\"
  }"
```

**Tipos de resoluciones:**
- `descuento_puntos`: Resta puntos en la tabla
- `suspension`: Suspende jugador por N partidos
- `tecnica`: Modifica resultado a W.O. (3-0)
- `multa`: Registra multa económica

**Estados:**
- `borrador` → `emitida` → `apelada` → `resuelta` → `anulada`

---

## Funcionalidades NO Disponibles (Requieren Firebase)

❌ **Notificaciones Push Móviles**
- Notificaciones de goles
- Notificaciones de tarjetas rojas
- Notificaciones de inicio/fin de partido
- Notificaciones de medio tiempo

**Motivo:** Pendiente de credenciales de Firebase Cloud Messaging  
**Ver:** `docs/FIREBASE_SETUP_PENDIENTE.md`

---

## Flujo de Testing Completo

### Escenario 1: Partido Completo desde Cero

1. **Crear torneo** (Admin)
2. **Crear equipos** (Admin)
3. **Crear jugadores** (Admin)
4. **Generar fixture** (Admin)
5. **Asignar planillero a partido** (Admin)
6. **Login como planillero**
7. **Iniciar partido** (Planillero)
8. **Registrar eventos:** goles, tarjetas, sustituciones (Planillero)
9. **Finalizar partido** (Planillero - doble confirmación)
10. **Verificar tabla de posiciones actualizada** (Público)
11. **Verificar ranking de goleadores actualizado** (Público)
12. **Verificar suspensiones generadas** (Admin)

### Escenario 2: Visualización en Tiempo Real

1. **Abrir marcador público** en navegador 1: `/partidos/{id}/marcador-publico`
2. **Abrir partido live** en navegador 2: `/partidos/{id}/live`
3. **Abrir app planillero** en navegador 3: `/planillero`
4. **Registrar gol** desde planillero
5. **Verificar actualización instantánea** en marcador público y partido live (SignalR)

### Escenario 3: Suspensiones Automáticas

1. **Registrar 3 tarjetas amarillas** a un jugador en diferentes partidos
2. **Finalizar el tercer partido**
3. **Verificar suspensión automática** generada
4. **Verificar que el jugador aparece suspendido** en el siguiente partido

---

## Herramientas de Testing

### Testing de SignalR

Ver: `docs/TESTING_SIGNALR.md`

Cliente HTML de prueba: `docs/signalr-test-client.html`

### Testing de Tabla de Posiciones

Ver: `docs/TESTING_TABLA_POSICIONES.md`

### Testing de Login

Ver: `docs/TESTING_LOGIN_FLOW.md`

### Testing de Goleadores

Ver: `docs/TESTING_GOLEADORES.md`

---

## Base de Datos

### Scripts SQL Disponibles

Ubicación: `/database/`

1. `01_extensions.sql` - Extensiones de PostgreSQL
2. `02_tables_core.sql` - Temporadas, torneos, equipos, jugadores
3. `03_tables_partidos.sql` - Partidos, eventos, posiciones, estadísticas
4. `04_tables_admin.sql` - Solicitudes, resoluciones, suspensiones
5. `05_tables_notificaciones.sql` - Suscripciones, dispositivos FCM
6. `06_tables_marketing.sql` - Campañas, patrocinadores
7. `07_views.sql` - Vistas (goleadores, posiciones, partidos completos)
8. `08_functions.sql` - Funciones (actualizar posiciones, verificar suspensiones)
9. `09_triggers.sql` - Triggers (actualizar estadísticas)
10. `10_rls.sql` - Row Level Security
11. `11_indexes.sql` - Índices de rendimiento
12. `12_seed_data.sql` - Datos de prueba (opcional)
13. `13_auth_roles.sql` - Sistema de roles
14. `14_assign_roles.sql` - Asignación de roles

### Ejecutar Scripts

1. Ir a Supabase Dashboard → SQL Editor
2. Ejecutar scripts en orden (01 → 14)
3. O ejecutar `00_install_all.sql` para instalar todo de una vez

---

## Comandos Útiles

### Backend

```cmd
# Iniciar backend
cd SportZone.API
dotnet run

# Ver logs en tiempo real
# Los logs aparecen en la consola

# Compilar
dotnet build

# Limpiar y recompilar
dotnet clean
dotnet build
```

### Frontend

```cmd
# Iniciar frontend
cd sportzone-web
npm start

# Compilar para producción
npm run build

# Ejecutar tests
npm test
```

---

## Próximos Pasos

1. ✅ Sistema funcionando sin Firebase
2. ⏳ Resolver credenciales de Firebase
3. ⏳ Configurar Firebase Cloud Messaging
4. ⏳ Probar notificaciones push
5. ⏳ Testing de rendimiento (1000+ usuarios concurrentes)
6. ⏳ Testing de seguridad (intentos de acceso no autorizado)
7. ⏳ Deployment a producción

---

## Soporte

Para más información sobre cada funcionalidad, consulta los documentos específicos en `/docs/`.

**Fecha de actualización:** Febrero 2026
