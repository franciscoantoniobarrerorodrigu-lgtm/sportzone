# Guía de Testing de Seguridad - SportZone Pro

## Índice

1. [Introducción](#introducción)
2. [Testing de Autenticación JWT](#testing-de-autenticación-jwt)
3. [Testing de Autorización por Roles](#testing-de-autorización-por-roles)
4. [Testing de Row Level Security (RLS)](#testing-de-row-level-security-rls)
5. [Testing de Validación de Planillero Asignado](#testing-de-validación-de-planillero-asignado)
6. [Testing de Accesos No Autorizados](#testing-de-accesos-no-autorizados)
7. [Checklist de Seguridad](#checklist-de-seguridad)
8. [Herramientas Recomendadas](#herramientas-recomendadas)

---

## Introducción

Este documento proporciona una guía completa para realizar pruebas de seguridad en el sistema SportZone Pro. El sistema implementa múltiples capas de seguridad:

- **Autenticación JWT** con Supabase Auth
- **Autorización basada en roles** (admin, planillero, árbitro, público)
- **Row Level Security (RLS)** en PostgreSQL
- **Validación de planillero asignado** para operaciones de partido
- **Políticas de CORS** configuradas

### Roles del Sistema

| Rol | Permisos | Casos de Uso |
|-----|----------|--------------|
| **admin** | Acceso total al sistema | Gestión de torneos, equipos, resoluciones, fixture |
| **planillero** | Registro de eventos de partido asignado | Registrar goles, tarjetas, iniciar/finalizar partidos |
| **arbitro** | Solo lectura de suspensiones y tarjetas | Consultar historial disciplinario |
| **publico** | Solo lectura de datos públicos | Ver posiciones, goleadores, cronograma |

---

## Testing de Autenticación JWT

### 1.1 Validación de Token JWT

**Objetivo:** Verificar que el sistema valida correctamente los tokens JWT de Supabase.

#### Test Case 1.1.1: Acceso sin token
```bash
# Request sin Authorization header
curl -X POST http://localhost:5000/api/partidos/123e4567-e89b-12d3-a456-426614174000/iniciar

# Resultado esperado: 401 Unauthorized
```


#### Test Case 1.1.2: Token inválido
```bash
# Request con token malformado
curl -X POST http://localhost:5000/api/partidos/123e4567-e89b-12d3-a456-426614174000/iniciar \
  -H "Authorization: Bearer token_invalido_123"

# Resultado esperado: 401 Unauthorized
```

#### Test Case 1.1.3: Token expirado
```bash
# Usar un token JWT que ya expiró
curl -X POST http://localhost:5000/api/partidos/123e4567-e89b-12d3-a456-426614174000/iniciar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.xxx"

# Resultado esperado: 401 Unauthorized con mensaje "Token expired"
```

#### Test Case 1.1.4: Token con firma incorrecta
```bash
# Token con payload válido pero firma incorrecta
# Generar token con secret diferente al configurado
curl -X POST http://localhost:5000/api/partidos/123e4567-e89b-12d3-a456-426614174000/iniciar \
  -H "Authorization: Bearer [token_con_firma_incorrecta]"

# Resultado esperado: 401 Unauthorized
```

#### Test Case 1.1.5: Token válido
```bash
# Obtener token válido de Supabase
# 1. Login en Supabase
curl -X POST https://[tu-proyecto].supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: [SUPABASE_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "planillero@test.com",
    "password": "password123"
  }'

# 2. Usar el access_token obtenido
curl -X POST http://localhost:5000/api/partidos/123e4567-e89b-12d3-a456-426614174000/iniciar \
  -H "Authorization: Bearer [access_token]"

# Resultado esperado: 200 OK o 403 Forbidden (dependiendo del rol)
```

### 1.2 Validación de Claims del Token

**Objetivo:** Verificar que el sistema extrae y valida correctamente los claims del token JWT.

#### Test Case 1.2.1: Token sin claim 'role'
```javascript
// Crear token JWT sin el claim 'role' en user_metadata
// Esto simula un usuario sin rol asignado
const payload = {
  sub: "user-id-123",
  email: "test@example.com",
  exp: Math.floor(Date.now() / 1000) + 3600
  // Sin 'role' en user_metadata
};

// Resultado esperado: 403 Forbidden al intentar acceder a endpoints protegidos
```


#### Test Case 1.2.2: Token con rol inválido
```sql
-- En Supabase, asignar un rol no válido
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"hacker"'
)
WHERE email = 'test@example.com';

-- Intentar acceder con este usuario
-- Resultado esperado: 403 Forbidden
```

### 1.3 Renovación de Tokens

#### Test Case 1.3.1: Refresh token válido
```bash
# Usar refresh_token para obtener nuevo access_token
curl -X POST https://[tu-proyecto].supabase.co/auth/v1/token?grant_type=refresh_token \
  -H "apikey: [SUPABASE_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "[refresh_token_obtenido_en_login]"
  }'

# Resultado esperado: 200 OK con nuevo access_token
```

#### Test Case 1.3.2: Refresh token expirado
```bash
# Usar refresh_token expirado (después de 30 días por defecto)
curl -X POST https://[tu-proyecto].supabase.co/auth/v1/token?grant_type=refresh_token \
  -H "apikey: [SUPABASE_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "[refresh_token_expirado]"
  }'

# Resultado esperado: 401 Unauthorized
```

---

## Testing de Autorización por Roles

### 2.1 Endpoints Públicos (AllowAnonymous)

**Objetivo:** Verificar que los endpoints públicos son accesibles sin autenticación.

#### Test Case 2.1.1: Consultar tabla de posiciones
```bash
curl -X GET http://localhost:5000/api/liga/posiciones/[torneoId]

# Resultado esperado: 200 OK con datos de posiciones
```

#### Test Case 2.1.2: Consultar goleadores
```bash
curl -X GET http://localhost:5000/api/goleadores/[torneoId]

# Resultado esperado: 200 OK con ranking de goleadores
```

#### Test Case 2.1.3: Consultar partidos en vivo
```bash
curl -X GET http://localhost:5000/api/partidos/en-vivo

# Resultado esperado: 200 OK con lista de partidos
```

### 2.2 Endpoints de Administrador (AdminOnly)

**Objetivo:** Verificar que solo usuarios con rol 'admin' pueden acceder.

#### Test Case 2.2.1: Admin accede a crear torneo
```bash
# Login como admin
TOKEN=$(curl -X POST https://[proyecto].supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: [KEY]" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' \
  | jq -r '.access_token')

# Crear torneo
curl -X POST http://localhost:5000/api/liga/torneos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Liga Test",
    "temporadaId": "[uuid]",
    "tipo": "liga"
  }'

# Resultado esperado: 201 Created
```


#### Test Case 2.2.2: Planillero intenta crear torneo
```bash
# Login como planillero
TOKEN=$(curl -X POST https://[proyecto].supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: [KEY]" \
  -H "Content-Type: application/json" \
  -d '{"email":"planillero@test.com","password":"plan123"}' \
  | jq -r '.access_token')

# Intentar crear torneo
curl -X POST http://localhost:5000/api/liga/torneos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Liga Test",
    "temporadaId": "[uuid]",
    "tipo": "liga"
  }'

# Resultado esperado: 403 Forbidden
```

#### Test Case 2.2.3: Admin gestiona resoluciones
```bash
# Login como admin
TOKEN=[admin_token]

# Crear resolución
curl -X POST http://localhost:5000/api/resoluciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "disciplinaria",
    "asunto": "Suspensión por conducta antideportiva",
    "sancionTipo": "suspension",
    "sancionValor": 3,
    "jugadorId": "[uuid]"
  }'

# Resultado esperado: 201 Created

# Aplicar resolución
curl -X PATCH http://localhost:5000/api/resoluciones/[resolucionId]/aplicar \
  -H "Authorization: Bearer $TOKEN"

# Resultado esperado: 200 OK
```

#### Test Case 2.2.4: Árbitro intenta crear resolución
```bash
# Login como árbitro
TOKEN=[arbitro_token]

# Intentar crear resolución
curl -X POST http://localhost:5000/api/resoluciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "disciplinaria",
    "asunto": "Test",
    "sancionTipo": "suspension",
    "sancionValor": 1
  }'

# Resultado esperado: 403 Forbidden
```

### 2.3 Endpoints de Planillero (PlanilleroOnly)

**Objetivo:** Verificar que solo usuarios con rol 'planillero' o 'admin' pueden acceder.

#### Test Case 2.3.1: Planillero inicia partido
```bash
# Login como planillero
TOKEN=[planillero_token]

# Iniciar partido
curl -X POST http://localhost:5000/api/partidos/[partidoId]/iniciar \
  -H "Authorization: Bearer $TOKEN"

# Resultado esperado: 200 OK (si es el planillero asignado)
```

#### Test Case 2.3.2: Planillero registra evento
```bash
# Login como planillero
TOKEN=[planillero_token]

# Registrar gol
curl -X POST http://localhost:5000/api/partidos/[partidoId]/eventos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "minuto": 23,
    "tipo": "gol",
    "jugadorId": "[uuid]",
    "equipoId": "[uuid]",
    "descripcion": "Gol de cabeza"
  }'

# Resultado esperado: 201 Created
```


#### Test Case 2.3.3: Usuario público intenta registrar evento
```bash
# Sin autenticación o con rol 'publico'
curl -X POST http://localhost:5000/api/partidos/[partidoId]/eventos \
  -H "Content-Type: application/json" \
  -d '{
    "minuto": 23,
    "tipo": "gol",
    "jugadorId": "[uuid]",
    "equipoId": "[uuid]"
  }'

# Resultado esperado: 401 Unauthorized
```

### 2.4 Endpoints de Árbitro (ArbitroOnly)

**Objetivo:** Verificar que árbitros pueden consultar pero no modificar datos disciplinarios.

#### Test Case 2.4.1: Árbitro consulta suspensiones
```bash
# Login como árbitro
TOKEN=[arbitro_token]

# Consultar suspensiones (si existe endpoint)
curl -X GET http://localhost:5000/api/suspensiones?torneoId=[uuid] \
  -H "Authorization: Bearer $TOKEN"

# Resultado esperado: 200 OK con lista de suspensiones
```

---

## Testing de Row Level Security (RLS)

### 3.1 Políticas de Lectura Pública

**Objetivo:** Verificar que las tablas públicas son accesibles sin autenticación.

#### Test Case 3.1.1: Consulta directa a Supabase - Posiciones
```javascript
// Desde el frontend o Postman
const { data, error } = await supabase
  .from('posiciones')
  .select('*')
  .eq('torneo_id', torneoId);

// Resultado esperado: data con registros, error = null
```

#### Test Case 3.1.2: Consulta directa a Supabase - Partidos
```javascript
const { data, error } = await supabase
  .from('partidos')
  .select('*')
  .eq('estado', 'en_curso');

// Resultado esperado: data con partidos en vivo, error = null
```

#### Test Case 3.1.3: Consulta directa a Supabase - Equipos
```javascript
const { data, error } = await supabase
  .from('equipos')
  .select('*');

// Resultado esperado: data con todos los equipos, error = null
```

### 3.2 Políticas de Escritura Restringida

**Objetivo:** Verificar que solo usuarios autorizados pueden modificar datos.

#### Test Case 3.2.1: Usuario público intenta insertar partido
```javascript
// Sin autenticación
const { data, error } = await supabase
  .from('partidos')
  .insert({
    torneo_id: torneoId,
    jornada: 1,
    equipo_local_id: equipoLocalId,
    equipo_visita_id: equipoVisitaId,
    fecha_hora: new Date().toISOString()
  });

// Resultado esperado: error con código de política RLS
```

#### Test Case 3.2.2: Admin inserta partido
```javascript
// Con sesión de admin
await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'admin123'
});

const { data, error } = await supabase
  .from('partidos')
  .insert({
    torneo_id: torneoId,
    jornada: 1,
    equipo_local_id: equipoLocalId,
    equipo_visita_id: equipoVisitaId,
    fecha_hora: new Date().toISOString()
  });

// Resultado esperado: data con partido creado, error = null
```


### 3.3 Políticas de Solicitudes y Resoluciones

**Objetivo:** Verificar que solo admins pueden gestionar solicitudes y resoluciones.

#### Test Case 3.3.1: Usuario público intenta leer solicitudes
```javascript
// Sin autenticación
const { data, error } = await supabase
  .from('solicitudes')
  .select('*');

// Resultado esperado: data = [], error con política RLS
```

#### Test Case 3.3.2: Admin lee solicitudes
```javascript
// Con sesión de admin
await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'admin123'
});

const { data, error } = await supabase
  .from('solicitudes')
  .select('*');

// Resultado esperado: data con todas las solicitudes, error = null
```

#### Test Case 3.3.3: Planillero intenta crear resolución
```javascript
// Con sesión de planillero
await supabase.auth.signInWithPassword({
  email: 'planillero@test.com',
  password: 'plan123'
});

const { data, error } = await supabase
  .from('resoluciones')
  .insert({
    numero: 'RES-2025-001',
    tipo: 'disciplinaria',
    asunto: 'Test'
  });

// Resultado esperado: error con política RLS
```

### 3.4 Políticas de Suspensiones

**Objetivo:** Verificar que árbitros pueden leer pero no modificar suspensiones.

#### Test Case 3.4.1: Árbitro lee suspensiones
```javascript
// Con sesión de árbitro
await supabase.auth.signInWithPassword({
  email: 'arbitro@test.com',
  password: 'arb123'
});

const { data, error } = await supabase
  .from('suspensiones')
  .select('*')
  .eq('estado', 'activa');

// Resultado esperado: data con suspensiones activas, error = null
```

#### Test Case 3.4.2: Árbitro intenta modificar suspensión
```javascript
// Con sesión de árbitro
const { data, error } = await supabase
  .from('suspensiones')
  .update({ estado: 'cumplida' })
  .eq('id', suspensionId);

// Resultado esperado: error con política RLS
```

#### Test Case 3.4.3: Admin modifica suspensión
```javascript
// Con sesión de admin
await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'admin123'
});

const { data, error } = await supabase
  .from('suspensiones')
  .update({ estado: 'anulada' })
  .eq('id', suspensionId);

// Resultado esperado: data con suspensión actualizada, error = null
```

---

## Testing de Validación de Planillero Asignado

### 4.1 Asignación de Planillero

**Objetivo:** Verificar que solo el planillero asignado puede operar el partido.

#### Test Case 4.1.1: Planillero asignado inicia partido
```bash
# 1. Asignar planillero al partido (como admin)
curl -X PATCH http://localhost:5000/api/partidos/[partidoId] \
  -H "Authorization: Bearer [admin_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "planilleroId": "[planillero_user_id]"
  }'

# 2. Login como planillero asignado
TOKEN=[planillero_token]

# 3. Iniciar partido
curl -X POST http://localhost:5000/api/partidos/[partidoId]/iniciar \
  -H "Authorization: Bearer $TOKEN"

# Resultado esperado: 200 OK
```


#### Test Case 4.1.2: Planillero NO asignado intenta iniciar partido
```bash
# 1. Partido asignado a planillero A
# 2. Login como planillero B (diferente)
TOKEN=[planillero_b_token]

# 3. Intentar iniciar partido
curl -X POST http://localhost:5000/api/partidos/[partidoId]/iniciar \
  -H "Authorization: Bearer $TOKEN"

# Resultado esperado: 403 Forbidden con mensaje "No eres el planillero asignado"
```

#### Test Case 4.1.3: Validación en RLS - Planillero asignado actualiza partido
```javascript
// Con sesión de planillero asignado
await supabase.auth.signInWithPassword({
  email: 'planillero@test.com',
  password: 'plan123'
});

const { data, error } = await supabase
  .from('partidos')
  .update({ estado: 'en_curso', minuto_actual: 0 })
  .eq('id', partidoId)
  .eq('planillero_id', userId); // Debe coincidir con auth.uid()

// Resultado esperado: data con partido actualizado, error = null
```

#### Test Case 4.1.4: Validación en RLS - Planillero NO asignado intenta actualizar
```javascript
// Con sesión de planillero B
await supabase.auth.signInWithPassword({
  email: 'planillero_b@test.com',
  password: 'plan123'
});

const { data, error } = await supabase
  .from('partidos')
  .update({ estado: 'en_curso' })
  .eq('id', partidoId);
// partidoId tiene planillero_id diferente a auth.uid()

// Resultado esperado: error con política RLS
```

### 4.2 Registro de Eventos por Planillero Asignado

**Objetivo:** Verificar que solo el planillero asignado puede registrar eventos.

#### Test Case 4.2.1: Planillero asignado registra gol
```javascript
// Con sesión de planillero asignado
const { data, error } = await supabase
  .from('eventos_partido')
  .insert({
    partido_id: partidoId,
    minuto: 15,
    tipo: 'gol',
    jugador_id: jugadorId,
    equipo_id: equipoId,
    descripcion: 'Gol de tiro libre'
  });

// Resultado esperado: data con evento creado, error = null
```

#### Test Case 4.2.2: Planillero NO asignado intenta registrar evento
```javascript
// Con sesión de planillero B (no asignado al partido)
const { data, error } = await supabase
  .from('eventos_partido')
  .insert({
    partido_id: partidoId,
    minuto: 20,
    tipo: 'gol',
    jugador_id: jugadorId,
    equipo_id: equipoId
  });

// Resultado esperado: error con política RLS
// La política verifica: EXISTS (SELECT 1 FROM partidos WHERE id = partido_id AND planillero_id = auth.uid())
```

#### Test Case 4.2.3: Admin puede registrar eventos en cualquier partido
```javascript
// Con sesión de admin
await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'admin123'
});

const { data, error } = await supabase
  .from('eventos_partido')
  .insert({
    partido_id: partidoId,
    minuto: 30,
    tipo: 'tarjeta_amarilla',
    jugador_id: jugadorId,
    equipo_id: equipoId
  });

// Resultado esperado: data con evento creado, error = null
```

### 4.3 Finalización de Partido

**Objetivo:** Verificar que solo el planillero asignado puede finalizar el partido.

#### Test Case 4.3.1: Planillero asignado finaliza partido
```bash
TOKEN=[planillero_asignado_token]

curl -X POST http://localhost:5000/api/partidos/[partidoId]/finalizar \
  -H "Authorization: Bearer $TOKEN"

# Resultado esperado: 200 OK
# Verificar que estado cambió a 'finalizado'
# Verificar que se actualizó la tabla de posiciones
```


#### Test Case 4.3.2: Planillero NO asignado intenta finalizar partido
```bash
TOKEN=[planillero_b_token]

curl -X POST http://localhost:5000/api/partidos/[partidoId]/finalizar \
  -H "Authorization: Bearer $TOKEN"

# Resultado esperado: 403 Forbidden
```

---

## Testing de Accesos No Autorizados

### 5.1 Ataques de Inyección SQL

**Objetivo:** Verificar que el sistema está protegido contra SQL injection.

#### Test Case 5.1.1: SQL Injection en parámetros de consulta
```bash
# Intentar inyección SQL en query parameter
curl -X GET "http://localhost:5000/api/goleadores/123' OR '1'='1"

# Resultado esperado: 400 Bad Request o 404 Not Found (UUID inválido)
# NO debe ejecutar la inyección SQL
```

#### Test Case 5.1.2: SQL Injection en body JSON
```bash
curl -X POST http://localhost:5000/api/partidos/[partidoId]/eventos \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "minuto": 15,
    "tipo": "gol",
    "jugadorId": "123e4567-e89b-12d3-a456-426614174000",
    "equipoId": "'; DROP TABLE partidos; --",
    "descripcion": "Test"
  }'

# Resultado esperado: 400 Bad Request (UUID inválido)
# La tabla partidos NO debe ser eliminada
```

#### Test Case 5.1.3: Verificar uso de consultas parametrizadas
```csharp
// Revisar código del backend
// CORRECTO (parametrizado):
var partidos = await _supabase
    .From<Partido>()
    .Where(p => p.TorneoId == torneoId)
    .Get();

// INCORRECTO (vulnerable):
// var query = $"SELECT * FROM partidos WHERE torneo_id = '{torneoId}'";
```

### 5.2 Cross-Site Scripting (XSS)

**Objetivo:** Verificar que el sistema sanitiza inputs y previene XSS.

#### Test Case 5.2.1: XSS en descripción de evento
```bash
curl -X POST http://localhost:5000/api/partidos/[partidoId]/eventos \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "minuto": 25,
    "tipo": "gol",
    "jugadorId": "[uuid]",
    "equipoId": "[uuid]",
    "descripcion": "<script>alert(\"XSS\")</script>"
  }'

# Resultado esperado: 201 Created
# Al mostrar en frontend, el script NO debe ejecutarse
# Angular sanitiza automáticamente con DomSanitizer
```

#### Test Case 5.2.2: Verificar sanitización en frontend
```typescript
// En Angular, verificar que se usa:
import { DomSanitizer } from '@angular/platform-browser';

// Para HTML dinámico:
this.sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, userInput);

// O usar interpolación segura:
<div>{{ evento.descripcion }}</div> // Angular escapa automáticamente
```

### 5.3 Cross-Site Request Forgery (CSRF)

**Objetivo:** Verificar protección contra CSRF.

#### Test Case 5.3.1: Request desde origen no autorizado
```html
<!-- Página maliciosa en otro dominio -->
<form action="http://localhost:5000/api/partidos/[partidoId]/finalizar" method="POST">
  <input type="submit" value="Click aquí">
</form>

<script>
  // Intentar enviar request con credenciales
  fetch('http://localhost:5000/api/partidos/[partidoId]/finalizar', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Authorization': 'Bearer [token_robado]'
    }
  });
</script>

<!-- Resultado esperado: Bloqueado por CORS -->
```


#### Test Case 5.3.2: Verificar configuración CORS
```csharp
// En Program.cs, verificar:
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://sportzone.app") // Orígenes específicos
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Solo si es necesario
    });
});

// NO usar en producción:
// policy.AllowAnyOrigin() // INSEGURO
```

### 5.4 Insecure Direct Object References (IDOR)

**Objetivo:** Verificar que usuarios no pueden acceder a recursos de otros usuarios.

#### Test Case 5.4.1: Planillero A intenta acceder a partido de Planillero B
```bash
# 1. Obtener ID de partido asignado a planillero B
PARTIDO_B_ID="123e4567-e89b-12d3-a456-426614174001"

# 2. Login como planillero A
TOKEN_A=[planillero_a_token]

# 3. Intentar iniciar partido de B
curl -X POST http://localhost:5000/api/partidos/$PARTIDO_B_ID/iniciar \
  -H "Authorization: Bearer $TOKEN_A"

# Resultado esperado: 403 Forbidden
```

#### Test Case 5.4.2: Usuario intenta modificar datos de otro usuario
```javascript
// Con sesión de usuario A
const { data, error } = await supabase
  .from('dispositivos_fcm')
  .update({ activo: false })
  .eq('user_id', 'user_b_id'); // ID de otro usuario

// Resultado esperado: error con política RLS
// Solo debe poder modificar sus propios dispositivos
```

### 5.5 Exposición de Información Sensible

**Objetivo:** Verificar que no se expone información sensible.

#### Test Case 5.5.1: Verificar que contraseñas no se exponen
```bash
# Consultar usuarios (si existe endpoint)
curl -X GET http://localhost:5000/api/usuarios \
  -H "Authorization: Bearer [admin_token]"

# Resultado esperado: NO debe incluir campos de contraseña
# Solo: id, email, role, created_at
```

#### Test Case 5.5.2: Verificar mensajes de error no verbosos
```bash
# Intentar login con credenciales incorrectas
curl -X POST https://[proyecto].supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: [KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "noexiste@test.com",
    "password": "wrong"
  }'

# Resultado esperado: Mensaje genérico
# "Invalid login credentials"
# NO: "User not found" o "Wrong password" (revela información)
```

#### Test Case 5.5.3: Verificar que JWT Secret no se expone
```bash
# Intentar acceder a configuración
curl -X GET http://localhost:5000/api/config

# Resultado esperado: 404 Not Found
# NO debe existir endpoint que exponga configuración
```

### 5.6 Enumeración de Recursos

**Objetivo:** Verificar que no se puede enumerar recursos protegidos.

#### Test Case 5.6.1: Intentar enumerar IDs de partidos
```bash
# Probar múltiples UUIDs secuenciales
for i in {1..100}; do
  curl -X GET http://localhost:5000/api/partidos/123e4567-e89b-12d3-a456-42661417400$i
done

# Resultado esperado: 404 Not Found para IDs no existentes
# NO debe revelar información sobre existencia de recursos
```

### 5.7 Rate Limiting y Protección contra Fuerza Bruta

**Objetivo:** Verificar protección contra ataques de fuerza bruta.

#### Test Case 5.7.1: Múltiples intentos de login fallidos
```bash
# Intentar login 100 veces con contraseña incorrecta
for i in {1..100}; do
  curl -X POST https://[proyecto].supabase.co/auth/v1/token?grant_type=password \
    -H "apikey: [KEY]" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@test.com",
      "password": "wrong'$i'"
    }'
  sleep 0.1
done

# Resultado esperado: Después de N intentos, debe bloquearse temporalmente
# Supabase tiene rate limiting incorporado
```


#### Test Case 5.7.2: Verificar rate limiting en API
```bash
# Enviar 1000 requests rápidos al mismo endpoint
for i in {1..1000}; do
  curl -X GET http://localhost:5000/api/partidos/en-vivo &
done
wait

# Resultado esperado: Algunos requests deben recibir 429 Too Many Requests
# Implementar middleware de rate limiting si no existe
```

### 5.8 Manipulación de Tokens

**Objetivo:** Verificar que tokens no pueden ser manipulados.

#### Test Case 5.8.1: Modificar claim 'role' en token
```javascript
// 1. Obtener token válido
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwicm9sZSI6InBsYW5pbGxlcm8ifQ.signature";

// 2. Decodificar payload
const payload = JSON.parse(atob(token.split('.')[1]));

// 3. Modificar role a 'admin'
payload.role = 'admin';

// 4. Crear nuevo token con payload modificado (sin re-firmar correctamente)
const modifiedToken = token.split('.')[0] + '.' + btoa(JSON.stringify(payload)) + '.' + token.split('.')[2];

// 5. Intentar usar token modificado
fetch('http://localhost:5000/api/liga/torneos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${modifiedToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ nombre: 'Test' })
});

// Resultado esperado: 401 Unauthorized (firma inválida)
```

---

## Checklist de Seguridad

### Autenticación JWT
- [ ] Tokens sin Authorization header son rechazados (401)
- [ ] Tokens malformados son rechazados (401)
- [ ] Tokens expirados son rechazados (401)
- [ ] Tokens con firma incorrecta son rechazados (401)
- [ ] Tokens válidos son aceptados (200/201)
- [ ] Refresh tokens funcionan correctamente
- [ ] Refresh tokens expirados son rechazados

### Autorización por Roles
- [ ] Endpoints públicos son accesibles sin autenticación
- [ ] Endpoints AdminOnly solo accesibles por admins
- [ ] Endpoints PlanilleroOnly solo accesibles por planilleros/admins
- [ ] Endpoints ArbitroOnly solo accesibles por árbitros/admins
- [ ] Usuarios con rol inválido son rechazados (403)
- [ ] Usuarios sin rol son rechazados (403)

### Row Level Security (RLS)
- [ ] Tablas públicas (posiciones, partidos, equipos) son legibles sin auth
- [ ] Tablas públicas NO son modificables sin auth
- [ ] Solicitudes solo accesibles por admins
- [ ] Resoluciones solo accesibles por admins
- [ ] Suspensiones legibles por árbitros, modificables solo por admins
- [ ] Campañas marketing accesibles por admins y marketing

### Validación de Planillero Asignado
- [ ] Planillero asignado puede iniciar su partido
- [ ] Planillero NO asignado NO puede iniciar partido ajeno
- [ ] Planillero asignado puede registrar eventos en su partido
- [ ] Planillero NO asignado NO puede registrar eventos en partido ajeno
- [ ] Planillero asignado puede finalizar su partido
- [ ] Admin puede operar cualquier partido

### Protección contra Ataques
- [ ] SQL Injection: Consultas parametrizadas, no hay inyección
- [ ] XSS: Inputs sanitizados, scripts no se ejecutan
- [ ] CSRF: CORS configurado correctamente, orígenes específicos
- [ ] IDOR: Usuarios no acceden a recursos ajenos
- [ ] Información sensible: Contraseñas no expuestas, errores genéricos
- [ ] Enumeración: No se revela existencia de recursos
- [ ] Rate Limiting: Múltiples requests son limitados
- [ ] Manipulación de tokens: Tokens modificados son rechazados

### Configuración de Seguridad
- [ ] HTTPS habilitado en producción
- [ ] CORS configurado con orígenes específicos (no AllowAnyOrigin)
- [ ] JWT Secret es fuerte y no está expuesto
- [ ] Variables de entorno protegidas (no en código fuente)
- [ ] Logs no contienen información sensible
- [ ] Errores no revelan detalles de implementación

---

## Herramientas Recomendadas

### Testing Manual
- **Postman**: Para probar endpoints REST
- **cURL**: Para scripts de testing automatizados
- **Browser DevTools**: Para inspeccionar requests/responses

### Testing Automatizado
- **Jest/Vitest**: Tests unitarios de servicios
- **Supertest**: Tests de integración de API
- **Playwright**: Tests E2E de flujos de autenticación

### Análisis de Seguridad
- **OWASP ZAP**: Escáner de vulnerabilidades web
- **Burp Suite**: Proxy para interceptar y modificar requests
- **SQLMap**: Detector de SQL injection
- **JWT.io**: Decodificador y validador de tokens JWT


### Monitoreo y Logging
- **Application Insights**: Monitoreo de aplicaciones .NET
- **Supabase Dashboard**: Logs de autenticación y RLS
- **ELK Stack**: Centralización de logs

### Penetration Testing
- **Metasploit**: Framework de pentesting
- **Nmap**: Escaneo de puertos y servicios
- **Nikto**: Escáner de vulnerabilidades web

---

## Scripts de Testing Automatizado

### Script 1: Test de Autenticación JWT

```bash
#!/bin/bash
# test_jwt_auth.sh

SUPABASE_URL="https://[tu-proyecto].supabase.co"
SUPABASE_KEY="[tu-anon-key]"
API_URL="http://localhost:5000"

echo "=== Test de Autenticación JWT ==="

# Test 1: Sin token
echo "Test 1: Request sin token"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/partidos/123e4567-e89b-12d3-a456-426614174000/iniciar)
if [ "$RESPONSE" -eq 401 ]; then
  echo "✓ PASS: Sin token retorna 401"
else
  echo "✗ FAIL: Sin token retorna $RESPONSE (esperado 401)"
fi

# Test 2: Token inválido
echo "Test 2: Token inválido"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/partidos/123e4567-e89b-12d3-a456-426614174000/iniciar \
  -H "Authorization: Bearer token_invalido")
if [ "$RESPONSE" -eq 401 ]; then
  echo "✓ PASS: Token inválido retorna 401"
else
  echo "✗ FAIL: Token inválido retorna $RESPONSE (esperado 401)"
fi

# Test 3: Login y obtener token válido
echo "Test 3: Login con credenciales válidas"
LOGIN_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "planillero@test.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✓ PASS: Login exitoso, token obtenido"
  
  # Test 4: Request con token válido
  echo "Test 4: Request con token válido"
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET $API_URL/api/partidos/en-vivo \
    -H "Authorization: Bearer $TOKEN")
  if [ "$RESPONSE" -eq 200 ]; then
    echo "✓ PASS: Token válido retorna 200"
  else
    echo "✗ FAIL: Token válido retorna $RESPONSE (esperado 200)"
  fi
else
  echo "✗ FAIL: No se pudo obtener token"
fi

echo "=== Fin de tests ==="
```

### Script 2: Test de Autorización por Roles

```bash
#!/bin/bash
# test_role_authorization.sh

API_URL="http://localhost:5000"
SUPABASE_URL="https://[tu-proyecto].supabase.co"
SUPABASE_KEY="[tu-anon-key]"

echo "=== Test de Autorización por Roles ==="

# Función para login
login() {
  local email=$1
  local password=$2
  
  RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")
  
  echo $(echo $RESPONSE | jq -r '.access_token')
}

# Test 1: Admin crea torneo
echo "Test 1: Admin crea torneo"
ADMIN_TOKEN=$(login "admin@test.com" "admin123")
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/liga/torneos \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Liga Test",
    "temporadaId": "123e4567-e89b-12d3-a456-426614174000",
    "tipo": "liga"
  }')

if [ "$RESPONSE" -eq 201 ] || [ "$RESPONSE" -eq 200 ]; then
  echo "✓ PASS: Admin puede crear torneo"
else
  echo "✗ FAIL: Admin no puede crear torneo (código: $RESPONSE)"
fi

# Test 2: Planillero intenta crear torneo
echo "Test 2: Planillero intenta crear torneo"
PLANILLERO_TOKEN=$(login "planillero@test.com" "plan123")
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/liga/torneos \
  -H "Authorization: Bearer $PLANILLERO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Liga Test",
    "temporadaId": "123e4567-e89b-12d3-a456-426614174000",
    "tipo": "liga"
  }')

if [ "$RESPONSE" -eq 403 ]; then
  echo "✓ PASS: Planillero no puede crear torneo (403)"
else
  echo "✗ FAIL: Planillero recibe código $RESPONSE (esperado 403)"
fi

# Test 3: Usuario público accede a datos públicos
echo "Test 3: Usuario público accede a datos públicos"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET $API_URL/api/partidos/en-vivo)

if [ "$RESPONSE" -eq 200 ]; then
  echo "✓ PASS: Usuario público puede ver partidos en vivo"
else
  echo "✗ FAIL: Usuario público no puede ver partidos (código: $RESPONSE)"
fi

echo "=== Fin de tests ==="
```


### Script 3: Test de Row Level Security

```javascript
// test_rls.js
// Ejecutar con: node test_rls.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://[tu-proyecto].supabase.co';
const supabaseKey = '[tu-anon-key]';

async function testRLS() {
  console.log('=== Test de Row Level Security ===\n');

  // Test 1: Lectura pública de posiciones
  console.log('Test 1: Lectura pública de posiciones');
  const supabasePublic = createClient(supabaseUrl, supabaseKey);
  
  const { data: posiciones, error: errorPosiciones } = await supabasePublic
    .from('posiciones')
    .select('*')
    .limit(5);

  if (!errorPosiciones && posiciones.length > 0) {
    console.log('✓ PASS: Usuario público puede leer posiciones\n');
  } else {
    console.log('✗ FAIL: Usuario público no puede leer posiciones\n');
  }

  // Test 2: Escritura pública en posiciones (debe fallar)
  console.log('Test 2: Escritura pública en posiciones');
  const { data: insertData, error: insertError } = await supabasePublic
    .from('posiciones')
    .insert({
      torneo_id: '123e4567-e89b-12d3-a456-426614174000',
      equipo_id: '123e4567-e89b-12d3-a456-426614174001',
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0
    });

  if (insertError) {
    console.log('✓ PASS: Usuario público no puede insertar en posiciones\n');
  } else {
    console.log('✗ FAIL: Usuario público puede insertar en posiciones\n');
  }

  // Test 3: Admin lee solicitudes
  console.log('Test 3: Admin lee solicitudes');
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
  
  await supabaseAdmin.auth.signInWithPassword({
    email: 'admin@test.com',
    password: 'admin123'
  });

  const { data: solicitudes, error: errorSolicitudes } = await supabaseAdmin
    .from('solicitudes')
    .select('*')
    .limit(5);

  if (!errorSolicitudes) {
    console.log('✓ PASS: Admin puede leer solicitudes\n');
  } else {
    console.log('✗ FAIL: Admin no puede leer solicitudes\n');
  }

  // Test 4: Planillero intenta leer solicitudes (debe fallar)
  console.log('Test 4: Planillero intenta leer solicitudes');
  const supabasePlanillero = createClient(supabaseUrl, supabaseKey);
  
  await supabasePlanillero.auth.signInWithPassword({
    email: 'planillero@test.com',
    password: 'plan123'
  });

  const { data: solicitudesPlan, error: errorSolicitudesPlan } = await supabasePlanillero
    .from('solicitudes')
    .select('*');

  if (errorSolicitudesPlan || solicitudesPlan.length === 0) {
    console.log('✓ PASS: Planillero no puede leer solicitudes\n');
  } else {
    console.log('✗ FAIL: Planillero puede leer solicitudes\n');
  }

  // Test 5: Árbitro lee suspensiones
  console.log('Test 5: Árbitro lee suspensiones');
  const supabaseArbitro = createClient(supabaseUrl, supabaseKey);
  
  await supabaseArbitro.auth.signInWithPassword({
    email: 'arbitro@test.com',
    password: 'arb123'
  });

  const { data: suspensiones, error: errorSuspensiones } = await supabaseArbitro
    .from('suspensiones')
    .select('*')
    .limit(5);

  if (!errorSuspensiones) {
    console.log('✓ PASS: Árbitro puede leer suspensiones\n');
  } else {
    console.log('✗ FAIL: Árbitro no puede leer suspensiones\n');
  }

  // Test 6: Árbitro intenta modificar suspensión (debe fallar)
  console.log('Test 6: Árbitro intenta modificar suspensión');
  const { data: updateData, error: updateError } = await supabaseArbitro
    .from('suspensiones')
    .update({ estado: 'cumplida' })
    .eq('id', '123e4567-e89b-12d3-a456-426614174000');

  if (updateError) {
    console.log('✓ PASS: Árbitro no puede modificar suspensiones\n');
  } else {
    console.log('✗ FAIL: Árbitro puede modificar suspensiones\n');
  }

  console.log('=== Fin de tests ===');
}

testRLS().catch(console.error);
```

---

## Procedimientos de Remediación

### Vulnerabilidad: Token JWT sin expiración

**Síntoma:** Tokens permanecen válidos indefinidamente.

**Remediación:**
```csharp
// En Program.cs, configurar validación de lifetime
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateLifetime = true,
    ClockSkew = TimeSpan.Zero // Sin tolerancia de tiempo
};
```

### Vulnerabilidad: CORS permite cualquier origen

**Síntoma:** `AllowAnyOrigin()` en configuración CORS.

**Remediación:**
```csharp
// Cambiar de:
policy.AllowAnyOrigin()

// A:
policy.WithOrigins(
    "http://localhost:4200",
    "https://sportzone.app",
    "https://www.sportzone.app"
)
```

### Vulnerabilidad: SQL Injection

**Síntoma:** Concatenación de strings en consultas SQL.

**Remediación:**
```csharp
// INCORRECTO:
var query = $"SELECT * FROM partidos WHERE id = '{partidoId}'";

// CORRECTO:
var partido = await _supabase
    .From<Partido>()
    .Where(p => p.Id == partidoId)
    .Single();
```

### Vulnerabilidad: Información sensible en logs

**Síntoma:** Contraseñas o tokens en logs.

**Remediación:**
```csharp
// INCORRECTO:
_logger.LogInformation($"Login attempt: {email} / {password}");

// CORRECTO:
_logger.LogInformation($"Login attempt for user: {email}");
```

### Vulnerabilidad: RLS no habilitado

**Síntoma:** Tablas sin políticas RLS.

**Remediación:**
```sql
-- Habilitar RLS
ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;

-- Crear política
CREATE POLICY "nombre_politica" ON nombre_tabla
  FOR SELECT
  USING (true); -- O condición específica
```

---

## Reporte de Vulnerabilidades

### Template de Reporte

```markdown
# Reporte de Vulnerabilidad de Seguridad

**Fecha:** [YYYY-MM-DD]
**Reportado por:** [Nombre]
**Severidad:** [Crítica / Alta / Media / Baja]

## Descripción
[Descripción detallada de la vulnerabilidad]

## Pasos para Reproducir
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

## Impacto
[Descripción del impacto potencial]

## Evidencia
[Screenshots, logs, código relevante]

## Remediación Propuesta
[Solución sugerida]

## Referencias
- [OWASP Top 10]
- [CVE relacionados]
```

---

## Conclusión

Esta guía proporciona un marco completo para realizar pruebas de seguridad en SportZone Pro. Es fundamental ejecutar estos tests regularmente, especialmente:

- Antes de cada release a producción
- Después de cambios en autenticación/autorización
- Después de agregar nuevos endpoints
- Como parte del CI/CD pipeline

**Recuerda:** La seguridad es un proceso continuo, no un estado final.

