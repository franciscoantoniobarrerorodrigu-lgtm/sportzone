export interface Torneo {
  id: string;
  temporadaId: string;
  nombre: string;
  tipo: 'liga' | 'copa' | 'amistoso';
  totalJornadas: number;
  activo: boolean;
  createdAt: string;
}

export interface Temporada {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  createdAt: string;
}
