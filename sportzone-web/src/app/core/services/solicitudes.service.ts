import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Solicitud {
  id: string;
  tipo: 'marketing' | 'traspaso' | 'patrocinio' | 'medios' | 'disciplina' | 'administrativa' | 'tecnica';
  titulo: string;
  descripcion?: string;
  solicitante?: string;
  equipoId?: string;
  equipoNombre?: string;
  monto?: number;
  estado: 'pendiente' | 'en_revision' | 'aprobado' | 'rechazado' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSolicitudDto {
  tipo: string;
  titulo: string;
  descripcion?: string;
  solicitante?: string;
  equipoId?: string;
  monto?: number;
  prioridad?: string;
}

export interface UpdateEstadoDto {
  estado: string;
  motivo?: string;
}

export interface SolicitudesResponse {
  success: boolean;
  data: Solicitud[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  solicitudes = signal<Solicitud[]>([]);
  totalSolicitudes = signal<number>(0);
  loading = signal<boolean>(false);

  constructor(private api: ApiService) {}

  getSolicitudes(
    estado?: string,
    tipo?: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<SolicitudesResponse> {
    this.loading.set(true);
    
    let params = `?page=${page}&pageSize=${pageSize}`;
    if (estado) params += `&estado=${estado}`;
    if (tipo) params += `&tipo=${tipo}`;

    return this.api.get<SolicitudesResponse>(`solicitudes${params}`).pipe(
      tap((response: SolicitudesResponse) => {
        if (response.success) {
          this.solicitudes.set(response.data);
          this.totalSolicitudes.set(response.total);
        }
        this.loading.set(false);
      })
    );
  }

  getSolicitud(id: string): Observable<any> {
    return this.api.get(`solicitudes/${id}`);
  }

  createSolicitud(dto: CreateSolicitudDto): Observable<any> {
    return this.api.post('solicitudes', dto);
  }

  updateEstado(id: string, dto: UpdateEstadoDto): Observable<any> {
    return this.api.patch(`solicitudes/${id}/estado`, dto);
  }

  deleteSolicitud(id: string): Observable<any> {
    return this.api.delete(`solicitudes/${id}`);
  }
}
