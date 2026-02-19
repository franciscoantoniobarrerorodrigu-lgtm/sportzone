import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  CreatePartidoRequest,
  UpdatePartidoRequest,
  PartidoAdmin,
  PagedResult,
  PartidoFilters
} from '../models/partido-admin.model';

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Servicio para administración de partidos
 * Proporciona operaciones CRUD completas para gestión de partidos
 */
@Injectable({
  providedIn: 'root'
})
export class AdminPartidosService {
  private readonly endpoint = 'partidos';

  constructor(private api: ApiService) {}

  /**
   * Crea un nuevo partido
   * @param data Datos del partido a crear
   * @returns Observable con el partido creado
   */
  createPartido(data: CreatePartidoRequest): Observable<ApiResponse<PartidoAdmin>> {
    return this.api.post<ApiResponse<PartidoAdmin>>(this.endpoint, data)
      .pipe(
        catchError(error => {
          console.error('Error al crear partido:', error);
          throw error;
        })
      );
  }

  /**
   * Obtiene todos los partidos con filtros opcionales
   * @param filters Filtros de búsqueda (torneo, estado, paginación)
   * @returns Observable con resultado paginado de partidos
   */
  getAllPartidos(filters?: PartidoFilters): Observable<ApiResponse<PagedResult<PartidoAdmin>>> {
    let queryParams = '';
    
    if (filters) {
      const params: string[] = [];
      
      if (filters.torneoId) {
        params.push(`torneoId=${filters.torneoId}`);
      }
      
      if (filters.estado) {
        params.push(`estado=${filters.estado}`);
      }
      
      if (filters.page !== undefined) {
        params.push(`page=${filters.page}`);
      }
      
      if (filters.pageSize !== undefined) {
        params.push(`pageSize=${filters.pageSize}`);
      }
      
      if (params.length > 0) {
        queryParams = '?' + params.join('&');
      }
    }
    
    return this.api.get<ApiResponse<PagedResult<PartidoAdmin>>>(`${this.endpoint}${queryParams}`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener partidos:', error);
          throw error;
        })
      );
  }

  /**
   * Obtiene un partido por su ID
   * @param id ID del partido
   * @returns Observable con el partido
   */
  getPartidoById(id: string): Observable<ApiResponse<PartidoAdmin>> {
    return this.api.get<ApiResponse<PartidoAdmin>>(`${this.endpoint}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener partido:', error);
          throw error;
        })
      );
  }

  /**
   * Actualiza un partido existente
   * @param id ID del partido a actualizar
   * @param data Datos a actualizar (campos opcionales)
   * @returns Observable con el partido actualizado
   */
  updatePartido(id: string, data: UpdatePartidoRequest): Observable<ApiResponse<PartidoAdmin>> {
    return this.api.put<ApiResponse<PartidoAdmin>>(`${this.endpoint}/${id}`, data)
      .pipe(
        catchError(error => {
          console.error('Error al actualizar partido:', error);
          throw error;
        })
      );
  }

  /**
   * Elimina un partido
   * @param id ID del partido a eliminar
   * @returns Observable con respuesta vacía
   */
  deletePartido(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error al eliminar partido:', error);
          throw error;
        })
      );
  }
}
