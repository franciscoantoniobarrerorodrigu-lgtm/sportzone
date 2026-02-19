export type TipoResolucion = 
  | 'disciplinaria' 
  | 'administrativa' 
  | 'tecnica';

export type TipoSancion = 
  | 'suspension' 
  | 'descuento_puntos' 
  | 'multa' 
  | 'wo_tecnico' 
  | 'amonestacion';

export type EstadoResolucion = 
  | 'borrador' 
  | 'emitida' 
  | 'apelada' 
  | 'resuelta' 
  | 'anulada';

export interface Resolucion {
  id: string;
  numero: string;  // "RES-2025-001"
  tipo: TipoResolucion;
  asunto: string;
  motivo?: string;
  sancionTipo?: TipoSancion;
  sancionValor?: number;
  estado: EstadoResolucion;
  fechaEmision?: string;
  solicitudId?: string;
  equipoId?: string;
  jugadorId?: string;
  partidoId?: string;
  createdAt: string;
}

// DTOs
export interface CreateResolucionDto {
  tipo: TipoResolucion;
  asunto: string;
  motivo?: string;
  sancionTipo?: TipoSancion;
  sancionValor?: number;
  equipoId?: string;
  jugadorId?: string;
  partidoId?: string;
  solicitudId?: string;
}

export interface UpdateEstadoResolucionDto {
  estado: EstadoResolucion;
  comentario?: string;
}
