# Design Document: Admin Match Management

## Overview

Este diseño define la implementación técnica de la funcionalidad de administración de partidos para SportZone Pro. La solución extiende la arquitectura existente agregando endpoints CRUD completos en el backend y un componente Angular de administración en el frontend.

La funcionalidad permite a los administradores crear, editar, listar y eliminar partidos individuales desde la interfaz web, complementando el generador automático de fixtures existente. El diseño mantiene compatibilidad total con el sistema actual y reutiliza servicios, modelos y patrones establecidos.

**Tecnologías:**
- Backend: .NET 8 con Supabase (PostgreSQL)
- Frontend: Angular 17 con Standalone Components
- Autenticación: JWT con claims de roles
- Tabla de datos: partidos (existente)

## Architecture

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PartidosController                        │
│  [Authorize(Policy = "AdminOnly")]                          │
│  - POST   /api/partidos                                     │
│  - GET    /api/partidos                                     │
│  - GET    /api/partidos/{id}                                │
│  - PUT    /api/partidos/{id}                                │
│  - DELETE /api/partidos/{id}                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    PartidosService                           │
│  - CreatePartidoAsync(CreatePartidoDto)                     │
│  - GetAllPartidosAsync(filters)                             │
│  - GetPartidoByIdAsync(id)                                  │
│  - UpdatePartidoAsync(id, UpdatePartidoDto)                 │
│  - DeletePartidoAsync(id)                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Client                             │
│  - Table: partidos                                          │
│  - Cascade delete: eventos_partido                          │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 AdminPartidosComponent                       │
│  Route: /admin/partidos [adminGuard]                        │
│  - Reactive Form (FormBuilder)                              │
│  - Match List Table                                         │
│  - Create/Edit Modal                                        │
│  - Delete Confirmation Dialog                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              AdminPartidosService (Angular)                  │
│  - createPartido(data)                                      │
│  - getAllPartidos(filters)                                  │
│  - getPartidoById(id)                                       │
│  - updatePartido(id, data)                                  │
│  - deletePartido(id)                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    ApiService                                │
│  HTTP Client with JWT interceptor                           │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. DTOs (Data Transfer Objects)

**CreatePartidoDto.cs**
```csharp
public class CreatePartidoDto
{
    public Guid TorneoId { get; set; }
    public int Jornada { get; set; }
    public Guid EquipoLocalId { get; set; }
    public Guid EquipoVisitaId { get; set; }
    public DateTime FechaHora { get; set; }
    public string? Estadio { get; set; }
    public string Estado { get; set; } = "programado";
}
```

**UpdatePartidoDto.cs**
```csharp
public class UpdatePartidoDto
{
    public Guid? TorneoId { get; set; }
    public int? Jornada { get; set; }
    public Guid? EquipoLocalId { get; set; }
    public Guid? EquipoVisitaId { get; set; }
    public DateTime? FechaHora { get; set; }
    public string? Estadio { get; set; }
    public string? Estado { get; set; }
}
```

**PartidoAdminDto.cs** (Extended for admin list view)
```csharp
public class PartidoAdminDto
{
    public Guid Id { get; set; }
    public Guid TorneoId { get; set; }
    public string TorneoNombre { get; set; }
    public int Jornada { get; set; }
    public Guid EquipoLocalId { get; set; }
    public string EquipoLocalNombre { get; set; }
    public Guid EquipoVisitaId { get; set; }
    public string EquipoVisitaNombre { get; set; }
    public DateTime FechaHora { get; set; }
    public string? Estadio { get; set; }
    public string Estado { get; set; }
    public int? GolesLocal { get; set; }
    public int? GolesVisita { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### 2. Controller Extensions

**PartidosController.cs** - Nuevos endpoints:

```csharp
[HttpPost]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> CreatePartido([FromBody] CreatePartidoDto dto)

[HttpGet]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> GetAllPartidos(
    [FromQuery] Guid? torneoId, 
    [FromQuery] string? estado,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20)

[HttpPut("{id}")]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> UpdatePartido(Guid id, [FromBody] UpdatePartidoDto dto)

[HttpDelete("{id}")]
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> DeletePartido(Guid id)
```

#### 3. Service Extensions

**IPartidosService.cs** - Nuevas interfaces:

```csharp
Task<PartidoAdminDto> CreatePartidoAsync(CreatePartidoDto dto);
Task<PagedResult<PartidoAdminDto>> GetAllPartidosAsync(
    Guid? torneoId, 
    string? estado, 
    int page, 
    int pageSize);
Task<PartidoAdminDto?> GetPartidoByIdAsync(Guid id);
Task<PartidoAdminDto> UpdatePartidoAsync(Guid id, UpdatePartidoDto dto);
Task DeletePartidoAsync(Guid id);
```

**PartidosService.cs** - Implementación:

Métodos clave:
- `CreatePartidoAsync`: Valida equipos diferentes, crea partido, retorna DTO con nombres
- `GetAllPartidosAsync`: Consulta con filtros, joins con torneos y equipos, paginación
- `UpdatePartidoAsync`: Valida cambios, actualiza solo campos proporcionados
- `DeletePartidoAsync`: Elimina partido (cascade delete automático por FK)

### Frontend Components

#### 1. Models (TypeScript)

**partido-admin.model.ts**
```typescript
export interface CreatePartidoRequest {
  torneoId: string;
  jornada: number;
  equipoLocalId: string;
  equipoVisitaId: string;
  fechaHora: string; // ISO 8601
  estadio?: string;
  estado: 'programado' | 'en_vivo' | 'finalizado' | 'suspendido';
}

export interface UpdatePartidoRequest {
  torneoId?: string;
  jornada?: number;
  equipoLocalId?: string;
  equipoVisitaId?: string;
  fechaHora?: string;
  estadio?: string;
  estado?: 'programado' | 'en_vivo' | 'finalizado' | 'suspendido';
}

export interface PartidoAdmin {
  id: string;
  torneoId: string;
  torneoNombre: string;
  jornada: number;
  equipoLocalId: string;
  equipoLocalNombre: string;
  equipoVisitaId: string;
  equipoVisitaNombre: string;
  fechaHora: Date;
  estadio?: string;
  estado: string;
  golesLocal?: number;
  golesVisita?: number;
  createdAt: Date;
}
```

#### 2. Service (Angular)

**admin-partidos.service.ts**

```typescript
@Injectable({ providedIn: 'root' })
export class AdminPartidosService {
  constructor(private api: ApiService) {}

  createPartido(data: CreatePartidoRequest): Observable<ApiResponse<PartidoAdmin>>
  getAllPartidos(filters?: PartidoFilters): Observable<ApiResponse<PagedResult<PartidoAdmin>>>
  getPartidoById(id: string): Observable<ApiResponse<PartidoAdmin>>
  updatePartido(id: string, data: UpdatePartidoRequest): Observable<ApiResponse<PartidoAdmin>>
  deletePartido(id: string): Observable<ApiResponse<void>>
}
```

#### 3. Component

**admin-partidos.component.ts**

Estructura:
- Signals para estado reactivo (partidos, torneos, equipos, loading, error)
- FormGroup reactivo con validaciones
- Métodos CRUD que llaman al servicio
- Manejo de modales (crear/editar)
- Confirmación de eliminación
- Filtros y paginación

Validaciones del formulario:
- torneoId: required
- jornada: required, min(1)
- equipoLocalId: required
- equipoVisitaId: required, custom validator (diferente de equipoLocalId)
- fechaHora: required
- estado: required

#### 4. Template

**admin-partidos.component.html**

Secciones:
1. Header con botón "Crear Nuevo Partido"
2. Filtros (torneo, estado)
3. Tabla de partidos con columnas: Torneo, Jornada, Equipos, Fecha, Estadio, Estado, Acciones
4. Paginación
5. Modal de formulario (crear/editar)
6. Modal de confirmación de eliminación

#### 5. Routing

**app.routes.ts**

```typescript
{
  path: 'admin/partidos',
  component: AdminPartidosComponent,
  canActivate: [adminGuard]
}
```

## Data Models

### Database Schema (Existing)

**Tabla: partidos**
```sql
CREATE TABLE partidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    torneo_id UUID NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
    jornada INTEGER NOT NULL,
    equipo_local_id UUID NOT NULL REFERENCES equipos(id),
    equipo_visita_id UUID NOT NULL REFERENCES equipos(id),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    estadio TEXT,
    estado TEXT NOT NULL DEFAULT 'programado',
    goles_local INTEGER,
    goles_visita INTEGER,
    minuto_actual INTEGER DEFAULT 0,
    planillero_id UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relaciones:**
- `torneo_id` → `torneos(id)` ON DELETE CASCADE
- `equipo_local_id` → `equipos(id)`
- `equipo_visita_id` → `equipos(id)`
- `planillero_id` → `usuarios(id)` (nullable)

**Cascade Delete:**
- `eventos_partido` tiene FK a `partidos(id)` con ON DELETE CASCADE
- Al eliminar un partido, todos sus eventos se eliminan automáticamente

### Data Flow

**Create Match Flow:**
```
User Input → Form Validation → CreatePartidoDto → 
PartidosService.CreatePartidoAsync → Validate Teams Different → 
Insert to DB → Query with Joins → Return PartidoAdminDto → 
Update UI Signal → Show Success Message
```

**Update Match Flow:**
```
User Clicks Edit → Load Partido → Populate Form → 
User Modifies → UpdatePartidoDto → 
PartidosService.UpdatePartidoAsync → Validate if Teams Changed → 
Update DB → Query with Joins → Return PartidoAdminDto → 
Update UI Signal → Show Success Message
```

**Delete Match Flow:**
```
User Clicks Delete → Show Confirmation → User Confirms → 
PartidosService.DeletePartidoAsync → Delete from DB (Cascade) → 
Remove from UI Signal → Show Success Message
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, the following properties were identified as testable. Some properties were consolidated to eliminate redundancy:

**Consolidated Properties:**
- Properties 2.10, 2.12, 5.3, and 5.4 can be combined into comprehensive CRUD operation properties
- Properties 3.1-3.5 (individual required field validations) are edge cases that will be handled by generators
- Properties 4.5 and 4.6 (filtering) can be combined into a single filtering property
- Properties 6.3 and 6.4 (deletion and success notification) can be combined
- Properties 7.1 and 7.2 (authentication and authorization) can be combined into a single auth property

### Property 1: Valid Match Creation

*For any* valid match data (with different home and away teams, valid tournament, positive matchday, and future date), creating a match through the API should result in a new match record in the database with all provided fields correctly stored.

**Validates: Requirements 2.10, 2.12**

### Property 2: Same Team Rejection

*For any* team, attempting to create a match where the home team and away team are the same should be rejected with an error message indicating teams must be different.

**Validates: Requirements 2.11**

### Property 3: Invalid Matchday Rejection

*For any* matchday value less than or equal to 0, attempting to create or update a match should be rejected with an error indicating the matchday must be greater than 0.

**Validates: Requirements 3.6**

### Property 4: Backend Required Field Validation

*For any* match creation or update request missing required fields (tournament, matchday, home team, away team, or date), the backend service should reject the request with a descriptive error message.

**Validates: Requirements 3.7**

### Property 5: Match List Display

*For any* set of matches in the database, querying all matches should return all matches with complete information including tournament name, matchday, team names, date, stadium, and status.

**Validates: Requirements 4.1, 4.2**

### Property 6: Default Date Sorting

*For any* set of matches with different dates, retrieving all matches without specifying sort order should return matches sorted by date in descending order (most recent first).

**Validates: Requirements 4.3**

### Property 7: Tournament Filtering

*For any* tournament and set of matches from multiple tournaments, applying a tournament filter should return only matches belonging to the selected tournament.

**Validates: Requirements 4.5, 4.6**

### Property 8: Pagination Behavior

*For any* set of matches exceeding 20 items, retrieving matches with pagination should return exactly 20 matches per page (or fewer on the last page) and provide correct page count information.

**Validates: Requirements 4.7**

### Property 9: Match Update Persistence

*For any* existing match and valid update data, updating the match through the API should persist all changes to the database and return the updated match with all modifications reflected.

**Validates: Requirements 5.3, 5.4**

### Property 10: Edit Validation Consistency

*For any* invalid match data that would be rejected during creation, attempting to update an existing match with the same invalid data should also be rejected with the same validation error.

**Validates: Requirements 5.5**

### Property 11: Match Deletion with Cascade

*For any* match with associated events, deleting the match should remove both the match and all its associated events from the database.

**Validates: Requirements 6.3, 6.4, 6.5**

### Property 12: Authentication Required

*For any* match management endpoint (create, read, update, delete), making a request without a valid JWT token should be rejected with HTTP 401 Unauthorized.

**Validates: Requirements 7.1, 7.3**

### Property 13: Admin Authorization Required

*For any* match management endpoint and any JWT token without admin role, making a request should be rejected with HTTP 403 Forbidden.

**Validates: Requirements 7.2, 7.4**

### Property 14: Operation Logging

*For any* match creation, update, or deletion operation, the system should create a log entry containing the operation type, match ID, admin user identifier, and timestamp.

**Validates: Requirements 7.5**

### Property 15: Mixed Source Display

*For any* tournament containing both manually created matches and fixture-generated matches, the match list should display all matches regardless of creation method.

**Validates: Requirements 8.2, 8.5**

### Property 16: Spanish Error Messages

*For any* validation error triggered by invalid match data, the error message returned by the backend should be in Spanish.

**Validates: Requirements 9.4**

### Property 17: Error Logging Detail

*For any* error occurring during match operations, the system should log the error with sufficient detail including error type, stack trace, user context, and request data.

**Validates: Requirements 9.5**

### Property 18: Touch Target Size

*For any* interactive element (button, input, link) in the match admin UI on mobile viewports (< 768px), the element should have a minimum tap target size of 44x44 pixels.

**Validates: Requirements 10.5**

### Property 19: Non-Admin Access Denial

*For any* user without admin role, attempting to access the match admin UI should result in redirection to the login page.

**Validates: Requirements 1.3, 1.4**

### Property 20: Form Pre-population on Edit

*For any* existing match, opening the edit form should pre-populate all form fields with the current match data.

**Validates: Requirements 5.2**


## Error Handling

### Backend Error Handling

#### Validation Errors (HTTP 400)

**Scenarios:**
- Missing required fields (torneoId, jornada, equipoLocalId, equipoVisitaId, fechaHora)
- Invalid data types or formats
- Matchday less than 1
- Same team for home and away
- Invalid estado value

**Response Format:**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": {
    "jornada": ["Jornada debe ser mayor a 0"],
    "equipoLocalId": ["Un equipo no puede jugar contra sí mismo"]
  }
}
```

**Implementation:**
- Use Data Annotations on DTOs for basic validation
- Custom validation logic in service layer for business rules
- Return descriptive Spanish error messages
- Log validation errors at Warning level

#### Authentication Errors (HTTP 401)

**Scenarios:**
- Missing JWT token
- Expired JWT token
- Invalid JWT signature

**Response Format:**
```json
{
  "success": false,
  "message": "No autorizado. Token inválido o expirado."
}
```

**Implementation:**
- Handled by JWT middleware
- Frontend redirects to login page
- Log authentication failures at Warning level

#### Authorization Errors (HTTP 403)

**Scenarios:**
- Valid token but missing admin role
- Token has been revoked

**Response Format:**
```json
{
  "success": false,
  "message": "Acceso denegado. Se requiere rol de administrador."
}
```

**Implementation:**
- Handled by [Authorize(Policy = "AdminOnly")] attribute
- Log authorization failures at Warning level with user ID

#### Not Found Errors (HTTP 404)

**Scenarios:**
- Match ID doesn't exist (for update/delete operations)
- Referenced tournament doesn't exist
- Referenced team doesn't exist

**Response Format:**
```json
{
  "success": false,
  "message": "Partido no encontrado"
}
```

**Implementation:**
- Check existence before update/delete operations
- Return 404 with descriptive message
- Log at Information level

#### Database Errors (HTTP 500)

**Scenarios:**
- Connection timeout
- Constraint violations
- Supabase service unavailable

**Response Format:**
```json
{
  "success": false,
  "message": "Error al guardar el partido. Intente nuevamente."
}
```

**Implementation:**
- Catch all database exceptions
- Log full exception details at Error level
- Return generic user-friendly message (don't expose internal details)
- Include correlation ID for troubleshooting

### Frontend Error Handling

#### Form Validation Errors

**Display:**
- Inline error messages below each invalid field
- Red border on invalid inputs
- Disable submit button until form is valid

**Messages:**
- "Torneo es requerido"
- "Jornada es requerida"
- "Jornada debe ser mayor a 0"
- "Equipo Local es requerido"
- "Equipo Visitante es requerido"
- "Un equipo no puede jugar contra sí mismo"
- "Fecha y Hora son requeridas"

#### API Errors

**Display:**
- Toast notification at top of screen
- Auto-dismiss after 5 seconds
- Error icon and red color scheme

**Handling:**
- Parse backend error response
- Display specific error messages from backend
- Fallback to generic message if parsing fails

#### Network Errors

**Display:**
- Toast notification: "No se puede conectar con el servidor. Verifique su conexión."
- Retry button in notification

**Handling:**
- Detect network failures (timeout, no connection)
- Allow user to retry operation
- Log network errors to console

#### Session Expiration

**Display:**
- Modal dialog: "Su sesión ha expirado"
- Redirect to login page after 3 seconds

**Handling:**
- Detect 401 responses
- Clear local storage
- Redirect to /login with returnUrl parameter

### Error Logging Strategy

**Backend Logging Levels:**
- **Error**: Database failures, unexpected exceptions, system errors
- **Warning**: Validation failures, authentication/authorization failures
- **Information**: Successful operations, match created/updated/deleted
- **Debug**: Detailed operation flow (development only)

**Log Entry Format:**
```
[Timestamp] [Level] [CorrelationId] [UserId] [Action] [Message] [Details]
```

**Example:**
```
2024-01-15 10:30:45 [Information] [abc-123] [user-456] [CreatePartido] 
Match created successfully [PartidoId: xyz-789, TorneoId: def-012]
```

**Frontend Logging:**
- Console errors for development
- Send critical errors to backend logging endpoint (future enhancement)
- Include user context and action being performed


## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples and edge cases
- UI component rendering and interactions
- Integration points between components
- Error conditions and boundary cases

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Business rule validation across many scenarios
- Data integrity and consistency

Both approaches are complementary and necessary for production-ready code.

### Backend Testing

#### Unit Tests (xUnit + Moq)

**PartidosController Tests:**
```csharp
// Specific examples
- CreatePartido_WithValidData_ReturnsCreatedResult
- CreatePartido_WithSameTeams_ReturnsBadRequest
- UpdatePartido_WithNonExistentId_ReturnsNotFound
- DeletePartido_RemovesFromDatabase

// Edge cases
- CreatePartido_WithoutToken_ReturnsUnauthorized
- CreatePartido_WithNonAdminToken_ReturnsForbidden
- CreatePartido_WithInvalidMatchday_ReturnsBadRequest
- UpdatePartido_OnFinalizedMatch_ShowsWarning

// Error conditions
- CreatePartido_WhenDatabaseFails_ReturnsInternalServerError
- GetAllPartidos_WhenServiceThrows_HandlesGracefully
```

**PartidosService Tests:**
```csharp
// Integration with Supabase
- CreatePartidoAsync_InsertsToDatabase
- GetAllPartidosAsync_ReturnsWithJoinedData
- DeletePartidoAsync_CascadesEvents

// Business logic
- CreatePartidoAsync_ValidatesTeamsDifferent
- UpdatePartidoAsync_OnlyUpdatesProvidedFields
- GetAllPartidosAsync_AppliesFiltersCorrectly
```

#### Property-Based Tests (FsCheck or CsCheck)

**Configuration:**
- Minimum 100 iterations per test
- Custom generators for domain objects
- Shrinking enabled for minimal failing examples

**Test 1: Valid Match Creation**
```csharp
// Feature: admin-match-management, Property 1: Valid Match Creation
[Property(Arbitrary = new[] { typeof(MatchGenerators) })]
public Property ValidMatchCreation_PersistsAllFields(ValidMatchData data)
{
    // Generate valid match with different teams, valid IDs, positive matchday
    var dto = new CreatePartidoDto { /* from data */ };
    var result = _service.CreatePartidoAsync(dto).Result;
    
    return (result.TorneoId == dto.TorneoId &&
            result.Jornada == dto.Jornada &&
            result.EquipoLocalId == dto.EquipoLocalId &&
            result.EquipoVisitaId == dto.EquipoVisitaId)
            .ToProperty();
}
```

**Test 2: Same Team Rejection**
```csharp
// Feature: admin-match-management, Property 2: Same Team Rejection
[Property]
public Property SameTeam_IsRejected(Guid teamId, ValidMatchData data)
{
    var dto = new CreatePartidoDto 
    { 
        EquipoLocalId = teamId,
        EquipoVisitaId = teamId,
        /* other valid fields */
    };
    
    return Prop.Throws<ValidationException>(
        () => _service.CreatePartidoAsync(dto).Wait());
}
```

**Test 3: Invalid Matchday Rejection**
```csharp
// Feature: admin-match-management, Property 3: Invalid Matchday Rejection
[Property]
public Property InvalidMatchday_IsRejected(NegativeInt matchday)
{
    var dto = new CreatePartidoDto 
    { 
        Jornada = matchday.Get,
        /* other valid fields */
    };
    
    return Prop.Throws<ValidationException>(
        () => _service.CreatePartidoAsync(dto).Wait());
}
```

**Test 4: Backend Required Field Validation**
```csharp
// Feature: admin-match-management, Property 4: Backend Required Field Validation
[Property]
public Property MissingRequiredField_IsRejected(RequiredField field)
{
    var dto = CreateDtoWithMissingField(field);
    
    return Prop.Throws<ValidationException>(
        () => _service.CreatePartidoAsync(dto).Wait());
}
```

**Test 7: Tournament Filtering**
```csharp
// Feature: admin-match-management, Property 7: Tournament Filtering
[Property]
public Property TournamentFilter_ReturnsOnlyMatchingMatches(
    Guid tournamentId, 
    List<Partido> matches)
{
    // Setup: Insert matches from multiple tournaments
    var filtered = _service.GetAllPartidosAsync(
        torneoId: tournamentId, 
        estado: null, 
        page: 1, 
        pageSize: 100).Result;
    
    return filtered.Items.All(m => m.TorneoId == tournamentId)
            .ToProperty();
}
```

**Test 11: Match Deletion with Cascade**
```csharp
// Feature: admin-match-management, Property 11: Match Deletion with Cascade
[Property]
public Property DeleteMatch_CascadesEvents(Partido match, List<EventoPartido> events)
{
    // Setup: Create match with events
    var matchId = _service.CreatePartidoAsync(match).Result.Id;
    foreach (var evt in events)
    {
        evt.PartidoId = matchId;
        _eventService.CreateAsync(evt).Wait();
    }
    
    // Act: Delete match
    _service.DeletePartidoAsync(matchId).Wait();
    
    // Assert: Match and events are gone
    var matchExists = _service.GetPartidoByIdAsync(matchId).Result != null;
    var eventsExist = _eventService.GetByPartidoAsync(matchId).Result.Any();
    
    return (!matchExists && !eventsExist).ToProperty();
}
```

### Frontend Testing

#### Unit Tests (Jasmine + Karma)

**AdminPartidosComponent Tests:**
```typescript
// Component rendering
describe('AdminPartidosComponent', () => {
  it('should display create button', () => {
    // Validates: Requirement 2.1
  });
  
  it('should show form when create button clicked', () => {
    // Validates: Requirement 2.2
  });
  
  it('should display all form fields', () => {
    // Validates: Requirements 2.3-2.9
  });
  
  it('should show error when same team selected', () => {
    // Validates: Requirement 2.11 (edge case)
  });
  
  it('should display success notification after creation', () => {
    // Validates: Requirement 2.12
  });
});

// Form validation
describe('Match Form Validation', () => {
  it('should show error for missing tournament', () => {
    // Validates: Requirement 3.1 (edge case)
  });
  
  it('should show error for missing matchday', () => {
    // Validates: Requirement 3.2 (edge case)
  });
  
  it('should show error for invalid matchday', () => {
    // Validates: Requirement 3.6
  });
});

// List and filtering
describe('Match List', () => {
  it('should display all matches in table', () => {
    // Validates: Requirement 4.1
  });
  
  it('should show filter controls', () => {
    // Validates: Requirement 4.4 (example)
  });
  
  it('should filter by tournament', () => {
    // Validates: Requirement 4.5
  });
  
  it('should show pagination for many matches', () => {
    // Validates: Requirement 4.7
  });
});

// Edit and delete
describe('Match Operations', () => {
  it('should show edit button for each match', () => {
    // Validates: Requirement 5.1 (example)
  });
  
  it('should pre-populate form on edit', () => {
    // Validates: Requirement 5.2
  });
  
  it('should show delete confirmation', () => {
    // Validates: Requirement 6.2 (example)
  });
  
  it('should not delete when cancelled', () => {
    // Validates: Requirement 6.6 (example)
  });
});

// Responsive design
describe('Responsive Behavior', () => {
  it('should render correctly on desktop', () => {
    // Validates: Requirement 10.1 (example)
  });
  
  it('should adapt layout on mobile', () => {
    // Validates: Requirement 10.3 (example)
  });
});
```

**AdminPartidosService Tests:**
```typescript
describe('AdminPartidosService', () => {
  it('should call correct endpoint for create', () => {
    // Validates API integration
  });
  
  it('should handle 401 errors', () => {
    // Validates: Requirement 7.3 (edge case)
  });
  
  it('should handle 403 errors', () => {
    // Validates: Requirement 7.4 (edge case)
  });
  
  it('should handle network errors', () => {
    // Validates: Requirement 9.2 (edge case)
  });
});
```

#### Property-Based Tests (fast-check)

**Configuration:**
- Minimum 100 runs per property
- Custom arbitraries for domain models
- Replay capability for debugging

**Test 1: Valid Match Creation (Frontend)**
```typescript
// Feature: admin-match-management, Property 1: Valid Match Creation
it('should create match with any valid data', () => {
  fc.assert(
    fc.property(
      validMatchArbitrary(),
      (matchData) => {
        const result = service.createPartido(matchData);
        return result.pipe(
          map(response => response.success === true)
        ).toPromise();
      }
    ),
    { numRuns: 100 }
  );
});
```

**Test 5: Match List Display**
```typescript
// Feature: admin-match-management, Property 5: Match List Display
it('should display all fields for any match', () => {
  fc.assert(
    fc.property(
      fc.array(validMatchArbitrary(), { minLength: 1, maxLength: 10 }),
      (matches) => {
        component.partidos.set(matches);
        fixture.detectChanges();
        
        const rows = fixture.nativeElement.querySelectorAll('tbody tr');
        return rows.length === matches.length &&
               Array.from(rows).every((row: any) => {
                 return row.textContent.includes('Torneo') &&
                        row.textContent.includes('Jornada') &&
                        row.textContent.includes('vs');
               });
      }
    ),
    { numRuns: 100 }
  );
});
```

**Test 6: Default Date Sorting**
```typescript
// Feature: admin-match-management, Property 6: Default Date Sorting
it('should sort matches by date descending', () => {
  fc.assert(
    fc.property(
      fc.array(validMatchArbitrary(), { minLength: 2, maxLength: 20 }),
      (matches) => {
        component.partidos.set(matches);
        component.sortByDate();
        
        const sorted = component.partidos();
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i].fechaHora < sorted[i + 1].fechaHora) {
            return false;
          }
        }
        return true;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Tests

**End-to-End Scenarios (Playwright or Cypress):**

1. **Complete CRUD Flow**
   - Login as admin
   - Navigate to /admin/partidos
   - Create new match
   - Verify match appears in list
   - Edit match
   - Verify changes persist
   - Delete match
   - Verify match removed

2. **Authorization Flow**
   - Attempt access without login → redirected
   - Login as non-admin → access denied
   - Login as admin → access granted

3. **Validation Flow**
   - Try to create match with same teams → error shown
   - Try to create match with invalid matchday → error shown
   - Submit valid match → success

4. **Filtering and Pagination**
   - Create 25 matches
   - Verify pagination appears
   - Apply tournament filter
   - Verify only matching matches shown

### Test Data Generators

**Backend (C#):**
```csharp
public static class MatchGenerators
{
    public static Arbitrary<ValidMatchData> ValidMatch() =>
        Arb.From(
            from torneoId in Arb.Generate<Guid>()
            from jornada in Gen.Choose(1, 20)
            from localId in Arb.Generate<Guid>()
            from visitaId in Arb.Generate<Guid>().Where(id => id != localId)
            from fecha in Arb.Generate<DateTime>().Where(d => d > DateTime.Now)
            from estadio in Arb.Generate<NonEmptyString>()
            select new ValidMatchData(torneoId, jornada, localId, visitaId, fecha, estadio)
        );
}
```

**Frontend (TypeScript):**
```typescript
const validMatchArbitrary = () => fc.record({
  torneoId: fc.uuid(),
  jornada: fc.integer({ min: 1, max: 20 }),
  equipoLocalId: fc.uuid(),
  equipoVisitaId: fc.uuid(),
  fechaHora: fc.date({ min: new Date() }),
  estadio: fc.string({ minLength: 3, maxLength: 50 }),
  estado: fc.constantFrom('programado', 'en_vivo', 'finalizado', 'suspendido')
}).filter(match => match.equipoLocalId !== match.equipoVisitaId);
```

### Coverage Goals

**Backend:**
- Line coverage: > 80%
- Branch coverage: > 75%
- All properties tested with 100+ iterations

**Frontend:**
- Component coverage: > 80%
- Service coverage: > 90%
- All properties tested with 100+ runs

### Continuous Integration

**CI Pipeline:**
1. Run unit tests (fast feedback)
2. Run property-based tests (comprehensive validation)
3. Run integration tests (E2E scenarios)
4. Generate coverage reports
5. Fail build if coverage drops below thresholds

**Test Execution Time:**
- Unit tests: < 30 seconds
- Property tests: < 2 minutes
- Integration tests: < 5 minutes
- Total: < 8 minutes

