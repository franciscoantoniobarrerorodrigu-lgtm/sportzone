import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LigaService } from '../../core/services/liga.service';
import { TablaPosicionesComponent } from './tabla-posiciones.component';

@Component({
  selector: 'app-liga',
  standalone: true,
  imports: [CommonModule, FormsModule, TablaPosicionesComponent],
  template: `
    <div class="liga-container">
      <h1 class="page-title">TABLA DE POSICIONES</h1>

      <!-- Selector de Torneo -->
      <div class="torneo-selector">
        <label for="torneo">Torneo:</label>
        <select 
          id="torneo" 
          [(ngModel)]="torneoSeleccionado"
          (change)="onTorneoChange()"
          class="select-torneo"
        >
          @for (torneo of torneos(); track torneo.id) {
            <option [value]="torneo.id">{{ torneo.nombre }}</option>
          }
        </select>
      </div>

      <!-- Tabla de Posiciones -->
      <app-tabla-posiciones />
    </div>
  `,
  styles: [`
    .liga-container {
      animation: fadeIn 0.5s;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 3rem;
      color: #00D4FF;
      letter-spacing: 3px;
      margin-bottom: 2rem;
    }

    .torneo-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .torneo-selector label {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .select-torneo {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 6px;
      padding: 0.8rem 1.2rem;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 250px;
    }

    .select-torneo:focus {
      outline: none;
      border-color: #00D4FF;
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }

    .select-torneo option {
      background: #0A1628;
      color: white;
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 2rem;
      }

      .torneo-selector {
        flex-direction: column;
        align-items: stretch;
      }

      .select-torneo {
        width: 100%;
      }
    }
  `]
})
export class LigaComponent implements OnInit {
  ligaService = inject(LigaService);
  
  torneos = signal<any[]>([]);
  torneoSeleccionado = '';

  ngOnInit() {
    this.cargarTorneos();
  }

  async cargarTorneos() {
    this.ligaService.getTorneos().subscribe(data => {
      this.torneos.set(data);
      if (data.length > 0) {
        this.torneoSeleccionado = data[0].id;
        this.ligaService.cargarTabla(this.torneoSeleccionado);
      }
    });
  }

  onTorneoChange() {
    if (this.torneoSeleccionado) {
      this.ligaService.cargarTabla(this.torneoSeleccionado);
    }
  }
}
