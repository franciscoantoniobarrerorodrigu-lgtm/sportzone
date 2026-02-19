export type TipoSolicitud = 
  | 'marketing' 
  | 'traspaso' 
  | 'patrocinio' 
  | 'medios' 
  | 'disciplina' 
  | 'administrativa' 
  | 'tecnica';

export type EstadoSolicitud = 
  | 'pendiente' 
  | 'en_revision' 
  | 'aprobado' 
  | 'rechazado' 
  | 'cancelado';

export type PrioridadSolicitud = 
  | 'baja' 
  | 'media' 
  | 'alta' 
  | 'urgente';

export interface Solicitud {
  id: string;
  tipo: TipoSolicitud;
  titulo: string;
  descripcion?: string;
  solicitante?: string;
  equipoId?: string;
  monto?: number;
  estado: EstadoSolicitud;
  prioridad: PrioridadSolicitud;
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface CreateSolicitudDto {
  tipo: TipoSolicitud;
  titulo: string;
  descripcion?: string;
  solicitante?: string;
  equipoId?: string;
  monto?: number;
  prioridad?: PrioridadSolicitud;
}

export interface UpdateEstadoSolicitudDto {
  estado: EstadoSolicitud;
  comentario?: string;
}
