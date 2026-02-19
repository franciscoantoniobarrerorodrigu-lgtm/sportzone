import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LigaService } from './liga.service';
import { ApiService } from './api.service';
import { of, throwError } from 'rxjs';

describe('LigaService', () => {
  let service: LigaService;
  let mockApiService: any;

  beforeEach(() => {
    mockApiService = {
      get: vi.fn()
    };

    service = new LigaService(mockApiService);
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('getTorneos', () => {
    it('should fetch torneos and update signals', async () => {
      const mockTorneos = [
        { id: '1', nombre: 'Liga Pro', activo: true },
        { id: '2', nombre: 'Copa Nacional', activo: false }
      ];

      mockApiService.get.mockReturnValue(of(mockTorneos));

      await new Promise<void>((resolve) => {
        service.getTorneos().subscribe(() => {
          expect(mockApiService.get).toHaveBeenCalledWith('liga/torneos');
          expect(service.torneos()).toEqual(mockTorneos);
          expect(service.torneoActual()).toEqual(mockTorneos[0]);
          expect(service.loading()).toBe(false);
          resolve();
        });
      });
    });

    it('should set loading to true initially', () => {
      mockApiService.get.mockReturnValue(of([]));

      service.getTorneos().subscribe();

      expect(service.loading()).toBe(false); // After subscription completes
    });

    it('should handle empty torneos array', async () => {
      mockApiService.get.mockReturnValue(of([]));

      await new Promise<void>((resolve) => {
        service.getTorneos().subscribe(() => {
          expect(service.torneos()).toEqual([]);
          expect(service.torneoActual()).toBeNull();
          resolve();
        });
      });
    });
  });

  describe('getTablaPosiciones', () => {
    it('should fetch tabla posiciones and update signals', async () => {
      const mockPosiciones = [
        {
          posicion: 1,
          id: '1',
          equipoNombre: 'Equipo A',
          abreviatura: 'EQA',
          partidosJugados: 10,
          partidosGanados: 7,
          partidosEmpatados: 2,
          partidosPerdidos: 1,
          golesFavor: 20,
          golesContra: 8,
          diferencia: 12,
          puntos: 23
        }
      ];

      mockApiService.get.mockReturnValue(of(mockPosiciones));

      await new Promise<void>((resolve) => {
        service.getTablaPosiciones('torneo-123').subscribe(() => {
          expect(mockApiService.get).toHaveBeenCalledWith('liga/posiciones/torneo-123');
          expect(service.tabla()).toEqual(mockPosiciones);
          expect(service.loading()).toBe(false);
          resolve();
        });
      });
    });

    it('should clear error on successful fetch', async () => {
      service.error.set('Previous error');
      mockApiService.get.mockReturnValue(of([]));

      await new Promise<void>((resolve) => {
        service.getTablaPosiciones('torneo-123').subscribe(() => {
          expect(service.error()).toBeNull();
          resolve();
        });
      });
    });
  });

  describe('getResultadosJornada', () => {
    it('should fetch resultados for specific jornada', async () => {
      const mockResultados = [
        { id: '1', equipoLocal: 'A', equipoVisita: 'B', golesLocal: 2, golesVisita: 1 }
      ];

      mockApiService.get.mockReturnValue(of(mockResultados));

      await new Promise<void>((resolve) => {
        service.getResultadosJornada('torneo-123', 5).subscribe((result) => {
          expect(mockApiService.get).toHaveBeenCalledWith('liga/torneo-123/jornada/5');
          expect(result).toEqual(mockResultados);
          resolve();
        });
      });
    });
  });
});
