export interface Jugador {
  id: string;
  equipoId: string;
  nombre: string;
  apellido: string;
  numeroCamiseta?: number;
  posicion?: 'Portero' | 'Defensa' | 'Mediocampista' | 'Extremo' | 'Delantero' | 'Mediapunta';
  nacionalidad?: string;
  fechaNacimiento?: string;
  fotoUrl?: string;
  activo: boolean;
  createdAt: string;
}

export interface JugadorResumen {
  id: string;
  nombreCompleto: string;
  numeroCamiseta?: number;
  posicion?: string;
  fotoUrl?: string;
}
