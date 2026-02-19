# Implementation Plan: Admin Match Management

## Overview

Este plan implementa la funcionalidad completa de administración de partidos para SportZone Pro, permitiendo a los administradores crear, editar, listar y eliminar partidos desde la interfaz web. La implementación se divide en tres fases principales: Backend (DTOs, endpoints, servicios), Frontend (componentes, servicios, UI), y Testing (unit tests y property-based tests).

**Stack Tecnológico:**
- Backend: .NET 8 con Supabase (PostgreSQL)
- Frontend: Angular 17 con Standalone Components
- Testing Backend: xUnit + FsCheck/CsCheck
- Testing Frontend: Jasmine/Karma + fast-check

## Tasks

- [ ] 1. Backend - DTOs y Modelos
  - [x] 1.1 Crear DTOs para operaciones CRUD
    - Crear `CreatePartidoDto.cs` con propiedades: TorneoId, Jornada, EquipoLocalId, EquipoVisitaId, FechaHora, Estadio, Estado
    - Crear `UpdatePartidoDto.cs` con propiedades opcionales (nullable)
    - Crear `PartidoAdminDto.cs` con información extendida (nombres de torneo y equipos)
    - Agregar Data Annotations para validación básica (Required, Range)
    - _Requisitos: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 1.2 Escribir unit tests para DTOs
    - Validar que Data Annotations funcionen correctamente
    - Probar casos de validación de campos requeridos
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 2. Backend - Extensión de Servicios
  - [x] 2.1 Extender IPartidosService con métodos CRUD
    - Agregar firma `Task<PartidoAdminDto> CreatePartidoAsync(CreatePartidoDto dto)`
    - Agregar firma `Task<PagedResult<PartidoAdminDto>> GetAllPartidosAsync(Guid? torneoId, string? estado, int page, int pageSize)`
    - Agregar firma `Task<PartidoAdminDto?> GetPartidoByIdAsync(Guid id)`
    - Agregar firma `Task<PartidoAdminDto> UpdatePartidoAsync(Guid id, UpdatePartidoDto dto)`
    - Agregar firma `Task DeletePartidoAsync(Guid id)`
    - _Requisitos: 2.10, 4.1, 5.3, 6.3_

  - [x] 2.2 Implementar CreatePartidoAsync en PartidosService
    - Validar que EquipoLocalId != EquipoVisitaId
    - Insertar partido en tabla "partidos" usando Supabase client
    - Consultar partido creado con JOINs para obtener nombres (torneos, equipos)
    - Retornar PartidoAdminDto con toda la información
    - Agregar logging de operación con user ID
    - Manejar excepciones de base de datos
    - _Requisitos: 2.10, 2.11, 2.12, 7.5, 9.1_

  - [ ]* 2.3 Escribir property test para CreatePartidoAsync
    - **Property 1: Valid Match Creation**
    - **Valida: Requisitos 2.10, 2.12**
    - Generar datos válidos de partido con equipos diferentes
    - Verificar que todos los campos se persisten correctamente
    - Ejecutar 100+ iteraciones

  - [ ]* 2.4 Escribir property test para validación de equipos iguales
    - **Property 2: Same Team Rejection**
    - **Valida: Requisito 2.11**
    - Generar partido con mismo equipo local y visitante
    - Verificar que se rechaza con ValidationException

  - [x] 2.5 Implementar GetAllPartidosAsync en PartidosService
    - Construir query con JOINs a torneos y equipos
    - Aplicar filtros opcionales (torneoId, estado)
    - Ordenar por fecha_hora DESC por defecto
    - Implementar paginación (page, pageSize)
    - Retornar PagedResult<PartidoAdminDto> con total de registros
    - _Requisitos: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7_

  - [ ]* 2.6 Escribir property test para filtrado por torneo
    - **Property 7: Tournament Filtering**
    - **Valida: Requisitos 4.5, 4.6**
    - Crear partidos de múltiples torneos
    - Aplicar filtro de torneo
    - Verificar que solo retorna partidos del torneo seleccionado

  - [ ]* 2.7 Escribir property test para paginación
    - **Property 8: Pagination Behavior**
    - **Valida: Requisito 4.7**
    - Crear más de 20 partidos
    - Verificar que cada página retorna máximo 20 items
    - Verificar que última página puede tener menos items

  - [x] 2.8 Implementar GetPartidoByIdAsync en PartidosService
    - Consultar partido por ID con JOINs
    - Retornar PartidoAdminDto o null si no existe
    - _Requisitos: 5.2_

  - [x] 2.9 Implementar UpdatePartidoAsync en PartidosService
    - Verificar que partido existe (retornar 404 si no)
    - Validar equipos diferentes si se modifican
    - Actualizar solo campos proporcionados (no-null en UpdatePartidoDto)
    - Consultar partido actualizado con JOINs
    - Retornar PartidoAdminDto actualizado
    - Agregar logging de operación
    - _Requisitos: 5.3, 5.4, 5.5, 7.5_

  - [ ]* 2.10 Escribir property test para UpdatePartidoAsync
    - **Property 9: Match Update Persistence**
    - **Valida: Requisitos 5.3, 5.4**
    - Crear partido, luego actualizarlo con datos válidos
    - Verificar que todos los cambios se persisten

  - [ ]* 2.11 Escribir property test para validación en update
    - **Property 10: Edit Validation Consistency**
    - **Valida: Requisito 5.5**
    - Intentar actualizar con datos inválidos
    - Verificar que se rechaza con mismo error que en creación

  - [x] 2.12 Implementar DeletePartidoAsync en PartidosService
    - Verificar que partido existe
    - Eliminar partido (cascade delete automático por FK)
    - Agregar logging de operación
    - _Requisitos: 6.3, 6.4, 6.5, 7.5_

  - [ ]* 2.13 Escribir property test para cascade delete
    - **Property 11: Match Deletion with Cascade**
    - **Valida: Requisitos 6.3, 6.4, 6.5**
    - Crear partido con eventos asociados
    - Eliminar partido
    - Verificar que partido y eventos se eliminaron

- [x] 3. Checkpoint - Verificar servicios backend
  - Ejecutar todos los tests del backend
  - Verificar que property tests pasan con 100+ iteraciones
  - Asegurar que logging funciona correctamente
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [ ] 4. Backend - Endpoints del Controller
  - [x] 4.1 Agregar endpoint POST /api/partidos
    - Agregar atributo `[Authorize(Policy = "AdminOnly")]`
    - Recibir CreatePartidoDto en body
    - Llamar a `CreatePartidoAsync`
    - Retornar 201 Created con PartidoAdminDto
    - Manejar errores de validación (400)
    - Manejar errores de base de datos (500)
    - _Requisitos: 2.10, 7.1, 7.2, 9.1_

  - [x] 4.2 Agregar endpoint GET /api/partidos
    - Agregar atributo `[Authorize(Policy = "AdminOnly")]`
    - Recibir parámetros query: torneoId, estado, page, pageSize
    - Llamar a `GetAllPartidosAsync`
    - Retornar 200 OK con PagedResult
    - _Requisitos: 4.1, 7.1, 7.2_

  - [x] 4.3 Agregar endpoint GET /api/partidos/{id}
    - Agregar atributo `[Authorize(Policy = "AdminOnly")]`
    - Llamar a `GetPartidoByIdAsync`
    - Retornar 200 OK si existe, 404 si no existe
    - _Requisitos: 5.2, 7.1, 7.2_

  - [x] 4.4 Agregar endpoint PUT /api/partidos/{id}
    - Agregar atributo `[Authorize(Policy = "AdminOnly")]`
    - Recibir UpdatePartidoDto en body
    - Llamar a `UpdatePartidoAsync`
    - Retornar 200 OK con PartidoAdminDto actualizado
    - Manejar 404 si no existe
    - _Requisitos: 5.3, 7.1, 7.2_

  - [x] 4.5 Agregar endpoint DELETE /api/partidos/{id}
    - Agregar atributo `[Authorize(Policy = "AdminOnly")]`
    - Llamar a `DeletePartidoAsync`
    - Retornar 204 No Content
    - Manejar 404 si no existe
    - _Requisitos: 6.3, 7.1, 7.2_

  - [ ]* 4.6 Escribir unit tests para endpoints del controller
    - Probar respuestas correctas (201, 200, 204)
    - Probar manejo de errores (400, 401, 403, 404, 500)
    - Mockear PartidosService
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 9.1_

  - [ ]* 4.7 Escribir property tests para autenticación y autorización
    - **Property 12: Authentication Required**
    - **Valida: Requisitos 7.1, 7.3**
    - Intentar llamar endpoints sin token
    - Verificar que retorna 401
    - **Property 13: Admin Authorization Required**
    - **Valida: Requisitos 7.2, 7.4**
    - Intentar llamar endpoints con token sin rol admin
    - Verificar que retorna 403

- [ ] 5. Frontend - Modelos TypeScript
  - [x] 5.1 Crear modelos de partido para admin
    - Crear archivo `partido-admin.model.ts` en `src/app/core/models/`
    - Definir interface `CreatePartidoRequest` con campos requeridos
    - Definir interface `UpdatePartidoRequest` con campos opcionales
    - Definir interface `PartidoAdmin` con información completa (incluye nombres)
    - Definir type `EstadoPartido` con valores: 'programado' | 'en_vivo' | 'finalizado' | 'suspendido'
    - _Requisitos: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 6. Frontend - Servicio Angular
  - [x] 6.1 Crear AdminPartidosService
    - Crear archivo `admin-partidos.service.ts` en `src/app/core/services/`
    - Inyectar ApiService (o HttpClient)
    - Implementar método `createPartido(data: CreatePartidoRequest): Observable<ApiResponse<PartidoAdmin>>`
    - Implementar método `getAllPartidos(filters?: PartidoFilters): Observable<ApiResponse<PagedResult<PartidoAdmin>>>`
    - Implementar método `getPartidoById(id: string): Observable<ApiResponse<PartidoAdmin>>`
    - Implementar método `updatePartido(id: string, data: UpdatePartidoRequest): Observable<ApiResponse<PartidoAdmin>>`
    - Implementar método `deletePartido(id: string): Observable<ApiResponse<void>>`
    - Agregar manejo de errores con catchError
    - _Requisitos: 2.10, 4.1, 5.3, 6.3_

  - [ ]* 6.2 Escribir unit tests para AdminPartidosService
    - Mockear HttpClient
    - Verificar que llama endpoints correctos
    - Probar manejo de errores (401, 403, 500)
    - _Requisitos: 7.3, 7.4, 9.2_

- [ ] 7. Frontend - Componente de Administración
  - [x] 7.1 Crear AdminPartidosComponent
    - Crear archivo `admin-partidos.component.ts` en `src/app/features/admin/`
    - Configurar como standalone component
    - Inyectar AdminPartidosService, FormBuilder, Router
    - Crear signals para estado: `partidos`, `torneos`, `equipos`, `loading`, `error`
    - Crear FormGroup reactivo con campos: torneoId, jornada, equipoLocalId, equipoVisitaId, fechaHora, estadio, estado
    - Agregar validadores: required, min(1) para jornada, custom validator para equipos diferentes
    - _Requisitos: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 7.2 Implementar método loadPartidos
    - Llamar a `adminPartidosService.getAllPartidos()`
    - Actualizar signal `partidos` con resultado
    - Manejar loading state
    - Manejar errores y mostrar en UI
    - _Requisitos: 4.1, 4.2, 9.2_

  - [x] 7.3 Implementar método loadTorneosYEquipos
    - Cargar lista de torneos activos para selector
    - Cargar lista de todos los equipos para selectores
    - Actualizar signals correspondientes
    - _Requisitos: 2.3, 2.5, 2.6_

  - [x] 7.4 Implementar método openCreateModal
    - Resetear formulario
    - Establecer modo "crear"
    - Mostrar modal de formulario
    - _Requisitos: 2.1, 2.2_

  - [x] 7.5 Implementar método openEditModal
    - Cargar datos del partido seleccionado
    - Pre-poblar formulario con datos actuales
    - Establecer modo "editar"
    - Mostrar modal de formulario
    - Si estado es "finalizado", mostrar warning
    - _Requisitos: 5.1, 5.2, 5.6_

  - [ ]* 7.6 Escribir property test para pre-población de formulario
    - **Property 20: Form Pre-population on Edit**
    - **Valida: Requisito 5.2**
    - Generar partido aleatorio
    - Abrir modal de edición
    - Verificar que todos los campos tienen valores correctos

  - [x] 7.7 Implementar método onSubmit
    - Validar formulario
    - Si modo "crear", llamar a `createPartido`
    - Si modo "editar", llamar a `updatePartido`
    - Mostrar notificación de éxito
    - Cerrar modal
    - Recargar lista de partidos
    - Manejar errores y mostrar mensajes
    - _Requisitos: 2.10, 2.12, 5.3, 5.4, 9.1, 9.2_

  - [x] 7.8 Implementar método onDelete
    - Mostrar modal de confirmación con mensaje
    - Si usuario confirma, llamar a `deletePartido`
    - Mostrar notificación de éxito
    - Recargar lista de partidos
    - Si usuario cancela, cerrar modal sin eliminar
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.6_

  - [x] 7.9 Implementar filtros y paginación
    - Agregar controles de filtro para torneo y estado
    - Implementar método `applyFilters` que recarga partidos con filtros
    - Agregar controles de paginación
    - Implementar métodos `nextPage`, `prevPage`, `goToPage`
    - _Requisitos: 4.4, 4.5, 4.6, 4.7_

  - [ ]* 7.10 Escribir unit tests para AdminPartidosComponent
    - Probar renderizado de botón "Crear Nuevo Partido"
    - Probar apertura de modal al hacer clic
    - Probar validación de formulario (campos requeridos)
    - Probar validación de equipos iguales
    - Probar display de lista de partidos
    - Probar filtrado por torneo
    - Probar paginación
    - Probar confirmación de eliminación
    - _Requisitos: 2.1, 2.2, 2.11, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.5, 4.7, 6.2, 6.6_

- [ ] 8. Frontend - Template HTML
  - [x] 8.1 Crear template de AdminPartidosComponent
    - Crear archivo `admin-partidos.component.html`
    - Agregar header con título "Administración de Partidos"
    - Agregar botón "Crear Nuevo Partido" con evento click
    - Agregar sección de filtros (select de torneo, select de estado)
    - Agregar tabla con columnas: Torneo, Jornada, Equipos, Fecha, Estadio, Estado, Acciones
    - Agregar botones "Editar" y "Eliminar" en columna Acciones
    - Agregar controles de paginación
    - Agregar modal de formulario (crear/editar)
    - Agregar modal de confirmación de eliminación
    - Mostrar mensajes de error inline en formulario
    - Mostrar loading spinner cuando corresponda
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 4.1, 4.2, 4.4, 4.7, 5.1, 6.1, 6.2_

  - [x] 8.2 Agregar validación visual en formulario
    - Mostrar mensajes de error debajo de cada campo inválido
    - Agregar borde rojo a inputs inválidos
    - Deshabilitar botón submit si formulario inválido
    - Mostrar mensajes en español según requisitos
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 2.11_

- [ ] 9. Frontend - Estilos SCSS
  - [x] 9.1 Crear estilos para AdminPartidosComponent
    - Crear archivo `admin-partidos.component.scss`
    - Estilos para header y botón de crear
    - Estilos para sección de filtros
    - Estilos para tabla responsiva
    - Estilos para botones de acciones
    - Estilos para modales
    - Estilos para formulario y validaciones
    - Estilos para paginación
    - Media queries para responsive design (desktop >= 1024px, tablet >= 768px, mobile < 768px)
    - Asegurar tap targets de 44x44px en mobile
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 9.2 Escribir property test para touch targets en mobile
    - **Property 18: Touch Target Size**
    - **Valida: Requisito 10.5**
    - Simular viewport mobile (< 768px)
    - Verificar que todos los botones tienen mínimo 44x44px

- [ ] 10. Checkpoint - Verificar componente frontend
  - Ejecutar tests del componente
  - Verificar que formulario valida correctamente
  - Probar responsive design en diferentes viewports
  - Asegurar que todos los mensajes están en español
  - Preguntar al usuario si hay ajustes de UI necesarios

- [ ] 11. Frontend - Routing y Guards
  - [x] 11.1 Agregar ruta de administración de partidos
    - Editar `app.routes.ts`
    - Agregar ruta: `{ path: 'admin/partidos', component: AdminPartidosComponent, canActivate: [adminGuard] }`
    - Verificar que adminGuard existe y funciona correctamente
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2_

  - [ ]* 11.2 Escribir property test para acceso no autorizado
    - **Property 19: Non-Admin Access Denial**
    - **Valida: Requisitos 1.3, 1.4**
    - Intentar acceder sin token o con token no-admin
    - Verificar redirección a login

  - [x] 11.3 Agregar enlace en menú de navegación
    - Editar componente de navbar/menú admin
    - Agregar enlace "Gestión de Partidos" visible solo para admins
    - Enlazar a `/admin/partidos`
    - _Requisitos: 1.1, 1.2_

- [ ] 12. Integration Testing
  - [ ]* 12.1 Escribir test E2E de flujo completo CRUD
    - Login como admin
    - Navegar a /admin/partidos
    - Crear nuevo partido
    - Verificar que aparece en lista
    - Editar partido
    - Verificar cambios
    - Eliminar partido
    - Verificar que se eliminó
    - _Requisitos: 2.10, 2.12, 5.3, 5.4, 6.3, 6.4_

  - [ ]* 12.2 Escribir test E2E de flujo de autorización
    - Intentar acceder sin login → redirigir
    - Login como usuario no-admin → acceso denegado
    - Login como admin → acceso permitido
    - _Requisitos: 1.3, 1.4, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 12.3 Escribir test E2E de validación
    - Intentar crear partido con equipos iguales → error
    - Intentar crear partido con jornada inválida → error
    - Crear partido con datos válidos → éxito
    - _Requisitos: 2.11, 3.6_

  - [ ]* 12.4 Escribir test E2E de filtrado y paginación
    - Crear 25 partidos de diferentes torneos
    - Verificar que aparece paginación
    - Aplicar filtro de torneo
    - Verificar que solo muestra partidos del torneo
    - Navegar entre páginas
    - _Requisitos: 4.5, 4.6, 4.7_

- [ ] 13. Property-Based Tests Adicionales
  - [ ]* 13.1 Escribir property test para validación de campos requeridos
    - **Property 4: Backend Required Field Validation**
    - **Valida: Requisito 3.7**
    - Generar DTOs con campos requeridos faltantes
    - Verificar que backend rechaza con ValidationException

  - [ ]* 13.2 Escribir property test para ordenamiento por fecha
    - **Property 6: Default Date Sorting**
    - **Valida: Requisito 4.3**
    - Crear partidos con fechas aleatorias
    - Obtener lista sin especificar orden
    - Verificar que están ordenados por fecha DESC

  - [ ]* 13.3 Escribir property test para logging de operaciones
    - **Property 14: Operation Logging**
    - **Valida: Requisito 7.5**
    - Ejecutar operaciones CRUD
    - Verificar que cada operación genera log con user ID y timestamp

  - [ ]* 13.4 Escribir property test para display de partidos mixtos
    - **Property 15: Mixed Source Display**
    - **Valida: Requisitos 8.2, 8.5**
    - Crear partidos manualmente y con fixture generator
    - Obtener lista
    - Verificar que muestra ambos tipos

  - [ ]* 13.5 Escribir property test para mensajes en español
    - **Property 16: Spanish Error Messages**
    - **Valida: Requisito 9.4**
    - Generar errores de validación
    - Verificar que mensajes están en español

  - [ ]* 13.6 Escribir property test para logging de errores
    - **Property 17: Error Logging Detail**
    - **Valida: Requisito 9.5**
    - Forzar errores en operaciones
    - Verificar que logs contienen stack trace, user context, request data

- [x] 14. Checkpoint Final - Verificación Completa
  - Ejecutar todos los tests (unit + property + integration)
  - Verificar cobertura de código (backend > 80%, frontend > 80%)
  - Probar manualmente flujo completo en navegador
  - Verificar que todos los requisitos están cubiertos
  - Verificar que todas las 20 propiedades tienen tests
  - Revisar logs para asegurar que operaciones se registran
  - Preguntar al usuario si desea ajustes o mejoras adicionales

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos que implementa para trazabilidad
- Los property tests validan propiedades universales con 100+ iteraciones
- Los unit tests validan ejemplos específicos y casos edge
- Los checkpoints permiten validación incremental y feedback del usuario
- La implementación mantiene compatibilidad total con el sistema existente
- Todos los mensajes de error deben estar en español
- El diseño es completamente responsivo (desktop, tablet, mobile)
