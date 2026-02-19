# Manual de Usuario - Administradores
## SportZone Pro

---

## 1. Introducción

Bienvenido al manual de usuario para administradores de SportZone Pro. Este documento te guiará a través de todas las funcionalidades administrativas del sistema.

### 1.1 ¿Qué es SportZone Pro?

SportZone Pro es un sistema integral de gestión de campeonatos deportivos que permite:
- Gestionar torneos, equipos y jugadores
- Monitorear partidos en tiempo real
- Generar automáticamente cronogramas de partidos
- Gestionar aspectos disciplinarios y administrativos
- Emitir resoluciones oficiales

### 1.2 Rol de Administrador

Como administrador, tienes acceso completo a todas las funcionalidades del sistema:
- ✅ Crear y gestionar torneos
- ✅ Administrar equipos y jugadores
- ✅ Generar fixture automáticamente
- ✅ Gestionar solicitudes administrativas
- ✅ Emitir y aplicar resoluciones
- ✅ Ver estadísticas y reportes
- ✅ Asignar planilleros a partidos
- ✅ Modificar resultados de partidos

---

## 2. Acceso al Sistema

### 2.1 Inicio de Sesión

1. Abre tu navegador web y ve a: **https://sportzone.app**
2. Haz clic en el botón **"Iniciar Sesión"** en la esquina superior derecha
3. Ingresa tus credenciales:
   - **Email**: tu-email@example.com
   - **Contraseña**: tu contraseña segura
4. Haz clic en **"Ingresar"**

![Pantalla de login - Placeholder]

**Nota**: Si olvidaste tu contraseña, haz clic en "¿Olvidaste tu contraseña?" y sigue las instrucciones.

### 2.2 Dashboard Principal

Después de iniciar sesión, verás el dashboard principal con:
- **Partidos en vivo**: Partidos actualmente en curso
- **Próximos partidos**: Partidos programados para los próximos 7 días
- **Estadísticas rápidas**: Resumen de torneos activos, equipos y jugadores
- **Menú de navegación**: Acceso a todas las secciones

![Dashboard principal - Placeholder]

---

## 3. Gestión de Torneos

### 3.1 Crear un Nuevo Torneo

1. En el menú lateral, haz clic en **"Torneos"**
2. Haz clic en el botón **"+ Nuevo Torneo"**
3. Completa el formulario:
   - **Nombre**: Ej: "Liga Pro 2025"
   - **Tipo**: Liga / Copa / Amistoso
   - **Temporada**: Selecciona la temporada
   - **Total de Jornadas**: Ej: 30
4. Haz clic en **"Crear Torneo"**

![Crear torneo - Placeholder]

**Consejos**:
- El nombre debe ser descriptivo y único
- Para ligas, el total de jornadas suele ser (N-1) * 2, donde N es el número de equipos
- Para copas, el total de jornadas depende del formato de eliminación

### 3.2 Editar un Torneo

1. Ve a **"Torneos"** en el menú
2. Busca el torneo que deseas editar
3. Haz clic en el ícono de **lápiz** (editar)
4. Modifica los campos necesarios
5. Haz clic en **"Guardar Cambios"**

### 3.3 Activar/Desactivar un Torneo

1. Ve a **"Torneos"**
2. Encuentra el torneo
3. Haz clic en el interruptor **"Activo/Inactivo"**

**Nota**: Solo los torneos activos aparecen en el portal público.

---

## 4. Gestión de Equipos

### 4.1 Registrar un Nuevo Equipo

1. Ve a **"Equipos"** en el menú
2. Haz clic en **"+ Nuevo Equipo"**
3. Completa el formulario:
   - **Nombre**: Ej: "Club Deportivo Nacional"
   - **Abreviatura**: Ej: "CDN" (máximo 5 caracteres)
   - **Ciudad**: Ej: "Quito"
   - **Estadio**: Ej: "Estadio Olímpico Atahualpa"
   - **Color Primario**: Selecciona el color principal del equipo
   - **Color Secundario**: Selecciona el color secundario
4. Sube el **escudo del equipo** (formato PNG o SVG, máximo 2MB)
5. Haz clic en **"Registrar Equipo"**

![Registrar equipo - Placeholder]

### 4.2 Gestionar Jugadores de un Equipo

1. Ve a **"Equipos"**
2. Haz clic en el equipo deseado
3. En la pestaña **"Jugadores"**, haz clic en **"+ Agregar Jugador"**
4. Completa los datos del jugador:
   - **Nombre y Apellido**
   - **Número de Camiseta**: 1-99
   - **Posición**: Portero / Defensa / Mediocampista / Delantero
   - **Fecha de Nacimiento**
   - **Nacionalidad**
5. Sube la **foto del jugador** (opcional)
6. Haz clic en **"Agregar Jugador"**

![Agregar jugador - Placeholder]

**Consejos**:
- Asegúrate de que los números de camiseta no se repitan en el mismo equipo
- La foto del jugador mejora la experiencia visual en el portal público

---

## 5. Generación Automática de Fixture

### 5.1 ¿Qué es el Generador de Fixture?

El generador de fixture crea automáticamente el cronograma completo de partidos de un torneo, garantizando que:
- Todos los equipos se enfrenten entre sí
- Ningún equipo juegue dos veces el mismo día
- Se respete el mínimo de días entre partidos del mismo equipo
- Los horarios se asignen aleatoriamente entre los disponibles

### 5.2 Generar Fixture

1. Ve a **"Torneos"** y selecciona el torneo
2. Haz clic en la pestaña **"Fixture"**
3. Haz clic en **"Generar Fixture Automáticamente"**
4. Configura los parámetros:
   - **Equipos Participantes**: Selecciona los equipos (debe ser número par)
   - **Fecha de Inicio**: Ej: 01/03/2025
   - **Horarios Disponibles**: Ej: 14:00, 16:00, 18:00, 20:00
   - **Días Mínimos entre Partidos**: Ej: 3 días (recomendado)
5. Haz clic en **"Generar"**

![Generar fixture - Placeholder]

**Resultado**:
- El sistema creará todos los partidos automáticamente
- Verás un resumen con el número de partidos creados y jornadas
- Podrás revisar el cronograma completo

### 5.3 Ajustar Partidos Manualmente

Si necesitas mover un partido:

1. Ve al partido en el cronograma
2. Haz clic en **"Editar"**
3. Cambia la fecha u hora
4. Haz clic en **"Guardar"**

**Nota**: El sistema validará que no haya conflictos (mismo equipo jugando dos veces el mismo día).

---

## 6. Gestión de Solicitudes

### 6.1 ¿Qué son las Solicitudes?

Las solicitudes son peticiones formales que pueden hacer equipos, jugadores o terceros sobre diversos temas:
- Marketing y patrocinios
- Traspasos de jugadores
- Medios de comunicación
- Aspectos disciplinarios
- Temas administrativos

### 6.2 Ver Solicitudes Pendientes

1. Ve a **"Solicitudes"** en el menú
2. Verás una lista de todas las solicitudes
3. Usa los filtros para buscar:
   - **Estado**: Pendiente / En Revisión / Aprobado / Rechazado
   - **Tipo**: Marketing / Traspaso / Patrocinio / etc.
   - **Prioridad**: Baja / Media / Alta / Urgente

![Lista de solicitudes - Placeholder]

### 6.3 Revisar una Solicitud

1. Haz clic en la solicitud que deseas revisar
2. Verás los detalles completos:
   - Tipo de solicitud
   - Solicitante
   - Descripción
   - Monto (si aplica)
   - Equipo relacionado (si aplica)
   - Fecha de creación
3. Lee cuidadosamente la información

### 6.4 Aprobar o Rechazar una Solicitud

1. En la vista de detalle de la solicitud
2. Haz clic en **"Cambiar Estado"**
3. Selecciona el nuevo estado:
   - **En Revisión**: Si necesitas más tiempo para decidir
   - **Aprobado**: Si aceptas la solicitud
   - **Rechazado**: Si no aceptas la solicitud
4. Agrega un **comentario** explicando tu decisión
5. Haz clic en **"Guardar"**

![Aprobar solicitud - Placeholder]

**Buenas Prácticas**:
- Siempre agrega un comentario explicando tu decisión
- Responde las solicitudes en orden de prioridad
- Marca como "En Revisión" si necesitas consultar con otros

---

## 7. Gestión de Resoluciones

### 7.1 ¿Qué son las Resoluciones?

Las resoluciones son decisiones administrativas oficiales que pueden incluir:
- **Suspensiones**: Inhabilitar jugadores por partidos
- **Descuento de Puntos**: Restar puntos a un equipo en la tabla
- **W.O. Técnico**: Dar un partido por ganado 3-0
- **Multas**: Sanciones económicas
- **Amonestaciones**: Advertencias oficiales

### 7.2 Crear una Resolución

1. Ve a **"Resoluciones"** en el menú
2. Haz clic en **"+ Nueva Resolución"**
3. Completa el formulario:
   - **Tipo**: Disciplinaria / Administrativa / Técnica
   - **Asunto**: Título breve de la resolución
   - **Motivo**: Descripción detallada
   - **Tipo de Sanción**: Suspensión / Descuento de Puntos / W.O. / Multa / Amonestación
   - **Valor de la Sanción**: Número de partidos, puntos o monto
   - **Jugador/Equipo Afectado**: Selecciona de la lista
   - **Solicitud Relacionada**: Si aplica
4. Haz clic en **"Crear Resolución"**

![Crear resolución - Placeholder]

**Nota**: La resolución se crea en estado "Borrador" y no tiene efecto hasta que la emitas.

### 7.3 Emitir una Resolución

1. Ve a **"Resoluciones"**
2. Encuentra la resolución en estado "Borrador"
3. Revisa cuidadosamente todos los detalles
4. Haz clic en **"Emitir Resolución"**
5. Confirma la acción

**¡IMPORTANTE!**: Al emitir una resolución, el sistema aplicará automáticamente la sanción:
- **Suspensión**: Se crea el registro de suspensión y el jugador no podrá jugar
- **Descuento de Puntos**: Se actualizan los puntos en la tabla de posiciones
- **W.O. Técnico**: Se modifica el resultado del partido a 3-0
- **Multa**: Se registra la multa en el sistema financiero

### 7.4 Anular una Resolución

Si necesitas revertir una resolución:

1. Ve a la resolución emitida
2. Haz clic en **"Anular Resolución"**
3. Confirma la acción

**Efecto**: El sistema revertirá automáticamente todos los efectos de la sanción.

---

## 8. Monitoreo de Partidos en Vivo

### 8.1 Ver Partidos en Curso

1. En el dashboard principal, ve a la sección **"Partidos en Vivo"**
2. Verás todos los partidos actualmente en curso con:
   - Marcador actualizado en tiempo real
   - Minuto del partido
   - Últimos eventos (goles, tarjetas)

![Partidos en vivo - Placeholder]

### 8.2 Ver Detalle de un Partido

1. Haz clic en el partido que deseas ver
2. Verás:
   - **Marcador en tiempo real**
   - **Cronómetro del partido**
   - **Timeline de eventos**: Todos los goles, tarjetas y sustituciones
   - **Estadísticas**: Posesión, tiros, corners (si están disponibles)

### 8.3 Modificar un Partido (Casos Especiales)

Como administrador, puedes modificar partidos en casos excepcionales:

1. Ve al partido
2. Haz clic en **"Opciones de Admin"**
3. Puedes:
   - **Iniciar partido**: Si el planillero no puede hacerlo
   - **Registrar evento**: Agregar gol, tarjeta o sustitución manualmente
   - **Finalizar partido**: Cerrar el partido
   - **Cancelar partido**: Marcar como cancelado

**Nota**: Usa estas opciones solo en casos excepcionales. Normalmente, el planillero asignado gestiona el partido.

---

## 9. Reportes y Estadísticas

### 9.1 Tabla de Posiciones

1. Ve a **"Liga"** en el menú
2. Selecciona el torneo
3. Verás la tabla de posiciones actualizada con:
   - Posición, equipo, PJ, PG, PE, PP, GF, GC, Puntos, Diferencia
   - Zona de clasificación resaltada en verde
   - Zona de descenso resaltada en rojo

![Tabla de posiciones - Placeholder]

### 9.2 Ranking de Goleadores

1. Ve a **"Goleadores"** en el menú
2. Selecciona el torneo
3. Verás el ranking con:
   - Foto del jugador
   - Nombre y equipo
   - Goles, asistencias, partidos jugados
   - Medallas oro/plata/bronce para el top 3

### 9.3 Estadísticas de Tarjetas

1. En **"Goleadores"**, haz clic en la pestaña **"Tarjetas"**
2. Verás el ranking de jugadores con más tarjetas
3. Puedes filtrar por:
   - Tarjetas amarillas
   - Tarjetas rojas
4. Verás también las suspensiones activas

---

## 10. Gestión de Usuarios

### 10.1 Crear Usuario Planillero

1. Ve a **"Usuarios"** en el menú
2. Haz clic en **"+ Nuevo Usuario"**
3. Completa el formulario:
   - **Email**: email@example.com
   - **Nombre Completo**
   - **Rol**: Planillero
   - **Contraseña Temporal**
4. Haz clic en **"Crear Usuario"**
5. El usuario recibirá un email con instrucciones para cambiar su contraseña

### 10.2 Asignar Planillero a un Partido

1. Ve al partido en el cronograma
2. Haz clic en **"Editar"**
3. En el campo **"Planillero Asignado"**, selecciona el planillero
4. Haz clic en **"Guardar"**

**Nota**: Solo el planillero asignado podrá registrar eventos en ese partido.

---

## 11. Configuración del Sistema

### 11.1 Configuración General

1. Ve a **"Configuración"** en el menú
2. Puedes configurar:
   - **Reglas de Suspensión**:
     - Tarjetas amarillas para suspensión (default: 3)
     - Partidos de suspensión por roja (default: 2)
   - **Formato de Fixture**:
     - Días mínimos entre partidos (default: 3)
     - Horarios disponibles
   - **Notificaciones**:
     - Habilitar/deshabilitar notificaciones push
     - Configurar tipos de eventos a notificar

### 11.2 Backup y Exportación

1. Ve a **"Configuración"** → **"Backup"**
2. Haz clic en **"Exportar Datos"**
3. Selecciona qué datos exportar:
   - Equipos y jugadores
   - Partidos y eventos
   - Estadísticas
   - Resoluciones
4. Selecciona el formato: CSV / Excel / JSON
5. Haz clic en **"Exportar"**

---

## 12. Preguntas Frecuentes (FAQ)

### ¿Puedo modificar un partido que ya finalizó?

Sí, como administrador puedes modificar partidos finalizados en casos excepcionales (errores de registro). Ve al partido, haz clic en "Opciones de Admin" y selecciona "Editar Resultado". El sistema recalculará automáticamente la tabla de posiciones.

### ¿Cómo elimino un equipo?

No puedes eliminar un equipo que ya tiene partidos registrados. En su lugar, márcalo como "Inactivo" en la configuración del equipo.

### ¿Qué pasa si genero el fixture dos veces?

El sistema te advertirá si ya existe un fixture para ese torneo. Si confirmas, se eliminarán todos los partidos anteriores y se creará un nuevo fixture.

### ¿Cómo revierto una resolución emitida?

Ve a la resolución y haz clic en "Anular Resolución". El sistema revertirá automáticamente todos los efectos (suspensiones, puntos, etc.).

### ¿Puedo cambiar el planillero asignado a un partido en curso?

Sí, pero solo si el partido aún no ha iniciado. Una vez iniciado, solo el planillero asignado puede registrar eventos.

---

## 13. Soporte Técnico

### ¿Necesitas Ayuda?

Si tienes problemas o preguntas:

- **Email**: soporte@sportzone.app
- **Teléfono**: +593-xxx-xxx-xxxx
- **Horario**: Lunes a Viernes, 9:00 AM - 6:00 PM

### Reportar un Error

Si encuentras un error en el sistema:

1. Toma una captura de pantalla del error
2. Anota los pasos que realizaste antes del error
3. Envía un email a soporte@sportzone.app con:
   - Descripción del error
   - Captura de pantalla
   - Pasos para reproducir el error
   - Tu nombre de usuario

---

## 14. Mejores Prácticas

✅ **Haz backup regularmente**: Exporta los datos del sistema al menos una vez por semana

✅ **Revisa solicitudes diariamente**: Responde las solicitudes pendientes para mantener el flujo administrativo

✅ **Verifica el fixture antes de publicarlo**: Revisa que no haya conflictos de horarios antes de hacer público el cronograma

✅ **Documenta las resoluciones**: Siempre agrega un motivo detallado en las resoluciones para mantener transparencia

✅ **Asigna planilleros con anticipación**: Asigna planilleros a los partidos al menos 48 horas antes

✅ **Monitorea partidos en vivo**: Durante los días de partido, mantén abierto el dashboard para monitorear eventos en tiempo real

---

**Versión del Manual**: 1.0.0  
**Última Actualización**: Enero 2025  
**Sistema**: SportZone Pro
