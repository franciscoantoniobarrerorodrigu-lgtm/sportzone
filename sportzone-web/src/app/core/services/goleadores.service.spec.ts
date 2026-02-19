import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoleadoresService } from './goleadores.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('GoleadoresService', () => {
  let service: GoleadoresService;
  let mockApiService: any;

  beforeEach(() => {
    mockApiService = {
      get: vi.fn()
    };

    service = new GoleadoresService(mockApiService);
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('getGoleadores', () => {
    it('should fetch goleadores and update signal', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            jugadorNombre: 'Juan Pérez',
            equipoNombre: 'Equipo A',
            goles: 15,
            asistencias: 5,
            tarjetasAmarillas: 2,
            tarjetasRojas: 0
          }
        ]
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getGoleadores('torneo-123', 20));

      expect(mockApiService.get).toHaveBeenCalledWith('goleadores/torneo-123?top=20');
      expect(service.goleadores()).toEqual(mockResponse.data);
    });

    it('should include equipoId in query params when provided', async () => {
      const mockResponse = { success: true, data: [] };
      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getGoleadores('torneo-123', 10, 'equipo-456'));

      expect(mockApiService.get).toHaveBeenCalledWith('goleadores/torneo-123?top=10&equipoId=equipo-456');
    });

    it('should not update signal when success is false', async () => {
      const mockResponse = { success: false, data: [] };
      mockApiService.get.mockReturnValue(of(mockResponse));

      const initialGoleadores = service.goleadores();
      await firstValueFrom(service.getGoleadores('torneo-123'));

      expect(service.goleadores()).toEqual(initialGoleadores);
    });
  });

  describe('getAsistidores', () => {
    it('should fetch asistidores and update signal', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            jugadorNombre: 'Pedro López',
            equipoNombre: 'Equipo B',
            goles: 5,
            asistencias: 12,
            tarjetasAmarillas: 1,
            tarjetasRojas: 0
          }
        ]
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getAsistidores('torneo-123', 15));

      expect(mockApiService.get).toHaveBeenCalledWith('goleadores/torneo-123/asistencias?top=15');
      expect(service.asistidores()).toEqual(mockResponse.data);
    });
  });

  describe('getTarjetas', () => {
    it('should fetch tarjetas amarillas by default', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            jugadorNombre: 'Carlos Ruiz',
            equipoNombre: 'Equipo C',
            goles: 3,
            asistencias: 2,
            tarjetasAmarillas: 8,
            tarjetasRojas: 0
          }
        ]
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getTarjetas('torneo-123'));

      expect(mockApiService.get).toHaveBeenCalledWith('goleadores/torneo-123/tarjetas?tipo=amarillas');
      expect(service.tarjetas()).toEqual(mockResponse.data);
    });

    it('should fetch tarjetas rojas when specified', async () => {
      const mockResponse = { success: true, data: [] };
      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getTarjetas('torneo-123', 'rojas'));

      expect(mockApiService.get).toHaveBeenCalledWith('goleadores/torneo-123/tarjetas?tipo=rojas');
    });
  });
});
