import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SolicitudesService } from './solicitudes.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('SolicitudesService', () => {
  let service: SolicitudesService;
  let mockApiService: any;

  beforeEach(() => {
    mockApiService = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    };

    service = new SolicitudesService(mockApiService);
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('getSolicitudes', () => {
    it('should fetch solicitudes with default params', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            tipo: 'marketing',
            titulo: 'Solicitud de patrocinio',
            estado: 'pendiente',
            prioridad: 'alta',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: 1,
        page: 1,
        pageSize: 20
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getSolicitudes());

      expect(mockApiService.get).toHaveBeenCalledWith('solicitudes?page=1&pageSize=20');
      expect(service.solicitudes()).toEqual(mockResponse.data);
      expect(service.totalSolicitudes()).toBe(1);
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

      await firstValueFrom(service.getSolicitudes('aprobado', 'marketing', 2, 10));

      expect(mockApiService.get).toHaveBeenCalledWith('solicitudes?page=2&pageSize=10&estado=aprobado&tipo=marketing');
    });
  });

  describe('getSolicitud', () => {
    it('should fetch single solicitud by id', async () => {
      const mockSolicitud = {
        id: '1',
        tipo: 'marketing',
        titulo: 'Test'
      };

      mockApiService.get.mockReturnValue(of(mockSolicitud));

      const result = await firstValueFrom(service.getSolicitud('1'));

      expect(mockApiService.get).toHaveBeenCalledWith('solicitudes/1');
      expect(result).toEqual(mockSolicitud);
    });
  });

  describe('createSolicitud', () => {
    it('should create new solicitud', async () => {
      const dto = {
        tipo: 'marketing',
        titulo: 'Nueva solicitud',
        descripcion: 'Descripción',
        prioridad: 'alta'
      };

      const mockResponse = { success: true, data: { id: '1', ...dto } };
      mockApiService.post.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.createSolicitud(dto));

      expect(mockApiService.post).toHaveBeenCalledWith('solicitudes', dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateEstado', () => {
    it('should update solicitud estado', async () => {
      const dto = { estado: 'aprobado', motivo: 'Aprobado por admin' };
      const mockResponse = { success: true };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.updateEstado('1', dto));

      expect(mockApiService.patch).toHaveBeenCalledWith('solicitudes/1/estado', dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteSolicitud', () => {
    it('should delete solicitud', async () => {
      const mockResponse = { success: true };
      mockApiService.delete.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.deleteSolicitud('1'));

      expect(mockApiService.delete).toHaveBeenCalledWith('solicitudes/1');
      expect(result).toEqual(mockResponse);
    });
  });
});
