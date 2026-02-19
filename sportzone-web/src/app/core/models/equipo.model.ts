import { Jugador } from './jugador.model';

export interface Equipo {
  id: string;
  nombre: string;
  abreviatura: string;
  ciudad?: string;
  estadio?: string;
  escudoUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  activo: boolean;
  createdAt: string;
}

export interface EquipoResumen {
  id: string;
  nombre: string;
  abreviatura: string;
  escudoUrl?: string;
  jugadores?: Jugador[];
}
