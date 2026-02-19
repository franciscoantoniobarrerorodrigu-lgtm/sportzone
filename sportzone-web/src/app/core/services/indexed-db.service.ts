import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CachedPartido {
  id: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

export interface QueuedEvent {
  id: string;
  partidoId: string;
  evento: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private dbName = 'SportZonePlanillero';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    if (this.isBrowser) {
      this.initDB();
    }
  }

  private async initDB(): Promise<void> {
    if (!this.isBrowser) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Store for cached match data
        if (!db.objectStoreNames.contains('partidos')) {
          const partidosStore = db.createObjectStore('partidos', { keyPath: 'id' });
          partidosStore.createIndex('timestamp', 'timestamp', { unique: false });
          partidosStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // Store for queued events
        if (!db.objectStoreNames.contains('eventQueue')) {
          const queueStore = db.createObjectStore('eventQueue', { keyPath: 'id' });
          queueStore.createIndex('partidoId', 'partidoId', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  // ==================== PARTIDO CACHE ====================

  async cachePartido(partidoId: string, data: any, ttlMinutes: number = 60): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['partidos'], 'readwrite');
    const store = transaction.objectStore('partidos');

    const cachedData: CachedPartido = {
      id: partidoId,
      data: data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cachedData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedPartido(partidoId: string): Promise<any | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['partidos'], 'readonly');
    const store = transaction.objectStore('partidos');

    return new Promise((resolve, reject) => {
      const request = store.get(partidoId);
      
      request.onsuccess = () => {
        const cached = request.result as CachedPartido | undefined;
        
        if (!cached) {
          resolve(null);
          return;
        }

        // Check if expired
        if (Date.now() > cached.expiresAt) {
          this.deleteCachedPartido(partidoId);
          resolve(null);
          return;
        }

        resolve(cached.data);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCachedPartido(partidoId: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['partidos'], 'readwrite');
    const store = transaction.objectStore('partidos');

    return new Promise((resolve, reject) => {
      const request = store.delete(partidoId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredPartidos(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['partidos'], 'readwrite');
    const store = transaction.objectStore('partidos');
    const index = store.index('expiresAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor();
      
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const cached = cursor.value as CachedPartido;
          if (Date.now() > cached.expiresAt) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== EVENT QUEUE ====================

  async queueEvent(partidoId: string, evento: any): Promise<string> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['eventQueue'], 'readwrite');
    const store = transaction.objectStore('eventQueue');

    const queuedEvent: QueuedEvent = {
      id: `${partidoId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      partidoId: partidoId,
      evento: evento,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    return new Promise((resolve, reject) => {
      const request = store.add(queuedEvent);
      request.onsuccess = () => resolve(queuedEvent.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getQueuedEvents(partidoId?: string): Promise<QueuedEvent[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['eventQueue'], 'readonly');
    const store = transaction.objectStore('eventQueue');

    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      
      if (partidoId) {
        const index = store.index('partidoId');
        request = index.getAll(partidoId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const events = request.result as QueuedEvent[];
        // Sort by timestamp
        events.sort((a, b) => a.timestamp - b.timestamp);
        resolve(events);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingEventsCount(partidoId?: string): Promise<number> {
    const events = await this.getQueuedEvents(partidoId);
    return events.filter(e => e.status === 'pending').length;
  }

  async updateEventStatus(eventId: string, status: 'pending' | 'syncing' | 'failed', retryCount?: number): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['eventQueue'], 'readwrite');
    const store = transaction.objectStore('eventQueue');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(eventId);
      
      getRequest.onsuccess = () => {
        const event = getRequest.result as QueuedEvent;
        if (event) {
          event.status = status;
          if (retryCount !== undefined) {
            event.retryCount = retryCount;
          }
          
          const putRequest = store.put(event);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteQueuedEvent(eventId: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['eventQueue'], 'readwrite');
    const store = transaction.objectStore('eventQueue');

    return new Promise((resolve, reject) => {
      const request = store.delete(eventId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearQueuedEvents(partidoId?: string): Promise<void> {
    const events = await this.getQueuedEvents(partidoId);
    const db = await this.ensureDB();
    const transaction = db.transaction(['eventQueue'], 'readwrite');
    const store = transaction.objectStore('eventQueue');

    return new Promise((resolve, reject) => {
      let completed = 0;
      const total = events.length;

      if (total === 0) {
        resolve();
        return;
      }

      events.forEach(event => {
        const request = store.delete(event.id);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  // ==================== UTILITY ====================

  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['partidos', 'eventQueue'], 'readwrite');
    
    const partidosStore = transaction.objectStore('partidos');
    const queueStore = transaction.objectStore('eventQueue');

    return new Promise((resolve, reject) => {
      let completed = 0;
      
      const checkComplete = () => {
        completed++;
        if (completed === 2) resolve();
      };

      const clearPartidos = partidosStore.clear();
      clearPartidos.onsuccess = checkComplete;
      clearPartidos.onerror = () => reject(clearPartidos.error);

      const clearQueue = queueStore.clear();
      clearQueue.onsuccess = checkComplete;
      clearQueue.onerror = () => reject(clearQueue.error);
    });
  }
}
