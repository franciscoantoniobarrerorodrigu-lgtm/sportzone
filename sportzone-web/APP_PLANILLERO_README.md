# App Planillero - SportZone Pro

## Descripción

La App Planillero es una Progressive Web App (PWA) optimizada para tablets que permite a los planilleros registrar eventos de partidos en tiempo real desde la cancha.

## Características Implementadas

### ✅ Fase 4.1: Configuración PWA
- **manifest.json**: Configurado con orientación landscape, display standalone
- **Service Worker**: Implementado para caché básico y modo offline
- **Iconos**: Estructura preparada para iconos 192x192 y 512x512
- **Instalable**: La app puede instalarse en tablets y móviles

### ✅ Fase 4.2: PlanilleroComponent
- **Interfaz optimizada para tablet**: Sin navbar/sidebar, pantalla completa
- **Marcador superior**: Muestra equipos, escudos y goles en tiempo real
- **Cronómetro gigante**: 80px en color amarillo (#FFD60A)
- **Controles de tiempo**: Iniciar, pausar, reanudar, medio tiempo

### ✅ Fase 4.3: Selector de Equipo y Jugadores
- **Selector de equipo**: Botones grandes para local/visita
- **Lista de jugadores**: Grid responsive con botones grandes (mínimo 100px altura)
- **Números de camiseta**: Destacados en amarillo, tamaño 32px

### ✅ Fase 4.4: Botones de Eventos Rápidos
- **GOL**: Verde (#34C759), 120px altura mínima
- **TARJETA AMARILLA**: Amarillo (#FFD60A), 120px altura
- **TARJETA ROJA**: Rojo (#FF2D55), 120px altura
- **SUSTITUCIÓN**: Azul (#00D4FF), 120px altura
- **Confirmación visual**: Notificación animada al registrar evento

### ✅ Fase 4.5: Cronómetro del Partido
- **Incremento automático**: Cada 60 segundos
- **Sincronización**: Con backend cada 30 segundos
- **Pausar/Reanudar**: Control completo del cronómetro
- **Resetear**: En medio tiempo

### ✅ Fase 4.6: Finalización de Partido
- **Botón FINALIZAR**: Grande, rojo, prominente
- **Primer modal**: Confirmación inicial con marcador
- **Segundo modal**: Confirmación final con advertencia
- **Envío al backend**: PATCH /partidos/{id}/finalizar
- **Redirección**: Al dashboard tras finalizar

### ✅ Fase 4.7: Timeline de Eventos
- **Eventos en orden cronológico**: Con minuto, tipo, jugador, equipo
- **Scroll automático**: Al último evento
- **Iconos visuales**: Para cada tipo de evento
- **Colores diferenciados**: Por tipo de evento

### ✅ Fase 4.8: Validación de Planillero Asignado
- **Carga automática**: Del partido asignado al planillero logueado
- **Mensaje de error**: Si no hay partido asignado
- **Guard de ruta**: Solo admin y planillero pueden acceder

## Rutas

- `/planillero` - Carga el partido asignado al planillero logueado
- `/planillero/:id` - Carga un partido específico por ID

## Servicios Utilizados

### PartidosService
Métodos agregados para la App Planillero:
- `getPartidosPlanillero(userId)` - Obtiene partidos asignados
- `iniciarPartido(partidoId)` - Inicia un partido
- `marcarMedioTiempo(partidoId)` - Marca medio tiempo
- `actualizarMinuto(partidoId, minuto)` - Sincroniza minuto
- `registrarEvento(partidoId, evento)` - Registra evento
- `finalizarPartido(partidoId)` - Finaliza partido

## Diseño Visual

### Colores
- **Fondo**: #06090F (negro profundo)
- **Primario**: #00D4FF (azul cian)
- **Amarillo**: #FFD60A (cronómetro, números)
- **Rojo**: #FF2D55 (alertas, finalizar)
- **Verde**: #34C759 (gol, éxito)

### Tipografía
- **Títulos y marcadores**: Bebas Neue
- **Cuerpo**: Barlow (heredado del sistema)

### Tamaños
- **Cronómetro**: 80px
- **Goles**: 72px
- **Botones de eventos**: Mínimo 120px altura
- **Botones de jugadores**: Mínimo 100px altura

## Responsive

### Landscape (Tablets)
- Grid de 4 columnas para eventos rápidos
- Botones más grandes (140px altura)
- Optimizado para tablets 10"+ en horizontal

### Portrait (Móviles)
- Grid de 2 columnas para eventos
- Marcador apilado verticalmente
- Tamaños reducidos pero usables

## Instalación como PWA

### Android
1. Abrir la app en Chrome
2. Menú → "Agregar a pantalla de inicio"
3. La app se instalará con el ícono configurado

### iOS
1. Abrir la app en Safari
2. Botón "Compartir"
3. "Agregar a pantalla de inicio"

## Próximas Mejoras (Opcionales)

### Fase 4.9: Modo Offline
- [ ] Caché de datos del partido
- [ ] Cola de eventos cuando no hay conexión
- [ ] Sincronización automática al recuperar conexión

### Fase 4.10: Testing PWA
- [ ] Probar instalación en Android
- [ ] Probar instalación en iOS
- [ ] Probar en tablets de diferentes tamaños
- [ ] Probar con guantes (botones grandes)

## Notas Técnicas

### Signals
El componente usa Angular Signals para reactividad:
- `partido()` - Datos del partido actual
- `minutoActual()` - Minuto del cronómetro
- `cronometroActivo()` - Estado del cronómetro
- `eventos()` - Lista de eventos registrados

### Intervalos
- **Cronómetro**: setInterval de 60000ms (1 minuto)
- **Sincronización**: setInterval de 30000ms (30 segundos)
- **Limpieza**: ngOnDestroy limpia todos los intervalos

### Modales
- Overlay con fondo oscuro semi-transparente
- Animaciones de entrada (fadeIn, scaleIn)
- Click fuera del modal para cerrar (primer modal)
- Segundo modal requiere acción explícita

## Dependencias

- Angular 17+ (Standalone Components)
- Angular Signals
- Angular Router
- RxJS (para servicios HTTP)
- SCSS (estilos)

## Archivos Creados

```
sportzone-web/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── assets/
│       └── icons/
│           ├── icon-192.png (pendiente)
│           └── icon-512.png (pendiente)
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── planillero.guard.ts
│   │   │   └── services/
│   │   │       └── partidos.service.ts (actualizado)
│   │   ├── features/
│   │   │   └── planillero/
│   │   │       ├── planillero.component.ts
│   │   │       └── planillero.component.scss
│   │   └── app.routes.ts (actualizado)
│   └── index.html (actualizado)
└── APP_PLANILLERO_README.md
```

## Testing

### Pruebas Manuales Recomendadas
1. Cargar partido asignado
2. Iniciar partido
3. Registrar gol
4. Registrar tarjeta amarilla
5. Registrar tarjeta roja
6. Marcar medio tiempo
7. Finalizar partido (doble confirmación)
8. Verificar sincronización de minuto
9. Verificar timeline de eventos
10. Probar en tablet landscape

### Casos de Error
- Sin partido asignado
- Usuario no autenticado
- Usuario sin permisos
- Error de red al registrar evento
- Error al finalizar partido

## Soporte

Para problemas o preguntas sobre la App Planillero, consultar:
- Documento de diseño: `.kiro/specs/live-match-notifications/design.md`
- Documento de requerimientos: `.kiro/specs/live-match-notifications/requirements.md`
- Tareas: `.kiro/specs/live-match-notifications/tasks.md`
