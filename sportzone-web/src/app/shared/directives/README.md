# Directivas Compartidas - SportZone Pro

Este directorio contiene directivas reutilizables para la aplicación SportZone Pro.

## LazyLoadDirective

Directiva para carga diferida (lazy loading) de imágenes usando la Intersection Observer API. Optimiza el rendimiento cargando imágenes solo cuando están a punto de entrar en el viewport.

### Características

- ✅ Usa Intersection Observer API para detección eficiente
- ✅ Carga imágenes solo cuando son visibles (o están a punto de serlo)
- ✅ Soporte para imágenes placeholder personalizadas
- ✅ Manejo de estados de carga (loading, loaded, error)
- ✅ Animación fade-in opcional al cargar
- ✅ Limpieza automática de recursos al destruir componente
- ✅ Manejo robusto de errores de carga
- ✅ Fallback para navegadores sin soporte de Intersection Observer

### Uso Básico

```typescript
import { LazyLoadDirective } from '@shared/directives';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [LazyLoadDirective],
  template: `
    <img appLazyLoad [src]="equipo.escudo_url" alt="Escudo del equipo">
  `
})
export class MiComponente {
  equipo = { escudo_url: 'https://example.com/escudo.png' };
}
```

### Ejemplos Avanzados

#### Con Placeholder Personalizado

```html
<img appLazyLoad 
     [src]="jugador.foto_url" 
     [placeholder]="'/assets/images/placeholder-jugador.png'"
     alt="Foto del jugador">
```

#### Con Threshold Personalizado

El threshold controla cuándo se carga la imagen:
- `0.0` = cargar cuando cualquier píxel es visible
- `0.1` = cargar cuando el 10% es visible (por defecto)
- `0.5` = cargar cuando el 50% es visible
- `1.0` = cargar solo cuando el 100% es visible

```html
<img appLazyLoad 
     [src]="imagen.url" 
     [threshold]="0.5"
     alt="Imagen">
```

#### Lista de Imágenes

```html
<div class="grid-equipos">
  @for (equipo of equipos; track equipo.id) {
    <div class="card-equipo">
      <img appLazyLoad 
           [src]="equipo.escudo_url" 
           [placeholder]="'/assets/images/placeholder-escudo.png'"
           [alt]="equipo.nombre"
           class="escudo">
      <h3>{{ equipo.nombre }}</h3>
    </div>
  }
</div>
```

### Propiedades de Entrada

| Propiedad | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `src` | `string` | ✅ Sí | - | URL de la imagen real a cargar |
| `placeholder` | `string` | ❌ No | `''` | URL de la imagen placeholder |
| `threshold` | `number` | ❌ No | `0.1` | Umbral de intersección (0.0 - 1.0) |

### Clases CSS

La directiva aplica automáticamente estas clases CSS que puedes estilizar:

| Clase | Cuándo se aplica | Uso |
|-------|------------------|-----|
| `lazy-loading` | Mientras la imagen está cargando | Mostrar spinner o animación |
| `lazy-loaded` | Cuando la imagen se cargó exitosamente | Aplicar animación fade-in |
| `lazy-error` | Cuando falla la carga de la imagen | Mostrar indicador de error |

### Estilos CSS Recomendados

Agrega estos estilos a tu archivo global `styles.scss`:

```scss
// Estilos para lazy loading de imágenes
img[appLazyLoad] {
  transition: opacity 0.3s ease-in-out;
  
  &.lazy-loading {
    opacity: 0.6;
    background: linear-gradient(
      90deg,
      #1a1a1a 25%,
      #2a2a2a 50%,
      #1a1a1a 75%
    );
    background-size: 200% 100%;
    animation: loading-shimmer 1.5s infinite;
  }
  
  &.lazy-loaded {
    opacity: 1;
    animation: fade-in 0.3s ease-in-out;
  }
  
  &.lazy-error {
    opacity: 0.5;
    border: 2px solid #ff2d55;
    background-color: #2a2a2a;
    position: relative;
    
    &::after {
      content: '⚠️';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
    }
  }
}

@keyframes loading-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### Casos de Uso

#### 1. Escudos de Equipos en Tabla de Posiciones

```html
<table class="tabla-posiciones">
  @for (equipo of posiciones; track equipo.id) {
    <tr>
      <td>
        <img appLazyLoad 
             [src]="equipo.escudo_url" 
             [placeholder]="'/assets/placeholder-escudo.png'"
             alt="Escudo"
             class="escudo-mini">
      </td>
      <td>{{ equipo.nombre }}</td>
      <td>{{ equipo.puntos }}</td>
    </tr>
  }
</table>
```

#### 2. Fotos de Jugadores en Ranking de Goleadores

```html
<div class="ranking-goleadores">
  @for (jugador of goleadores; track jugador.id) {
    <div class="card-goleador">
      <img appLazyLoad 
           [src]="jugador.foto_url" 
           [placeholder]="'/assets/placeholder-jugador.png'"
           [threshold]="0.2"
           alt="Foto"
           class="foto-jugador">
      <div class="info">
        <h4>{{ jugador.nombre }}</h4>
        <p>{{ jugador.goles }} goles</p>
      </div>
    </div>
  }
</div>
```

#### 3. Logos de Patrocinadores

```html
<div class="patrocinadores">
  @for (patrocinador of patrocinadores; track patrocinador.id) {
    <img appLazyLoad 
         [src]="patrocinador.logo_url" 
         [placeholder]="'/assets/placeholder-logo.png'"
         alt="Logo patrocinador"
         class="logo-patrocinador">
  }
</div>
```

### Rendimiento

La directiva está optimizada para:

- **Reducir carga inicial**: Solo carga imágenes visibles
- **Mejorar tiempo de carga**: Prioriza contenido above-the-fold
- **Ahorrar ancho de banda**: No descarga imágenes que el usuario nunca ve
- **Mejorar Core Web Vitals**: Reduce LCP (Largest Contentful Paint)

### Compatibilidad

- ✅ Chrome 51+
- ✅ Firefox 55+
- ✅ Safari 12.1+
- ✅ Edge 15+
- ✅ Fallback automático para navegadores antiguos

### Notas Técnicas

1. **Margin de Precarga**: La directiva carga imágenes 50px antes de que entren en el viewport para una experiencia más fluida.

2. **Limpieza Automática**: El Intersection Observer se desconecta automáticamente después de cargar la imagen para liberar recursos.

3. **Manejo de Errores**: Si la imagen falla al cargar, se aplica la clase `lazy-error` y se mantiene el placeholder.

4. **Validación**: La directiva valida que:
   - Se use solo en elementos `<img>`
   - Se proporcione una URL válida
   - El threshold esté entre 0.0 y 1.0

### Troubleshooting

#### La imagen no se carga

- Verifica que la URL sea válida y accesible
- Revisa la consola del navegador para errores CORS
- Asegúrate de que el elemento tenga altura definida

#### El placeholder no se muestra

- Verifica que la URL del placeholder sea correcta
- Asegúrate de que el placeholder esté en la carpeta `assets`

#### La animación no funciona

- Verifica que hayas agregado los estilos CSS recomendados
- Revisa que no haya conflictos con otros estilos

### Mejores Prácticas

1. **Usa placeholders del mismo tamaño**: Evita layout shifts usando placeholders con las mismas dimensiones que la imagen final.

2. **Define dimensiones explícitas**: Siempre especifica `width` y `height` en las imágenes para evitar CLS (Cumulative Layout Shift).

3. **Optimiza placeholders**: Usa placeholders pequeños (< 5KB) para carga rápida.

4. **Threshold apropiado**: Usa `0.1` para la mayoría de casos, `0.5` para imágenes grandes.

5. **Combina con CDN**: Para mejor rendimiento, sirve imágenes desde un CDN con compresión automática.

### Ejemplo Completo

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyLoadDirective } from '@shared/directives';

@Component({
  selector: 'app-galeria-equipos',
  standalone: true,
  imports: [CommonModule, LazyLoadDirective],
  template: `
    <div class="galeria">
      <h2>Equipos del Torneo</h2>
      <div class="grid">
        @for (equipo of equipos; track equipo.id) {
          <div class="card">
            <img appLazyLoad 
                 [src]="equipo.escudo_url" 
                 [placeholder]="placeholderUrl"
                 [threshold]="0.15"
                 [alt]="equipo.nombre"
                 width="120"
                 height="120"
                 class="escudo">
            <h3>{{ equipo.nombre }}</h3>
            <p>{{ equipo.ciudad }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .galeria {
      padding: 2rem;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    
    .card {
      background: #1a1a1a;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }
    
    .escudo {
      width: 120px;
      height: 120px;
      object-fit: contain;
      margin-bottom: 1rem;
    }
  `]
})
export class GaleriaEquiposComponent {
  placeholderUrl = '/assets/images/placeholder-escudo.png';
  
  equipos = [
    { id: 1, nombre: 'Equipo A', ciudad: 'Ciudad A', escudo_url: 'https://...' },
    { id: 2, nombre: 'Equipo B', ciudad: 'Ciudad B', escudo_url: 'https://...' },
    // ... más equipos
  ];
}
```

## Contribuir

Para agregar nuevas directivas:

1. Crea el archivo de la directiva: `nombre.directive.ts`
2. Crea el archivo de tests: `nombre.directive.spec.ts`
3. Exporta la directiva en `index.ts`
4. Documenta el uso en este README
5. Agrega ejemplos de uso en componentes reales

## Licencia

SportZone Pro - Sistema de Gestión de Campeonatos Deportivos
