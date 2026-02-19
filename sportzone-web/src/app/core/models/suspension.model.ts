export type TipoSuspension = 
  | 'acumulacion_amarillas' 
  | 'tarjeta_roja' 
  | 'resolucion_administrativa';

export type EstadoSuspension = 
  | 'activa' 
  | 'cumplida' 
  | 'anulada';

export interface Suspension {
  id: string;
  jugadorId: string;
  torneoId: string;
  tipo: TipoSuspension;
  partidosTotales: number;
  partidosCumplidos: number;
  estado: EstadoSuspension;
  motivo?: string;
  fechaInicio: string;
  createdAt: string;
}

export interface SuspensionDetalle extends Suspension {
  jugadorNombre: string;
  equipoNombre: string;
  partidosRestantes: number;
}
