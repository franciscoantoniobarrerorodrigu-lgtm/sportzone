# Documento de Requerimientos: Sistema Completo SportZone Pro

## Introducción

Este documento especifica los requerimientos completos para SportZone Pro, un sistema integral de gestión de campeonatos deportivos profesionales. El sistema incluye:

- **Portal Web Público/Admin** (Angular 17): Visualización de resultados, tabla de posiciones, goleadores, cronograma
- **App Planillero** (Angular PWA): Aplicación tablet/móvil para registro de eventos en tiempo real desde la cancha
- **Backend API** (.NET 8): Gestión de datos, autenticación, lógica de negocio
- **Base de Datos** (Supabase PostgreSQL): Almacenamiento con Row Level Security
- **Tiempo Real** (SignalR + Supabase Realtime): Actualizaciones instantáneas de marcadores y eventos

El sistema gestiona desde el registro de equipos y jugadores hasta la transmisión en vivo de resultados, con notificaciones push móviles, generación automática de fixture, gestión disciplinaria (tarjetas/suspensiones), y emisión de resoluciones administrativas.

## Glosario

### Roles de Usuario
- **Administrador**: Gestiona todo el sistema (equipos, torneos, usuarios, resoluciones). Acceso total desde PC/Web
- **Planillero**: Registra eventos del partido en vivo (goles, tarjetas, sustituciones) desde tablet/móvil en la cancha
- **Árbitro**: Consulta historial de tarjetas, suspensiones, resoluciones. Acceso de lectura desde PC/Móvil
- **Público**: Ve resultados, tabla de posiciones, goleadores en tiempo real. Solo lectura desde cualquier dispositivo

### Componentes del Sistema
- **Portal_Web**: Aplicación Angular 17 standalone para público y administradores
- **App_Planillero**: Progressive Web App (PWA) Angular 17 optimizada para tablet/móvil
- **API_Backend**: .NET 8 Web API con endpoints REST y SignalR Hub
- **SignalR_Hub**: Hub de comunicación WebSocket en tiempo real (PartidoHub)
- **Supabase_DB**: Base de datos PostgreSQL con Row Level Security y triggers
- **Supabase_Auth**: Sistema de autenticación JWT multi-rol
- **Supabase_Realtime**: Sistema de push de cambios en base de datos
- **Fixture_Generator**: Servicio de generación automática de cronograma sin conflictos
- **Notification_Service**: Servicio de notificaciones push vía FCM para móviles
- **Match_State_Controller**: Controlador de estados del partido (programado → en_curso → finalizado)
- **Suspension_Manager**: Gestor automático de suspensiones por acumulación de tarjetas

## Requerimientos

### Requerimiento 1: Registro de Eventos de Partido

**Historia de Usuario:** Como administrador, quiero registrar eventos de partido a través de una API, para poder actualizar información de partidos en vivo en tiempo real.

#### Criterios de Aceptación

1. CUANDO un administrador envía un evento de gol con ID de partido, ID de equipo, ID de jugador y minuto válidos, EL Admin_API DEBE crear el registro del evento y activar notificaciones
2. CUANDO un administrador envía un evento de tarjeta (amarilla o roja) con datos válidos, EL Admin_API DEBE crear el registro del evento y actualizar las estadísticas del jugador
3. CUANDO un administrador envía un evento de sustitución con IDs de jugadores válidos, EL Admin_API DEBE crear el registro del evento y actualizar las alineaciones del partido
4. CUANDO un administrador envía un evento con ID de partido inválido, EL Admin_API DEBE retornar un error y prevenir la creación del evento
5. CUANDO un administrador envía un evento para un partido que no está en estado "en_curso", EL Admin_API DEBE retornar un error indicando estado de partido inválido
6. CUANDO se registra un evento de gol, EL Event_Processor DEBE actualizar el marcador del partido en la tabla partidos
7. CUANDO se registra cualquier evento, EL Event_Processor DEBE registrarlo en la tabla eventos_partido con timestamp y detalles del evento

### Requerimiento 2: Actualizaciones Web en Tiempo Real

**Historia de Usuario:** Como usuario web, quiero ver actualizaciones de partidos en vivo automáticamente, para poder seguir partidos en tiempo real sin refrescar la página.

#### Criterios de Aceptación

1. CUANDO ocurre un evento de partido, EL SignalR_Hub DEBE transmitir el evento a todos los Web_Clients conectados suscritos a ese partido
2. CUANDO cambia un marcador, EL SignalR_Hub DEBE enviar el marcador actualizado a todos los Web_Clients viendo ese partido en menos de 1 segundo
3. CUANDO un Web_Client se conecta, EL SignalR_Hub DEBE permitir suscripción a IDs de partidos específicos
4. CUANDO un Web_Client se desconecta, EL SignalR_Hub DEBE limpiar los recursos de suscripción
5. CUANDO ocurren múltiples eventos simultáneamente, EL SignalR_Hub DEBE transmitirlos en orden cronológico

### Requerimiento 3: Notificaciones Push Móviles

**Historia de Usuario:** Como usuario móvil, quiero recibir notificaciones push para eventos importantes de partidos, para mantenerme informado incluso cuando no estoy usando la app.

#### Criterios de Aceptación

1. CUANDO se anota un gol en un partido suscrito, EL Notification_Service DEBE enviar una notificación push a todos los Mobile_Clients suscritos en menos de 2 segundos
2. CUANDO se muestra una tarjeta roja en un partido suscrito, EL Notification_Service DEBE enviar una notificación push a todos los Mobile_Clients suscritos
3. CUANDO inicia un partido suscrito, EL Notification_Service DEBE enviar una notificación push a todos los Mobile_Clients suscritos
4. CUANDO un partido suscrito llega al medio tiempo, EL Notification_Service DEBE enviar una notificación push a todos los Mobile_Clients suscritos
5. CUANDO termina un partido suscrito, EL Notification_Service DEBE enviar una notificación push con el marcador final a todos los Mobile_Clients suscritos
6. CUANDO un Mobile_Client tiene notificaciones deshabilitadas para un equipo, EL Notification_Service NO DEBE enviar notificaciones para los partidos de ese equipo
7. EL Notification_Service DEBE usar FCM para entregar notificaciones push a dispositivos iOS y Android

### Requerimiento 4: Gestión de Suscripciones

**Historia de Usuario:** Como usuario, quiero suscribirme a equipos y partidos específicos, para recibir solo notificaciones del contenido que me interesa.

#### Criterios de Aceptación

1. CUANDO un usuario se suscribe a un equipo, EL Subscription_Manager DEBE almacenar la suscripción con ID de usuario e ID de equipo
2. CUANDO un usuario se suscribe a un partido específico, EL Subscription_Manager DEBE almacenar la suscripción con ID de usuario e ID de partido
3. CUANDO un usuario se desuscribe de un equipo, EL Subscription_Manager DEBE eliminar la suscripción y dejar de enviar notificaciones
4. CUANDO un usuario actualiza preferencias de notificación, EL Subscription_Manager DEBE persistir los cambios inmediatamente
5. CUANDO se consultan suscripciones de un usuario, EL Subscription_Manager DEBE retornar todas las suscripciones activas de equipos y partidos
6. CUANDO ocurre un evento de partido, EL Subscription_Manager DEBE identificar todos los usuarios suscritos a ese partido o a cualquiera de los equipos
7. EL Subscription_Manager DEBE soportar tipos de preferencias: goles, tarjetas, inicio_partido, fin_partido, medio_tiempo

### Requerimiento 5: Gestión de Tokens de Dispositivos

**Historia de Usuario:** Como usuario móvil, quiero que mi dispositivo esté registrado para notificaciones, para poder recibir notificaciones push en mi dispositivo.

#### Criterios de Aceptación

1. CUANDO un Mobile_Client proporciona un token FCM válido, EL Device_Registry DEBE almacenar el token con ID de usuario y plataforma del dispositivo
2. CUANDO un token de Mobile_Client expira o cambia, EL Device_Registry DEBE actualizar el token almacenado
3. CUANDO un usuario cierra sesión, EL Device_Registry DEBE marcar el token del dispositivo como inactivo
4. CUANDO un usuario inicia sesión en múltiples dispositivos, EL Device_Registry DEBE mantener tokens separados para cada dispositivo
5. CUANDO se envían notificaciones, EL Notification_Service DEBE recuperar todos los tokens de dispositivos activos para los usuarios objetivo
6. CUANDO un token FCM es inválido o expirado, EL Device_Registry DEBE eliminarlo después de intentos fallidos de entrega

### Requerimiento 6: Gestión de Estados de Partido

**Historia de Usuario:** Como administrador, quiero controlar los estados de los partidos, para poder iniciar, pausar y finalizar partidos apropiadamente.

#### Criterios de Aceptación

1. CUANDO un administrador inicia un partido, EL Match_State_Controller DEBE cambiar el estado de "programado" a "en_curso" y activar notificaciones de inicio
2. CUANDO un administrador finaliza un partido, EL Match_State_Controller DEBE cambiar el estado de "en_curso" a "finalizado" y activar notificaciones de fin
3. CUANDO un partido alcanza 45 minutos, EL Match_State_Controller DEBE activar notificaciones de medio tiempo
4. CUANDO un administrador intenta iniciar un partido ya iniciado, EL Match_State_Controller DEBE retornar un error
5. CUANDO cambia el estado de un partido, EL Match_State_Controller DEBE actualizar la tabla partidos inmediatamente
6. EL Match_State_Controller DEBE validar transiciones de estado (programado → en_curso → finalizado)

### Requerimiento 7: Sincronización de Datos

**Historia de Usuario:** Como arquitecto de sistemas, quiero que todos los almacenes de datos permanezcan sincronizados, para que los usuarios vean información consistente en todas las plataformas.

#### Criterios de Aceptación

1. CUANDO se crea un evento de partido, EL Data_Synchronizer DEBE actualizar las tablas partidos, eventos_partido y estadisticas_jugador atómicamente
2. CUANDO se anota un gol, EL Data_Synchronizer DEBE actualizar los marcadores de equipos en la tabla partidos y las estadísticas del jugador en estadisticas_jugador
3. CUANDO se muestra una tarjeta, EL Data_Synchronizer DEBE actualizar las estadísticas del jugador y los conteos de tarjetas del equipo
4. CUANDO termina un partido, EL Data_Synchronizer DEBE actualizar la tabla posiciones con las clasificaciones finales
5. SI falla cualquier actualización de base de datos, EL Data_Synchronizer DEBE revertir todos los cambios relacionados para mantener consistencia
6. CUANDO se completa la sincronización, EL Data_Synchronizer DEBE confirmar que todos los clientes han recibido actualizaciones en menos de 3 segundos

### Requerimiento 8: Línea de Tiempo del Partido

**Historia de Usuario:** Como usuario, quiero ver una línea de tiempo cronológica de todos los eventos del partido, para poder entender qué sucedió durante el partido.

#### Criterios de Aceptación

1. CUANDO un usuario solicita la línea de tiempo del partido, EL Match_Event_System DEBE retornar todos los eventos ordenados por minuto y timestamp
2. CUANDO se muestran eventos de la línea de tiempo, EL Match_Event_System DEBE incluir tipo de evento, minuto, equipo, jugador y descripción
3. CUANDO ocurre un nuevo evento, EL Match_Event_System DEBE agregarlo a la línea de tiempo y transmitirlo a todos los clientes
4. EL Match_Event_System DEBE soportar tipos de eventos: gol, tarjeta_amarilla, tarjeta_roja, sustitucion, inicio_partido, medio_tiempo, fin_partido
5. CUANDO se consultan partidos históricos, EL Match_Event_System DEBE recuperar la línea de tiempo de la tabla eventos_partido

### Requerimiento 9: Preferencias de Notificaciones

**Historia de Usuario:** Como usuario, quiero configurar qué tipos de notificaciones recibo, para no estar abrumado con alertas.

#### Criterios de Aceptación

1. CUANDO un usuario habilita notificaciones de goles, EL Subscription_Manager DEBE enviar notificaciones push para todos los goles en partidos suscritos
2. CUANDO un usuario deshabilita notificaciones de tarjetas, EL Subscription_Manager NO DEBE enviar notificaciones push para tarjetas
3. CUANDO un usuario habilita solo notificaciones de inicio/fin de partido, EL Subscription_Manager DEBE enviar notificaciones solo para esos eventos
4. EL Subscription_Manager DEBE soportar preferencias granulares por suscripción (nivel de equipo o partido)
5. CUANDO se actualizan las preferencias, EL Subscription_Manager DEBE aplicar los cambios a futuras notificaciones inmediatamente

### Requerimiento 10: Autenticación y Autorización de API

**Historia de Usuario:** Como administrador de sistemas, quiero endpoints de API seguros, para que solo usuarios autorizados puedan registrar eventos de partidos.

#### Criterios de Aceptación

1. CUANDO se hace una solicitud no autenticada al Admin_API, EL Admin_API DEBE retornar 401 No Autorizado
2. CUANDO un usuario no administrador intenta registrar eventos, EL Admin_API DEBE retornar 403 Prohibido
3. CUANDO un administrador autenticado hace una solicitud válida, EL Admin_API DEBE procesar el evento
4. EL Admin_API DEBE validar tokens JWT para todos los endpoints protegidos
5. EL Admin_API DEBE registrar todos los intentos de registro de eventos con ID de usuario y timestamp

### Requerimiento 11: Manejo de Errores y Resiliencia

**Historia de Usuario:** Como arquitecto de sistemas, quiero un manejo robusto de errores, para que el sistema permanezca estable bajo condiciones de falla.

#### Criterios de Aceptación

1. CUANDO el servicio FCM no está disponible, EL Notification_Service DEBE encolar notificaciones para reintento con backoff exponencial
2. CUANDO falla la conexión SignalR, EL SignalR_Hub DEBE intentar reconexión y reenviar eventos perdidos
3. CUANDO se pierde la conexión a la base de datos, EL Match_Event_System DEBE retornar códigos de error apropiados y registrar fallas
4. CUANDO se recibe un payload de evento inválido, EL Event_Processor DEBE retornar errores de validación detallados
5. CUANDO falla la entrega de notificación, EL Notification_Service DEBE reintentar hasta 3 veces antes de marcar como fallido
6. EL Match_Event_System DEBE registrar todos los errores con contexto para depuración y monitoreo

### Requerimiento 12: Rendimiento y Escalabilidad

**Historia de Usuario:** Como arquitecto de sistemas, quiero que el sistema maneje alta carga, para que funcione bien durante partidos populares.

#### Criterios de Aceptación

1. CUANDO 1000 usuarios concurrentes están conectados vía SignalR, EL SignalR_Hub DEBE entregar eventos en menos de 2 segundos
2. CUANDO se procesan 10 eventos por segundo, EL Event_Processor DEBE mantener tiempos de respuesta menores a un segundo
3. CUANDO se envían notificaciones a 10,000 dispositivos, EL Notification_Service DEBE completar la entrega en menos de 10 segundos
4. EL Match_Event_System DEBE soportar al menos 50 partidos en vivo simultáneos
5. LA Base de Datos DEBE usar índices en las columnas match_id, team_id y timestamp para rendimiento de consultas


### Requerimiento 13: App Planillero - Interfaz Tablet

**Historia de Usuario:** Como planillero, quiero una aplicación optimizada para tablet con botones grandes, para poder registrar eventos del partido fácilmente desde la cancha incluso con guantes o bajo presión.

#### Criterios de Aceptación

1. CUANDO el planillero accede a /planillero, LA App_Planillero DEBE mostrar una interfaz de pantalla completa sin navbar ni sidebar
2. CUANDO se muestran botones de acción, LA App_Planillero DEBE usar botones de mínimo 80x80px con texto de 18px o mayor
3. CUANDO se muestra el cronómetro, LA App_Planillero DEBE mostrarlo en tamaño gigante (80px) en color amarillo siempre visible
4. CUANDO se muestra el marcador, LA App_Planillero DEBE mostrarlo en la parte superior siempre visible con nombres de equipos y goles
5. LA App_Planillero DEBE usar tema oscuro con alto contraste (fondo negro, texto blanco, botones de colores brillantes)
6. LA App_Planillero DEBE ser instalable como PWA en tablets y dispositivos móviles
7. CUANDO el planillero registra un evento, LA App_Planillero DEBE mostrar confirmación visual inmediata

### Requerimiento 14: Generador Automático de Fixture

**Historia de Usuario:** Como administrador, quiero generar automáticamente el cronograma de partidos sin conflictos de horarios, para asegurar que ningún equipo juegue dos veces el mismo día.

#### Criterios de Aceptación

1. CUANDO se genera un fixture, EL Fixture_Generator DEBE garantizar que ningún equipo juega dos partidos en el mismo día
2. CUANDO se genera un fixture, EL Fixture_Generator DEBE garantizar mínimo 3 días de separación entre partidos del mismo equipo (configurable)
3. CUANDO se asignan horarios, EL Fixture_Generator DEBE asignarlos de forma ALEATORIA entre slots disponibles válidos
4. CUANDO se genera un fixture, EL Fixture_Generator DEBE usar algoritmo round-robin para que todos los equipos se enfrenten
5. CUANDO no hay slots disponibles, EL Fixture_Generator DEBE lanzar error con detalle del conflicto
6. EL Fixture_Generator DEBE permitir re-generar el fixture con diferente semilla aleatoria (seed)
7. CUANDO el admin mueve un partido manualmente, EL Fixture_Generator DEBE validar que no se violen las reglas de conflicto

### Requerimiento 15: Sistema de Tarjetas y Suspensiones Automáticas

**Historia de Usuario:** Como sistema, quiero gestionar automáticamente las suspensiones por acumulación de tarjetas, para que los jugadores sean inhabilitados según las reglas del torneo.

#### Criterios de Aceptación

1. CUANDO un jugador acumula 3 tarjetas amarillas en un torneo, EL Suspension_Manager DEBE generar automáticamente una suspensión de 1 partido
2. CUANDO un jugador recibe una tarjeta roja directa, EL Suspension_Manager DEBE generar automáticamente una suspensión de 2 partidos (configurable)
3. CUANDO un jugador recibe 2 tarjetas amarillas en el mismo partido, EL Suspension_Manager DEBE generar automáticamente una expulsión (equivalente a roja)
4. CUANDO se finaliza un partido, EL Suspension_Manager DEBE verificar si algún jugador cumplió umbral de suspensión
5. LAS suspensiones DEBEN descontarse en los siguientes partidos del equipo (no por fecha calendario)
6. CUANDO un jugador está suspendido, EL Portal_Web DEBE mostrar advertencia si se intenta incluirlo en la planilla
7. EL Suspension_Manager DEBE mantener historial completo de tarjetas por jugador y torneo

### Requerimiento 16: Sistema de Resoluciones Administrativas

**Historia de Usuario:** Como administrador, quiero emitir resoluciones oficiales (sanciones, multas, descuentos de puntos), para gestionar aspectos disciplinarios y administrativos del torneo.

#### Criterios de Aceptación

1. CUANDO el admin crea una resolución, EL API_Backend DEBE permitir estados: borrador, emitida, apelada, resuelta, anulada
2. CUANDO una resolución cambia a estado "emitida", EL API_Backend DEBE aplicar automáticamente la sanción asociada
3. CUANDO una resolución es de tipo "descuento_puntos", EL API_Backend DEBE actualizar la tabla de posiciones inmediatamente
4. CUANDO una resolución es de tipo "suspensión", EL Suspension_Manager DEBE crear la suspensión correspondiente
5. CUANDO una resolución es de tipo "técnica" (W.O.), EL API_Backend DEBE modificar el resultado del partido a 3-0
6. CUANDO una resolución es "anulada", EL API_Backend DEBE revertir todos los efectos de la sanción
7. CADA resolución DEBE tener un número único secuencial (ej: RES-2025-001)

### Requerimiento 17: Cronómetro del Partido

**Historia de Usuario:** Como planillero, quiero controlar el cronómetro del partido (iniciar, pausar, medio tiempo), para sincronizar el tiempo oficial con todos los clientes conectados.

#### Criterios de Aceptación

1. CUANDO el planillero inicia el cronómetro, LA App_Planillero DEBE incrementar segundos automáticamente
2. CUANDO el cronómetro está corriendo, LA App_Planillero DEBE sincronizar el minuto con el backend cada 30 segundos
3. CUANDO el planillero marca medio tiempo, EL Match_State_Controller DEBE cambiar estado del partido a "medio_tiempo" y resetear cronómetro
4. CUANDO el cronómetro se actualiza, EL SignalR_Hub DEBE transmitir el minuto actual a todos los clientes conectados
5. CUANDO se pausa el cronómetro, LA App_Planillero DEBE detener el incremento pero mantener el tiempo acumulado
6. EL cronómetro DEBE mostrarse en formato MM:SS en todos los clientes
7. CUANDO el partido finaliza, EL cronómetro DEBE detenerse permanentemente

### Requerimiento 18: Tabla de Posiciones con Actualización Automática

**Historia de Usuario:** Como usuario, quiero ver la tabla de posiciones actualizada automáticamente al finalizar cada partido, para conocer la clasificación en tiempo real.

#### Criterios de Aceptación

1. CUANDO un partido finaliza, EL Supabase_DB DEBE ejecutar la función fn_cerrar_partido() automáticamente
2. CUANDO se actualiza la tabla de posiciones, EL Supabase_DB DEBE calcular: PJ, PG, PE, PP, GF, GC, Puntos (PG*3 + PE), Diferencia (GF-GC)
3. CUANDO se consulta la tabla, EL Portal_Web DEBE ordenar por: Puntos DESC, Diferencia DESC, GF DESC
4. CUANDO cambia la tabla de posiciones, EL Supabase_Realtime DEBE notificar a todos los clientes suscritos
5. LA tabla de posiciones DEBE resaltar zona de clasificación (top N equipos) en verde claro
6. LA tabla de posiciones DEBE resaltar zona de descenso (últimos N equipos) en rojo claro
7. LA tabla de posiciones DEBE mostrar "forma" (últimos 5 resultados: V/E/D) como badges de colores

### Requerimiento 19: Ranking de Goleadores

**Historia de Usuario:** Como usuario, quiero ver el ranking de goleadores actualizado en tiempo real, para conocer quiénes son los máximos anotadores del torneo.

#### Criterios de Aceptación

1. CUANDO se registra un gol, EL API_Backend DEBE actualizar la tabla estadisticas_jugador incrementando goles del jugador
2. CUANDO se consulta el ranking, EL Portal_Web DEBE mostrar: foto, nombre, equipo, goles, asistencias del jugador
3. EL Portal_Web DEBE permitir filtrar goleadores por: torneo, equipo, jornada
4. EL Portal_Web DEBE mostrar tabs separados para: Goleadores, Asistidores, Tarjetas Amarillas, Tarjetas Rojas
5. EL Portal_Web DEBE mostrar medallas oro/plata/bronce para el top 3
6. EL Portal_Web DEBE mostrar barra de progreso proporcional al líder para cada jugador
7. CUANDO se hace click en un jugador, EL Portal_Web DEBE abrir modal con estadísticas completas

### Requerimiento 20: Marcador Público en Vivo

**Historia de Usuario:** Como espectador, quiero ver el marcador del partido en una pantalla grande, para seguir el resultado en tiempo real desde el estadio o cualquier lugar.

#### Criterios de Aceptación

1. EL Portal_Web DEBE proporcionar una vista /partidos/:id/live optimizada para proyección en pantalla grande
2. CUANDO el partido está en curso, EL marcador DEBE mostrar indicador "EN VIVO" parpadeante en rojo
3. EL marcador DEBE mostrar números de goles en tamaño 120px+ de altura en color blanco/cian
4. EL marcador DEBE mostrar cronómetro en tamaño 60px en color amarillo siempre corriendo
5. EL marcador DEBE mostrar nombres de equipos en tipografía Bebas Neue 40px en mayúsculas
6. CUANDO ocurre un evento (gol, tarjeta), EL marcador DEBE mostrar notificación animada que desaparece después de 8 segundos
7. EL marcador DEBE proporcionar botón para activar modo pantalla completa (Fullscreen API)

### Requerimiento 21: Doble Confirmación de Finalización

**Historia de Usuario:** Como planillero, quiero que el sistema me pida doble confirmación al finalizar un partido, para evitar cierres accidentales que no se pueden deshacer.

#### Criterios de Aceptación

1. CUANDO el planillero pulsa "FINALIZAR PARTIDO", LA App_Planillero DEBE mostrar primer modal de confirmación
2. CUANDO el planillero confirma la primera vez, LA App_Planillero DEBE mostrar segundo modal con el marcador final para verificar
3. CUANDO el planillero confirma la segunda vez, LA App_Planillero DEBE enviar PATCH /partidos/:id/finalizar al backend
4. CUANDO se finaliza el partido, EL API_Backend DEBE validar que el usuario es el planillero asignado a ese partido
5. CUANDO se finaliza el partido, EL API_Backend DEBE validar que el estado actual es "en_curso"
6. CUANDO la finalización es exitosa, LA App_Planillero DEBE mostrar pantalla de resumen final
7. CUANDO la finalización falla, LA App_Planillero DEBE mostrar mensaje de error detallado

### Requerimiento 22: Autenticación Multi-Rol con Supabase

**Historia de Usuario:** Como usuario del sistema, quiero iniciar sesión con mi email y contraseña, para acceder a las funcionalidades según mi rol asignado.

#### Criterios de Aceptación

1. CUANDO un usuario envía credenciales válidas, EL Supabase_Auth DEBE retornar un token JWT con el rol en user_metadata
2. CUANDO un usuario con rol "admin" inicia sesión, EL Portal_Web DEBE permitir acceso a todas las funcionalidades
3. CUANDO un usuario con rol "planillero" inicia sesión, LA App_Planillero DEBE cargar el partido asignado automáticamente
4. CUANDO un usuario con rol "arbitro" inicia sesión, EL Portal_Web DEBE permitir solo consulta de tarjetas y suspensiones
5. CUANDO un usuario sin autenticar accede, EL Portal_Web DEBE permitir solo visualización pública (posiciones, goleadores, cronograma)
6. EL API_Backend DEBE validar el token JWT en todos los endpoints protegidos
7. CUANDO el token expira, EL Portal_Web DEBE redirigir automáticamente al login

### Requerimiento 23: Diseño Responsive y Profesional

**Historia de Usuario:** Como usuario, quiero que el portal se vea profesional y funcione bien en cualquier dispositivo, para tener una experiencia consistente en móvil, tablet y desktop.

#### Criterios de Aceptación

1. EL Portal_Web DEBE usar tema oscuro con fondo negro profundo (#06090F) y grilla sutil
2. EL Portal_Web DEBE usar tipografía "Bebas Neue" para títulos y marcadores, "Barlow" para cuerpo
3. EL Portal_Web DEBE usar colores: Azul cian #00D4FF (primario), Rojo #FF2D55 (alertas), Amarillo #FFD60A (destaque)
4. EL Portal_Web DEBE tener navbar fija superior con logo, navegación y botón login
5. EL Portal_Web DEBE ser completamente responsive en móvil (320px+), tablet (768px+) y desktop (1024px+)
6. EL Portal_Web DEBE usar animaciones fade-in al cargar secciones
7. EL Portal_Web DEBE usar transiciones suaves en actualizaciones de marcador en tiempo real

### Requerimiento 24: Validación de Planillero Asignado

**Historia de Usuario:** Como sistema, quiero validar que solo el planillero asignado puede registrar eventos de un partido, para mantener la integridad de los datos oficiales.

#### Criterios de Aceptación

1. CUANDO se asigna un planillero a un partido, EL API_Backend DEBE almacenar el planillero_id en la tabla partidos
2. CUANDO un planillero intenta iniciar un partido, EL API_Backend DEBE validar que es el planillero asignado
3. CUANDO un planillero intenta registrar un evento, EL API_Backend DEBE validar que es el planillero asignado a ese partido
4. CUANDO un usuario no asignado intenta acceder, EL API_Backend DEBE retornar 403 Forbidden
5. CUANDO un admin accede, EL API_Backend DEBE permitir todas las operaciones independientemente de la asignación
6. LA App_Planillero DEBE cargar automáticamente el partido asignado al planillero logueado
7. CUANDO no hay partido asignado, LA App_Planillero DEBE mostrar mensaje "No tienes partidos asignados hoy"
