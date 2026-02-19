import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PartidosService } from '../../core/services/partidos.service';

@Component({
  selector: 'app-marcador-publico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="marcador-publico" [class.fullscreen]="isFullscreen">
      @if (partidosService.partidoActual(); as partido) {
        <!-- Botón Fullscreen -->
        <button class="btn-fullscreen" (click)="toggleFullscreen()" title="Pantalla completa">
          {{ isFullscreen ? '✕' : '⛶' }}
        </button>

        <!-- Marcador Principal -->
        <div class="marcador-container">
          <div class="equipo-local">
            <img [src]="partido.equipoLocal.escudoUrl" [alt]="partido.equipoLocal.nombre" class="escudo-gigante">
            <h1 class="equipo-nombre">{{ partido.equipoLocal.nombre }}</h1>
            <div class="goles-gigante">{{ partido.golesLocal }}</div>
          </div>

          <div class="centro">
            @if (partido.estado === 'en_curso') {
              <div class="badge-live-grande">EN VIVO</div>
              <div class="cronometro">{{ partido.minutoActual }}'</div>
            } @else if (partido.estado === 'finalizado') {
              <div class="badge-finalizado-grande">FINAL</div>
            }
            <div class="separador-grande">-</div>
          </div>

          <div class="equipo-visita">
            <img [src]="partido.equipoVisita.escudoUrl" [alt]="partido.equipoVisita.nombre" class="escudo-gigante">
            <h1 class="equipo-nombre">{{ partido.equipoVisita.nombre }}</h1>
            <div class="goles-gigante">{{ partido.golesVisita }}</div>
          </div>
        </div>

        <!-- Notificación de Evento -->
        @if (ultimoEvento()) {
          <div class="notificacion-evento" [@slideIn]>
            <div class="evento-icon-grande">
              @switch (ultimoEvento()!.tipo) {
                @case ('gol') { ⚽ }
                @case ('tarjeta_amarilla') { 🟨 }
                @case ('tarjeta_roja') { 🟥 }
              }
            </div>
            <div class="evento-texto-grande">
              <div class="evento-tipo-grande">{{ getTipoEvento(ultimoEvento()!.tipo) }}</div>
              <div class="evento-jugador-grande">{{ ultimoEvento()!.jugadorNombre }}</div>
              <div class="evento-minuto-grande">{{ ultimoEvento()!.minuto }}'</div>
            </div>
          </div>
        }
      } @else {
        <div class="loading-publico">
          <div class="spinner-grande"></div>
          <p>Cargando marcador...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .marcador-publico {
      min-height: 100vh;
      background: linear-gradient(135deg, #06090F 0%, #0A1628 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .marcador-publico::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 4px,
          rgba(0, 212, 255, 0.02) 4px,
          rgba(0, 212, 255, 0.02) 8px
        );
      pointer-events: none;
    }

    .marcador-publico.fullscreen {
      padding: 0;
    }

    .btn-fullscreen {
      position: absolute;
      top: 2rem;
      right: 2rem;
      width: 60px;
      height: 60px;
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid rgba(0, 212, 255, 0.5);
      border-radius: 50%;
      color: #00D4FF;
      font-size: 1.8rem;
      cursor: pointer;
      transition: all 0.3s;
      z-index: 100;
    }

    .btn-fullscreen:hover {
      background: rgba(0, 212, 255, 0.2);
      transform: scale(1.1);
    }

    .marcador-container {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 4rem;
      max-width: 1600px;
      width: 100%;
      position: relative;
      z-index: 1;
    }

    .equipo-local,
    .equipo-visita {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }

    .escudo-gigante {
      width: 200px;
      height: 200px;
      object-fit: contain;
      filter: drop-shadow(0 8px 24px rgba(0, 212, 255, 0.3));
    }

    .equipo-nombre {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 3.5rem;
      color: white;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin: 0;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    .goles-gigante {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 12rem;
      color: #00D4FF;
      line-height: 1;
      text-shadow: 0 8px 32px rgba(0, 212, 255, 0.5);
    }

    .centro {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .badge-live-grande {
      background: #FF2D55;
      color: white;
      padding: 1rem 3rem;
      border-radius: 40px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      letter-spacing: 3px;
      animation: pulse 2s infinite;
      box-shadow: 0 8px 24px rgba(255, 45, 85, 0.5);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }

    .badge-finalizado-grande {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 1rem 3rem;
      border-radius: 40px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      letter-spacing: 3px;
    }

    .cronometro {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 6rem;
      color: #FFD60A;
      text-shadow: 0 4px 16px rgba(255, 214, 10, 0.5);
    }

    .separador-grande {
      font-size: 4rem;
      color: rgba(255, 255, 255, 0.3);
    }

    .notificacion-evento {
      position: fixed;
      bottom: 4rem;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.95), rgba(0, 153, 204, 0.95));
      backdrop-filter: blur(20px);
      border: 2px solid #00D4FF;
      border-radius: 20px;
      padding: 2rem 4rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      box-shadow: 0 12px 48px rgba(0, 212, 255, 0.5);
      animation: slideIn 0.5s ease-out;
      z-index: 50;
    }

    @keyframes slideIn {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }

    .evento-icon-grande {
      font-size: 5rem;
    }

    .evento-texto-grande {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .evento-tipo-grande {
      font-size: 1.2rem;
      color: rgba(0, 0, 0, 0.7);
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 700;
    }

    .evento-jugador-grande {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 3rem;
      color: #000;
      line-height: 1;
    }

    .evento-minuto-grande {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: rgba(0, 0, 0, 0.7);
    }

    .loading-publico {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }

    .spinner-grande {
      width: 80px;
      height: 80px;
      border: 6px solid rgba(0, 212, 255, 0.2);
      border-top-color: #00D4FF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-publico p {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      color: rgba(255, 255, 255, 0.6);
    }

    @media (max-width: 1200px) {
      .marcador-container {
        grid-template-columns: 1fr;
        gap: 3rem;
      }

      .centro {
        order: -1;
      }

      .goles-gigante {
        font-size: 8rem;
      }

      .equipo-nombre {
        font-size: 2.5rem;
      }

      .escudo-gigante {
        width: 150px;
        height: 150px;
      }
    }
  `]
})
export class MarcadorPublicoComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  partidosService = inject(PartidosService);
  
  partidoId = '';
  isFullscreen = false;
  ultimoEvento = signal<any>(null);
  private eventoTimeout?: number;

  ngOnInit() {
    this.partidoId = this.route.snapshot.params['id'];
    this.partidosService.conectarLive(this.partidoId);
    
    // Observar eventos para mostrar notificaciones
    this.observarEventos();
  }

  ngOnDestroy() {
    this.partidosService.desconectarLive(this.partidoId);
    if (this.eventoTimeout) {
      clearTimeout(this.eventoTimeout);
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  private observarEventos() {
    // Simular observación de eventos (en producción usar effect o subscription)
    setInterval(() => {
      const partido = this.partidosService.partidoActual();
      if (partido && partido.eventos.length > 0) {
        const ultimo = partido.eventos[partido.eventos.length - 1];
        if (ultimo.id !== this.ultimoEvento()?.id) {
          this.mostrarNotificacionEvento(ultimo);
        }
      }
    }, 1000);
  }

  private mostrarNotificacionEvento(evento: any) {
    this.ultimoEvento.set(evento);
    
    // Ocultar después de 8 segundos
    if (this.eventoTimeout) {
      clearTimeout(this.eventoTimeout);
    }
    this.eventoTimeout = window.setTimeout(() => {
      this.ultimoEvento.set(null);
    }, 8000);
  }

  getTipoEvento(tipo: string): string {
    const tipos: Record<string, string> = {
      'gol': '¡GOOOL!',
      'tarjeta_amarilla': 'TARJETA AMARILLA',
      'tarjeta_roja': 'TARJETA ROJA'
    };
    return tipos[tipo] || tipo;
  }
}
