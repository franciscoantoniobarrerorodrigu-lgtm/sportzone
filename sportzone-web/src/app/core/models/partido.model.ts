import { EquipoResumen } from './equipo.model';
import { EventoPartido } from './evento.model';

export type EstadoPartido = 'programado' | 'en_curso' | 'medio_tiempo' | 'finalizado' | 'suspendido' | 'cancelado';

export interface Partido {
  id: string;
  torneoId: string;
  jornada: number;
  equipoLocalId: string;
  equipoVisitaId: string;
  fechaHora: string;
  estadio?: string;
  golesLocal: number;
  golesVisita: number;
  estado: EstadoPartido;
  minutoActual: number;
  planilleroId?: string;
  createdAt: string;
}

export interface PartidoDetalle extends Partido {
  equipoLocal: EquipoResumen;
  equipoVisita: EquipoResumen;
  torneoNombre: string;
  eventos: EventoPartido[];
}

export interface PartidoEnVivo {
  id: string;
  equipoLocal: EquipoResumen;
  equipoVisita: EquipoResumen;
  golesLocal: number;
  golesVisita: number;
  minuto: number;
  estado: EstadoPartido;
  eventos: EventoPartido[];
}

// DTOs
export interface CreatePartidoDto {
  torneoId: string;
  jornada: number;
  equipoLocalId: string;
  equipoVisitaId: string;
  fechaHora: string;
  estadio?: string;
  planilleroId?: string;
}
