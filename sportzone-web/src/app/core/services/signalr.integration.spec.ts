import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SignalRService } from './signalr.service';
import { PartidosService } from './partidos.service';
import { ApiService } from './api.service';
import * as signalR from '@microsoft/signalr';

/**
 * Integration tests for SignalR functionality
 * These tests verify the real-time communication between services
 */

// Mock SignalR
vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: vi.fn()
}));

describe('SignalR Integration Tests', () => {
  let signalRService: SignalRService;
  let partidosService: PartidosService;
  let mockApiService: any;
  let mockHubConnection: any;
  let mockBuilder: any;
  let eventHandlers: Map<string, Function>;

  beforeEach(() => {
    // Track event handlers
    eventHandlers = new Map();

    // Create mock hub connection
    mockHubConnection = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      on: vi.fn((eventName: string, callback: Function) => {
        eventHandlers.set(eventName, callback);
      }),
      off: vi.fn((eventName: string) => {
        eventHandlers.delete(eventName);
      }),
      invoke: vi.fn().mockResolvedValue(undefined),
      onreconnecting: vi.fn(),
      onreconnected: vi.fn(),
      onclose: vi.fn()
    };

    // Create mock builder
    mockBuilder = {
      withUrl: vi.fn().mockReturnThis(),
      withAutomaticReconnect: vi.fn().mockReturnThis(),
      build: vi.fn().mockReturnValue(mockHubConnection)
    };

    (signalR.HubConnectionBuilder as any).mockImplementation(() => mockBuilder);

    // Create mock API service
    mockApiService = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn()
    };

    // Create mock IndexedDB and Connectivity services
    const mockIndexedDBService = {
      cachePartido: vi.fn().mockResolvedValue(undefined),
      getCachedPartido: vi.fn().mockResolvedValue(null)
    };

    const mockConnectivityService = {
      isOffline: vi.fn().mockReturnValue(false),
      isOnline: vi.fn().mockReturnValue(true)
    };

    // Create service instances
    signalRService = new SignalRService();
    partidosService = new PartidosService(mockApiService, signalRService, mockIndexedDBService as any, mockConnectivityService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    eventHandlers.clear();
  });

  describe('Connection Management', () => {
    it('should establish SignalR connection', async () => {
      await signalRService.startConnection('partidoHub');

      expect(mockBuilder.withUrl).toHaveBeenCalled();
      expect(mockBuilder.withAutomaticReconnect).toHaveBeenCalled();
      expect(mockHubConnection.start).toHaveBeenCalled();
      expect(signalRService.isConnected()).toBe(true);
    });

    it('should handle connection failure gracefully', async () => {
      mockHubConnection.start.mockRejectedValue(new Error('Connection failed'));

      await signalRService.startConnection('partidoHub');

      expect(signalRService.isConnected()).toBe(false);
    });

    it('should close connection properly', async () => {
      await signalRService.startConnection('partidoHub');
      await signalRService.stopConnection();

      expect(mockHubConnection.stop).toHaveBeenCalled();
      expect(signalRService.isConnected()).toBe(false);
    });
  });

  describe('Event Subscription', () => {
    it('should register event handlers on initialization', async () => {
      await partidosService.inicializarSignalR();

      expect(eventHandlers.has('NuevoEvento')).toBe(true);
      expect(eventHandlers.has('MarcadorActualizado')).toBe(true);
      expect(eventHandlers.has('MinutoActualizado')).toBe(true);
      expect(eventHandlers.has('PartidoIniciado')).toBe(true);
      expect(eventHandlers.has('PartidoFinalizado')).toBe(true);
    });

    it('should handle NuevoEvento correctly', async () => {
      await partidosService.inicializarSignalR();

      const getPartidoDetalleSpy = vi.spyOn(partidosService as any, 'actualizarPartidoLocal');

      const eventData = {
        partidoId: 'partido-123',
        tipo: 'gol',
        jugadorNombre: 'Juan Pérez'
      };

      const handler = eventHandlers.get('NuevoEvento');
      handler!(eventData);

      expect(getPartidoDetalleSpy).toHaveBeenCalledWith('partido-123');
    });

    it('should update marcador when MarcadorActualizado event is received', async () => {
      await partidosService.inicializarSignalR();

      // Set initial partido
      partidosService.partidosEnVivo.set([
        {
          id: 'partido-123',
          jornada: 5,
          fechaHora: new Date(),
          estado: 'en_curso',
          golesLocal: 1,
          golesVisita: 0,
          equipoLocalNombre: 'Barcelona SC',
          equipoVisitaNombre: 'Emelec'
        }
      ]);

      const eventData = {
        partidoId: 'partido-123',
        golesLocal: 2,
        golesVisita: 1
      };

      const handler = eventHandlers.get('MarcadorActualizado');
      handler!(eventData);

      const partidos = partidosService.partidosEnVivo();
      expect(partidos[0].golesLocal).toBe(2);
      expect(partidos[0].golesVisita).toBe(1);
    });

    it('should update minuto when MinutoActualizado event is received', async () => {
      await partidosService.inicializarSignalR();

      partidosService.partidosEnVivo.set([
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

      const eventData = {
        partidoId: 'partido-123',
        minuto: 45
      };

      const handler = eventHandlers.get('MinutoActualizado');
      handler!(eventData);

      const partidos = partidosService.partidosEnVivo();
      expect(partidos[0].minutoActual).toBe(45);
    });
  });

  describe('Reconnection Handling', () => {
    it('should update connection status on reconnecting', async () => {
      await signalRService.startConnection('partidoHub');

      const onReconnectingCallback = mockHubConnection.onreconnecting.mock.calls[0][0];
      onReconnectingCallback();

      expect(signalRService.isConnected()).toBe(false);
    });

    it('should update connection status on reconnected', async () => {
      await signalRService.startConnection('partidoHub');

      signalRService.isConnected.set(false);
      const onReconnectedCallback = mockHubConnection.onreconnected.mock.calls[0][0];
      onReconnectedCallback();

      expect(signalRService.isConnected()).toBe(true);
    });

    it('should update connection status on close', async () => {
      await signalRService.startConnection('partidoHub');

      const onCloseCallback = mockHubConnection.onclose.mock.calls[0][0];
      onCloseCallback();

      expect(signalRService.isConnected()).toBe(false);
    });
  });

  describe('Server Method Invocation', () => {
    it('should invoke SuscribirPartido method', async () => {
      await signalRService.startConnection('partidoHub');

      await partidosService.suscribirPartido('partido-123');

      expect(mockHubConnection.invoke).toHaveBeenCalledWith('SuscribirPartido', 'partido-123');
    });

    it('should invoke DesuscribirPartido method', async () => {
      await signalRService.startConnection('partidoHub');

      await partidosService.desuscribirPartido('partido-123');

      expect(mockHubConnection.invoke).toHaveBeenCalledWith('DesuscribirPartido', 'partido-123');
    });

    it('should handle invoke errors gracefully', async () => {
      await signalRService.startConnection('partidoHub');

      mockHubConnection.invoke.mockRejectedValue(new Error('Invoke failed'));

      await expect(signalRService.invoke('SomeMethod', 'arg1')).rejects.toThrow('Invoke failed');
    });
  });

  describe('Multiple Partido Updates', () => {
    it('should handle updates for multiple partidos', async () => {
      await partidosService.inicializarSignalR();

      partidosService.partidosEnVivo.set([
        {
          id: 'partido-1',
          jornada: 5,
          fechaHora: new Date(),
          estado: 'en_curso',
          golesLocal: 0,
          golesVisita: 0,
          equipoLocalNombre: 'A',
          equipoVisitaNombre: 'B'
        },
        {
          id: 'partido-2',
          jornada: 5,
          fechaHora: new Date(),
          estado: 'en_curso',
          golesLocal: 1,
          golesVisita: 1,
          equipoLocalNombre: 'C',
          equipoVisitaNombre: 'D'
        }
      ]);

      const handler = eventHandlers.get('MarcadorActualizado');

      // Update first partido
      handler!({ partidoId: 'partido-1', golesLocal: 1, golesVisita: 0 });

      let partidos = partidosService.partidosEnVivo();
      expect(partidos[0].golesLocal).toBe(1);
      expect(partidos[1].golesLocal).toBe(1); // Should remain unchanged

      // Update second partido
      handler!({ partidoId: 'partido-2', golesLocal: 2, golesVisita: 1 });

      partidos = partidosService.partidosEnVivo();
      expect(partidos[0].golesLocal).toBe(1); // Should remain unchanged
      expect(partidos[1].golesLocal).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle event for non-existent partido', async () => {
      await partidosService.inicializarSignalR();

      partidosService.partidosEnVivo.set([
        {
          id: 'partido-1',
          jornada: 5,
          fechaHora: new Date(),
          estado: 'en_curso',
          golesLocal: 0,
          golesVisita: 0,
          equipoLocalNombre: 'A',
          equipoVisitaNombre: 'B'
        }
      ]);

      const handler = eventHandlers.get('MarcadorActualizado');
      handler!({ partidoId: 'partido-999', golesLocal: 5, golesVisita: 3 });

      // Should not throw error and original partido should remain unchanged
      const partidos = partidosService.partidosEnVivo();
      expect(partidos[0].golesLocal).toBe(0);
    });

    it('should handle empty partidos array', async () => {
      await partidosService.inicializarSignalR();

      partidosService.partidosEnVivo.set([]);

      const handler = eventHandlers.get('MarcadorActualizado');
      handler!({ partidoId: 'partido-123', golesLocal: 2, golesVisita: 1 });

      // Should not throw error
      expect(partidosService.partidosEnVivo().length).toBe(0);
    });
  });
});
