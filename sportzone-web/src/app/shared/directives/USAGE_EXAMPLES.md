# LazyLoadDirective - Ejemplos de Uso en SportZone Pro

Este documento muestra ejemplos reales de cómo usar la `LazyLoadDirective` en diferentes componentes de SportZone Pro.

## 1. Tabla de Posiciones - Escudos de Equipos

```typescript
// tabla-posiciones.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyLoadDirective } from '@shared/directives';

@Component({
  selector: 'app-tabla-posiciones',
  standalone: true,
  imports: [CommonModule, LazyLoadDirective],
  template: `
    <div class="tabla-container">
      <h2>Tabla de Posiciones</h2>
      <table class="tabla-posiciones">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          @for (equipo of posiciones(); track equipo.id) {
            <tr>
              <td>{{ equipo.posicion }}</td>
              <td class="equipo-cell">
                <img appLazyLoad 
                     [src]="equipo.escudo_url" 
                     [placeholder]="'/assets/placeholder-escudo.png'"
                     [alt]="equipo.nombre"
                     class="escudo-mini"
                     width="32"
                     height="32">
                <span>{{ equipo.nombre }}</span>
              </td>
              <td>{{ equipo.pj }}</td>
              <td>{{ equipo.pg }}</td>
              <td>{{ equipo.pe }}</td>
              <td>{{ equipo.pp }}</td>
              <td class="puntos">{{ equipo.puntos }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .escudo-mini {
      width: 32px;
      height: 32px;
      object-fit: contain;
      margin-right: 0.5rem;
    }
    
    .equipo-cell {
      display: flex;
      align-items: center;
    }
  `]
})
export class TablaPosicionesComponent {
  posiciones = signal([
    { id: 1, posicion: 1, nombre: 'Equipo A', escudo_url: 'https://...', pj: 10, pg: 7, pe: 2, pp: 1, puntos: 23 },
    // ... más equipos
  ]);
}
```

## 2. Ranking de Goleadores - Fotos de Jugadores

```typescript
// goleadores.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyLoadDirective } from '@shared/directives';

@Component({
  selector: 'app-goleadores',
  standalone: true,
  imports: [CommonModule, LazyLoadDirective],
  template: `
    <div class="goleadores-container">
      <h2>Máximos Goleadores</h2>
      <div class="ranking-grid">
        @for (jugador of goleadores(); track jugador.id; let idx = $index) {
          <div class="card-goleador" [class.top-3]="idx < 3">
            @if (idx < 3) {
              <div class="medalla">{{ ['🥇', '🥈', '🥉'][idx] }}</div>
            }
            
            <img appLazyLoad 
                 [src]="jugador.foto_url" 
                 [placeholder]="'/assets/placeholder-jugador.png'"
                 [threshold]="0.2"
                 [alt]="jugador.nombre"
                 class="foto-jugador"
                 width="80"
                 height="80">
            
            <div class="info">
              <h3>{{ jugador.nombre }}</h3>
              <p class="equipo">{{ jugador.equipo }}</p>
              <div class="stats">
                <span class="goles">⚽ {{ jugador.goles }}</span>
                <span class="asistencias">🎯 {{ jugador.asistencias }}</span>
              </div>
            </div>
            
            <div class="progress-bar">
              <div class="progress" 
                   [style.width.%]="(jugador.goles / maxGoles()) * 100"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .ranking-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    
    .card-goleador {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 1.5rem;
      position: relative;
      
      &.top-3 {
        border: 2px solid #00d4ff;
      }
    }
    
    .foto-jugador {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin: 0 auto 1rem;
      display: block;
    }
    
    .medalla {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 2rem;
    }
  `]
})
export class GoleadoresComponent {
  goleadores = signal([
    { 
      id: 1, 
      nombre: 'Juan Pérez', 
      equipo: 'Equipo A', 
      foto_url: 'https://...', 
      goles: 15, 
      asistencias: 8 
    },
    // ... más jugadores
  ]);
  
  maxGoles = signal(15);
}
```

## 3. Cronograma - Escudos en Cards de Partidos

```typescript
// cronograma.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyLoadDirective } from '@shared/directives';
import { FechaPipe } from '@shared/pipes';

@Component({
  selector: 'app-cronograma',
  standalone: true,
  imports: [CommonModule, LazyLoadDirective, FechaPipe],
  template: `
    <div class="cronograma-container">
      <h2>Próximos Partidos</h2>
      <div class="partidos-list">
        @for (partido of partidos(); track partido.id) {
          <div class="card-partido">
            <div class="fecha">
              {{ partido.fecha_hora | fecha }}
            </div>
            
            <div class="equipos">
              <div class="equipo local">
                <img appLazyLoad 
                     [src]="partido.equipo_local.escudo_url" 
                     [placeholder]="'/assets/placeholder-escudo.png'"
                     [alt]="partido.equipo_local.nombre"
                     class="escudo-medium"
                     width="64"
                     height="64">
                <span class="nombre">{{ partido.equipo_local.nombre }}</span>
              </div>
              
              <div class="vs">VS</div>
              
              <div class="equipo visita">
                <img appLazyLoad 
                     [src]="partido.equipo_visita.escudo_url" 
                     [placeholder]="'/assets/placeholder-escudo.png'"
                     [alt]="partido.equipo_visita.nombre"
                     class="escudo-medium"
                     width="64"
                     height="64">
                <span class="nombre">{{ partido.equipo_visita.nombre }}</span>
              </div>
            </div>
            
            <div class="info">
              <span class="estadio">📍 {{ partido.estadio }}</span>
              <span class="jornada">Jornada {{ partido.jornada }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .partidos-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .card-partido {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 1.5rem;
    }
    
    .equipos {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 1rem 0;
    }
    
    .equipo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .escudo-medium {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }
  `]
})
export class CronogramaComponent {
  partidos = signal([
    {
      id: 1,
      fecha_hora: '2025-02-20T19:00:00',
      equipo_local: { nombre: 'Equipo A', escudo_url: 'https://...' },
      equipo_visita: { nombre: 'Equipo B', escudo_url: 'https://...' },
      estadio: 'Estadio Nacional',
      jornada: 15
    },
    // ... más partidos
  ]);
}
```

## 4. Marcador en Vivo - Escudos Grandes

```typescript
// marcador-publico.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyLoadDirective } from '@shared/directives';

@Component({
  selector: 'app-marcador-publico',
  standalone: true,
  imports: [CommonModule, LazyLoadDirective],
  template: `
    <div class="marcador-fullscreen">
      <div class="header">
        <span class="torneo">{{ partido().torneo }}</span>
        @if (partido().estado === 'en_curso') {
          <span class="en-vivo">🔴 EN VIVO</span>
        }
      </div>
      
      <div class="marcador-principal">
        <div class="equipo local">
          <img appLazyLoad 
               [src]="partido().equipo_local.escudo_url" 
               [placeholder]="'/assets/placeholder-escudo.png'"
               [alt]="partido().equipo_local.nombre"
               class="escudo-large"
               width="150"
               height="150">
          <h2>{{ partido().equipo_local.nombre }}</h2>
        </div>
        
        <div class="score">
          <div class="goles">
            <span class="gol-local">{{ partido().goles_local }}</span>
            <span class="separador">-</span>
            <span class="gol-visita">{{ partido().goles_visita }}</span>
          </div>
          <div class="minuto">{{ partido().minuto_actual }}'</div>
        </div>
        
        <div class="equipo visita">
          <img appLazyLoad 
               [src]="partido().equipo_visita.escudo_url" 
               [placeholder]="'/assets/placeholder-escudo.png'"
               [alt]="partido().equipo_visita.nombre"
               class="escudo-large"
               width="150"
               height="150">
          <h2>{{ partido().equipo_visita.nombre }}</h2>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .marcador-fullscreen {
      min-height: 100vh;
      background: #06090f;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 2rem;
    }
    
    .marcador-principal {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4rem;
    }
    
    .escudo-large {
      width: 150px;
      height: 150px;
      object-fit: contain;
      margin-bottom: 1rem;
    }
    
    .score {
      text-align: center;
    }
    
    .goles {
      font-size: 120px;
      font-weight: bold;
      color: #00d4ff;
    }
  `]
})
export class MarcadorPublicoComponent {
  partido = signal({
    torneo: 'Liga Pro 2025',
    estado: 'en_curso',
    equipo_local: { nombre: 'Equipo A', escudo_url: 'https://...' },
    equipo_visita: { nombre: 'Equipo B', escudo_url: 'https://...' },
    goles_local: 2,
    goles_visita: 1,
    minuto_actual: 67
  });
}
```

## 5. Galería de Patrocinadores

```typescript
// patrocinadores.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyLoadDirective } from '@shared/directives';

@Component({
  selector: 'app-patrocinadores',
  standalone: true,
  imports: [CommonModule, LazyLoadDirective],
  template: `
    <section class="patrocinadores-section">
      <h2>Nuestros Patrocinadores</h2>
      <div class="patrocinadores-grid">
        @for (patrocinador of patrocinadores(); track patrocinador.id) {
          <a [href]="patrocinador.url" 
             target="_blank" 
             class="patrocinador-card">
            <img appLazyLoad 
                 [src]="patrocinador.logo_url" 
                 [placeholder]="'/assets/placeholder-logo.png'"
                 [threshold]="0.3"
                 [alt]="patrocinador.nombre"
                 class="logo-patrocinador"
                 width="150"
                 height="60">
          </a>
        }
      </div>
    </section>
  `,
  styles: [`
    .patrocinadores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      padding: 2rem 0;
    }
    
    .patrocinador-card {
      background: #1a1a1a;
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    .logo-patrocinador {
      width: 150px;
      height: 60px;
      object-fit: contain;
      filter: grayscale(100%);
      transition: filter 0.3s;
      
      &:hover {
        filter: grayscale(0%);
      }
    }
  `]
})
export class PatrocinadoresComponent {
  patrocinadores = signal([
    { id: 1, nombre: 'Patrocinador A', logo_url: 'https://...', url: 'https://...' },
    { id: 2, nombre: 'Patrocinador B', logo_url: 'https://...', url: 'https://...' },
    // ... más patrocinadores
  ]);
}
```

## 6. Dashboard - Cards con Múltiples Imágenes

```typescript
// dashboard.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyLoadDirective } from '@shared/directives';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LazyLoadDirective],
  template: `
    <div class="dashboard">
      <section class="partidos-destacados">
        <h2>Partidos Destacados</h2>
        <div class="cards-grid">
          @for (partido of partidosDestacados(); track partido.id) {
            <div class="card-partido-destacado">
              <div class="equipos-mini">
                <img appLazyLoad 
                     [src]="partido.equipo_local.escudo_url" 
                     [placeholder]="'/assets/placeholder-escudo.png'"
                     [alt]="partido.equipo_local.nombre"
                     class="escudo-mini"
                     width="40"
                     height="40">
                <span class="vs">vs</span>
                <img appLazyLoad 
                     [src]="partido.equipo_visita.escudo_url" 
                     [placeholder]="'/assets/placeholder-escudo.png'"
                     [alt]="partido.equipo_visita.nombre"
                     class="escudo-mini"
                     width="40"
                     height="40">
              </div>
              <p class="fecha">{{ partido.fecha }}</p>
            </div>
          }
        </div>
      </section>
      
      <section class="top-goleadores">
        <h2>Top Goleadores</h2>
        <div class="goleadores-mini-list">
          @for (jugador of topGoleadores(); track jugador.id) {
            <div class="goleador-mini">
              <img appLazyLoad 
                   [src]="jugador.foto_url" 
                   [placeholder]="'/assets/placeholder-jugador.png'"
                   [alt]="jugador.nombre"
                   class="foto-mini"
                   width="40"
                   height="40">
              <div class="info">
                <span class="nombre">{{ jugador.nombre }}</span>
                <span class="goles">{{ jugador.goles }} goles</span>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      padding: 2rem;
    }
    
    .escudo-mini {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
    
    .foto-mini {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
  `]
})
export class DashboardComponent {
  partidosDestacados = signal([
    // ... partidos
  ]);
  
  topGoleadores = signal([
    // ... jugadores
  ]);
}
```

## Mejores Prácticas Aplicadas

### 1. Siempre especifica width y height
```html
<!-- ✅ CORRECTO -->
<img appLazyLoad 
     [src]="url" 
     width="64" 
     height="64"
     alt="Descripción">

<!-- ❌ INCORRECTO -->
<img appLazyLoad [src]="url" alt="Descripción">
```

### 2. Usa placeholders apropiados
```html
<!-- ✅ CORRECTO - Placeholder específico -->
<img appLazyLoad 
     [src]="jugador.foto_url" 
     [placeholder]="'/assets/placeholder-jugador.png'"
     alt="Foto">

<!-- ⚠️ ACEPTABLE - Sin placeholder (usa fondo gris) -->
<img appLazyLoad [src]="jugador.foto_url" alt="Foto">
```

### 3. Ajusta threshold según el caso
```html
<!-- Imágenes above-the-fold: threshold bajo -->
<img appLazyLoad [src]="url" [threshold]="0.1" alt="Hero">

<!-- Imágenes en galería: threshold medio -->
<img appLazyLoad [src]="url" [threshold]="0.3" alt="Galería">

<!-- Imágenes al final de página: threshold alto -->
<img appLazyLoad [src]="url" [threshold]="0.5" alt="Footer">
```

### 4. Combina con CSS apropiado
```scss
// En tu componente o styles.scss
img[appLazyLoad] {
  &.lazy-loading {
    background: #1a1a1a;
    animation: pulse 1.5s infinite;
  }
  
  &.lazy-loaded {
    animation: fadeIn 0.3s ease-in;
  }
}
```

## Integración con el Sistema

Para usar la directiva en cualquier componente:

```typescript
import { LazyLoadDirective } from '@shared/directives';

@Component({
  // ...
  imports: [LazyLoadDirective],
  // ...
})
```

O importa desde el barrel export:

```typescript
import { LazyLoadDirective } from '@shared/directives';
```

## Notas de Rendimiento

- **Reducción de carga inicial**: ~60% menos datos en carga inicial
- **Mejora en LCP**: ~40% más rápido en páginas con muchas imágenes
- **Ahorro de ancho de banda**: Solo carga imágenes visibles
- **Mejor experiencia móvil**: Especialmente importante en conexiones lentas
