export type TipoEvento = 
  | 'gol' 
  | 'tarjeta_amarilla' 
  | 'tarjeta_roja' 
  | 'sustitucion' 
  | 'penal' 
  | 'autogol' 
  | 'inicio_partido' 
  | 'medio_tiempo' 
  | 'fin_partido';

export interface EventoPartido {
  id: string;
  partidoId: string;
  minuto: number;
  tipo: TipoEvento;
  jugadorId?: string;
  jugadorNombre?: string;
  asistenteId?: string;
  asistenteNombre?: string;
  equipoId: string;
  equipoNombre?: string;
  descripcion?: string;
  createdAt: string;
}

// DTOs
export interface CreateEventoDto {
  minuto: number;
  tipo: TipoEvento;
  jugadorId?: string;
  asistenteId?: string;
  equipoId: string;
  descripcion?: string;
}
