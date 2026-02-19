import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Resolucion {
  id: string;
  numero: string;
  tipo: 'disciplinaria' | 'administrativa' | 'tecnica';
  asunto: string;
  motivo?: string;
  sancionTipo?: 'suspension' | 'descuento_puntos' | 'multa' | 'wo_tecnico' | 'amonestacion';
  sancionValor?: number;
  estado: 'borrador' | 'emitida' | 'apelada' | 'resuelta' | 'anulada';
  fechaEmision?: Date;
  solicitudId?: string;
  equipoId?: string;
  equipoNombre?: string;
  jugadorId?: string;
  jugadorNombre?: string;
  partidoId?: string;
  createdAt: Date;
}

export interface CreateResolucionDto {
  tipo: string;
  asunto: string;
  motivo?: string;
  sancionTipo?: string;
  sancionValor?: number;
  equipoId?: string;
  jugadorId?: string;
  partidoId?: string;
  solicitudId?: string;
}

export interface UpdateEstadoDto {
  estado: string;
}

export interface ResolucionesResponse {
  success: boolean;
  data: Resolucion[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResolucionesService {
  resoluciones = signal<Resolucion[]>([]);
  totalResoluciones = signal<number>(0);
  loading = signal<boolean>(false);

  constructor(private api: ApiService) {}

  getResoluciones(
    tipo?: string,
    estado?: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<ResolucionesResponse> {
    this.loading.set(true);
    
    let params = `?page=${page}&pageSize=${pageSize}`;
    if (tipo) params += `&tipo=${tipo}`;
    if (estado) params += `&estado=${estado}`;

    return this.api.get<ResolucionesResponse>(`resoluciones${params}`).pipe(
      tap((response: ResolucionesResponse) => {
        if (response.success) {
          this.resoluciones.set(response.data);
          this.totalResoluciones.set(response.total);
        }
        this.loading.set(false);
      })
    );
  }

  getResolucion(id: string): Observable<any> {
    return this.api.get(`resoluciones/${id}`);
  }

  createResolucion(dto: CreateResolucionDto): Observable<any> {
    return this.api.post('resoluciones', dto);
  }

  cambiarEstado(id: string, dto: UpdateEstadoDto): Observable<any> {
    return this.api.patch(`resoluciones/${id}/estado`, dto);
  }

  aplicarResolucion(id: string): Observable<any> {
    return this.api.patch(`resoluciones/${id}/aplicar`, {});
  }

  anularResolucion(id: string): Observable<any> {
    return this.api.patch(`resoluciones/${id}/estado`, { estado: 'anulada' });
  }
}
