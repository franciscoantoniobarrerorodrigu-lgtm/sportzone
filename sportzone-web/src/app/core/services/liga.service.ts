import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface PosicionEquipo {
  posicion: number;
  id: string;
  equipoNombre: string;
  abreviatura: string;
  escudoUrl?: string;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesFavor: number;
  golesContra: number;
  diferencia: number;
  puntos: number;
}

export interface Torneo {
  id: string;
  nombre: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LigaService {
  tabla = signal<PosicionEquipo[]>([]);
  torneos = signal<Torneo[]>([]);
  torneoActual = signal<Torneo | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private api: ApiService) {}

  getTorneos(): Observable<any> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.api.get('liga/torneos').pipe(
      tap((response: any) => {
        const torneos: Torneo[] = response;
        this.torneos.set(torneos);
        if (torneos.length > 0) {
          this.torneoActual.set(torneos[0]);
        }
        this.loading.set(false);
      })
    );
  }

  getTablaPosiciones(torneoId: string): Observable<any> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.api.get(`liga/posiciones/${torneoId}`).pipe(
      tap((response: any) => {
        const posiciones: PosicionEquipo[] = response;
        this.tabla.set(posiciones);
        this.loading.set(false);
      })
    );
  }

  getResultadosJornada(torneoId: string, jornada: number): Observable<any> {
    return this.api.get(`liga/${torneoId}/jornada/${jornada}`);
  }

  // Alias method for compatibility
  cargarTabla(torneoId: string): void {
    this.getTablaPosiciones(torneoId).subscribe();
  }
}
