import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Goleador {
  jugadorNombre: string;
  equipoNombre: string;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  fotoUrl?: string;
  escudoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoleadoresService {
  goleadores = signal<Goleador[]>([]);
  asistidores = signal<Goleador[]>([]);
  tarjetas = signal<Goleador[]>([]);

  constructor(private api: ApiService) {}

  getGoleadores(torneoId: string, top: number = 20, equipoId?: string): Observable<any> {
    const params = equipoId ? `?top=${top}&equipoId=${equipoId}` : `?top=${top}`;
    return this.api.get(`goleadores/${torneoId}${params}`).pipe(
      tap((response: any) => {
        if (response.success) {
          this.goleadores.set(response.data);
        }
      })
    );
  }

  getAsistidores(torneoId: string, top: number = 20): Observable<any> {
    return this.api.get(`goleadores/${torneoId}/asistencias?top=${top}`).pipe(
      tap((response: any) => {
        if (response.success) {
          this.asistidores.set(response.data);
        }
      })
    );
  }

  getTarjetas(torneoId: string, tipo: string = 'amarillas'): Observable<any> {
    return this.api.get(`goleadores/${torneoId}/tarjetas?tipo=${tipo}`).pipe(
      tap((response: any) => {
        if (response.success) {
          this.tarjetas.set(response.data);
        }
      })
    );
  }
}
