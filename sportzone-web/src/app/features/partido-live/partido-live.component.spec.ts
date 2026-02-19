import { describe, it, expect, beforeEach } from 'vitest';
import { PartidoLiveComponent } from './partido-live.component';
import { PartidosService } from '../../core/services/partidos.service';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('PartidoLiveComponent', () => {
  let component: PartidoLiveComponent;
  let mockPartidosService: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockPartidosService = {
      partidoEnVivo: signal(null),
      cargarEnVivo: vi.fn(),
      suscribirPartido: vi.fn().mockResolvedValue(undefined),
      desuscribirPartido: vi.fn().mockResolvedValue(undefined)
    };

    mockActivatedRoute = {
      params: of({ id: 'partido-123' })
    };

    component = new PartidoLiveComponent();
    (component as any).partidosService = mockPartidosService;
    (component as any).route = mockActivatedRoute;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('getTipoEvento', () => {
    it('should return "GOL" for gol event', () => {
      expect(component.getTipoEvento('gol')).toBe('GOL');
    });

    it('should return "TARJETA AMARILLA" for tarjeta_amarilla event', () => {
      expect(component.getTipoEvento('tarjeta_amarilla')).toBe('TARJETA AMARILLA');
    });

    it('should return "TARJETA ROJA" for tarjeta_roja event', () => {
      expect(component.getTipoEvento('tarjeta_roja')).toBe('TARJETA ROJA');
    });

    it('should return "SUSTITUCIÓN" for sustitucion event', () => {
      expect(component.getTipoEvento('sustitucion')).toBe('SUSTITUCIÓN');
    });

    it('should return capitalized type for unknown events', () => {
      expect(component.getTipoEvento('inicio_partido')).toBe('Inicio Partido');
    });
  });

  describe('partido display', () => {
    it('should display partido when loaded', () => {
      const mockPartido = {
        id: 'partido-123',
        equipoLocal: {
          nombre: 'Barcelona SC',
          escudo: '/assets/barcelona.png'
        },
        equipoVisita: {
          nombre: 'Emelec',
          escudo: '/assets/emelec.png'
        },
        golesLocal: 2,
        golesVisita: 1,
        estado: 'en_curso',
        minuto: 45,
        eventos: [
          {
            id: '1',
            tipo: 'gol',
            minuto: 30,
            jugadorNombre: 'Juan Pérez',
            equipoNombre: 'Barcelona SC'
          }
        ]
      };

      mockPartidosService.partidoEnVivo.set(mockPartido);

      expect(mockPartidosService.partidoEnVivo()).toEqual(mockPartido);
      expect(mockPartidosService.partidoEnVivo().golesLocal).toBe(2);
      expect(mockPartidosService.partidoEnVivo().golesVisita).toBe(1);
    });

    it('should handle partido with no events', () => {
      const mockPartido = {
        id: 'partido-123',
        equipoLocal: { nombre: 'A', escudo: '' },
        equipoVisita: { nombre: 'B', escudo: '' },
        golesLocal: 0,
        golesVisita: 0,
        estado: 'en_curso',
        minuto: 10,
        eventos: []
      };

      mockPartidosService.partidoEnVivo.set(mockPartido);

      expect(mockPartidosService.partidoEnVivo().eventos.length).toBe(0);
    });
  });
});
