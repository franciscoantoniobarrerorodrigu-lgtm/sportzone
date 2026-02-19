import { Injectable, signal } from '@angular/core';
import { IndexedDBService, QueuedEvent } from './indexed-db.service';
import { ConnectivityService } from './connectivity.service';
import { PartidosService } from './partidos.service';

export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  syncErrors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {
  // Signals
  readonly isSyncing = signal<boolean>(false);
  readonly pendingEventsCount = signal<number>(0);
  readonly lastSyncTime = signal<number | null>(null);
  readonly syncErrors = signal<string[]>([]);

  private syncInProgress = false;
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  constructor(
    private indexedDB: IndexedDBService,
    private connectivity: ConnectivityService,
    private partidosService: PartidosService
  ) {
    this.initAutoSync();
  }

  private initAutoSync(): void {
    // Auto-sync when connection is restored
    this.connectivity.onConnectionRestored(() => {
      console.log('🔄 Connection restored, starting auto-sync...');
      this.syncQueuedEvents();
    });

    // Update pending count periodically
    setInterval(() => {
      this.updatePendingCount();
    }, 5000);
  }

  /**
   * Queue an event for later synchronization
   */
  async queueEvent(partidoId: string, evento: any): Promise<string> {
    try {
      const eventId = await this.indexedDB.queueEvent(partidoId, evento);
      await this.updatePendingCount();
      console.log('📝 Event queued:', eventId);
      return eventId;
    } catch (error) {
      console.error('Error queuing event:', error);
      throw error;
    }
  }

  /**
   * Sync all queued events to the backend
   */
  async syncQueuedEvents(partidoId?: string): Promise<void> {
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    if (this.connectivity.isOffline()) {
      console.log('📡 Offline, cannot sync');
      return;
    }

    this.syncInProgress = true;
    this.isSyncing.set(true);
    this.syncErrors.set([]);

    try {
      const events = await this.indexedDB.getQueuedEvents(partidoId);
      const pendingEvents = events.filter(e => e.status === 'pending');

      if (pendingEvents.length === 0) {
        console.log('✅ No events to sync');
        return;
      }

      console.log(`🔄 Syncing ${pendingEvents.length} events...`);

      for (const event of pendingEvents) {
        await this.syncSingleEvent(event);
      }

      this.lastSyncTime.set(Date.now());
      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.syncErrors.update(errors => [...errors, 'Sync failed: ' + (error as Error).message]);
    } finally {
      this.syncInProgress = false;
      this.isSyncing.set(false);
      await this.updatePendingCount();
    }
  }

  /**
   * Sync a single event with retry logic
   */
  private async syncSingleEvent(event: QueuedEvent): Promise<void> {
    try {
      // Mark as syncing
      await this.indexedDB.updateEventStatus(event.id, 'syncing');

      // Attempt to send to backend
      await this.partidosService.registrarEvento(event.partidoId, event.evento);

      // Success - remove from queue
      await this.indexedDB.deleteQueuedEvent(event.id);
      console.log('✅ Event synced:', event.id);
    } catch (error) {
      console.error('❌ Failed to sync event:', event.id, error);

      // Increment retry count
      const newRetryCount = event.retryCount + 1;

      if (newRetryCount >= this.maxRetries) {
        // Max retries reached - mark as failed
        await this.indexedDB.updateEventStatus(event.id, 'failed', newRetryCount);
        this.syncErrors.update(errors => [
          ...errors,
          `Event ${event.id} failed after ${this.maxRetries} retries`
        ]);
      } else {
        // Retry with exponential backoff
        await this.indexedDB.updateEventStatus(event.id, 'pending', newRetryCount);
        const delay = this.retryDelay * Math.pow(2, newRetryCount);
        console.log(`⏳ Retrying event ${event.id} in ${delay}ms (attempt ${newRetryCount + 1}/${this.maxRetries})`);
        await this.sleep(delay);
      }

      throw error;
    }
  }

  /**
   * Manually trigger sync
   */
  async manualSync(partidoId?: string): Promise<void> {
    console.log('🔄 Manual sync triggered');
    await this.syncQueuedEvents(partidoId);
  }

  /**
   * Get pending events for a match
   */
  async getPendingEvents(partidoId?: string): Promise<QueuedEvent[]> {
    const events = await this.indexedDB.getQueuedEvents(partidoId);
    return events.filter(e => e.status === 'pending');
  }

  /**
   * Get failed events
   */
  async getFailedEvents(partidoId?: string): Promise<QueuedEvent[]> {
    const events = await this.indexedDB.getQueuedEvents(partidoId);
    return events.filter(e => e.status === 'failed');
  }

  /**
   * Retry failed events
   */
  async retryFailedEvents(partidoId?: string): Promise<void> {
    const failedEvents = await this.getFailedEvents(partidoId);
    
    for (const event of failedEvents) {
      await this.indexedDB.updateEventStatus(event.id, 'pending', 0);
    }

    await this.syncQueuedEvents(partidoId);
  }

  /**
   * Clear all queued events for a match
   */
  async clearQueue(partidoId?: string): Promise<void> {
    await this.indexedDB.clearQueuedEvents(partidoId);
    await this.updatePendingCount();
  }

  /**
   * Update pending events count
   */
  private async updatePendingCount(): Promise<void> {
    try {
      const count = await this.indexedDB.getPendingEventsCount();
      this.pendingEventsCount.set(count);
    } catch (error) {
      console.error('Error updating pending count:', error);
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return {
      isSyncing: this.isSyncing(),
      pendingCount: this.pendingEventsCount(),
      lastSyncTime: this.lastSyncTime(),
      syncErrors: this.syncErrors()
    };
  }

  /**
   * Check if there are conflicts (e.g., match already finalized)
   */
  async checkSyncConflicts(partidoId: string): Promise<boolean> {
    try {
      // Fetch current match state from backend
      const response = await this.partidosService.getPartidoDetalle(partidoId).toPromise();
      
      if (response?.success && response.data) {
        const match = response.data;
        
        // Check if match is finalized
        if (match.estado === 'finalizado') {
          console.warn('⚠️ Match already finalized, cannot sync events');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking sync conflicts:', error);
      return false;
    }
  }

  /**
   * Utility: Sleep for a given duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
