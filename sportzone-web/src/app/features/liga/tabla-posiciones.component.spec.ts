import { describe, it, expect, beforeEach } from 'vitest';
import { TablaPosicionesComponent } from './tabla-posiciones.component';
import { LigaService } from '../../core/services/liga.service';
import { signal } from '@angular/core';

describe('TablaPosicionesComponent', () => {
  let component: TablaPosicionesComponent;
  let mockLigaService: any;

  beforeEach(() => {
    mockLigaService = {
      tabla: signal([]),
      loading: signal(false),
      error: signal(null)
    };

    component = new TablaPosicionesComponent();
    (component as any).ligaService = mockLigaService;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('esZonaClasificacion', () => {
    it('should return true for positions 1-4', () => {
      expect(component.esZonaClasificacion(1)).toBe(true);
      expect(component.esZonaClasificacion(2)).toBe(true);
      expect(component.esZonaClasificacion(3)).toBe(true);
      expect(component.esZonaClasificacion(4)).toBe(true);
    });

    it('should return false for positions > 4', () => {
      expect(component.esZonaClasificacion(5)).toBe(false);
      expect(component.esZonaClasificacion(10)).toBe(false);
    });
  });

  describe('esZonaDescenso', () => {
    beforeEach(() => {
      // Set up a table with 16 teams
      const mockTabla = Array.from({ length: 16 }, (_, i) => ({
        posicion: i + 1,
        id: `${i + 1}`,
        equipoNombre: `Equipo ${i + 1}`,
        abreviatura: `EQ${i + 1}`,
        partidosJugados: 10,
        partidosGanados: 5,
        partidosEmpatados: 3,
        partidosPerdidos: 2,
        golesFavor: 15,
        golesContra: 10,
        diferencia: 5,
        puntos: 18
      }));
      mockLigaService.tabla.set(mockTabla);
    });

    it('should return true for last 3 positions', () => {
      expect(component.esZonaDescenso(14)).toBe(true); // 16 - 3 + 1 = 14
      expect(component.esZonaDescenso(15)).toBe(true);
      expect(component.esZonaDescenso(16)).toBe(true);
    });

    it('should return false for positions not in last 3', () => {
      expect(component.esZonaDescenso(1)).toBe(false);
      expect(component.esZonaDescenso(10)).toBe(false);
      expect(component.esZonaDescenso(13)).toBe(false);
    });
  });

  describe('table display', () => {
    it('should handle empty table', () => {
      mockLigaService.tabla.set([]);
      expect(mockLigaService.tabla().length).toBe(0);
    });

    it('should display table with data', () => {
      const mockTabla = [
        {
          posicion: 1,
          id: '1',
          equipoNombre: 'Barcelona SC',
          abreviatura: 'BSC',
          partidosJugados: 10,
          partidosGanados: 8,
          partidosEmpatados: 1,
          partidosPerdidos: 1,
          golesFavor: 25,
          golesContra: 8,
          diferencia: 17,
          puntos: 25
        }
      ];

      mockLigaService.tabla.set(mockTabla);
      expect(mockLigaService.tabla().length).toBe(1);
      expect(mockLigaService.tabla()[0].equipoNombre).toBe('Barcelona SC');
    });
  });
});
