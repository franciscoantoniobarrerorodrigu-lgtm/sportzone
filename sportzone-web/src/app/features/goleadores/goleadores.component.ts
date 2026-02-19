import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoleadoresService } from '../../core/services/goleadores.service';
import { Goleador } from '../../core/models';

type TabType = 'goleadores' | 'asistencias' | 'amarillas' | 'rojas';

@Component({
  selector: 'app-goleadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="goleadores-container">
      <h1 class="page-title">ESTADÍSTICAS</h1>

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

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab"
          [class.active]="tabActiva() === 'goleadores'"
          (click)="cambiarTab('goleadores')"
        >
          ⚽ Goleadores
        </button>
        <button 
          class="tab"
          [class.active]="tabActiva() === 'asistencias'"
          (click)="cambiarTab('asistencias')"
        >
          🎯 Asistencias
        </button>
        <button 
          class="tab"
          [class.active]="tabActiva() === 'amarillas'"
          (click)="cambiarTab('amarillas')"
        >
          🟨 Tarjetas Amarillas
        </button>
        <button 
          class="tab"
          [class.active]="tabActiva() === 'rojas'"
          (click)="cambiarTab('rojas')"
        >
          🟥 Tarjetas Rojas
        </button>
      </div>

      <!-- Contenido -->
      <div class="contenido">
        @if (loading()) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Cargando estadísticas...</p>
          </div>
        } @else {
          <div class="ranking-list">
            @for (jugador of datosActuales(); track jugador.jugadorId; let idx = $index) {
              <div class="jugador-card" [class.top-3]="idx < 3">
                <div class="posicion-badge" [class.oro]="idx === 0" [class.plata]="idx === 1" [class.bronce]="idx === 2">
                  {{ idx + 1 }}
                </div>

                <div class="jugador-info">
                  @if (jugador.fotoUrl) {
                    <img [src]="jugador.fotoUrl" [alt]="jugador.jugadorNombre" class="foto">
                  } @else {
                    <div class="foto-placeholder">👤</div>
                  }
                  
                  <div class="detalles">
                    <div class="nombre">{{ jugador.jugadorNombre }}</div>
                    <div class="equipo">
                      @if (jugador.equipo.escudoUrl) {
                        <img [src]="jugador.equipo.escudoUrl" [alt]="jugador.equipo.nombre" class="escudo-mini">
                      }
                      <span>{{ jugador.equipo.nombre }}</span>
                    </div>
                  </div>
                </div>

                <div class="estadistica">
                  <div class="valor">{{ getValorEstadistica(jugador) }}</div>
                  <div class="barra-progreso">
                    <div class="barra-fill" [style.width.%]="calcularPorcentaje(jugador, idx)"></div>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <p>No hay datos disponibles</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .goleadores-container {
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
    }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .tab {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem 1.5rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tab:hover {
      border-color: rgba(0, 212, 255, 0.5);
      color: white;
    }

    .tab.active {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 153, 204, 0.1));
      border-color: #00D4FF;
      color: #00D4FF;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(0, 212, 255, 0.2);
      border-top-color: #00D4FF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .ranking-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .jugador-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.3s;
    }

    .jugador-card:hover {
      border-color: rgba(0, 212, 255, 0.5);
      transform: translateX(4px);
    }

    .jugador-card.top-3 {
      border-width: 2px;
    }

    .posicion-badge {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 212, 255, 0.2);
      border-radius: 50%;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem;
      color: #00D4FF;
      font-weight: 700;
    }

    .posicion-badge.oro {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: #000;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
    }

    .posicion-badge.plata {
      background: linear-gradient(135deg, #C0C0C0, #808080);
      color: #000;
      box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4);
    }

    .posicion-badge.bronce {
      background: linear-gradient(135deg, #CD7F32, #8B4513);
      color: #FFF;
      box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4);
    }

    .jugador-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .foto {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(0, 212, 255, 0.3);
    }

    .foto-placeholder {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(0, 212, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }

    .detalles {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .nombre {
      font-size: 1.1rem;
      font-weight: 700;
      color: white;
    }

    .equipo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }

    .escudo-mini {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }

    .estadistica {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
      min-width: 120px;
    }

    .valor {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.5rem;
      color: #00D4FF;
      line-height: 1;
    }

    .barra-progreso {
      width: 100%;
      height: 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      overflow: hidden;
    }

    .barra-fill {
      height: 100%;
      background: linear-gradient(90deg, #00D4FF, #0099CC);
      border-radius: 4px;
      transition: width 0.5s ease;
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

      .tabs {
        gap: 0.5rem;
      }

      .tab {
        padding: 0.8rem 1rem;
        font-size: 0.9rem;
      }

      .jugador-card {
        grid-template-columns: auto 1fr;
        gap: 1rem;
      }

      .estadistica {
        grid-column: 1 / -1;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .barra-progreso {
        flex: 1;
      }
    }
  `]
})
export class GoleadoresComponent implements OnInit {
  goleadoresService = inject(GoleadoresService);
  
  torneos = signal<any[]>([]);
  torneoSeleccionado = '';
  tabActiva = signal<TabType>('goleadores');
  loading = signal(false);
  datosActuales = signal<any[]>([]);

  ngOnInit() {
    this.cargarTorneos();
  }

  async cargarTorneos() {
    // Mock - en producción cargar desde API
    this.torneos.set([
      { id: '1', nombre: 'Liga Pro 2025' },
      { id: '2', nombre: 'Copa Nacional 2025' }
    ]);
    
    if (this.torneos().length > 0) {
      this.torneoSeleccionado = this.torneos()[0].id;
      this.cargarDatos();
    }
  }

  onTorneoChange() {
    this.cargarDatos();
  }

  cambiarTab(tab: TabType) {
    this.tabActiva.set(tab);
    this.cargarDatos();
  }

  async cargarDatos() {
    this.loading.set(true);
    
    try {
      // Aquí se cargarían los datos reales desde el servicio
      // Por ahora usamos datos mock
      const mockData = this.generarDatosMock();
      this.datosActuales.set(mockData);
    } finally {
      this.loading.set(false);
    }
  }

  getValorEstadistica(jugador: any): number {
    switch (this.tabActiva()) {
      case 'goleadores': return jugador.goles || 0;
      case 'asistencias': return jugador.asistencias || 0;
      case 'amarillas': return jugador.tarjetasAmarillas || 0;
      case 'rojas': return jugador.tarjetasRojas || 0;
      default: return 0;
    }
  }

  calcularPorcentaje(jugador: any, index: number): number {
    if (index === 0) return 100;
    const valorActual = this.getValorEstadistica(jugador);
    const valorMaximo = this.getValorEstadistica(this.datosActuales()[0]);
    return valorMaximo > 0 ? (valorActual / valorMaximo) * 100 : 0;
  }

  private generarDatosMock(): any[] {
    const nombres = ['Juan Pérez', 'Carlos Rodríguez', 'Miguel Ángel', 'Luis Fernando', 'Diego Martínez'];
    const equipos = [
      { nombre: 'Barcelona SC', escudoUrl: '/assets/escudos/barcelona.png' },
      { nombre: 'Emelec', escudoUrl: '/assets/escudos/emelec.png' },
      { nombre: 'LDU Quito', escudoUrl: '/assets/escudos/ldu.png' }
    ];

    return nombres.map((nombre, i) => ({
      jugadorId: `${i + 1}`,
      jugadorNombre: nombre,
      equipo: equipos[i % equipos.length],
      goles: 15 - i * 2,
      asistencias: 10 - i,
      tarjetasAmarillas: 5 - i,
      tarjetasRojas: Math.max(0, 2 - i),
      fotoUrl: null
    }));
  }
}
