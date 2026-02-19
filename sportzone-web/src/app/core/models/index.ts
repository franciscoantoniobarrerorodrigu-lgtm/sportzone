// Exportar todos los modelos desde un solo punto
export * from './partido.model';
export * from './equipo.model';
export * from './jugador.model';
export * from './evento.model';
export * from './torneo.model';
export * from './posicion.model';
export * from './goleador.model';
export * from './solicitud.model';
export * from './resolucion.model';
export * from './suspension.model';

// Exportar modelos de admin (sin EstadoPartido que ya viene de partido.model)
export type { 
  CreatePartidoRequest, 
  UpdatePartidoRequest, 
  PartidoAdmin, 
  PagedResult, 
  PartidoFilters 
} from './partido-admin.model';
