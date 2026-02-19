import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PartidosService } from '../../core/services/partidos.service';

@Component({
  selector: 'app-cronograma',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="cronograma-container">
      <h1 class="page-title">CRONOGRAMA</h1>

      <!-- Filtros -->
      <div class="filtros">
        <div class="filtro-group">
          <label>Torneo:</label>
          <select [(ngModel)]="torneoSeleccionado" (change)="aplicarFiltros()" class="select-filtro">
            <option value="">Todos</option>
            @for (torneo of torneos(); track torneo.id) {
              <option [value]="torneo.id">{{ torneo.nombre }}</option>
            }
          </select>
        </div>

        <div class="filtro-group">
          <label>Equipo:</label>
          <select [(ngModel)]="equipoSeleccionado" (change)="aplicarFiltros()" class="select-filtro">
            <option value="">Todos</option>
            @for (equipo of equipos(); track equipo.id) {
              <option [value]="equipo.id">{{ equipo.nombre }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Partidos por Jornada -->
      <div class="jornadas-list">
        @for (jornada of jornadasAgrupadas(); track jornada.numero) {
          <div class="jornada-card">
            <h3 class="jornada-titulo">JORNADA {{ jornada.numero }}</h3>
            
            <div class="partidos-jornada">
              @for (partido of jornada.partidos; track partido.id) {
                <div class="partido-item" [routerLink]="['/partidos', partido.id, 'live']">
                  <div class="partido-fecha">
                    {{ formatFecha(partido.fechaHora) }}
                  </div>
                  
                  <div class="partido-equipos">
                    <div class="equipo">
                      <img [src]="partido.equipoLocal.escudo" [alt]="partido.equipoLocal.nombre" class="escudo">
                      <span class="nombre">{{ partido.equipoLocal.nombre }}</span>
                    </div>
                    
                    <div class="marcador">
                      @if (partido.estado === 'finalizado') {
                        <span class="goles">{{ partido.golesLocal }} - {{ partido.golesVisita }}</span>
                      } @else if (partido.estado === 'en_curso') {
                        <span class="badge-live">EN VIVO</span>
                      } @else {
                        <span class="vs">VS</span>
                      }
                    </div>
                    
                    <div class="equipo">
                      <img [src]="partido.equipoVisita.escudo" [alt]="partido.equipoVisita.nombre" class="escudo">
                      <span class="nombre">{{ partido.equipoVisita.nombre }}</span>
                    </div>
                  </div>
                  
                  <div class="partido-estadio">
                    📍 {{ partido.estadio }}
                  </div>
                </div>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>No hay partidos programados</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cronograma-container {
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

    .filtros {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filtro-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filtro-group label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .select-filtro {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 6px;
      padding: 0.8rem 1.2rem;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      min-width: 200px;
    }

    .select-filtro:focus {
      outline: none;
      border-color: #00D4FF;
    }

    .jornadas-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .jornada-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
    }

    .jornada-titulo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      color: #00D4FF;
      letter-spacing: 2px;
      margin-bottom: 1.5rem;
    }

    .partidos-jornada {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .partido-item {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .partido-item:hover {
      border-color: rgba(0, 212, 255, 0.5);
      transform: translateX(4px);
    }

    .partido-fecha {
      color: #FFD60A;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .partido-equipos {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 2rem;
      margin-bottom: 1rem;
    }

    .equipo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .equipo:last-child {
      justify-content: flex-end;
    }

    .escudo {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }

    .nombre {
      color: white;
      font-weight: 600;
    }

    .marcador {
      text-align: center;
    }

    .goles {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: #00D4FF;
    }

    .vs {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 700;
    }

    .badge-live {
      background: #FF2D55;
      color: white;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .partido-estadio {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .empty-state {
      background: rgba(15, 23, 42, 0.4);
      border: 1px dashed rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 3rem;
      text-align: center;
    }

    .empty-state p {
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 2rem;
      }

      .partido-equipos {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .marcador {
        order: -1;
      }
    }
  `]
})
export class CronogramaComponent implements OnInit {
  partidosService = inject(PartidosService);
  
  torneos = signal<any[]>([]);
  equipos = signal<any[]>([]);
  torneoSeleccionado = '';
  equipoSeleccionado = '';
  jornadasAgrupadas = signal<any[]>([]);

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    // Mock data
    this.torneos.set([{ id: '1', nombre: 'Liga Pro 2025' }]);
    this.equipos.set([
      { id: '1', nombre: 'Barcelona SC' },
      { id: '2', nombre: 'Emelec' }
    ]);
    
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    // Mock - agrupar partidos por jornada
    const mockPartidos = this.generarPartidosMock();
    const agrupados = this.agruparPorJornada(mockPartidos);
    this.jornadasAgrupadas.set(agrupados);
  }

  private agruparPorJornada(partidos: any[]): any[] {
    const grupos = new Map<number, any[]>();
    
    partidos.forEach(partido => {
      if (!grupos.has(partido.jornada)) {
        grupos.set(partido.jornada, []);
      }
      grupos.get(partido.jornada)!.push(partido);
    });

    return Array.from(grupos.entries())
      .map(([numero, partidos]) => ({ numero, partidos }))
      .sort((a, b) => a.numero - b.numero);
  }

  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private generarPartidosMock(): any[] {
    return [
      {
        id: '1',
        jornada: 1,
        fechaHora: new Date().toISOString(),
        equipoLocal: { nombre: 'Barcelona SC', escudo: '/assets/escudos/barcelona.png' },
        equipoVisita: { nombre: 'Emelec', escudo: '/assets/escudos/emelec.png' },
        golesLocal: 2,
        golesVisita: 1,
        estado: 'finalizado',
        estadio: 'Estadio Monumental'
      }
    ];
  }
}
