import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  // Signals
  readonly isOnline = signal<boolean>(this.isBrowser ? navigator.onLine : true);
  readonly connectionType = signal<string>('unknown');
  
  // Computed
  readonly isOffline = computed(() => !this.isOnline());
  readonly connectionQuality = computed(() => {
    if (!this.isOnline()) return 'offline';
    const type = this.connectionType();
    if (type.includes('4g') || type.includes('wifi')) return 'good';
    if (type.includes('3g')) return 'fair';
    if (type.includes('2g') || type.includes('slow')) return 'poor';
    return 'unknown';
  });

  // Event callbacks
  private onlineCallbacks: Array<() => void> = [];
  private offlineCallbacks: Array<() => void> = [];

  constructor() {
    if (this.isBrowser) {
      this.initConnectivityMonitoring();
      this.detectConnectionType();
    }
  }

  private initConnectivityMonitoring(): void {
    if (!this.isBrowser) return;
    
    // Listen to online/offline events
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false)),
      of(navigator.onLine)
    ).subscribe(online => {
      const wasOnline = this.isOnline();
      this.isOnline.set(online);

      // Trigger callbacks on status change
      if (online && !wasOnline) {
        console.log('🟢 Connection restored');
        this.onlineCallbacks.forEach(cb => cb());
      } else if (!online && wasOnline) {
        console.log('🔴 Connection lost');
        this.offlineCallbacks.forEach(cb => cb());
      }
    });

    // Monitor connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', () => {
          this.detectConnectionType();
        });
      }
    }
  }

  private detectConnectionType(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType) {
        this.connectionType.set(connection.effectiveType);
      }
    }
  }

  /**
   * Register a callback to be called when connection is restored
   */
  onConnectionRestored(callback: () => void): void {
    this.onlineCallbacks.push(callback);
  }

  /**
   * Register a callback to be called when connection is lost
   */
  onConnectionLost(callback: () => void): void {
    this.offlineCallbacks.push(callback);
  }

  /**
   * Remove a callback
   */
  removeCallback(callback: () => void): void {
    this.onlineCallbacks = this.onlineCallbacks.filter(cb => cb !== callback);
    this.offlineCallbacks = this.offlineCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Check if we have a stable connection by attempting a ping
   */
  async checkConnection(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // Try to fetch a small resource with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/assets/ping.json', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Connection check failed:', error);
      return false;
    }
  }

  /**
   * Get connection status as a string for display
   */
  getStatusText(): string {
    if (this.isOffline()) {
      return 'Sin conexión';
    }

    const quality = this.connectionQuality();
    switch (quality) {
      case 'good':
        return 'Conexión estable';
      case 'fair':
        return 'Conexión moderada';
      case 'poor':
        return 'Conexión débil';
      default:
        return 'En línea';
    }
  }

  /**
   * Get connection icon for display
   */
  getStatusIcon(): string {
    if (this.isOffline()) {
      return '📡❌';
    }

    const quality = this.connectionQuality();
    switch (quality) {
      case 'good':
        return '📡✅';
      case 'fair':
        return '📡⚠️';
      case 'poor':
        return '📡🔴';
      default:
        return '📡';
    }
  }
}
