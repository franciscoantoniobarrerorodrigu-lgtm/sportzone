import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { SignalRService } from './signalr.service';
import { IndexedDBService } from './indexed-db.service';
import { ConnectivityService } from './connectivity.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Partido, PartidoDetalle, PartidoEnVivo } from '../models/partido.model';

@Injectable({
  providedIn: 'root'
})
export class PartidosService {
  partidosEnVivo = signal<PartidoEnVivo[]>([]);
  partidoActual = signal<PartidoDetalle | null>(null);
  proximosPartidos = signal<Partido[]>([]);
  
  // Computed signal for first partido en vivo (for dashboard compatibility)
  partidoEnVivo = computed(() => {
    const partidos = this.partidosEnVivo();
    return partidos.length > 0 ? partidos[0] : null;
  });

  constructor(
    private api: ApiService,
    private signalR: SignalRService,
    private indexedDB: IndexedDBService,
    private connectivity: ConnectivityService
  ) {}

  async inicializarSignalR(): Promise<void> {
    await this.signalR.startConnection('partido');

    // Escuchar eventos de SignalR
    this.signalR.on('NuevoEvento', (data: any) => {
      console.log('Nuevo evento:', data);
      this.actualizarPartidoLocal(data.partidoId);
    });

    this.signalR.on('MarcadorActualizado', (data: any) => {
      console.log('Marcador actualizado:', data);
      this.actualizarMarcadorLocal(data.partidoId, data.golesLocal, data.golesVisita);
    });

    this.signalR.on('MinutoActualizado', (data: any) => {
      console.log('Minuto actualizado:', data);
      this.actualizarMinutoLocal(data.partidoId, data.minuto);
    });

    this.signalR.on('PartidoIniciado', (data: any) => {
      console.log('Partido iniciado:', data);
      this.getPartidosEnVivo().subscribe();
    });

    this.signalR.on('PartidoFinalizado', (data: any) => {
      console.log('Partido finalizado:', data);
      this.getPartidosEnVivo().subscribe();
    });
  }

  getPartidosEnVivo(): Observable<any> {
    return this.api.get('partidos/en-vivo').pipe(
      tap((response: any) => {
        if (response.success) {
          this.partidosEnVivo.set(response.data);
        }
      })
    );
  }

  getPartidoDetalle(id: string): Observable<any> {
    return this.api.get(`partidos/${id}`).pipe(
      tap((response: any) => {
        if (response.success) {
          this.partidoActual.set(response.data);
        }
      })
    );
  }

  getProximosPartidos(dias: number = 14, torneoId?: string): Observable<any> {
    const params = torneoId ? `?dias=${dias}&torneoId=${torneoId}` : `?dias=${dias}`;
    return this.api.get(`partidos/proximos${params}`);
  }

  async suscribirPartido(partidoId: string): Promise<void> {
    await this.signalR.invoke('SuscribirPartido', partidoId);
  }

  async desuscribirPartido(partidoId: string): Promise<void> {
    await this.signalR.invoke('DesuscribirPartido', partidoId);
  }

  private actualizarPartidoLocal(partidoId: string): void {
    // Actualizar partido en la lista local
    this.getPartidoDetalle(partidoId).subscribe();
  }

  private actualizarMarcadorLocal(partidoId: string, golesLocal: number, golesVisita: number): void {
    const partidos = this.partidosEnVivo();
    const index = partidos.findIndex(p => p.id === partidoId);
    
    if (index !== -1) {
      const partidosActualizados = [...partidos];
      partidosActualizados[index] = {
        ...partidosActualizados[index],
        golesLocal,
        golesVisita
      };
      this.partidosEnVivo.set(partidosActualizados);
    }

    // Actualizar también el partido actual si coincide
    const actual = this.partidoActual();
    if (actual && actual.id === partidoId) {
      this.partidoActual.set({
        ...actual,
        golesLocal,
        golesVisita
      });
    }
  }

  private actualizarMinutoLocal(partidoId: string, minuto: number): void {
    const partidos = this.partidosEnVivo();
    const index = partidos.findIndex(p => p.id === partidoId);
    
    if (index !== -1) {
      const partidosActualizados = [...partidos];
      partidosActualizados[index] = {
        ...partidosActualizados[index],
        minuto
      };
      this.partidosEnVivo.set(partidosActualizados);
    }

    // Actualizar también el partido actual si coincide
    const actual = this.partidoActual();
    if (actual && actual.id === partidoId) {
      this.partidoActual.set({
        ...actual,
        minutoActual: minuto
      });
    }
  }

  // Métodos para App Planillero
  async getPartidosPlanillero(userId: string): Promise<any[]> {
    const response: any = await this.api.get(`partidos/planillero/${userId}`).toPromise();
    return response?.success ? response.data : [];
  }

  async getPartidoDetalleOfflineAware(partidoId: string): Promise<any> {
    // Try to get from cache first
    const cached = await this.indexedDB.getCachedPartido(partidoId);
    
    if (this.connectivity.isOffline()) {
      if (cached) {
        console.log('📦 Loading match from cache (offline)');
        return cached;
      }
      throw new Error('No hay datos en caché y estás sin conexión');
    }

    // Online - fetch from API and cache
    try {
      const response = await this.getPartidoDetalle(partidoId).toPromise();
      if (response?.success) {
        await this.indexedDB.cachePartido(partidoId, response.data, 120); // Cache for 2 hours
        return response.data;
      }
      throw new Error('Error al cargar partido');
    } catch (error) {
      // If API fails but we have cache, use it
      if (cached) {
        console.log('📦 Loading match from cache (API failed)');
        return cached;
      }
      throw error;
    }
  }

  async iniciarPartido(partidoId: string): Promise<any> {
    const response: any = await this.api.patch(`partidos/${partidoId}/iniciar`, {}).toPromise();
    return response?.data;
  }

  async marcarMedioTiempo(partidoId: string): Promise<any> {
    const response: any = await this.api.patch(`partidos/${partidoId}/medio-tiempo`, {}).toPromise();
    return response?.data;
  }

  async actualizarMinuto(partidoId: string, minuto: number): Promise<any> {
    const response: any = await this.api.patch(`partidos/${partidoId}/minuto`, { minuto }).toPromise();
    return response?.data;
  }

  async registrarEvento(partidoId: string, evento: any): Promise<any> {
    const response: any = await this.api.post(`partidos/${partidoId}/eventos`, evento).toPromise();
    return response?.data;
  }

  async finalizarPartido(partidoId: string): Promise<any> {
    const response: any = await this.api.patch(`partidos/${partidoId}/finalizar`, {}).toPromise();
    return response?.data;
  }

  // Métodos para conectar/desconectar live updates
  conectarLive(partidoId: string): void {
    this.getPartidoDetalle(partidoId).subscribe();
    this.suscribirPartido(partidoId);
  }

  desconectarLive(partidoId: string): void {
    this.desuscribirPartido(partidoId);
  }

  // Alias methods for compatibility with dashboard
  cargarEnVivo(): void {
    this.getPartidosEnVivo().subscribe();
  }

  cargarProximos(dias: number = 14, torneoId?: string): void {
    this.getProximosPartidos(dias, torneoId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.proximosPartidos.set(response.data);
        }
      }
    });
  }
}
