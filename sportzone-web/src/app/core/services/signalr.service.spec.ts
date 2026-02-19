import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SignalRService } from './signalr.service';
import * as signalR from '@microsoft/signalr';

// Mock SignalR
vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: vi.fn()
}));

describe('SignalRService', () => {
  let service: SignalRService;
  let mockHubConnection: any;
  let mockBuilder: any;

  beforeEach(() => {
    // Create mock hub connection
    mockHubConnection = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      off: vi.fn(),
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

    service = new SignalRService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('startConnection', () => {
    it('should build and start hub connection', async () => {
      await service.startConnection('partidoHub');

      expect(mockBuilder.withUrl).toHaveBeenCalled();
      expect(mockBuilder.withAutomaticReconnect).toHaveBeenCalled();
      expect(mockBuilder.build).toHaveBeenCalled();
      expect(mockHubConnection.start).toHaveBeenCalled();
      expect(service.isConnected()).toBe(true);
    });

    it('should set isConnected to false on connection error', async () => {
      mockHubConnection.start.mockRejectedValue(new Error('Connection failed'));

      await service.startConnection('partidoHub');

      expect(service.isConnected()).toBe(false);
    });

    it('should register reconnection handlers', async () => {
      await service.startConnection('partidoHub');

      expect(mockHubConnection.onreconnecting).toHaveBeenCalled();
      expect(mockHubConnection.onreconnected).toHaveBeenCalled();
      expect(mockHubConnection.onclose).toHaveBeenCalled();
    });

    it('should set isConnected to false on reconnecting', async () => {
      await service.startConnection('partidoHub');

      const onReconnectingCallback = mockHubConnection.onreconnecting.mock.calls[0][0];
      onReconnectingCallback();

      expect(service.isConnected()).toBe(false);
    });

    it('should set isConnected to true on reconnected', async () => {
      await service.startConnection('partidoHub');

      service.isConnected.set(false);
      const onReconnectedCallback = mockHubConnection.onreconnected.mock.calls[0][0];
      onReconnectedCallback();

      expect(service.isConnected()).toBe(true);
    });

    it('should set isConnected to false on close', async () => {
      await service.startConnection('partidoHub');

      const onCloseCallback = mockHubConnection.onclose.mock.calls[0][0];
      onCloseCallback();

      expect(service.isConnected()).toBe(false);
    });
  });

  describe('stopConnection', () => {
    it('should stop hub connection and set isConnected to false', async () => {
      await service.startConnection('partidoHub');
      await service.stopConnection();

      expect(mockHubConnection.stop).toHaveBeenCalled();
      expect(service.isConnected()).toBe(false);
    });

    it('should do nothing if no connection exists', async () => {
      await service.stopConnection();

      expect(mockHubConnection.stop).not.toHaveBeenCalled();
    });
  });

  describe('on', () => {
    it('should register event handler', async () => {
      await service.startConnection('partidoHub');

      const callback = vi.fn();
      service.on('EventoPartido', callback);

      expect(mockHubConnection.on).toHaveBeenCalledWith('EventoPartido', callback);
    });

    it('should do nothing if no connection exists', () => {
      const callback = vi.fn();
      service.on('EventoPartido', callback);

      expect(mockHubConnection.on).not.toHaveBeenCalled();
    });
  });

  describe('off', () => {
    it('should unregister event handler', async () => {
      await service.startConnection('partidoHub');

      service.off('EventoPartido');

      expect(mockHubConnection.off).toHaveBeenCalledWith('EventoPartido');
    });

    it('should do nothing if no connection exists', () => {
      service.off('EventoPartido');

      expect(mockHubConnection.off).not.toHaveBeenCalled();
    });
  });

  describe('invoke', () => {
    it('should invoke server method with arguments', async () => {
      await service.startConnection('partidoHub');

      mockHubConnection.invoke.mockResolvedValue({ success: true });

      const result = await service.invoke('SuscribirPartido', 'partido-123');

      expect(mockHubConnection.invoke).toHaveBeenCalledWith('SuscribirPartido', 'partido-123');
      expect(result).toEqual({ success: true });
    });

    it('should return undefined if no connection exists', async () => {
      const result = await service.invoke('SuscribirPartido', 'partido-123');

      expect(result).toBeUndefined();
      expect(mockHubConnection.invoke).not.toHaveBeenCalled();
    });
  });
});
