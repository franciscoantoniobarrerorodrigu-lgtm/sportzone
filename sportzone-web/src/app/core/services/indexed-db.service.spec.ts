import { TestBed } from '@angular/core/testing';
import { IndexedDBService } from './indexed-db.service';

describe('IndexedDBService', () => {
  let service: IndexedDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexedDBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Partido Cache', () => {
    it('should cache and retrieve partido data', async () => {
      const partidoId = 'test-partido-1';
      const partidoData = {
        id: partidoId,
        equipoLocal: { nombre: 'Team A' },
        equipoVisita: { nombre: 'Team B' },
        golesLocal: 2,
        golesVisita: 1
      };

      await service.cachePartido(partidoId, partidoData, 60);
      const cached = await service.getCachedPartido(partidoId);

      expect(cached).toEqual(partidoData);
    });

    it('should return null for non-existent partido', async () => {
      const cached = await service.getCachedPartido('non-existent');
      expect(cached).toBeNull();
    });

    it('should return null for expired partido', async () => {
      const partidoId = 'test-partido-expired';
      const partidoData = { id: partidoId, test: true };

      // Cache with 0 minutes TTL (immediately expired)
      await service.cachePartido(partidoId, partidoData, 0);
      
      // Wait a bit to ensure expiration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cached = await service.getCachedPartido(partidoId);
      expect(cached).toBeNull();
    });

    it('should delete cached partido', async () => {
      const partidoId = 'test-partido-delete';
      const partidoData = { id: partidoId };

      await service.cachePartido(partidoId, partidoData);
      await service.deleteCachedPartido(partidoId);
      
      const cached = await service.getCachedPartido(partidoId);
      expect(cached).toBeNull();
    });
  });

  describe('Event Queue', () => {
    it('should queue an event', async () => {
      const partidoId = 'test-partido-1';
      const evento = {
        tipo: 'gol',
        minuto: 45,
        jugadorId: 'player-1',
        equipoId: 'team-1'
      };

      const eventId = await service.queueEvent(partidoId, evento);
      expect(eventId).toBeTruthy();

      const queued = await service.getQueuedEvents(partidoId);
      expect(queued.length).toBeGreaterThan(0);
      expect(queued[0].evento).toEqual(evento);
    });

    it('should get pending events count', async () => {
      const partidoId = 'test-partido-count';
      
      await service.queueEvent(partidoId, { tipo: 'gol' });
      await service.queueEvent(partidoId, { tipo: 'tarjeta_amarilla' });
      
      const count = await service.getPendingEventsCount(partidoId);
      expect(count).toBe(2);
    });

    it('should update event status', async () => {
      const partidoId = 'test-partido-status';
      const evento = { tipo: 'gol' };

      const eventId = await service.queueEvent(partidoId, evento);
      await service.updateEventStatus(eventId, 'syncing');

      const events = await service.getQueuedEvents(partidoId);
      const updatedEvent = events.find(e => e.id === eventId);
      
      expect(updatedEvent?.status).toBe('syncing');
    });

    it('should delete queued event', async () => {
      const partidoId = 'test-partido-delete-event';
      const evento = { tipo: 'gol' };

      const eventId = await service.queueEvent(partidoId, evento);
      await service.deleteQueuedEvent(eventId);

      const events = await service.getQueuedEvents(partidoId);
      const deletedEvent = events.find(e => e.id === eventId);
      
      expect(deletedEvent).toBeUndefined();
    });

    it('should clear all queued events for a partido', async () => {
      const partidoId = 'test-partido-clear';
      
      await service.queueEvent(partidoId, { tipo: 'gol' });
      await service.queueEvent(partidoId, { tipo: 'tarjeta_amarilla' });
      
      await service.clearQueuedEvents(partidoId);
      
      const events = await service.getQueuedEvents(partidoId);
      expect(events.length).toBe(0);
    });
  });

  describe('Utility', () => {
    it('should clear all data', async () => {
      const partidoId = 'test-partido-clear-all';
      
      await service.cachePartido(partidoId, { test: true });
      await service.queueEvent(partidoId, { tipo: 'gol' });
      
      await service.clearAllData();
      
      const cached = await service.getCachedPartido(partidoId);
      const events = await service.getQueuedEvents(partidoId);
      
      expect(cached).toBeNull();
      expect(events.length).toBe(0);
    });
  });
});
