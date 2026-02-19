import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PartidosService } from '../../core/services/partidos.service';

@Component({
  selector: 'app-partido-live',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="partido-live-container">
      @if (partidosService.partidoActual(); as partido) {
        <!-- Header con marcador -->
        <div class="partido-header">
          <div class="equipo-section">
            <img [src]="partido.equipoLocal.escudoUrl" [alt]="partido.equipoLocal.nombre" class="escudo-grande">
            <h2 class="equipo-nombre">{{ partido.equipoLocal.nombre }}</h2>
          </div>

          <div class="marcador-section">
            <div class="marcador">
              <span class="goles">{{ partido.golesLocal }}</span>
              <span class="separador">-</span>
              <span class="goles">{{ partido.golesVisita }}</span>
            </div>
            <div class="estado">
              @if (partido.estado === 'en_curso') {
                <span class="badge-live">EN VIVO</span>
                <span class="minuto">{{ partido.minutoActual }}'</span>
              } @else if (partido.estado === 'finalizado') {
                <span class="badge-finalizado">FINALIZADO</span>
              }
            </div>
          </div>

          <div class="equipo-section">
            <img [src]="partido.equipoVisita.escudoUrl" [alt]="partido.equipoVisita.nombre" class="escudo-grande">
            <h2 class="equipo-nombre">{{ partido.equipoVisita.nombre }}</h2>
          </div>
        </div>

        <!-- Timeline de eventos -->
        <div class="timeline-section">
          <h3 class="section-title">EVENTOS DEL PARTIDO</h3>
          
          <div class="timeline">
            @for (evento of partido.eventos; track evento.id) {
              <div class="evento-item" [class.evento-gol]="evento.tipo === 'gol'" 
                   [class.evento-tarjeta]="evento.tipo.includes('tarjeta')">
                <div class="evento-minuto">{{ evento.minuto }}'</div>
                
                <div class="evento-icon">
                  @switch (evento.tipo) {
                    @case ('gol') { ⚽ }
                    @case ('tarjeta_amarilla') { 🟨 }
                    @case ('tarjeta_roja') { 🟥 }
                    @case ('sustitucion') { 🔄 }
                    @default { • }
                  }
                </div>
                
                <div class="evento-detalles">
                  <div class="evento-tipo">{{ getTipoEvento(evento.tipo) }}</div>
                  <div class="evento-jugador">{{ evento.jugadorNombre }}</div>
                  @if (evento.asistenteNombre) {
                    <div class="evento-asistencia">Asistencia: {{ evento.asistenteNombre }}</div>
                  }
                </div>
                
                <div class="evento-equipo">{{ evento.equipoNombre }}</div>
              </div>
            } @empty {
              <div class="empty-timeline">
                <p>No hay eventos registrados aún</p>
              </div>
            }
          </div>
        </div>

        <!-- Botón marcador público -->
        <div class="acciones">
          <a [routerLink]="['/partidos', partido.id, 'marcador']" class="btn-marcador-publico">
            📺 Ver Marcador Público
          </a>
        </div>
      } @else {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando partido...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .partido-live-container {
      animation: fadeIn 0.5s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .partido-header {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.05));
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 16px;
      padding: 3rem;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 3rem;
      margin-bottom: 2rem;
    }

    .equipo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .escudo-grande {
      width: 120px;
      height: 120px;
      object-fit: contain;
    }

    .equipo-nombre {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: white;
      text-align: center;
      margin: 0;
    }

    .marcador-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .marcador {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .goles {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 5rem;
      color: #00D4FF;
      line-height: 1;
    }

    .separador {
      font-size: 3rem;
      color: rgba(255, 255, 255, 0.3);
    }

    .estado {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .badge-live {
      background: #FF2D55;
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 24px;
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 1px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .badge-finalizado {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 24px;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .minuto {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.5rem;
      color: #FFD60A;
    }

    .timeline-section {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .section-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      color: #00D4FF;
      letter-spacing: 2px;
      margin-bottom: 1.5rem;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .evento-item {
      display: grid;
      grid-template-columns: 60px 40px 1fr auto;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.3);
      border-left: 3px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      transition: all 0.3s;
    }

    .evento-item:hover {
      background: rgba(0, 0, 0, 0.5);
    }

    .evento-item.evento-gol {
      border-left-color: #00D4FF;
      background: rgba(0, 212, 255, 0.05);
    }

    .evento-item.evento-tarjeta {
      border-left-color: #FF2D55;
      background: rgba(255, 45, 85, 0.05);
    }

    .evento-minuto {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem;
      color: #FFD60A;
      text-align: center;
    }

    .evento-icon {
      font-size: 1.8rem;
      text-align: center;
    }

    .evento-detalles {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .evento-tipo {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .evento-jugador {
      font-size: 1.1rem;
      font-weight: 700;
      color: white;
    }

    .evento-asistencia {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .evento-equipo {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }

    .empty-timeline {
      text-align: center;
      padding: 3rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .acciones {
      display: flex;
      justify-content: center;
    }

    .btn-marcador-publico {
      background: linear-gradient(135deg, #FFD60A, #FFA500);
      color: #000;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 0.8rem;
    }

    .btn-marcador-publico:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 214, 10, 0.3);
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

    @media (max-width: 768px) {
      .partido-header {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 2rem;
      }

      .marcador-section {
        order: -1;
      }

      .goles {
        font-size: 4rem;
      }

      .evento-item {
        grid-template-columns: 50px 30px 1fr;
        gap: 0.8rem;
      }

      .evento-equipo {
        grid-column: 1 / -1;
        padding-top: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
  `]
})
export class PartidoLiveComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  partidosService = inject(PartidosService);
  
  partidoId = '';

  ngOnInit() {
    this.partidoId = this.route.snapshot.params['id'];
    this.partidosService.conectarLive(this.partidoId);
  }

  ngOnDestroy() {
    this.partidosService.desconectarLive(this.partidoId);
  }

  getTipoEvento(tipo: string): string {
    const tipos: Record<string, string> = {
      'gol': 'Gol',
      'tarjeta_amarilla': 'Tarjeta Amarilla',
      'tarjeta_roja': 'Tarjeta Roja',
      'sustitucion': 'Sustitución',
      'penal': 'Penal',
      'autogol': 'Autogol'
    };
    return tipos[tipo] || tipo;
  }
}
