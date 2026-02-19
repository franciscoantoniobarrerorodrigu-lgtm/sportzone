import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResolucionesService } from './resoluciones.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('ResolucionesService', () => {
  let service: ResolucionesService;
  let mockApiService: any;

  beforeEach(() => {
    mockApiService = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn()
    };

    service = new ResolucionesService(mockApiService);
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('getResoluciones', () => {
    it('should fetch resoluciones with default params', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            numero: 'RES-2025-001',
            tipo: 'disciplinaria',
            asunto: 'Suspensión por acumulación de tarjetas',
            estado: 'emitida',
            createdAt: new Date()
          }
        ],
        total: 1,
        page: 1,
        pageSize: 20
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getResoluciones());

      expect(mockApiService.get).toHaveBeenCalledWith('resoluciones?page=1&pageSize=20');
      expect(service.resoluciones()).toEqual(mockResponse.data);
      expect(service.totalResoluciones()).toBe(1);
      expect(service.loading()).toBe(false);
    });

    it('should include filters in query params', async () => {
      const mockResponse = {
        success: true,
        data: [],
        total: 0,
        page: 1,
        pageSize: 20
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getResoluciones('disciplinaria', 'emitida', 2, 10));

      expect(mockApiService.get).toHaveBeenCalledWith('resoluciones?page=2&pageSize=10&tipo=disciplinaria&estado=emitida');
    });
  });

  describe('getResolucion', () => {
    it('should fetch single resolucion by id', async () => {
      const mockResolucion = {
        id: '1',
        numero: 'RES-2025-001',
        tipo: 'disciplinaria'
      };

      mockApiService.get.mockReturnValue(of(mockResolucion));

      const result = await firstValueFrom(service.getResolucion('1'));

      expect(mockApiService.get).toHaveBeenCalledWith('resoluciones/1');
      expect(result).toEqual(mockResolucion);
    });
  });

  describe('createResolucion', () => {
    it('should create new resolucion', async () => {
      const dto = {
        tipo: 'disciplinaria',
        asunto: 'Suspensión',
        sancionTipo: 'suspension',
        sancionValor: 2
      };

      const mockResponse = { success: true, data: { id: '1', ...dto } };
      mockApiService.post.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.createResolucion(dto));

      expect(mockApiService.post).toHaveBeenCalledWith('resoluciones', dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cambiarEstado', () => {
    it('should change resolucion estado', async () => {
      const dto = { estado: 'emitida' };
      const mockResponse = { success: true };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.cambiarEstado('1', dto));

      expect(mockApiService.patch).toHaveBeenCalledWith('resoluciones/1/estado', dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('aplicarResolucion', () => {
    it('should apply resolucion', async () => {
      const mockResponse = { success: true };
      mockApiService.patch.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.aplicarResolucion('1'));

      expect(mockApiService.patch).toHaveBeenCalledWith('resoluciones/1/aplicar', {});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('anularResolucion', () => {
    it('should anular resolucion by changing estado to anulada', async () => {
      const mockResponse = { success: true };
      mockApiService.patch.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.anularResolucion('1'));

      expect(mockApiService.patch).toHaveBeenCalledWith('resoluciones/1/estado', { estado: 'anulada' });
      expect(result).toEqual(mockResponse);
    });
  });
});
