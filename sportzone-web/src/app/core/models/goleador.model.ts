import { EquipoResumen } from './equipo.model';

export interface EstadisticaJugador {
  id: string;
  jugadorId: string;
  torneoId: string;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  partidosJugados: number;
  minutosJugados: number;
}

export interface Goleador {
  jugadorId: string;
  jugadorNombre: string;
  numeroCamiseta?: number;
  posicion?: string;
  nacionalidad?: string;
  fotoUrl?: string;
  equipo: EquipoResumen;
  goles: number;
  asistencias: number;
  partidosJugados: number;
  torneoId: string;
  torneoNombre: string;
}

export interface Asistidor extends Omit<Goleador, 'goles'> {
  asistencias: number;
}

export interface JugadorTarjetas {
  jugadorId: string;
  jugadorNombre: string;
  numeroCamiseta?: number;
  fotoUrl?: string;
  equipo: EquipoResumen;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  partidosJugados: number;
  torneoId: string;
  torneoNombre: string;
}
