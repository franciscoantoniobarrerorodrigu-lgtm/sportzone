import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PartidosService } from '../../core/services/partidos.service';
import { PartidoEnVivo } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1 class="page-title">DASHBOARD</h1>

      <!-- Partidos en Vivo -->
      <section class="section">
        <h2 class="section-title">
          <span class="live-indicator"></span>
          PARTIDOS EN VIVO
        </h2>
        
        @if (partidosService.partidoEnVivo(); as partido) {
          <div class="partido-live-card" [routerLink]="['/partidos', partido.id, 'live']">
            <div class="partido-header">
              <span class="badge-live">EN VIVO</span>
              <span class="minuto">{{ partido.minuto }}'</span>
            </div>
            
            <div class="partido-content">
              <div class="equipo">
                <img [src]="partido.equipoLocal.escudoUrl" [alt]="partido.equipoLocal.nombre" class="escudo">
                <span class="nombre">{{ partido.equipoLocal.nombre }}</span>
              </div>
              
              <div class="marcador">
                <span class="goles">{{ partido.golesLocal }}</span>
                <span class="separador">-</span>
                <span class="goles">{{ partido.golesVisita }}</span>
              </div>
              
              <div class="equipo">
                <img [src]="partido.equipoVisita.escudoUrl" [alt]="partido.equipoVisita.nombre" class="escudo">
                <span class="nombre">{{ partido.equipoVisita.nombre }}</span>
              </div>
            </div>

            @if (partido.eventos.length > 0) {
              <div class="ultimo-evento">
                <span class="evento-icon">
                  @switch (partido.eventos[partido.eventos.length - 1].tipo) {
                    @case ('gol') { ⚽ }
                    @case ('tarjeta_amarilla') { 🟨 }
                    @case ('tarjeta_roja') { 🟥 }
                  }
                </span>
                <span class="evento-texto">
                  {{ partido.eventos[partido.eventos.length - 1].jugadorNombre }} 
                  ({{ partido.eventos[partido.eventos.length - 1].minuto }}')
                </span>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <p>No hay partidos en vivo en este momento</p>
          </div>
        }
      </section>

      <!-- Próximos Partidos -->
      <section class="section">
        <h2 class="section-title">PRÓXIMOS PARTIDOS</h2>
        
        <div class="partidos-grid">
          @for (partido of proximosPartidos(); track partido.id) {
            <div class="partido-card">
              <div class="partido-fecha">
                {{ formatFecha(partido.fechaHora) }}
              </div>
              
              <div class="partido-equipos">
                <div class="equipo-row">
                  <img [src]="partido.equipoLocal.escudo" [alt]="partido.equipoLocal.nombre" class="escudo-small">
                  <span class="nombre-small">{{ partido.equipoLocal.nombre }}</span>
                </div>
                <div class="vs">VS</div>
                <div class="equipo-row">
                  <img [src]="partido.equipoVisita.escudo" [alt]="partido.equipoVisita.nombre" class="escudo-small">
                  <span class="nombre-small">{{ partido.equipoVisita.nombre }}</span>
                </div>
              </div>
              
              <div class="partido-info">
                <span class="estadio">📍 {{ partido.estadio }}</span>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>No hay próximos partidos programados</p>
            </div>
          }
        </div>
      </section>

      <!-- Estadísticas Rápidas -->
      <section class="section">
        <h2 class="section-title">ESTADÍSTICAS</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats().partidosHoy }}</div>
            <div class="stat-label">Partidos Hoy</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ stats().golesHoy }}</div>
            <div class="stat-label">Goles Hoy</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ stats().tarjetasHoy }}</div>
            <div class="stat-label">Tarjetas Hoy</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ stats().proximaSemana }}</div>
            <div class="stat-label">Próxima Semana</div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
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

    .section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      color: white;
      letter-spacing: 2px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .live-indicator {
      width: 12px;
      height: 12px;
      background: #FF2D55;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .partido-live-card {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.05));
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      padding: 2rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .partido-live-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 212, 255, 0.2);
      border-color: #00D4FF;
    }

    .partido-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .badge-live {
      background: #FF2D55;
      color: white;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .minuto {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: #FFD60A;
    }

    .partido-content {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 2rem;
    }

    .equipo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
    }

    .escudo {
      width: 80px;
      height: 80px;
      object-fit: contain;
    }

    .nombre {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem;
      color: white;
      text-align: center;
    }

    .marcador {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .goles {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 4rem;
      color: #00D4FF;
      line-height: 1;
    }

    .separador {
      font-size: 2rem;
      color: rgba(255, 255, 255, 0.3);
    }

    .ultimo-evento {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 0.8rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .evento-icon {
      font-size: 1.5rem;
    }

    .partidos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .partido-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1.5rem;
      transition: all 0.3s;
    }

    .partido-card:hover {
      border-color: rgba(0, 212, 255, 0.5);
      transform: translateY(-2px);
    }

    .partido-fecha {
      color: #FFD60A;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .partido-equipos {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-bottom: 1rem;
    }

    .equipo-row {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .escudo-small {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .nombre-small {
      color: white;
      font-weight: 500;
    }

    .vs {
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
      font-weight: 700;
    }

    .partido-info {
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .estadio {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
    }

    .stat-value {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 3rem;
      color: #00D4FF;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
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

      .partido-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .marcador {
        order: -1;
        justify-content: center;
      }

      .goles {
        font-size: 3rem;
      }

      .partidos-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  partidosService = inject(PartidosService);
  
  proximosPartidos = signal<any[]>([]);
  stats = signal({
    partidosHoy: 0,
    golesHoy: 0,
    tarjetasHoy: 0,
    proximaSemana: 0
  });

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    // Cargar partido en vivo
    this.partidosService.cargarEnVivo();
    
    // Cargar próximos partidos
    this.partidosService.cargarProximos(7);
    this.proximosPartidos.set(this.partidosService.proximosPartidos().slice(0, 6));
    
    // Calcular estadísticas (mock por ahora)
    this.stats.set({
      partidosHoy: 3,
      golesHoy: 12,
      tarjetasHoy: 8,
      proximaSemana: this.partidosService.proximosPartidos().length
    });
  }

  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', opciones);
  }
}
