import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PartidosService } from './partidos.service';
import { ApiService } from './api.service';
import { SignalRService } from './signalr.service';
import { IndexedDBService } from './indexed-db.service';
import { ConnectivityService } from './connectivity.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('PartidosService', () => {
  let service: PartidosService;
  let mockApiService: any;
  let mockSignalRService: any;
  let mockIndexedDBService: any;
  let mockConnectivityService: any;

  beforeEach(() => {
    mockApiService = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn()
    };

    mockSignalRService = {
      startConnection: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      off: vi.fn(),
      invoke: vi.fn().mockResolvedValue(undefined)
    };

    mockIndexedDBService = {
      cachePartido: vi.fn().mockResolvedValue(undefined),
      getCachedPartido: vi.fn().mockResolvedValue(null),
      queueEvent: vi.fn().mockResolvedValue('event-id'),
      getQueuedEvents: vi.fn().mockResolvedValue([])
    };

    mockConnectivityService = {
      isOffline: vi.fn().mockReturnValue(false),
      isOnline: vi.fn().mockReturnValue(true)
    };

    service = new PartidosService(mockApiService, mockSignalRService, mockIndexedDBService, mockConnectivityService);
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('inicializarSignalR', () => {
    it('should start SignalR connection and register event handlers', async () => {
      await service.inicializarSignalR();

      expect(mockSignalRService.startConnection).toHaveBeenCalledWith('partido');
      expect(mockSignalRService.on).toHaveBeenCalledWith('NuevoEvento', expect.any(Function));
      expect(mockSignalRService.on).toHaveBeenCalledWith('MarcadorActualizado', expect.any(Function));
      expect(mockSignalRService.on).toHaveBeenCalledWith('MinutoActualizado', expect.any(Function));
      expect(mockSignalRService.on).toHaveBeenCalledWith('PartidoIniciado', expect.any(Function));
      expect(mockSignalRService.on).toHaveBeenCalledWith('PartidoFinalizado', expect.any(Function));
    });
  });

  describe('getPartidosEnVivo', () => {
    it('should fetch partidos en vivo and update signal', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            jornada: 5,
            fechaHora: new Date(),
            estado: 'en_curso',
            golesLocal: 2,
            golesVisita: 1,
            equipoLocalNombre: 'Equipo A',
            equipoVisitaNombre: 'Equipo B',
            minutoActual: 45
          }
        ]
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getPartidosEnVivo());

      expect(mockApiService.get).toHaveBeenCalledWith('partidos/en-vivo');
      expect(service.partidosEnVivo()).toEqual(mockResponse.data);
    });

    it('should not update signal when success is false', async () => {
      const mockResponse = { success: false, data: [] };
      mockApiService.get.mockReturnValue(of(mockResponse));

      const initialPartidos = service.partidosEnVivo();
      await firstValueFrom(service.getPartidosEnVivo());

      expect(service.partidosEnVivo()).toEqual(initialPartidos);
    });
  });

  describe('getPartidoDetalle', () => {
    it('should fetch partido detail and update partidoActual signal', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          jornada: 5,
          fechaHora: new Date(),
          estado: 'en_curso',
          golesLocal: 2,
          golesVisita: 1,
          equipoLocalNombre: 'Equipo A',
          equipoVisitaNombre: 'Equipo B'
        }
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getPartidoDetalle('1'));

      expect(mockApiService.get).toHaveBeenCalledWith('partidos/1');
      expect(service.partidoActual()).toEqual(mockResponse.data);
    });
  });

  describe('getProximosPartidos', () => {
    it('should fetch proximos partidos with default dias', async () => {
      const mockResponse = { success: true, data: [] };
      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getProximosPartidos());

      expect(mockApiService.get).toHaveBeenCalledWith('partidos/proximos?dias=14');
    });

    it('should include torneoId in query params when provided', async () => {
      const mockResponse = { success: true, data: [] };
      mockApiService.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getProximosPartidos(7, 'torneo-123'));

      expect(mockApiService.get).toHaveBeenCalledWith('partidos/proximos?dias=7&torneoId=torneo-123');
    });
  });

  describe('suscribirPartido', () => {
    it('should invoke SuscribirPartido on SignalR', async () => {
      await service.suscribirPartido('partido-123');

      expect(mockSignalRService.invoke).toHaveBeenCalledWith('SuscribirPartido', 'partido-123');
    });
  });

  describe('desuscribirPartido', () => {
    it('should invoke DesuscribirPartido on SignalR', async () => {
      await service.desuscribirPartido('partido-123');

      expect(mockSignalRService.invoke).toHaveBeenCalledWith('DesuscribirPartido', 'partido-123');
    });
  });

  describe('SignalR event handlers', () => {
    it('should update marcador when MarcadorActualizado event is received', async () => {
      await service.inicializarSignalR();

      // Set initial partido
      service.partidosEnVivo.set([
        {
          id: 'partido-123',
          jornada: 5,
          fechaHora: new Date(),
          estado: 'en_curso',
          golesLocal: 1,
          golesVisita: 0,
          equipoLocalNombre: 'A',
          equipoVisitaNombre: 'B'
        }
      ]);

      // Get the MarcadorActualizado callback
      const marcadorCallback = mockSignalRService.on.mock.calls.find(
        (call: any) => call[0] === 'MarcadorActualizado'
      )[1];

      // Trigger the event
      marcadorCallback({ partidoId: 'partido-123', golesLocal: 2, golesVisita: 1 });

      const partidos = service.partidosEnVivo();
      expect(partidos[0].golesLocal).toBe(2);
      expect(partidos[0].golesVisita).toBe(1);
    });

    it('should update minuto when MinutoActualizado event is received', async () => {
      await service.inicializarSignalR();

      service.partidosEnVivo.set([
        {
          id: 'partido-123',
          jornada: 5,
          fechaHora: new Date(),
          estado: 'en_curso',
          golesLocal: 0,
          golesVisita: 0,
          equipoLocalNombre: 'A',
          equipoVisitaNombre: 'B',
          minutoActual: 10
        }
      ]);

      const minutoCallback = mockSignalRService.on.mock.calls.find(
        (call: any) => call[0] === 'MinutoActualizado'
      )[1];

      minutoCallback({ partidoId: 'partido-123', minuto: 45 });

      const partidos = service.partidosEnVivo();
      expect(partidos[0].minutoActual).toBe(45);
    });
  });
});
