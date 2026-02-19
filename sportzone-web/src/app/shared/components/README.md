# Shared Components

Componentes reutilizables para SportZone Pro siguiendo el sistema de diseño.

## Componentes Disponibles

### 1. CardEquipoComponent
Tarjeta para mostrar información de un equipo.

**Props:**
- `equipo` (required): Objeto con nombre, escudo_url, color_primario, abreviatura
- `clickable` (optional): Boolean para hacer la tarjeta clickeable
- `equipoClick` (output): Evento emitido al hacer click

**Uso:**
```html
<app-card-equipo 
  [equipo]="equipo" 
  [clickable]="true"
  (equipoClick)="onEquipoSelected($event)">
</app-card-equipo>
```

### 2. BadgeEstadoComponent
Badge con colores según el estado y tipo.

**Props:**
- `estado` (required): String del estado
- `tipo` (optional): 'solicitud' | 'resolucion' | 'partido' | 'suspension' | 'general'
- `size` (optional): 'small' | 'medium' | 'large'

**Uso:**
```html
<app-badge-estado 
  estado="en_curso" 
  tipo="partido" 
  size="medium">
</app-badge-estado>
```

### 3. TimelineEventoComponent
Componente para mostrar eventos de partido en formato timeline.

**Props:**
- `evento` (required): Objeto con tipo, minuto, jugador, equipo, descripcion
- `isLast` (optional): Boolean para indicar si es el último evento

**Uso:**
```html
<app-timeline-evento 
  [evento]="evento" 
  [isLast]="i === eventos.length - 1">
</app-timeline-evento>
```

### 4. LoadingComponent
Spinner de carga con animación.

**Props:**
- `message` (optional): Mensaje a mostrar debajo del spinner
- `size` (optional): 'small' | 'medium' | 'large'
- `fullScreen` (optional): Boolean para modo pantalla completa

**Uso:**
```html
<app-loading 
  message="Cargando datos..." 
  size="medium"
  [fullScreen]="true">
</app-loading>
```

## Importación

```typescript
import { 
  CardEquipoComponent, 
  BadgeEstadoComponent, 
  TimelineEventoComponent, 
  LoadingComponent 
} from '@app/shared/components';
```
