import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PartidosService } from '../../core/services/partidos.service';
import { AuthService } from '../../core/services/auth.service';
import { ConnectivityService } from '../../core/services/connectivity.service';
import { OfflineSyncService } from '../../core/services/offline-sync.service';
import { IndexedDBService } from '../../core/services/indexed-db.service';
import { PartidoDetalle, EventoPartido, Jugador, TipoEvento } from '../../core/models';

interface EventoRapido {
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'sustitucion';
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-planillero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="planillero-container">
      <!-- Connectivity Status Bar -->
      <div class="connectivity-bar" [class.offline]="connectivity.isOffline()" [class.online]="connectivity.isOnline()">
        <span class="status-icon">{{ connectivity.getStatusIcon() }}</span>
        <span class="status-text">{{ connectivity.getStatusText() }}</span>
        
        @if (offlineSync.pendingEventsCount() > 0) {
          <span class="pending-badge">
            {{ offlineSync.pendingEventsCount() }} eventos pendientes
          </span>
        }
        
        @if (offlineSync.isSyncing()) {
          <span class="syncing-indicator">
            <span class="spinner-small"></span> Sincronizando...
          </span>
        }
        
        @if (connectivity.isOnline() && offlineSync.pendingEventsCount() > 0 && !offlineSync.isSyncing()) {
          <button class="btn-sync-manual" (click)="sincronizarManual()">
            🔄 Sincronizar Ahora
          </button>
        }
      </div>

      @if (loading()) {
        <div class="loading-screen">
          <div class="spinner"></div>
          <p>Cargando partido...</p>
        </div>
      } @else if (error()) {
        <div class="error-screen">
          <h2>⚠️ Error</h2>
          <p>{{ error() }}</p>
          <button class="btn-volver" (click)="volver()">Volver</button>
        </div>
      } @else if (partido()) {
        <!-- Marcador Superior -->
        <div class="marcador-header">
          <div class="equipo-info">
            <img [src]="partido()!.equipoLocal.escudoUrl" [alt]="partido()!.equipoLocal.nombre">
            <span class="nombre-equipo">{{ partido()!.equipoLocal.nombre }}</span>
            <span class="goles-grande">{{ partido()!.golesLocal }}</span>
          </div>
          
          <div class="cronometro">
            <div class="minuto-display">{{ minutoActual() }}'</div>
            <div class="estado-badge" [class]="'estado-' + partido()!.estado">
              {{ estadoTexto() }}
            </div>
            <div class="controles-tiempo">
              @if (partido()!.estado === 'programado') {
                <button class="btn-tiempo btn-iniciar" (click)="iniciarPartido()">
                  ▶ INICIAR PARTIDO
                </button>
              } @else if (partido()!.estado === 'en_curso') {
                <button class="btn-tiempo" (click)="pausarCronometro()" [disabled]="!cronometroActivo()">
                  ⏸ PAUSAR
                </button>
                <button class="btn-tiempo" (click)="reanudarCronometro()" [disabled]="cronometroActivo()">
                  ▶ REANUDAR
                </button>
                <button class="btn-tiempo btn-medio-tiempo" (click)="marcarMedioTiempo()">
                  ⏱ MEDIO TIEMPO
                </button>
              }
            </div>
          </div>

          <div class="equipo-info">
            <span class="goles-grande">{{ partido()!.golesVisita }}</span>
            <span class="nombre-equipo">{{ partido()!.equipoVisita.nombre }}</span>
            <img [src]="partido()!.equipoVisita.escudoUrl" [alt]="partido()!.equipoVisita.nombre">
          </div>
        </div>

        @if (partido()!.estado === 'en_curso' || partido()!.estado === 'medio_tiempo') {
          <!-- Selector de Equipo -->
          <div class="selector-equipo">
            <button 
              class="btn-equipo"
              [class.activo]="equipoSeleccionado() === 'local'"
              (click)="seleccionarEquipo('local')">
              {{ partido()!.equipoLocal.nombre }}
            </button>
            <button 
              class="btn-equipo"
              [class.activo]="equipoSeleccionado() === 'visita'"
              (click)="seleccionarEquipo('visita')">
              {{ partido()!.equipoVisita.nombre }}
            </button>
          </div>

          <!-- Botones de Eventos Rápidos -->
          <div class="eventos-rapidos">
            @for (evento of eventosRapidos; track evento.tipo) {
              <button 
                class="btn-evento-rapido"
                [style.background]="evento.color"
                (click)="seleccionarTipoEvento(evento.tipo)">
                <span class="icono-evento">{{ evento.icon }}</span>
                <span class="label-evento">{{ evento.label }}</span>
              </button>
            }
          </div>

          <!-- Lista de Jugadores -->
          @if (tipoEventoSeleccionado()) {
            <div class="lista-jugadores">
              <h3>SELECCIONAR JUGADOR - {{ tipoEventoSeleccionado()?.toUpperCase() }}</h3>
              <div class="jugadores-grid">
                @for (jugador of jugadoresEquipoSeleccionado(); track jugador.id) {
                  <button 
                    class="btn-jugador"
                    (click)="registrarEvento(jugador)">
                    <span class="numero">{{ jugador.numeroCamiseta }}</span>
                    <span class="nombre">{{ jugador.nombre }} {{ jugador.apellido }}</span>
                  </button>
                }
              </div>
              <button class="btn-cancelar" (click)="cancelarSeleccion()">
                ✕ CANCELAR
              </button>
            </div>
          }

          <!-- Botón Finalizar Partido -->
          <div class="acciones-partido">
            <button class="btn-finalizar" (click)="mostrarConfirmacionFinalizar()">
              🏁 FINALIZAR PARTIDO
            </button>
          </div>
        }

        <!-- Timeline de Eventos -->
        <div class="timeline-eventos">
          <h3>EVENTOS REGISTRADOS ({{ eventos().length }})</h3>
          <div class="eventos-lista" #eventosLista>
            @for (evento of eventos(); track $index) {
              <div class="evento-item" [class]="'evento-' + evento.tipo">
                <span class="minuto">{{ evento.minuto }}'</span>
                <span class="icono">{{ getIconoEvento(evento.tipo) }}</span>
                <span class="tipo">{{ getTipoTexto(evento.tipo) }}</span>
                <span class="jugador">{{ evento.jugadorNombre }}</span>
                <span class="equipo">{{ evento.equipoNombre }}</span>
              </div>
            }
            @if (eventos().length === 0) {
              <p class="sin-eventos">No hay eventos registrados aún</p>
            }
          </div>
        </div>

        <!-- Modal de Confirmación Finalizar -->
        @if (mostrarModalFinalizar()) {
          <div class="modal-overlay" (click)="cerrarModalFinalizar()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h2>⚠️ Confirmar Finalización</h2>
              <p>¿Estás seguro de que deseas finalizar el partido?</p>
              <p class="marcador-final">
                {{ partido()!.equipoLocal.nombre }} {{ partido()!.golesLocal }} - 
                {{ partido()!.golesVisita }} {{ partido()!.equipoVisita.nombre }}
              </p>
              <div class="modal-acciones">
                <button class="btn-cancelar-modal" (click)="cerrarModalFinalizar()">
                  Cancelar
                </button>
                <button class="btn-confirmar-modal" (click)="confirmarFinalizacion()">
                  Sí, Finalizar
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Modal de Confirmación Final -->
        @if (mostrarModalConfirmacionFinal()) {
          <div class="modal-overlay">
            <div class="modal-content">
              <h2>✅ Última Confirmación</h2>
              <p class="texto-importante">Esta acción NO se puede deshacer</p>
              <p class="marcador-final-grande">
                {{ partido()!.equipoLocal.nombre }}<br>
                <span class="goles-modal">{{ partido()!.golesLocal }}</span>
                <span class="vs">VS</span>
                <span class="goles-modal">{{ partido()!.golesVisita }}</span><br>
                {{ partido()!.equipoVisita.nombre }}
              </p>
              <div class="modal-acciones">
                <button class="btn-cancelar-modal" (click)="cerrarModalConfirmacionFinal()">
                  Cancelar
                </button>
                <button class="btn-confirmar-modal-final" (click)="finalizarPartido()">
                  FINALIZAR DEFINITIVAMENTE
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Notificación de Éxito -->
        @if (mostrarNotificacion()) {
          <div class="notificacion-exito">
            ✓ {{ mensajeNotificacion() }}
          </div>
        }
      }
    </div>
  `,
  styleUrls: ['./planillero.component.scss']
})
export class PlanilleroComponent implements OnInit, OnDestroy {
  // Signals
  partido = signal<PartidoDetalle | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  minutoActual = signal(0);
  cronometroActivo = signal(false);
  equipoSeleccionado = signal<'local' | 'visita'>('local');
  tipoEventoSeleccionado = signal<string | null>(null);
  eventos = signal<EventoPartido[]>([]);
  mostrarModalFinalizar = signal(false);
  mostrarModalConfirmacionFinal = signal(false);
  mostrarNotificacion = signal(false);
  mensajeNotificacion = signal('');

  // Computed
  jugadoresEquipoSeleccionado = computed(() => {
    const p = this.partido();
    if (!p) return [];
    return this.equipoSeleccionado() === 'local' 
      ? p.equipoLocal.jugadores || []
      : p.equipoVisita.jugadores || [];
  });

  estadoTexto = computed(() => {
    const estado = this.partido()?.estado;
    const textos: Record<string, string> = {
      'programado': 'PROGRAMADO',
      'en_curso': '🔴 EN VIVO',
      'medio_tiempo': 'MEDIO TIEMPO',
      'finalizado': 'FINALIZADO'
    };
    return textos[estado || ''] || estado;
  });

  eventosRapidos: EventoRapido[] = [
    { tipo: 'gol', label: 'GOL', icon: '⚽', color: 'linear-gradient(135deg, #34C759, #30D158)' },
    { tipo: 'tarjeta_amarilla', label: 'AMARILLA', icon: '🟨', color: 'linear-gradient(135deg, #FFD60A, #FFCC00)' },
    { tipo: 'tarjeta_roja', label: 'ROJA', icon: '🟥', color: 'linear-gradient(135deg, #FF2D55, #FF3B30)' },
    { tipo: 'sustitucion', label: 'CAMBIO', icon: '🔄', color: 'linear-gradient(135deg, #00D4FF, #0A84FF)' }
  ];

  private cronometroInterval?: number;
  private sincronizacionInterval?: number;
  private partidoId?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partidosService: PartidosService,
    private authService: AuthService,
    public connectivity: ConnectivityService,
    public offlineSync: OfflineSyncService,
    private indexedDB: IndexedDBService
  ) {}

  ngOnInit() {
    this.partidoId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.partidoId) {
      this.cargarPartido(this.partidoId);
    } else {
      this.cargarPartidoAsignado();
    }

    // Setup auto-sync when connection is restored
    this.connectivity.onConnectionRestored(() => {
      if (this.partidoId) {
        this.offlineSync.syncQueuedEvents(this.partidoId);
      }
    });
  }

  ngOnDestroy() {
    this.detenerCronometro();
    this.detenerSincronizacion();
  }

  async cargarPartido(id: string) {
    try {
      this.loading.set(true);
      const data = await this.partidosService.getPartidoDetalleOfflineAware(id);
      this.partido.set(data);
      this.eventos.set(data.eventos || []);
      this.minutoActual.set(data.minutoActual || 0);
      
      if (data.estado === 'en_curso') {
        this.iniciarCronometro();
      }
      
      this.error.set(null);
    } catch (err: any) {
      this.error.set(err.message || 'Error al cargar el partido');
    } finally {
      this.loading.set(false);
    }
  }

  async cargarPartidoAsignado() {
    try {
      this.loading.set(true);
      const userId = this.authService.currentUser()?.id;
      if (!userId) {
        this.error.set('No estás autenticado');
        return;
      }

      // Obtener partido asignado al planillero
      const partidos = await this.partidosService.getPartidosPlanillero(userId);
      if (partidos.length === 0) {
        this.error.set('No tienes partidos asignados hoy');
        return;
      }

      const partido = partidos[0];
      this.partidoId = partido.id;
      await this.cargarPartido(partido.id);
    } catch (err: any) {
      this.error.set(err.message || 'Error al cargar partido asignado');
    } finally {
      this.loading.set(false);
    }
  }

  async iniciarPartido() {
    if (!this.partidoId) return;
    
    try {
      await this.partidosService.iniciarPartido(this.partidoId);
      await this.cargarPartido(this.partidoId);
      this.iniciarCronometro();
      this.mostrarMensaje('Partido iniciado');
    } catch (err: any) {
      alert('Error al iniciar partido: ' + err.message);
    }
  }

  iniciarCronometro() {
    this.cronometroActivo.set(true);
    
    // Incrementar cada minuto (60 segundos)
    this.cronometroInterval = window.setInterval(() => {
      this.minutoActual.update(m => m + 1);
    }, 60000);

    // Sincronizar con backend cada 30 segundos
    this.sincronizacionInterval = window.setInterval(() => {
      this.sincronizarMinuto();
    }, 30000);
  }

  pausarCronometro() {
    this.cronometroActivo.set(false);
    this.detenerCronometro();
  }

  reanudarCronometro() {
    this.iniciarCronometro();
  }

  detenerCronometro() {
    if (this.cronometroInterval) {
      clearInterval(this.cronometroInterval);
      this.cronometroInterval = undefined;
    }
  }

  detenerSincronizacion() {
    if (this.sincronizacionInterval) {
      clearInterval(this.sincronizacionInterval);
      this.sincronizacionInterval = undefined;
    }
  }

  async sincronizarMinuto() {
    if (!this.partidoId) return;
    
    try {
      await this.partidosService.actualizarMinuto(this.partidoId, this.minutoActual());
    } catch (err) {
      console.error('Error al sincronizar minuto:', err);
    }
  }

  async marcarMedioTiempo() {
    if (!this.partidoId) return;
    
    if (confirm('¿Marcar medio tiempo?')) {
      try {
        await this.partidosService.marcarMedioTiempo(this.partidoId);
        this.pausarCronometro();
        this.minutoActual.set(45);
        await this.cargarPartido(this.partidoId);
        this.mostrarMensaje('Medio tiempo marcado');
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    }
  }

  seleccionarEquipo(equipo: 'local' | 'visita') {
    this.equipoSeleccionado.set(equipo);
    this.tipoEventoSeleccionado.set(null);
  }

  seleccionarTipoEvento(tipo: string) {
    this.tipoEventoSeleccionado.set(tipo);
  }

  cancelarSeleccion() {
    this.tipoEventoSeleccionado.set(null);
  }

  async registrarEvento(jugador: Jugador) {
    if (!this.partidoId || !this.tipoEventoSeleccionado()) return;

    const equipoId = this.equipoSeleccionado() === 'local' 
      ? this.partido()!.equipoLocal.id
      : this.partido()!.equipoVisita.id;

    const evento = {
      tipo: this.tipoEventoSeleccionado()!,
      minuto: this.minutoActual(),
      jugadorId: jugador.id,
      equipoId: equipoId
    };

    try {
      if (this.connectivity.isOffline()) {
        // Queue event for later sync
        await this.offlineSync.queueEvent(this.partidoId, evento);
        
        // Update local state optimistically
        const nuevoEvento: EventoPartido = {
          id: `temp-${Date.now()}`,
          partidoId: this.partidoId,
          minuto: evento.minuto,
          tipo: evento.tipo as TipoEvento,
          jugadorId: evento.jugadorId,
          equipoId: evento.equipoId,
          jugadorNombre: `${jugador.nombre} ${jugador.apellido}`,
          equipoNombre: this.equipoSeleccionado() === 'local' 
            ? this.partido()!.equipoLocal.nombre
            : this.partido()!.equipoVisita.nombre,
          createdAt: new Date().toISOString()
        };
        
        this.eventos.update(evs => [...evs, nuevoEvento]);
        
        // Update score if it's a goal
        if (evento.tipo === 'gol') {
          if (this.equipoSeleccionado() === 'local') {
            this.partido.update(p => p ? { ...p, golesLocal: p.golesLocal + 1 } : null);
          } else {
            this.partido.update(p => p ? { ...p, golesVisita: p.golesVisita + 1 } : null);
          }
        }
        
        this.mostrarMensaje(`${this.getTipoTexto(evento.tipo)} registrada (sin conexión)`);
      } else {
        // Online - send immediately
        await this.partidosService.registrarEvento(this.partidoId, evento);
        await this.cargarPartido(this.partidoId);
        this.mostrarMensaje(`${this.getTipoTexto(evento.tipo)} registrada`);
      }
      
      this.tipoEventoSeleccionado.set(null);
    } catch (err: any) {
      alert('Error al registrar evento: ' + err.message);
    }
  }

  mostrarConfirmacionFinalizar() {
    this.mostrarModalFinalizar.set(true);
  }

  cerrarModalFinalizar() {
    this.mostrarModalFinalizar.set(false);
  }

  confirmarFinalizacion() {
    this.mostrarModalFinalizar.set(false);
    this.mostrarModalConfirmacionFinal.set(true);
  }

  cerrarModalConfirmacionFinal() {
    this.mostrarModalConfirmacionFinal.set(false);
  }

  async finalizarPartido() {
    if (!this.partidoId) return;

    try {
      await this.partidosService.finalizarPartido(this.partidoId);
      this.detenerCronometro();
      this.detenerSincronizacion();
      this.mostrarModalConfirmacionFinal.set(false);
      
      alert('Partido finalizado exitosamente');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      alert('Error al finalizar partido: ' + err.message);
    }
  }

  mostrarMensaje(mensaje: string) {
    this.mensajeNotificacion.set(mensaje);
    this.mostrarNotificacion.set(true);
    setTimeout(() => {
      this.mostrarNotificacion.set(false);
    }, 3000);
  }

  getIconoEvento(tipo: string): string {
    const iconos: Record<string, string> = {
      'gol': '⚽',
      'tarjeta_amarilla': '🟨',
      'tarjeta_roja': '🟥',
      'sustitucion': '🔄',
      'inicio_partido': '▶',
      'medio_tiempo': '⏱',
      'fin_partido': '🏁'
    };
    return iconos[tipo] || '•';
  }

  getTipoTexto(tipo: string): string {
    const textos: Record<string, string> = {
      'gol': 'GOL',
      'tarjeta_amarilla': 'Tarjeta Amarilla',
      'tarjeta_roja': 'Tarjeta Roja',
      'sustitucion': 'Sustitución',
      'inicio_partido': 'Inicio',
      'medio_tiempo': 'Medio Tiempo',
      'fin_partido': 'Final'
    };
    return textos[tipo] || tipo;
  }

  async sincronizarManual() {
    if (!this.partidoId) return;
    
    try {
      await this.offlineSync.manualSync(this.partidoId);
      this.mostrarMensaje('Sincronización completada');
      
      // Reload match data after sync
      await this.cargarPartido(this.partidoId);
    } catch (error) {
      console.error('Error en sincronización manual:', error);
      this.mostrarMensaje('Error al sincronizar');
    }
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}
