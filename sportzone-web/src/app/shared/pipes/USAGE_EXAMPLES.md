# Ejemplos de Uso de Pipes

## Uso en Componentes Existentes

### PartidoLiveComponent

```typescript
import { Component } from '@angular/core';
import { MinutoPipe, FechaPipe } from '@shared/pipes';

@Component({
  selector: 'app-partido-live',
  standalone: true,
  imports: [MinutoPipe, FechaPipe],
  template: `
    <div class="partido-live">
      <!-- Cronómetro con MinutoPipe -->
      <div class="cronometro">
        {{ minutoActual | minuto }}
      </div>

      <!-- Fecha del partido con FechaPipe -->
      <div class="fecha-partido">
        {{ partido.fechaHora | fecha:'full' }}
      </div>

      <!-- Hora de inicio -->
      <div class="hora-inicio">
        Inicio: {{ partido.fechaHora | fecha:'time' }}
      </div>
    </div>
  `
})
export class PartidoLiveComponent {
  minutoActual = 45; // minutos
  partido = {
    fechaHora: new Date(2025, 0, 12, 14, 30)
  };
}
```

**Output:**
```
45:00
Domingo, 12 de enero de 2025
Inicio: 14:30
```

---

### MarcadorPublicoComponent

```typescript
import { Component } from '@angular/core';
import { MinutoPipe, FechaPipe } from '@shared/pipes';

@Component({
  selector: 'app-marcador-publico',
  standalone: true,
  imports: [MinutoPipe, FechaPipe],
  template: `
    <div class="marcador-publico">
      <!-- Marcador gigante -->
      <div class="marcador">
        <span class="equipo-local">{{ equipoLocal }}</span>
        <span class="goles">{{ golesLocal }} - {{ golesVisita }}</span>
        <span class="equipo-visita">{{ equipoVisita }}</span>
      </div>

      <!-- Cronómetro en segundos -->
      <div class="cronometro-segundos">
        {{ segundosTranscurridos | minuto:'seconds' }}
      </div>

      <!-- Información del partido -->
      <div class="info-partido">
        {{ fechaPartido | fecha:'datetime' }}
      </div>
    </div>
  `
})
export class MarcadorPublicoComponent {
  equipoLocal = 'Barcelona';
  equipoVisita = 'Real Madrid';
  golesLocal = 2;
  golesVisita = 1;
  segundosTranscurridos = 2730; // 45 minutos 30 segundos
  fechaPartido = new Date();
}
```

**Output:**
```
Barcelona 2 - 1 Real Madrid
45:30
12 ene 2025, 14:30
```

---

### PlanilleroComponent

```typescript
import { Component, signal } from '@angular/core';
import { MinutoPipe } from '@shared/pipes';

@Component({
  selector: 'app-planillero',
  standalone: true,
  imports: [MinutoPipe],
  template: `
    <div class="planillero-interface">
      <!-- Cronómetro gigante -->
      <div class="cronometro-gigante">
        {{ cronometro() | minuto }}
      </div>

      <!-- Controles -->
      <button (click)="iniciar()">INICIAR</button>
      <button (click)="pausar()">PAUSAR</button>
    </div>
  `
})
export class PlanilleroComponent {
  cronometro = signal(0); // minutos
  intervalo: any;

  iniciar() {
    this.intervalo = setInterval(() => {
      this.cronometro.update(v => v + 1);
    }, 60000); // cada minuto
  }

  pausar() {
    clearInterval(this.intervalo);
  }
}
```

---

### CronogramaComponent

```typescript
import { Component } from '@angular/core';
import { FechaPipe } from '@shared/pipes';

@Component({
  selector: 'app-cronograma',
  standalone: true,
  imports: [FechaPipe],
  template: `
    <div class="cronograma">
      @for (partido of partidos; track partido.id) {
        <div class="partido-card">
          <div class="fecha">
            {{ partido.fechaHora | fecha:'medium' }}
          </div>
          <div class="hora">
            {{ partido.fechaHora | fecha:'time' }}
          </div>
          <div class="equipos">
            {{ partido.equipoLocal }} vs {{ partido.equipoVisita }}
          </div>
        </div>
      }
    </div>
  `
})
export class CronogramaComponent {
  partidos = [
    {
      id: 1,
      fechaHora: new Date(2025, 0, 15, 18, 0),
      equipoLocal: 'Barcelona',
      equipoVisita: 'Real Madrid'
    },
    {
      id: 2,
      fechaHora: new Date(2025, 0, 16, 20, 30),
      equipoLocal: 'Atlético',
      equipoVisita: 'Sevilla'
    }
  ];
}
```

**Output:**
```
15 enero 2025
18:00
Barcelona vs Real Madrid

16 enero 2025
20:30
Atlético vs Sevilla
```

---

### GoleadoresComponent

```typescript
import { Component } from '@angular/core';
import { FechaPipe } from '@shared/pipes';

@Component({
  selector: 'app-goleadores',
  standalone: true,
  imports: [FechaPipe],
  template: `
    <div class="goleadores">
      <h2>Tabla de Goleadores</h2>
      <p class="ultima-actualizacion">
        Última actualización: {{ ultimaActualizacion | fecha:'datetime' }}
      </p>

      @for (goleador of goleadores; track goleador.id) {
        <div class="goleador-card">
          <span class="nombre">{{ goleador.nombre }}</span>
          <span class="goles">{{ goleador.goles }} goles</span>
        </div>
      }
    </div>
  `
})
export class GoleadoresComponent {
  ultimaActualizacion = new Date();
  goleadores = [
    { id: 1, nombre: 'Lionel Messi', goles: 25 },
    { id: 2, nombre: 'Cristiano Ronaldo', goles: 23 }
  ];
}
```

---

## Uso con Signals (Angular 17+)

```typescript
import { Component, signal, computed } from '@angular/core';
import { MinutoPipe, FechaPipe } from '@shared/pipes';

@Component({
  selector: 'app-partido-signal',
  standalone: true,
  imports: [MinutoPipe, FechaPipe],
  template: `
    <div class="partido">
      <!-- Los pipes funcionan perfectamente con signals -->
      <div class="tiempo">{{ minutoActual() | minuto }}</div>
      <div class="fecha">{{ fechaPartido() | fecha:'full' }}</div>
      
      <!-- También con computed signals -->
      <div class="tiempo-restante">
        Tiempo restante: {{ tiempoRestante() | minuto }}
      </div>
    </div>
  `
})
export class PartidoSignalComponent {
  minutoActual = signal(45);
  fechaPartido = signal(new Date());
  
  tiempoRestante = computed(() => {
    return 90 - this.minutoActual();
  });
}
```

---

## Uso Programático (en TypeScript)

```typescript
import { MinutoPipe, FechaPipe } from '@shared/pipes';

export class MiServicio {
  private minutoPipe = new MinutoPipe();
  private fechaPipe = new FechaPipe();

  formatearTiempo(minutos: number): string {
    return this.minutoPipe.transform(minutos);
  }

  formatearFecha(fecha: Date): string {
    return this.fechaPipe.transform(fecha, 'long');
  }

  generarResumen(partido: any): string {
    const fecha = this.fechaPipe.transform(partido.fechaHora, 'full');
    const minuto = this.minutoPipe.transform(partido.minutoActual);
    
    return `${fecha} - Minuto ${minuto}`;
  }
}
```

---

## Combinación con Otros Pipes

```typescript
@Component({
  template: `
    <!-- Combinar con uppercase -->
    <div>{{ 'tiempo: ' + (minuto | minuto) | uppercase }}</div>
    <!-- Output: "TIEMPO: 45:00" -->

    <!-- Combinar con async pipe -->
    <div>{{ minutoObservable$ | async | minuto }}</div>

    <!-- Combinar con json (para debugging) -->
    <div>{{ { tiempo: (minuto | minuto), fecha: (fecha | fecha:'full') } | json }}</div>
  `
})
```

---

## Testing con los Pipes

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinutoPipe, FechaPipe } from '@shared/pipes';
import { MiComponente } from './mi-componente';

describe('MiComponente', () => {
  let component: MiComponente;
  let fixture: ComponentFixture<MiComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiComponente, MinutoPipe, FechaPipe]
    }).compileComponents();

    fixture = TestBed.createComponent(MiComponente);
    component = fixture.componentInstance;
  });

  it('should format time correctly', () => {
    component.minuto = 45;
    fixture.detectChanges();
    
    const element = fixture.nativeElement.querySelector('.cronometro');
    expect(element.textContent).toContain('45:00');
  });
});
```
