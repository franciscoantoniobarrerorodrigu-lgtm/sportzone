# Requirements Document

## Introduction

Esta especificación define la funcionalidad de administración de partidos para SportZone Pro, un sistema de gestión de ligas deportivas. Actualmente, los partidos solo pueden crearse mediante el generador automático de fixtures o directamente en la base de datos usando SQL. Esta funcionalidad permitirá a los administradores crear, editar y eliminar partidos individuales desde la interfaz web, proporcionando mayor flexibilidad en la gestión de calendarios deportivos.

## Glossary

- **Match_Admin_UI**: Interfaz de usuario web para administración de partidos
- **Match_Service**: Servicio backend que gestiona operaciones CRUD de partidos
- **Admin_User**: Usuario con rol "admin" autenticado en el sistema
- **Match**: Entidad que representa un partido deportivo con equipos, fecha, estadio y estado
- **Tournament**: Torneo o competición deportiva que contiene múltiples partidos
- **Matchday**: Jornada o fecha específica dentro de un torneo
- **Team**: Equipo deportivo que participa en partidos
- **Stadium**: Estadio o lugar donde se juega un partido
- **Match_Status**: Estado del partido (programado, en_vivo, finalizado, suspendido)
- **JWT_Token**: Token de autenticación que contiene información del rol del usuario
- **Fixture_Generator**: Sistema existente que genera partidos automáticamente

## Requirements

### Requirement 1: Acceso a Página de Administración de Partidos

**User Story:** Como administrador, quiero acceder a una página dedicada de administración de partidos, para poder gestionar partidos de forma centralizada.

#### Acceptance Criteria

1. THE Match_Admin_UI SHALL be accessible at route "/admin/partidos"
2. WHEN an Admin_User navigates to "/admin/partidos", THE Match_Admin_UI SHALL display the match management interface
3. WHEN a non-admin user attempts to access "/admin/partidos", THE Match_Admin_UI SHALL redirect to the login page
4. THE Match_Admin_UI SHALL verify the JWT_Token contains role "admin" before rendering

### Requirement 2: Crear Nuevo Partido

**User Story:** Como administrador, quiero crear un nuevo partido mediante un formulario, para poder agregar partidos individuales sin usar SQL.

#### Acceptance Criteria

1. THE Match_Admin_UI SHALL display a button labeled "Crear Nuevo Partido"
2. WHEN the Admin_User clicks "Crear Nuevo Partido", THE Match_Admin_UI SHALL display a match creation form
3. THE Match_Admin_UI SHALL include a Tournament selector populated with active tournaments
4. THE Match_Admin_UI SHALL include a Matchday number input field
5. THE Match_Admin_UI SHALL include a Team selector for home team populated with all teams
6. THE Match_Admin_UI SHALL include a Team selector for away team populated with all teams
7. THE Match_Admin_UI SHALL include a date and time picker for match schedule
8. THE Match_Admin_UI SHALL include a Stadium text input field
9. THE Match_Admin_UI SHALL include a Match_Status selector with options: programado, en_vivo, finalizado, suspendido
10. WHEN the Admin_User submits the form with valid data, THE Match_Service SHALL create a new Match in the database
11. WHEN the Admin_User submits the form with the same team selected for both home and away, THE Match_Admin_UI SHALL display an error message "Un equipo no puede jugar contra sí mismo"
12. WHEN the Match is successfully created, THE Match_Admin_UI SHALL display a success notification and refresh the match list

### Requirement 3: Validación de Datos del Partido

**User Story:** Como administrador, quiero que el sistema valide los datos del partido, para evitar crear partidos con información incorrecta.

#### Acceptance Criteria

1. WHEN the Admin_User submits a match form without selecting a Tournament, THE Match_Admin_UI SHALL display error "Torneo es requerido"
2. WHEN the Admin_User submits a match form without entering a Matchday, THE Match_Admin_UI SHALL display error "Jornada es requerida"
3. WHEN the Admin_User submits a match form without selecting a home Team, THE Match_Admin_UI SHALL display error "Equipo Local es requerido"
4. WHEN the Admin_User submits a match form without selecting an away Team, THE Match_Admin_UI SHALL display error "Equipo Visitante es requerido"
5. WHEN the Admin_User submits a match form without selecting a date and time, THE Match_Admin_UI SHALL display error "Fecha y Hora son requeridas"
6. WHEN the Admin_User enters a Matchday less than 1, THE Match_Admin_UI SHALL display error "Jornada debe ser mayor a 0"
7. THE Match_Service SHALL validate all required fields before creating or updating a Match

### Requirement 4: Listar Partidos Existentes

**User Story:** Como administrador, quiero ver una lista de todos los partidos existentes, para poder revisar y gestionar el calendario completo.

#### Acceptance Criteria

1. THE Match_Admin_UI SHALL display a table with all existing matches
2. THE Match_Admin_UI SHALL display for each Match: Tournament name, Matchday, home Team, away Team, date and time, Stadium, and Match_Status
3. THE Match_Admin_UI SHALL sort matches by date in descending order by default
4. THE Match_Admin_UI SHALL include filter options for Tournament and Match_Status
5. WHEN the Admin_User applies a Tournament filter, THE Match_Admin_UI SHALL display only matches from the selected Tournament
6. WHEN the Admin_User applies a Match_Status filter, THE Match_Admin_UI SHALL display only matches with the selected status
7. THE Match_Admin_UI SHALL display pagination controls when matches exceed 20 items per page

### Requirement 5: Editar Partido Existente

**User Story:** Como administrador, quiero editar los detalles de un partido existente, para poder corregir información o reprogramar partidos.

#### Acceptance Criteria

1. THE Match_Admin_UI SHALL display an "Editar" button for each Match in the list
2. WHEN the Admin_User clicks "Editar" on a Match, THE Match_Admin_UI SHALL display the match form pre-populated with current Match data
3. WHEN the Admin_User modifies Match data and submits, THE Match_Service SHALL update the Match in the database
4. WHEN the Match is successfully updated, THE Match_Admin_UI SHALL display a success notification and refresh the match list
5. THE Match_Admin_UI SHALL apply the same validation rules as match creation when editing
6. IF the Match has Match_Status "finalizado", THEN THE Match_Admin_UI SHALL display a warning "Este partido ya finalizó. ¿Está seguro de editarlo?"

### Requirement 6: Eliminar Partido

**User Story:** Como administrador, quiero eliminar un partido, para poder remover partidos cancelados o creados por error.

#### Acceptance Criteria

1. THE Match_Admin_UI SHALL display an "Eliminar" button for each Match in the list
2. WHEN the Admin_User clicks "Eliminar" on a Match, THE Match_Admin_UI SHALL display a confirmation dialog "¿Está seguro de eliminar este partido?"
3. WHEN the Admin_User confirms deletion, THE Match_Service SHALL delete the Match from the database
4. WHEN the Match is successfully deleted, THE Match_Admin_UI SHALL display a success notification and refresh the match list
5. IF the Match has associated events or statistics, THEN THE Match_Service SHALL also delete all related data in cascade
6. WHEN the Admin_User cancels the deletion dialog, THE Match_Admin_UI SHALL close the dialog without deleting

### Requirement 7: Autenticación y Autorización

**User Story:** Como sistema, quiero verificar que solo usuarios administradores puedan acceder a la gestión de partidos, para mantener la seguridad e integridad de los datos.

#### Acceptance Criteria

1. THE Match_Service SHALL require a valid JWT_Token for all match management endpoints
2. THE Match_Service SHALL verify the JWT_Token contains role "admin" before processing requests
3. WHEN a request is made without a valid JWT_Token, THE Match_Service SHALL return HTTP 401 Unauthorized
4. WHEN a request is made with a JWT_Token that does not contain role "admin", THE Match_Service SHALL return HTTP 403 Forbidden
5. THE Match_Service SHALL log all match creation, update, and deletion operations with Admin_User identifier

### Requirement 8: Integración con Sistema Existente

**User Story:** Como sistema, quiero que la administración manual de partidos coexista con el generador automático de fixtures, para proporcionar flexibilidad en la gestión.

#### Acceptance Criteria

1. THE Match_Service SHALL use the same database table "partidos" as the Fixture_Generator
2. THE Match_Admin_UI SHALL display matches created both manually and by Fixture_Generator
3. THE Match_Service SHALL maintain compatibility with existing Match data structure
4. THE Match_Service SHALL not interfere with Fixture_Generator operations
5. WHEN a Tournament has matches created by Fixture_Generator, THE Match_Admin_UI SHALL allow Admin_User to create additional matches manually

### Requirement 9: Manejo de Errores

**User Story:** Como administrador, quiero recibir mensajes de error claros cuando algo falla, para poder entender y resolver problemas rápidamente.

#### Acceptance Criteria

1. WHEN the Match_Service encounters a database error, THE Match_Admin_UI SHALL display error "Error al guardar el partido. Intente nuevamente."
2. WHEN the Match_Service is unreachable, THE Match_Admin_UI SHALL display error "No se puede conectar con el servidor. Verifique su conexión."
3. WHEN the Admin_User session expires, THE Match_Admin_UI SHALL redirect to login page with message "Su sesión ha expirado"
4. THE Match_Service SHALL return descriptive error messages in Spanish for all validation failures
5. THE Match_Service SHALL log all errors with sufficient detail for debugging

### Requirement 10: Interfaz Responsiva

**User Story:** Como administrador, quiero usar la administración de partidos desde diferentes dispositivos, para poder gestionar partidos desde cualquier lugar.

#### Acceptance Criteria

1. THE Match_Admin_UI SHALL be fully functional on desktop browsers with viewport width >= 1024px
2. THE Match_Admin_UI SHALL be fully functional on tablet devices with viewport width >= 768px
3. THE Match_Admin_UI SHALL adapt form layout for mobile devices with viewport width < 768px
4. THE Match_Admin_UI SHALL maintain readability and usability across all supported viewport sizes
5. THE Match_Admin_UI SHALL use touch-friendly controls with minimum tap target size of 44x44 pixels on mobile devices
