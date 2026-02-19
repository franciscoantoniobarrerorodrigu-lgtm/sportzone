/**
 * Modelos para la administración de partidos
 * Estos modelos son específicos para las operaciones CRUD de administración
 */

import { EstadoPartido } from './partido.model';

// Re-exportar EstadoPartido para que esté disponible desde este módulo
export type { EstadoPartido };

/**
 * Request para crear un nuevo partido
 */
export interface CreatePartidoRequest {
  torneoId: string;
  jornada: number;
  equipoLocalId: string;
  equipoVisitaId: string;
  fechaHora: string; // ISO 8601 format
  estadio?: string;
  estado: EstadoPartido;
}

/**
 * Request para actualizar un partido existente
 * Todos los campos son opcionales
 */
export interface UpdatePartidoRequest {
  torneoId?: string;
  jornada?: number;
  equipoLocalId?: string;
  equipoVisitaId?: string;
  fechaHora?: string; // ISO 8601 format
  estadio?: string;
  estado?: EstadoPartido;
}

/**
 * Información completa de un partido para administración
 * Incluye nombres de torneo y equipos para display
 */
export interface PartidoAdmin {
  id: string;
  torneoId: string;
  torneoNombre: string;
  jornada: number;
  equipoLocalId: string;
  equipoLocalNombre: string;
  equipoVisitaId: string;
  equipoVisitaNombre: string;
  fechaHora: Date;
  estadio?: string;
  estado: string;
  golesLocal?: number;
  golesVisita?: number;
  createdAt: Date;
}

/**
 * Resultado paginado genérico
 */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Filtros para consulta de partidos
 */
export interface PartidoFilters {
  torneoId?: string;
  estado?: EstadoPartido;
  page?: number;
  pageSize?: number;
}
