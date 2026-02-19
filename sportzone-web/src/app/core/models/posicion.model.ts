import { EquipoResumen } from './equipo.model';

export interface Posicion {
  id: string;
  torneoId: string;
  equipoId: string;
  pj: number;  // partidos jugados
  pg: number;  // ganados
  pe: number;  // empatados
  pp: number;  // perdidos
  gf: number;  // goles a favor
  gc: number;  // goles en contra
  puntos: number;
  diferencia: number;
  ultimaActualizacion: string;
}

export interface PosicionEquipo extends Posicion {
  posicion: number;
  equipo: EquipoResumen;
  torneoNombre: string;
  forma?: ('V' | 'E' | 'D')[];  // últimos 5 resultados
}
